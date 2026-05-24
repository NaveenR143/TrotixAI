# ai/services/azure_storage_service.py
import asyncio
import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from fastapi import UploadFile
from azure.storage.blob import BlobServiceClient
from azure.storage.blob import StandardBlobTier
from .message_service import MessageService

# Setup logging
LOGGER = logging.getLogger(__name__)

# Force correct path
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class AzureStorageService:
    """Service for uploading PDF files to Azure Blob Storage."""

    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_CONTAINER_NAME", "trotixai")
        self.blob_tier = "cool"

        if not self.connection_string:
            raise ValueError(
                "AZURE_STORAGE_CONNECTION_STRING environment variable not set"
            )

    def _get_blob_client(self):
        """Get or create blob service client and ensure container exists."""
        try:
            blob_service_client = BlobServiceClient.from_connection_string(
                self.connection_string
            )

            # Create container if it doesn't exist
            try:
                blob_service_client.create_container(self.container_name)
                LOGGER.info(f"Container '{self.container_name}' created.")
            except Exception:
                LOGGER.debug(f"Container '{self.container_name}' already exists.")

            return blob_service_client
        except Exception as e:
            LOGGER.error(f"Failed to create blob service client: {str(e)}")
            raise

    async def _execute_upload(
        self, contents: bytes | str, filename: str, user_id: str
    ) -> None:
        """Upload PDF file to Azure Blob Storage."""
        try:
            # Validate PDF file
            if not filename.lower().endswith(".pdf"):
                raise ValueError(f"Only PDF files are supported. Got: {filename}")

            # Ensure contents is bytes
            if isinstance(contents, str):
                contents = contents.encode("utf-8")

            # Resolve blob tier safely
            tier_map = {
                "hot": StandardBlobTier.Hot,
                "cool": StandardBlobTier.Cool,
                "archive": StandardBlobTier.Archive,
            }

            blob_tier = None
            if self.blob_tier:
                blob_tier = tier_map.get(str(self.blob_tier).lower())
                if not blob_tier:
                    raise ValueError(f"Invalid blob tier: {self.blob_tier}")

            blob_service_client = self._get_blob_client()
            blob_client = blob_service_client.get_blob_client(
                container=self.container_name, blob=filename
            )

            # Upload blob
            upload_kwargs = {
                "overwrite": True,
            }
            if blob_tier:
                upload_kwargs["standard_blob_tier"] = blob_tier

            blob_client.upload_blob(contents, **upload_kwargs)

            # Get the blob URL
            blob_url = blob_client.url

            print(
                f"Successfully uploaded '{filename}' to container "
                f"'{self.container_name}' with tier '{blob_tier}'"
            )
            print(f"Uploaded file path: {blob_url}")

            # Send message to queue
            message_service = MessageService()
            message_service.send_to_queue(user_id, blob_url)

            # Update resume_url in database
            try:
                from ai.db.resume_repository import ResumeRepository
                from ai.db.session_manager import db_session_manager

                async with db_session_manager.session() as session:
                    repo = ResumeRepository(session)
                    await repo.update_resume_url(user_id, blob_url)
            except Exception as e:
                LOGGER.error(f"Failed to update resume_url in DB: {str(e)}")

        except Exception as e:
            LOGGER.error(f"Error uploading {filename} to Azure Blob Storage: {str(e)}")
            raise

    async def upload_file(self, file: UploadFile, user_id: str) -> str:
        """
        Start PDF upload to Azure Blob Storage in the background.
        Returns immediately without waiting for the upload to complete.
        """
        try:
            # Validate file type
            if not file.filename.lower().endswith(".pdf"):
                return f"upload_rejected: Only PDF files are supported. Got: {file.filename}"

            # Read file contents
            await file.seek(0)
            contents = await file.read()

            if not contents:
                return "upload_Failed: File is empty"

            filename = f"{file.filename}"

            # Start background upload task
            asyncio.create_task(self._execute_upload(contents, filename, user_id))

            return "upload_Started"
        except Exception as e:
            LOGGER.error(f"Error initiating file upload for {file.filename}: {str(e)}")
            return f"upload_Failed: {str(e)}"

    async def upload_user_photo(self, file: UploadFile, user_id: str) -> str:
        """
        Upload profile photo to Azure Blob Storage and return the URL.
        """
        try:
            # Validate image format
            allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in allowed_extensions:
                raise ValueError(
                    f"Unsupported image format: {file_ext}. Supported: {', '.join(allowed_extensions)}"
                )

            # Read content
            await file.seek(0)
            contents = await file.read()
            if not contents:
                raise ValueError("File is empty")

            # Initialize client
            blob_service_client = BlobServiceClient.from_connection_string(
                self.connection_string
            )

            container_name = "userphotos"
            # Ensure container exists
            try:
                blob_service_client.create_container(container_name)
            except Exception:
                pass  # Already exists

            # Create filename using user_id to ensure uniqueness and easy overwriting
            blob_name = f"{user_id}{file_ext}"
            blob_client = blob_service_client.get_blob_client(
                container=container_name, blob=blob_name
            )

            # Upload
            blob_client.upload_blob(contents, overwrite=True)

            return blob_client.url

        except Exception as e:
            LOGGER.error(f"Failed to upload photo for user {user_id}: {str(e)}")
            raise

    async def get_user_photo(self, blob_url: str) -> tuple[bytes, str]:
        """
        Fetch blob content from Azure Storage using the URL.
        Returns (content_bytes, content_type).
        """
        try:
            from azure.storage.blob import BlobServiceClient
            
            # Parse URL to get container and blob name
            # URL: https://<account>.blob.core.windows.net/<container>/<blob_name>
            parts = blob_url.split('/')
            if len(parts) < 5:
                raise ValueError(f"Invalid blob URL: {blob_url}")
            
            container_name = parts[3]
            blob_name = "/".join(parts[4:])

            # Use connection string to initialize BlobServiceClient
            service_client = BlobServiceClient.from_connection_string(self.connection_string)
            blob_client = service_client.get_blob_client(container=container_name, blob=blob_name)

            if not blob_client.exists():
                LOGGER.error(f"Blob not found: {blob_url}")
                raise FileNotFoundError(f"Blob not found: {blob_url}")

            download_stream = blob_client.download_blob()
            content = download_stream.readall()
            properties = blob_client.get_blob_properties()
            content_type = properties.content_settings.content_type or "image/jpeg"

            return content, content_type

        except Exception as e:
            LOGGER.error(f"Error retrieving blob {blob_url}: {str(e)}")
            raise
