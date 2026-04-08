# ai/services/azure_storage_service.py
import asyncio
import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from fastapi import UploadFile
from azure.storage.blob import BlobServiceClient
from azure.storage.blob import StandardBlobTier

# Setup logging
LOGGER = logging.getLogger(__name__)

# Force correct path
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class AzureStorageService:
    """Service for uploading PDF files to Azure Blob Storage."""

    def __init__(self):
        self.connection_string = os.getenv("AZURE_BLOB_KEY")
        self.container_name = os.getenv("AZURE_CONTAINER_NAME", "trotixai")
        self.blob_tier = "cool"

        if not self.connection_string:
            raise ValueError("AZURE_BLOB_KEY environment variable not set")

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

    async def _execute_upload(self, contents: bytes | str, filename: str) -> None:
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

            LOGGER.info(
                f"Successfully uploaded '{filename}' to container "
                f"'{self.container_name}' with tier '{blob_tier}'"
            )

        except Exception as e:
            LOGGER.error(f"Error uploading {filename} to Azure Blob Storage: {str(e)}")
            raise

    async def upload_file(self, file: UploadFile) -> str:
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

            filename = file.filename

            # Start background upload task
            asyncio.create_task(self._execute_upload(contents, filename))

            return "upload_Started"
        except Exception as e:
            LOGGER.error(f"Error initiating file upload for {file.filename}: {str(e)}")
            return f"upload_Failed: {str(e)}"
