import os
import json
import logging
import re
from uuid import UUID

from ProcessPDF.whatsapp_notification_service import WhatsAppNotificationService
from db.report_repository import ReportRepository
from ProcessPDF.llm_service import ReportLLMService

logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager
from db.session_manager import db_session_manager

class PremiumReportService:
    """
    Worker-side Premium Report Orchestrator.
    Handles data extraction, OpenAI prompts, PDF compilation, Azure Blob Upload,
    and database state updates for premium reports.
    """
    
    def __init__(self, session=None):
        self.session = session
        if session:
            self.db = ReportRepository(session)
        else:
            self.db = None
        self.llm = ReportLLMService()
        self.whatsapp_service = WhatsAppNotificationService()

    @asynccontextmanager
    async def _get_session(self):
        if self.session:
            yield self.db
        else:
            async with db_session_manager.session() as session:
                yield ReportRepository(session)
        
    async def process_report_generation(self, report_id: int) -> bool:
        """
        Main execution workflow for generating a single report.
        """
        # Fetch report details
        async with self._get_session() as db:
            report = await db.fetch_report(report_id)
            
            if not report:
                logger.error(f"Report generation record with ID {report_id} not found.")
                return False
                
            order_id = report["order_id"]
            user_id = report["user_id"]
            report_type = report["report_type"]
            status = report["status"]
            
            if status in ["COMPLETED", "PROCESSING"]:
                logger.info(f"Report {report_id} is already in {status} status. Skipping.")
                return True
                
            # Update to PROCESSING
            logger.info(f"Starting report generation for ID: {report_id} (Type: {report_type})")
            await db.update_status_to_processing(report_id)
            await db.commit()
        
        try:
            # 1. Fetch Candidate Profile Data & Market trend skills
            async with self._get_session() as db:
                profile_data = await db.fetch_candidate_data(user_id)
                
                # Update progress to 30%
                await db.update_progress(report_id, 30)
                await db.commit()

                missing_skills = []
                weak_skills = []
                market_skills = []

                if report_type == "SKILL_ANALYSIS":
                    try:
                        # 1. Fetch industry IDs from candidate profile_data
                        user_industries = profile_data.get("industries") or []
                        industry_ids = [ind.get("id") for ind in user_industries if ind.get("id")]
                        
                        # 2. Fetch market trend skills
                        market_skills = await db.get_market_trend_skills_by_industries(user_id, industry_ids)

                        # 3. Get matched jobs using pgvector/filters matching
                        matched_jobs = await db.get_matching_jobs(user_id)
                        if not matched_jobs:
                            matched_jobs = await db.get_latest_job_postings()

                        # 4. Compute missing and weak skills
                        missing_skills, weak_skills = self._compute_skill_gaps(profile_data, matched_jobs)
                    except Exception as e:
                        logger.warning(f"Error executing gaps check inside ai_container: {e}")
            
            # 2. Call LLM to generate report text/JSON (NO session active during LLM request)
            logger.info(f"Generating content for {report_type} via LLM...")
            generated_content = await self._generate_report_content(
                report_type,
                profile_data,
                missing_skills=missing_skills,
                weak_skills=weak_skills,
                market_skills=market_skills
            )
            
            # 3. Save report and complete
            async with self._get_session() as db:
                # Update progress to 60%
                await db.update_progress(report_id, 60)
                await db.commit()
                
                # Save to database based on report type
                logger.info(f"Saving {report_type} data to database...")
                await self._save_report_data(db, report_type, user_id, generated_content, profile_data=profile_data)

                # Update progress to 80%
                await db.update_progress(report_id, 80)
                await db.commit()
                
                # 5. Mark COMPLETED
                await db.update_status_to_completed(report_id)
                await db.commit()
                logger.info(f"Successfully completed report {report_id}!")
                
                # 6. Check if all reports for this order are completed
                await self._check_and_trigger_order_completion(db, order_id, user_id)
                return True
                
        except Exception as e:
            logger.error(f"Error generating premium report {report_id}: {e}", exc_info=True)
            async with self._get_session() as db:
                # Mark FAILED
                await db.update_status_to_failed(report_id, str(e))
                await db.commit()
                
                # Trigger failure notification
                user_rec = await db.get_user_contact_info(user_id)
                
            if user_rec and user_rec.get("phone"):
                track_link = f"http://localhost:3000/orders/{order_id}/status"
                self.whatsapp_service.send_reports_failed(
                    phone=user_rec["phone"],
                    name=user_rec.get("full_name") or "Candidate",
                    status_link=track_link
                )
            return False

    async def _generate_report_content(
        self,
        report_type: str,
        profile_data: dict,
        missing_skills: list = None,
        weak_skills: list = None,
        market_skills: list = None
    ) -> str:
        """
        Orchestrates LLM query preparation (e.g. skill gaps computation) and calls LLM service.
        """
        return await self.llm.generate_llm_content(
            report_type=report_type,
            data=profile_data,
            missing_skills=missing_skills or [],
            weak_skills=weak_skills or [],
            market_skills=market_skills or []
        )

    def _compute_skill_gaps(self, data: dict, matched_jobs: list[dict]) -> tuple[list[str], list[str]]:
        """
        Compares candidate skills with jobs postings requirements to find gaps and beginner skills.
        """
        user_skills_set = set()
        user_skills_with_levels = {}
        
        for name, level in data.get("skills_with_levels") or []:
            if name:
                s_name = name.strip().lower()
                user_skills_set.add(s_name)
                user_skills_with_levels[s_name] = level or "intermediate"
                
        for exp in data.get("experiences") or []:
            for skill in exp.get("skills_used") or []:
                if skill:
                    s_name = skill.strip().lower()
                    user_skills_set.add(s_name)
                    if s_name not in user_skills_with_levels:
                        user_skills_with_levels[s_name] = "intermediate"
                        
        for proj in data.get("projects") or []:
            for skill in proj.get("skills_used") or []:
                if skill:
                    s_name = skill.strip().lower()
                    user_skills_set.add(s_name)
                    if s_name not in user_skills_with_levels:
                        user_skills_with_levels[s_name] = "intermediate"

        from collections import Counter
        missing_skills_counter = Counter()
        weak_skills_counter = Counter()
        
        for job in matched_jobs:
            job_skills = job.get("skills") or []
            for skill in job_skills:
                skill_lower = skill.strip().lower()
                if skill_lower not in user_skills_set:
                    missing_skills_counter[skill] += 1
                elif user_skills_with_levels.get(skill_lower) == "beginner":
                    weak_skills_counter[skill] += 1

        missing_skills = [s for s, count in missing_skills_counter.most_common(15)]
        weak_skills = [s for s, count in weak_skills_counter.most_common(10)]
        return missing_skills, weak_skills

    async def _save_report_data(self, db, report_type: str, user_id: UUID, generated_content: str, profile_data: dict = None) -> None:
        """
        Saves the generated report content to the appropriate database tables based on report type.
        """
        if report_type == "SKILL_ANALYSIS":
            try:
                llm_data = json.loads(generated_content)
            except Exception as json_err:
                logger.warning(f"Failed to parse SKILL_ANALYSIS JSON: {json_err}. Storing as raw content.")
                llm_data = {"raw_content": generated_content}

            # Fetch candidate profile data to resolve industry name if not provided
            if not profile_data:
                try:
                    profile_data = await db.fetch_candidate_data(user_id)
                except Exception as e:
                    logger.warning(f"Could not fetch profile_data in save_report_data: {e}")
                    profile_data = {}

            user_industries = profile_data.get("industries") or []
            industry_names = [ind.get("name") for ind in user_industries if ind.get("name")]
            industry_str = ", ".join(industry_names) or "Your Industry"

            analysis_data = {
                "user_id": str(user_id),
                "industry": industry_str,
                "skills_analysis": llm_data.get("skills_analysis") if isinstance(llm_data, dict) else []
            }
            await db.save_skill_analysis(user_id, analysis_data)

        elif report_type == "CAREER_ENHANCEMENT":
            try:
                advice_data = json.loads(generated_content)
                advice_data = self._normalize_career_advice(advice_data, profile_data)
            except Exception as json_err:
                logger.warning(f"Failed to parse or normalize CAREER_ENHANCEMENT JSON: {json_err}. Storing as raw content.")
                advice_data = {"raw_content": generated_content}
            await db.save_career_advice(user_id, advice_data)

        elif report_type in ["ENHANCED_RESUME", "ATS_RESUME"]:
            summary_text = self._extract_resume_summary(generated_content)

            from ProcessPDF.resume_pipeline.service import ResumeProcessor
            processor = ResumeProcessor()
            profile_embedding = processor._generate_embedding(summary_text)

            await db.save_jobseeker_profile_summary(user_id, summary_text, profile_embedding)

    def _normalize_career_advice(self, advice_data: dict, profile_data: dict) -> dict:
        """
        Normalize career advice data to ensure it matches the database / frontend schema.
        """
        if not isinstance(advice_data, dict):
            advice_data = {}

        # Ensure we have the base dictionaries
        career_paths = advice_data.get("career_paths") or {}
        if isinstance(career_paths, list):
            career_paths = {}

        # Normalize career paths
        normalized_paths = {
            "current_role": str(career_paths.get("current_role") or profile_data.get("profile", {}).get("headline") or "Software Engineer"),
            "next_role": str(career_paths.get("next_role") or "Senior Software Engineer"),
            "future_role": str(career_paths.get("future_role") or "Lead Architect")
        }

        # Normalize skill gaps
        skill_gaps = []
        for item in advice_data.get("skill_gaps") or []:
            if isinstance(item, dict) and "skill" in item:
                try:
                    importance = float(item.get("importance", 5.0))
                except (ValueError, TypeError):
                    importance = 5.0
                skill_gaps.append({
                    "skill": str(item.get("skill")),
                    "current_level": str(item.get("current_level") or "intermediate"),
                    "required_level": str(item.get("required_level") or "advanced"),
                    "importance": importance
                })
        
        # Sort skill gaps by importance descending
        skill_gaps = sorted(skill_gaps, key=lambda x: x.get("importance", 0.0), reverse=True)

        # Normalize recommendations
        recs = advice_data.get("recommendations") or {}
        if not isinstance(recs, dict):
            recs = {}
            
        courses = []
        for item in recs.get("courses") or []:
            if isinstance(item, dict) and "title" in item:
                courses.append({
                    "title": str(item.get("title")),
                    "provider": str(item.get("provider") or "Unknown Platform"),
                    "url": str(item.get("url") or "https://coursera.org")
                })
                
        certs = []
        for item in recs.get("certifications") or []:
            if isinstance(item, dict) and "title" in item:
                certs.append({
                    "title": str(item.get("title")),
                    "provider": str(item.get("provider") or "Unknown Issuer"),
                    "url": str(item.get("url") or "https://aws.amazon.com")
                })

        # Normalize action plan
        action_plan = []
        for item in advice_data.get("action_plan") or []:
            if isinstance(item, dict):
                action_plan.append({
                    "phase": str(item.get("phase") or item.get("step_number") or "Next Step"),
                    "action": str(item.get("action") or item.get("description") or ""),
                    "timeline": item.get("timeline") or item.get("phase") or "",
                    "resources": item.get("resources") or []
                })

        # Resolve industries
        user_industries = profile_data.get("industries") or []
        industry_names = [ind.get("name") for ind in user_industries if ind.get("name")]

        return {
            "career_paths": normalized_paths,
            "skill_gaps": skill_gaps,
            "recommendations": {
                "courses": courses,
                "certifications": certs
            },
            "action_plan": action_plan,
            "industries": industry_names
        }

    def _extract_resume_summary(self, generated_content: str) -> str:
        """
        Extracts the summary section or cleaned fallback text from the generated resume.
        """
        try:
            data = json.loads(generated_content)
            if isinstance(data, dict) and "summary" in data:
                return data["summary"]
        except Exception:
            pass

        summary_text = ""
        content_lower = generated_content.lower()
        if "professional summary" in content_lower:
            parts = re.split(r"(?i)professional summary[:\s]*", generated_content)
            if len(parts) > 1:
                summary_part = parts[1]
                next_sec = re.split(r"(?i)\n\s*(?:experience|work experience|education|skills|projects)\b", summary_part)
                summary_text = next_sec[0].strip()
        
        if not summary_text:
            summary_text = generated_content.strip()

        return re.sub(r"\*\*|##|#", "", summary_text).strip()

    async def _check_and_trigger_order_completion(self, db, order_id: int, user_id: UUID) -> None:
        """
        Checks if all reports under the order are COMPLETED. If yes, fires WhatsApp alert.
        """
        statuses = await db.get_order_report_statuses(order_id)
        
        if all(s == "COMPLETED" for s in statuses):
            user_rec = await db.get_user_contact_info(user_id)
            if user_rec and user_rec.get("phone"):
                dashboard_link = "http://localhost:3000/dashboard"
                self.whatsapp_service.send_reports_completed(
                    phone=user_rec["phone"],
                    name=user_rec.get("full_name") or "Candidate",
                    dashboard_link=dashboard_link
                )
                logger.info(f"All reports complete for order {order_id}. WhatsApp notification dispatched.")
