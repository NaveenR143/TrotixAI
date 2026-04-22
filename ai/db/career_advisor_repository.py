"""
Resume Repository Module
Handles all database operations for resume data insertion.
"""

import asyncio
import logging
from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import select, desc, text
from sqlalchemy.ext.asyncio import AsyncSession
from ai.models.orm_models import CareerAdvice

LOGGER = logging.getLogger(__name__)


class CareerAdvisorRepository:
    """Repository for career advisor-related database operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session."""
        self.session = session

    # ══════════════════════════════════════════════════════════════════════════════
    # USER OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    @staticmethod
    async def get_user_advice(user_id: UUID, session: AsyncSession) -> Optional[dict]:
        """
        Fetch the latest career advice for a given user.

        Args:
            user_id: UUID of the user
            session: Async database session

        Returns:
            Advice data as a dictionary if found, None otherwise
        """
        try:
            query = (
                select(CareerAdvice)
                .where(CareerAdvice.user_id == user_id)
                .order_by(desc(CareerAdvice.created_date), desc(CareerAdvice.id))
            )
            result = await session.execute(query)
            advice = result.scalars().first()

            if advice:
                return advice.advice

            return None

        except Exception as e:
            LOGGER.error(f"Error fetching user advice: {str(e)}")
            return None

    @staticmethod
    async def save_user_advice(user_id: UUID, advice_data: dict, session: AsyncSession):
        """
        Save career advice for a user.

        Args:
            user_id: UUID of the user
            advice_data: Dictionary containing structured career advice
            session: Async database session
        """
        try:
            # We insert a new record to keep history of advice
            new_advice = CareerAdvice(
                user_id=user_id,
                advice=advice_data
            )
            session.add(new_advice)
            await session.commit()
            LOGGER.info(f"Saved career advice for user: {user_id}")

        except Exception as e:
            await session.rollback()
            LOGGER.error(f"Error saving career advice: {str(e)}")
            raise

    @staticmethod
    async def get_market_trend_skills_by_industry(
        user_id: UUID, industry_id: int, session: AsyncSession, limit: int = 15
    ) -> list:
        """
        Fetch top skills in demand within a specific industry that the user doesn't have.
        """
        try:
            sql = text(
                """
                SELECT 
                    s.name,
                    COUNT(js.job_posting_id) AS job_count
                FROM job_skills js
                JOIN skills s ON s.id = js.skills_id
                JOIN job_postings jp ON jp.id = js.job_posting_id
                WHERE jp.industry_id = :industry_id
                AND js.skills_id NOT IN (
                    SELECT skill_id 
                    FROM jobseeker_skills 
                    WHERE user_id = :user_id
                )
                GROUP BY s.id, s.name
                ORDER BY job_count DESC
                LIMIT :limit;
                """
            )
            result = await session.execute(
                sql, {"user_id": user_id, "industry_id": industry_id, "limit": limit}
            )
            return [row[0] for row in result.fetchall()]

        except Exception as e:
            LOGGER.error(f"Error fetching market trend skills: {str(e)}")
            return []
