from __future__ import annotations


class ResumeProcessingError(Exception):
    """Base error for the resume processing pipeline."""


class FileValidationError(ResumeProcessingError):
    """Raised when an uploaded file is invalid."""


class ParsingError(ResumeProcessingError):
    """Raised when text extraction or deterministic parsing fails."""


class AIRefinementError(ResumeProcessingError):
    """Raised when Azure OpenAI refinement fails."""


class RepositoryError(ResumeProcessingError):
    """Raised when database persistence fails."""

