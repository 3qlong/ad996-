"""
generic_static.py - Generic static HTML crawler for:
  - ailetsgo.cn
  - ai-dh.com
Both follow a similar structure: homepage with category sections
and linked tool cards.
"""

import logging
from typing import List, Dict, Any
from urllib.parse import urljoin, urlparse

from .base_crawler import BaseCrawler

logger = logging.getLogger(__name__)


class GenericStaticCrawler(BaseCrawler):
    """
    Flexible static HTML crawler suitable for Chinese AI navigation sites
    that share a common pattern:
      - Homepage or category pages listing tool cards
      - Each card has: title link, description, optional icon
    """

    def crawl(self) -> List[Dict[str, Any]]:
        logger.info(f"[{self.site_name}] Starting crawl …")
        self.check_robots_txt()

        results: List[Dict[str, Any]] = []
        try:
            # Phase 1: collect category URLs
            categories = self._discover_categories()

            if categories:
                for cat_name, cat_url in categories.items():
                    if not self.is_allowed(cat_url):
                        continue
                    logger.info(f"[{self.site_name}] Scraping category: {cat_name}")
                    records = self._scrape_page(cat_url, cat_name)
                    logger.info(f"[{self.site_name}]   {len(records)} tools")
                    results.extend(records)
                    self._random_delay()
            else:
                # Just scrape the homepage
                results = self._scrape_page(self.base_url, "AI工具")

        except Exception as exc:
            logger.error(f"[{self.site_name}] Unexpected error: {exc}", exc_info=True)

        logger.info(f"[{self.site_name}] Crawl complete. Total: {len(results)}")
        return results

    # ------------------------------------------------------------------ #

    def _discover_categories(self) -> Dict[str, str]:
        """Try to find category links from the homepage."""
        soup = self.get_soup(self.base_url)
        if not soup:
            return {}

        cats: Dict[str, str] = {}
        domain = urlparse(self.base_url).netloc

        # Broad set of selectors for category navigation
        selectors = [
            "nav a", ".nav a", ".navbar a",
            ".category a", ".categories a", ".cat a",
            "a[href*='category']", "a[href*='cat=']", "a[href*='/tag/']",
            ".menu a", "#menu a", ".sidebar a",
            ".tags a", ".topics a",
            "ul.menu li a", ".main-nav a",
        ]

        seen_hrefs = set()
        for sel in selectors:
            for a in soup.select(sel):
                href = a.get("href", "").strip()
                if not href or href in seen_hrefs:
                    continue
                seen_hrefs.add(href)

                text = self.clean_text(a.get_text())
                full_url = urljoin(self.base_url, href)
                parsed = urlparse(full_url)

                # Keep only same-domain links that look like categories
                if (parsed.netloc == domain
                        and full_url != self.base_url
                        and 1 < len(text) < 40
                        and not any(x in full_url for x in ["#", "mailto:", "javascript:"])):
                    cats[text] = full_url

        # Deduplicate: keep ≤ 30 categories
        return dict(list(cats.items())[:30])

    def _scrape_page(self, url: str, category: str) -> List[Dict[str, Any]]:
        """Extract tool cards from one page."""
        soup = self.get_soup(url)
        if not soup:
            return []

        records: List[Dict[str, Any]] = []

        # --- Try card-level scraping ---
        card_selectors = [
            ".tool-card", ".ai-card", ".item-card", ".tool-item",
            ".ai-item", ".card", "article",
            "li.tool", "li.item", "li.ai-item",
            ".post", ".entry", "div[class*='item']",
            "div[class*='card']", "div[class*='tool']",
        ]

        cards = []
        for sel in card_selectors:
            candidates = soup.select(sel)
            if len(candidates) >= 3:
                cards = candidates
                logger.debug(f"[{self.site_name}] Using selector '{sel}', {len(cards)} cards")
                break

        if cards:
            for card in cards:
                try:
                    rec = self._parse_card(card, category, url)
                    if rec:
                        records.append(rec)
                except Exception as exc:
                    logger.debug(f"[{self.site_name}] Card error: {exc}")
        else:
            # Fallback: heading + paragraph pairs
            records = self._parse_heading_pairs(soup, category)

        return records

    def _parse_card(self, card, category: str, page_url: str) -> Dict[str, Any] | None:
        # Find the primary link
        a = card.select_one("h2 a, h3 a, h4 a, .title a, .name a, a.title, a.name")
        if not a:
            a = card.select_one("a[href]")
        if not a:
            return None

        href = a.get("href", "").strip()
        if not href or href.startswith("#"):
            return None

        # Determine the tool URL
        raw_url = urljoin(page_url, href)
        # Some sites wrap external links as /go/... or /out/... redirects
        tool_url = self._resolve_redirect_url(card, raw_url)

        if not self.is_valid_url(tool_url):
            return None

        # Name
        name_tag = card.select_one("h2, h3, h4, .title, .name, [class*='title'], [class*='name']")
        name = self.clean_text(name_tag.get_text() if name_tag else a.get_text())
        if not name:
            return None

        # Description
        desc_tag = card.select_one(
            ".desc, .description, .intro, .summary, .excerpt, p, [class*='desc']"
        )
        desc = self.clean_text(desc_tag.get_text() if desc_tag else "")

        # Icon
        img = card.select_one("img")
        icon_raw = None
        if img:
            icon_raw = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
        icon = self.resolve_icon(icon_raw, tool_url)

        return self.build_record(
            category=category,
            name=name,
            description=desc,
            url=tool_url,
            icon=icon,
        )

    def _resolve_redirect_url(self, card, default_url: str) -> str:
        """
        Some sites store the real URL in data attributes or a nested <a>.
        Try to extract the most authoritative external URL.
        """
        # data attributes
        for attr in ("data-url", "data-href", "data-link", "data-target"):
            val = card.get(attr, "")
            if val and self.is_valid_url(val):
                return val

        # Nested links that point off-site
        for a in card.select("a[href]"):
            href = a.get("href", "")
            if href.startswith("http") and urlparse(href).netloc != urlparse(self.base_url).netloc:
                return href

        return default_url

    def _parse_heading_pairs(self, soup, category: str) -> List[Dict[str, Any]]:
        """Fallback parser: h2/h3 with a link + nearest paragraph."""
        records = []
        for h in soup.select("h2, h3"):
            a = h.find("a")
            if not a:
                continue
            name = self.clean_text(a.get_text())
            href = a.get("href", "")
            url = urljoin(self.base_url, href)
            if not self.is_valid_url(url) or not name:
                continue
            p = h.find_next_sibling("p")
            desc = self.clean_text(p.get_text() if p else "")
            records.append(self.build_record(
                category=category,
                name=name,
                description=desc,
                url=url,
                icon=self.resolve_icon(None, url),
            ))
        return records


class AILetsGoCrawler(GenericStaticCrawler):
    """Crawler for https://ailetsgo.cn"""
    pass


class AIDHCrawler(GenericStaticCrawler):
    """Crawler for https://www.ai-dh.com"""
    pass
