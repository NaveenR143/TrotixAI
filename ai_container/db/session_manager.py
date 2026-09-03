import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from .database import DATABASE_URL

logger = logging.getLogger(__name__)


class DatabaseSessionManager:
    """
    Manages async DB sessions safely for long-running workers.
    Utilizes per-event-loop connection pooling for high availability and performance.
    """

    def __init__(self):
        self._engines = {}
        self._session_factories = {}

    def _get_current_loop(self):
        try:
            return asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.get_event_loop()

    def get_engine_and_factory(self):
        loop = self._get_current_loop()
        loop_id = id(loop)

        if loop_id not in self._engines:
            logger.info(f"Creating new AsyncEngine with connection pool for loop {loop_id}")
            engine = create_async_engine(
                DATABASE_URL,
                echo=False,
                pool_size=5,
                max_overflow=10,
                pool_recycle=1800,
                pool_pre_ping=True,
                future=True,
                connect_args={
                    "timeout": 30,
                    "command_timeout": 30,
                    "server_settings": {"application_name": f"trotixai_worker_{loop_id}"},
                },
            )
            session_factory = async_sessionmaker(
                bind=engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=False,
            )
            self._engines[loop_id] = engine
            self._session_factories[loop_id] = session_factory

        return self._engines[loop_id], self._session_factories[loop_id]

    async def init(self) -> None:
        """
        Test DB connectivity at startup.
        """
        try:
            engine, _ = self.get_engine_and_factory()
            async with engine.begin() as conn:
                await conn.run_sync(lambda conn: None)
            logger.info("✅ Database connection initialized")
        except Exception as e:
            logger.exception(f"❌ DB init failed: {e}")
            raise

    async def close(self) -> None:
        """
        Dispose all managed engines safely.
        """
        for loop_id, engine in list(self._engines.items()):
            try:
                await engine.dispose()
                logger.info(f"🧹 Database engine disposed for loop {loop_id}")
            except Exception as e:
                logger.warning(f"⚠️ Engine disposal warning: {e}")
        self._engines.clear()
        self._session_factories.clear()

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Provides a transactional session.
        - Auto commit on success
        - Auto rollback on failure
        """
        _, session_factory = self.get_engine_and_factory()
        session: AsyncSession = session_factory()

        try:
            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise

        finally:
            await session.close()


# ✅ Singleton instance
db_session_manager = DatabaseSessionManager()