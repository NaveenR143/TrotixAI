# api/main.py
# FastAPI — serves React PWA + resume parse + PostgreSQL job matching
# Run: uvicorn api.main:app --reload --port 8000

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from pydantic import BaseModel
from pathlib import Path
from contextlib import asynccontextmanager
from uuid import UUID, uuid4
from typing import Any, Literal
import io
import re
import logging

from db.database import engine, get_db, Base
from db.models import Job

# ── Resume Pipeline ───────────────────────────────────────────────────────────
try:
    # Works when executed from repository root (python -m ai.main)
    from ai.Resume_Pipeline import (
        ResumeProcessor,
        JobSeekerRepository,
        AzureOpenAIResumeRefiner,
        ResumeProcessingError,
        FileValidationError,
        ParsingError,
    )
except ModuleNotFoundError:
    # Works when executed from ai/ directory (uvicorn main:app)
    from Resume_Pipeline import (
        ResumeProcessor,
        JobSeekerRepository,
        AzureOpenAIResumeRefiner,
        ResumeProcessingError,
        FileValidationError,
        ParsingError,
    )

# ── Optional deps ─────────────────────────────────────────────────────────────
try:
    import PyPDF2

    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    from docx import Document as DocxDocument

    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

# ── Logging ───────────────────────────────────────────────────────────────────
LOGGER = logging.getLogger("main")

# In-memory stores for workflow signals (can be moved to DB tables later).
PROFILE_CACHE: dict[str, dict[str, Any]] = {}
FEEDBACK_CACHE: dict[str, dict[str, set[str]]] = {}

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "client" / "public"
SRC_DIR = BASE_DIR / "client" / "src"

# ── Global state for resume processing ────────────────────────────────────────
resume_processor: ResumeProcessor | None = None
repository: JobSeekerRepository | None = None


# ── Startup: create tables if they don't exist ────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global resume_processor, repository
    
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize resume processor components
    try:
        repository = JobSeekerRepository()
        await repository.connect()
        
        ai_refiner = AzureOpenAIResumeRefiner()
        resume_processor = ResumeProcessor(
            repository=repository,
            ai_refiner=ai_refiner,
        )
        LOGGER.info("Resume processor initialized successfully")
    except Exception as e:
        LOGGER.warning(f"Resume processor initialization failed (optional): {e}")
        resume_processor = None
        repository = None
    
    yield
    
    # Cleanup
    if repository:
        await repository.close()
    await engine.dispose()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="TrotixAI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static mounts ─────────────────────────────────────────────────────────────
icons_dir = PUBLIC_DIR / "icons"
if icons_dir.exists():
    app.mount("/icons", StaticFiles(directory=icons_dir), name="icons")
else:
    LOGGER.warning("Skipping /icons static mount; directory missing: %s", icons_dir)

if SRC_DIR.exists():
    app.mount("/src", StaticFiles(directory=SRC_DIR), name="src")
else:
    LOGGER.warning("Skipping /src static mount; directory missing: %s", SRC_DIR)


# ── Pydantic models ───────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    resume_data: dict


class ProfileUpdateRequest(BaseModel):
    profile: dict[str, Any]


class FeedbackRequest(BaseModel):
    user_id: str
    job_id: str
    action: Literal["relevant", "not_relevant", "saved", "applied"]


class RecruiterJobCreateRequest(BaseModel):
    title: str
    company: str
    location: str | None = None
    experience: str | None = None
    salary: str | None = None
    summary: str | None = None
    description: str | None = None
    skills: list[str] = []
    apply_url: str | None = None


class CandidateDiscoverRequest(BaseModel):
    skills: list[str]
    limit: int = 20


class SkillGapRequest(BaseModel):
    target_role: str | None = None
    target_skills: list[str] = []


ROLE_SKILL_MAP: dict[str, list[str]] = {
    "backend": ["python", "fastapi", "sql", "postgresql", "docker", "aws"],
    "frontend": ["javascript", "typescript", "react", "css", "html"],
    "fullstack": ["javascript", "typescript", "react", "python", "fastapi", "sql"],
    "data": ["python", "sql", "pandas", "numpy", "machine learning"],
    "devops": ["docker", "kubernetes", "aws", "terraform", "ci/cd"],
}

