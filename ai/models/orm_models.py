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


# ─────────────────────────────────────────────────────────────────────────────
# Users Table (from 002_users_and_companies.sql)
# ─────────────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=True, index=True)
    role = Column(
        Enum(UserRoleEnum), nullable=False, default=UserRoleEnum.jobseeker, index=True
    )
    status = Column(
        Enum(UserStatusEnum),
        nullable=False,
        default=UserStatusEnum.pending_verification,
        index=True,
    )
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
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
    salary_currency = Column(Enum(SalaryCurrencyEnum), default=SalaryCurrencyEnum.INR)
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
    level = Column(Enum(SkillLevelEnum), default=SkillLevelEnum.intermediate)
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
    slug = Column(String, unique=True, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    industry = Column(String, nullable=True, index=True)
    size_range = Column(String, nullable=True)
    founded_year = Column(Integer, nullable=True)
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
    file_size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    parsed_at = Column(DateTime(timezone=True), nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_skills = Column(ARRAY(String), nullable=True)
    parsed_experience_years = Column(Numeric(4, 1), nullable=True)
    parsed_job_titles = Column(ARRAY(String), nullable=True)
    parsed_education = Column(JSON, nullable=True)
    parsed_summary = Column(Text, nullable=True)
    parse_credits_used = Column(Integer, default=0)
    improvement_score = Column(Integer, nullable=True)
    improvement_notes = Column(JSON, nullable=True)
    improvement_credits_used = Column(Integer, default=0)
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
