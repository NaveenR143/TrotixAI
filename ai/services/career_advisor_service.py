from ai.db.career_advisor_repository import CareerAdvisorRepository
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from datetime import date
from enum import Enum


from ai.services.ai_refiner_service import AzureOpenAIResumeRefiner
from ai.utils.data_utils import clean_dict, json_serializable

logger = logging.getLogger(__name__)


class CareerAdvisorService:
    """Service layer for career advisor operations"""

    _ai_refiner: Optional[AzureOpenAIResumeRefiner] = None

    @classmethod
    def _get_refiner(cls) -> AzureOpenAIResumeRefiner:
        if cls._ai_refiner is None:
            cls._ai_refiner = AzureOpenAIResumeRefiner()
        return cls._ai_refiner

    @staticmethod
    def validate_profile_for_advice(profile_data: Dict[str, Any]) -> List[str]:
        """
        Validate if profile has enough data for generating advice
        """
        errors = []

        if not profile_data.get("skills"):
            errors.append("Skills missing")

        if not profile_data.get("experience"):
            errors.append("Experience missing")

        if not profile_data.get("education"):
            errors.append("Education missing")

        return errors

    @classmethod
    async def generate_career_advice(
        cls,
        profile_data: Dict[str, Any],
        session: AsyncSession,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate or fetch career advice

        Flow:
        1. Check cached recommendations
        2. If not available OR force_refresh → call GPT
        3. Store results
        4. Return structured response
        """

        if not profile_data:
            raise ValueError("Profile data is required")

        if not session:
            raise ValueError("Database session is required")

        user_id = profile_data.get("id")

        try:
            # ✅ Step 1: Check cache
            if not force_refresh:
                cached_data = await CareerAdvisorRepository.get_user_advice(
                    user_id, session
                )
                if cached_data:
                    logger.info(f"Returning cached career advice for user: {user_id}")
                    return cached_data

            # ✅ Step 2: Build GPT input
            gpt_input = cls._build_gpt_input(profile_data)

            # ✅ Step 3: Call AI service
            refiner = cls._get_refiner()
            ai_response = await refiner.generate_career_advice(profile_data=gpt_input)

            # ✅ Step 4: Normalize response
            structured_data = cls._normalize_ai_response(ai_response)

            # ✅ Step 5: Post-process / enrich
            structured_data = cls.enrich_advice(structured_data)

            # ✅ Step 6: Store in DB
            await CareerAdvisorRepository.save_user_advice(
                user_id=user_id, advice_data=structured_data, session=session
            )

            logger.info(f"Generated new career advice for user: {user_id}")

            return structured_data

        except Exception as e:
            logger.error(f"Error in career advice generation: {str(e)}", exc_info=True)
            raise

    @staticmethod
    async def get_existing_advice(
        user_id: UUID, session: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch existing career advice from database
        """
        return await CareerAdvisorRepository.get_user_advice(user_id, session)

    @staticmethod
    def enrich_advice(advice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add computed fields / improvements to advice
        """

        if not advice_data:
            return advice_data

        # Example: sort skill gaps by importance
        skill_gaps = advice_data.get("skill_gaps") or []
        if skill_gaps:
            advice_data["skill_gaps"] = sorted(
                skill_gaps,
                key=lambda x: x.get("importance", 0),
                reverse=True,
            )

        return advice_data

    # ---------------- PRIVATE METHODS ---------------- #

    @staticmethod
    def _build_gpt_input(profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform profile into GPT-friendly format
        """

        return clean_dict(
            {
                "experience": [
                    {
                        "company": exp.get("company_name"),
                        "role": exp.get("title"),
                        "duration": f"{json_serializable(exp.get('start_date'))} - {json_serializable(exp.get('end_date')) or 'present'}",
                        "summary": exp.get("description"),
                        "skills": exp.get("skills_used", []),
                    }
                    for exp in (profile_data.get("experience") or [])
                ],
                "education": [
                    {
                        "school": edu.get("institution"),
                        "degree": edu.get("degree"),
                        "field": edu.get("field_of_study"),
                        "year": edu.get("end_year"),
                    }
                    for edu in (profile_data.get("education") or [])
                ],
                "skills": list(
                    {
                        json_serializable(skill.get("name"))
                        for skill in (profile_data.get("skills") or [])
                    }
                ),
                "projects": [
                    {
                        "title": proj.get("title"),
                        "summary": proj.get("description"),
                        "skills": proj.get("skills_used", []),
                    }
                    for proj in (profile_data.get("projects") or [])
                ],
                "current_role": profile_data.get("current_role"),
                "career_goal": profile_data.get("career_goal"),
            }
        )

    @staticmethod
    def _normalize_ai_response(ai_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensure AI response matches expected schema
        """

        career_paths = ai_response.get("career_paths") or {}
        if isinstance(career_paths, list):
            career_paths = {}

        action_plan = []
        for item in ai_response.get("action_plan") or []:
            if isinstance(item, dict):
                action_plan.append(
                    {
                        "phase": str(
                            item.get("phase") or item.get("step_number") or "Next Step"
                        ),
                        "action": str(
                            item.get("action") or item.get("description") or ""
                        ),
                        "timeline": item.get("timeline"),
                        "resources": item.get("resources") or [],
                    }
                )

        return {
            "career_paths": career_paths,
            "skill_gaps": ai_response.get("skill_gaps") or [],
            "recommendations": {
                "courses": ai_response.get("courses") or [],
                "certifications": ai_response.get("certifications") or [],
            },
            "action_plan": action_plan,
        }

    @classmethod
    async def generate_skill_development_plan(
        cls,
        user_id: UUID,
        session: AsyncSession,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate a standalone skill development analysis based on industry trends.
        """
        from ai.services.profile_service import ProfileService

        try:
            # ✅ Step 1: Check cache
            if not force_refresh:
                cached_data = await CareerAdvisorRepository.get_user_skill_analysis(
                    user_id, session
                )
                if cached_data:
                    logger.info(f"Returning cached skill analysis for user: {user_id}")
                    return cached_data

            # 2. Fetch complete profile
            profile_data = await ProfileService.fetch_user_profile(
                user_id=user_id, session=session
            )

            # 2. Get industry_id (user specifically mentioned they added it to the users table)
            industry_id = profile_data.get("industry_id")

            if not industry_id:
                logger.warning(
                    f"No industry_id found for user {user_id}. Market trend analysis may be limited."
                )

            # 3. Fetch skills from job postings in the same industry that the user lacks
            market_skills = (
                await CareerAdvisorRepository.get_market_trend_skills_by_industry(
                    user_id=user_id, industry_id=industry_id or 0, session=session
                )
            )

            # 4. Prepare data for AI
            gpt_input = cls._build_gpt_input(profile_data)

            # 5. Call AI service for specialized skill analysis
            refiner = cls._get_refiner()
            ai_response = await refiner.generate_skill_development_analysis(
                profile_data=gpt_input, market_skills=market_skills
            )

            # 6. Normalize and format
            structured_data = {
                "user_id": str(user_id),
                "industry": profile_data.get("industry_name") or "Your Industry",
                "skills_analysis": ai_response.get("skills_analysis") or [],
            }

            # 7. Store in DB
            await CareerAdvisorRepository.save_user_skill_analysis(
                user_id=user_id, analysis_data=structured_data, session=session
            )

            logger.info(f"Generated new skill analysis for user: {user_id}")

            return structured_data

        except Exception as e:
            logger.error(f"Error generating skill analysis: {str(e)}", exc_info=True)
            raise

    @staticmethod
    async def get_existing_skill_analysis(
        user_id: UUID, session: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch existing skill analysis from database
        """
        return await CareerAdvisorRepository.get_user_skill_analysis(user_id, session)
