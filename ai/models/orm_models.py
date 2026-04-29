"""
ORM Models - SQLAlchemy ORM definitions for database tables
Synchronized with database schema from db_schemas/*.sql
"""

from sqlalchemy import (
    Column,
    String,
    Text,
    UUID,
    DateTime,
    Boolean,
    Integer,
    Float,
    Date,
    ARRAY,
    ForeignKey,
    Numeric,
    Enum,
    ForeignKeyConstraint,
    JSON,
    UniqueConstraint,
    PrimaryKeyConstraint,
)
from sqlalchemy.types import NullType
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from ai.db.database import Base


# ─────────────────────────────────────────────────────────────────────────────
# Enums (from 001_extensions_and_enums.sql)
# ─────────────────────────────────────────────────────────────────────────────


class UserRoleEnum(str, enum.Enum):
    jobseeker = "jobseeker"
    recruiter = "recruiter"
    admin = "admin"
    consultant = "consultant"


class UserStatusEnum(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    deleted = "deleted"
    pending_verification = "pending_verification"


class SkillLevelEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"


class GenderTypeEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer not to say"


class SalaryCurrencyEnum(str, enum.Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    AED = "AED"
    SGD = "SGD"


class JobStatusEnum(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    closed = "closed"
    expired = "expired"
    published = "published"


class JobTypeEnum(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    freelance = "freelance"
    internship = "internship"


class WorkModeEnum(str, enum.Enum):
    onsite = "onsite"
    remote = "remote"
    hybrid = "hybrid"


class ExpLevelEnum(str, enum.Enum):
    entry = "entry"
    junior = "junior"
    mid = "mid"
    senior = "senior"
    lead = "lead"
    executive = "executive"


class ApplyStatusEnum(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    interview_scheduled = "interview_scheduled"
    interview_completed = "interview_completed"
    offer_made = "offer_made"
    hired = "hired"
    rejected = "rejected"
    withdrawn = "withdrawn"


# ─────────────────────────────────────────────────────────────────────────────
# Users Table (from 002_users_and_companies.sql)
# ─────────────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=True, index=True)
    role = Column(
        Enum(UserRoleEnum, name="user_role", create_type=False),
        nullable=False,
        default=UserRoleEnum.jobseeker,
        index=True,
    )
    status = Column(
        Enum(UserStatusEnum, name="user_status", create_type=False),
        nullable=False,
        default=UserStatusEnum.pending_verification,
        index=True,
    )
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    industry_id = Column(
        Integer, ForeignKey("industries.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    jobseeker_profile = relationship(
        "JobseekerProfile",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )
    recruiter_profile = relationship(
        "RecruiterProfile",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )
    work_experiences = relationship(
        "WorkExperience", back_populates="user", cascade="all, delete-orphan"
    )
    education = relationship(
        "Education", back_populates="user", cascade="all, delete-orphan"
    )
    certifications = relationship(
        "Certification", back_populates="user", cascade="all, delete-orphan"
    )
    projects = relationship(
        "Project", back_populates="user", cascade="all, delete-orphan"
    )
    jobseeker_skills = relationship(
        "JobseekerSkill", back_populates="user", cascade="all, delete-orphan"
    )
    user_languages = relationship(
        "UserLanguage", back_populates="user", cascade="all, delete-orphan"
    )
    resumes = relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan"
    )
    resume_builder_docs = relationship(
        "ResumeBuilderDoc", back_populates="user", cascade="all, delete-orphan"
    )
    career_advice = relationship(
        "CareerAdvice", back_populates="user", cascade="all, delete-orphan"
    )
    skill_analysis = relationship(
        "SkillAnalysis", back_populates="user", cascade="all, delete-orphan"
    )
    industry = relationship("Industry")


# ─────────────────────────────────────────────────────────────────────────────
# Jobseeker Profile Table
# ─────────────────────────────────────────────────────────────────────────────


class JobseekerProfile(Base):
    __tablename__ = "jobseeker_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    headline = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    gender = Column(
        Enum(GenderTypeEnum, name="gender_type", create_type=False), nullable=True
    )
    date_of_birth = Column(Date, nullable=True)
    current_location = Column(String, nullable=True, index=True)
    preferred_locations = Column(ARRAY(String), nullable=True)
    years_of_experience = Column(Numeric(4, 1), nullable=True)
    notice_period_days = Column(Integer, nullable=True)
    current_salary = Column(Numeric(12, 2), nullable=True)
    expected_salary = Column(Numeric(12, 2), nullable=True)
    salary_currency = Column(
        Enum(SalaryCurrencyEnum, name="salary_currency", create_type=False),
        default=SalaryCurrencyEnum.INR,
    )
    is_actively_looking = Column(Boolean, default=True, index=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    profile_completion = Column(Integer, default=0)
    marital_status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="jobseeker_profile")


# ─────────────────────────────────────────────────────────────────────────────
# Skills Table
# ─────────────────────────────────────────────────────────────────────────────


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=True, index=True)
    aliases = Column(ARRAY(String), nullable=True)
    is_trending = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    jobseeker_skills = relationship(
        "JobseekerSkill", back_populates="skill", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Jobseeker Skills Table
# ─────────────────────────────────────────────────────────────────────────────


class JobseekerSkill(Base):
    __tablename__ = "jobseeker_skills"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_id = Column(
        Integer,
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    level = Column(
        Enum(SkillLevelEnum, name="skill_level", create_type=False),
        default=SkillLevelEnum.intermediate,
    )
    years = Column(Numeric(4, 1), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="jobseeker_skills")
    skill = relationship("Skill", back_populates="jobseeker_skills")


# ─────────────────────────────────────────────────────────────────────────────
# Languages Table
# ─────────────────────────────────────────────────────────────────────────────


class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True)
    language = Column(Text, nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user_languages = relationship(
        "UserLanguage", back_populates="language", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────────────────────────────────────
# User Languages Table
# ─────────────────────────────────────────────────────────────────────────────


class UserLanguage(Base):
    __tablename__ = "user_languages"
    __table_args__ = (PrimaryKeyConstraint("user_id", "language_id"),)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    language_id = Column(
        Integer,
        ForeignKey("languages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="user_languages")
    language = relationship("Language", back_populates="user_languages")


# ─────────────────────────────────────────────────────────────────────────────
# Work Experience Table
# ─────────────────────────────────────────────────────────────────────────────


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    skills_used = Column(ARRAY(String), nullable=True)
    achievements = Column(ARRAY(String), nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="work_experiences")
    company = relationship("Company", back_populates="work_experiences")
    projects = relationship(
        "Project", back_populates="work_experience", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Education Table
# ─────────────────────────────────────────────────────────────────────────────


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    institution = Column(String, nullable=False)
    degree = Column(String, nullable=True)
    field_of_study = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="education")


# ─────────────────────────────────────────────────────────────────────────────
# Certification Table
# ─────────────────────────────────────────────────────────────────────────────


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="certifications")


# ─────────────────────────────────────────────────────────────────────────────
# Companies Table (from 002_users_and_companies.sql)
# ─────────────────────────────────────────────────────────────────────────────


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    headquarters = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False, index=True)
    created_by = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # New fields found in DB
    careers_url = Column(String, nullable=True)
    hiring_email = Column(String, nullable=True)
    recruitment_agency = Column(Boolean, default=False)

    # Relationships
    work_experiences = relationship(
        "WorkExperience", back_populates="company", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Recruiter Profile Table (from 002_users_and_companies.sql)
# ─────────────────────────────────────────────────────────────────────────────


class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="recruiter_profile")


# ─────────────────────────────────────────────────────────────────────────────
# Projects Table (from 003_jobseeker_profiles_and_resumes.sql)
# ─────────────────────────────────────────────────────────────────────────────


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    work_experience_id = Column(
        Integer,
        ForeignKey("work_experiences.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    repo_url = Column(String, nullable=True)
    skills_used = Column(ARRAY(String), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="projects")
    work_experience = relationship("WorkExperience", back_populates="projects")


# ─────────────────────────────────────────────────────────────────────────────
# Resumes Table (from 003_jobseeker_profiles_and_resumes.sql)
# ─────────────────────────────────────────────────────────────────────────────


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    parsed_at = Column(DateTime(timezone=True), nullable=True)
    parsed_summary = Column(Text, nullable=True)
    resume_embedding = Column(NullType, nullable=True)  # pgvector column — use NullType to avoid varchar cast
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="resumes")


# ─────────────────────────────────────────────────────────────────────────────
# Resume Builder Docs Table (from 003_jobseeker_profiles_and_resumes.sql)
# ─────────────────────────────────────────────────────────────────────────────


class ResumeBuilderDoc(Base):
    __tablename__ = "resume_builder_docs"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False, default="My Resume")
    template = Column(String, default="modern")
    is_active = Column(Boolean, default=True)
    credits_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="resume_builder_docs")


# ─────────────────────────────────────────────────────────────────────────────
# Career Advice Table
# ─────────────────────────────────────────────────────────────────────────────


class CareerAdvice(Base):
    __tablename__ = "career_advice"

    id = Column(Integer, primary_key=True, autoincrement=True)
    advice = Column(JSON, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    created_date = Column(Date, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="career_advice")


class SkillAnalysis(Base):
    __tablename__ = "skill_analysis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_analysis = Column(JSON, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_date = Column(Date, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="skill_analysis")


# ─────────────────────────────────────────────────────────────────────────────
# Departments Table (NEW)
# ─────────────────────────────────────────────────────────────────────────────


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)  # bigint in DB
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# Recruiters Table (NEW)
# ─────────────────────────────────────────────────────────────────────────────


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True)  # bigint in DB
    company_id = Column(Integer, nullable=False, index=True)
    designation = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ─────────────────────────────────────────────────────────────────────────────
# Job Postings Table (UPDATED - full schema from actual database)
# ─────────────────────────────────────────────────────────────────────────────


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True)  # bigint in DB
    status = Column(
        Enum(JobStatusEnum, name="job_status", create_type=False),
        default=JobStatusEnum.draft,
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    experience_min_yrs = Column(Integer, nullable=True)
    experience_max_yrs = Column(Integer, nullable=True)
    experience_level = Column(
        Enum(ExpLevelEnum, name="exp_level", create_type=False), nullable=True
    )
    salary_min = Column(Numeric(12, 2), nullable=True)
    salary_max = Column(Numeric(12, 2), nullable=True)
    salary_currency = Column(
        Enum(SalaryCurrencyEnum, name="salary_currency", create_type=False),
        nullable=True,
    )
    salary_is_hidden = Column(Boolean, default=False)
    salary_display = Column(String, nullable=True)
    job_type = Column(
        Enum(JobTypeEnum, name="job_type", create_type=False), nullable=True, index=True
    )
    work_mode = Column(
        Enum(WorkModeEnum, name="work_mode", create_type=False),
        nullable=True,
        index=True,
    )
    openings = Column(Integer, default=1)
    department = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    recruiter_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    location = Column(String, nullable=True, index=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    apply_url = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_tags = Column(ARRAY(String), nullable=True)
    job_embedding = Column(NullType, nullable=True)  # pgvector column — use NullType to avoid varchar cast
    posted_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0)
    apply_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # New fields found in DB
    education_requirement = Column(Text, nullable=True)
    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    # Relationships
    company = relationship("Company")
    industry = relationship("Industry")
    dept = relationship("Department")


class JobApplication(Base):
    __tablename__ = "job_applications"
    __table_args__ = (
        UniqueConstraint("job_posting_id", "user_id", name="uq_job_user_application"),
    )

    id = Column(Integer, primary_key=True)
    job_posting_id = Column(
        Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    application_status = Column(
        Enum(ApplyStatusEnum, name="apply_status", create_type=False),
        default=ApplyStatusEnum.applied,
        nullable=False,
    )
    applied_date = Column(Date, server_default=func.now())
    recruiter_notes = Column(Text)
    feedback = Column(Text)
    updated_at = Column(
        Date, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    job = relationship("JobPosting", backref="applications")
    user = relationship("User", backref="applications")


# ─────────────────────────────────────────────────────────────────────────────
# Industries Table (NEW)
# ─────────────────────────────────────────────────────────────────────────────


class Industry(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)


# ─────────────────────────────────────────────────────────────────────────────
# Education Levels Table (NEW)
# ─────────────────────────────────────────────────────────────────────────────


class EducationLevel(Base):
    __tablename__ = "education_levels"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)


# ─────────────────────────────────────────────────────────────────────────────
# Job Skills Table (UPDATED - junction table for job_postings and skills)
# ─────────────────────────────────────────────────────────────────────────────


class JobSkill(Base):
    __tablename__ = "job_skills"
    __table_args__ = (PrimaryKeyConstraint("job_posting_id", "skills_id"),)

    job_posting_id = Column(
        Integer,
        ForeignKey("job_postings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skills_id = Column(
        Integer,
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_date = Column(Date, nullable=False, server_default=func.now())
