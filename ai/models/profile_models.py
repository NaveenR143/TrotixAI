"""
Profile Models - Request/Response schemas using Pydantic V2
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID


# ─────────────────────────────────────────────────────────────────────────────
# Experience Models
# ─────────────────────────────────────────────────────────────────────────────


class WorkExperienceResponse(BaseModel):
    id: int
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    title: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    skills_used: Optional[List[str]] = []

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Education Models
# ─────────────────────────────────────────────────────────────────────────────


class EducationResponse(BaseModel):
    id: int
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_current: bool = False
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Certification Models
# ─────────────────────────────────────────────────────────────────────────────


class CertificationResponse(BaseModel):
    id: int
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_url: Optional[str] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Skill Models
# ─────────────────────────────────────────────────────────────────────────────


class SkillResponse(BaseModel):
    id: int
    name: str
    level: str = Field(
        default="intermediate", description="beginner, intermediate, advanced, expert"
    )
    years: Optional[float] = None
    is_primary: bool = False

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Language Models
# ─────────────────────────────────────────────────────────────────────────────


class LanguageResponse(BaseModel):
    language: str

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Project Models
# ─────────────────────────────────────────────────────────────────────────────


class ProjectResponse(BaseModel):
    id: int
    work_experience_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    repo_url: Optional[str] = None
    skills_used: Optional[List[str]] = []
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Full User Profile Response
# ─────────────────────────────────────────────────────────────────────────────


class UserProfileResponse(BaseModel):
    """Complete user profile data for the frontend"""

    # User Basic Info
    id: UUID
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    avatar_url: Optional[str] = None
    is_email_verified: bool = False
    is_phone_verified: bool = False

    # Jobseeker Profile
    headline: Optional[str] = None
    summary: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    date_of_birth: Optional[date] = None
    current_location: Optional[str] = None
    preferred_locations: Optional[List[str]] = []
    years_of_experience: Optional[float] = None
    notice_period_days: Optional[int] = None
    current_salary: Optional[float] = None
    expected_salary: Optional[float] = None
    salary_currency: Optional[str] = "INR"
    is_actively_looking: bool = True
    profile_completion: int = Field(default=0, ge=0, le=100)

    # Social Links
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    # Collections
    experience: List[WorkExperienceResponse] = []
    education: List[EducationResponse] = []
    skills: List[SkillResponse] = []
    certifications: List[CertificationResponse] = []
    languages: List[LanguageResponse] = []
    projects: List[ProjectResponse] = []

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────────────────────────────────────


class ProfileFetchRequest(BaseModel):
    """Request to fetch user profile (use phone or user_id)"""

    phone: Optional[str] = Field(None, description="Phone number of the user")
    user_id: Optional[UUID] = Field(None, description="UUID of the user")

    class Config:
        from_attributes = True


class ProfileErrorResponse(BaseModel):
    """Error response model"""

    status: str = "error"
    message: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ProfileSuccessResponse(BaseModel):
    """Success response wrapper"""

    status: str = "success"
    data: UserProfileResponse
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────────────────────────────────────
# Block-by-Block Update Request Models
# ─────────────────────────────────────────────────────────────────────────────


class PersonalInformationUpdate(BaseModel):
    """Update personal information block"""

    email: Optional[EmailStr] = Field(None, description="User email")
    phone: Optional[str] = Field(None, description="User phone number")
    full_name: Optional[str] = Field(None, description="Full name")
    headline: Optional[str] = Field(None, description="Professional headline")
    current_location: Optional[str] = Field(None, description="Current location")
    preferred_locations: Optional[List[str]] = Field(
        None, description="Preferred job locations"
    )
    date_of_birth: Optional[date] = Field(None, description="Date of birth")
    gender: Optional[str] = Field(None, description="Gender")
    portfolio_url: Optional[str] = Field(None, description="Portfolio URL")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn URL")
    github_url: Optional[str] = Field(None, description="GitHub URL")
    marital_status: Optional[str] = Field(None, description="Marital Status")

    class Config:
        from_attributes = True

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def handle_empty_date(cls, v):
        if v == "":
            return None
        return v


class WorkExperienceUpdate(BaseModel):
    """Update work experience (single entry)"""

    title: str = Field(..., description="Job title")
    company_id: Optional[int] = Field(None, description="Company ID")
    location: Optional[str] = Field(None, description="Work location")
    start_date: date = Field(..., description="Start date")
    end_date: Optional[date] = Field(None, description="End date")
    is_current: bool = Field(False, description="Is current job")
    description: Optional[str] = Field(None, description="Job description")
    skills_used: Optional[List[str]] = Field([], description="Skills used")
    achievements: Optional[List[str]] = Field([], description="Key achievements")
    experience_id: Optional[int] = Field(None, description="Experience ID for updates")

    class Config:
        from_attributes = True

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def handle_empty_dates(cls, v):
        if v == "":
            return None
        return v


class EducationUpdate(BaseModel):
    """Update education (single entry)"""

    institution: str = Field(..., description="School/University name")
    degree: Optional[str] = Field(None, description="Degree")
    field_of_study: Optional[str] = Field(None, description="Field of study")
    grade: Optional[str] = Field(None, description="Grade/CGPA")
    start_year: Optional[int] = Field(None, description="Start year")
    end_year: Optional[int] = Field(None, description="End year")
    is_current: bool = Field(False, description="Is currently studying")
    description: Optional[str] = Field(None, description="Description")
    education_id: Optional[str] = Field(None, description="Education ID for updates")

    class Config:
        from_attributes = True

    @field_validator("start_year", "end_year", mode="before")
    @classmethod
    def handle_empty_years(cls, v):
        if v == "":
            return None
        return v


class SkillsUpdate(BaseModel):
    """Update skills list"""

    skills: List[str] = Field(..., description="List of skill names")

    class Config:
        from_attributes = True


class LanguagesUpdate(BaseModel):
    """Update languages list"""

    languages: List[str] = Field(..., description="List of language names")

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    """Update project (single entry)"""

    title: str = Field(..., description="Project title")
    description: Optional[str] = Field(None, description="Project description")
    url: Optional[str] = Field(None, description="Live link")
    repo_url: Optional[str] = Field(None, description="Repository link")
    skills_used: Optional[List[str]] = Field([], description="Skills used")
    start_date: Optional[date] = Field(None, description="Start date")
    end_date: Optional[date] = Field(None, description="End date")
    project_id: Optional[int] = Field(None, description="Project ID for updates")

    class Config:
        from_attributes = True

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def handle_empty_dates(cls, v):
        if v == "":
            return None
        return v


class BlockUpdateResponse(BaseModel):
    """Generic success response for block updates"""

    status: str = "success"
    message: str
    data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────────────────────────────────────
# Dropdown/Lookup Models
# ─────────────────────────────────────────────────────────────────────────────


class DropdownItem(BaseModel):
    """Generic dropdown item"""

    id: Optional[str] = Field(None, description="Item ID")
    name: str = Field(..., description="Display name")
    value: Optional[str] = Field(None, description="Value")

    class Config:
        from_attributes = True


class SkillDropdownItem(BaseModel):
    """Skill dropdown item"""

    id: str = Field(..., description="Skill ID")
    name: str = Field(..., description="Skill name")
    category: Optional[str] = Field(None, description="Skill category")
    is_trending: bool = Field(False, description="Is trending")

    class Config:
        from_attributes = True


class LanguageDropdownItem(BaseModel):
    """Language dropdown item"""

    id: str = Field(..., description="Language ID")
    language: str = Field(..., description="Language name")

    class Config:
        from_attributes = True


class DropdownResponse(BaseModel):
    """Response containing dropdown data"""

    status: str = "success"
    data: List[dict] = Field(..., description="List of dropdown items")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
