"""
database.py - SQLAlchemy models and DB initialization for Admin API
"""
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Boolean, Text,
    DateTime, Float, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./admin.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Models ──────────────────────────────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(64), unique=True, nullable=False)
    icon       = Column(String(16), default="📁")        # emoji or icon key
    sort_order = Column(Integer, default=0)
    visible    = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tools      = relationship("Tool", back_populates="category_rel", lazy="dynamic")


class Tool(Base):
    __tablename__ = "tools"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(128), nullable=False)
    logo            = Column(Text, default="")
    url             = Column(Text, default="")
    emoji           = Column(String(8), default="🤖")
    description     = Column(Text, default="")
    tags            = Column(Text, default="[]")     # JSON array stored as text
    category_id     = Column(Integer, ForeignKey("categories.id"), nullable=True)
    sort_order      = Column(Integer, default=0)
    visible         = Column(Boolean, default=True)
    upvotes         = Column(Integer, default=0)
    long_description = Column(Text, default="")
    usage_tips      = Column(Text, default="")
    product_intro   = Column(Text, default="")
    awards          = Column(Text, default="")
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    category_rel    = relationship("Category", back_populates="tools")


class NavSite(Base):
    __tablename__ = "nav_sites"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(64), nullable=False)
    icon       = Column(String(128), default="")
    url        = Column(Text, default="")
    sort_order = Column(Integer, default=0)
    visible    = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Submission(Base):
    __tablename__ = "submissions"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(128), nullable=False)
    url          = Column(Text, default="")
    description  = Column(Text, default="")
    category     = Column(String(64), default="")
    contact_email = Column(String(128), default="")
    status       = Column(String(16), default="pending")  # pending/approved/rejected
    review_note  = Column(Text, default="")
    created_at   = Column(DateTime, default=datetime.utcnow)
    reviewed_at  = Column(DateTime, nullable=True)


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(64), unique=True, nullable=False)
    email         = Column(String(128), unique=True, nullable=False)
    role          = Column(String(16), default="user")   # admin/user
    status        = Column(String(16), default="active") # active/banned
    password_hash = Column(String(256), default="")
    created_at    = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)


class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(128), nullable=False)
    date        = Column(String(10), nullable=False)    # YYYY-MM-DD
    description = Column(Text, default="")
    event_type  = Column(String(32), default="holiday") # holiday/marketing/custom
    color       = Column(String(16), default="#22c65e")
    created_at  = Column(DateTime, default=datetime.utcnow)


class BusinessInquiry(Base):
    __tablename__ = "business_inquiries"
    id           = Column(Integer, primary_key=True, index=True)
    company      = Column(String(128), default="")
    contact_name = Column(String(64), default="")
    email        = Column(String(128), nullable=False)
    phone        = Column(String(32), default="")
    coop_type    = Column(String(32), default="广告合作") # 广告合作/内容合作/API合作/其他
    message      = Column(Text, default="")
    status       = Column(String(16), default="pending") # pending/processing/done
    created_at   = Column(DateTime, default=datetime.utcnow)


class ToolClick(Base):
    """Records one click per tool per IP per day for hot ranking."""
    __tablename__ = "tool_clicks"
    id         = Column(Integer, primary_key=True, index=True)
    tool_id    = Column(Integer, index=True, nullable=False)       # references allTools id from frontend
    tool_name  = Column(String(128), default="")
    category   = Column(String(64), default="", index=True)        # category name e.g. "AI写作"
    ip_address = Column(String(64), default="")
    click_date = Column(String(10), nullable=False, index=True)    # YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)


class RecommendedTool(Base):
    __tablename__ = "recommended_tools"
    id         = Column(Integer, primary_key=True, index=True)
    tool_id    = Column(Integer, ForeignKey("tools.id"), nullable=True)
    sort_order = Column(Integer, default=0)
    visible    = Column(Boolean, default=True)
    tool       = relationship("Tool")


def init_db():
    Base.metadata.create_all(bind=engine)
