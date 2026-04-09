import pdfplumber
from typing import List, Optional, Union
from io import BytesIO
from ProcessPDF.resume_pipeline.PDFContentProcessor import PDFProcessor
from ProcessPDF.resume_pipeline.PDFPartitionContentProcessor import PDFMultiColumnProcessor


class PDFTableExtractor:
    DIVIDER = "=" * 80

    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.multi_column_processor = PDFMultiColumnProcessor()

    # ----------------------------
    # Utility Methods
    # ----------------------------
    def clean_cell(self, cell) -> str:
        """Clean and normalize table cell content."""
        try:
            if cell is None:
                return ""
            return " ".join(str(cell).split())
        except Exception as e:
            print(f"[ERROR] clean_cell failed: {e}")
            return ""

    def is_same_table(self, prev_table: Optional[List[List]], curr_table: Optional[List[List]]) -> bool:
        """Check if tables have the same structure (headers match)."""
        try:
            if not prev_table or not curr_table:
                return False

            if not prev_table[0] or not curr_table[0]:
                return False

            if len(prev_table[0]) != len(curr_table[0]):
                return False

            prev_header = [self.clean_cell(c).lower() for c in prev_table[0]]
            curr_header = [self.clean_cell(c).lower() for c in curr_table[0]]

            return prev_header == curr_header

        except Exception as e:
            print(f"[ERROR] is_same_table failed: {e}")
            return False

    def is_bullet(self, text: str) -> bool:
        """Check if text is a bullet point using imported method."""
        return self.pdf_processor.is_bullet(text)

    def is_title_line(self, text: str) -> bool:
        """Check if text is a title line using imported method."""
        return self.pdf_processor.is_title_line(text)

    # ----------------------------
    # Core Extraction (IN-MEMORY)
    # ----------------------------
    def extract_tables(self, pdf_stream: Union[str, BytesIO]) -> List[str]:
        """
        Extract tables from PDF stream or file path and store as list of strings.
        """
        output_lines = []
        prev_table = None
        first_table_written = False

        try:
            with pdfplumber.open(pdf_stream) as pdf:
                print(f"[INFO] Processing PDF")

                for page_num, page in enumerate(pdf.pages, start=1):
                    print(f"[INFO] Processing page {page_num}")

                    try:
                        tables = page.extract_tables()
                    except Exception as e:
                        print(
                            f"[ERROR] Failed extracting tables on page {page_num}: {e}")
                        continue

                    if not tables:
                        continue

                    for table_index, table in enumerate(tables):
                        try:
                            is_continuation = self.is_same_table(
                                prev_table, table)

                            # Add divider for new table
                            if not is_continuation:
                                if first_table_written:
                                    output_lines.append(f"\n{self.DIVIDER}\n")
                                first_table_written = True

                            for row_index, row in enumerate(table):
                                cleaned_row = [self.clean_cell(
                                    cell) for cell in row]

                                if all(cell == "" for cell in cleaned_row):
                                    continue

                                # Skip header if continuation
                                if is_continuation and row_index == 0:
                                    continue

                                output_lines.append("\t".join(cleaned_row))

                            output_lines.append("")  # spacing
                            prev_table = table

                        except Exception as e:
                            print(
                                f"[ERROR] Failed processing table {table_index} on page {page_num}: {e}")

        except FileNotFoundError:
            print(f"[ERROR] PDF stream not accessible")
        except Exception as e:
            print(f"[FATAL] extract_tables failed: {e}")

        return output_lines

    # ----------------------------
    # Write to File
    # ----------------------------
    def save_to_txt(self, lines: List[str], output_file: str) -> None:
        try:
            print(f"[INFO] Writing to file: {output_file}")

            with open(output_file, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))

            print(f"[SUCCESS] File saved: {output_file}")

        except Exception as e:
            print(f"[ERROR] save_to_txt failed: {e}")

    # ----------------------------
    # Combined Flow
    # ----------------------------
    def process(self, pdf_path: str) -> str:
        try:

            # output_path = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\output_tables.txt"

            lines = self.extract_tables(pdf_path)

            if not lines:
                print("[WARNING] No table data extracted.")
                return ""

            # self.save_to_txt(lines, output_path)

            return lines

        except Exception as e:
            print(f"[FATAL] process failed: {e}")
            return ""


# ----------------------------
# Usage
# ----------------------------
# if __name__ == "__main__":
#     from pathlib import Path
    
#     pdf_file = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\sample_resume.pdf"
#     output_path = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\output_tables.txt"

#     extractor = PDFTableExtractor()

#     try:
#         # Example 1: Using file path directly (backward compatible)
#         # table_data = extractor.extract_tables(pdf_file)
        
#         # Example 2: Using BytesIO stream (from file)
#         pdf_bytes = Path(pdf_file).read_bytes()
#         pdf_stream = BytesIO(pdf_bytes)
#         table_data = extractor.extract_tables(pdf_stream)

#         if table_data:
#             extractor.save_to_txt(table_data, output_path)
#             print(f"[INFO] Tables extracted successfully.")
#         else:
#             print("[WARNING] No output generated.")

#     except Exception as e:
#         print(f"[FATAL] Unexpected error: {e}")
