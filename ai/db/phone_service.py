# db/phone_service.py
# Phone number database operations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def save_phone_to_db(phone: str, session: AsyncSession) -> tuple:
    """
    Save phone number to users table and return user ID with existence flag.
    If phone already exists, return existing user ID.

    Args:
        phone: Phone number to save
        session: AsyncSession for database operations

    Returns:
        tuple: (user_id, is_existing) where user_id is UUID string and is_existing is bool
    """
    try:
        # Check if phone already exists
        result = await session.execute(
            text("SELECT id FROM users WHERE phone = :phone"),
            {"phone": phone}
        )
        existing_user = result.scalar()

        if existing_user:
            return (str(existing_user), True)

        # Insert without specifying id - let PostgreSQL generate it with gen_random_uuid()
        result = await session.execute(
            text("""
                INSERT INTO users (phone, role, status, full_name,resume_status)
                VALUES (:phone, :role, :status, :full_name,:resume_status)
                RETURNING id
            """),
            {
                "phone": phone,
                "role": "jobseeker",
                "status": "pending_verification",
                "full_name": "",
                "resume_status": "queued"
            }
        )

        generated_id = result.scalar()
        await session.commit()
        return (str(generated_id), False)

    except Exception as e:
        await session.rollback()
        raise Exception(f"Failed to save phone number: {str(e)}")


async def mark_phone_verified(phone: str, session: AsyncSession) -> bool:
    """
    Mark a phone number as verified in the database.
    Updates is_phone_verified to True and status to 'active'.

    Args:
        phone: Phone number to mark as verified
        session: AsyncSession for database operations

    Returns:
        bool: True if update successful, False if phone not found

    Raises:
        Exception: If database operation fails
    """
    try:
        # Update user with matching phone number
        result = await session.execute(
            text("""
                UPDATE users 
                SET is_phone_verified = TRUE, status = 'active'
                WHERE phone = :phone
                RETURNING id
            """),
            {"phone": phone}
        )

        updated_id = result.scalar()
        await session.commit()
        return updated_id is not None

    except Exception as e:
        await session.rollback()
        raise Exception(f"Failed to mark phone as verified: {str(e)}")
