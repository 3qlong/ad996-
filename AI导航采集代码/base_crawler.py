"""
base_crawler.py - Base crawler class with shared utilities
"""

import time
import random
import logging
import re
from abc import ABC, abstractmethod
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional, Any

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class BaseCrawler(ABC):
    """
    Abstract base class for all AI navigation site crawlers.
    Provides common functionality: session management, retry logic,
    rate limiting, robots.txt checking, and icon resolution.
    """

    def __init__(self, site_config: Dict[str, Any], general_config: Dict[str, Any]):
        self.site_config = site_config
        self.general_config = general_config
        self.base_url = site_config.get("base_url", "")
        self.site_name = site_config.get("name", "Unknown")

        self.timeout = general_config.get("request_timeout", 15)
        self.retry_count = general_config.get("retry_count", 3)
        self.delay_min = general_config.get("delay_min", 1.0)
        self.delay_max = general_config.get("delay_max", 3.0)
        self.user_agents: List[str] = general_config.get("user_agents", [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        ])
        self.favicon_template: str = general_config.get(
            "favicon_fallback",
            "https://www.google.com/s2/favicons?domain={domain}&sz=64"
        )

        self.session = requests.Session()
        self._rotate_user_agent()
        self._disallowed_paths: List[str] = []
        self._robots_checked = False

    # ------------------------------------------------------------------ #
    #  Session & request helpers                                           #
    # ------------------------------------------------------------------ #

    def _rotate_user_agent(self) -> None:
        ua = random.choice(self.user_agents)
        self.session.headers.update({
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        })

    def _random_delay(self) -> None:
        delay = random.uniform(self.delay_min, self.delay_max)
        logger.debug(f"Sleeping {delay:.2f}s …")
        time.sleep(delay)

    def fetch(self, url: str, **kwargs) -> Optional[requests.Response]:
        """GET with retry + random UA rotation on each attempt."""
        for attempt in range(1, self.retry_count + 1):
            self._rotate_user_agent()
            try:
                resp = self.session.get(url, timeout=self.timeout, **kwargs)
                resp.raise_for_status()
                logger.debug(f"[{self.site_name}] GET {url} → {resp.status_code}")
                return resp
            except requests.RequestException as exc:
                logger.warning(
                    f"[{self.site_name}] Attempt {attempt}/{self.retry_count} failed for {url}: {exc}"
                )
                if attempt < self.retry_count:
                    time.sleep(attempt * 2)   # back-off
        logger.error(f"[{self.site_name}] All retries exhausted for {url}")
        return None

    def get_soup(self, url: str, **kwargs) -> Optional[BeautifulSoup]:
        resp = self.fetch(url, **kwargs)
        if resp is None:
            return None
        try:
            return BeautifulSoup(resp.text, "html.parser")
        except Exception as exc:
            logger.error(f"[{self.site_name}] Failed to parse HTML from {url}: {exc}")
            return None

    # ------------------------------------------------------------------ #
    #  robots.txt compliance                                               #
    # ------------------------------------------------------------------ #

    def check_robots_txt(self) -> bool:
        """
        Fetch and parse robots.txt. Returns True if crawling the base
        URL appears allowed. Stores disallowed paths for later checks.
        """
        robots_url = urljoin(self.base_url, "/robots.txt")
        try:
            resp = self.session.get(robots_url, timeout=self.timeout)
            if resp.status_code == 200:
                self._parse_robots(resp.text)
            logger.info(f"[{self.site_name}] robots.txt checked. "
                        f"Disallowed paths: {len(self._disallowed_paths)}")
        except Exception as exc:
            logger.warning(f"[{self.site_name}] Could not fetch robots.txt: {exc}")
        self._robots_checked = True
        return True   # proceed; respect disallowed paths per-request

    def _parse_robots(self, content: str) -> None:
        """Naïve robots.txt parser for * and our UA."""
        current_agents: List[str] = []
        apply_rules = False
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.lower().startswith("user-agent:"):
                agent = line.split(":", 1)[1].strip()
                current_agents.append(agent.lower())
                apply_rules = "*" in current_agents or "python" in current_agents
            elif line.lower().startswith("disallow:") and apply_rules:
                path = line.split(":", 1)[1].strip()
                if path:
                    self._disallowed_paths.append(path)

    def is_allowed(self, url: str) -> bool:
        parsed = urlparse(url)
        for path in self._disallowed_paths:
            if parsed.path.startswith(path):
                logger.warning(f"[{self.site_name}] URL disallowed by robots.txt: {url}")
                return False
        return True

    # ------------------------------------------------------------------ #
    #  Icon helpers                                                        #
    # ------------------------------------------------------------------ #

    def resolve_icon(self, icon_url: Optional[str], tool_url: str) -> str:
        """
        Return the best icon URL:
        1. Absolute URL from the card itself.
        2. Google S2 favicon as fallback.
        """
        if icon_url:
            if icon_url.startswith("http"):
                return icon_url
            # Try to make it absolute relative to base_url
            return urljoin(self.base_url, icon_url)

        # Fallback: Google S2
        domain = urlparse(tool_url).netloc
        return self.favicon_template.format(domain=domain)

    # ------------------------------------------------------------------ #
    #  URL validation                                                      #
    # ------------------------------------------------------------------ #

    @staticmethod
    def is_valid_url(url: Optional[str]) -> bool:
        if not url:
            return False
        try:
            parsed = urlparse(url)
            return bool(parsed.scheme in ("http", "https") and parsed.netloc)
        except Exception:
            return False

    # ------------------------------------------------------------------ #
    #  Abstract interface                                                  #
    # ------------------------------------------------------------------ #

    @abstractmethod
    def crawl(self) -> List[Dict[str, Any]]:
        """
        Main entry point. Must return a list of dicts with keys:
          category, name, description, url, icon, source
        """
        ...

    # ------------------------------------------------------------------ #
    #  Shared record builder                                              #
    # ------------------------------------------------------------------ #

    def build_record(
        self,
        *,
        category: str,
        name: str,
        description: str,
        url: str,
        icon: str,
    ) -> Dict[str, Any]:
        return {
            "category": category.strip() or "其他",
            "name": name.strip(),
            "description": description.strip(),
            "url": url.strip().rstrip("/"),
            "icon": icon,
            "source": self.site_name,
        }

    # ------------------------------------------------------------------ #
    #  Text cleaning                                                       #
    # ------------------------------------------------------------------ #

    @staticmethod
    def clean_text(text: Optional[str], max_len: int = 300) -> str:
        if not text:
            return ""
        text = re.sub(r"\s+", " ", text).strip()
        return text[:max_len]
