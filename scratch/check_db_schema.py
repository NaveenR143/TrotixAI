import asyncio
from sqlalchemy import text
from ai.db.database import engine

async def check_schema():
    try:
        async with engine.connect() as conn:
            # Get columns of job_postings table
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'job_postings';
            """))
            columns = result.fetchall()
            print("Columns in job_postings:")
            for col in columns:
                print(f" - {col[0]}: {col[1]}")
    except Exception as e:
        print("Error checking schema:", e)

if __name__ == "__main__":
    asyncio.run(check_schema())
