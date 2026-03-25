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
from uuid import uuid4
import io
import re
import logging

from api.database import engine, get_db, Base
from api.models import Job

# ── Resume Pipeline ───────────────────────────────────────────────────────────
from ai.Resume_Pipeline import (
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
app.mount("/icons", StaticFiles(directory=PUBLIC_DIR / "icons"), name="icons")
app.mount("/src", StaticFiles(directory=SRC_DIR), name="src")


# ── Pydantic models ───────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    resume_data: dict


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
            return {
                "user_id": str(user_id),
                "profile": {
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
                },
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

    return {"resume_data": parse_resume(text), "status": "basic_parse"}


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
