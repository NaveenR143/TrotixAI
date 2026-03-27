#!/usr/bin/env python3
"""Check all PDFs."""
import pdfplumber
import os

sample_dir = r"c:\Naveen\Jobs\Source\TrotixAI\ai\Resume_Pipeline\SampleResumes"
pdf_files = [f for f in os.listdir(sample_dir) if f.endswith('.pdf')]

for pdf_basename in pdf_files:
    pdf_file = os.path.join(sample_dir, pdf_basename)
    
    try:
        with pdfplumber.open(pdf_file) as pdf:
            total_text = 0
            total_pages = len(pdf.pages)
            
            for page in pdf.pages:
                text = page.extract_text()
                total_text += len(text) if text else 0
                
            print(f"{pdf_basename}: {total_pages} pages, {total_text} chars")
            
    except Exception as e:
        print(f"{pdf_basename}: Error - {e}")
