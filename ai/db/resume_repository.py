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
            query = text("SELECT resume_status FROM users WHERE phone = :phone LIMIT 1")
            result = await self.session.execute(query, {"phone": phone})
            row = result.fetchone()

            if row:
                return row[0]

            LOGGER.warning(f"No resume status found for phone: {phone}")
            return None

        except Exception as e:
            LOGGER.error(f"Error fetching resume status: {str(e)}")
            return None

    async def update_resume_url(self, user_id: str, resume_url: str) -> bool:
        """
        Update the resume_url for a specific user in the users table.

        Args:
            user_id: ID of the user (str or UUID)
            resume_url: The URL of the uploaded resume

        Returns:
            bool: True if the update was successful, False otherwise
        """
        try:
            query = text(
                "UPDATE users SET resume_url = :resume_url WHERE id = :user_id"
            )
            result = await self.session.execute(
                query, {"resume_url": resume_url, "user_id": user_id}
            )
            await self.session.commit()

            if result.rowcount > 0:
                LOGGER.info(f"Successfully updated resume_url for user {user_id}")
                return True
            else:
                LOGGER.warning(f"No user found with ID {user_id} to update resume_url")
                return False

        except Exception as e:
            await self.session.rollback()
            LOGGER.error(f"Error updating resume_url for user {user_id}: {str(e)}")
            return False

    async def update_avatar_url(self, user_id: str, avatar_url: str) -> bool:
        """
        Update the avatar_url for a specific user in the users table.

        Args:
            user_id: ID of the user (str or UUID)
            avatar_url: The URL of the uploaded profile photo

        Returns:
            bool: True if the update was successful, False otherwise
        """
        try:
            query = text(
                "UPDATE users SET avatar_url = :avatar_url WHERE id = :user_id"
            )
            result = await self.session.execute(
                query, {"avatar_url": avatar_url, "user_id": user_id}
            )
            await self.session.commit()

            if result.rowcount > 0:
                LOGGER.info(f"Successfully updated avatar_url for user {user_id}")
                return True
            else:
                LOGGER.warning(f"No user found with ID {user_id} to update avatar_url")
                return False

        except Exception as e:
            await self.session.rollback()
            LOGGER.error(f"Error updating avatar_url for user {user_id}: {str(e)}")
            return False

    # ══════════════════════════════════════════════════════════════════════════════
    # AI USAGE TRACKING
    # ══════════════════════════════════════════════════════════════════════════════

    async def check_daily_ai_limit(self, user_id: str, feature_name: str) -> bool:
        """
        Check if the user has already made a specific AI request today.

        Args:
            user_id: User UUID
            feature_name: Name of the feature (enhance_resume, skill_analysis, learning_path)

        Returns:
            bool: True if request exists for today, False otherwise
        """
        try:
            from ai.models.orm_models import UserAIRequest
            from sqlalchemy import select
            from datetime import date

            allowed_features = ["enhance_resume", "skill_analysis", "learning_path"]
            if feature_name not in allowed_features:
                LOGGER.error(f"Invalid feature name: {feature_name}")
                return False

            stmt = select(UserAIRequest).where(
                UserAIRequest.user_id == user_id,
                UserAIRequest.created_at == date.today()
            )
            
            # Check if the specific feature column is TRUE
            result = await self.session.execute(stmt)
            record = result.scalars().first()
            
            if record:
                return bool(getattr(record, feature_name, False))
            return False
            
        except Exception as e:
            LOGGER.error(f"Error checking AI limit for user {user_id}: {str(e)}")
            return False

    async def log_ai_usage(self, user_id: str, feature_name: str) -> bool:
        """
        Log a successful AI request for the user. Updates existing record for today or inserts a new one.

        Args:
            user_id: User UUID
            feature_name: Name of the feature (enhance_resume, skill_analysis, learning_path)

        Returns:
            bool: True if logged successfully
        """
        try:
            from ai.models.orm_models import UserAIRequest
            from sqlalchemy import select
            from datetime import date

            allowed_features = ["enhance_resume", "skill_analysis", "learning_path"]
            if feature_name not in allowed_features:
                LOGGER.error(f"Invalid feature name: {feature_name}")
                return False

            # Use ORM to find or create today's record
            stmt = select(UserAIRequest).where(
                UserAIRequest.user_id == user_id,
                UserAIRequest.created_at == date.today()
            )
            result = await self.session.execute(stmt)
            record = result.scalars().first()

            if record:
                LOGGER.info(f"Updating existing AI usage record for user {user_id}, feature {feature_name}")
                setattr(record, feature_name, True)
            else:
                LOGGER.info(f"Creating new AI usage record for user {user_id}, feature {feature_name}")
                record = UserAIRequest(
                    user_id=user_id,
                    created_at=date.today()
                )
                setattr(record, feature_name, True)
                self.session.add(record)

            await self.session.commit()
            LOGGER.info(f"Successfully logged AI usage for user {user_id}, feature {feature_name}")
            return True
        except Exception as e:
            await self.session.rollback()
            LOGGER.error(f"Error logging AI usage for user {user_id}: {str(e)}", exc_info=True)
            return False

    async def get_daily_ai_usage(self, user_id: str) -> dict:
        """
        Get the AI usage status for all features for today.

        Args:
            user_id: User UUID

        Returns:
            dict: Usage status for each feature
        """
        try:
            from ai.models.orm_models import UserAIRequest
            from sqlalchemy import select
            from datetime import date

            stmt = select(UserAIRequest).where(
                UserAIRequest.user_id == user_id,
                UserAIRequest.created_at == date.today()
            )
            result = await self.session.execute(stmt)
            record = result.scalars().first()

            if record:
                return {
                    "enhance_resume": bool(record.enhance_resume),
                    "skill_analysis": bool(record.skill_analysis),
                    "learning_path": bool(record.learning_path)
                }
            
            return {
                "enhance_resume": False,
                "skill_analysis": False,
                "learning_path": False
            }
        except Exception as e:
            LOGGER.error(f"Error fetching daily AI usage for user {user_id}: {str(e)}")
            return {
                "enhance_resume": False,
                "skill_analysis": False,
                "learning_path": False
            }
