"""
Models package - Pydantic and SQLAlchemy ORM models
"""

from ai.models.orm_models import (
    User,
    JobseekerProfile,
    RecruiterProfile,
    Company,
    WorkExperience,
    Education,
    Certification,
    Project,
    Resume,
    ResumeBuilderDoc,
    Skill,
    JobseekerSkill,
    UserRoleEnum,
    UserStatusEnum,
    SkillLevelEnum,
    GenderTypeEnum,
    SalaryCurrencyEnum,
)

from ai.models.profile_models import (
    UserProfileResponse,
    WorkExperienceResponse,
    EducationResponse,
    CertificationResponse,
    SkillResponse,
    ProfileFetchRequest,
    ProfileSuccessResponse,
    ProfileErrorResponse,
)

__all__ = [
    # ORM Models
    "User",
    "JobseekerProfile",
    "RecruiterProfile",
    "Company",
    "WorkExperience",
    "Education",
    "Certification",
    "Project",
    "Resume",
    "ResumeBuilderDoc",
    "Skill",
    "JobseekerSkill",
    # Enums
    "UserRoleEnum",
    "UserStatusEnum",
    "SkillLevelEnum",
    "GenderTypeEnum",
    "SalaryCurrencyEnum",
    # Pydantic Models
    "UserProfileResponse",
    "WorkExperienceResponse",
    "EducationResponse",
    "CertificationResponse",
    "SkillResponse",
    "ProfileFetchRequest",
    "ProfileSuccessResponse",
    "ProfileErrorResponse",
]
