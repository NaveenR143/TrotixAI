#!/usr/bin/env python3
"""Check all pages of the PDF."""
import pdfplumber
import os

sample_dir = r"c:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\SampleResumes"
pdf_file = os.path.join(sample_dir, "LAHARI updated resume - B. Lahari.pdf")

print(f"Testing: {os.path.basename(pdf_file)}\n")

try:
    with pdfplumber.open(pdf_file) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")
        total_text = 0
        
        for page_idx, page in enumerate(pdf.pages):
            text = page.extract_text()
            text_len = len(text) if text else 0
            total_text += text_len
            
            print(f"=== PAGE {page_idx + 1} ===")
            print(f"Text length: {text_len} chars")
            
            if text:
                # Count sections
                lines = text.split('\n')
                print(f"Lines: {len(lines)}")
                print(f"Content preview:\n{text[:400]}\n")
            
        print(f"\nTOTAL TEXT: {total_text} chars across {len(pdf.pages)} pages")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
