#!/usr/bin/env python3
"""
ai-bot.cn 爬虫 - 独立可执行版本

从 https://ai-bot.cn/ 提取 AI 工具导航数据，输出 JSONL 格式。
使用 requests + BeautifulSoup 静态解析，无需 Selenium/Playwright。

目标字段：name, description, icon_url, category, url

使用方法:
    pip install requests beautifulsoup4 lxml
    python crawl_ai_bot_cn.py -o ai_bot_tools.jsonl
    python crawl_ai_bot_cn.py --categories ai-writing-tools ai-image-tools -o out.jsonl
"""

import argparse
import warnings
warnings.filterwarnings("ignore", message="urllib3 v2 only supports OpenSSL")

import json
import random
import re
import ssl
import sys
import time
from typing import List, Optional, Tuple
from urllib.parse import urljoin, urlparse

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    import urllib.request
from bs4 import BeautifulSoup

# --------------------------------------------------------------------------- #
# 配置
# --------------------------------------------------------------------------- #

BASE_URL = "https://ai-bot.cn"
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]
REQUEST_TIMEOUT = 15
DELAY_MIN = 1.0
DELAY_MAX = 2.5
RETRY_COUNT = 3

# URL slug -> 中文分类名（用于无法从页面提取时）
SLUG_TO_CATEGORY = {
    "ai-writing-tools": "AI写作工具",
    "ai-image-tools": "AI图像工具",
    "best-ai-image-tools": "AI图像工具",
    "ai-video-tools": "AI视频工具",
    "ai-office-tools": "AI办公工具",
    "ai-presentation-tools": "AI办公工具",
    "ai-agent": "AI智能体",
    "ai-chatbots": "AI聊天助手",
    "ai-programming-tools": "AI编程工具",
    "ai-frameworks": "AI开发平台",
    "ai-design-tools": "AI设计工具",
    "ai-audio-tools": "AI音频工具",
    "ai-search-engines": "AI搜索引擎",
    "websites-to-learn-ai": "AI学习网站",
    "ai-models": "AI训练模型",
    "ai-content-detection-and-optimization-tools": "AI内容检测",
    "ai-prompt-tools": "AI提示指令",
}


# --------------------------------------------------------------------------- #
# 工具函数
# --------------------------------------------------------------------------- #

def clean_text(s: Optional[str], max_len: int = 300) -> str:
    if not s:
        return ""
    s = re.sub(r"\s+", " ", str(s)).strip()
    return s[:max_len]


def is_valid_url(url: Optional[str]) -> bool:
    if not url:
        return False
    try:
        p = urlparse(url)
        return bool(p.scheme in ("http", "https") and p.netloc)
    except Exception:
        return False


def extract_category_from_title(title: str, slug: str) -> str:
    """从页面 title 提取分类名，如：80+ AI写作工具和助手大全（2025...）| AI工具集 -> AI写作工具"""
    if not title:
        return SLUG_TO_CATEGORY.get(slug, "其他")
    # 去掉 | 及后面的内容
    title = title.split("|")[0].strip()
    # 去掉括号及数字前缀，如 "80+ AI写作工具和助手大全（2025..."
    m = re.search(r"(?:^\d+\+\s*)?(.+?)(?:\s*[（(].*)?$", title)
    if m:
        raw = m.group(1).strip()
        # 取核心分类词，如 "AI写作工具和助手大全" -> "AI写作工具"
        for kw in ["AI写作工具", "AI图像工具", "AI视频工具", "AI办公工具", "AI智能体",
                   "AI聊天助手", "AI编程工具", "AI开发平台", "AI设计工具", "AI音频工具",
                   "AI搜索引擎", "AI学习", "AI训练模型", "AI内容检测", "AI提示"]:
            if kw in raw:
                return kw if kw != "AI学习" else "AI学习网站"
        return raw[:20] if len(raw) > 20 else raw
    return SLUG_TO_CATEGORY.get(slug, "其他")


