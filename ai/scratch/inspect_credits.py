import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = "postgresql+asyncpg://postgres:sa123@localhost:5432/trotixai"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        # Check deduct_credits function signature
        result = await conn.execute(text("""
            SELECT pg_get_functiondef(oid)
            FROM pg_proc
            WHERE proname = 'deduct_credits'
        """))
        for row in result:
            print("=== deduct_credits ===")
            print(row[0])

        # Check add_credits function signature
        result = await conn.execute(text("""
            SELECT pg_get_functiondef(oid)
            FROM pg_proc
            WHERE proname = 'add_credits'
        """))
        for row in result:
            print("\n=== add_credits ===")
            print(row[0])
    await engine.dispose()

asyncio.run(main())