COURSE_SUGGESTIONS: dict[str, str] = {
    "react": "https://www.coursera.org/search?query=react",
    "aws": "https://www.coursera.org/search?query=aws",
    "fastapi": "https://www.udemy.com/courses/search/?q=fastapi",
    "docker": "https://www.coursera.org/search?query=docker",
    "kubernetes": "https://www.coursera.org/search?query=kubernetes",
    "sql": "https://www.coursera.org/search?query=sql",
    "python": "https://www.coursera.org/search?query=python",
}


# ── Resume: text extraction ───────────────────────────────────────────────────
def extract_text(file_bytes: bytes, content_type: str) -> str:
    if content_type == "application/pdf" and PDF_SUPPORT:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if "wordprocessingml" in content_type and DOCX_SUPPORT:
        doc = DocxDocument(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)

    return file_bytes.decode("utf-8", errors="ignore")


# ── Resume: skill & metadata extraction ──────────────────────────────────────
SKILL_KEYWORDS = [
    "python",
    "javascript",
    "typescript",
    "java",
    "c++",
    "c#",
    "go",
    "rust",
    "kotlin",
    "swift",
    "php",
    "ruby",
    "scala",
    "r",
    "matlab",
    "react",
    "vue",
    "angular",
    "next.js",
    "svelte",
    "html",
    "css",
    "tailwind",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "spring",
    "rails",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "sklearn",
    "pandas",
    "numpy",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "aws",
    "gcp",
    "azure",
    "docker",
    "kubernetes",
    "ci/cd",
    "terraform",
    "github actions",
    "jenkins",
    "rest api",
    "graphql",
    "microservices",
    "agile",
    "scrum",
    "git",
]


def parse_resume(text: str) -> dict:
    text_lower = text.lower()
    skills = [s for s in SKILL_KEYWORDS if s in text_lower]

    exp_matches = re.findall(r"(\d+)\+?\s*years?", text_lower)
    experience_years = (
        max([int(x) for x in exp_matches], default=None) if exp_matches else None
    )

    title_patterns = [
        r"(software engineer|senior engineer|lead engineer|staff engineer)",
        r"(frontend developer|backend developer|full.?stack developer)",
        r"(data scientist|data engineer|ml engineer|ai engineer)",
        r"(product manager|engineering manager|tech lead)",
        r"(devops engineer|platform engineer|sre)",
    ]
    job_titles = list({m for p in title_patterns for m in re.findall(p, text_lower)})
    lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 40]

    return {
        "raw_text": text[:5000],
        "skills": skills,
        "experience_years": experience_years,
        "job_titles": job_titles,
        "summary": " ".join(lines[:2]) if lines else None,
    }


def _resolve_target_skills(target_role: str | None, target_skills: list[str]) -> list[str]:
    explicit = [s.lower() for s in target_skills if s]
    if explicit:
        return sorted(set(explicit))
    if target_role:
        role_key = target_role.strip().lower()
        return ROLE_SKILL_MAP.get(role_key, [])
    return []


def _compute_visibility(profile: dict[str, Any], vector: dict[str, Any]) -> tuple[int, list[str]]:
    recommendations: list[str] = []
    score = 0

    headline = profile.get("headline")
    summary = profile.get("summary")
    location = profile.get("current_location") or vector.get("location")
    exp = profile.get("years_of_experience") or vector.get("experience_years")
    skills = vector.get("skills", [])

    if headline:
        score += 20
    else:
        recommendations.append("Add a clear headline for better recruiter discovery.")

    if summary and len(str(summary).strip()) >= 60:
        score += 20
    else:
        recommendations.append("Expand your summary with impact and domain keywords.")

    if location:
        score += 10
    else:
        recommendations.append("Add your location or preferred work mode.")

    if exp is not None:
        score += 10
    else:
        recommendations.append("Add years of experience.")

    skill_count = len(skills)
    if skill_count >= 12:
        score += 25
    elif skill_count >= 7:
        score += 18
    elif skill_count >= 4:
        score += 12
    elif skill_count > 0:
        score += 6
        recommendations.append("Add more relevant technical skills (target at least 8).")
    else:
        recommendations.append("Add relevant technical skills.")

    keyword_hits = len(set(skills) & set(SKILL_KEYWORDS))
    score += min(15, keyword_hits)
    if keyword_hits < 5:
        recommendations.append("Include more market-trending keywords in your profile.")

    return min(100, score), recommendations


