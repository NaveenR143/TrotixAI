# ai/db/otp_repository.py
# Database repository for otp_store table operations

import logging
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ai.db.database import AsyncSessionLocal
from ai.models.orm_models import OTPStore

logger = logging.getLogger(__name__)


async def save_otp_to_db(phone: str, otp: str, session: Optional[AsyncSession] = None) -> bool:
    """
    Save generated OTP to otp_store database table.

    Args:
        phone: Standardized phone number string
        otp: 4-digit OTP string
        session: Optional AsyncSession

    Returns:
        bool: True if inserted successfully
    """
    otp_record = OTPStore(phone=phone, otp=otp)

    if session is not None:
        session.add(otp_record)
        await session.commit()
        return True

    async with AsyncSessionLocal() as db_session:
        try:
            db_session.add(otp_record)
            await db_session.commit()
            return True
        except Exception as e:
            await db_session.rollback()
            logger.error(f"Error saving OTP to database for {phone}: {e}", exc_info=True)
            raise Exception(f"Failed to save OTP to database: {str(e)}")


async def get_recent_otps_from_db(
    phone: str, limit: int = 2, session: Optional[AsyncSession] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve the most recent OTP records for a phone number ordered by created_at DESC.
    Limits to `limit` records (default 2).

    Args:
        phone: Standardized phone number string
        limit: Max number of recent records to return (default 2)
        session: Optional AsyncSession

    Returns:
        List[Dict[str, Any]]: List of dictionary records containing id, phone, otp, created_at
    """
    stmt = (
        select(OTPStore)
        .where(OTPStore.phone == phone)
        .order_by(OTPStore.id.desc())
        .limit(limit)
    )

    async def _execute(db_sess: AsyncSession):
        result = await db_sess.execute(stmt)
        records = result.scalars().all()
        return [
            {
                "id": record.id,
                "phone": record.phone,
                "otp": record.otp,
                "created_at": record.created_at,
            }
            for record in records
        ]

    if session is not None:
        return await _execute(session)

    async with AsyncSessionLocal() as db_session:
        try:
            return await _execute(db_session)
        except Exception as e:
            logger.error(f"Error retrieving recent OTPs from database for {phone}: {e}", exc_info=True)
            raise Exception(f"Failed to retrieve recent OTPs from database: {str(e)}")

