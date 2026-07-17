"""
Profile Routes - FastAPI endpoints for user profile operations
"""

from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging

from ai.db.database import get_db
from ai.services.profile_service import ProfileService
from ai.services.message_service import MessageService
from ai.services.career_advisor_service import CareerAdvisorService
from ai.services.resume_enhancer_service import ResumeEnhancerService
from ai.db.profile_repository import ProfileRepository
from ai.db.credit_repository import CreditRepository
from ai.db.resume_repository import ResumeRepository
from ai.services.azure_storage_service import AzureStorageService
from ai.utils.auth import get_current_user
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
    AchievementUpdate,
    BlockUpdateResponse,
    DropdownResponse,
    ManualProfileSubmission,
    SummaryUpdate,
    IndustriesUpdate,
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
    AIUsageSuccessResponse,
    AIUsageStatus,
    EnhancePhotoRequest,
    EnhancePhotoSuccessResponse,
    EnhancePhotoResponse,
    SaveEnhancedPhotoRequest,
    SaveEnhancedPhotoSuccessResponse,
    SaveEnhancedPhotoResponse,
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
    current_user_id: str = Depends(get_current_user),
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
        # If no user_id or phone provided, use current authenticated user
        if not phone and not user_id:
            user_id = UUID(current_user_id)
            logger.info(f"Using authenticated user_id: {user_id}")

        logger.info(f"Fetching profile - phone: {phone}, user_id: {user_id}")

        # Fetch profile
        profile_data = await ProfileService.fetch_user_profile(
            phone=phone, user_id=user_id, session=session
        )

        # Validate profile data
        validation_errors = ProfileService.validate_profile_data(profile_data)
        if validation_errors:
            logger.warning(f"Profile validation errors: {validation_errors}")
            # Log warning but do not block profile fetch with an exception

        # Enrich profile with computed fields
        profile_data = ProfileService.enrich_profile_data(profile_data)

        # Attach wallet balance if available
        try:
            wallet = await CreditRepository.get_wallet(profile_data.get("id"), session)
            if wallet and "balance" in wallet:
                profile_data["wallet_balance"] = wallet.get("balance")
                profile_data["wallet_updated_at"] = wallet.get("updated_at")
        except Exception as e:
            logger.warning(
                f"Unable to fetch wallet for user {profile_data.get('id')}: {e}")

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
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


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
    request: ProfileFetchRequest,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
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
        # If no user_id or phone provided, use current authenticated user
        if not request.phone and not request.user_id:
            request.user_id = UUID(current_user_id)
            logger.info(f"Using authenticated user_id: {request.user_id}")

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
            # Log warning but do not block profile fetch with an exception

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
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(f"Updating personal information for user: {user_id}")

        # Convert Pydantic model to dict, excluding None values
        update_dict = update_data.model_dump(exclude_none=True)

        if not update_dict:
            raise HTTPException(
                status_code=400, detail="No fields provided for update")

        # Perform update
        updated_profile = await ProfileRepository.update_personal_information(
            user_id, update_dict, session
        )

        logger.info(
            f"Personal information updated successfully for user: {user_id}")

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
        logger.error(
            f"Error updating personal information: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(f"Updating work experience for user: {user_id}")

        # Convert to dict
        exp_dict = experience_data.model_dump(exclude_none=True)
        experience_id = exp_dict.pop("experience_id", None)

        # Perform update
        updated_profile = await ProfileRepository.update_work_experience(
            user_id, exp_dict, session, experience_id
        )

        action = "updated" if experience_id else "added"
        logger.info(
            f"Work experience {action} successfully for user: {user_id}")

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
        logger.error(
            f"Error updating work experience: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
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
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


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
    user_id: UUID,
    skills_data: SkillsUpdate,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(f"Updating skills for user: {user_id}")

        if not skills_data.skills:
            raise HTTPException(
                status_code=400, detail="Skills list cannot be empty")

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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating skills: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/achievement/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Achievement",
    description="Add or update an achievement entry",
)
async def update_achievement(
    user_id: UUID,
    achievement_data: AchievementUpdate,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> BlockUpdateResponse:
    """
    Add or update achievement

    Args:
        user_id: User UUID
        achievement_data: Achievement details
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(f"Updating achievement for user: {user_id}")

        # Convert to dict
        ach_dict = achievement_data.model_dump(exclude_none=True)
        achievement_id = ach_dict.pop("id", None)

        # Perform update
        updated_profile = await ProfileRepository.update_achievement(
            user_id, ach_dict, session, achievement_id
        )

        action = "updated" if achievement_id else "added"
        logger.info(f"Achievement {action} successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message=f"Achievement {action} successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating achievement: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.delete(
    "/delete/achievement/{user_id}/{achievement_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Delete Achievement",
    description="Delete an achievement entry",
)
async def delete_achievement(
    user_id: UUID,
    achievement_id: int,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> BlockUpdateResponse:
    """
    Delete achievement

    Args:
        user_id: User UUID
        achievement_id: Achievement ID
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(
            f"Deleting achievement {achievement_id} for user: {user_id}")

        # Perform delete
        updated_profile = await ProfileRepository.delete_achievement(
            user_id, achievement_id, session
        )

        logger.info(f"Achievement deleted successfully for user: {user_id}")

        return BlockUpdateResponse(
            status="success",
            message="Achievement deleted successfully",
            data=updated_profile,
        )

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting achievement: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
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
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
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
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/viewed/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Profile Viewed Status",
    description="Mark user profile as viewed by setting profile_viewed to True",
)
async def update_profile_viewed(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> BlockUpdateResponse:
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(f"Updating profile viewed status for user: {user_id}")

        updated_profile = await ProfileService.update_profile_viewed(user_id, session)

        return BlockUpdateResponse(
            status="success",
            message="Profile viewed status updated successfully",
            data=updated_profile,
        )
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile viewed status: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}"
        )


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        print(f"Updating personal information for user: {user_id}")

        # Convert Pydantic model to dict, excluding None values
        update_dict = update_data.model_dump(exclude_none=True)

        if not update_dict:
            raise HTTPException(
                status_code=400, detail="No fields provided for update")

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
        logger.error(
            f"Error updating personal information: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/profile-summary/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Profile Summary Block",
    description="Update profile summary (summary, etc.)",
)
async def update_profile_summary(
    user_id: UUID,
    update_data: SummaryUpdate,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> BlockUpdateResponse:
    """
    Update profile summary block of user profile

    Args:
        user_id: User UUID
        update_data: Summary fields to update
        session: Database session

    Returns:
        BlockUpdateResponse with updated profile
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        print(f"Updating profile summary for user: {user_id}")

        # Convert Pydantic model to dict, excluding None values
        update_dict = update_data.model_dump(exclude_none=True)

        if not update_dict:
            raise HTTPException(
                status_code=400, detail="No fields provided for update")

        # Perform update
        update_result = await ProfileRepository.update_profile_summary(
            user_id, update_dict, session
        )

        updated_profile = update_result.get("profile")
        resume_id = update_result.get("resume_id")

        print(f"Profile summary updated successfully for user: {user_id}")

        if resume_id:
            message_service = MessageService()
            message_service.send_resumeid_to_queue(
                str(user_id), str(resume_id))

        return BlockUpdateResponse(
            status=update_result.get("status", "success"),
            message="Profile summary updated successfully",
            data=updated_profile,
        )

    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error updating profile summary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.post(
    "/manual-submission",
    response_model=ProfileSuccessResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Complete Manual Profile Submission",
    description="Submit all profile sections in a single transactional request",
)
async def submit_manual_profile(
    submission: ManualProfileSubmission,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> ProfileSuccessResponse:
    """
    Handle complete manual profile submission

    Args:
        submission: Complete profile data
        session: Database session
        current_user_id: Authenticated user ID

    Returns:
        ProfileSuccessResponse with updated profile data
    """
    try:
        logger.info(
            f"Manual profile submission for user: {submission.user_id}")

        # Security check: Ensure user is updating their own profile
        if str(submission.user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )

        # Convert to dict for repository
        submission_dict = submission.model_dump()

        # Perform update
        updated_profile = await ProfileRepository.submit_manual_profile(
            submission_dict, session
        )

        # Build response
        profile_response = UserProfileResponse(**updated_profile)
        return ProfileSuccessResponse(status="success", data=profile_response)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error submitting manual profile: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


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
    search: str = Query(..., description="Search term for skills"),
    limit: int = Query(100, description="Maximum number of results"),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> DropdownResponse:
    """
    Get all available skills for dropdown

    Args:
        session: Database session

    Returns:
        DropdownResponse with list of skills
    """
    try:
        logger.info(
            f"Fetching skills dropdown (search: {search}, limit: {limit})")

        skills = await ProfileRepository.get_skills_dropdown(
            session, search=search, limit=limit
        )

        logger.info(
            f"Skills dropdown fetched successfully, count: {len(skills)}")

        return DropdownResponse(status="success", data=skills)

    except Exception as e:
        logger.error(
            f"Error fetching skills dropdown: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.get(
    "/dropdowns/languages",
    response_model=DropdownResponse,
    responses={500: {"model": ProfileErrorResponse}},
    summary="Get Languages Dropdown",
    description="Fetch all available languages for dropdown selection",
)
async def get_languages_dropdown(
    search: str = Query(..., description="Search term for languages"),
    limit: int = Query(100, description="Maximum number of results"),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> DropdownResponse:
    """
    Get all available languages for dropdown

    Args:
        session: Database session
        search: Optional search term
        limit: Result limit

    Returns:
        DropdownResponse with list of languages
    """
    try:
        logger.info(
            f"Fetching languages dropdown (search: {search}, limit: {limit})")

        languages = await ProfileRepository.get_languages_dropdown(
            session, search=search, limit=limit
        )

        logger.info(
            f"Languages dropdown fetched successfully, count: {len(languages)}")

        return DropdownResponse(status="success", data=languages)

    except Exception as e:
        logger.error(
            f"Error fetching languages dropdown: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.get(
    "/dropdowns/industries",
    response_model=DropdownResponse,
    responses={500: {"model": ProfileErrorResponse}},
    summary="Get Industries Dropdown",
    description="Fetch all available industries for dropdown selection",
)
async def get_industries_dropdown(
    search: str = Query(None, description="Search term for industries"),
    limit: int = Query(100, description="Maximum number of results"),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> DropdownResponse:
    try:
        logger.info(
            f"Fetching industries dropdown (search: {search}, limit: {limit})")

        industries = await ProfileRepository.get_industries_dropdown(
            session, search=search, limit=limit
        )

        return DropdownResponse(status="success", data=industries)

    except Exception as e:
        logger.error(
            f"Error fetching industries dropdown: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.put(
    "/update/industries/{user_id}",
    response_model=BlockUpdateResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update User Industries",
    description="Update user selected industries",
)
async def update_user_industries(
    user_id: UUID,
    industries_data: IndustriesUpdate,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> BlockUpdateResponse:
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile",
            )
        logger.info(f"Updating industries for user: {user_id}")

        updated_profile = await ProfileRepository.update_user_industries(
            user_id, industries_data.industry_ids, session
        )

        return BlockUpdateResponse(
            status="success",
            message="Industries updated successfully",
            data=updated_profile,
        )

    except Exception as e:
        logger.error(
            f"Error updating industries: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


# ═════════════════════════════════════════════════════════════════════════════
# Profile Photo Endpoints
# ═════════════════════════════════════════════════════════════════════════════


@router.post(
    "/update-photo/{user_id}",
    responses={
        400: {"model": ProfileErrorResponse},
        403: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Update Profile Photo",
    description="Upload a new profile photo and update the user's avatar_url",
)
async def update_profile_photo(
    user_id: UUID,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Update profile photo

    Args:
        user_id: User UUID
        file: Image file (PNG, JPG, JPEG, GIF, WEBP)
        session: Database session
        current_user_id: Authenticated user ID

    Returns:
        JSON response with updated avatar_url
    """
    try:
        logger.info(f"Updating profile photo for user: {user_id}")

        # Security check: Ensure user is updating their own profile
        if str(user_id) != current_user_id:
            logger.warning(
                f"Unauthorized photo update attempt: {current_user_id} tried to update {user_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only update your own profile photo",
            )

        # 1. Upload to Azure Storage
        azure_service = AzureStorageService()
        avatar_url = await azure_service.upload_user_photo(file, str(user_id))

        # 2. Update database
        repo = ResumeRepository(session)
        success = await repo.update_avatar_url(str(user_id), avatar_url)

        if not success:
            logger.error(
                f"Failed to update database with avatar_url for user {user_id}"
            )
            raise HTTPException(
                status_code=500, detail="Failed to update database with new photo URL"
            )

        logger.info(f"Profile photo updated successfully for user: {user_id}")

        return {
            "status": "success",
            "message": "Profile photo updated successfully",
            "avatar_url": avatar_url,
        }

    except ValueError as e:
        logger.warning(f"Validation error updating photo: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile photo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.post(
    "/enhance-photo/{user_id}",
    response_model=EnhancePhotoSuccessResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        403: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Enhance Profile Photo with AI",
    description="Analyze and generate a professional corporate headshot of the user using GPT & DALL-E",
)
async def enhance_profile_photo(
    user_id: UUID,
    request: EnhancePhotoRequest,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> EnhancePhotoSuccessResponse:
    try:
        # Security check: Ensure user is updating their own profile
        if str(user_id) != current_user_id:
            logger.warning(
                f"Unauthorized photo enhance attempt: {current_user_id} tried to enhance {user_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only enhance your own profile photo",
            )

        from ai.services.ai_refiner_service import AzureOpenAIResumeRefiner
        refiner = AzureOpenAIResumeRefiner()
        
        # 1. Generate professional photo (calls prompt generation + DALL-E)
        generated_url = await refiner.generate_professional_photo(user_id, request.avatar_url, session)
        
        return EnhancePhotoSuccessResponse(
            status="success",
            data=EnhancePhotoResponse(enhanced_url=generated_url)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enhancing profile photo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}"
        )


@router.post(
    "/save-enhanced-photo/{user_id}",
    response_model=SaveEnhancedPhotoSuccessResponse,
    responses={
        400: {"model": ProfileErrorResponse},
        403: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Save Enhanced Profile Photo",
    description="Download enhanced photo from DALL-E temporary URL, upload to Azure storage, and update database",
)
async def save_enhanced_profile_photo(
    user_id: UUID,
    request: SaveEnhancedPhotoRequest,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> SaveEnhancedPhotoSuccessResponse:
    try:
        # Security check: Ensure user is updating their own profile
        if str(user_id) != current_user_id:
            logger.warning(
                f"Unauthorized photo save attempt: {current_user_id} tried to save enhanced photo for {user_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only save your own profile photo",
            )

        from ai.services.ai_refiner_service import AzureOpenAIResumeRefiner
        refiner = AzureOpenAIResumeRefiner()
        
        # 1. Upload generated image from temp URL to Azure Storage
        final_avatar_url = await refiner.upload_generated_image(request.enhanced_url, user_id)
        
        # 2. Update database
        success = await refiner.update_user_avatar(user_id, final_avatar_url, session)
        if not success:
            raise HTTPException(
                status_code=500, detail="Failed to update database with enhanced photo URL"
            )
            
        logger.info(f"Enhanced profile photo saved successfully for user: {user_id}")
        
        return SaveEnhancedPhotoSuccessResponse(
            status="success",
            data=SaveEnhancedPhotoResponse(avatar_url=final_avatar_url)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving enhanced profile photo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}"
        )


@router.get(
    "/get-photo",
    responses={
        404: {"model": ProfileErrorResponse},
        500: {"model": ProfileErrorResponse},
    },
    summary="Get Profile Photo Content",
    description="Retrieve the actual image content from Azure Blob Storage securely.",
)
async def get_profile_photo(
    avatar_url: str = Query(..., description="The blob URL to fetch"),
    current_user_id: str = Depends(get_current_user),
):
    """
    Fetch and stream the profile photo content.
    """
    try:
        azure_service = AzureStorageService()
        content, content_type = await azure_service.get_user_photo(avatar_url)

        from fastapi.responses import Response

        return Response(content=content, media_type=content_type)
    except Exception as e:
        logger.error(f"Failed to fetch profile photo: {str(e)}")
        raise HTTPException(
            status_code=404, detail="Photo not found or inaccessible")


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
    current_user_id: str = Depends(get_current_user),
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
        # If no user_id or phone provided, use current authenticated user
        if not phone and not user_id:
            user_id = UUID(current_user_id)
            logger.info(f"Using authenticated user_id: {user_id}")

        print(
            f"DEBUG: Career advice route hit - phone: {phone}, user_id: {user_id}")
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
            logger.warning(
                f"Profile insufficient for advice: {validation_errors}")
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
        logger.error(
            f"Error generating career advice: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
) -> CareerAdvisorSuccessResponse:
    """
    Fetch existing career advice from the database
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only access your own career advice"
            )
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
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


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
    force_refresh: bool = Query(
        False, description="Force regenerate recommendations using GPT"
    ),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> SkillDevelopmentSuccessResponse:
    """
    Generate personalized skill development recommendations based on industry trends.
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only access your own skill development analysis"
            )
        logger.info(
            f"Generating skill development analysis for user: {user_id}, force_refresh: {force_refresh}"
        )

        analysis_data = await CareerAdvisorService.generate_skill_development_plan(
            user_id=user_id, session=session, force_refresh=force_refresh
        )

        return SkillDevelopmentSuccessResponse(status="success", data=analysis_data)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(
            f"Error generating skill analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


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
    current_user_id: str = Depends(get_current_user),
) -> SkillDevelopmentSuccessResponse:
    """
    Fetch existing skill analysis from the database
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only access your own skill analysis"
            )
        logger.info(f"Fetching existing skill analysis for user: {user_id}")

        analysis_data = await CareerAdvisorService.get_existing_skill_analysis(
            user_id, session
        )

        if not analysis_data:
            logger.info(
                f"No existing skill analysis found for user: {user_id}")
            # We return an empty analysis rather than 404 to handle frontend states gracefully
            return SkillDevelopmentSuccessResponse(
                status="success",
                data=SkillDevelopmentAnalysis(
                    user_id=user_id, skills_analysis=[]),
            )

        # Build response
        response = SkillDevelopmentAnalysis(**analysis_data)

        return SkillDevelopmentSuccessResponse(status="success", data=response)

    except Exception as e:
        logger.error(
            f"Error fetching existing skill analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/ai-usage-status",
    response_model=AIUsageSuccessResponse,
    summary="Get Daily AI Usage Status",
    description="Check which AI features the user has already used today.",
)
async def get_ai_usage_status(
    user_id: UUID = Query(..., description="User UUID"),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
) -> AIUsageSuccessResponse:
    """
    Get the daily AI usage status for the user.
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only access your own AI usage status"
            )
        resume_repo = ResumeRepository(session)
        usage_data = await resume_repo.get_daily_ai_usage(str(user_id))

        return AIUsageSuccessResponse(
            status="success", data=AIUsageStatus(**usage_data)
        )
    except Exception as e:
        logger.error(f"Error fetching AI usage status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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
    current_user_id: str = Depends(get_current_user),
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
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only enhance your own resume"
            )
        logger.info(f"Enhancing resume for user: {user_id}")

        resume_repo = ResumeRepository(session)

        # ✅ Step 1: Fetch profile
        profile_data = await ProfileService.fetch_user_profile(
            user_id=user_id, session=session
        )

        if not profile_data:
            raise ValueError("User profile not found")

        # ✅ Step 2: Call AI enhancement service
        enhancer = ResumeEnhancerService()

        # Pass comprehensive profile data for premium enhancement
        enhancement_input = {
            "full_name": profile_data.get("full_name"),
            "headline": profile_data.get("headline"),
            "summary": profile_data.get("summary"),
            "skills": profile_data.get("skills", []),
            "experience": profile_data.get("experience", []),
            "projects": profile_data.get("projects", []),
            "languages": profile_data.get("languages", []),
            "education": profile_data.get("education", []),
            "certifications": profile_data.get("certifications", []),
            "industries": profile_data.get("industries", []),
        }

        enhanced_data = await enhancer.enhance_resume(enhancement_input)

        # ✅ Step 3: Log successful AI request
        await resume_repo.log_ai_usage(str(user_id), "enhance_resume")

        logger.info(f"Resume enhanced successfully for user: {user_id}")

        # ✅ Step 4: Build response
        response = EnhancedResume(**enhanced_data)

        return ResumeEnhanceSuccessResponse(status="success", data=response)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enhancing resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/download-resume/{candidate_id}",
    summary="Download Candidate Resume Securely",
    description="Securely stream candidate resume directly from Azure storage, checking recruiter or user authorization.",
)
async def download_candidate_resume(
    candidate_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Securely download candidate resume.
    """
    from ai.models.orm_models import User, UserRoleEnum
    from fastapi.responses import StreamingResponse
    from sqlalchemy import select
    import urllib.parse

    try:
        # 1. Fetch current user to validate authorization
        current_user_uuid = UUID(current_user_id)
        current_user_query = select(User).where(User.id == current_user_uuid)
        current_user_res = await session.execute(current_user_query)
        current_user = current_user_res.scalars().first()

        if not current_user:
            raise HTTPException(
                status_code=401,
                detail="Authentication required: User not found"
            )

        # 2. Fetch candidate
        candidate_query = select(User).where(User.id == candidate_id)
        candidate_res = await session.execute(candidate_query)
        candidate = candidate_res.scalars().first()

        if not candidate:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found"
            )

        # 3. Check access validation
        is_owner = (candidate_id == current_user_uuid)
        is_admin = (current_user.role == UserRoleEnum.admin)
        is_recruiter_or_consultant = current_user.role in [UserRoleEnum.recruiter, UserRoleEnum.consultant]

        if not (is_owner or is_admin or is_recruiter_or_consultant):
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You do not have permission to download this resume."
            )

        # 4. Check if candidate has resume
        if not candidate.resume_url:
            raise HTTPException(
                status_code=404,
                detail="No resume file available for this candidate."
            )

        # 5. Extract filename from URL
        filename = "resume.pdf"
        try:
            parts = candidate.resume_url.split('/')
            if parts:
                filename = urllib.parse.unquote(parts[-1])
        except Exception:
            pass

        # 6. Stream file from Azure Blob Storage using AzureStorageService
        try:
            storage_service = AzureStorageService()
            generator, content_type, content_length = storage_service.stream_blob(candidate.resume_url)
        except FileNotFoundError:
            raise HTTPException(
                status_code=404,
                detail="Resume file not found in storage."
            )
        except Exception as e:
            logger.error(f"Error fetching resume from Azure: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch file from storage: {str(e)}"
            )

        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(content_length),
            "Access-Control-Expose-Headers": "Content-Disposition",
        }

        return StreamingResponse(
            generator,
            media_type=content_type,
            headers=headers
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


from pydantic import BaseModel

class UnlockCandidateRequest(BaseModel):
    candidate_id: UUID

@router.post(
    "/unlock-candidate",
    summary="Unlock Candidate Contact Info",
    description="Unlock candidate's contact info for recruiter by inserting a record in recruiter_unlocked_candidates.",
)
async def unlock_candidate(
    request: UnlockCandidateRequest,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    from ai.models.orm_models import User, UserRoleEnum, RecruiterUnlockedCandidate
    from sqlalchemy import select
    
    try:
        recruiter_uuid = UUID(current_user_id)
        candidate_uuid = request.candidate_id

        # 1. Fetch and validate recruiter
        recruiter_query = select(User).where(User.id == recruiter_uuid)
        recruiter_res = await session.execute(recruiter_query)
        recruiter = recruiter_res.scalars().first()

        if not recruiter:
            raise HTTPException(
                status_code=401,
                detail="Authentication required: Recruiter not found"
            )

        if recruiter.role not in [UserRoleEnum.recruiter, UserRoleEnum.consultant, UserRoleEnum.admin]:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Only recruiters, consultants, or admins can unlock candidates."
            )

        # 2. Fetch and validate candidate
        candidate_query = select(User).where(User.id == candidate_uuid)
        candidate_res = await session.execute(candidate_query)
        candidate = candidate_res.scalars().first()

        if not candidate:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found"
            )

        # 3. Check if already unlocked
        unlock_query = select(RecruiterUnlockedCandidate).where(
            RecruiterUnlockedCandidate.recruiter_id == recruiter_uuid,
            RecruiterUnlockedCandidate.user_id == candidate_uuid
        )
        unlock_res = await session.execute(unlock_query)
        existing_unlock = unlock_res.scalars().first()

        if existing_unlock:
            return {
                "status": "success",
                "message": "Candidate is already unlocked",
                "email": candidate.email,
                "phone": candidate.phone
            }

        # 4. Insert unlock record
        new_unlock = RecruiterUnlockedCandidate(
            recruiter_id=recruiter_uuid,
            user_id=candidate_uuid
        )
        session.add(new_unlock)
        await session.commit()

        return {
            "status": "success",
            "message": "Candidate unlocked successfully",
            "email": candidate.email,
            "phone": candidate.phone
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlocking candidate: {str(e)}", exc_info=True)
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get(
    "/unlock-status/{candidate_id}",
    summary="Check Candidate Unlock Status",
    description="Check whether a candidate is unlocked for the recruiter.",
)
async def check_unlock_status(
    candidate_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    from ai.models.orm_models import User, UserRoleEnum, RecruiterUnlockedCandidate
    from sqlalchemy import select

    try:
        recruiter_uuid = UUID(current_user_id)
        candidate_uuid = candidate_id

        # 1. Fetch and validate recruiter
        recruiter_query = select(User).where(User.id == recruiter_uuid)
        recruiter_res = await session.execute(recruiter_query)
        recruiter = recruiter_res.scalars().first()

        if not recruiter:
            raise HTTPException(
                status_code=401,
                detail="Authentication required: Recruiter not found"
            )

        if recruiter.role not in [UserRoleEnum.recruiter, UserRoleEnum.consultant, UserRoleEnum.admin]:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Only recruiters, consultants, or admins can check unlock status."
            )

        # 2. Fetch and validate candidate
        candidate_query = select(User).where(User.id == candidate_uuid)
        candidate_res = await session.execute(candidate_query)
        candidate = candidate_res.scalars().first()

        if not candidate:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found"
            )

        # 3. Check if unlocked
        unlock_query = select(RecruiterUnlockedCandidate).where(
            RecruiterUnlockedCandidate.recruiter_id == recruiter_uuid,
            RecruiterUnlockedCandidate.user_id == candidate_uuid
        )
        unlock_res = await session.execute(unlock_query)
        existing_unlock = unlock_res.scalars().first()

        if existing_unlock:
            return {
                "status": "success",
                "unlocked": True,
                "email": candidate.email,
                "phone": candidate.phone
            }
        else:
            return {
                "status": "success",
                "unlocked": False
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking unlock status: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get(
    "/candidates",
    summary="Get List of Candidates for Recruiter",
    description="Fetch a paginated list of jobseeker candidates with server-side filtering, returning only non-sensitive data.",
)
async def list_candidates(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    industry: str = Query(None, description="Filter by Industry name"),
    location: str = Query(None, description="Filter by location (case-insensitive)"),
    experience_min: float = Query(None, description="Filter by minimum years of experience"),
    experience_max: float = Query(None, description="Filter by maximum years of experience"),
    skills: str = Query(None, description="Comma-separated list of skills"),
    notice_period_max: int = Query(None, description="Filter by maximum notice period in days"),
    current_company: str = Query(None, description="Filter by current company name"),
    session: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    from ai.models.orm_models import User, UserRoleEnum, UserStatusEnum, JobseekerProfile, JobseekerSkill, Skill, WorkExperience, Company, Industry
    from sqlalchemy import select, func, desc
    
    try:
        # Verify current user role
        recruiter_uuid = UUID(current_user_id)
        recruiter_query = select(User).where(User.id == recruiter_uuid)
        recruiter_res = await session.execute(recruiter_query)
        recruiter = recruiter_res.scalars().first()
        
        if not recruiter:
            raise HTTPException(
                status_code=401,
                detail="Authentication required: Recruiter not found"
            )
            
        if recruiter.role not in [UserRoleEnum.recruiter, UserRoleEnum.consultant, UserRoleEnum.admin]:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Only recruiters, consultants, or admins can access the talent pool."
            )
            
        # Build base query
        stmt = (
            select(User)
            .join(JobseekerProfile, User.id == JobseekerProfile.user_id)
            .where(User.role == UserRoleEnum.jobseeker)
            .where(User.status == UserStatusEnum.active)
        )
        
        # Apply filters
        # 1. Location
        if location and location.strip():
            stmt = stmt.where(JobseekerProfile.current_location.ilike(f"%{location.strip()}%"))
            
        # 2. Industry
        if industry and industry.strip():
            # Join user's industry
            stmt = stmt.join(Industry, User.industry_id == Industry.id)
            stmt = stmt.where(Industry.name.ilike(f"%{industry.strip()}%"))
            
        # 3. Experience Range
        if experience_min is not None:
            stmt = stmt.where(JobseekerProfile.years_of_experience >= experience_min)
        if experience_max is not None:
            stmt = stmt.where(JobseekerProfile.years_of_experience <= experience_max)
            
        # 4. Notice Period
        if notice_period_max is not None:
            stmt = stmt.where(JobseekerProfile.notice_period_days <= notice_period_max)
            
        # 5. Current Company
        if current_company and current_company.strip():
            # Join work experiences and companies, checking for current company
            stmt = (
                stmt.join(WorkExperience, User.id == WorkExperience.user_id)
                .join(Company, WorkExperience.company_id == Company.id)
                .where(WorkExperience.is_current == True)
                .where(Company.name.ilike(f"%{current_company.strip()}%"))
            )
            
        # 6. Skills
        if skills and skills.strip():
            skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
            if skill_list:
                stmt = (
                    stmt.join(JobseekerSkill, User.id == JobseekerSkill.user_id)
                    .join(Skill, JobseekerSkill.skill_id == Skill.id)
                    .where(func.lower(Skill.name).in_(skill_list))
                )
                
        # Group by User.id to avoid duplicates
        stmt = stmt.group_by(User.id, JobseekerProfile.id)
        
        # Total count query for pagination
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_res = await session.execute(count_stmt)
        total_count = count_res.scalar() or 0
        
        # Paginate and order by latest first
        stmt = stmt.order_by(desc(User.created_at)).limit(limit).offset(offset)
        
        res = await session.execute(stmt)
        users = res.scalars().all()
        
        candidates_data = []
        for u in users:
            # Fetch skills for this user
            skills_query = (
                select(Skill.name)
                .join(JobseekerSkill, Skill.id == JobseekerSkill.skill_id)
                .where(JobseekerSkill.user_id == u.id)
            )
            skills_res = await session.execute(skills_query)
            u_skills = [row[0] for row in skills_res.all()]
            
            # Fetch current designation from current work experience if headline is empty
            headline = u.jobseeker_profile.headline
            if not headline:
                exp_query = (
                    select(WorkExperience.title)
                    .where(WorkExperience.user_id == u.id)
                    .where(WorkExperience.is_current == True)
                    .limit(1)
                )
                exp_res = await session.execute(exp_query)
                current_title = exp_res.scalar_one_or_none()
                headline = current_title or "Jobseeker"
                
            candidates_data.append({
                "id": str(u.id),
                "full_name": u.full_name,
                "avatar_url": u.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.full_name}",
                "headline": headline,
                "years_of_experience": float(u.jobseeker_profile.years_of_experience) if u.jobseeker_profile.years_of_experience is not None else 0.0,
                "skills": u_skills
            })
            
        return {
            "status": "success",
            "data": candidates_data,
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing candidates: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


