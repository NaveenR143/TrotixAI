import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

import os

# DATABASE_URL = "postgresql+asyncpg://postgres:sa123@localhost:5432/trotixai"

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # Fix deduct_credits function to use used_credits instead of lifetime_spent
        # and remove ref_id/ref_type from INSERT
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION public.deduct_credits(
                p_user_id uuid, 
                p_amount integer, 
                p_type credit_tx_type, 
                p_description text, 
                p_ref_id uuid DEFAULT NULL::uuid, 
                p_ref_type text DEFAULT NULL::text
            )
            RETURNS boolean
            LANGUAGE plpgsql
            AS $function$
            DECLARE
                v_wallet_id     INTEGER;
                v_balance       INTEGER;
                v_new_balance   INTEGER;
            BEGIN
                SELECT id, balance INTO v_wallet_id, v_balance
                FROM credit_wallets
                WHERE user_id = p_user_id
                FOR UPDATE;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
                END IF;

                IF v_balance < p_amount THEN
                    RETURN FALSE;
                END IF;

                v_new_balance := v_balance - p_amount;

                UPDATE credit_wallets
                SET balance      = v_new_balance,
                    used_credits = used_credits + p_amount,
                    updated_at   = NOW()
                WHERE id = v_wallet_id;

                INSERT INTO credit_transactions
                    (wallet_id, user_id, type, amount, balance_after, description)
                VALUES
                    (v_wallet_id, p_user_id, p_type, -p_amount, v_new_balance, p_description);

                RETURN TRUE;
            END;
            $function$
        """))

        # Fix add_credits function
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION public.add_credits(
                p_user_id uuid, 
                p_amount integer, 
                p_type credit_tx_type, 
                p_description text, 
                p_ref_id uuid DEFAULT NULL::uuid, 
                p_ref_type text DEFAULT NULL::text
            )
            RETURNS integer
            LANGUAGE plpgsql
            AS $function$
            DECLARE
                v_wallet_id   INTEGER;
                v_new_balance INTEGER;
            BEGIN
                SELECT id INTO v_wallet_id
                FROM credit_wallets
                WHERE user_id = p_user_id
                FOR UPDATE;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
                END IF;

                UPDATE credit_wallets
                SET balance    = balance + p_amount,
                    updated_at = NOW()
                WHERE id = v_wallet_id
                RETURNING balance INTO v_new_balance;

                INSERT INTO credit_transactions
                    (wallet_id, user_id, type, amount, balance_after, description)
                VALUES
                    (v_wallet_id, p_user_id, p_type, p_amount, v_new_balance, p_description);

                RETURN v_new_balance;
            END;
            $function$
        """))

        print("DB functions updated successfully!")
    await engine.dispose()

asyncio.run(main())
