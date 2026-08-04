from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class JobMetadataResponse(BaseModel):
    industries: List[dict]
    education_levels: List[dict]
    departments: List[dict]
    work_modes: List[str]
    job_types: List[str]
    experience_levels: List[str]

class JobCreateRequest(BaseModel):
    userid: UUID
    title: str
    company: str
    location: Optional[str] = ""
    work_mode: Optional[str] = ""
    openings: Optional[int] = 1
    industry_id: Optional[int] = None
    department_id: Optional[int] = None
    education_requirement: Optional[str] = ""
    experience_min: Optional[int] = 0
    experience_max: Optional[int] = 0
    experience_level: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    description: Optional[str] = ""
    skills: Optional[List[str]] = []
    email: Optional[str] = ""
    mobile: Optional[str] = ""
    direct_url: Optional[str] = None
    company_apply: Optional[bool] = False
    company_website: Optional[str] = None
    company_careers_url: Optional[str] = None
    job_type: Optional[str] = None

class JobCreateResponse(BaseModel):
    status: str
    message: str
    job_id: Optional[int] = None


class JobApplicationRequest(BaseModel):
    job_id: int
    user_id: UUID


class JobViewRequest(BaseModel):
    job_id: int
    user_id: UUID


class UpdateDirectUrlRequest(BaseModel):
    direct_url: str


class UpdateCompanyUrlsRequest(BaseModel):
    companyWebsiteUrl: Optional[str] = None
    companyCareersUrl: Optional[str] = None


