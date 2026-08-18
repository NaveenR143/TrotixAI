import asyncio
from sqlalchemy import text
from ai.db.database import engine

async def run_diagnostics():
    try:
        async with engine.connect() as conn:
            # Get list of tables
            res_tables = await conn.execute(text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            ))
            tables = [r[0] for r in res_tables.fetchall()]
            print("Tables in database:", tables)
            
            # Check career_advice table rows
            if "career_advice" in tables:
                res_advice = await conn.execute(text("SELECT id, user_id, advice, created_date FROM career_advice LIMIT 5"))
                advices = res_advice.fetchall()
                print(f"Total career_advice entries: {len(advices)}")
                for row in advices:
                    print(f" - ID: {row[0]}, UserID: {row[1]}, CreatedAt: {row[3]}")
                    advice_str = str(row[2])
                    print(f"   Contains 'Project :' ? {'Project :' in advice_str}")
                    print(f"   Contains 'Title :' ? {'Title :' in advice_str}")
                    print(f"   Contains 'Description :' ? {'Description :' in advice_str}")
                    print(f"   Advice preview: {advice_str[:500]}")
                    print("-" * 50)
            
            # Check skill_analysis table rows
            if "skill_analysis" in tables:
                res_skills = await conn.execute(text("SELECT id, user_id, skill_analysis, created_date FROM skill_analysis LIMIT 5"))
                skills = res_skills.fetchall()
                print(f"Total skill_analysis entries: {len(skills)}")
                for row in skills:
                    print(f" - ID: {row[0]}, UserID: {row[1]}, CreatedAt: {row[3]}")
                    analysis_str = str(row[2])
                    print(f"   Contains 'Project :' ? {'Project :' in analysis_str}")
                    print(f"   Contains 'Title :' ? {'Title :' in analysis_str}")
                    print(f"   Contains 'Description :' ? {'Description :' in analysis_str}")
                    print(f"   Analysis preview: {analysis_str[:500]}")
                    print("-" * 50)
            
            # Check jobseeker_profiles table rows
            if "jobseeker_profiles" in tables:
                res_profiles = await conn.execute(text(
                    "SELECT user_id, summary FROM jobseeker_profiles "
                    "WHERE summary LIKE '%Project :%' OR summary LIKE '%Title:%' OR summary LIKE '%Description:%' LIMIT 5"
                ))
                profiles = res_profiles.fetchall()
                print(f"Total matching jobseeker_profiles entries: {len(profiles)}")
                for row in profiles:
                    print(f" - UserID: {row[0]}")
                    print("Summary:")
                    print(row[1])
                    print("=" * 80)
                
    except Exception as e:
        print("Error:", e)
                
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(run_diagnostics())
