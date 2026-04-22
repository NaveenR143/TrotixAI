"""
Profile Routes - FastAPI endpoints for user profile operations
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging

from ai.db.database import get_db
from ai.services.profile_service import ProfileService
from ai.services.career_advisor_service import CareerAdvisorService
from ai.services.resume_enhancer_service import ResumeEnhancerService
from ai.db.profile_repository import ProfileRepository
from ai.models.profile_models import (
    UserProfileResponse,
    ProfileSuccessResponse,
    ProfileErrorResponse,
    ProfileFetchRequest,
    PersonalInformationUpdate,
    WorkExperienceUpdate,
    EducationUpdate,
    SkillsUpdate,
    LanguagesUpdate,
    ProjectUpdate,
    BlockUpdateResponse,
    DropdownResponse,
)
from ai.models.career_models import (
    CareerAdvisorResponse,
    CareerAdvisorSuccessResponse,
    CareerAdvisorErrorResponse,
    SkillDevelopmentAnalysis,
    SkillDevelopmentSuccessResponse,
    ResumeEnhanceRequest,
    ResumeEnhanceSuccessResponse,
    EnhancedResume,
)

# Logger
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/fetch",
    response_model=ProfileSuccessResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Fetch User Profile",
    description="Retrieve complete user profile information by phone number or user ID",
)
async def fetch_user_profile(
    phone: str = Query(None, description="User phone number"),
    user_id: UUID = Query(None, description="User UUID"),
    session: AsyncSession = Depends(get_db),
) -> ProfileSuccessResponse:
    """
    Fetch complete user profile information

    Query Parameters:
    - phone: User phone number (alternative to user_id)
    - user_id: User UUID (alternative to phone)

    Returns:
        ProfileSuccessResponse with complete user profile data

    Raises:
        HTTPException 400: If neither phone nor user_id provided
        HTTPException 404: If user profile not found
        HTTPException 500: If database error occurs
    """

    try:
        # Validate input
        if not phone and not user_id:
            logger.warning("Fetch profile called without phone or user_id")
            raise HTTPException(
                status_code=400, detail="Either phone number or user_id is required"
            )

        logger.info(f"Fetching profile - phone: {phone}, user_id: {user_id}")

        # Fetch profile
        profile_data = await ProfileService.fetch_user_profile(
            phone=phone, user_id=user_id, session=session
        )

        # Validate profile data
        validation_errors = ProfileService.validate_profile_data(profile_data)
        if validation_errors:
            logger.warning(f"Profile validation errors: {validation_errors}")
            raise HTTPException(
                status_code=400,
                detail=f"Profile data validation failed: {validation_errors}",
            )

        # Enrich profile with computed fields
        profile_data = ProfileService.enrich_profile_data(profile_data)

        logger.info(f"Profile fetched successfully for user: {profile_data.get('id')}")

        # Build response
        profile_response = UserProfileResponse(**profile_data)

        return ProfileSuccessResponse(status="success", data=profile_response)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post(
    "/fetch-by-request",
    response_model=ProfileSuccessResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Fetch User Profile (POST)",
    description="Retrieve complete user profile information using POST request",
)
async def fetch_user_profile_post(
    request: ProfileFetchRequest, session: AsyncSession = Depends(get_db)
) -> ProfileSuccessResponse:
    """
    Fetch complete user profile information via POST

    Request Body:
        - phone: User phone number (optional)
        - user_id: User UUID (optional)

    Returns:
        ProfileSuccessResponse with complete user profile data

    Raises:
        HTTPException 400: If neither phone nor user_id provided
        HTTPException 404: If user profile not found
        HTTPException 500: If database error occurs
    """

    try:
        # Validate input
        if not request.phone and not request.user_id:
            logger.warning("Fetch profile POST called without phone or user_id")
            raise HTTPException(
                status_code=400, detail="Either phone number or user_id is required"
            )

        logger.info(
            f"Fetching profile (POST) - phone: {request.phone}, user_id: {request.user_id}"
        )

        # Fetch profile
        profile_data = await ProfileService.fetch_user_profile(
            phone=request.phone, user_id=request.user_id, session=session
        )

        # Validate profile data
        validation_errors = ProfileService.validate_profile_data(profile_data)
        if validation_errors:
            logger.warning(f"Profile validation errors: {validation_errors}")
            raise HTTPException(
                status_code=400,
                detail=f"Profile data validation failed: {validation_errors}",
            )

        # Enrich profile with computed fields
        profile_data = ProfileService.enrich_profile_data(profile_data)

        logger.info(
            f"Profile fetched successfully (POST) for user: {profile_data.get('id')}"
        )

        # Build response
        profile_response = UserProfileResponse(**profile_data)

        return ProfileSuccessResponse(status="success", data=profile_response)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile (POST): {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/health",
    summary="Profile API Health Check",
    description="Check if profile API is available",
)
async def health_check():
    """
    Health check endpoint for profile API
    """
    return {
        "status": "ok",
        "service": "profile-api",
        "message": "Profile API is running",
    }


# ═════════════════════════════════════════════════════════════════════════════
# Block-by-Block Update Endpoints
# ═════════════════════════════════════════════════════════════════════════════


@router.put(
    "/update/personal-information/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Personal Information Block",
    description="Update personal information (name, email, location, social links, etc.)",
)
async def update_personal_information(
    user_id: UUID,
    update_data: PersonalInformationUpdate,
    session: AsyncSession = Depends(get_db),
) -> BlockUpdateResponse:
    """
    Update personal information block of user profile

    Args:
        user_id: User UUID
        update_data: Personal information fields to update
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        logger.info(f"Updating personal information for user: {user_id}")

        # Convert Pydantic model to dict, excluding None values
        update_dict = update_data.model_dump(exclude_none=True)

        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        # Perform update
        updated_profile = await ProfileRepository.update_personal_information(
            user_id, update_dict, session
        )

        logger.info(f"Personal information updated successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message="Personal information updated successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating personal information: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/work-experience/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Work Experience",
    description="Add or update a work experience entry",
)
async def update_work_experience(
    user_id: UUID,
    experience_data: WorkExperienceUpdate,
    session: AsyncSession = Depends(get_db),
) -> BlockUpdateResponse:
    """
    Add or update work experience

    Args:
        user_id: User UUID
        experience_data: Experience details
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        logger.info(f"Updating work experience for user: {user_id}")

        # Convert to dict
        exp_dict = experience_data.model_dump(exclude_none=True)
        experience_id = exp_dict.pop("experience_id", None)

        # Perform update
        updated_profile = await ProfileRepository.update_work_experience(
            user_id, exp_dict, session, experience_id
        )

        action = "updated" if experience_id else "added"
        logger.info(f"Work experience {action} successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message=f"Work experience {action} successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating work experience: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/education/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Education",
    description="Add or update an education entry",
)
async def update_education(
    user_id: UUID,
    education_data: EducationUpdate,
    session: AsyncSession = Depends(get_db),
) -> BlockUpdateResponse:
    """
    Add or update education

    Args:
        user_id: User UUID
        education_data: Education details
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        logger.info(f"Updating education for user: {user_id}")

        # Convert to dict
        edu_dict = education_data.model_dump(exclude_none=True)
        education_id = edu_dict.pop("education_id", None)

        # Perform update
        updated_profile = await ProfileRepository.update_education(
            user_id, edu_dict, session, education_id
        )

        action = "updated" if education_id else "added"
        logger.info(f"Education {action} successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message=f"Education {action} successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating education: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/skills/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Skills",
    description="Update user skills (replaces all existing skills)",
)
async def update_skills(
    user_id: UUID, skills_data: SkillsUpdate, session: AsyncSession = Depends(get_db)
) -> BlockUpdateResponse:
    """
    Update user skills

    Args:
        user_id: User UUID
        skills_data: List of skill names
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        logger.info(f"Updating skills for user: {user_id}")

        if not skills_data.skills:
            raise HTTPException(status_code=400, detail="Skills list cannot be empty")

        # Perform update
        updated_profile = await ProfileRepository.update_skills(
            user_id, skills_data.skills, session
        )

        logger.info(f"Skills updated successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message="Skills updated successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating skills: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/project/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Project",
    description="Add or update a project entry",
)
async def update_project(
    user_id: UUID,
    project_data: ProjectUpdate,
    session: AsyncSession = Depends(get_db),
) -> BlockUpdateResponse:
    """
    Add or update project

    Args:
        user_id: User UUID
        project_data: Project details
        session: Async database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        logger.info(f"Updating project for user: {user_id}")

        # Convert to dict
        proj_dict = project_data.model_dump(exclude_none=True)
        project_id = proj_dict.pop("project_id", None)

        # Perform update
        updated_profile = await ProfileRepository.update_project(
            user_id, proj_dict, session, project_id
        )

        action = "updated" if project_id else "added"
        logger.info(f"Project {action} successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message=f"Project {action} successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/languages/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Languages",
    description="Update user languages (replaces all existing languages)",
)
async def update_languages(
    user_id: UUID,
    languages_data: LanguagesUpdate,
    session: AsyncSession = Depends(get_db),
) -> BlockUpdateResponse:
    """
    Update user languages

    Args:
        user_id: User UUID
        languages_data: List of language names
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        logger.info(f"Updating languages for user: {user_id}")

        if not languages_data.languages:
            raise HTTPException(
                status_code=400, detail="Languages list cannot be empty"
            )

        # Perform update
        updated_profile = await ProfileRepository.update_languages(
            user_id, languages_data.languages, session
        )

        logger.info(f"Languages updated successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message="Languages updated successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating languages: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/personal-info/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Personal Information Block",
    description="Update personal information (name, email, location, social links, etc.)",
)
async def update_personal_info(
    user_id: UUID,
    update_data: PersonalInformationUpdate,
    session: AsyncSession = Depends(get_db),
) -> BlockUpdateResponse:
    """
    Update personal information block of user profile

    Args:
        user_id: User UUID
        update_data: Personal information fields to update
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        print(f"Updating personal information for user: {user_id}")

        # Convert Pydantic model to dict, excluding None values
        update_dict = update_data.model_dump(exclude_none=True)

        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        # Perform update
        updated_profile = await ProfileRepository.update_personal_info(
            user_id, update_dict, session
        )

        print(f"Personal information updated successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message="Personal information updated successfully",
            data=updated_profile,
        )

    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating personal information: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ═════════════════════════════════════════════════════════════════════════════
