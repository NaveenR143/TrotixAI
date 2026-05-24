import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from ai.db.database import DATABASE_URL

async def main():
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        # Get schema of credit_wallets
        res = await conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'credit_wallets';
        """))
        print("\n--- credit_wallets columns ---")
        for row in res:
            print(f"{row[0]}: {row[1]}")

        # Get schema of credit_transactions
        res = await conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'credit_transactions';
        """))
        print("\n--- credit_transactions columns ---")
        for row in res:
            print(f"{row[0]}: {row[1]}")

        # Get definition of deduct_credits SQL function
        res = await conn.execute(text("""
            SELECT pg_get_functiondef(p.oid) 
            FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'deduct_credits';
        """))
        print("\n--- deduct_credits definition ---")
        for row in res:
            print(row[0])

        # Get definition of add_credits SQL function
        res = await conn.execute(text("""
            SELECT pg_get_functiondef(p.oid) 
            FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'add_credits';
        """))
        print("\n--- add_credits definition ---")
        for row in res:
            print(row[0])
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
