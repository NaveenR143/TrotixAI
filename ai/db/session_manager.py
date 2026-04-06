from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession
from ai.db.database import AsyncSessionLocal, engine

class DatabaseSessionManager:
    """
    Service for managing database sessions and connections.
    Wraps the SQLAlchemy async engine and session factory.
    """
    
    def __init__(self):
        self._session_factory = AsyncSessionLocal
        self._engine = engine

    async def init(self) -> None:
        """Initialize the database manager (optional, can be used to test connection)."""
        pass

    async def close(self) -> None:
        """Close the database manager and dispose the engine."""
        if self._engine:
            await self._engine.dispose()
            self._engine = None
            self._session_factory = None

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """Provides a database session context manager with automatic commit/rollback."""
        if self._session_factory is None:
            raise IOError("DatabaseSessionManager is not initialized or already closed.")

        async with self._session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

# Global shared instance
db_session_manager = DatabaseSessionManager()
