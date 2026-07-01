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
    "DATABASE_URL"
)

from sqlalchemy.pool import NullPool

# ── Engine ─────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    # ✅ Stability across multiple event loops (Workers)
    # Using NullPool prevents connections from being shared between different loops
    poolclass=NullPool,
    # ✅ Stability + Performance
    future=True,
    connect_args={
        "timeout": 30,
        "command_timeout": 30,
        "server_settings": {"application_name": "rightnxtai_container"},
    },
)

# ── Session factory ────────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    # ✅ IMPORTANT SETTINGS
    expire_on_commit=False,
    autoflush=False,  # ✅ prevents unexpected flush
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
