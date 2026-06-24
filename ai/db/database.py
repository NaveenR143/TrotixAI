# api/database.py
# Async PostgreSQL connection via SQLAlchemy + asyncpg

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
import asyncio
import os

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:", DATABASE_URL)

# ── Engine ─────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# ── Session factory ────────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ── Base class for all ORM models ──────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Database Connection Test ───────────────────────────────────────────────────
async def test_db_connection():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            print("Test query result:", result.scalar())
        return True
    except Exception as e:
        print("❌ Database connection failed")
        print("Error:", str(e))
        return False


# ── Dependency — use in FastAPI route with Depends(get_db) ────────────────────
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