# --------------------------------------------------------------------------- #
# 爬虫核心
# --------------------------------------------------------------------------- #

class AIBotCnCrawler:
    def __init__(self, delay_min: float = DELAY_MIN, delay_max: float = DELAY_MAX):
        self.session = requests.Session()
        self.delay_min = delay_min
        self.delay_max = delay_max
        self._seen_urls: set[str] = set()

    def _headers(self) -> dict:
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }

    def _delay(self) -> None:
        time.sleep(random.uniform(self.delay_min, self.delay_max))

    def fetch(self, url: str):
        """返回具有 .text 和 .status_code 属性的响应对象"""
        for attempt in range(1, RETRY_COUNT + 1):
            try:
                if HAS_REQUESTS:
                    r = self.session.get(url, headers=self._headers(), timeout=REQUEST_TIMEOUT)
                    r.raise_for_status()
                    r.encoding = r.apparent_encoding or "utf-8"
                    return r
                else:
                    req = urllib.request.Request(url, headers=self._headers())
                    ctx = ssl.create_default_context()
                    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT, context=ctx) as f:
                        text = f.read().decode(f.headers.get_content_charset() or "utf-8")
                    return type("Resp", (), {"text": text, "status_code": 200})()
            except Exception as e:
                print(f"  [WARN] 请求失败 (尝试 {attempt}/{RETRY_COUNT}): {url} - {e}", file=sys.stderr)
                if attempt < RETRY_COUNT:
                    time.sleep(attempt * 2)
        return None

    def get_soup(self, url: str) -> Optional[BeautifulSoup]:
        resp = self.fetch(url)
        if not resp:
            return None
        try:
            return BeautifulSoup(resp.text, "lxml")
        except Exception:
            return BeautifulSoup(resp.text, "html.parser")

    def discover_category_urls(self) -> List[Tuple[str, str]]:
        """从首页发现分类链接，返回 [(slug, full_url), ...]"""
        soup = self.get_soup(BASE_URL)
        if not soup:
            return []

        seen = set()
        result = []
        for a in soup.select('a[href*="/favorites/"]'):
            href = a.get("href", "")
            if not href or "favorites" not in href:
                continue
            full = urljoin(BASE_URL, href)
            # 只保留 /favorites/xxx/ 形式，去掉 /page/n/
            if "/page/" in full:
                full = full.split("/page/")[0].rstrip("/") + "/"
            parsed = urlparse(full)
            path = parsed.path.rstrip("/")
            slug = path.split("/")[-1] if path else ""
            if not slug or slug in seen:
                continue
            seen.add(slug)
            result.append((slug, full))
        return result

    def parse_category_name(self, soup: BeautifulSoup, slug: str) -> str:
        title_tag = soup.find("title")
        title = title_tag.get_text().strip() if title_tag else ""
        return extract_category_from_title(title, slug)

    def parse_tool_cards(self, soup: BeautifulSoup, category: str) -> List[dict]:
        """从当前页面解析所有工具卡片"""
        records = []
        for card in soup.select(".url-card"):
            try:
                rec = self._parse_one_card(card, category)
                if rec and rec.get("url") and rec["url"] not in self._seen_urls:
                    self._seen_urls.add(rec["url"])
                    records.append(rec)
            except Exception as e:
                print(f"  [DEBUG] 解析卡片失败: {e}", file=sys.stderr)
        return records

    def _parse_one_card(self, card, category: str) -> Optional[dict]:
        a = card.select_one("a.card[data-url], a.card[href]")
        if not a:
            return None

        # 优先使用 data-url（真实跳转地址），否则用 href
        tool_url = a.get("data-url") or a.get("href", "")
        if tool_url:
            tool_url = tool_url.replace("&amp;", "&")
        tool_url = urljoin(BASE_URL, tool_url)
        if not is_valid_url(tool_url) or "ai-bot.cn" in urlparse(tool_url).netloc:
            # 若 data-url 无效，href 可能是站内详情页，可保留用于去重，但需尝试从详情页取真实 URL
            pass
        # 站内链接也保留，用户可二次跳转
        if not is_valid_url(tool_url):
            return None

        # 名称
        strong = card.select_one(".url-info strong, .url-info .text-sm")
        name = clean_text(strong.get_text() if strong else a.get("title", "").split("，")[0] if a.get("title") else "")
        if not name:
            name = clean_text(a.get("title", "").split("，")[0].split(" ")[0])

        # 描述：优先 p.text-muted，其次 a 的 title
        desc_tag = card.select_one(".url-info p.text-muted, .url-info p")
        description = clean_text(desc_tag.get_text() if desc_tag else "")
        if not description and a.get("title"):
            description = clean_text(a.get("title", ""))

        # 图标：优先 data-src（懒加载真实图），否则 src
        img = card.select_one(".url-img img, .url-body img")
        icon_url = ""
        if img:
            icon_url = img.get("data-src") or img.get("src") or ""
        if icon_url:
            icon_url = urljoin(BASE_URL, icon_url)
        else:
            domain = urlparse(tool_url).netloc
            icon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"

        if not name:
            return None

        return {
            "name": name,
            "description": description,
            "icon_url": icon_url,
            "category": category,
            "url": tool_url,  # 工具实际链接（优先 data-url）
        }

    def crawl_category(self, slug: str, url: str) -> List[dict]:
        """爬取单个分类（含分页）"""
        all_records = []
        page = 1
        category = ""

        while True:
            if page == 1:
                page_url = url
            else:
                page_url = url.rstrip("/") + f"/page/{page}/"

            soup = self.get_soup(page_url)
            if not soup:
                break

            if page == 1:
                category = self.parse_category_name(soup, slug)
                print(f"  分类: {category}")

            records = self.parse_tool_cards(soup, category)
            all_records.extend(records)
            print(f"    第 {page} 页: {len(records)} 条")

            # 检查是否有下一页：存在指向 page/{n+1} 的链接
            has_next = False
            for a in soup.select('a.page-numbers[href*="/page/"]'):
                href = a.get("href", "")
                if f"/page/{page + 1}/" in href:
                    has_next = True
                    break
            if not has_next:
                break
            page += 1
            self._delay()

        return all_records

    def crawl(self, category_filter: Optional[List[str]] = None) -> List[dict]:
        """主入口：发现分类并爬取全部"""
        print("正在发现分类链接…")
        cats = self.discover_category_urls()
        if not cats:
            print("[WARN] 未发现分类，尝试使用默认分类列表", file=sys.stderr)
            cats = [(k, f"{BASE_URL}/favorites/{k}/") for k in SLUG_TO_CATEGORY]

        all_records = []
        for slug, url in cats:
            if category_filter and slug not in category_filter:
                continue
            print(f"\n爬取: {slug} -> {url}")
            self._delay()
            records = self.crawl_category(slug, url)
            all_records.extend(records)

        return all_records


# --------------------------------------------------------------------------- #
# 输出与 CLI
# --------------------------------------------------------------------------- #

def main():
    parser = argparse.ArgumentParser(description="ai-bot.cn AI 工具导航爬虫")
    parser.add_argument("-o", "--output", default="ai_bot_cn_tools.jsonl", help="输出 JSONL 文件路径")
    parser.add_argument("--categories", nargs="*", help="只爬取指定 slug，如 ai-writing-tools ai-image-tools")
    parser.add_argument("--delay-min", type=float, default=DELAY_MIN, help="请求间隔最小值(秒)")
    parser.add_argument("--delay-max", type=float, default=DELAY_MAX, help="请求间隔最大值(秒)")
    args = parser.parse_args()

    crawler = AIBotCnCrawler(delay_min=args.delay_min, delay_max=args.delay_max)
    records = crawler.crawl(category_filter=args.categories)

    with open(args.output, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"\n完成。共 {len(records)} 条，已写入 {args.output}")


if __name__ == "__main__":
    main()
