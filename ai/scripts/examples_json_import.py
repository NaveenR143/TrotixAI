"""
Example usage of the JSON profile import functionality.

This module demonstrates how to use the import_profile_from_json() method
to load complete profiles from parsed resume JSON files into the database.
"""

import asyncio
import json
from pathlib import Path
from uuid import UUID

from ai.db.database import AsyncSessionLocal
from ai.db.resume_repository import ResumeRepository


async def example_import_from_file():
    """Example: Import profile from JSON file."""
    
    # User ID to associate with this profile
    user_id = UUID("41e9a27d-4768-4520-a1b2-425faca3c823")
    
    # Path to the parsed resume JSON
    json_path = Path("profile_41e9a27d-4768-4520-a1b2-425faca3c823.json")
    
    # Create session and repository
    session = AsyncSessionLocal()
    repository = ResumeRepository(session)
    
    try:
        print("🚀 Starting profile import...")
        print(f"User ID: {user_id}")
        print(f"JSON File: {json_path}")
        
        # Import the complete profile
        result = await repository.import_profile_from_json(
            user_id=user_id,
            json_file_path=str(json_path),
        )
        
        # Display results
        print("\n✅ Import completed successfully!")
        print(f"   Profile ID: {result['user_id']}")
        print(f"   Skills inserted: {result['skills_count']}")
        print(f"   Work experiences: {result['work_experiences_count']}")
        print(f"   Projects: {result['projects_count']}")
        print(f"   Education records: {result['education_count']}")
        print(f"   Status: {result['status']}")
        
        return result
        
    except FileNotFoundError as e:
        print(f"❌ Error: {str(e)}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None
    finally:
        await session.close()


async def example_with_detailed_output():
    """Example with detailed step-by-step output."""
    
    print("=" * 60)
    print("JSON Profile Import Example")
    print("=" * 60)
    
    user_id = UUID("41e9a27d-4768-4520-a1b2-425faca3c823")
    json_path = Path("profile_41e9a27d-4768-4520-a1b2-425faca3c823.json")
    
    # Step 1: Validate file
    print("\n[Step 1] Validating JSON file...")
    if not json_path.exists():
        print(f"❌ File not found: {json_path}")
        return
    print(f"✅ File found: {json_path}")
    
    # Step 2: Preview JSON content
    print("\n[Step 2] Previewing JSON content...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ JSON loaded successfully")
    print(f"   - Headline: {data.get('headline')}")
    print(f"   - Location: {data.get('current_location')}")
    print(f"   - Experience: {data.get('years_of_experience')} years")
    print(f"   - Skills: {len(data.get('skills', []))} total")
    print(f"   - Work experience: {len(data.get('work_experiences', []))} entries")
    print(f"   - Education: {len(data.get('education', []))} entries")
    
    # Step 3: Import to database
    print("\n[Step 3] Importing to database...")
    session = AsyncSessionLocal()
    repository = ResumeRepository(session)
    
    try:
        result = await repository.import_profile_from_json(
            user_id=user_id,
            json_file_path=str(json_path),
        )
        
        print("✅ Import successful!")
        print(f"   - Profile: 1 record")
        print(f"   - Skills: {result['skills_count']} inserted")
        print(f"   - Work Experiences: {result['work_experiences_count']} inserted")
        print(f"   - Projects: {result['projects_count']} inserted")
        print(f"   - Education: {result['education_count']} inserted")
        print(f"   - Total: {1 + result['skills_count'] + result['work_experiences_count'] + result['projects_count'] + result['education_count']} records")
        
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
    finally:
        await session.close()
    
    print("\n" + "=" * 60)


async def example_batch_import():
    """Example: Import multiple profiles."""
    
    # Define multiple profiles to import
    profiles = [
        {
            "user_id": UUID("41e9a27d-4768-4520-a1b2-425faca3c823"),
            "json_file": "profile_41e9a27d-4768-4520-a1b2-425faca3c823.json",
        },
        # Add more profiles as needed
    ]
    
    session = AsyncSessionLocal()
    repository = ResumeRepository(session)
    
    print("🚀 Starting batch import of profiles...")
    print(f"Total profiles to import: {len(profiles)}")
    print()
    
    results = []
    for idx, profile in enumerate(profiles, 1):
        print(f"[{idx}/{len(profiles)}] Importing {profile['json_file']}...")
        
        try:
            result = await repository.import_profile_from_json(
                user_id=profile['user_id'],
                json_file_path=profile['json_file'],
            )
            results.append(result)
            print(f"✅ Success: {result['skills_count']} skills, {result['education_count']} education")
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            results.append(None)
    
    await session.close()
    
    # Summary
    print("\n" + "=" * 60)
    print("BATCH IMPORT SUMMARY")
    print("=" * 60)
    successful = sum(1 for r in results if r is not None)
    print(f"Successful: {successful}/{len(profiles)}")
    print(f"Failed: {len(profiles) - successful}/{len(profiles)}")


# ═══════════════════════════════════════════════════════════════════════════
# Direct Usage Examples
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("Choose an example to run:\n")
    print("1. Basic import")
    print("2. Detailed output")
    print("3. Batch import")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        asyncio.run(example_import_from_file())
    elif choice == "2":
        asyncio.run(example_with_detailed_output())
    elif choice == "3":
        asyncio.run(example_batch_import())
    else:
        print("Invalid choice")
