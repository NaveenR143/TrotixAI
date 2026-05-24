import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:sa123@localhost:5432/trotixai"
)

async def inspect():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        tables = ['credit_wallets', 'credit_transactions']
        for table in tables:
            result = await conn.execute(text(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = '{table}'
                ORDER BY ordinal_position;
            """))
            columns = result.fetchall()
            print(f"\n--- Live DB Table Schema: {table} ---")
            for col in columns:
                print(f"Column: {col.column_name}, Type: {col.data_type}, Nullable: {col.is_nullable}, Default: {col.column_default}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(inspect())
