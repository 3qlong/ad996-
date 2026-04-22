"""
ai_bot_cn.py - Crawler for https://ai-bot.cn
"""

import logging
from typing import List, Dict, Any
from urllib.parse import urljoin

from .base_crawler import BaseCrawler

logger = logging.getLogger(__name__)


class AIBotCnCrawler(BaseCrawler):
    """
    Crawler for ai-bot.cn — a static Chinese AI navigation site.
    Strategy:
      1. Fetch the homepage to discover category links.
      2. Visit each category page and scrape tool cards.
    """

    def crawl(self) -> List[Dict[str, Any]]:
        logger.info(f"[{self.site_name}] Starting crawl …")
        self.check_robots_txt()

        results: List[Dict[str, Any]] = []
        try:
            categories = self._get_categories()
            if not categories:
                logger.warning(f"[{self.site_name}] No categories found, trying homepage directly")
                results = self._scrape_page(self.base_url, "未分类")
            else:
                for cat_name, cat_url in categories.items():
                    if not self.is_allowed(cat_url):
                        continue
                    logger.info(f"[{self.site_name}] Category: {cat_name} → {cat_url}")
                    records = self._scrape_page(cat_url, cat_name)
                    logger.info(f"[{self.site_name}]   Found {len(records)} tools")
                    results.extend(records)
                    self._random_delay()
        except Exception as exc:
            logger.error(f"[{self.site_name}] Unexpected error: {exc}", exc_info=True)

        logger.info(f"[{self.site_name}] Crawl complete. Total: {len(results)}")
        return results

    # ------------------------------------------------------------------ #

    def _get_categories(self) -> Dict[str, str]:
        """Return {category_name: url} from the homepage navigation."""
        soup = self.get_soup(self.base_url)
        if not soup:
            return {}

        cats: Dict[str, str] = {}

        # ai-bot.cn uses anchor links in a left sidebar / top nav
        # Try several common selectors
        selectors = [
            "nav a", ".cat-links a", ".category-list a",
            "#sidebar a", ".menu a", ".nav-menu a",
            "a[href*='category']", "a[href*='cat=']",
            ".tag-cloud-link", ".cats a",
        ]

        for sel in selectors:
            links = soup.select(sel)
            if links:
                for a in links:
                    href = a.get("href", "")
                    text = self.clean_text(a.get_text())
                    if href and text and len(text) < 30:
                        full_url = urljoin(self.base_url, href)
                        if full_url.startswith(self.base_url):
                            cats[text] = full_url
                if cats:
                    break

        # Fallback: collect category sections from homepage itself
        if not cats:
            for section in soup.select("section, .section, .block"):
                heading = section.find(["h2", "h3", "h4"])
                if heading:
                    cats[self.clean_text(heading.get_text())] = self.base_url

        return cats

    def _scrape_page(self, url: str, category: str) -> List[Dict[str, Any]]:
        """Extract tool cards from a single page."""
        soup = self.get_soup(url)
        if not soup:
            return []

        records: List[Dict[str, Any]] = []
        card_selectors = [
            "article", ".post", ".tool-card", ".ai-item",
            ".item-card", "li.item", ".card", ".post-card",
        ]

        cards = []
        for sel in card_selectors:
            cards = soup.select(sel)
            if len(cards) >= 3:
                break

        for card in cards:
            try:
                record = self._parse_card(card, category)
                if record:
                    records.append(record)
            except Exception as exc:
                logger.debug(f"[{self.site_name}] Card parse error: {exc}")

        # Fallback: parse h2/h3 + sibling p within sections
        if not records:
            records = self._parse_sections(soup, category)

        return records

    def _parse_card(self, card, category: str) -> Dict[str, Any] | None:
        # Title + URL
        title_tag = card.select_one("h2 a, h3 a, h4 a, .title a, a.name, a[class*='title']")
        if not title_tag:
            title_tag = card.select_one("a")
        if not title_tag:
            return None

        name = self.clean_text(title_tag.get_text())
        href = title_tag.get("href", "")
        tool_url = urljoin(self.base_url, href)

        if not self.is_valid_url(tool_url) or tool_url == self.base_url:
            return None

        # Description
        desc_tag = card.select_one(
            ".desc, .description, .excerpt, .summary, .entry-summary, p"
        )
        description = self.clean_text(desc_tag.get_text() if desc_tag else "")

        # Icon
        img_tag = card.select_one("img")
        icon_raw = img_tag.get("src") if img_tag else None
        icon = self.resolve_icon(icon_raw, tool_url)

        if not name:
            return None

        return self.build_record(
            category=category,
            name=name,
            description=description,
            url=tool_url,
            icon=icon,
        )

    def _parse_sections(self, soup, category: str) -> List[Dict[str, Any]]:
        """Fallback: look for heading + paragraph pairs."""
        records = []
        for heading in soup.select("h2, h3"):
            a = heading.find("a")
            if not a:
                continue
            name = self.clean_text(a.get_text())
            href = a.get("href", "")
            tool_url = urljoin(self.base_url, href)
            if not self.is_valid_url(tool_url) or not name:
                continue

            # Nearest sibling <p>
            p = heading.find_next_sibling("p")
            desc = self.clean_text(p.get_text() if p else "")

            records.append(self.build_record(
                category=category,
                name=name,
                description=desc,
                url=tool_url,
                icon=self.resolve_icon(None, tool_url),
            ))
        return records