# Dropdown/Lookup Endpoints
# ═════════════════════════════════════════════════════════════════════════════


@router.get(
    "/dropdowns/skills",
    response_model=DropdownResponse,
    responses={500: {"model": ProfileErrorResponse}},
    summary="Get Skills Dropdown",
    description="Fetch all available skills for dropdown selection",
)
async def get_skills_dropdown(
    session: AsyncSession = Depends(get_db),
) -> DropdownResponse:
    """
    Get all available skills for dropdown

    Args:
        session: Database session

    Returns:
        DropdownResponse with list of skills
    """
    try:
        logger.info("Fetching skills dropdown")

        skills = await ProfileRepository.get_skills_dropdown(session)

        logger.info(f"Skills dropdown fetched successfully, count: {len(skills)}")

        return DropdownResponse(status="success", data=skills)

    except Exception as e:
        logger.error(f"Error fetching skills dropdown: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get(
    "/dropdowns/languages",
    response_model=DropdownResponse,
    responses={500: {"model": ProfileErrorResponse}},
    summary="Get Languages Dropdown",
    description="Fetch all available languages for dropdown selection",
)
async def get_languages_dropdown(
    session: AsyncSession = Depends(get_db),
) -> DropdownResponse:
    """
    Get all available languages for dropdown

    Args:
        session: Database session

    Returns:
        DropdownResponse with list of languages
    """
    try:
        logger.info("Fetching languages dropdown")

        languages = await ProfileRepository.get_languages_dropdown(session)

        logger.info(f"Languages dropdown fetched successfully, count: {len(languages)}")

        return DropdownResponse(status="success", data=languages)

    except Exception as e:
        logger.error(f"Error fetching languages dropdown: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ═════════════════════════════════════════════════════════════════════════════
# Learning Path Endpoints
# ═════════════════════════════════════════════════════════════════════════════


@router.get(
    "/career-advice",
    response_model=CareerAdvisorSuccessResponse,
    responses={
        400: {"model": CareerAdvisorErrorResponse},
        404: {"model": CareerAdvisorErrorResponse},
        500: {"model": CareerAdvisorErrorResponse},
    },
    summary="Generate Career Advice",
    description="Generate personalized career roadmap, skill gaps, and recommendations using user profile",
)
async def get_career_advice(
    phone: str = Query(None, description="User phone number"),
    user_id: UUID = Query(None, description="User UUID"),
    force_refresh: bool = Query(
        False, description="Force regenerate recommendations using GPT"
    ),
    session: AsyncSession = Depends(get_db),
) -> CareerAdvisorSuccessResponse:
    """
    Generate personalized career recommendations

    Query Parameters:
    - phone: User phone number (alternative to user_id)
    - user_id: User UUID (alternative to phone)
    - force_refresh: If True, regenerate recommendations via GPT

    Returns:
        CareerAdvisorSuccessResponse with:
        - career paths
        - skill gaps
        - recommended courses & certifications
        - action plan

    Raises:
        HTTPException 400: Invalid input
        HTTPException 404: User/profile not found
        HTTPException 500: Internal error
    """

    try:
        # ✅ Validate input
        if not phone and not user_id:
            logger.warning("Career advice called without phone or user_id")
            raise HTTPException(
                status_code=400, detail="Either phone number or user_id is required"
            )

        print(f"DEBUG: Career advice route hit - phone: {phone}, user_id: {user_id}")
        logger.info(
            f"Generating career advice - phone: {phone}, user_id: {user_id}, force_refresh: {force_refresh}"
        )

        # ✅ Step 1: Fetch profile
        profile_data = await ProfileService.fetch_user_profile(
            phone=phone, user_id=user_id, session=session
        )

        if not profile_data:
            raise ValueError("User profile not found")

        # ✅ Step 2: Validate profile completeness
        validation_errors = CareerAdvisorService.validate_profile_for_advice(
            profile_data
        )
        if validation_errors:
            logger.warning(f"Profile insufficient for advice: {validation_errors}")
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient profile data: {validation_errors}",
            )

        # ✅ Step 3: Generate or fetch recommendations
        advice_data = await CareerAdvisorService.generate_career_advice(
            profile_data=profile_data, session=session, force_refresh=force_refresh
        )

        logger.info(
            f"Career advice generated successfully for user: {profile_data.get('id')}"
        )

        # ✅ Step 5: Build response
        response = CareerAdvisorResponse(**advice_data)

        return CareerAdvisorSuccessResponse(status="success", data=response)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error generating career advice: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/existing-career-advice",
    response_model=CareerAdvisorSuccessResponse,
    responses={
        400: {"model": CareerAdvisorErrorResponse},
        404: {"model": CareerAdvisorErrorResponse},
        500: {"model": CareerAdvisorErrorResponse},
    },
    summary="Fetch Existing Career Advice",
    description="Retrieve the latest saved career advice for a user",
)
async def fetch_existing_career_advice(
    user_id: UUID = Query(..., description="User UUID"),
    session: AsyncSession = Depends(get_db),
) -> CareerAdvisorSuccessResponse:
    """
    Fetch existing career advice from the database
    """
    try:
        logger.info(f"Fetching existing career advice for user: {user_id}")

        advice_data = await CareerAdvisorService.get_existing_advice(user_id, session)

        if not advice_data:
            logger.info(f"No existing career advice found for user: {user_id}")
            return CareerAdvisorSuccessResponse(status="success", data=None)

        # Build response
        response = CareerAdvisorResponse(**advice_data)

        return CareerAdvisorSuccessResponse(status="success", data=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching career advice: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/skill-development-analysis",
    response_model=SkillDevelopmentSuccessResponse,
    responses={
        400: {"model": CareerAdvisorErrorResponse},
        404: {"model": CareerAdvisorErrorResponse},
        500: {"model": CareerAdvisorErrorResponse},
    },
    summary="Get Industry-Specific Skill Development Analysis",
    description="Analyze user's current skills and recommend growth areas based on jobs in their industry.",
)
async def get_skill_development_analysis(
    user_id: UUID = Query(..., description="User UUID"),
    session: AsyncSession = Depends(get_db),
) -> SkillDevelopmentSuccessResponse:
    """
    Generate personalized skill development recommendations based on industry trends.
    """
    try:
        logger.info(f"Generating skill development analysis for user: {user_id}")

        analysis_data = await CareerAdvisorService.generate_skill_development_plan(
            user_id=user_id, session=session
        )

        return SkillDevelopmentSuccessResponse(status="success", data=analysis_data)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating skill analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/existing-skill-analysis",
    response_model=SkillDevelopmentSuccessResponse,
    responses={
        400: {"model": CareerAdvisorErrorResponse},
        404: {"model": CareerAdvisorErrorResponse},
        500: {"model": CareerAdvisorErrorResponse},
    },
    summary="Fetch Existing Skill Analysis",
    description="Retrieve the latest saved skill analysis for a user",
)
async def fetch_existing_skill_analysis(
    user_id: UUID = Query(..., description="User UUID"),
    session: AsyncSession = Depends(get_db),
) -> SkillDevelopmentSuccessResponse:
    """
    Fetch existing skill analysis from the database
    """
    try:
        logger.info(f"Fetching existing skill analysis for user: {user_id}")

        analysis_data = await CareerAdvisorService.get_existing_skill_analysis(
            user_id, session
        )

        if not analysis_data:
            logger.info(f"No existing skill analysis found for user: {user_id}")
            # We return an empty analysis rather than 404 to handle frontend states gracefully
            return SkillDevelopmentSuccessResponse(
                status="success",
                data=SkillDevelopmentAnalysis(user_id=user_id, skills_analysis=[]),
            )

        # Build response
        response = SkillDevelopmentAnalysis(**analysis_data)

        return SkillDevelopmentSuccessResponse(status="success", data=response)

    except Exception as e:
        logger.error(f"Error fetching existing skill analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post(
    "/enhance-resume",
    response_model=ResumeEnhanceSuccessResponse,
    responses={
        400: {"model": CareerAdvisorErrorResponse},
        404: {"model": CareerAdvisorErrorResponse},
        500: {"model": CareerAdvisorErrorResponse},
    },
    summary="Enhance User Resume with AI",
    description="Uses GPT to professionally rewrite summary, skills, experience, and projects.",
)
async def enhance_user_resume(
    request: ResumeEnhanceRequest,
    session: AsyncSession = Depends(get_db),
) -> ResumeEnhanceSuccessResponse:
    """
    Professionally enhance user resume content using AI.

    Args:
        request: Resume enhancement request containing user_id
        session: Database session

    Returns:
        ResumeEnhanceSuccessResponse with AI-enhanced content
    """
    try:
        user_id = request.user_id
        logger.info(f"Enhancing resume for user: {user_id}")

        # ✅ Step 1: Fetch profile
        profile_data = await ProfileService.fetch_user_profile(
            user_id=user_id, session=session
        )

        if not profile_data:
            raise ValueError("User profile not found")

        # ✅ Step 2: Call AI enhancement service
        enhancer = ResumeEnhancerService()

        # Pass only required sections for enhancement
        enhancement_input = {
            "skills": profile_data.get("skills", []),
            "experience": profile_data.get("experience", []),
            "projects": profile_data.get("projects", []),
            "languages": profile_data.get("languages", []),
            "education": profile_data.get("education", []),
        }

        enhanced_data = await enhancer.enhance_resume(enhancement_input)

        logger.info(f"Resume enhanced successfully for user: {user_id}")

        # ✅ Step 3: Build response
        response = EnhancedResume(**enhanced_data)

        return ResumeEnhanceSuccessResponse(status="success", data=response)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error enhancing resume: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