# ── DB: job matching query ────────────────────────────────────────────────────
async def fetch_matching_jobs(resume_data: dict, db: AsyncSession) -> list[dict]:
    """
    Query PostgreSQL for jobs whose skills array overlaps the resume skills.
    Uses the GIN index on jobs.skills for fast && (array overlap) queries.
    Falls back to all active jobs if resume has no detected skills.
    """
    resume_skills = resume_data.get("skills", [])

    if resume_skills:
        # && = PostgreSQL array overlap operator — hits the GIN index
        stmt = (
            select(Job)
            .where(Job.is_active == True)
            .where(Job.skills.overlap(resume_skills))
            .order_by(Job.created_at.desc())
            .limit(50)
        )
    else:
        stmt = (
            select(Job)
            .where(Job.is_active == True)
            .order_by(Job.created_at.desc())
            .limit(50)
        )

    result = await db.execute(stmt)
    rows = result.scalars().all()

    # Score by skill overlap percentage
    resume_skill_set = set(resume_skills)
    scored = []

    for job in rows:
        job_skills = set(job.skills or [])
        matched = list(resume_skill_set & job_skills)
        score = round((len(matched) / len(job_skills)) * 100) if job_skills else 0

        job_dict = job.to_dict()
        job_dict["matched_skills"] = matched
        job_dict["match_score"] = score
        scored.append(job_dict)

    scored.sort(key=lambda j: j["match_score"], reverse=True)
    return scored


# ── API Routes ────────────────────────────────────────────────────────────────


@app.post("/api/resume/parse")
async def parse_resume_endpoint(resume: UploadFile = File(...)):
    """Accept resume file → process with AI pipeline → return structured extracted data & job matches."""
    allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]
    if resume.content_type not in allowed:
        raise HTTPException(400, "Unsupported file type. Use PDF, DOCX, or TXT.")

    contents = await resume.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 5 MB.")

    # Use resume processor if available
    if resume_processor:
        try:
            user_id = uuid4()
            profile = await resume_processor.process_resume(
                user_id=user_id,
                file_name=resume.filename or "resume",
                file_bytes=contents,
                file_url=f"upload://{resume.filename}",
                mime_type=resume.content_type,
            )
            LOGGER.info(f"Resume processed successfully for user {user_id}")
            profile_payload = {
                "headline": profile.headline,
                "summary": profile.summary,
                "current_location": profile.current_location,
                "preferred_locations": profile.preferred_locations,
                "years_of_experience": str(profile.years_of_experience) if profile.years_of_experience else None,
                "notice_period_days": profile.notice_period_days,
                "current_salary": str(profile.current_salary) if profile.current_salary else None,
                "expected_salary": str(profile.expected_salary) if profile.expected_salary else None,
                "salary_currency": profile.salary_currency,
                "linkedin_url": profile.linkedin_url,
                "github_url": profile.github_url,
                "portfolio_url": profile.portfolio_url,
                "skills": profile.skills,
                "parsed_job_titles": profile.parsed_job_titles,
            }
            profile_vector = {
                "skills": sorted({s.lower() for s in profile.skills}),
                "titles": [t.lower() for t in profile.parsed_job_titles],
                "experience_years": str(profile.years_of_experience) if profile.years_of_experience else None,
                "location": profile.current_location,
            }
            PROFILE_CACHE[str(user_id)] = {
                "profile": profile_payload,
                "vector": profile_vector,
            }
            return {
                "user_id": str(user_id),
                "profile": profile_payload,
                "profile_vector": profile_vector,
                "status": "processed",
            }
        except (FileValidationError, ParsingError) as e:
            LOGGER.warning(f"Resume processing validation error: {e}")
            raise HTTPException(422, f"Resume processing error: {str(e)}")
        except ResumeProcessingError as e:
            LOGGER.error(f"Resume processing error: {e}")
            raise HTTPException(503, f"Resume processing failed: {str(e)}")
        except Exception as e:
            LOGGER.error(f"Unexpected error processing resume: {e}")
            raise HTTPException(503, f"Unexpected error: {str(e)}")
    
    # Fallback to basic parsing if processor is not available
    LOGGER.warning("Resume processor not available, using basic parsing")
    text = extract_text(contents, resume.content_type)
    if not text.strip():
        raise HTTPException(422, "Could not extract text from resume.")

    resume_data = parse_resume(text)
    user_id = str(uuid4())
    profile_vector = {
        "skills": sorted({s.lower() for s in resume_data.get("skills", [])}),
        "titles": [t.lower() for t in resume_data.get("job_titles", [])],
        "experience_years": resume_data.get("experience_years"),
        "location": None,
    }
    PROFILE_CACHE[user_id] = {
        "profile": resume_data,
        "vector": profile_vector,
    }
    return {
        "user_id": user_id,
        "resume_data": resume_data,
        "profile_vector": profile_vector,
        "status": "basic_parse",
    }


