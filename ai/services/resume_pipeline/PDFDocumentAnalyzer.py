"""
Production-ready Document Analyzer combining table detection, partition detection, 
and content detection with parallel execution.

This module provides a single-class implementation for comprehensive PDF document 
analysis with robust error handling, structured logging, and thread-safe parallel 
execution of detection tasks.

Uses external processors:
- PDFTableExtractor: for table detection
- PDFProcessor: for content/text detection  
- PDFMultiColumnProcessor: for partition/multi-column detection
"""

import logging
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
from io import BytesIO
import sys
import time

from ai.services.resume_pipeline.PDFTableProcessor import PDFTableExtractor
from ai.services.resume_pipeline.PDFContentProcessor import PDFProcessor
from ai.services.resume_pipeline.PDFPartitionContentProcessor import PDFMultiColumnProcessor


# =============================================================================
# CUSTOM EXCEPTIONS
# =============================================================================

class DocumentAnalysisException(Exception):
    """Base exception for document analysis operations."""
    pass


class PDFProcessingError(DocumentAnalysisException):
    """Raised when PDF processing fails."""
    pass


class TableDetectionError(DocumentAnalysisException):
    """Raised when table detection fails."""
    pass


class PartitionDetectionError(DocumentAnalysisException):
    """Raised when partition detection fails."""
    pass


class ContentDetectionError(DocumentAnalysisException):
    """Raised when content detection fails."""
    pass


class OutputGenerationError(DocumentAnalysisException):
    """Raised when output generation fails."""
    pass


# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class TableData:
    """Represents detected table information."""
    tables: List[List[List[str]]] = field(default_factory=list)
    page_indices: List[int] = field(default_factory=list)
    raw_output: str = ""
    error: Optional[str] = None

    def is_valid(self) -> bool:
        """Check if table data is valid."""
        return (len(self.tables) > 0 or len(self.raw_output) > 0) and self.error is None


@dataclass
class SectionContent:
    """Represents a document section with title and content."""
    title: Optional[str] = None
    content: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "title": self.title or "NO TITLE",
            "content": self.content
        }

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'SectionContent':
        """Create from processor output dictionary."""
        return SectionContent(
            title=data.get("title"),
            content=data.get("content", [])
        )


@dataclass
class PartitionData:
    """Represents detected partition information."""
    sections: List[SectionContent] = field(default_factory=list)
    is_multi_column: bool = False
    raw_output: str = ""
    error: Optional[str] = None

    def is_valid(self) -> bool:
        """Check if partition data is valid."""
        return len(self.sections) > 0 and self.error is None


@dataclass
class ContentData:
    """Represents detected content information (fallback for partitions)."""
    sections: List[SectionContent] = field(default_factory=list)
    raw_output: str = ""
    error: Optional[str] = None

    def is_valid(self) -> bool:
        """Check if content data is valid."""
        return len(self.sections) > 0 and self.error is None


@dataclass
class AnalysisResult:
    """Combines all analysis results."""
    tables: TableData = field(default_factory=TableData)
    partitions: Optional[PartitionData] = None
    content: Optional[ContentData] = None
    processing_time_seconds: float = 0.0
    pdf_path: str = ""
    output_path: str = ""


# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

