"""
admin_api.py - Full CRUD Admin API for AI Navigation Platform
Run: python3 admin_api.py
Port: 8001
"""
import json
from datetime import datetime
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uvicorn

from fastapi import Request
from sqlalchemy import func

from database import (
    init_db, get_db,
    Category, Tool, NavSite, Submission, User,
    CalendarEvent, BusinessInquiry, RecommendedTool, ToolClick,
)

# ── App Init ──────────────────────────────────────────────────────────────────
app = FastAPI(title="AI导航 管理后台 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded icons
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def startup():
    init_db()


# ── Root Page ────────────────────────────────────────────────────────────────
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def root_page():
    return """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI导航 管理后台 API</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
         color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .container { text-align: center; max-width: 600px; padding: 40px; }
  .logo { font-size: 48px; margin-bottom: 16px; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; color: #f1f5f9; }
  .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
  .status { display: inline-flex; align-items: center; gap: 8px;
            background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3);
            padding: 6px 16px; border-radius: 20px; font-size: 13px; color: #4ade80; margin-bottom: 32px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .links { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  a { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px;
      text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s; }
  .primary { background: #3b82f6; color: #fff; }
  .primary:hover { background: #2563eb; }
  .secondary { background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); }
  .secondary:hover { background: rgba(255,255,255,0.15); }
  .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 32px; }
  .stat { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 16px; }
  .stat-value { font-size: 24px; font-weight: 700; color: #f1f5f9; }
  .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">🚀</div>
  <h1>AI导航 管理后台 API</h1>
  <p class="subtitle">FastAPI + SQLAlchemy + SQLite · v1.0.0</p>
  <div class="status"><span class="dot"></span> 服务运行中 · 端口 8001</div>
  <div class="links">
    <a href="/docs" class="primary">📖 API 文档 (Swagger)</a>
    <a href="/redoc" class="secondary">📋 ReDoc 文档</a>
    <a href="/admin/dashboard" class="secondary">📊 Dashboard API</a>
    <a href="/openapi.json" class="secondary">{ } OpenAPI JSON</a>
  </div>
  <div class="stats" id="stats"></div>
</div>
<script>
fetch('/admin/dashboard').then(r=>r.json()).then(d=>{
  document.getElementById('stats').innerHTML=
    '<div class="stat"><div class="stat-value">'+d.total_categories+'</div><div class="stat-label">分类数</div></div>'+
    '<div class="stat"><div class="stat-value">'+d.total_nav_sites+'</div><div class="stat-label">导航站点</div></div>'+
    '<div class="stat"><div class="stat-value">'+d.total_calendar_events+'</div><div class="stat-label">日历事件</div></div>';
}).catch(()=>{});
</script>
</body>
</html>"""


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class CategoryIn(BaseModel):
    name: str
    icon: Optional[str] = "📁"
    sort_order: Optional[int] = 0
    visible: Optional[bool] = True

class CategoryOut(BaseModel):
    id: int
    name: str
    icon: str
    sort_order: int
    visible: bool
    tool_count: int = 0
    class Config: from_attributes = True

class ToolIn(BaseModel):
    name: str
    logo: Optional[str] = ""
    url: Optional[str] = ""
    emoji: Optional[str] = "🤖"
    description: Optional[str] = ""
    tags: Optional[List[str]] = []
    category_id: Optional[int] = None
    sort_order: Optional[int] = 0
    visible: Optional[bool] = True
    upvotes: Optional[int] = 0
    long_description: Optional[str] = ""
    usage_tips: Optional[str] = ""
    product_intro: Optional[str] = ""
    awards: Optional[str] = ""

class ToolOut(BaseModel):
    id: int
    name: str
    logo: str
    url: str
    emoji: str
    description: str
    tags: List[str]
    category_id: Optional[int]
    category_name: Optional[str] = None
    sort_order: int
    visible: bool
    upvotes: int
    long_description: str
    usage_tips: str
    product_intro: str
    awards: str
    class Config: from_attributes = True

class NavSiteIn(BaseModel):
    name: str
    icon: Optional[str] = ""
    url: Optional[str] = ""
    sort_order: Optional[int] = 0
    visible: Optional[bool] = True

class NavSiteOut(BaseModel):
    id: int
    name: str
    icon: str
    url: str
    sort_order: int
    visible: bool
    class Config: from_attributes = True

class SubmissionIn(BaseModel):
    name: str
    url: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = ""
    contact_email: Optional[str] = ""

class SubmissionReview(BaseModel):
    status: str   # approved / rejected
    review_note: Optional[str] = ""

class SubmissionOut(BaseModel):
    id: int
    name: str
    url: str
    description: str
    category: str
    contact_email: str
    status: str
    review_note: str
    created_at: datetime
    reviewed_at: Optional[datetime]
    class Config: from_attributes = True

class UserIn(BaseModel):
    username: str
    email: str
    role: Optional[str] = "user"
    status: Optional[str] = "active"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    status: str
    created_at: datetime
    last_login_at: Optional[datetime]
    class Config: from_attributes = True

class CalendarEventIn(BaseModel):
    title: str
    date: str      # YYYY-MM-DD
    description: Optional[str] = ""
    event_type: Optional[str] = "holiday"
    color: Optional[str] = "#22c65e"

class CalendarEventOut(BaseModel):
    id: int
    title: str
    date: str
    description: str
    event_type: str
    color: str
    created_at: datetime
    class Config: from_attributes = True

class BusinessInquiryOut(BaseModel):
    id: int
    company: str
    contact_name: str
    email: str
    phone: str
    coop_type: str
    message: str
    status: str
    created_at: datetime
    class Config: from_attributes = True

class BusinessInquiryIn(BaseModel):
    company: Optional[str] = ""
    contact_name: Optional[str] = ""
    email: str
    phone: Optional[str] = ""
    coop_type: Optional[str] = "广告合作"
    message: Optional[str] = ""

class SortOrderItem(BaseModel):
    id: int
    sort_order: int

class BatchDelete(BaseModel):
    ids: List[int]

class BatchMove(BaseModel):
    ids: List[int]
    category_id: int

class RecommendedToolIn(BaseModel):
    tool_id: int
    sort_order: Optional[int] = 0
    visible: Optional[bool] = True

class RecommendedToolOut(BaseModel):
    id: int
    tool_id: Optional[int]
    sort_order: int
    visible: bool
    tool_name: Optional[str] = None
    tool_logo: Optional[str] = None
    class Config: from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_tags(tags_str: str) -> List[str]:
    try:
        return json.loads(tags_str)
    except Exception:
        return []

def tool_to_out(t: Tool) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "logo": t.logo or "",
        "url": t.url or "",
        "emoji": t.emoji or "🤖",
        "description": t.description or "",
        "tags": parse_tags(t.tags or "[]"),
        "category_id": t.category_id,
        "category_name": t.category_rel.name if t.category_rel else None,
        "sort_order": t.sort_order,
        "visible": t.visible,
        "upvotes": t.upvotes,
        "long_description": t.long_description or "",
        "usage_tips": t.usage_tips or "",
        "product_intro": t.product_intro or "",
        "awards": t.awards or "",
    }

