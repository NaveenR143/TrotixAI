import logging
import json
from uuid import UUID
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

class ReportRepository:
    """
    Repository for all database queries and updates related to report generation.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def fetch_report(self, report_id: int) -> dict | None:
        """
        Fetch report details by report ID.
        """
        stmt = text("""
            SELECT id, order_id, user_id, report_type, status 
            FROM report_generations 
            WHERE id = :report_id 
            FOR UPDATE
        """)
        res = await self.session.execute(stmt, {"report_id": report_id})
        row = res.fetchone()
        if not row:
            return None
        return {
            "id": row[0],
            "order_id": row[1],
            "user_id": row[2],
            "report_type": row[3],
            "status": row[4]
        }

    async def update_status_to_processing(self, report_id: int) -> None:
        """
        Update report status to PROCESSING.
        """
        stmt = text("""
            UPDATE report_generations 
            SET status = 'PROCESSING', progress = 10, started_at = NOW(), updated_at = NOW() 
            WHERE id = :report_id
        """)
        await self.session.execute(stmt, {"report_id": report_id})

    async def update_progress(self, report_id: int, progress: int) -> None:
        """
        Update progress percentage for a report.
        """
        stmt = text("""
            UPDATE report_generations 
            SET progress = :progress, updated_at = NOW() 
            WHERE id = :report_id
        """)
        await self.session.execute(stmt, {"report_id": report_id, "progress": progress})

    async def update_status_to_completed(self, report_id: int) -> None:
        """
        Update report status to COMPLETED.
        """
        stmt = text("""
            UPDATE report_generations 
            SET status = 'COMPLETED', progress = 100, completed_at = NOW(), updated_at = NOW() 
            WHERE id = :report_id
        """)
        await self.session.execute(stmt, {"report_id": report_id})

    async def update_status_to_failed(self, report_id: int, error_msg: str) -> None:
        """
        Update report status to FAILED and save the error message.
        """
        stmt = text("""
            UPDATE report_generations 
            SET status = 'FAILED', progress = 0, error_message = :error_msg, updated_at = NOW() 
            WHERE id = :report_id
        """)
        await self.session.execute(stmt, {"report_id": report_id, "error_msg": error_msg})

    async def get_user_contact_info(self, user_id: UUID) -> dict | None:
        """
        Fetch contact details of the user.
        """
        stmt = text("SELECT full_name, phone FROM users WHERE id = :user_id")
        res = await self.session.execute(stmt, {"user_id": str(user_id)})
        row = res.fetchone()
        if not row:
            return None
        return {
            "full_name": row[0],
            "phone": row[1]
        }

    async def get_user_id_by_email(self, email: str) -> UUID | None:
        """
        Get user ID by user email.
        """
        stmt = text("SELECT id FROM users WHERE email = :email")
        res = await self.session.execute(stmt, {"email": email})
        row = res.fetchone()
        return row[0] if row else None

    async def get_job_postings_by_user_industries(self, user_id: UUID, limit: int = 20) -> list[dict]:
        """
        Retrieve job postings with required skills matching user's industries.
        """
        stmt = text("""
            SELECT jp.id, jp.title, jp.description, 
                   ARRAY(SELECT s.name FROM job_skills js JOIN skills s ON js.skills_id = s.id WHERE js.job_posting_id = jp.id) as skills
            FROM job_postings jp
            WHERE jp.industry_id IN (
                SELECT industry_id FROM user_industries WHERE user_id = :user_id
            )
            ORDER BY jp.created_at DESC
            LIMIT :limit
        """)
        res = await self.session.execute(stmt, {"user_id": str(user_id), "limit": limit})
        return [
            {
                "id": r[0],
                "title": r[1],
                "description": r[2] or "",
                "skills": r[3] or []
            }
            for r in res.fetchall()
        ]

    async def get_latest_job_postings(self, limit: int = 20) -> list[dict]:
        """
        Retrieve latest job postings in database.
        """
        stmt = text("""
            SELECT jp.id, jp.title, jp.description, 
                   ARRAY(SELECT s.name FROM job_skills js JOIN skills s ON js.skills_id = s.id WHERE js.job_posting_id = jp.id) as skills
            FROM job_postings jp
            ORDER BY jp.created_at DESC
            LIMIT :limit
        """)
        res = await self.session.execute(stmt, {"limit": limit})
        return [
            {
                "id": r[0],
                "title": r[1],
                "description": r[2] or "",
                "skills": r[3] or []
            }
            for r in res.fetchall()
        ]

    async def get_market_trend_skills_by_industries(
        self, user_id: UUID, industry_ids: list[int], limit: int = 15
    ) -> list[str]:
        """
        Fetch top skills in demand within specific industries that the user doesn't have.
        """
        if not industry_ids:
            return []

        try:
            stmt = text("""
                SELECT s.name, COUNT(js.job_posting_id) AS job_count
                FROM job_skills js
                JOIN skills s ON s.id = js.skills_id
                JOIN job_postings jp ON jp.id = js.job_posting_id
                WHERE jp.industry_id = ANY(:industry_ids)
                AND js.skills_id NOT IN (
                    SELECT skill_id 
                    FROM jobseeker_skills 
                    WHERE user_id = :user_id
                )
                GROUP BY s.id, s.name
                ORDER BY job_count DESC
                LIMIT :limit
            """)
            res = await self.session.execute(
                stmt, {"user_id": str(user_id), "industry_ids": industry_ids, "limit": limit}
            )
            return [row[0] for row in res.fetchall()]
        except Exception as e:
            logger.error(f"Error fetching market trend skills: {e}")
            return []

    async def get_matching_jobs(self, user_id: UUID, limit: int = 20) -> list[dict]:
        """
        Retrieve job opportunities matching candidate's profile (skills, embedding, location, seniority).
        """
        try:
            # 1. Fetch user profile context
            stmt_profile = text("""
                SELECT years_of_experience, profile_embedding 
                FROM jobseeker_profiles 
                WHERE user_id = :user_id
            """)
            res_profile = await self.session.execute(stmt_profile, {"user_id": str(user_id)})
            profile = res_profile.fetchone()

            years_exp = float(profile[0]) if (profile and profile[0] is not None) else 0.0
            embedding = profile[1] if profile else None

            # Fetch industry IDs
            stmt_ind = text("""
                SELECT industry_id FROM user_industries WHERE user_id = :user_id
            """)
            res_ind = await self.session.execute(stmt_ind, {"user_id": str(user_id)})
            industry_ids = [r[0] for r in res_ind.fetchall()]

            if not industry_ids:
                stmt_user_ind = text("SELECT industry_id FROM users WHERE id = :user_id")
                res_user_ind = await self.session.execute(stmt_user_ind, {"user_id": str(user_id)})
                user_ind = res_user_ind.fetchone()
                if user_ind and user_ind[0] is not None:
                    industry_ids = [user_ind[0]]

            # Fetch recent job title for seniority checks
            stmt_exp = text("""
                SELECT title FROM work_experiences 
                WHERE user_id = :user_id 
                ORDER BY is_current DESC, end_date DESC, start_date DESC 
                LIMIT 1
            """)
            res_exp = await self.session.execute(stmt_exp, {"user_id": str(user_id)})
            exp_row = res_exp.fetchone()
            recent_title = (exp_row[0] or "").lower() if exp_row else ""

            is_senior = any(term in recent_title for term in ["senior", "lead", "principal", "manager", "director", "vp", "head"]) or years_exp >= 8.0
            is_entry = any(term in recent_title for term in ["junior", "entry", "intern", "fresher", "trainee"]) or (years_exp < 2.0 and not is_senior)

            # Build query components
            where_clauses = [
                "jp.id NOT IN (SELECT job_posting_id FROM job_applications WHERE user_id = :user_id)",
                "(c.careers_url IS NOT NULL OR c.hiring_email IS NOT NULL OR jp.recruiter_id IS NOT NULL)",
                "jp.created_at >= NOW() - INTERVAL '15 days'"
            ]
            query_params = {"user_id": str(user_id), "limit": limit}

            if industry_ids:
                where_clauses.append("jp.industry_id = ANY(:industry_ids)")
                query_params["industry_ids"] = industry_ids

            if years_exp > 0:
                where_clauses.append("(jp.experience_min_yrs IS NULL OR jp.experience_min_yrs <= :max_req_exp)")
                query_params["max_req_exp"] = int(years_exp + 3)

            if is_senior:
                where_clauses.append("(jp.experience_level IS NULL OR jp.experience_level NOT IN ('entry', 'junior'))")
            elif is_entry:
                where_clauses.append("(jp.experience_level IS NULL OR jp.experience_level NOT IN ('lead', 'executive'))")

            where_str = " AND ".join(where_clauses)

            if embedding is not None:
                order_by_str = "jp.job_embedding <=> :user_embedding"
                query_params["user_embedding"] = str(embedding)
            else:
                order_by_str = "jp.created_at DESC"

            stmt_jobs = text(f"""
                SELECT jp.id, jp.title, jp.description,
                       ARRAY(SELECT s.name FROM job_skills js JOIN skills s ON js.skills_id = s.id WHERE js.job_posting_id = jp.id) as skills
                FROM job_postings jp
                LEFT JOIN companies c ON jp.company_id = c.id
                WHERE {where_str}
                ORDER BY {order_by_str}
                LIMIT :limit
            """)

            res_jobs = await self.session.execute(stmt_jobs, query_params)
            return [
                {
                    "id": r[0],
                    "title": r[1],
                    "description": r[2] or "",
                    "skills": r[3] or []
                }
                for r in res_jobs.fetchall()
            ]

        except Exception as e:
            logger.error(f"Error fetching matching jobs: {e}")
            return []


    async def save_skill_analysis(self, user_id: UUID, analysis_data: dict) -> None:
        """
        Upsert skill analysis for a user.
        """
        stmt_check = text("SELECT id FROM skill_analysis WHERE user_id = :user_id LIMIT 1")
        res_check = await self.session.execute(stmt_check, {"user_id": user_id})
        exists = res_check.fetchone() is not None
        
        if exists:
            stmt_upsert = text("""
                UPDATE skill_analysis 
                SET skill_analysis = CAST(:skill_analysis AS jsonb), created_date = CURRENT_DATE 
                WHERE user_id = :user_id
            """)
        else:
            stmt_upsert = text("""
                INSERT INTO skill_analysis (user_id, skill_analysis, created_date) 
                VALUES (:user_id, CAST(:skill_analysis AS jsonb), CURRENT_DATE)
            """)
        await self.session.execute(stmt_upsert, {
            "user_id": user_id,
            "skill_analysis": json.dumps(analysis_data)
        })

    async def save_career_advice(self, user_id: UUID, advice_data: dict) -> None:
        """
        Upsert career advice for a user.
        """
        stmt_check = text("SELECT id FROM career_advice WHERE user_id = :user_id LIMIT 1")
        res_check = await self.session.execute(stmt_check, {"user_id": user_id})
        exists = res_check.fetchone() is not None
        
        if exists:
            stmt_upsert = text("""
                UPDATE career_advice 
                SET advice = CAST(:advice AS jsonb), created_date = CURRENT_DATE 
                WHERE user_id = :user_id
            """)
        else:
            stmt_upsert = text("""
                INSERT INTO career_advice (user_id, advice, created_date) 
                VALUES (:user_id, CAST(:advice AS jsonb), CURRENT_DATE)
            """)
        await self.session.execute(stmt_upsert, {
            "user_id": user_id,
            "advice": json.dumps(advice_data)
        })

    async def save_jobseeker_profile_summary(self, user_id: UUID, summary: str, profile_embedding: list[float] | None) -> None:
        """
        Upsert summary and profile embedding inside jobseeker_profiles.
        """
        update_profile = text("""
            INSERT INTO jobseeker_profiles (user_id, summary, profile_embedding, created_at, updated_at)
            VALUES (:user_id, :summary, :profile_embedding, NOW(), NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                summary = EXCLUDED.summary,
                profile_embedding = EXCLUDED.profile_embedding,
                updated_at = NOW()
        """)
        await self.session.execute(update_profile, {
            "summary": summary,
            "profile_embedding": str(profile_embedding) if profile_embedding else None,
            "user_id": user_id
        })

    async def get_order_report_statuses(self, order_id: int) -> list[str]:
        """
        Get all report statuses associated with an order.
        """
        stmt = text("SELECT status FROM report_generations WHERE order_id = :order_id")
        res = await self.session.execute(stmt, {"order_id": order_id})
        return [r[0] for r in res.fetchall()]

    async def fetch_candidate_data(self, user_id: UUID) -> dict:
        """
        Query DB tables to reconstruct full candidate profile object.
        """
        # User details
        stmt_user = text("SELECT id, full_name, email, phone FROM users WHERE id = :user_id")
        res_user = await self.session.execute(stmt_user, {"user_id": str(user_id)})
        user = res_user.fetchone()
        
        # Profile details
        stmt_prof = text("SELECT headline, summary, current_location, linkedin_url, github_url FROM jobseeker_profiles WHERE user_id = :user_id")
        res_prof = await self.session.execute(stmt_prof, {"user_id": str(user_id)})
        profile = res_prof.fetchone()
        
        # Experience details
        stmt_exp = text("""
            SELECT w.title, w.location, w.start_date, w.end_date, w.is_current, w.description, c.name, w.skills_used 
            FROM work_experiences w 
            LEFT JOIN companies c ON w.company_id = c.id 
            WHERE w.user_id = :user_id 
            ORDER BY w.start_date DESC
        """)
        res_exp = await self.session.execute(stmt_exp, {"user_id": str(user_id)})
        experiences = res_exp.fetchall()
        
        # Education
        stmt_edu = text("SELECT institution, degree, field_of_study, grade, start_year, end_year FROM education WHERE user_id = :user_id ORDER BY start_year DESC")
        res_edu = await self.session.execute(stmt_edu, {"user_id": str(user_id)})
        education = res_edu.fetchall()
        
        # Projects
        stmt_proj = text("SELECT title, description, url, repo_url, skills_used FROM projects WHERE user_id = :user_id")
        res_proj = await self.session.execute(stmt_proj, {"user_id": str(user_id)})
        projects = res_proj.fetchall()
        
        # Skills
        stmt_skills = text("SELECT s.name, js.level FROM jobseeker_skills js JOIN skills s ON js.skill_id = s.id WHERE js.user_id = :user_id")
        res_skills = await self.session.execute(stmt_skills, {"user_id": str(user_id)})
        skills_raw = res_skills.fetchall()
        skills = [r[0] for r in skills_raw]
        skills_with_levels = [[r[0], r[1]] for r in skills_raw]
        
        # Industries
        stmt_ind = text("""
            SELECT i.id, i.name 
            FROM industries i
            JOIN user_industries ui ON i.id = ui.industry_id
            WHERE ui.user_id = :user_id
        """)
        res_ind = await self.session.execute(stmt_ind, {"user_id": str(user_id)})
        industries = [{"id": r[0], "name": r[1]} for r in res_ind.fetchall()]
        
        # Recent job application context (target job description fallback)
        stmt_job = text("""
            SELECT j.description, j.title 
            FROM job_applications ja 
            JOIN job_postings j ON ja.job_posting_id = j.id 
            WHERE ja.user_id = :user_id 
            ORDER BY ja.id DESC LIMIT 1
        """)
        res_job = await self.session.execute(stmt_job, {"user_id": str(user_id)})
        job_context = res_job.fetchone()
        
        return {
            "user": {
                "full_name": user[1] if user else "",
                "email": user[2] if user else "",
                "phone": user[3] if user else ""
            },
            "profile": {
                "headline": profile[0] if profile else "",
                "summary": profile[1] if profile else "",
                "current_location": profile[2] if profile else "",
                "linkedin": profile[3] if profile else "",
                "github": profile[4] if profile else ""
            },
            "experiences": [
                {
                    "title": e[0],
                    "location": e[1],
                    "start_date": str(e[2]) if e[2] else "",
                    "end_date": str(e[3]) if e[3] else "",
                    "is_current": e[4],
                    "description": e[5] or "",
                    "company_name": e[6] or "",
                    "skills_used": e[7] or []
                }
                for e in experiences
            ],
            "education": [
                {
                    "institution": ed[0],
                    "degree": ed[1],
                    "field_of_study": ed[2],
                    "grade": ed[3] or "",
                    "start_year": ed[4],
                    "end_year": ed[5]
                }
                for ed in education
            ],
            "projects": [
                {
                    "title": pr[0],
                    "description": pr[1] or "",
                    "url": pr[2] or "",
                    "repo_url": pr[3] or "",
                    "skills_used": pr[4] or []
                }
                for pr in projects
            ],
            "skills": skills,
            "skills_with_levels": skills_with_levels,
            "industries": industries,
            "target_job": {
                "title": job_context[1] if job_context else "",
                "description": job_context[0] if job_context else ""
            }
        }

    async def commit(self) -> None:
        """Commit transaction."""
        await self.session.commit()
