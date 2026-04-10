# api/database.py
# Async PostgreSQL connection via SQLAlchemy + asyncpg
# Install: pip install sqlalchemy[asyncio] asyncpg

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os

# ── Connection URL ─────────────────────────────────────────────────────────────
# Set this in your .env or environment:
#   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/trotixai
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:sa123@localhost:5432/trotixai"
)

# ── Engine ─────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=False,

    # ✅ Connection Pool
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,

    # ✅ Stability + Performance
    future=True,

    connect_args={
        "timeout": 30,
        "command_timeout": 30,
        "server_settings": {
            "application_name": "trotixai_app"
        },
    },
)

# ── Session factory ────────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,

    # ✅ IMPORTANT SETTINGS
    expire_on_commit=False,
    autoflush=False,   # ✅ prevents unexpected flush
)

# ── Base class ────────────────────────────────────────────────────────────────


class Base(DeclarativeBase):
    pass

# ── FastAPI Dependency ────────────────────────────────────────────────────────


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
