
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:sa123@localhost:5432/trotixai"
)

async def inspect_all_schemas():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT table_name, column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position;
        """))
        columns = result.fetchall()
        
        current_table = ""
        for col in columns:
            if col.table_name != current_table:
                current_table = col.table_name
                print(f"\n--- Table: {current_table} ---")
            print(f"Column: {col.column_name}, Type: {col.data_type}, Nullable: {col.is_nullable}, Default: {col.column_default}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(inspect_all_schemas())