@app.put("/api/profile/{user_id}")
async def update_profile(user_id: str, req: ProfileUpdateRequest):
    """Allow users to tweak parsed profile data after resume extraction."""
    if user_id not in PROFILE_CACHE:
        raise HTTPException(404, "Profile not found.")
    PROFILE_CACHE[user_id]["profile"] = req.profile
    skills = req.profile.get("skills", []) if isinstance(req.profile, dict) else []
    PROFILE_CACHE[user_id]["vector"] = {
        "skills": sorted({str(s).lower() for s in skills}),
        "titles": [str(t).lower() for t in req.profile.get("parsed_job_titles", [])],
        "experience_years": req.profile.get("years_of_experience"),
        "location": req.profile.get("current_location"),
    }
    return {"user_id": user_id, "status": "updated"}


@app.post("/api/jobs/feedback")
async def job_feedback(req: FeedbackRequest):
    """Capture swipe/feed actions to improve recommendation signals."""
    user_state = FEEDBACK_CACHE.setdefault(
        req.user_id,
        {"relevant": set(), "not_relevant": set(), "saved": set(), "applied": set()},
    )
    user_state[req.action].add(req.job_id)
    if req.action == "not_relevant":
        user_state["relevant"].discard(req.job_id)
    if req.action == "applied":
        user_state["saved"].add(req.job_id)
    return {"status": "recorded", "action": req.action}


@app.post("/api/profile/{user_id}/skill-gap")
async def skill_gap(user_id: str, req: SkillGapRequest):
    """Skill Gap Engine: detect missing skills and suggest learning links."""
    profile_state = PROFILE_CACHE.get(user_id)
    if not profile_state:
        raise HTTPException(404, "Profile not found.")

    current_skills = set(profile_state.get("vector", {}).get("skills", []))
    target_skills = _resolve_target_skills(req.target_role, req.target_skills)
    if not target_skills:
        raise HTTPException(400, "Provide target_role or target_skills.")

    missing = sorted([skill for skill in target_skills if skill not in current_skills])
    covered = sorted([skill for skill in target_skills if skill in current_skills])

    suggestions = [
        {
            "skill": skill,
            "course_url": COURSE_SUGGESTIONS.get(
                skill,
                f"https://www.coursera.org/search?query={skill.replace(' ', '+')}",
            ),
        }
        for skill in missing
    ]

    return {
        "user_id": user_id,
        "target_role": req.target_role,
        "target_skills": target_skills,
        "covered_skills": covered,
        "missing_skills": missing,
        "suggested_learning": suggestions,
    }


@app.get("/api/profile/{user_id}/visibility-score")
async def resume_visibility_score(user_id: str):
    """Resume Visibility Score with actionable optimization suggestions."""
    profile_state = PROFILE_CACHE.get(user_id)
    if not profile_state:
        raise HTTPException(404, "Profile not found.")

    profile = profile_state.get("profile", {})
    vector = profile_state.get("vector", {})
    score, recommendations = _compute_visibility(profile, vector)

    percentile = max(1, min(99, score))
    return {
        "user_id": user_id,
        "visibility_score": score,
        "market_percentile": percentile,
        "recommendations": recommendations,
    }


