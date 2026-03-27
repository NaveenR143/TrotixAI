#!/usr/bin/env python3
"""Test table extraction directly"""

import io
import sys
from pathlib import Path

# Set up path
sys.path.insert(0, str(Path(__file__).parent))

# Import what we need
import pdfplumber
from collections import defaultdict

def test_pdf_table_extraction():
    """Test if tables are being extracted correctly as TSV"""
    
    test_file = Path("Resume_Pipeline/SampleResumes/LAHARI updated resume - B. Lahari.pdf")
    
    print("=" * 80)
    print("TABLE EXTRACTION TEST")
    print("=" * 80)
    
    if not test_file.exists():
        print(f"❌ File not found: {test_file}")
        return False
    
    with open(test_file, 'rb') as f:
        file_bytes = f.read()
    
    print(f"\n📄 File: {test_file.name}")
    print(f"Size: {len(file_bytes)} bytes\n")
    
    # Extract everything
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        print(f"Pages: {len(pdf.pages)}")
        
        all_text = []
        all_tables = []
        
        for page_idx, page in enumerate(pdf.pages):
            # Get text
            text = page.extract_text() or ""
            all_text.append(text)
            print(f"\nPage {page_idx + 1}:")
            print(f"  - Text: {len(text)} chars")
            
            # Get tables
            tables = page.extract_tables()
            if tables:
                print(f"  - Tables: {len(tables)}")
                all_tables.extend(tables)
                
                for t_idx, table in enumerate(tables):
                    if table and len(table) > 0:
                        print(f"      Table {t_idx}: {len(table)} rows x {len(table[0]) if table[0] else 0} cols")
            else:
                print(f"  - Tables: None")
    
    # Show extracted text
    print("\n" + "=" * 80)
    print("EXTRACTED TEXT (first 50 lines):")
    print("=" * 80)
    
    full_text = "\n".join(all_text)
    lines = full_text.split("\n")
    
    for i, line in enumerate(lines[:50]):
        print(f"{i+1:3}: {line}")
    
    print(f"\n... ({len(lines)} total lines)")
    
    # Check for garbled patterns
    print("\n" + "=" * 80)
    print("GARBLED TEXT CHECK:")
    print("=" * 80)
    
    garbled_patterns = [
        "INSTITUTION COMPLETION Bachelor",
        "Engineering Technological Institute"
    ]
    
    for pattern in garbled_patterns:
        if pattern in full_text:
            print(f"❌ FOUND: {pattern}")
    
    # Show table data structure
    if all_tables:
        print("\n" + "=" * 80)
        print("ACTUAL TABLE DATA STRUCTURE:")
        print("=" * 80)
        
        for t_idx, table in enumerate(all_tables):
            print(f"\nTable {t_idx}: {len(table)} rows")
            for r_idx, row in enumerate(table[:4]):  # Show first 4 rows
                if row:
                    tsv = "\t".join(str(c) for c in row)
                    print(f"  Row {r_idx}: {tsv}")
    
    return True

if __name__ == "__main__":
    test_pdf_table_extraction()
