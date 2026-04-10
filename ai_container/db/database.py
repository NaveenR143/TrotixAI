# api/database.py
# Async PostgreSQL connection via SQLAlchemy + asyncpg
# Install: pip install sqlalchemy[asyncio] asyncpg

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
import os

# ── Connection URL ─────────────────────────────────────────────────────────────
# Set this in your .env or environment:
#   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/trotixai
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:sa123@localhost:5432/trotixai"
)

# ── Engine ─────────────────────────────────────────────────────────────────────
# Configuration optimized for concurrent multithreaded async operations
# Use NullPool to avoid "attached to a different loop" errors in multi-threaded asyncio usage
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # set True to log all SQL
    poolclass=NullPool,  # Critical for multi-threaded asyncio.run() usage
    pool_pre_ping=True,  # Test connections before using (reconnect if stale)
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_reset_on_return="rollback",  # Reset connection state on return
    connect_args={
        "timeout": 30,
        "command_timeout": 30,
        "server_settings": {"application_name": "trotixai_app"},
    }
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
