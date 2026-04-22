"""
seed_admin.py - Seed the admin SQLite database with initial data
Run once: python3 seed_admin.py

Seeds:
  - 14 categories (from the frontend Sidebar)
  - Nav sites (from the frontend Header)
  - Calendar events (from calendar_2026.json if available)
  - A default admin user
"""
import json
from datetime import datetime
from pathlib import Path

from database import init_db, SessionLocal, Category, NavSite, User, CalendarEvent, Tool

# ── Default categories (matching Sidebar.tsx) ─────────────────────────────────
CATEGORIES = [
    {"name": "AI写作",  "icon": "✍️",  "sort_order": 1},
    {"name": "AI图像",  "icon": "🖼️",  "sort_order": 2},
    {"name": "AI视频",  "icon": "🎬",  "sort_order": 3},
    {"name": "AI办公",  "icon": "💼",  "sort_order": 4},
    {"name": "AI智能体", "icon": "🤖", "sort_order": 5},
    {"name": "AI聊天",  "icon": "💬",  "sort_order": 6},
    {"name": "AI编程",  "icon": "💻",  "sort_order": 7},
    {"name": "AI设计",  "icon": "🎨",  "sort_order": 8},
    {"name": "AI音频",  "icon": "🎵",  "sort_order": 9},
    {"name": "AI搜索",  "icon": "🔍",  "sort_order": 10},
    {"name": "AI开发",  "icon": "⚙️",  "sort_order": 11},
    {"name": "AI学习",  "icon": "📚",  "sort_order": 12},
]

# ── Default nav sites (matching Header.tsx searchTags) ────────────────────────
NAV_SITES = [
    {"name": "百度",     "icon": "🔵", "url": "https://www.baidu.com/s?wd={q}",         "sort_order": 1},
    {"name": "谷歌",     "icon": "🌐", "url": "https://www.google.com/search?q={q}",    "sort_order": 2},
    {"name": "花瓣",     "icon": "🌸", "url": "https://huaban.com/search?q={q}",        "sort_order": 3},
    {"name": "站酷",     "icon": "✏️", "url": "https://www.zcool.com.cn/search/content?word={q}", "sort_order": 4},
    {"name": "淘宝",     "icon": "🛒", "url": "https://s.taobao.com/search?q={q}",      "sort_order": 5},
    {"name": "C站",      "icon": "💻", "url": "https://so.csdn.net/so/search?q={q}",   "sort_order": 6},
    {"name": "Github",   "icon": "🐙", "url": "https://github.com/search?q={q}",       "sort_order": 7},
    {"name": "lexica",   "icon": "🖼️", "url": "https://lexica.art/?q={q}",             "sort_order": 8},
    {"name": "deviantar", "icon": "🎭", "url": "https://www.deviantart.com/search?q={q}", "sort_order": 9},
    {"name": "perplexity","icon": "🔮", "url": "https://www.perplexity.ai/search?q={q}", "sort_order": 10},
]

# ── Sample calendar events ────────────────────────────────────────────────────
SAMPLE_EVENTS = [
    {"title": "元旦", "date": "2026-01-01", "event_type": "holiday", "color": "#f5222d", "description": "新年快乐"},
    {"title": "春节", "date": "2026-02-17", "event_type": "holiday", "color": "#f5222d", "description": "农历新年"},
    {"title": "情人节", "date": "2026-02-14", "event_type": "marketing", "color": "#eb2f96", "description": "情人节营销节点"},
    {"title": "三八妇女节", "date": "2026-03-08", "event_type": "marketing", "color": "#eb2f96", "description": "女性相关产品营销"},
    {"title": "清明节", "date": "2026-04-05", "event_type": "holiday", "color": "#52c41a", "description": "清明小长假"},
    {"title": "劳动节", "date": "2026-05-01", "event_type": "holiday", "color": "#f5222d", "description": "五一劳动节假期"},
    {"title": "618电商节", "date": "2026-06-18", "event_type": "marketing", "color": "#fa8c16", "description": "京东618大促"},
    {"title": "端午节", "date": "2026-06-19", "event_type": "holiday", "color": "#f5222d", "description": "端午节假期"},
    {"title": "七夕节", "date": "2026-08-13", "event_type": "marketing", "color": "#eb2f96", "description": "七夕情人节营销"},
    {"title": "中秋节", "date": "2026-10-01", "event_type": "holiday", "color": "#fa8c16", "description": "中秋节假期"},
    {"title": "国庆节", "date": "2026-10-01", "event_type": "holiday", "color": "#f5222d", "description": "国庆节黄金周"},
    {"title": "双十一", "date": "2026-11-11", "event_type": "marketing", "color": "#fa8c16", "description": "天猫双十一大促"},
    {"title": "双十二", "date": "2026-12-12", "event_type": "marketing", "color": "#fa8c16", "description": "电商双十二大促"},
    {"title": "圣诞节", "date": "2026-12-25", "event_type": "holiday", "color": "#52c41a", "description": "圣诞节"},
    {"title": "元旦前夕", "date": "2026-12-31", "event_type": "marketing", "color": "#722ed1", "description": "跨年营销节点"},
]

# Also try loading from existing calendar JSON
def load_calendar_json():
    paths = [
        Path("calendar_2026.json"),
        Path("calendar_database.json"),
    ]
    for p in paths:
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                return data if isinstance(data, list) else []
            except Exception:
                pass
    return []


def seed():
    init_db()
    db = SessionLocal()
    try:
        # ── Categories ──────────────────────────────────────────────────────
        if db.query(Category).count() == 0:
            for c in CATEGORIES:
                db.add(Category(**c, visible=True))
            db.commit()
            print(f"✅ Seeded {len(CATEGORIES)} categories")
        else:
            print("⏭  Categories already seeded")

        # ── Nav Sites ───────────────────────────────────────────────────────
        if db.query(NavSite).count() == 0:
            for s in NAV_SITES:
                db.add(NavSite(**s, visible=True))
            db.commit()
            print(f"✅ Seeded {len(NAV_SITES)} nav sites")
        else:
            print("⏭  Nav sites already seeded")

        # ── Calendar Events ─────────────────────────────────────────────────
        if db.query(CalendarEvent).count() == 0:
            # Try loading from JSON file first
            json_events = load_calendar_json()
            if json_events:
                count = 0
                for ev in json_events[:200]:  # limit to 200
                    date = ev.get("date") or ev.get("Date") or ""
                    title = ev.get("name") or ev.get("title") or ev.get("Name") or ""
                    if date and title:
                        db.add(CalendarEvent(
                            title=title,
                            date=date[:10],
                            description=ev.get("description") or ev.get("desc") or "",
                            event_type=ev.get("type") or "holiday",
                            color=ev.get("color") or "#f5222d",
                        ))
                        count += 1
                db.commit()
                print(f"✅ Seeded {count} calendar events from JSON")
            else:
                for ev in SAMPLE_EVENTS:
                    db.add(CalendarEvent(**ev))
                db.commit()
                print(f"✅ Seeded {len(SAMPLE_EVENTS)} sample calendar events")
        else:
            print("⏭  Calendar events already seeded")

        # ── Default admin user ───────────────────────────────────────────────
        from database import User
        if db.query(User).count() == 0:
            db.add(User(username="admin", email="admin@ai-nav.com",
                       role="admin", status="active",
                       password_hash="change_me_in_production"))
            db.commit()
            print("✅ Seeded default admin user (admin@ai-nav.com)")
        else:
            print("⏭  Users already seeded")

        print("\n🎉 Database seed complete! Admin DB: admin.db")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
