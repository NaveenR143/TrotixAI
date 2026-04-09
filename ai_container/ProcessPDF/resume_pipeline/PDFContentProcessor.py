import pdfplumber
from typing import List, Dict, Any, Union
from io import BytesIO


class PDFProcessor:
    TITLE_FONT_SIZE_THRESHOLD = 12
    LINE_SPACING_THRESHOLD = 10

    def __init__(self):
        pass

    # ----------------------------
    # Utility Methods
    # ----------------------------
    def is_bullet(self, text: str) -> bool:
        try:
            bullet_chars = ["•", "-", "▪", "◦", "", "➤", "*", ""]
            text = text.strip()
            return any(text.startswith(b) for b in bullet_chars)
        except Exception as e:
            print(f"[ERROR] is_bullet failed: {e}")
            return False

    def is_title_line(self, text: str) -> bool:
        try:
            text = text.strip()

            if not text:
                return False

            if self.is_bullet(text):
                return False

            words = text.split()

            if len(words) > 3:
                return False

            if not text.isupper():
                return False

            if len(words) == 1 and len(words[0]) < 4:
                return False

            return True
        except Exception as e:
            print(f"[ERROR] is_title_line failed: {e}")
            return False

    # ----------------------------
    # PDF Processing Helpers
    # ----------------------------
    def extract_tables_bbox(self, page) -> List:
        try:
            tables = page.find_tables()
            return [table.bbox for table in tables]
        except Exception as e:
            print(f"[ERROR] extract_tables_bbox failed: {e}")
            return []

    def is_inside_bbox(self, word: Dict, bboxes: List) -> bool:
        try:
            for bbox in bboxes:
                x0, top, x1, bottom = bbox
                if (
                    word["x0"] >= x0 and word["x1"] <= x1 and
                    word["top"] >= top and word["bottom"] <= bottom
                ):
                    return True
            return False
        except Exception as e:
            print(f"[ERROR] is_inside_bbox failed: {e}")
            return False

    def group_text(self, words: List[Dict]) -> List[List[Dict]]:
        blocks = []
        current_block = []
        prev_top = None

        try:
            for word in words:
                if prev_top is None:
                    current_block.append(word)
                else:
                    gap = abs(word["top"] - prev_top)

                    if gap > self.LINE_SPACING_THRESHOLD:
                        blocks.append(current_block)
                        current_block = [word]
                    else:
                        current_block.append(word)

                prev_top = word["top"]

            if current_block:
                blocks.append(current_block)

        except Exception as e:
            print(f"[ERROR] group_text failed: {e}")

        return blocks

    def block_to_text(self, block: List[Dict]) -> str:
        try:
            return " ".join(w.get("text", "") for w in block)
        except Exception as e:
            print(f"[ERROR] block_to_text failed: {e}")
            return ""

    def merge_bullets(self, blocks: List) -> List[str]:
        merged = []
        i = 0

        try:
            while i < len(blocks):
                current = self.block_to_text(blocks[i]).strip()

                if self.is_bullet(current):
                    combined = current
                    j = i + 1

                    while j < len(blocks):
                        next_text = self.block_to_text(blocks[j]).strip()

                        if self.is_bullet(next_text):
                            break

                        if next_text and not next_text.isupper():
                            combined += " " + next_text
                            j += 1
                        else:
                            break

                    merged.append(combined)
                    i = j
                else:
                    merged.append(current)
                    i += 1

        except Exception as e:
            print(f"[ERROR] merge_bullets failed: {e}")

        return merged

    # ----------------------------
    # Core Processing
    # ----------------------------
    def process_pdf(self, pdf_stream: Union[str, BytesIO]) -> List[Dict[str, Any]]:
        """Process PDF from file path or BytesIO stream."""
        result = []
        current_section = {"title": None, "content": []}

        try:
            with pdfplumber.open(pdf_stream) as pdf:
                print(f"[INFO] Processing PDF")

                for page_num, page in enumerate(pdf.pages, start=1):
                    print(f"[INFO] Processing page {page_num}")

                    table_bboxes = self.extract_tables_bbox(page)

                    words = page.extract_words(
                        extra_attrs=["size", "fontname", "stroking_color"]
                    )

                    words = [
                        w for w in words
                        if not self.is_inside_bbox(w, table_bboxes)
                    ]

                    words = sorted(words, key=lambda w: (w["top"], w["x0"]))

                    blocks = self.group_text(words)
                    blocks = self.merge_bullets(blocks)

                    for block in blocks:
                        text = block if isinstance(block, str) else self.block_to_text(block)

                        for line in text.split("\n"):
                            clean_line = line.strip()

                            if not clean_line:
                                continue

                            if self.is_title_line(clean_line):
                                if current_section["title"] or current_section["content"]:
                                    result.append(current_section)

                                current_section = {
                                    "title": clean_line,
                                    "content": []
                                }
                            else:
                                current_section["content"].append(clean_line)

            if current_section:
                result.append(current_section)

        except FileNotFoundError:
            print(f"[ERROR] PDF stream not accessible")
        except Exception as e:
            print(f"[ERROR] process_pdf failed: {e}")

        return result

    # ----------------------------
    # Output Writer
    # ----------------------------
    def save_to_txt(self, data: List[Dict], output_file: str) -> None:
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                print(f"[INFO] Writing output to {output_file}")

                for section in data:
                    f.write("=== TITLE ===\n")
                    f.write((section.get("title") or "NO TITLE") + "\n\n")

                    f.write("--- CONTENT ---\n")
                    for para in section.get("content", []):
                        f.write(para + "\n\n")

                    f.write("\n" + "=" * 50 + "\n\n")

        except Exception as e:
            print(f"[ERROR] save_to_txt failed: {e}")


# ----------------------------
# Usage
# ----------------------------
# if __name__ == "__main__":
#     from pathlib import Path
    
#     pdf_file = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\sample_resume.pdf"
#     output_path = r"C:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\output.txt"

#     processor = PDFProcessor()

#     try:
#         # Example 1: Using file path directly (backward compatible)
#         # structured_data = processor.process_pdf(pdf_file)
        
#         # Example 2: Using BytesIO stream (from file)
#         pdf_bytes = Path(pdf_file).read_bytes()
#         pdf_stream = BytesIO(pdf_bytes)
#         structured_data = processor.process_pdf(pdf_stream)

#         if structured_data:
#             processor.save_to_txt(structured_data, output_path)
#             print(f"[SUCCESS] Saved extracted content to {output_path}")
#         else:
#             print("[WARNING] No data extracted from PDF.")

#     except Exception as e:
#         print(f"[FATAL] Unexpected error: {e}")
        
