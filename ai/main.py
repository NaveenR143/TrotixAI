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
import random

from ai.api.router import router

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
OTP_CACHE: dict[str, str] = {}

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "client" / "public"
SRC_DIR = BASE_DIR / "client" / "src"


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="TrotixAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

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


# ── API Routes ────────────────────────────────────────────────────────────────


@app.get("/test")
async def test_get():
    """Test GET endpoint."""
    return {
        "status": "success",
        "message": "GET /test working",
        "timestamp": str(PROFILE_CACHE.get("_test", {}))
    }


@app.post("/test")
async def test_post(data: dict = None):
    """Test POST endpoint."""
    return {
        "status": "success",
        "message": "POST /test working",
        "received_data": data or {}
    }


# @app.put("/api/profile/{user_id}")
# async def update_profile(user_id: str, req: ProfileUpdateRequest):
#     """Allow users to tweak parsed profile data after resume extraction."""
#     if user_id not in PROFILE_CACHE:
#         raise HTTPException(404, "Profile not found.")
#     PROFILE_CACHE[user_id]["profile"] = req.profile
#     skills = req.profile.get("skills", []) if isinstance(req.profile, dict) else []
#     PROFILE_CACHE[user_id]["vector"] = {
#         "skills": sorted({str(s).lower() for s in skills}),
#         "titles": [str(t).lower() for t in req.profile.get("parsed_job_titles", [])],
#         "experience_years": req.profile.get("years_of_experience"),
#         "location": req.profile.get("current_location"),
#     }
#     return {"user_id": user_id, "status": "updated"}


# @app.post("/api/jobs/feedback")
# async def job_feedback(req: FeedbackRequest):
#     """Capture swipe/feed actions to improve recommendation signals."""
#     user_state = FEEDBACK_CACHE.setdefault(
#         req.user_id,
#         {"relevant": set(), "not_relevant": set(), "saved": set(), "applied": set()},
#     )
#     user_state[req.action].add(req.job_id)
#     if req.action == "not_relevant":
#         user_state["relevant"].discard(req.job_id)
#     if req.action == "applied":
#         user_state["saved"].add(req.job_id)
#     return {"status": "recorded", "action": req.action}


# @app.post("/api/profile/{user_id}/skill-gap")
# async def skill_gap(user_id: str, req: SkillGapRequest):
#     """Skill Gap Engine: detect missing skills and suggest learning links."""
#     profile_state = PROFILE_CACHE.get(user_id)
#     if not profile_state:
#         raise HTTPException(404, "Profile not found.")

#     current_skills = set(profile_state.get("vector", {}).get("skills", []))
#     target_skills = _resolve_target_skills(req.target_role, req.target_skills)
#     if not target_skills:
#         raise HTTPException(400, "Provide target_role or target_skills.")

#     missing = sorted([skill for skill in target_skills if skill not in current_skills])
#     covered = sorted([skill for skill in target_skills if skill in current_skills])

#     suggestions = [
#         {
#             "skill": skill,
#             "course_url": COURSE_SUGGESTIONS.get(
#                 skill,
#                 f"https://www.coursera.org/search?query={skill.replace(' ', '+')}",
#             ),
#         }
#         for skill in missing
#     ]

#     return {
#         "user_id": user_id,
#         "target_role": req.target_role,
#         "target_skills": target_skills,
#         "covered_skills": covered,
#         "missing_skills": missing,
#         "suggested_learning": suggestions,
#     }


# @app.get("/api/profile/{user_id}/visibility-score")
# async def resume_visibility_score(user_id: str):
#     """Resume Visibility Score with actionable optimization suggestions."""
#     profile_state = PROFILE_CACHE.get(user_id)
#     if not profile_state:
#         raise HTTPException(404, "Profile not found.")

#     profile = profile_state.get("profile", {})
#     vector = profile_state.get("vector", {})
#     score, recommendations = _compute_visibility(profile, vector)

#     percentile = max(1, min(99, score))
#     return {
#         "user_id": user_id,
#         "visibility_score": score,
#         "market_percentile": percentile,
#         "recommendations": recommendations,
#     }


# @app.get("/api/jobs/feed/{user_id}")
# async def personalized_job_feed(
#     user_id: str, db: AsyncSession = Depends(get_db), limit: int = 30
# ):
#     """Daily feed optimization using profile vector and swipe/apply feedback."""
#     profile_state = PROFILE_CACHE.get(user_id)
#     if not profile_state:
#         raise HTTPException(404, "Profile not found.")

#     user_skills = set(profile_state.get("vector", {}).get("skills", []))
#     feedback = FEEDBACK_CACHE.get(
#         user_id,
#         {"relevant": set(), "not_relevant": set(), "saved": set(), "applied": set()},
#     )

#     stmt = (
#         select(Job)
#         .where(Job.is_active == True)
#         .order_by(Job.created_at.desc())
#         .limit(200)
#     )
#     result = await db.execute(stmt)
#     rows = result.scalars().all()

#     ranked: list[dict[str, Any]] = []
#     for job in rows:
#         job_id = str(job.id)
#         if job_id in feedback.get("not_relevant", set()):
#             continue

#         job_skills = {s.lower() for s in (job.skills or [])}
#         matched = sorted(user_skills & job_skills)
#         missing = sorted(job_skills - user_skills)
#         base_score = round((len(matched) / len(job_skills)) * 100) if job_skills else 0