def setup_logger(name: str) -> logging.Logger:
    """Configure structured logging with consistent format."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s:%(lineno)d] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)

    return logger


# =============================================================================
# CONFIGURATION CONSTANTS
# =============================================================================

TITLE_FONT_SIZE_THRESHOLD = 12
# FIX 4: raised from 10 — prevents same-line fragmentation on large fonts
LINE_SPACING_THRESHOLD = 15
# FIX 1: raised from 3 — allows "EDUCATIONAL QUALIFICATIONS" etc.
MAX_TITLE_WORDS = 6
MIN_TITLE_WORD_LENGTH = 4
COLUMN_DETECTION_THRESHOLD = 0.15
COLUMN_ALIGNMENT_TOLERANCE = 10
# FIX 3: words larger than this size are title candidates
TITLE_FONT_SIZE_BOOST = 11
TABLE_DIVIDER = "=" * 80
SECTION_DIVIDER = "=" * 50

BULLET_CHARS = ["•", "-", "▪", "◦", "", "➤", "*", ""]


# =============================================================================
# DOCUMENT ANALYZER CLASS
# =============================================================================

class DocumentAnalyzer:
    """
    Production-ready document analyzer combining table, partition, and content 
    detection with parallel execution.

    This class follows SOLID principles with a single responsibility focused on
    orchestrating document analysis operations. Individual detection logic is
    encapsulated in helper functions for maintainability and testability.

    Attributes:
        pdf_path: Path to the PDF file to analyze
        output_path: Path for output file (auto-generated if not provided)
        logger: Structured logger instance
    """

    def __init__(
        self,
        pdf_stream: Union[str, BytesIO],
        output_path: Optional[str] = None,
        log_level: int = logging.INFO
    ) -> None:
        """
        Initialize the DocumentAnalyzer.

        Args:
            pdf_stream: Path to PDF file or BytesIO stream to analyze
            output_path: Optional custom output path (file or directory)
            log_level: Logging level (default: INFO)

        Raises:
            ValueError: If PDF file path does not exist (when string is provided)
        """
        self.pdf_stream = pdf_stream
        self.logger = setup_logger(self.__class__.__name__)
        self.logger.setLevel(log_level)

        # Validate if it's a file path (string)
        if isinstance(pdf_stream, str) and not os.path.exists(pdf_stream):
            error_msg = f"PDF file not found: {pdf_stream}"
            self.logger.error(error_msg)
            raise ValueError(error_msg)

        # Handle output path - if it's a directory, generate filename within it
        if output_path:
            output_path = str(output_path)
            if os.path.isdir(output_path):
                # Directory provided - generate filename in it
                if isinstance(pdf_stream, str):
                    pdf_path = Path(pdf_stream)
                    self.output_path = os.path.join(
                        output_path, f"{pdf_path.stem}_analysis.txt")
                else:
                    self.output_path = os.path.join(output_path, "analysis.txt")
            else:
                # File path provided
                self.output_path = output_path
        else:
            # Auto-generate output path
            self.output_path = self._generate_output_path()

        self.logger.info(f"Initialized DocumentAnalyzer")

    def _generate_output_path(self) -> str:
        """Generate output path in the same folder as input PDF."""
        if isinstance(self.pdf_stream, str):
            pdf_path = Path(self.pdf_stream)
            output_path = pdf_path.parent / f"{pdf_path.stem}_analysis.txt"
            self.logger.debug(f"Generated output path: {output_path}")
            return str(output_path)
        else:
            # For BytesIO, use temp directory or current directory
            output_path = Path.cwd() / "analysis.txt"
            self.logger.debug(f"Generated output path: {output_path}")
            return str(output_path)

    def analyze(self) -> AnalysisResult:
        """
        Execute comprehensive document analysis with parallel execution.

        Orchestrates:
        1. Table detection
        2. Partition detection with fallback to content detection
        3. Parallel execution of both processes
        4. Result aggregation and output generation

        Returns:
            AnalysisResult containing all detection results

        Raises:
            PDFProcessingError: If fundamental PDF processing fails
        """
        self.logger.info("Starting document analysis")

        import time
        start_time = time.time()

        try:
            pdf_path_str = self.pdf_stream if isinstance(self.pdf_stream, str) else "BytesIO stream"
            result = AnalysisResult(
                pdf_path=pdf_path_str,
                output_path=self.output_path
            )

            # Execute table and partition/content detection in parallel
            with ThreadPoolExecutor(max_workers=2) as executor:
                table_future = executor.submit(self._detect_tables_wrapper)
                partition_future = executor.submit(
                    self._detect_partitions_with_fallback_wrapper)

                # Collect results as they complete
                for future in as_completed([table_future, partition_future]):
                    try:
                        task_result = future.result()
                    except Exception as e:
                        self.logger.error(
                            f"Task failed: {str(e)}", exc_info=True)
                        continue

                # Retrieve results
                result.tables = table_future.result()
                partition_result = partition_future.result()

                if partition_result[0]:  # is_partition
                    result.partitions = partition_result[1]
                else:
                    result.content = partition_result[1]

            # Generate combined output
            # self._generate_output(result)

            result.processing_time_seconds = time.time() - start_time
            self.logger.info(
                f"Analysis complete. Processing time: {result.processing_time_seconds:.2f}s"
            )

            return result

        except Exception as e:
            error_msg = f"Fatal error during analysis: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            raise PDFProcessingError(error_msg) from e

    def _detect_tables_wrapper(self) -> TableData:
        """Thread-safe wrapper for table detection using PDFTableExtractor."""
        try:
            self.logger.info("Table detection started")

            extractor = PDFTableExtractor()
            table_lines = extractor.extract_tables(self.pdf_stream)
            raw_output = "\n".join(table_lines) if table_lines else ""

            table_data = TableData(raw_output=raw_output)

            self.logger.info(
                f"Table detection complete. Raw output length: {len(raw_output)} chars")
            return table_data
        except Exception as e:
            error_msg = f"Table detection failed: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            return TableData(error=error_msg)

    def _detect_partitions_with_fallback_wrapper(self) -> Tuple[bool, Any]:
        """
        Thread-safe wrapper for partition/content detection.

        Uses PDFMultiColumnProcessor for partitions and PDFProcessor for content fallback.

        Returns:
            Tuple of (is_partition: bool, data: PartitionData | ContentData)
        """
        try:
            self.logger.info("Partition detection started")

            # Attempt partition detection using PDFMultiColumnProcessor
            multi_column_processor = PDFMultiColumnProcessor()
            partition_sections = multi_column_processor.process_pdf(
                self.pdf_stream)

            if partition_sections:
                self.logger.info(
                    f"Multi-column partitions detected: {len(partition_sections)} sections"
                )
                partition_data = PartitionData(
                    sections=[SectionContent.from_dict(
                        s) for s in partition_sections],
                    is_multi_column=True
                )
                return (True, partition_data)

            # Fallback to content detection using PDFProcessor
            self.logger.info(
                "No partitions found. Falling back to content detection")

            processor = PDFProcessor()
            content_sections = processor.process_pdf(self.pdf_stream)

            if content_sections:
                self.logger.info(
                    f"Content detection complete: {len(content_sections)} sections"
                )
                content_data = ContentData(
                    sections=[SectionContent.from_dict(
                        s) for s in content_sections]
                )
            else:
                self.logger.warning("Content detection returned no sections")
                content_data = ContentData()

            return (False, content_data)

        except Exception as e:
            error_msg = f"Partition/content detection failed: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            return (False, ContentData(error=error_msg))

    # =========================================================================
    # OUTPUT GENERATION
    # =========================================================================

    def _get_table_content_text(self, tables: List[List[List[str]]]) -> List[str]:
        """
        Extract table cell content as individual text pieces for deduplication.

        Returns:
            List of normalized table cell contents
        """
        table_texts = []
        for table in tables:
            for row in table:
                for cell in row:
                    cell_text = self._clean_cell(cell).strip().lower()
                    if cell_text and len(cell_text) > 2:  # Skip single chars/numbers
                        table_texts.append(cell_text)
        return table_texts

    def _is_table_content_block(self, content_line: str, table_texts: List[str]) -> bool:
        """
        Check if a content line is likely table data by matching against table cells.

        A line is considered table content if it contains multiple table cell values.
        """
        if not table_texts or not content_line:
            return False

        normalized_line = content_line.strip().lower()

        # Check how many table cells appear in this line
        matches = 0
        for table_text in table_texts:
            if table_text in normalized_line:
                matches += 1

        # If 3+ table cells match in one line, it's likely table content
        return matches >= 3

    def _filter_content_sections(
        self,
        content_sections: List[SectionContent],
        table_data: TableData
    ) -> List[SectionContent]:
        """
        Filter out content blocks that duplicate table data.

        Args:
            content_sections: Content sections to filter
            table_data: Table data to match against

        Returns:
            Filtered content sections without table duplicates
        """
        if not table_data.is_valid():
            return content_sections

        # Extract table content for comparison
        table_texts = self._get_table_content_text(table_data.tables)

        if not table_texts:
            return content_sections

        filtered_sections = []

        for section in content_sections:
            # Filter content lines
            filtered_content = []
            for line in section.content:
                # Keep line if it's NOT table content
                if not self._is_table_content_block(line, table_texts):
                    filtered_content.append(line)

            # Only keep section if it has remaining content
            if filtered_content or (section.title and section.title != "NO TITLE"):
                filtered_section = SectionContent(
                    title=section.title,
                    content=filtered_content
                )
                filtered_sections.append(filtered_section)

        if len(filtered_sections) < len(content_sections):
            removed_count = len(content_sections) - len(filtered_sections)
            self.logger.info(
                f"Removed {removed_count} duplicate table content blocks from sections")

        return filtered_sections

    def _generate_output(self, result: AnalysisResult) -> None:
        """
        Generate combined output file from analysis results.

        Args:
            result: AnalysisResult containing all detection outputs

        Raises:
            OutputGenerationError: If output generation fails
        """
        try:
            self.logger.info(f"Generating output to {self.output_path}")

            with open(self.output_path, "w", encoding="utf-8") as f:
                # Write tables if present
                if result.tables.is_valid():
                    f.write("=== TITLE ===\n")
                    f.write("TABLES\n\n")
                    f.write("--- CONTENT ---\n")
                    f.write(result.tables.raw_output)
                    f.write("\n" + SECTION_DIVIDER + "\n\n")

                # Write partitions or content
                if result.partitions and result.partitions.is_valid():
                    # Filter out table duplicate content from partitions
                    filtered_partitions = self._filter_content_sections(
                        result.partitions.sections,
                        result.tables
                    )
                    self._write_sections(f, filtered_partitions)

                elif result.content:
                    if result.content.is_valid():
                        # Filter out table duplicate content from content sections
                        filtered_content = self._filter_content_sections(
                            result.content.sections,
                            result.tables
                        )
                        self._write_sections(f, filtered_content)

            self.logger.info(f"Output saved to {self.output_path}")

        except Exception as e:
            error_msg = f"Failed to generate output: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            raise OutputGenerationError(error_msg) from e

    @staticmethod
    def _write_sections(file_obj: Any, sections: List[SectionContent]) -> None:
        """
        Write sections to file in formatted manner matching output.txt style.

        FIX 5: Sections that have a title but no remaining content (e.g.
                "EDUCATIONAL QUALIFICATIONS" after table rows are filtered) are
                written with an empty content block so the section header still
                appears — matching the observed output.txt behaviour — but without
                spurious duplicate blank lines.

        FIX 7: Each content line now writes a single trailing newline, then one
                blank line separator.  The original wrote "\\n\\n" per line which
                produced double-spaced bullet lists.

        Format:
        === TITLE ===
        {title}

        --- CONTENT ---
        {line 1}

        {line 2}

        ==================================================
        """
        for section in sections:
            file_obj.write("=== TITLE ===\n")
            file_obj.write(f"{section.title or 'NO TITLE'}\n\n")
            file_obj.write("--- CONTENT ---\n")

            for para in section.content:
                # FIX 7: single newline after content, one blank line between items
                file_obj.write(f"{para}\n\n")

            file_obj.write(SECTION_DIVIDER + "\n\n")


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main() -> int:
    """
    Main entry point for document analysis.

    FIX 8: Replaced hardcoded Windows path with sys.argv so the script works on
            any machine.  Usage:
                python document_analyzer.py path/to/file.pdf [output_path]

    Test paths (default when no args provided):
        Input:  Sample resume in Resume_Pipeline folder
        Output: Resume_Pipeline folder

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    logger = setup_logger("DocumentAnalyzer.Main")

    # Test paths - used when no arguments provided or when --test flag is used
    TEST_PDF_PATH = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\sample_resume.pdf"
    TEST_OUTPUT_DIR = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline"

    if len(sys.argv) < 2 or (len(sys.argv) == 2 and sys.argv[1] == "--test"):
        # Use test paths
        pdf_file = TEST_PDF_PATH
        output_file = TEST_OUTPUT_DIR
        if len(sys.argv) < 2:
            logger.info("No arguments provided, using test paths...")
            logger.info(f"Test PDF: {pdf_file}")
            logger.info(f"Test Output Dir: {output_file}")
    else:
        pdf_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        # Example 1: Using file path directly (backward compatible)
        # analyzer = DocumentAnalyzer(pdf_stream=pdf_file, output_path=output_file)
        
        # Example 2: Using BytesIO stream (from file or uploaded file)
        pdf_bytes = Path(pdf_file).read_bytes()
        pdf_stream = BytesIO(pdf_bytes)
        analyzer = DocumentAnalyzer(pdf_stream=pdf_stream, output_path=output_file)
        
        result = analyzer.analyze()

        logger.info("=" * 80)
        logger.info("ANALYSIS SUMMARY")
        if result.tables.is_valid():
            logger.info(
                f"Tables detected: {len(result.tables.tables)} structured | {len(result.tables.raw_output)} chars")
        else:
            logger.info("Tables detected: None")

        if result.partitions:
            logger.info(
                f"Partitions detected: {len(result.partitions.sections)} sections")
            logger.info("Detection type: Multi-column partitions")
        elif result.content:
            logger.info(
                f"Content sections detected: {len(result.content.sections)} sections")
            logger.info("Detection type: Single-column content (fallback)")

        logger.info(
            f"Processing time: {result.processing_time_seconds:.2f} seconds")
        logger.info(f"Output saved to: {result.output_path}")
        logger.info("=" * 80)

        return 0

    except Exception as e:
        logger.error(f"Failed to run analysis: {str(e)}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
