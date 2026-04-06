#!/usr/bin/env python3
"""
CLI Script to import complete profile from parsed JSON file.

This script reads a JSON file (generated from resume parsing) and inserts
all the data into the database, including:
- Jobseeker profile
- Skills
- Work experiences with nested projects
- Education records
- Standalone projects

Usage:
    python import_profile_from_json.py \\
        --json-file profile_41e9a27d-4768-4520-a1b2-425faca3c823.json \\
        --user-id 41e9a27d-4768-4520-a1b2-425faca3c823

Example:
    python import_profile_from_json.py \\
        --json-file "C:\\path\\to\\profile_<uuid>.json" \\
        --user-id "<uuid>"
"""

import argparse
import asyncio
import sys
from pathlib import Path
from uuid import UUID

from ai.db.database import AsyncSessionLocal
from ai.db.resume_repository import ResumeRepository


async def main():
    """CLI entry point for profile JSON import."""
    
    parser = argparse.ArgumentParser(
        description="Import complete profile from parsed resume JSON file"
    )
    parser.add_argument(
        "--json-file",
        required=True,
        type=str,
        help="Path to parsed resume JSON file",
    )
    parser.add_argument(
        "--user-id",
        required=True,
        type=str,
        help="User UUID to associate the profile with",
    )
    
    args = parser.parse_args()
    
    # Validate JSON file
    json_path = Path(args.json_file)
    if not json_path.exists():
        print(f"❌ Error: JSON file not found: {args.json_file}")
        sys.exit(1)
    
    # Validate UUID
    try:
        user_id = UUID(args.user_id)
    except ValueError:
        print(f"❌ Error: Invalid UUID format: {args.user_id}")
        sys.exit(1)
    
    print(f"📄 Loading profile from: {args.json_file}")
    print(f"👤 User ID: {user_id}")
    
    session = AsyncSessionLocal()
    repository = ResumeRepository(session)
    
    try:
        result = await repository.import_profile_from_json(
            user_id=user_id,
            json_file_path=str(json_path),
        )
        
        print("\n✅ Import completed successfully!")
        print(f"   Skills: {result['skills_count']}")
        print(f"   Work Experiences: {result['work_experiences_count']}")
        print(f"   Projects: {result['projects_count']}")
        print(f"   Education: {result['education_count']}")
        print(f"   Status: {result['status']}")
        
        sys.exit(0)
        
    except FileNotFoundError as e:
        print(f"❌ File error: {str(e)}")
        sys.exit(1)
    except ValueError as e:
        print(f"❌ JSON parsing error: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)
    finally:
        await session.close()


if __name__ == "__main__":
    asyncio.run(main())
