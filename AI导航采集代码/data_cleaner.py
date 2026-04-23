"""
data_cleaner.py - Dedup, category normalization, and data validation
"""

import re
import logging
from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class DataCleaner:
    """
    Cleans, deduplicates, and normalises records from multiple crawlers.
    """

    def __init__(self, category_mapping: Dict[str, List[str]]):
        """
        category_mapping: {canonical_name: [alias1, alias2, ...]}
        """
        # Build reverse lookup: alias (lower) → canonical
        self._alias_map: Dict[str, str] = {}
        for canonical, aliases in category_mapping.items():
            self._alias_map[canonical.lower()] = canonical
            for alias in aliases:
                self._alias_map[alias.lower()] = canonical

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def clean_and_merge(
        self,
        datasets: List[Tuple[str, List[Dict[str, Any]]]],
    ) -> List[Dict[str, Any]]:
        """
        datasets: list of (source_name, records)
        Returns deduplicated, cleaned, normalised records sorted by category.
        """
        all_records: List[Dict[str, Any]] = []
        for source_name, records in datasets:
            logger.info(f"[Cleaner] Processing source '{source_name}': {len(records)} records")
            for rec in records:
                cleaned = self._clean_record(rec)
                if cleaned:
                    all_records.append(cleaned)

        before = len(all_records)
        deduped = self._deduplicate(all_records)
        after = len(deduped)
        logger.info(f"[Cleaner] Dedup: {before} → {after} records ({before - after} removed)")

        # Sort by category then name
        deduped.sort(key=lambda r: (r["category"], r["name"].lower()))
        return deduped

    # ------------------------------------------------------------------ #
    #  Per-record cleaning                                                 #
    # ------------------------------------------------------------------ #

    def _clean_record(self, rec: Dict[str, Any]) -> Dict[str, Any] | None:
        # Required fields
        name = self._clean_str(rec.get("name", ""))
        url = self._clean_url(rec.get("url", ""))
        if not name or not url:
            return None

        raw_category = self._clean_str(rec.get("category", ""))
        category = self._normalise_category(raw_category)
        description = self._clean_description(rec.get("description", ""))
        icon = self._clean_str(rec.get("icon", ""))
        source = self._clean_str(rec.get("source", ""))

        return {
            # 归一化后的统一分类
            "category": category,
            # 保留各站点的原始分类名称，便于还原/按原站点分组
            "original_category": raw_category or category,
            "name": name,
            "description": description,
            "url": url,
            "icon": icon,
            "source": source,
        }

    @staticmethod
    def _clean_str(s: Any) -> str:
        if not s:
            return ""
        return re.sub(r"\s+", " ", str(s)).strip()

    @staticmethod
    def _clean_url(url: Any) -> str:
        if not url:
            return ""
        url = str(url).strip()
        try:
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https") or not parsed.netloc:
                return ""
            # Normalise: remove trailing slash, lowercase scheme+host
            normalised = f"{parsed.scheme.lower()}://{parsed.netloc.lower()}{parsed.path}"
            if parsed.query:
                normalised += f"?{parsed.query}"
            return normalised.rstrip("/")
        except Exception:
            return ""

    def _clean_description(self, desc: Any) -> str:
        text = self._clean_str(desc)
        if not text:
            return ""
        # Remove HTML remnants
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        # Trim to 300 chars
        if len(text) > 300:
            text = text[:297] + "…"
        return text

    def _normalise_category(self, raw: Any) -> str:
        cat = self._clean_str(raw)
        if not cat:
            return "其他"

        lower = cat.lower()
        # Exact match
        if lower in self._alias_map:
            return self._alias_map[lower]

        # Partial / substring match
        for alias, canonical in self._alias_map.items():
            if alias and (alias in lower or lower in alias):
                return canonical

        # Return as-is if no mapping found
        return cat or "其他"

    # ------------------------------------------------------------------ #
    #  Deduplication                                                       #
    # ------------------------------------------------------------------ #

    def _deduplicate(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Deduplicate by URL (first occurrence wins)."""
        seen: Dict[str, bool] = {}
        result: List[Dict[str, Any]] = []
        for rec in records:
            url = rec["url"]
            # Also normalise by domain only for near-duplicate detection
            domain = urlparse(url).netloc.lower().lstrip("www.")
            name_key = rec["name"].lower()

            # Primary key: exact URL
            if url in seen:
                continue

            # Secondary key: same domain + same name
            secondary_key = f"{domain}::{name_key}"
            if secondary_key in seen:
                continue

            seen[url] = True
            seen[secondary_key] = True
            result.append(rec)

        return result

    # ------------------------------------------------------------------ #
    #  Statistics                                                          #
    # ------------------------------------------------------------------ #

    @staticmethod
    def print_stats(records: List[Dict[str, Any]]) -> None:
        from collections import Counter
        cat_counts = Counter(r["category"] for r in records)
        src_counts = Counter(r["source"] for r in records)

        print("\n" + "=" * 50)
        print(f"  TOTAL RECORDS: {len(records)}")
        print("=" * 50)
        print("\n  By Source:")
        for src, count in sorted(src_counts.items(), key=lambda x: -x[1]):
            print(f"    {src:<25} {count:>5}")
        print("\n  By Category (top 20):")
        for cat, count in cat_counts.most_common(20):
            print(f"    {cat:<25} {count:>5}")
        print("=" * 50 + "\n")
