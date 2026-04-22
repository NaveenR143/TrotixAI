from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID

class CareerPaths(BaseModel):
    current_role: Optional[str] = None
    next_role: Optional[str] = None
    future_role: Optional[str] = None

class SkillGap(BaseModel):
    skill: str
    current_level: Optional[str] = None
    required_level: Optional[str] = None
    importance: float = Field(..., ge=0, le=10)

class CareerRecommendationItem(BaseModel):
    title: str
    provider: str
    url: Optional[str] = None

class CareerRecommendations(BaseModel):
    courses: List[CareerRecommendationItem] = []
    certifications: List[CareerRecommendationItem] = []

class ActionPlanStep(BaseModel):
    phase: str
    action: str
    timeline: Optional[str] = None
    resources: List[str] = []

class CareerAdvisorResponse(BaseModel):
    career_paths: CareerPaths
    skill_gaps: List[SkillGap] = []
    recommendations: CareerRecommendations
    action_plan: List[ActionPlanStep] = []

class CareerAdvisorSuccessResponse(BaseModel):
    status: str = "success"
    data: Optional[CareerAdvisorResponse] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CareerAdvisorErrorResponse(BaseModel):
    status: str = "error"
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- New Skill Development Models ---

class SkillResource(BaseModel):
    name: str
    type: str = Field(..., description="course, certification, website, book, or project")
    provider: str
    url: str
    cost: str = Field(..., description="free or paid")
    description: str

class SkillAnalysisItem(BaseModel):
    skill: str
    category: str = Field(..., description="technical, soft, or domain-specific")
    importance_rationale: str
    learning_suggestions: List[str]
    resources: List[SkillResource] = []
    roadmap_priority: str = Field(..., description="short-term or long-term")

class SkillDevelopmentAnalysis(BaseModel):
    user_id: Optional[UUID] = None
    industry: Optional[str] = None
    skills_analysis: List[SkillAnalysisItem] = []

class SkillDevelopmentSuccessResponse(BaseModel):
    status: str = "success"
    data: SkillDevelopmentAnalysis
    timestamp: datetime = Field(default_factory=datetime.utcnow)