def category_to_out(c: Category, db: Session) -> dict:
    count = db.query(Tool).filter(Tool.category_id == c.id).count()
    return {
        "id": c.id,
        "name": c.name,
        "icon": c.icon or "📁",
        "sort_order": c.sort_order,
        "visible": c.visible,
        "tool_count": count,
    }


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/admin/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return {
        "total_tools": db.query(Tool).count(),
        "total_categories": db.query(Category).count(),
        "total_nav_sites": db.query(NavSite).count(),
        "total_users": db.query(User).count(),
        "pending_submissions": db.query(Submission).filter(Submission.status == "pending").count(),
        "pending_inquiries": db.query(BusinessInquiry).filter(BusinessInquiry.status == "pending").count(),
        "total_calendar_events": db.query(CalendarEvent).count(),
        "recent_submissions": [
            {"id": s.id, "name": s.name, "url": s.url, "status": s.status,
             "created_at": s.created_at.isoformat()}
            for s in db.query(Submission).order_by(Submission.created_at.desc()).limit(5).all()
        ],
        "top_tools": [
            {"id": t.id, "name": t.name, "upvotes": t.upvotes, "logo": t.logo}
            for t in db.query(Tool).order_by(Tool.upvotes.desc()).limit(5).all()
        ],
    }


# ── Categories ────────────────────────────────────────────────────────────────

