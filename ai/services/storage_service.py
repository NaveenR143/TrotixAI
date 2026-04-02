# ai/services/storage_service.py
import os
import io
from dotenv import load_dotenv
from fastapi import UploadFile
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

load_dotenv()

class GoogleDriveService:
    def __init__(self):
        # Load service account credentials from a JSON file downloaded from Google Cloud Console
        self.credentials_path = os.getenv(
            "GOOGLE_APPLICATION_CREDENTIALS"
        )
        self.scopes = ["https://www.googleapis.com/auth/drive"]

        # You will need the exact ID of the 'trotixai_resumes' folder from its URL
        # Example URL: https://drive.google.com/drive/folders/1aBcD2eFgH3iJkL4mNoP5qRsTuVwXyZ
        # The ID is: 1aBcD2eFgH3iJkL4mNoP5qRsTuVwXyZ
        self.folder_id = os.getenv(
            "GOOGLE_DRIVE_FOLDER_ID"
        )

    def _get_service(self):
        creds = service_account.Credentials.from_service_account_file(
            self.credentials_path, scopes=self.scopes
        )
        return build("drive", "v3", credentials=creds)

    async def upload_file(self, file: UploadFile) -> dict:
        """Uploads a FastAPI UploadFile to Google Drive and returns metadata."""
        service = self._get_service()

        file_metadata = {"name": file.filename, "parents": [self.folder_id]}

        # Read the file contents securely
        contents = await file.read()
        await file.seek(0)  # Reset file pointer in case you need to read it again later

        media = MediaIoBaseUpload(
            io.BytesIO(contents), mimetype=file.content_type, resumable=True
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

        return uploaded_file
