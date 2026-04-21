
from ai.db.career_advisor_repository import CareerAdvisorRepository
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ai.services.ai_refiner_service import AzureOpenAIResumeRefiner

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
        cls, profile_data: Dict[str, Any], session: AsyncSession, force_refresh: bool = False
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

            # ✅ Step 5: Store in DB
            await CareerAdvisorRepository.save_user_advice(
                user_id=user_id, advice_data=structured_data, session=session
            )

            logger.info(f"Generated new career advice for user: {user_id}")

            return structured_data

        except Exception as e:
            logger.error(f"Error in career advice generation: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def enrich_advice(advice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add computed fields / improvements to advice
        """

        if not advice_data:
            return advice_data

        # Example: sort skill gaps by importance
        if "skill_gaps" in advice_data:
            advice_data["skill_gaps"] = sorted(
                advice_data["skill_gaps"],
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

        return {
            "experience": profile_data.get("experience", []),
            "education": profile_data.get("education", []),
            "skills": profile_data.get("skills", []),
            "projects": profile_data.get("projects", []),
            "current_role": profile_data.get("current_role"),
            "career_goal": profile_data.get("career_goal"),
        }

    @staticmethod
    def _normalize_ai_response(ai_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensure AI response matches expected schema
        """

        career_paths = ai_response.get("career_paths", {})
        if isinstance(career_paths, list):
            career_paths = {}

        action_plan = []
        for item in ai_response.get("action_plan", []):
            if isinstance(item, dict):
                action_plan.append({
                    "phase": item.get("phase") or item.get("step_number") or "Next Step",
                    "action": item.get("action") or item.get("description") or ""
                })

        return {
            "career_paths": career_paths,
            "skill_gaps": ai_response.get("skill_gaps", []),
            "recommendations": {
                "courses": ai_response.get("courses", []),
                "certifications": ai_response.get("certifications", []),
            },
            "action_plan": action_plan,
        }
