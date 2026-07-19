import asyncio
from sqlalchemy import text, select
from ai.db.database import engine
from ai.models.orm_models import User, JobPosting

async def run_diagnostics():
    try:
        async with engine.connect() as conn:
            # Query some users
            res_users = await conn.execute(text("SELECT id, phone, role, status FROM users LIMIT 10"))
            users = res_users.fetchall()
            print("Users in DB:")
            for u in users:
                print(f" - ID: {u[0]}, Phone: {u[1]}, Role: {u[2]}, Status: {u[3]}")
                
            # Query recent jobs
            from datetime import datetime, timezone, timedelta
            time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
            res_jobs = await conn.execute(text("""
                SELECT jp.id, jp.title, jp.created_at, jp.posted_at, c.name 
                FROM job_postings jp
                LEFT JOIN companies c ON jp.company_id = c.id
                WHERE jp.created_at >= :threshold OR jp.posted_at >= :threshold
            """), {"threshold": time_threshold})
            jobs = res_jobs.fetchall()
            print("\nRecent Jobs (Last 24 Hours):")
            for j in jobs:
                print(f" - ID: {j[0]}, Title: {j[1]}, Created At: {j[2]}, Posted At: {j[3]}, Company: {j[4]}")
                
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(run_diagnostics())
