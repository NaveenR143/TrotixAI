import asyncio
from sqlalchemy import text
from ai.db.database import engine

async def make_admin():
    try:
        async with engine.connect() as conn:
            # First, check if user exists
            res = await conn.execute(text("SELECT id, phone, role FROM users WHERE phone = '9241715141'"))
            user = res.fetchone()
            if not user:
                print("User not found!")
                return
            
            print(f"Current state: ID={user[0]}, Phone={user[1]}, Role={user[2]}")
            
            # Update role to admin
            # Wait, the user role enum might be used. Let's see what the enum has. It is 'admin', 'jobseeker', 'recruiter', 'consultant'.
            # Let's perform the raw update.
            await conn.execute(text("UPDATE users SET role = 'admin' WHERE phone = '9241715141'"))
            await conn.commit()
            
            # Verify update
            res_verify = await conn.execute(text("SELECT id, phone, role FROM users WHERE phone = '9241715141'"))
            user_verify = res_verify.fetchone()
            print(f"Updated state: ID={user_verify[0]}, Phone={user_verify[1]}, Role={user_verify[2]}")
            
    except Exception as e:
        print("Error updating user:", e)

if __name__ == "__main__":
    asyncio.run(make_admin())
