#!/usr/bin/env python3
"""Quick test of PDF extraction."""
import pdfplumber
import os

sample_dir = r"c:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\SampleResumes"
pdf_file = os.path.join(sample_dir, "LAHARI updated resume - B. Lahari.pdf")

print(f"Testing: {os.path.basename(pdf_file)}\n")

try:
    with pdfplumber.open(pdf_file) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        
        page = pdf.pages[0]
        
        # Standard text extraction
        text = page.extract_text()
        print(f"\nStandard extraction length: {len(text) if text else 0} chars")
        if text:
            print(f"First 500 chars:\n{text[:500]}")
            print(f"\n...Last 500 chars:\n{text[-500:]}")
        
        # Try extracting with different methods
        print(f"\n--- Checking for tables ---")
        tables = page.extract_tables()
        print(f"Tables found: {len(tables) if tables else 0}")
        for i, table in enumerate(tables or []):
            print(f"Table {i}: {len(table)} rows")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
