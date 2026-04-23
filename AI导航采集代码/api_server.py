#!/usr/bin/env python3
"""
api_server.py - Simple search API and web backend for ai_navigation.json

Usage:
    python api_server.py --data ai_navigation.json --host 0.0.0.0 --port 8000
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn


class ToolItem(BaseModel):
    category: str
    original_category: Optional[str] = None
    name: str
    description: str
    url: str
    icon: str
    source: str


class SearchResponse(BaseModel):
    total: int
    items: List[ToolItem]


def load_data(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Data file must contain a JSON array")
    return data


def create_app(data_path: Path) -> FastAPI:
    records = load_data(data_path)

    app = FastAPI(title="AI Navigation Search API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        return {"status": "ok", "count": len(records)}

    @app.get("/categories")
    def list_categories():
        cats: Dict[str, int] = {}
        for r in records:
            cat = str(r.get("category") or "其他")
            cats[cat] = cats.get(cat, 0) + 1
        # sort by count desc
        return [
            {"category": c, "count": n}
            for c, n in sorted(cats.items(), key=lambda x: -x[1])
        ]

    @app.get("/sources")
    def list_sources():
        srcs: Dict[str, int] = {}
        for r in records:
            s = str(r.get("source") or "Unknown")
            srcs[s] = srcs.get(s, 0) + 1
        return [
            {"source": s, "count": n}
            for s, n in sorted(srcs.items(), key=lambda x: -x[1])
        ]

    @app.get("/search", response_model=SearchResponse)
    def search(
        q: str = Query("", description="关键词（名称 / 描述 / URL）"),
        category: Optional[str] = Query(None, description="归一化后的分类"),
        original_category: Optional[str] = Query(None, description="原始分类"),
        source: Optional[str] = Query(None, description="数据来源站点"),
        limit: int = Query(50, ge=1, le=200),
        offset: int = Query(0, ge=0),
    ):
        q_lower = q.strip().lower()

        def match(rec: Dict[str, Any]) -> bool:
            if category and str(rec.get("category")) != category:
                return False
            if original_category and str(rec.get("original_category")) != original_category:
                return False
            if source and str(rec.get("source")) != source:
                return False
            if not q_lower:
                return True
            for field in ("name", "description", "url"):
                val = str(rec.get(field, "")).lower()
                if q_lower in val:
                    return True
            return False

        filtered = [r for r in records if match(r)]
        total = len(filtered)
        sliced = filtered[offset : offset + limit]

        return SearchResponse(
            total=total,
            items=[ToolItem(**r) for r in sliced],
        )

    return app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI Navigation Search API Server")
    parser.add_argument(
        "--data",
        default="ai_navigation.json",
        help="Path to JSON data file (default: ai_navigation.json)",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_path = Path(args.data)
    try:
        # Validate data at startup
        _ = load_data(data_path)
    except Exception as exc:
        raise SystemExit(f"Failed to load data file '{data_path}': {exc}")

    app = create_app(data_path)
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()

