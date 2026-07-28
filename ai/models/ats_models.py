from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ATSContentResponse(BaseModel):
    project_details: str = Field(..., description="Optimized project description/accomplishments tailored to the job description.")
    experience_details: str = Field(..., description="Optimized current/recent experience details tailored to the job description.")
    skills: str = Field(..., description="Tailored skills list optimized for ATS readability.")

class ATSGenerationResponse(BaseModel):
    status: str
    data: ATSContentResponse

class ATSResumeExperienceResponse(BaseModel):
    company_name: Optional[str] = None
    title: Optional[str] = None
    description: str = Field(..., description="Optimized experience description tailored to the job description.")

class ATSResumeProjectResponse(BaseModel):
    title: Optional[str] = None
    description: str = Field(..., description="Optimized project description tailored to the job description.")

class ATSResumeContentResponse(BaseModel):
    summary: str = Field(..., description="Optimized summary tailored to the job description.")
    skills: str = Field(..., description="Tailored comma-separated skills list optimized for ATS readability.")
    experience: List[ATSResumeExperienceResponse] = Field(..., description="Optimized experience list matching candidate experiences.")
    projects: List[ATSResumeProjectResponse] = Field(..., description="Optimized projects list matching candidate projects.")

class ATSResumeGenerationResponse(BaseModel):
    status: str
    data: Dict[str, Any]

