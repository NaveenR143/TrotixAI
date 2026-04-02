#!/usr/bin/env python3
"""
CLI Script to insert parsed resume data into database.

Example usage:
    python insert_resume_cli.py \
        --json-file profile_b60aef5c-dc67-458c-8fc3-ce3f442cb248.json \
        --phone "+91-9876543210" \
        --file-name "resume.pdf" \
        --file-url "s3://bucket/resume.pdf" \
        --file-size 102400
"""

import argparse
import asyncio
import sys
from pathlib import Path

from insert_resume_data import ResumeDataInserter


async def main():
    """CLI entry point for resume data insertion."""
    
    parser = argparse.ArgumentParser(
        description="Insert parsed resume data into TrotixAI database"
    )
    parser.add_argument(
        "--json-file",
        required=True,
        type=str,
        help="Path to parsed resume JSON file",
    )
    parser.add_argument(
        "--phone",
        required=True,
        type=str,
        help="Phone number to identify the user (e.g., +91-9876543210)",
    )
    parser.add_argument(
        "--file-name",
        default="resume.pdf",
        type=str,
        help="Original resume file name (default: resume.pdf)",
    )
    parser.add_argument(
        "--file-url",
        default=None,
        type=str,
        help="S3 or cloud storage URL of the resume",
    )
    parser.add_argument(
        "--file-size",
        default=0,
        type=int,
        help="File size in bytes (default: 0)",
    )
    parser.add_argument(
        "--mime-type",
        default="application/pdf",
        type=str,
        help="MIME type of the file (default: application/pdf)",
    )
    
    args = parser.parse_args()
    
    # Validate JSON file exists
    json_path = Path(args.json_file)
    if not json_path.exists():
        print(f"❌ Error: JSON file not found: {args.json_file}")
        sys.exit(1)
    
    print(f"📄 Loading resume data from: {args.json_file}")
    print(f"👤 Phone number: {args.phone}")
    
    async with ResumeDataInserter() as inserter:
        try:
            success = await inserter.process_resume_json(
                json_file_path=str(json_path),
                phone_number=args.phone,
                file_name=args.file_name,
                file_url=args.file_url,
                file_size_bytes=args.file_size,
                mime_type=args.mime_type,
            )
            
            if success:
                print("✅ Resume data inserted successfully!")
                sys.exit(0)
            else:
                print("❌ Failed to insert resume data.")
                sys.exit(1)
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
