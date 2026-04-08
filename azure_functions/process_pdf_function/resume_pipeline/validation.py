from __future__ import annotations

from pathlib import Path

from .errors import FileValidationError


class FileValidator:
    """Validates file type and basic size constraints."""

    ALLOWED_EXTENSIONS = {".pdf", ".csv", ".docx", ".doc"}
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

    def validate(self, file_name: str, file_bytes: bytes) -> str:
        extension = Path(file_name).suffix.lower()
        if extension not in self.ALLOWED_EXTENSIONS:
            raise FileValidationError(f"Unsupported file extension: {extension}. Allowed: PDF/CSV/DOCX/DOC.")
        if not file_bytes:
            raise FileValidationError("Uploaded file is empty.")
        
        return extension

