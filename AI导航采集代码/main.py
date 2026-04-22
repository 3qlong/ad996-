#!/usr/bin/env python3
"""
main.py - AI Navigation Crawler
Orchestrates all crawlers, merges and cleans data,
then outputs ai_navigation.json.

Usage:
    python main.py                    # run all enabled crawlers
    python main.py --sites ai_bot_cn futurepedia   # run specific crawlers
    python main.py --output results.json           # custom output path
    python main.py --config my_config.yaml         # custom config
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple

import yaml

# Ensure local modules resolve correctly
sys.path.insert(0, str(Path(__file__).parent))

from crawlers import (
    AIBotCnCrawler,
    FuturepediaCrawler,
    TopAIToolsCrawler,
    AILetsGoCrawler,
    AIDHCrawler,
)
from data_cleaner import DataCleaner


# ------------------------------------------------------------------ #
#  Logging setup                                                       #
# ------------------------------------------------------------------ #

def setup_logging(log_level: str = "INFO", log_dir: str = "logs") -> None:
    os.makedirs(log_dir, exist_ok=True)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f"crawl_{timestamp}.log")

    fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"

    handlers = [
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file, encoding="utf-8"),
    ]

    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format=fmt,
        datefmt=datefmt,
        handlers=handlers,
    )
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    print(f"Logging to: {log_file}\n")


logger = logging.getLogger(__name__)


# ------------------------------------------------------------------ #
#  Config loading                                                      #
# ------------------------------------------------------------------ #

def load_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    path = Path(config_path)
    if not path.exists():
        logger.error(f"Config file not found: {config_path}")
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


# ------------------------------------------------------------------ #
#  Crawler registry                                                    #
# ------------------------------------------------------------------ #

CRAWLER_REGISTRY = {
    "ai_bot_cn":   AIBotCnCrawler,
    "futurepedia": FuturepediaCrawler,
    "topai_tools": TopAIToolsCrawler,
    "ailetsgo":    AILetsGoCrawler,
    "ai_dh":       AIDHCrawler,
}


def build_crawlers(config: Dict[str, Any], site_filter: List[str] | None = None):
    """Instantiate enabled crawlers from config."""
    general = config.get("general", {})
    general["user_agents"] = config.get("user_agents", [])
    general["favicon_fallback"] = config.get("favicon_fallback", "")
    sites_cfg = config.get("sites", {})

    crawlers = []
    for site_key, crawler_cls in CRAWLER_REGISTRY.items():
        site_cfg = sites_cfg.get(site_key, {})
        if not site_cfg.get("enabled", True):
            logger.info(f"Site '{site_key}' is disabled in config, skipping.")
            continue
        if site_filter and site_key not in site_filter:
            continue
        crawlers.append((site_key, crawler_cls(site_cfg, general)))

    return crawlers


# ------------------------------------------------------------------ #
#  Main orchestrator                                                   #
# ------------------------------------------------------------------ #

def run(args: argparse.Namespace) -> None:
    config = load_config(args.config)
    setup_logging(
        log_level=config.get("general", {}).get("log_level", "INFO"),
        log_dir="logs",
    )

    logger.info("=" * 60)
    logger.info("  AI Navigation Crawler starting")
    logger.info("=" * 60)

    site_filter = args.sites if args.sites else None
    crawlers = build_crawlers(config, site_filter)

    if not crawlers:
        logger.error("No crawlers to run. Check config or --sites argument.")
        sys.exit(1)

    # Run each crawler, collect results
    datasets: List[Tuple[str, List[Dict[str, Any]]]] = []
    total_raw = 0

    for site_key, crawler in crawlers:
        site_name = crawler.site_name
        print(f"\n{'─' * 50}")
        print(f"  Crawling: {site_name}")
        print(f"{'─' * 50}")
        try:
            start = time.time()
            records = crawler.crawl()
            elapsed = time.time() - start
            total_raw += len(records)
            logger.info(
                f"[{site_name}] Finished in {elapsed:.1f}s — {len(records)} records collected"
            )
            print(f"  ✓ {len(records)} records collected in {elapsed:.1f}s")
            datasets.append((site_name, records))
        except Exception as exc:
            logger.error(f"[{site_name}] FAILED: {exc}", exc_info=True)
            print(f"  ✗ FAILED: {exc}")

    print(f"\n{'─' * 50}")
    print(f"  Raw records from all sources: {total_raw}")
    print(f"  Cleaning and deduplicating …")

    # Clean + merge
    category_mapping = config.get("category_mapping", {})
    cleaner = DataCleaner(category_mapping)
    final_records = cleaner.clean_and_merge(datasets)

    # Print stats
    DataCleaner.print_stats(final_records)

    # Save output
    output_path = args.output or config.get("general", {}).get("output_file", "ai_navigation.json")
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_records, f, ensure_ascii=False, indent=2)

    print(f"\n  ✓ Output saved to: {output_path}")
    print(f"  ✓ Total records: {len(final_records)}\n")
    logger.info(f"Done. {len(final_records)} records saved to '{output_path}'")


# ------------------------------------------------------------------ #
#  CLI                                                                 #
# ------------------------------------------------------------------ #

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="AI Navigation Crawler — scrapes multiple AI tool directories",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py
  python main.py --sites ai_bot_cn futurepedia
  python main.py --output output/my_data.json
  python main.py --config custom_config.yaml
        """,
    )
    parser.add_argument(
        "--config", default="config.yaml",
        help="Path to YAML config file (default: config.yaml)"
    )
    parser.add_argument(
        "--output", default=None,
        help="Output JSON file path (overrides config)"
    )
    parser.add_argument(
        "--sites", nargs="+", default=None,
        choices=list(CRAWLER_REGISTRY.keys()),
        metavar="SITE",
        help=f"Run only specific crawlers. Choices: {', '.join(CRAWLER_REGISTRY.keys())}"
    )
    parser.add_argument(
        "--list-sites", action="store_true",
        help="List available crawlers and exit"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    if args.list_sites:
        print("\nAvailable crawlers:")
        for key in CRAWLER_REGISTRY:
            print(f"  {key}")
        sys.exit(0)

    run(args)
