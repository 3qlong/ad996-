#!/usr/bin/env python3
"""
api_server.py - AI 导航主服务
  - 前端：emoji-ai-navigator-main/dist/（React SPA）
  - 搜索 API：/health /categories /sources /search（读 ai_navigation.json）
  - 公开统计 API 由独立进程 admin_api:8001 提供；Nginx 将 /api/click、/api/hot-* 反代至 8001
  - 图标代理：/icon-proxy（允许公网图片源；拦截内网/回环主机，见 _icon_host_allowed）

Usage:
    python api_server.py --host 127.0.0.1 --port 8096

默认端口 8096：与 picTent(3000)、admin_api(8001)、Vite dev(8080) 错开；可用 AINAV_API_PORT 覆盖。
"""

import argparse
import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

import requests
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ── 图标代理（允许所有 HTTPS 图片域，拒绝私有/回环地址） ──────────────────────
_MAX_ICON_BYTES = 2 * 1024 * 1024
_ICON_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "Chrome/120.0.0.0 Safari/537.36"
)
# 不允许代理的内网/敏感地址前缀（防止 SSRF）
_BLOCKED_HOSTS = {
    "localhost", "127.0.0.1", "0.0.0.0", "::1",
}
_BLOCKED_PREFIXES = ("10.", "172.", "192.168.", "169.254.")


def _icon_host_allowed(hostname: str) -> bool:
    if not hostname:
        return False
    h = hostname.lower().rstrip(".")
    if h in _BLOCKED_HOSTS:
        return False
    if any(h.startswith(p) for p in _BLOCKED_PREFIXES):
        return False
    return True


# ── 数据模型 ───────────────────────────────────────────────────────────────────
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


def create_app(data_path: Path, dist_dir: Path) -> FastAPI:
    records = load_data(data_path)
    index_html = (dist_dir / "index.html").resolve()

    app = FastAPI(title="AI Navigation API", docs_url=None, redoc_url=None)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── 图标代理 ──────────────────────────────────────────────────────────────
    @app.get("/icon-proxy")
    def icon_proxy(u: str = Query(..., max_length=2048)):
        try:
            parsed = urlparse(u)
        except Exception:
            raise HTTPException(status_code=400, detail="invalid url") from None
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="only http(s)")
        host = parsed.hostname or ""
        if not _icon_host_allowed(host):
            raise HTTPException(status_code=403, detail="host not allowed")
        hdrs = {
            "User-Agent": _ICON_UA,
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            "Referer": "https://ai-bot.cn/",
        }
        try:
            r = requests.get(u, headers=hdrs, timeout=(4, 15))
            r.raise_for_status()
        except requests.RequestException as e:
            raise HTTPException(status_code=502, detail=f"upstream: {e!s}") from e
        body = r.content
        if len(body) > _MAX_ICON_BYTES:
            raise HTTPException(status_code=502, detail="icon too large")
        ct = r.headers.get("Content-Type", "").split(";")[0].strip() or "image/png"
        if not ct.startswith("image/"):
            ct = "application/octet-stream"
        return Response(content=body, media_type=ct,
                        headers={"Cache-Control": "public, max-age=86400"})

    # ── 健康检查 & 搜索 API ───────────────────────────────────────────────────
    @app.get("/health")
    def health():
        return {"status": "ok", "count": len(records)}

    @app.get("/categories")
    def list_categories():
        cats: Dict[str, int] = {}
        for r in records:
            cat = str(r.get("category") or "其他")
            cats[cat] = cats.get(cat, 0) + 1
        return [{"category": c, "count": n}
                for c, n in sorted(cats.items(), key=lambda x: -x[1])]

    @app.get("/sources")
    def list_sources():
        srcs: Dict[str, int] = {}
        for r in records:
            s = str(r.get("source") or "Unknown")
            srcs[s] = srcs.get(s, 0) + 1
        return [{"source": s, "count": n}
                for s, n in sorted(srcs.items(), key=lambda x: -x[1])]

    @app.get("/search", response_model=SearchResponse)
    def search(
        q: str = Query("", description="关键词"),
        category: Optional[str] = Query(None),
        original_category: Optional[str] = Query(None),
        source: Optional[str] = Query(None),
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
                if q_lower in str(rec.get(field, "")).lower():
                    return True
            return False

        filtered = [r for r in records if match(r)]
        return SearchResponse(total=len(filtered),
                              items=[ToolItem(**r) for r in filtered[offset:offset + limit]])

    # ── 静态资源：挂载 dist/ 下所有子目录 + 根文件 ───────────────────────────
    # 跳过的名称：与 API 路由冲突（如 /health /search /categories /sources /icon-proxy）
    _RESERVED = {"health", "search", "categories", "sources", "icon-proxy", "api"}
    for child in sorted(dist_dir.iterdir()):
        if child.is_dir() and child.name not in _RESERVED:
            app.mount(f"/{child.name}",
                      StaticFiles(directory=str(child)),
                      name=child.name)
    # dist 根下的静态文件（favicon.ico、robots.txt、placeholder.svg、logo*.png 等）
    for fp in dist_dir.iterdir():
        if fp.is_file() and fp.name not in ("index.html",):
            def _make_static(p: Path):
                def _handler():
                    return FileResponse(str(p))
                return _handler
            app.get(f"/{fp.name}")(_make_static(fp))

    # ── SPA 兜底：所有未匹配路由返回 index.html ───────────────────────────────
    # index.html 每次都必须从服务端获取最新版（assets/ 文件名带 hash，可永久缓存）
    _NO_CACHE = {"Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache"}

    @app.get("/")
    def spa_root():
        return FileResponse(str(index_html), headers=_NO_CACHE)

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        return FileResponse(str(index_html), headers=_NO_CACHE)

    return app


def resolve_data_path(raw: str, base_dir: Path) -> Path:
    p = Path(raw)
    return p if p.is_absolute() else (base_dir / p).resolve()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI Navigation Server")
    parser.add_argument("--data", default="ai_navigation.json")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("AINAV_API_PORT", "8096")),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    # api_server.py 位于 AI导航采集代码/；dist 在同级的 emoji-ai-navigator-main/dist/
    base_dir = Path(__file__).resolve().parent
    dist_dir = (base_dir.parent / "emoji-ai-navigator-main" / "dist").resolve()
    data_path = resolve_data_path(args.data, base_dir)

    if not dist_dir.is_dir():
        raise SystemExit(f"前端 dist 目录不存在: {dist_dir}\n请先在本地 npm run build 后同步。")
    if not (dist_dir / "index.html").is_file():
        raise SystemExit(f"缺少 {dist_dir}/index.html")

    try:
        load_data(data_path)
    except Exception as exc:
        raise SystemExit(f"Failed to load data file '{data_path}': {exc}")

    app = create_app(data_path, dist_dir)
    print(f"[ainav] dist: {dist_dir}")
    print(f"[ainav] data: {data_path} ({len(load_data(data_path))} records)")
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