@app.get("/api/jobs/feed/{user_id}")
async def personalized_job_feed(user_id: str, db: AsyncSession = Depends(get_db), limit: int = 30):
    """Daily feed optimization using profile vector and swipe/apply feedback."""
    profile_state = PROFILE_CACHE.get(user_id)
    if not profile_state:
        raise HTTPException(404, "Profile not found.")

    user_skills = set(profile_state.get("vector", {}).get("skills", []))
    feedback = FEEDBACK_CACHE.get(
        user_id,
        {"relevant": set(), "not_relevant": set(), "saved": set(), "applied": set()},
    )

    stmt = (
        select(Job)
        .where(Job.is_active == True)
        .order_by(Job.created_at.desc())
        .limit(200)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    ranked: list[dict[str, Any]] = []
    for job in rows:
        job_id = str(job.id)
        if job_id in feedback.get("not_relevant", set()):
            continue

        job_skills = {s.lower() for s in (job.skills or [])}
        matched = sorted(user_skills & job_skills)
        missing = sorted(job_skills - user_skills)
        base_score = round((len(matched) / len(job_skills)) * 100) if job_skills else 0

        boost = 0
        if job_id in feedback.get("relevant", set()):
            boost += 10
        if job_id in feedback.get("saved", set()):
            boost += 15
        if job_id in feedback.get("applied", set()):
            boost += 20

        final_score = max(0, min(100, base_score + boost))
        job_dict = job.to_dict()
        job_dict["matched_skills"] = matched
        job_dict["missing_skills"] = missing[:8]
        job_dict["match_score"] = final_score
        ranked.append(job_dict)

    ranked.sort(key=lambda j: j["match_score"], reverse=True)
    return {"jobs": ranked[: max(1, limit)], "total": len(ranked)}


@app.post("/api/recruiter/jobs")
async def create_recruiter_job(req: RecruiterJobCreateRequest, db: AsyncSession = Depends(get_db)):
    """Recruiter flow: create a job post for candidate discovery and matching."""
    job = Job(
        title=req.title,
        company=req.company,
        location=req.location,
        experience=req.experience,
        salary=req.salary,
        summary=req.summary,
        description=req.description,
        skills=[s.lower() for s in req.skills],
        apply_url=req.apply_url,
        is_active=True,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return {"job": job.to_dict(), "status": "created"}


@app.post("/api/recruiter/candidates/discover")
async def discover_candidates(req: CandidateDiscoverRequest):
    """Recruiter flow: find top candidate profiles by skill overlap."""
    target_skills = {s.lower() for s in req.skills}
    if not target_skills:
        raise HTTPException(400, "skills are required.")

    candidates: list[dict[str, Any]] = []
    for user_id, payload in PROFILE_CACHE.items():
        profile_skills = set(payload.get("vector", {}).get("skills", []))
        if not profile_skills:
            continue
        matched = sorted(target_skills & profile_skills)
        score = round((len(matched) / len(target_skills)) * 100)
        candidates.append(
            {
                "user_id": user_id,
                "match_score": score,
                "matched_skills": matched,
                "skills": sorted(profile_skills),
                "summary": payload.get("profile", {}).get("summary"),
                "headline": payload.get("profile", {}).get("headline"),
            }
        )

    candidates.sort(key=lambda item: item["match_score"], reverse=True)
    return {"candidates": candidates[: max(1, req.limit)], "total": len(candidates)}


@app.post("/api/jobs/match")
async def match_jobs(req: MatchRequest, db: AsyncSession = Depends(get_db)):
    """Return PostgreSQL jobs matching the parsed resume."""
    if not req.resume_data:
        raise HTTPException(400, "resume_data is required.")

    jobs = await fetch_matching_jobs(req.resume_data, db)

    if not jobs:
        raise HTTPException(
            404, "No matching jobs found. Try uploading a different resume."
        )

    return {"jobs": jobs, "total": len(jobs)}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch a single job by UUID."""
    try:
        stmt = select(Job).where(Job.id == job_id, Job.is_active == True)
        result = await db.execute(stmt)
        job = result.scalar_one_or_none()
    except Exception:
        raise HTTPException(400, "Invalid job ID.")

    if not job:
        raise HTTPException(404, "Job not found.")

    return job.to_dict()


@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    """Health check — verifies DB connectivity."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        raise HTTPException(503, f"Database unavailable: {e}")


# ── Static file routes (must come after /api routes) ─────────────────────────
@app.get("/manifest.json")
async def manifest():
    return FileResponse(PUBLIC_DIR / "manifest.json")


@app.get("/sw.js")
async def service_worker():
    return FileResponse(PUBLIC_DIR / "sw.js", media_type="application/javascript")


# SPA fallback — must be absolutely last
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    return FileResponse(PUBLIC_DIR / "index.html")
