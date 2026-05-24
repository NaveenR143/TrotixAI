from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from uuid import UUID
from typing import Optional, Dict, Any
from ai.models.orm_models import CreditWallet, CreditTransaction, CreditTxTypeEnum

class CreditRepository:
    """Database queries for credit management"""

    @staticmethod
    async def get_wallet(user_id: UUID, session: AsyncSession) -> Optional[Dict[str, Any]]:
        """
        Fetch the credit wallet for a user.
        """
        try:
            query = select(CreditWallet).where(CreditWallet.user_id == user_id)
            result = await session.execute(query)
            wallet = result.scalars().first()
            if not wallet:
                return None
            return {
                "user_id": wallet.user_id,
                "balance": wallet.balance,
                "used_credits": wallet.used_credits,
                "updated_at": wallet.updated_at
            }
        except Exception as e:
            print(f"Error fetching wallet for user {user_id}: {e}")
            raise

    @staticmethod
    async def add_credits(
        user_id: UUID,
        amount: int,
        tx_type: CreditTxTypeEnum,
        description: str,
        session: AsyncSession,
    ) -> int:
        """
        Add credits to a user's wallet. Locates or creates the wallet if missing.
        Returns the new balance.
        """
        from datetime import datetime, timedelta, timezone

        if amount <= 0:
            raise ValueError("Credit amount must be greater than zero.")

        try:
            # Check for duplicate transactions in the last 10 seconds
            time_threshold = datetime.now(timezone.utc) - timedelta(seconds=10)
            duplicate_query = select(CreditTransaction).where(
                CreditTransaction.user_id == user_id,
                CreditTransaction.amount == amount,
                CreditTransaction.type == tx_type,
                CreditTransaction.description == description,
                CreditTransaction.created_at >= time_threshold
            )
            dup_result = await session.execute(duplicate_query)
            if dup_result.scalars().first():
                raise ValueError("Duplicate transaction detected. Please wait a moment before trying again.")

            # Locate or create wallet with row-level lock
            query = select(CreditWallet).where(CreditWallet.user_id == user_id).with_for_update()
            result = await session.execute(query)
            wallet = result.scalars().first()

            if not wallet:
                wallet = CreditWallet(
                    user_id=user_id,
                    balance=0,
                    used_credits=0
                )
                session.add(wallet)
                await session.flush()
                
                # Re-query to apply the lock
                query = select(CreditWallet).where(CreditWallet.user_id == user_id).with_for_update()
                result = await session.execute(query)
                wallet = result.scalars().first()

            # Add balance
            wallet.balance += amount

            # Record transaction
            transaction = CreditTransaction(
                user_id=user_id,
                wallet_id=wallet.id,
                type=tx_type,
                amount=amount,
                balance_after=wallet.balance,
                description=description
            )
            session.add(transaction)

            await session.commit()
            return wallet.balance
        except Exception as e:
            await session.rollback()
            print(f"Error adding credits for user {user_id}: {e}")
            raise

    @staticmethod
    async def deduct_credits(
        user_id: UUID,
        amount: int,
        tx_type: CreditTxTypeEnum,
        description: str,
        session: AsyncSession,
    ) -> bool:
        """
        Deduct credits from a user's wallet.
        Returns True if successful, False if insufficient balance.
        """
        from datetime import datetime, timedelta, timezone

        if amount <= 0:
            raise ValueError("Credit deduction amount must be greater than zero.")

        try:
            # Check for duplicate transactions in the last 10 seconds
            time_threshold = datetime.now(timezone.utc) - timedelta(seconds=3)
            duplicate_query = select(CreditTransaction).where(
                CreditTransaction.user_id == user_id,
                CreditTransaction.amount == -amount,
                CreditTransaction.type == tx_type,
                CreditTransaction.description == description,
                CreditTransaction.created_at >= time_threshold
            )
            dup_result = await session.execute(duplicate_query)
            if dup_result.scalars().first():
                raise ValueError("Duplicate transaction detected. Please wait a moment before trying again.")

            # Locate wallet with row-level lock
            query = select(CreditWallet).where(CreditWallet.user_id == user_id).with_for_update()
            result = await session.execute(query)
            wallet = result.scalars().first()

            if not wallet or wallet.balance < amount:
                return False

            # Deduct balance and update used_credits
            wallet.balance -= amount
            wallet.used_credits = (wallet.used_credits or 0) + amount

            # Record transaction
            transaction = CreditTransaction(
                user_id=user_id,
                wallet_id=wallet.id,
                type=tx_type,
                amount=-amount,
                balance_after=wallet.balance,
                description=description
            )
            session.add(transaction)

            await session.commit()
            return True
        except Exception as e:
            await session.rollback()
            print(f"Error deducting credits for user {user_id}: {e}")
            raise
