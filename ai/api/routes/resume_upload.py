from io import BytesIO
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException
from ai.services.otp_service import send_otp
from ai.services.phonenumber_parser import extract_phone_numbers_from_file
from ai.db.phone_service import save_phone_to_db
from ai.db.database import AsyncSessionLocal
from azure.storage.queue import QueueClient
from ai.services.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner
from ai.services.resume_pipeline.errors import FileValidationError
from ai.services.resume_pipeline.repository import JobSeekerRepository
from ai.services.resume_pipeline.service import ResumeProcessor
from ai.services.storage_service import GoogleDriveService
import base64
import json
import os

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
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    # Initiate Google Drive Upload in background
    uploaded_file_details = await GoogleDriveService().upload_file(file)

    if "upload_Failed" in uploaded_file_details:
        print(f"Background upload initiation failed: {uploaded_file_details}")
        # We don't necessarily want to fail the whole request if the background task initiation failed,
        # but it's good to log it.

    print(f"Upload details: {uploaded_file_details}")

    # Encode file content in base64 to safely send in JSON
    # payload = {
    #     "filename": file.filename,
    #     "content": base64.b64encode(content).decode("utf-8"),
    #     "phone_numbers": phone_numbers,
    # }

    # # Push message to Azure Queue
    # queue_client.send_message(json.dumps(payload))

    # pdf_bytes = await file.read()

    # MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

    # if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
    #     raise FileValidationError("File too large. Max size is 10 MB.")

    # pdf_stream = BytesIO(pdf_bytes)

    # repository = JobSeekerRepository()
    # await repository.connect()
    # try:
    #     processor = ResumeProcessor(
    #         repository=repository,
    #         ai_refiner=AzureOpenAIResumeRefiner(),
    #     )
    #     await processor.process_resume(
    #         user_id=uuid4(),
    #         file_name=file.filename,
    #         file_bytes=pdf_stream,
    #         raw_bytes=pdf_bytes,
    #         mime_type="application/pdf",
    #     )
    #     print("Resume processing demo completed.")
    # finally:
    #     await repository.close()

    return {
        "message": "OTP sent",
        "user_id": user_id,
        "phone": primary_phone,
        "new_user": not is_existing,
    }
