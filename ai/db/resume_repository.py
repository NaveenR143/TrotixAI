"""
Resume Repository Module
Handles all database operations for resume data insertion.
"""

import asyncio
import logging
from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

LOGGER = logging.getLogger(__name__)


class ResumeRepository:
    """Repository for resume-related database operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session."""
        self.session = session

    def _parse_date(self, date_val: Optional[str | date]) -> Optional[date]:
        """
        Safely parse date string or return date object.

        Args:
            date_val: Date string (YYYY-MM-DD) or date object

        Returns:
            date object if valid, None otherwise
        """
        if not date_val:
            return None

        if isinstance(date_val, date):
            return date_val

        try:
            if isinstance(date_val, str):
                # Handle cases like "2012-10-01T00:00:00" or just "2012-10-01"
                return date.fromisoformat(date_val.split("T")[0])
        except (ValueError, TypeError) as e:
            LOGGER.warning(f"Failed to parse date '{date_val}': {str(e)}")

        return None

    # ══════════════════════════════════════════════════════════════════════════════
    # USER OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def get_user_id_by_phone(self, phone: str) -> Optional[UUID]:
        """
        Fetch user ID from users table using phone number.

        Args:
            phone: Phone number to search for

        Returns:
            UUID of the user if found, None otherwise
        """
        try:
            query = text("SELECT id FROM users WHERE phone = :phone LIMIT 1")
            result = await self.session.execute(query, {"phone": phone})
            row = result.fetchone()

            if row:
                return UUID(str(row[0]))

            LOGGER.warning(f"No user found with phone: {phone}")
            return None

        except Exception as e:
            LOGGER.error(f"Error fetching user by phone: {str(e)}")
            raise

    async def get_resume_status(self, phone: str) -> Optional[str]:
        """
        Fetch the resume processing status for a given phone number.

        Args:
            phone: Phone number of the user

        Returns:
            Resume processing status as a string if found, None otherwise
        """
        try:
            query = text(
                "SELECT resume_status FROM users WHERE phone = :phone LIMIT 1")
            result = await self.session.execute(query, {"phone": phone})
            row = result.fetchone()

            if row:
                return row[0]

            LOGGER.warning(f"No resume status found for phone: {phone}")
            return None

        except Exception as e:
            LOGGER.error(f"Error fetching resume status: {str(e)}")
            raise
