from fastapi import APIRouter, UploadFile, File, HTTPException
from ai.services.otp_service import send_otp
from ai.services.phonenumber_parser import extract_phone_numbers_from_file
from ai.db.phone_service import save_phone_to_db
from ai.db.database import AsyncSessionLocal
from azure.storage.queue import QueueClient
import base64
import json
import os

router = APIRouter()

# Azure Queue setup
AZURE_QUEUE_CONNECTION_STRING = os.getenv("AZURE_QUEUE_CONNECTION_STRING")
QUEUE_NAME = os.getenv("RESUME_QUEUE_NAME", "resume-queue")
queue_client = QueueClient.from_connection_string(
    AZURE_QUEUE_CONNECTION_STRING, QUEUE_NAME)

# File upload constraints
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload resume (PDF/DOCX/DOC), extract phone numbers.
    - If 1 phone found → send OTP immediately
    - If multiple phones → return list for user to select primary
    """
    if not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, detail="File too large. Max size is 10 MB.")

    phone_numbers = extract_phone_numbers_from_file(content, file.filename)

    if not phone_numbers:
        raise HTTPException(
            status_code=400, detail="No phone number found in resume")

    temp_primary = phone_numbers[0]  # Default to first number for DB save

    try:
        async with AsyncSessionLocal() as session:
            user_id, is_existing = await save_phone_to_db(temp_primary, session)

        if is_existing:

            send_otp(temp_primary)

            return {
                "message": "Profile already exists. OTP sent",
                "user_id": user_id,
                "phone": temp_primary
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    # Encode file content in base64 to safely send in JSON
    payload = {
        "filename": file.filename,
        "content": base64.b64encode(content).decode("utf-8"),
        "phone_numbers": phone_numbers
    }

    # Push message to Azure Queue
    queue_client.send_message(json.dumps(payload))

    if len(phone_numbers) == 1:
        # Only 1 phone → save to DB and send OTP
        primary_phone = phone_numbers[0]

        send_otp(primary_phone)

        return {
            "message": "OTP sent",
            "user_id": user_id,
            "phone": primary_phone
        }

    # Multiple phones → ask user to choose primary
    return {
        "message": "Multiple phone numbers found. Please select your primary number.",
        "phone_numbers": phone_numbers
    }
