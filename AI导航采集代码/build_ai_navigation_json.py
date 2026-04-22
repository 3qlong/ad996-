#!/usr/bin/env python3
"""从 ai_bot_tools.jsonl 生成 api_server 使用的 ai_navigation.json（字段对齐 ToolItem）。"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "ai_bot_tools.jsonl"
OUT = ROOT / "ai_navigation.json"


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"缺少源文件: {SRC}")
    records = []
    with SRC.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            d = json.loads(line)
            cat = d.get("category") or "其他"
            records.append(
                {
                    "category": cat,
                    "original_category": d.get("category"),
                    "name": d.get("name", ""),
                    "description": d.get("description", ""),
                    "url": d.get("url", ""),
                    "icon": d.get("icon_url") or d.get("icon") or "",
                    "source": d.get("source") or "ai-bot.cn",
                }
            )
    OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"写入 {len(records)} 条 -> {OUT}")


if __name__ == "__main__":
    main()
