from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from .database import AsyncSessionLocal, engine

logger = logging.getLogger(__name__)


class DatabaseSessionManager:
    """
    Manages async DB sessions safely for long-running workers.
    """

    def __init__(self):
        self._session_factory = AsyncSessionLocal
        self._engine = engine

    async def init(self) -> None:
        """
        Optional: test DB connectivity at startup.
        """
        try:
            async with self._engine.begin() as conn:
                await conn.run_sync(lambda conn: None)
            logger.info("✅ Database connection initialized")
        except Exception as e:
            logger.exception(f"❌ DB init failed: {e}")
            raise

    async def close(self) -> None:
        """
        Dispose engine safely.
        """
        if self._engine:
            try:
                await self._engine.dispose()
                logger.info("🧹 Database engine disposed")
            except Exception as e:
                logger.warning(f"⚠️ Engine disposal warning: {e}")
            finally:
                self._engine = None
                self._session_factory = None

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Provides a transactional session.
        - Auto commit on success
        - Auto rollback on failure
        """

        if self._session_factory is None:
            raise RuntimeError("❌ DB Session Manager not initialized")

        session: AsyncSession = self._session_factory()

        try:
            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise

        finally:
            # ✅ Important: close AFTER commit/rollback
            await session.close()


# ✅ Singleton instance
db_session_manager = DatabaseSessionManager()