@app.get("/admin/categories", response_model=List[dict])
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.sort_order).all()
    return [category_to_out(c, db) for c in cats]

@app.post("/admin/categories", response_model=dict)
def create_category(data: CategoryIn, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(400, f"分类「{data.name}」已存在")
    obj = Category(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return category_to_out(obj, db)

@app.get("/admin/categories/{cid}", response_model=dict)
def get_category(cid: int, db: Session = Depends(get_db)):
    obj = db.query(Category).filter(Category.id == cid).first()
    if not obj:
        raise HTTPException(404, "分类不存在")
    return category_to_out(obj, db)

@app.put("/admin/categories/{cid}", response_model=dict)
def update_category(cid: int, data: CategoryIn, db: Session = Depends(get_db)):
    obj = db.query(Category).filter(Category.id == cid).first()
    if not obj:
        raise HTTPException(404, "分类不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return category_to_out(obj, db)

@app.delete("/admin/categories/{cid}")
def delete_category(cid: int, db: Session = Depends(get_db)):
    obj = db.query(Category).filter(Category.id == cid).first()
    if not obj:
        raise HTTPException(404, "分类不存在")
    count = db.query(Tool).filter(Tool.category_id == cid).count()
    if count > 0:
        raise HTTPException(400, f"该分类下有 {count} 个工具，请先移除或删除关联工具")
    db.delete(obj)
    db.commit()
    return {"ok": True}

@app.patch("/admin/categories/sort")
def update_category_sort(items: List[SortOrderItem], db: Session = Depends(get_db)):
    for item in items:
        db.query(Category).filter(Category.id == item.id).update({"sort_order": item.sort_order})
    db.commit()
    return {"ok": True}


# ── Tools ─────────────────────────────────────────────────────────────────────

@app.get("/admin/tools", response_model=List[dict])
def list_tools(
    category_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
    visible: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Tool)
    if category_id is not None:
        query = query.filter(Tool.category_id == category_id)
    if q:
        query = query.filter(Tool.name.contains(q))
    if visible is not None:
        query = query.filter(Tool.visible == visible)
    total = query.count()
    tools = query.order_by(Tool.sort_order, Tool.id).offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "items": [tool_to_out(t) for t in tools], "page": page, "page_size": page_size}

@app.post("/admin/tools", response_model=dict)
def create_tool(data: ToolIn, db: Session = Depends(get_db)):
    payload = data.model_dump()
    payload["tags"] = json.dumps(payload.get("tags") or [], ensure_ascii=False)
    obj = Tool(**payload)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return tool_to_out(obj)

@app.get("/admin/tools/{tid}", response_model=dict)
def get_tool(tid: int, db: Session = Depends(get_db)):
    obj = db.query(Tool).filter(Tool.id == tid).first()
    if not obj:
        raise HTTPException(404, "工具不存在")
    return tool_to_out(obj)

@app.put("/admin/tools/{tid}", response_model=dict)
def update_tool(tid: int, data: ToolIn, db: Session = Depends(get_db)):
    obj = db.query(Tool).filter(Tool.id == tid).first()
    if not obj:
        raise HTTPException(404, "工具不存在")
    payload = data.model_dump(exclude_unset=True)
    if "tags" in payload:
        payload["tags"] = json.dumps(payload["tags"], ensure_ascii=False)
    for k, v in payload.items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return tool_to_out(obj)

@app.delete("/admin/tools/{tid}")
def delete_tool(tid: int, db: Session = Depends(get_db)):
    obj = db.query(Tool).filter(Tool.id == tid).first()
    if not obj:
        raise HTTPException(404, "工具不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}

@app.patch("/admin/tools/sort")
def update_tool_sort(items: List[SortOrderItem], db: Session = Depends(get_db)):
    for item in items:
        db.query(Tool).filter(Tool.id == item.id).update({"sort_order": item.sort_order})
    db.commit()
    return {"ok": True}

@app.post("/admin/tools/batch-delete")
def batch_delete_tools(data: BatchDelete, db: Session = Depends(get_db)):
    db.query(Tool).filter(Tool.id.in_(data.ids)).delete(synchronize_session=False)
    db.commit()
    return {"ok": True, "deleted": len(data.ids)}

@app.post("/admin/tools/batch-move")
def batch_move_tools(data: BatchMove, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == data.category_id).first()
    if not cat:
        raise HTTPException(404, "目标分类不存在")
    db.query(Tool).filter(Tool.id.in_(data.ids)).update(
        {"category_id": data.category_id}, synchronize_session=False
    )
    db.commit()
    return {"ok": True, "moved": len(data.ids)}


# ── NavSites ──────────────────────────────────────────────────────────────────

@app.get("/admin/nav-sites", response_model=List[dict])
def list_nav_sites(db: Session = Depends(get_db)):
    sites = db.query(NavSite).order_by(NavSite.sort_order).all()
    return [{"id": s.id, "name": s.name, "icon": s.icon, "url": s.url,
             "sort_order": s.sort_order, "visible": s.visible} for s in sites]

@app.post("/admin/nav-sites", response_model=dict)
def create_nav_site(data: NavSiteIn, db: Session = Depends(get_db)):
    obj = NavSite(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id, "name": obj.name, "icon": obj.icon, "url": obj.url,
            "sort_order": obj.sort_order, "visible": obj.visible}

@app.put("/admin/nav-sites/{sid}", response_model=dict)
def update_nav_site(sid: int, data: NavSiteIn, db: Session = Depends(get_db)):
    obj = db.query(NavSite).filter(NavSite.id == sid).first()
    if not obj:
        raise HTTPException(404, "站点不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id, "name": obj.name, "icon": obj.icon, "url": obj.url,
            "sort_order": obj.sort_order, "visible": obj.visible}

@app.delete("/admin/nav-sites/{sid}")
def delete_nav_site(sid: int, db: Session = Depends(get_db)):
    obj = db.query(NavSite).filter(NavSite.id == sid).first()
    if not obj:
        raise HTTPException(404, "站点不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}

@app.patch("/admin/nav-sites/sort")
def update_nav_site_sort(items: List[SortOrderItem], db: Session = Depends(get_db)):
    for item in items:
        db.query(NavSite).filter(NavSite.id == item.id).update({"sort_order": item.sort_order})
    db.commit()
    return {"ok": True}


# ── Submissions ───────────────────────────────────────────────────────────────

@app.get("/admin/submissions")
def list_submissions(
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20),
    db: Session = Depends(get_db),
):
    query = db.query(Submission)
    if status:
        query = query.filter(Submission.status == status)
    if q:
        query = query.filter(Submission.name.contains(q) | Submission.url.contains(q))
    total = query.count()
    items = query.order_by(Submission.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "items": [{
            "id": s.id, "name": s.name, "url": s.url, "description": s.description,
            "category": s.category, "contact_email": s.contact_email, "status": s.status,
            "review_note": s.review_note,
            "created_at": s.created_at.isoformat(),
            "reviewed_at": s.reviewed_at.isoformat() if s.reviewed_at else None,
        } for s in items],
    }

@app.post("/admin/submissions")
def create_submission(data: SubmissionIn, db: Session = Depends(get_db)):
    obj = Submission(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id, "status": obj.status}

@app.patch("/admin/submissions/{sid}/review")
def review_submission(sid: int, data: SubmissionReview, db: Session = Depends(get_db)):
    obj = db.query(Submission).filter(Submission.id == sid).first()
    if not obj:
        raise HTTPException(404, "申请不存在")
    obj.status = data.status
    obj.review_note = data.review_note or ""
    obj.reviewed_at = datetime.utcnow()
    db.commit()
    return {"ok": True, "status": obj.status}

@app.delete("/admin/submissions/{sid}")
def delete_submission(sid: int, db: Session = Depends(get_db)):
    obj = db.query(Submission).filter(Submission.id == sid).first()
    if not obj:
        raise HTTPException(404, "申请不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ── Users ─────────────────────────────────────────────────────────────────────

@app.get("/admin/users")
def list_users(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if q:
        query = query.filter(User.username.contains(q) | User.email.contains(q))
    total = query.count()
    items = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "items": [{
            "id": u.id, "username": u.username, "email": u.email, "role": u.role,
            "status": u.status, "created_at": u.created_at.isoformat(),
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        } for u in items],
    }

@app.post("/admin/users")
def create_user(data: UserIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "邮箱已存在")
    obj = User(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id}

@app.put("/admin/users/{uid}")
def update_user(uid: int, data: UserIn, db: Session = Depends(get_db)):
    obj = db.query(User).filter(User.id == uid).first()
    if not obj:
        raise HTTPException(404, "用户不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    return {"ok": True}

@app.delete("/admin/users/{uid}")
def delete_user(uid: int, db: Session = Depends(get_db)):
    obj = db.query(User).filter(User.id == uid).first()
    if not obj:
        raise HTTPException(404, "用户不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ── Calendar Events ───────────────────────────────────────────────────────────

@app.get("/admin/calendar-events")
def list_calendar_events(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    event_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(CalendarEvent)
    if year:
        query = query.filter(CalendarEvent.date.startswith(str(year)))
    if month:
        prefix = f"{year or '%'}-{str(month).zfill(2)}"
        query = query.filter(CalendarEvent.date.startswith(prefix if year else f"%-{str(month).zfill(2)}"))
    if event_type:
        query = query.filter(CalendarEvent.event_type == event_type)
    items = query.order_by(CalendarEvent.date).all()
    return [{
        "id": e.id, "title": e.title, "date": e.date, "description": e.description,
        "event_type": e.event_type, "color": e.color,
        "created_at": e.created_at.isoformat(),
    } for e in items]

@app.post("/admin/calendar-events")
def create_calendar_event(data: CalendarEventIn, db: Session = Depends(get_db)):
    obj = CalendarEvent(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id}

@app.put("/admin/calendar-events/{eid}")
def update_calendar_event(eid: int, data: CalendarEventIn, db: Session = Depends(get_db)):
    obj = db.query(CalendarEvent).filter(CalendarEvent.id == eid).first()
    if not obj:
        raise HTTPException(404, "事件不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    return {"ok": True}

@app.delete("/admin/calendar-events/{eid}")
def delete_calendar_event(eid: int, db: Session = Depends(get_db)):
    obj = db.query(CalendarEvent).filter(CalendarEvent.id == eid).first()
    if not obj:
        raise HTTPException(404, "事件不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ── Business Inquiries ────────────────────────────────────────────────────────

@app.get("/admin/business-inquiries")
def list_business_inquiries(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20),
    db: Session = Depends(get_db),
):
    query = db.query(BusinessInquiry)
    if status:
        query = query.filter(BusinessInquiry.status == status)
    total = query.count()
    items = query.order_by(BusinessInquiry.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "items": [{
            "id": i.id, "company": i.company, "contact_name": i.contact_name,
            "email": i.email, "phone": i.phone, "coop_type": i.coop_type,
            "message": i.message, "status": i.status,
            "created_at": i.created_at.isoformat(),
        } for i in items],
    }

@app.post("/admin/business-inquiries")
def create_business_inquiry(data: BusinessInquiryIn, db: Session = Depends(get_db)):
    obj = BusinessInquiry(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id}

@app.patch("/admin/business-inquiries/{iid}/status")
def update_inquiry_status(iid: int, status: str = Query(...), db: Session = Depends(get_db)):
    obj = db.query(BusinessInquiry).filter(BusinessInquiry.id == iid).first()
    if not obj:
        raise HTTPException(404, "记录不存在")
    obj.status = status
    db.commit()
    return {"ok": True}

@app.delete("/admin/business-inquiries/{iid}")
def delete_inquiry(iid: int, db: Session = Depends(get_db)):
    obj = db.query(BusinessInquiry).filter(BusinessInquiry.id == iid).first()
    if not obj:
        raise HTTPException(404, "记录不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ── Recommended Tools ─────────────────────────────────────────────────────────

@app.get("/admin/recommended-tools")
def list_recommended_tools(db: Session = Depends(get_db)):
    items = db.query(RecommendedTool).order_by(RecommendedTool.sort_order).all()
    return [{
        "id": r.id,
        "tool_id": r.tool_id,
        "sort_order": r.sort_order,
        "visible": r.visible,
        "tool_name": r.tool.name if r.tool else None,
        "tool_logo": r.tool.logo if r.tool else None,
        "tool_url": r.tool.url if r.tool else None,
    } for r in items]

@app.post("/admin/recommended-tools")
def add_recommended_tool(data: RecommendedToolIn, db: Session = Depends(get_db)):
    if db.query(RecommendedTool).filter(RecommendedTool.tool_id == data.tool_id).first():
        raise HTTPException(400, "该工具已在推荐列表中")
    obj = RecommendedTool(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return {"id": obj.id}

@app.put("/admin/recommended-tools/{rid}")
def update_recommended_tool(rid: int, data: RecommendedToolIn, db: Session = Depends(get_db)):
    obj = db.query(RecommendedTool).filter(RecommendedTool.id == rid).first()
    if not obj:
        raise HTTPException(404, "不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    return {"ok": True}

@app.delete("/admin/recommended-tools/{rid}")
def remove_recommended_tool(rid: int, db: Session = Depends(get_db)):
    obj = db.query(RecommendedTool).filter(RecommendedTool.id == rid).first()
    if not obj:
        raise HTTPException(404, "不存在")
    db.delete(obj)
    db.commit()
    return {"ok": True}

@app.patch("/admin/recommended-tools/sort")
def update_recommended_sort(items: List[SortOrderItem], db: Session = Depends(get_db)):
    for item in items:
        db.query(RecommendedTool).filter(RecommendedTool.id == item.id).update(
            {"sort_order": item.sort_order}
        )
    db.commit()
    return {"ok": True}


# ── File Upload ───────────────────────────────────────────────────────────────

@app.post("/admin/upload")
async def upload_file(file: UploadFile = File(...)):
    import uuid
    suffix = Path(file.filename).suffix if file.filename else ".png"
    fname = f"{uuid.uuid4().hex}{suffix}"
    dest = UPLOAD_DIR / fname
    content = await file.read()
    dest.write_bytes(content)
    return {"url": f"/uploads/{fname}"}


# ── Public API: Click Tracking & Hot Ranking ──────────────────────────────────
# These endpoints are used by the frontend (no /admin prefix so they're public)

class ClickPayload(BaseModel):
    tool_id: int
    tool_name: str = ""
    category: str = ""

@app.post("/api/click")
def record_click(data: ClickPayload, request: Request, db: Session = Depends(get_db)):
    """Record a tool click. Deduplicates by tool_id + IP + date."""
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    ip = ip.split(",")[0].strip()
    today = datetime.utcnow().strftime("%Y-%m-%d")

    existing = db.query(ToolClick).filter(
        ToolClick.tool_id == data.tool_id,
        ToolClick.ip_address == ip,
        ToolClick.click_date == today,
    ).first()

    if existing:
        return {"ok": True, "new": False}

    db.add(ToolClick(
        tool_id=data.tool_id,
        tool_name=data.tool_name,
        category=data.category,
        ip_address=ip,
        click_date=today,
    ))
    db.commit()
    return {"ok": True, "new": True}


@app.get("/api/hot-tools")
def get_hot_tools(
    category: Optional[str] = Query(None, description="分类名称，如 AI写作"),
    days: int = Query(7, description="统计最近N天，默认7"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get hot tool rankings by click count, optionally filtered by category.
    Each IP only counts once per tool per day.
    """
    from datetime import timedelta
    cutoff = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")

    query = db.query(
        ToolClick.tool_id,
        ToolClick.tool_name,
        ToolClick.category,
        func.count(ToolClick.id).label("clicks"),
    ).filter(
        ToolClick.click_date >= cutoff,
    ).group_by(
        ToolClick.tool_id,
    ).order_by(
        func.count(ToolClick.id).desc(),
    )

    if category:
        query = query.filter(ToolClick.category == category)

    results = query.limit(limit).all()

    return {
        "category": category or "全部",
        "days": days,
        "items": [
            {
                "tool_id": r.tool_id,
                "tool_name": r.tool_name,
                "category": r.category,
                "clicks": r.clicks,
                "rank": idx + 1,
            }
            for idx, r in enumerate(results)
        ],
    }


@app.get("/api/hot-categories")
def get_hot_categories(
    days: int = Query(7),
    db: Session = Depends(get_db),
):
    """Get click counts grouped by category for the last N days."""
    from datetime import timedelta
    cutoff = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")

    results = db.query(
        ToolClick.category,
        func.count(ToolClick.id).label("clicks"),
    ).filter(
        ToolClick.click_date >= cutoff,
    ).group_by(
        ToolClick.category,
    ).order_by(
        func.count(ToolClick.id).desc(),
    ).all()

    return [{"category": r.category, "clicks": r.clicks} for r in results]


if __name__ == "__main__":
    uvicorn.run("admin_api:app", host="127.0.0.1", port=8001, reload=True)