#         boost = 0
#         if job_id in feedback.get("relevant", set()):
#             boost += 10
#         if job_id in feedback.get("saved", set()):
#             boost += 15
#         if job_id in feedback.get("applied", set()):
#             boost += 20

#         final_score = max(0, min(100, base_score + boost))
#         job_dict = job.to_dict()
#         job_dict["matched_skills"] = matched
#         job_dict["missing_skills"] = missing[:8]
#         job_dict["match_score"] = final_score
#         ranked.append(job_dict)

#     ranked.sort(key=lambda j: j["match_score"], reverse=True)
#     return {"jobs": ranked[: max(1, limit)], "total": len(ranked)}


# @app.post("/api/recruiter/jobs")
# async def create_recruiter_job(
#     req: RecruiterJobCreateRequest, db: AsyncSession = Depends(get_db)
# ):
#     """Recruiter flow: create a job post for candidate discovery and matching."""
#     job = Job(
#         title=req.title,
#         company=req.company,
#         location=req.location,
#         experience=req.experience,
#         salary=req.salary,
#         summary=req.summary,
#         description=req.description,
#         skills=[s.lower() for s in req.skills],
#         apply_url=req.apply_url,
#         is_active=True,
#     )
#     db.add(job)
#     await db.commit()
#     await db.refresh(job)
#     return {"job": job.to_dict(), "status": "created"}


# @app.post("/api/recruiter/candidates/discover")
# async def discover_candidates(req: CandidateDiscoverRequest):
#     """Recruiter flow: find top candidate profiles by skill overlap."""
#     target_skills = {s.lower() for s in req.skills}
#     if not target_skills:
#         raise HTTPException(400, "skills are required.")

#     candidates: list[dict[str, Any]] = []
#     for user_id, payload in PROFILE_CACHE.items():
#         profile_skills = set(payload.get("vector", {}).get("skills", []))
#         if not profile_skills:
#             continue
#         matched = sorted(target_skills & profile_skills)
#         score = round((len(matched) / len(target_skills)) * 100)
#         candidates.append(
#             {
#                 "user_id": user_id,
#                 "match_score": score,
#                 "matched_skills": matched,
#                 "skills": sorted(profile_skills),
#                 "summary": payload.get("profile", {}).get("summary"),
#                 "headline": payload.get("profile", {}).get("headline"),
#             }
#         )

#     candidates.sort(key=lambda item: item["match_score"], reverse=True)
#     return {"candidates": candidates[: max(1, req.limit)], "total": len(candidates)}


# @app.post("/api/jobs/match")
# async def match_jobs(req: MatchRequest, db: AsyncSession = Depends(get_db)):
#     """Return PostgreSQL jobs matching the parsed resume."""
#     if not req.resume_data:
#         raise HTTPException(400, "resume_data is required.")

#     jobs = await fetch_matching_jobs(req.resume_data, db)

#     if not jobs:
#         raise HTTPException(
#             404, "No matching jobs found. Try uploading a different resume."
#         )

#     return {"jobs": jobs, "total": len(jobs)}


# @app.get("/api/jobs/{job_id}")
# async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
#     """Fetch a single job by UUID."""
#     try:
#         stmt = select(Job).where(Job.id == job_id, Job.is_active == True)
#         result = await db.execute(stmt)
#         job = result.scalar_one_or_none()
#     except Exception:
#         raise HTTPException(400, "Invalid job ID.")

#     if not job:
#         raise HTTPException(404, "Job not found.")

#     return job.to_dict()


# @app.get("/health")
# async def health(db: AsyncSession = Depends(get_db)):
#     """Health check — verifies DB connectivity."""
#     try:
#         await db.execute(text("SELECT 1"))
#         return {"status": "ok", "db": "connected"}
#     except Exception as e:
#         raise HTTPException(503, f"Database unavailable: {e}")


# @app.post("/api/auth/generate-otp")
# async def generate_otp(req: GenerateOTPRequest):
#     """Generate a 4-digit OTP for a mobile number."""
#     # In a real app, integrate SMS provider (e.g., Twilio, AWS SNS) here
#     otp = str(random.randint(1000, 9999))
#     OTP_CACHE[req.mobile_number] = otp
#     LOGGER.info(f"Generated OTP {otp} for {req.mobile_number}")

#     # Note: We return the OTP here for development/testing purposes.
#     # In production, you would only return a success message and send the OTP via SMS.
#     return {
#         "status": "success",
#         "message": "OTP generated successfully",
#         "mobile_number": req.mobile_number,
#         "otp": otp,
#     }


# @app.post("/api/auth/validate-otp")
# async def validate_otp(req: ValidateOTPRequest):
#     """Validate the OTP for a mobile number."""
#     cached_otp = OTP_CACHE.get(req.mobile_number)

#     if not cached_otp:
#         raise HTTPException(status_code=400, detail="OTP not requested or expired.")

#     if cached_otp != req.otp:
#         raise HTTPException(status_code=400, detail="Invalid OTP.")

#     # Clean up OTP after successful validation
#     del OTP_CACHE[req.mobile_number]

#     return {
#         "status": "success",
#         "message": "OTP validated successfully",
#         "mobile_number": req.mobile_number,
#     }


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
    # Exclude API routes from SPA fallback to avoid confusing HTML responses
    api_prefixes = ["profile", "jobs", "otp", "resume-process"]
    if any(full_path.startswith(prefix) for prefix in api_prefixes):
        raise HTTPException(status_code=404, detail=f"API route '/{full_path}' not found")
        
    return FileResponse(PUBLIC_DIR / "index.html")
