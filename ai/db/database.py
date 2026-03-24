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
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/trotixai"
)

# ── Engine ─────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # set True to log all SQL
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # reconnect on stale connections
)

# ── Session factory ────────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base class for all ORM models ─────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency — use in FastAPI route with Depends(get_db) ───────────────────
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
