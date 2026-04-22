"""
topai_tools.py - Crawler for https://topai.tools
"""

import logging
from typing import List, Dict, Any
from urllib.parse import urljoin

from .base_crawler import BaseCrawler

logger = logging.getLogger(__name__)


class TopAIToolsCrawler(BaseCrawler):
    """
    Crawler for topai.tools — static HTML AI navigation site.
    Strategy:
      1. Extract category links from homepage.
      2. Paginate through each category page.
    """

    def crawl(self) -> List[Dict[str, Any]]:
        logger.info(f"[{self.site_name}] Starting crawl …")
        self.check_robots_txt()

        results: List[Dict[str, Any]] = []
        try:
            categories = self._get_categories()
            if not categories:
                logger.warning(f"[{self.site_name}] No categories found, scraping homepage")
                categories = {"AI Tools": self.base_url}

            for cat_name, cat_url in categories.items():
                if not self.is_allowed(cat_url):
                    continue
                logger.info(f"[{self.site_name}] Category: {cat_name}")
                records = self._scrape_category(cat_url, cat_name)
                logger.info(f"[{self.site_name}]   {len(records)} tools found")
                results.extend(records)
                self._random_delay()

        except Exception as exc:
            logger.error(f"[{self.site_name}] Unexpected error: {exc}", exc_info=True)

        logger.info(f"[{self.site_name}] Crawl complete. Total: {len(results)}")
        return results

    # ------------------------------------------------------------------ #

    def _get_categories(self) -> Dict[str, str]:
        soup = self.get_soup(self.base_url)
        if not soup:
            return {}

        cats: Dict[str, str] = {}
        selectors = [
            "nav a", ".categories a", ".category a", ".tags a",
            "a[href*='/category/']", "a[href*='/cat/']",
            ".sidebar a", ".menu-item a",
        ]

        for sel in selectors:
            for a in soup.select(sel):
                href = a.get("href", "")
                text = self.clean_text(a.get_text())
                if href and text and 1 < len(text) < 40:
                    full = urljoin(self.base_url, href)
                    if self.base_url in full and full != self.base_url:
                        cats[text] = full
            if cats:
                break

        return cats

    def _scrape_category(self, start_url: str, category: str) -> List[Dict[str, Any]]:
        """Scrape a category, following pagination."""
        results: List[Dict[str, Any]] = []
        url: str | None = start_url
        page = 1

        while url and page <= 10:  # max 10 pages per category
            soup = self.get_soup(url)
            if not soup:
                break

            page_records = self._parse_tool_cards(soup, category)
            results.extend(page_records)
            logger.debug(f"[{self.site_name}]   Page {page}: {len(page_records)} tools")

            # Pagination
            url = self._get_next_page(soup, url)
            page += 1
            if url:
                self._random_delay()

        return results

    def _parse_tool_cards(self, soup, category: str) -> List[Dict[str, Any]]:
        records = []
        card_selectors = [
            ".tool-card", ".tool-item", ".ai-tool",
            "article", ".card", ".item",
            "li[class*='tool']", "div[class*='tool']",
        ]

        cards = []
        for sel in card_selectors:
            cards = soup.select(sel)
            if len(cards) >= 3:
                break

        # If still nothing useful, try to parse structured data
        if not cards:
            return self._parse_structured(soup, category)

        for card in cards:
            try:
                # URL + Name
                a = card.select_one("h2 a, h3 a, .title a, .name a, a[class*='title']")
                if not a:
                    a = card.select_one("a[href]")
                if not a:
                    continue

                href = a.get("href", "")
                tool_url = urljoin(self.base_url, href)
                if not self.is_valid_url(tool_url) or tool_url == self.base_url:
                    continue

                # Try to get the external tool URL from data attributes or nested links
                external = card.get("data-url") or card.get("data-href")
                if external and self.is_valid_url(external):
                    tool_url = external

                name_tag = card.select_one("h2, h3, .title, .name, [class*='title']")
                name = self.clean_text(name_tag.get_text() if name_tag else a.get_text())
                if not name:
                    continue

                desc_tag = card.select_one(".desc, .description, p, .summary, [class*='desc']")
                desc = self.clean_text(desc_tag.get_text() if desc_tag else "")

                img = card.select_one("img")
                icon_raw = img.get("src") or img.get("data-src") if img else None
                icon = self.resolve_icon(icon_raw, tool_url)

                records.append(self.build_record(
                    category=category,
                    name=name,
                    description=desc,
                    url=tool_url,
                    icon=icon,
                ))
            except Exception as exc:
                logger.debug(f"[{self.site_name}] Card error: {exc}")

        return records

    def _parse_structured(self, soup, category: str) -> List[Dict[str, Any]]:
        """Fallback: look for heading+link+desc patterns."""
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
                category=category, name=name, description=desc,
                url=url, icon=self.resolve_icon(None, url),
            ))
        return records

    def _get_next_page(self, soup, current_url: str) -> str | None:
        """Find rel=next or numbered pagination link."""
        # rel="next"
        nxt = soup.select_one('a[rel="next"]')
        if nxt:
            href = nxt.get("href", "")
            return urljoin(self.base_url, href) if href else None

        # Numbered pagination: current + 1
        pag = soup.select(".pagination a, .page-numbers a, nav.pager a")
        current_found = False
        for a in pag:
            href = a.get("href", "")
            full = urljoin(self.base_url, href)
            if current_found and full != current_url:
                return full
            if full == current_url:
                current_found = True

        return None
