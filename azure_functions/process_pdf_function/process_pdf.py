from io import BytesIO
import time
import asyncio
import requests
from urllib.parse import urlparse, unquote
import mimetypes
import os
from azure.storage.blob import BlobServiceClient

from process_pdf_function.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner
from process_pdf_function.resume_pipeline.service import ResumeProcessor
from db.session_manager import db_session_manager


class FileValidationError(Exception):
    pass


class ProcessPDFHandler:
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
    CONTAINER_NAME = "trotixai"

    def __init__(self, blob_url: str = None, blob_name: str = None):
        self.blob_url = blob_url
        self.blob_name = blob_name
        self.file_bytes = None
        self.file_stream = None
        self.file_name = None
        self.mime_type = None
        self.blob_client = None
        self.container_client = None

    def _initialize_blob_client(self):
        """Initialize Azure Blob Storage client"""
        try:
            conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

            if not conn_str:
                raise ValueError(
                    "AZURE_STORAGE_CONNECTION_STRING environment variable not found")

            blob_service_client = BlobServiceClient.from_connection_string(
                conn_str)
            self.container_client = blob_service_client.get_container_client(
                self.CONTAINER_NAME)

            return self.container_client
        except Exception as e:
            raise Exception(
                f"Failed to initialize Azure Blob Storage client: {str(e)}")

    def fetch_file(self):
        """Download file from Azure Blob Storage container"""
        try:
            # Initialize container client if not already done
            if not self.container_client:
                self._initialize_blob_client()

            # Determine blob name
            if not self.blob_name and self.blob_url:
                # Extract blob name from URL if blob_name not provided
                parsed_url = urlparse(self.blob_url)
                self.blob_name = unquote(parsed_url.path.split("/")[-1])

            if not self.blob_name:
                raise ValueError(
                    "Blob name not provided and cannot be extracted from URL")

            # Download blob
            blob_client = self.container_client.get_blob_client(self.blob_name)
            download_stream = blob_client.download_blob()
            self.file_bytes = download_stream.readall()

            # Extract file name if not already set
            if not self.file_name:
                self.file_name = self.blob_name

            return self.file_bytes

        except Exception as e:
            raise Exception(
                f"Failed to download file from Azure Blob Storage: {str(e)}")

    def validate_file_size(self):
        """Validate file size"""
        try:
            if self.file_bytes is None:
                raise ValueError("File not fetched yet.")

            if len(self.file_bytes) > self.MAX_FILE_SIZE_BYTES:
                raise FileValidationError(
                    f"File too large. Max size is {self.MAX_FILE_SIZE_BYTES / (1024*1024):.1f} MB.")

            return True
        except FileValidationError as e:
            raise e
        except Exception as e:
            raise Exception(f"File size validation failed: {str(e)}")

    def extract_file_name(self):
        """Extract file name from blob URL or blob name"""
        try:
            if self.file_name:
                return self.file_name

            if self.blob_name:
                self.file_name = unquote(self.blob_name)
            elif self.blob_url:
                parsed_url = urlparse(self.blob_url)
                self.file_name = unquote(parsed_url.path.split("/")[-1])
            else:
                raise ValueError("Neither blob_name nor blob_url provided")

            return self.file_name
        except Exception as e:
            raise Exception(f"Failed to extract file name: {str(e)}")

    def detect_mime_type(self):
        """Detect MIME type from file name"""
        try:
            if not self.file_name:
                self.extract_file_name()

            mime_type, _ = mimetypes.guess_type(self.file_name)
            self.mime_type = mime_type or "application/octet-stream"
            return self.mime_type
        except Exception as e:
            raise Exception(f"Failed to detect MIME type: {str(e)}")

    def create_file_stream(self):
        """Convert file bytes to BytesIO stream"""
        try:
            if self.file_bytes is None:
                raise ValueError("File not fetched yet.")

            self.file_stream = BytesIO(self.file_bytes)
            return self.file_stream
        except Exception as e:
            raise Exception(f"Failed to create file stream: {str(e)}")

    def process_file(self):
        """
        Main orchestrator method:
        Calls all steps in sequence and returns processed data
        """
        try:
            self.fetch_file()
            self.validate_file_size()
            self.extract_file_name()
            self.detect_mime_type()
            self.create_file_stream()

            # Call additional internal processing if needed
            # Run async processing from sync context
            try:
                asyncio.run(self.additional_processing())
            except Exception as e:
                print(f"⚠️ Warning: Additional processing skipped: {str(e)}")

            return {
                "file_name": self.file_name,
                "mime_type": self.mime_type,
                "file_stream": self.file_stream,
            }
        except FileValidationError as e:
            raise FileValidationError(f"File validation error: {str(e)}")
        except Exception as e:
            raise Exception(f"File processing failed: {str(e)}")

    async def additional_processing(self):
        """
        Async processing of resume file
        Processes the resume and refines it using AI
        """
        try:
            print("\n📄 Starting resume processing...")
            
            async with db_session_manager.session() as session:
                try:
                    start_time = time.perf_counter()
                    
                    # Initialize processor with AI refiner
                    processor = ResumeProcessor(
                        session=session,
                        ai_refiner=AzureOpenAIResumeRefiner(),
                    )
                    
                    # Process resume
                    await processor.process_resume(
                        user_id="41e9a27d-4768-4520-a1b2-425faca3c823",
                        file_name=self.file_name,
                        file_bytes=self.file_stream,
                        raw_bytes=self.file_bytes,
                        mime_type=self.mime_type,
                    )
                    
                    end_time = time.perf_counter()
                    duration = end_time - start_time
                    
                    print(f"✅ Resume processing completed successfully")
                    print(f"⏱️  Total processing time: {duration:.2f} seconds")
                    
                except Exception as e:
                    print(f"❌ Resume processing failed: {str(e)}")
                    raise
                    
        except Exception as e:
            print(f"⚠️  Additional processing error: {str(e)}")
            raise
