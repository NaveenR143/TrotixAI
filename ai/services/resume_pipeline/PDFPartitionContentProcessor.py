import fitz  # PyMuPDF
from typing import List, Dict, Any, Union
from io import BytesIO
from sklearn.cluster import KMeans
import numpy as np


class PDFMultiColumnProcessor:
    BULLETS = ["•", "-", "▪", "◦", "", "➤", "*", ""]

    def __init__(self):
        pass

    # ----------------------------
    # Helpers
    # ----------------------------
    def is_bullet(self, text: str) -> bool:
        return any(text.strip().startswith(b) for b in self.BULLETS)

    def is_title_line(self, text: str) -> bool:
        text = text.strip()
        if not text or self.is_bullet(text):
            return False

        words = text.split()
        if len(words) > 3:
            return False

        if text.isupper():
            return True

        KEYWORDS = {
            "experience",
            "skills",
            "education",
            "projects",
            "awards",
            "languages",
            "summary",
        }

        return text.lower() in KEYWORDS

    def is_table_block(self, block: Dict) -> bool:
        text = block.get("text", "")
        lines = text.split("\n")
        if len(lines) < 2:
            return False
        short_lines = sum(1 for l in lines if len(l.split()) <= 4)
        numeric_lines = sum(1 for l in lines if sum(c.isdigit()
                            for c in l) > 2)
        spaced_lines = sum(1 for l in lines if "  " in l)
        return (
            short_lines / len(lines) > 0.6
            or numeric_lines / len(lines) > 0.5
            or spaced_lines / len(lines) > 0.5
        )

    # ----------------------------
    # Extract blocks from page
    # ----------------------------
    def extract_blocks(self, page) -> List[Dict]:
        blocks = []
        raw_blocks = page.get_text("dict")["blocks"]

        for b in raw_blocks:
            if "lines" not in b:
                continue

            lines_data = []
            full_text_lines = []

            for line in b["lines"]:
                line_text = "".join(
                    span.get("text", "") for span in line["spans"]
                ).strip()
                if line_text:
                    lines_data.append(
                        {"text": line_text, "bbox": line["bbox"]})
                    full_text_lines.append(line_text)

            if lines_data:
                blocks.append(
                    {
                        "lines": lines_data,
                        "bbox": b["bbox"],
                        "text": "\n".join(full_text_lines),
                    }
                )

        return blocks

    def detect_columns_by_titles(self, blocks: List[Dict], page_width: float):
        try:
            filtered_blocks = [b for b in blocks if not self.is_table_block(b)]

            if not filtered_blocks:
                return [blocks], False

            title_blocks = [
                b for b in filtered_blocks if self.is_title_line(b["text"])]

            if len(title_blocks) < 2:
                return [blocks], False

            # Sort titles by vertical position (top)
            title_blocks = sorted(title_blocks, key=lambda b: b["bbox"][1])

            # Find two titles on the same row (similar Y)
            best_pair = None
            for i in range(len(title_blocks) - 1):
                y1 = title_blocks[i]["bbox"][1]
                y2 = title_blocks[i + 1]["bbox"][1]

                if abs(y1 - y2) < 10:  # same row threshold
                    best_pair = (title_blocks[i], title_blocks[i + 1])
                    break

            if not best_pair:
                return [blocks], False

            t1, t2 = best_pair

            # Compute split using centers (more robust)
            x1 = (t1["bbox"][0] + t1["bbox"][2]) / 2
            x2 = (t2["bbox"][0] + t2["bbox"][2]) / 2
            split_x = (x1 + x2) / 2

            left, right = [], []

            for b in blocks:
                bx_center = (b["bbox"][0] + b["bbox"][2]) / 2

                if bx_center < split_x:
                    left.append(b)
                else:
                    right.append(b)

            return [left, right], True

        except Exception:
            return [blocks], False

    # ----------------------------
    # KMeans column detection
    # ----------------------------

    def detect_columns_kmeans(
        self, blocks: List[Dict], page_width: float, n_clusters: int = 2
    ):
        # skip table blocks
        content_blocks = [b for b in blocks if not self.is_table_block(b)]
        if len(content_blocks) < n_clusters:
            return [content_blocks], False

        # X-center positions
        X = np.array([[(b["bbox"][0] + b["bbox"][2]) / 2]
                     for b in content_blocks])

        kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
        labels = kmeans.fit_predict(X)

        # group blocks by cluster
        clusters = [[] for _ in range(n_clusters)]
        for b, lbl in zip(content_blocks, labels):
            clusters[lbl].append(b)

        # sort clusters left → right
        centers = kmeans.cluster_centers_.flatten()
        sorted_idx = np.argsort(centers)
        clusters = [clusters[i] for i in sorted_idx]

        # validate separation (avoid false split)
        if n_clusters == 2 and abs(centers[0] - centers[1]) < page_width * 0.15:
            return [blocks], False

        return clusters, True

    # ----------------------------
    # Build paragraphs from blocks
    # ----------------------------
    def build_paragraphs(self, blocks: List[Dict]) -> List[str]:
        paragraphs = []
        current_para = ""
        prev_bottom = None

        for block in blocks:
            for line in block["lines"]:
                text = line["text"].strip()
                if not text:
                    continue
                y_top, y_bottom = line["bbox"][1], line["bbox"][3]

                if prev_bottom is None:
                    current_para = text
                    prev_bottom = y_bottom
                    continue

                gap = y_top - prev_bottom
                if gap > 8:
                    paragraphs.append(current_para.strip())
                    current_para = text
                else:
                    if current_para.endswith("-"):
                        current_para = current_para[:-1] + text
                    elif text.startswith(("http", "www")):
                        current_para += text
                    elif not current_para.endswith((" ", ".", ":", ";", ",")):
                        current_para += " " + text
                    else:
                        current_para += text
                prev_bottom = y_bottom

        if current_para:
            paragraphs.append(current_para.strip())
        return paragraphs

    # ----------------------------
    # Process blocks into sections
    # ----------------------------
    def process_blocks(self, blocks: List[Dict]) -> List[Dict[str, Any]]:
        sections = []
        current_section = {"title": None, "content": []}
        paragraphs = self.build_paragraphs(blocks)

        for para in paragraphs:
            text = para.strip()
            if not text:
                continue

            if self.is_title_line(text):
                if current_section["title"] or current_section["content"]:
                    sections.append(current_section)
                current_section = {"title": text, "content": []}
                continue

            current_section["content"].append(text)

        if current_section["title"] or current_section["content"]:
            sections.append(current_section)

        return sections

    # ----------------------------
    # Process PDF
    # ----------------------------
    def process_pdf(self, pdf_stream: Union[str, BytesIO]) -> List[Dict[str, Any]]:
        """Process PDF from file path or BytesIO stream."""
        all_sections = []
        
        # Handle both file paths and BytesIO streams
        if isinstance(pdf_stream, str):
            doc = fitz.open(pdf_stream)
        else:
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
        
        print(f"[INFO] Processing PDF")

        for page_num, page in enumerate(doc, start=1):
            print(f"[INFO] Processing page {page_num}")
            blocks = self.extract_blocks(page)

            column_blocks, is_multi_column = self.detect_columns_by_titles(
                blocks, page.rect.width)

            if not is_multi_column:
                print(
                    f"[INFO] Page {page_num}: No valid multi-column (tables ignored). Skipping...")
                continue

            clusters, is_multi_column = self.detect_columns_kmeans(
                blocks, page.rect.width
            )

            for idx, col_blocks in enumerate(clusters):
                if not col_blocks:
                    continue
                col_sorted = sorted(col_blocks, key=lambda b: b["bbox"][1])
                sections = self.process_blocks(col_sorted)
                all_sections.extend(sections)

        return all_sections

    # ----------------------------
    # Save output to TXT
    # ----------------------------
    def save_to_txt(self, data: List[Dict], output_file: str):
        with open(output_file, "w", encoding="utf-8") as f:
            for section in data:
                f.write("=== TITLE ===\n")
                f.write((section.get("title") or "NO TITLE") + "\n\n")
                f.write("--- CONTENT ---\n")
                for para in section.get("content", []):
                    f.write(para + "\n----\n")
                f.write("\n" + "=" * 50 + "\n\n")
        print(f"[SUCCESS] Output saved to {output_file}")


# ----------------------------
# Usage
# ----------------------------
if __name__ == "__main__":
    from pathlib import Path
    
    # pdf_file = (
    #     r"C:/Naveen/Jobs/Source/TrotixAI/ai/Resume_Pipeline/SampleResumes/Rinku.pdf"
    # )
    pdf_file = (
        r"C:/Naveen/Jobs/Source/TrotixAI/ai/Resume_Pipeline/sample_resume.pdf"
    )
    output_path = r"C:/Naveen/Jobs/Source/TrotixAI/ai/Resume_Pipeline/output.txt"

    processor = PDFMultiColumnProcessor()
    
    try:
        # Example 1: Using file path directly (backward compatible)
        # structured_data = processor.process_pdf(pdf_file)
        
        # Example 2: Using BytesIO stream (from file)
        pdf_bytes = Path(pdf_file).read_bytes()
        pdf_stream = BytesIO(pdf_bytes)
        structured_data = processor.process_pdf(pdf_stream)
        
        processor.save_to_txt(structured_data, output_path)
        print("[DONE] Processing completed successfully.")
    except Exception as e:
        print(f"[ERROR] Processing failed: {e}")
