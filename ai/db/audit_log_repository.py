"""
Audit Log Repository - Database operations for api_audit_log
"""

from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
import logging
from ai.models.orm_models import ApiAuditLog

logger = logging.getLogger(__name__)


class AuditLogRepository:
    """Database repository to insert API audit logs."""

    @staticmethod
    async def create_audit_log(
        user_id: Optional[str],
        method: str,
        endpoint: str,
        query_params: Optional[str],
        request_body: Optional[str],
        response_status: Optional[int],
        response_time_ms: Optional[int],
        error_message: Optional[str],
        session: AsyncSession,
    ) -> ApiAuditLog:
        """
        Insert an audit log record into the database.

        Args:
            user_id: The authenticated user's ID as string
            method: HTTP request method (e.g. GET, POST)
            endpoint: The API path/endpoint
            query_params: Query parameters as a query string or text
            request_body: Raw request body text
            response_status: HTTP response status code
            response_time_ms: Response time in milliseconds
            error_message: Error or exception message if any
            session: Async database session

        Returns:
            ApiAuditLog ORM model instance
        """
        try:
            uuid_user_id = None
            if user_id:
                try:
                    uuid_user_id = UUID(str(user_id))
                except ValueError:
                    logger.warning(
                        "Could not parse user_id '%s' as UUID; inserting NULL",
                        user_id,
                    )

            audit_log = ApiAuditLog(
                user_id=uuid_user_id,
                method=method[:10],  # Truncate method name if too long for method column limit
                endpoint=endpoint,
                query_params=query_params,
                request_body=request_body,
                response_status=response_status,
                response_time_ms=response_time_ms,
                error_message=error_message,
            )

            session.add(audit_log)
            await session.commit()
            return audit_log

        except Exception as e:
            await session.rollback()
            logger.error(
                "Error creating audit log in repository: %s",
                str(e),
                exc_info=True,
            )
            raise
