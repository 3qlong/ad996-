"""
futurepedia.py - Crawler for https://www.futurepedia.io
Uses the public API endpoint to get structured JSON data.
Falls back to HTML scraping if API is unavailable.
"""

import logging
import json
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, urlencode

import requests
from .base_crawler import BaseCrawler

logger = logging.getLogger(__name__)

# Known Futurepedia API / pagination patterns
API_ENDPOINTS = [
    "https://www.futurepedia.io/api/tools?page={page}&limit=50",
    "https://www.futurepedia.io/api/ai-tools?page={page}",
    "https://www.futurepedia.io/_next/data/{build_id}/index.json",
]


class FuturepediaCrawler(BaseCrawler):
    """
    Crawler for futurepedia.io.
    Strategy:
      1. Try the JSON API endpoint (pagination).
      2. Fall back to HTML scraping of category pages.
    """

    def crawl(self) -> List[Dict[str, Any]]:
        logger.info(f"[{self.site_name}] Starting crawl …")
        self.check_robots_txt()

        results: List[Dict[str, Any]] = []

        try:
            # Try API-based crawl first
            api_results = self._crawl_via_api()
            if api_results:
                results = api_results
            else:
                logger.info(f"[{self.site_name}] API unavailable, falling back to HTML scraping")
                results = self._crawl_html()
        except Exception as exc:
            logger.error(f"[{self.site_name}] Unexpected error: {exc}", exc_info=True)

        logger.info(f"[{self.site_name}] Crawl complete. Total: {len(results)}")
        return results

    # ------------------------------------------------------------------ #
    #  API-based approach                                                  #
    # ------------------------------------------------------------------ #

    def _crawl_via_api(self) -> List[Dict[str, Any]]:
        """Try known API endpoints with pagination."""
        results: List[Dict[str, Any]] = []
        
        for page in range(1, 20):  # cap at 20 pages
            url = f"https://www.futurepedia.io/api/tools?page={page}&limit=50&sort=verified"
            if not self.is_allowed(url):
                break

            resp = self.fetch(url, headers={"Accept": "application/json"})
            if not resp:
                break

            try:
                data = resp.json()
            except Exception:
                break

            # Handle various response shapes
            tools = self._extract_tools_from_json(data)
            if not tools:
                break

            for tool in tools:
                record = self._parse_api_tool(tool)
                if record:
                    results.append(record)

            logger.info(f"[{self.site_name}] API page {page}: {len(tools)} tools")
            self._random_delay()

            # Check if more pages exist
            if not self._has_next_page(data, len(tools)):
                break

        return results

    def _extract_tools_from_json(self, data: Any) -> List[Dict]:
        """Handle various JSON response shapes."""
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for key in ("tools", "data", "items", "results", "aiTools"):
                if key in data and isinstance(data[key], list):
                    return data[key]
        return []

    def _has_next_page(self, data: Any, items_on_page: int) -> bool:
        if items_on_page < 10:
            return False
        if isinstance(data, dict):
            # pagination metadata
            total = data.get("total", 0)
            page = data.get("page", 1)
            limit = data.get("limit", 50)
            if total and page * limit >= total:
                return False
            if "hasNext" in data:
                return bool(data["hasNext"])
            if "nextPage" in data:
                return bool(data["nextPage"])
        return True

    def _parse_api_tool(self, tool: Dict) -> Optional[Dict[str, Any]]:
        name = tool.get("name") or tool.get("title") or ""
        name = self.clean_text(name)
        if not name:
            return None

        url = (
            tool.get("url")
            or tool.get("websiteUrl")
            or tool.get("link")
            or tool.get("website")
            or ""
        )
        if not self.is_valid_url(url):
            # try constructing from slug
            slug = tool.get("slug") or tool.get("id") or ""
            if slug:
                url = f"https://www.futurepedia.io/tool/{slug}"
            else:
                return None

        desc = (
            tool.get("description")
            or tool.get("shortDescription")
            or tool.get("excerpt")
            or ""
        )
        desc = self.clean_text(desc)

        # Category
        cats = tool.get("categories") or tool.get("tags") or []
        if isinstance(cats, list) and cats:
            cat_name = cats[0].get("name", "") if isinstance(cats[0], dict) else str(cats[0])
        elif isinstance(cats, str):
            cat_name = cats
        else:
            cat_name = tool.get("category", "其他")
        category = self.clean_text(str(cat_name)) or "其他"

        # Icon
        icon_url = (
            tool.get("logo")
            or tool.get("icon")
            or tool.get("image")
            or tool.get("thumbnail")
            or None
        )
        icon = self.resolve_icon(icon_url, url)

        return self.build_record(
            category=category,
            name=name,
            description=desc,
            url=url,
            icon=icon,
        )

    # ------------------------------------------------------------------ #
    #  HTML fallback                                                       #
    # ------------------------------------------------------------------ #

    def _crawl_html(self) -> List[Dict[str, Any]]:
        """Scrape category pages from the HTML site."""
        results: List[Dict[str, Any]] = []
        
        soup = self.get_soup(self.base_url)
        if not soup:
            return results

        # Find category links
        category_links: Dict[str, str] = {}
        for a in soup.select("a[href*='/category/'], a[href*='/categories/'], a[href*='/tag/']"):
            cat_name = self.clean_text(a.get_text())
            href = a.get("href", "")
            if cat_name and href:
                category_links[cat_name] = urljoin(self.base_url, href)

        if not category_links:
            # Just scrape homepage
            category_links["AI Tools"] = self.base_url

        for cat_name, cat_url in list(category_links.items())[:15]:  # cap categories
            if not self.is_allowed(cat_url):
                continue
            logger.info(f"[{self.site_name}] Scraping: {cat_name}")
            records = self._scrape_html_page(cat_url, cat_name)
            results.extend(records)
            self._random_delay()

        return results

    def _scrape_html_page(self, url: str, category: str) -> List[Dict[str, Any]]:
        soup = self.get_soup(url)
        if not soup:
            return []

        records = []
        card_selectors = [
            "[class*='tool']", "[class*='Tool']",
            "article", ".card", "li.item",
            "[data-testid*='tool']",
        ]

        cards = []
        for sel in card_selectors:
            cards = soup.select(sel)
            if len(cards) >= 3:
                break

        for card in cards:
            try:
                a_tag = card.select_one("a[href]")
                if not a_tag:
                    continue

                href = a_tag.get("href", "")
                tool_url = urljoin(self.base_url, href)

                # Skip navigation links
                if tool_url == self.base_url or "/category/" in tool_url:
                    continue

                name_tag = card.select_one("h2, h3, [class*='title'], [class*='name']")
                name = self.clean_text(name_tag.get_text() if name_tag else a_tag.get_text())

                desc_tag = card.select_one("p, [class*='desc'], [class*='summary']")
                desc = self.clean_text(desc_tag.get_text() if desc_tag else "")

                img = card.select_one("img")
                icon_raw = img.get("src") if img else None
                icon = self.resolve_icon(icon_raw, tool_url)

                if name and self.is_valid_url(tool_url):
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
