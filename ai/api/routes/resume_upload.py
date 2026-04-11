from io import BytesIO
from uuid import UUID
from fastapi import APIRouter, UploadFile, File, HTTPException
from ai.services.otp_service import send_otp
from ai.services.phonenumber_parser import extract_phone_numbers_from_file
from ai.db.phone_service import save_phone_to_db
from ai.db.resume_repository import ResumeRepository
from ai.db.database import AsyncSessionLocal

# from azure.storage.queue import QueueClient

# from ai.services.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner
# from ai.services.resume_pipeline.errors import FileValidationError
# from ai.services.resume_pipeline.repository import JobSeekerRepository
# from ai.services.resume_pipeline.service import ResumeProcessor
# from ai.services.storage_service import GoogleDriveService
from ai.services.azure_storage_service import AzureStorageService
import base64
import json
import os
import asyncio

router = APIRouter()

# Azure Queue setup
# AZURE_QUEUE_CONNECTION_STRING = os.getenv("AZURE_QUEUE_CONNECTION_STRING")
# QUEUE_NAME = os.getenv("RESUME_QUEUE_NAME", "resume-queue")
# queue_client = QueueClient.from_connection_string(
#     AZURE_QUEUE_CONNECTION_STRING, QUEUE_NAME
# )

# File upload constraints
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    """
    Simple test endpoint to verify file upload is working.
    """
    content = await file.read()
    return {
        "message": "File received successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
    }


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload resume (PDF/DOCX/DOC), extract phone numbers.
    - If 1 phone found → send OTP immediately
    - If multiple phones → return list for user to select primary
    """

    # Validate file
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, detail="File too large. Max size is 10 MB."
        )

    try:
        # Extract phone numbers
        phone_numbers = extract_phone_numbers_from_file(content, file.filename)

        if not phone_numbers:
            raise ValueError("No phone number found in resume")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 👉 Case 1: Multiple numbers → ask user to choose
    if len(phone_numbers) > 1:
        return {
            "message": "Multiple phone numbers found. Please select your primary number.",
            "phone_numbers": phone_numbers,
        }

    print(f"Extracted phone numbers: {phone_numbers}")

    # 👉 Case 2: Single number → proceed
    primary_phone = phone_numbers[0]

    try:
        async with AsyncSessionLocal() as session:
            user_id, is_existing = await save_phone_to_db(primary_phone, session)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    # Send OTP
    try:
        send_otp(primary_phone)
    except Exception as e:
        # We might still want to proceed if OTP fails, or fail the request.
        # Given it's a critical step, let's fail it.
        raise HTTPException(
            status_code=500, detail=f"Failed to send OTP: {str(e)}")

    # # Initiate Upload in background
    # uploaded_file_details = await AzureStorageService().upload_file(file, user_id)

    # if "upload_Failed" in uploaded_file_details:
    #     print(f"Background upload initiation failed: {uploaded_file_details}")
    #     # We don't necessarily want to fail the whole request if the background task initiation failed,
    #     # but it's good to log it.

    # print(f"Upload details: {uploaded_file_details}")

    return {
        "message": "OTP sent",
        "user_id": user_id,
        "phone": primary_phone,
        "new_user": not is_existing,
    }


@router.get("/resume-status-wait")
async def wait_for_resume_completion(phone: str):
    """
    Endpoint to poll resume status with exponential backoff for up to 50 seconds.

    Backoff schedule: 2s → 4s → 6s → 10s (capped at 10s for subsequent retries)

    Returns:
    - The status object if status becomes "completed" before timeout
    - {"status": "failed", "phone": phone} if timeout is reached
    """

    # Exponential backoff schedule: 2, 4, 6, 10, 10, 10, ...
    # Total 5 attempts with increasing delays
    backoff_delays = [5, 7, 10, 14, 20]
    max_total_time = 50  # seconds
    elapsed_time = 0
    attempt = 0

    while elapsed_time < max_total_time:
        try:
            async with AsyncSessionLocal() as session:
                resume_repository = ResumeRepository(session)
                resume_status = await resume_repository.get_resume_status(phone)

                # Check if completed
                if resume_status and resume_status.lower() == "completed":
                    return {
                        "phone": phone,
                        "resume_status": resume_status
                    }
        except Exception as e:
            print(f"Error checking resume status: {str(e)}")
            # Continue retrying on error

        # Calculate delay for next retry
        if attempt < len(backoff_delays):
            delay = backoff_delays[attempt]
        else:
            delay = backoff_delays[-1]  # Cap at 10 seconds

        # Check if adding delay would exceed total time
        if elapsed_time + delay >= max_total_time:
            break

        # Wait before next retry
        await asyncio.sleep(delay)
        elapsed_time += delay
        attempt += 1

    # Timeout reached - return failed status
    return {
        "status": "failed",
        "message": "Resume processing did not complete within 50 seconds"
    }
