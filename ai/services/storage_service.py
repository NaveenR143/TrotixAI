# ai/services/storage_service.py
import asyncio
import os
import io
import logging
from dotenv import load_dotenv
from pathlib import Path
from fastapi import UploadFile
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

# Setup logging
LOGGER = logging.getLogger(__name__)

# Force correct path
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class GoogleDriveService:
    def __init__(self):

        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        self.folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

        if not self.credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        if not self.folder_id:
            raise ValueError("GOOGLE_DRIVE_FOLDER_ID not set")

        # Load service account credentials from a JSON file downloaded from Google Cloud Console

        self.scopes = ["https://www.googleapis.com/auth/drive"]

        # You will need the exact ID of the 'trotixai_resumes' folder from its URL
        # Example URL: https://drive.google.com/drive/folders/1aBcD2eFgH3iJkL4mNoP5qRsTuVwXyZ
        # The ID is: 1aBcD2eFgH3iJkL4mNoP5qRsTuVwXyZ

    def _get_service(self):
        try:
            if not self.credentials_path:
                raise ValueError(
                    "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set"
                )
            if not os.path.exists(self.credentials_path):
                raise FileNotFoundError(
                    f"Credentials file not found at: {self.credentials_path}"
                )

            creds = service_account.Credentials.from_service_account_file(
                self.credentials_path, scopes=self.scopes
            )
            return build("drive", "v3", credentials=creds)
        except Exception as e:
            LOGGER.error(f"Failed to create Google Drive service: {str(e)}")
            raise

    async def upload_file(self, file: UploadFile) -> str:
        """Starts the Google Drive upload in the background and returns immediately."""
        try:
            # Seek back to start just in case the caller already read it
            await file.seek(0)
            contents = await file.read()
            filename = file.filename
            content_type = file.content_type

            # Check if folder ID is set
            if not self.folder_id:
                raise ValueError(
                    "GOOGLE_DRIVE_FOLDER_ID environment variable is not set"
                )

            # Start background task to perform actual upload
            asyncio.create_task(self._execute_upload(contents, filename, content_type))

            return "upload_Started"
        except Exception as e:
            LOGGER.error(f"Error initiating file upload for {file.filename}: {str(e)}")
            return f"upload_Failed: {str(e)}"

    async def _execute_upload(self, contents: bytes, filename: str, content_type: str):
        """Actual logic for manual upload running in the background."""
        try:
            service = self._get_service()
            file_metadata = {"name": filename, "parents": [self.folder_id]}

            media = MediaIoBaseUpload(
                io.BytesIO(contents), mimetype=content_type, resumable=True
            )

            # Upload execution
            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, webViewLink, webContentLink",
                )
                .execute()
            )

            LOGGER.info(
                f"Successfully uploaded {filename} to Google Drive. ID: {uploaded_file.get('id')}"
            )
            return uploaded_file

        except Exception as e:
            LOGGER.error(f"Failed to upload {filename} to Google Drive: {str(e)}")
            # Since this is a background task, we don't raise it back to the client
            # but we should definitely log it.
