"""
Profile API Tests - Example test cases for the profile API
Place in: ai/tests/test_profile_api.py
"""

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from uuid import uuid4
from datetime import date, datetime

# Note: These are example tests. Use pytest with httpx for async testing.


@pytest_asyncio.fixture
async def test_db_session():
    """Create test database session"""
    # For testing, use in-memory SQLite or test PostgreSQL instance
    # Example: sqlite+aiosqlite:///:memory:
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    
    async with engine.begin() as conn:
        # Create tables
        from ai.models.orm_models import Base
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture
async def sample_user_data(test_db_session):
    """Create sample user data for testing"""
    from ai.models.orm_models import User, JobseekerProfile, WorkExperience, Education, Skill, JobseekerSkill
    
    # Create user
    user = User(
        id=uuid4(),
        email="test@example.com",
        phone="+919999999999",
        password_hash="hashed_password",
        full_name="Test User",
        avatar_url="https://example.com/avatar.jpg",
        is_email_verified=True,
        is_phone_verified=True,
    )
    
    test_db_session.add(user)
    await test_db_session.flush()
    
    # Create profile
    profile = JobseekerProfile(
        user_id=user.id,
        headline="Senior Engineer",
        summary="Experienced developer",
        current_location="Bangalore",
        years_of_experience=5.5,
        linkedin_url="https://linkedin.com/in/testuser",
        profile_completion=75,
    )
    
    test_db_session.add(profile)
    await test_db_session.flush()
    
    # Create work experience
    experience = WorkExperience(
        user_id=user.id,
        company_name="Tech Corp",
        title="Senior Engineer",
        start_date=date(2020, 1, 15),
        is_current=True,
        description="Led development",
        skills_used=["Python", "FastAPI"],
    )
    
    test_db_session.add(experience)
    await test_db_session.flush()
    
    # Create education
    education = Education(
        user_id=user.id,
        institution="NIT",
        degree="BTech",
        field_of_study="Computer Science",
        start_year=2015,
        end_year=2019,
    )
    
    test_db_session.add(education)
    await test_db_session.flush()
    
    # Create skill
    skill = Skill(
        name="Python",
        category="backend",
    )
    
    test_db_session.add(skill)
    await test_db_session.flush()
    
    # Create jobseeker skill
    jobseeker_skill = JobseekerSkill(
        user_id=user.id,
        skill_id=skill.id,
        level="expert",
        years=6.0,
        is_primary=True,
    )
    
    test_db_session.add(jobseeker_skill)
    await test_db_session.commit()
    
    return {
        "user": user,
        "profile": profile,
        "experience": experience,
        "education": education,
        "skill": skill,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Service Layer Tests
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_profile_service_fetch_success(test_db_session, sample_user_data):
    """Test fetching profile successfully"""
    from ai.services.profile_service import ProfileService
    
    profile_data = await ProfileService.fetch_user_profile(
        phone="+919999999999",
        session=test_db_session
    )
    
    assert profile_data is not None
    assert profile_data["email"] == "test@example.com"
    assert profile_data["full_name"] == "Test User"
    assert profile_data["headline"] == "Senior Engineer"


@pytest.mark.asyncio
async def test_profile_service_validation():
    """Test profile data validation"""
    from ai.services.profile_service import ProfileService
    
    # Valid profile data
    valid_profile = {
        "id": uuid4(),
        "email": "test@example.com",
        "full_name": "Test User",
        "phone": "+919999999999",
    }
    
    errors = ProfileService.validate_profile_data(valid_profile)
    assert len(errors) == 0
    
    # Invalid email
    invalid_profile = {
        "id": uuid4(),
        "email": "invalid-email",
        "full_name": "Test User",
    }
    
    errors = ProfileService.validate_profile_data(invalid_profile)
    assert "email" in errors


@pytest.mark.asyncio
async def test_profile_completion_calculation():
    """Test profile completion percentage calculation"""
    from ai.services.profile_service import ProfileService
    
    profile = {
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+919999999999",
        "headline": "Engineer",
        "summary": "Experienced",
        "current_location": "Bangalore",
        "experience": [{"company": "Tech Corp"}],
        "education": [{"institution": "NIT"}],
        "skills": [{"name": "Python"}],
        "certifications": [],
        "linkedin_url": "https://linkedin.com/in/john",
        "github_url": None,
        "portfolio_url": None,
    }
    
    completion = ProfileService.calculate_profile_completion(profile)
    assert 0 <= completion <= 100
    assert completion > 50  # Should be more than 50% complete


# ──────────────────────────────────────────────────────────────────────────────
# API Endpoint Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_fetch_profile_endpoint_success(client, sample_user_data):
    """Test GET /api/profile/fetch endpoint success"""
    response = client.get("/api/profile/fetch?phone=%2B919999999999")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["email"] == "test@example.com"
    assert data["data"]["full_name"] == "Test User"


def test_fetch_profile_endpoint_missing_params(client):
    """Test GET /api/profile/fetch without parameters"""
    response = client.get("/api/profile/fetch")
    
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert "required" in data["message"].lower()


def test_fetch_profile_endpoint_not_found(client):
    """Test GET /api/profile/fetch for non-existent user"""
    response = client.get("/api/profile/fetch?phone=%2B911111111111")
    
    assert response.status_code == 404
    data = response.json()
    assert data["status"] == "error"
    assert "not found" in data["message"].lower()


def test_fetch_profile_post_endpoint(client, sample_user_data):
    """Test POST /api/profile/fetch-by-request endpoint"""
    response = client.post(
        "/api/profile/fetch-by-request",
        json={"phone": "+919999999999"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["email"] == "test@example.com"


def test_health_check_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/api/profile/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "profile-api"


# ──────────────────────────────────────────────────────────────────────────────
# Response Format Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_profile_response_structure(client, sample_user_data):
    """Test that response has correct structure"""
    response = client.get("/api/profile/fetch?phone=%2B919999999999")
    data = response.json()
    
    # Check top-level fields
    assert "status" in data
    assert "data" in data
    assert "timestamp" in data
    
    profile = data["data"]
    
    # Check user fields
    assert "id" in profile
    assert "email" in profile
    assert "phone" in profile
    assert "full_name" in profile
    
    # Check profile fields
    assert "headline" in profile
    assert "experience" in profile
    assert "education" in profile
    assert "skills" in profile
    assert "certifications" in profile
    
    # Check collections are arrays
    assert isinstance(profile["experience"], list)
    assert isinstance(profile["education"], list)
    assert isinstance(profile["skills"], list)
    assert isinstance(profile["certifications"], list)


def test_work_experience_response_structure(client, sample_user_data):
    """Test work experience response structure"""
    response = client.get("/api/profile/fetch?phone=%2B919999999999")
    profile = response.json()["data"]
    
    assert len(profile["experience"]) > 0
    
    experience = profile["experience"][0]
    assert "id" in experience
    assert "company_name" in experience
    assert "title" in experience
    assert "start_date" in experience
    assert experience["company_name"] == "Tech Corp"


# ──────────────────────────────────────────────────────────────────────────────
# Error Handling Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_error_response_structure(client):
    """Test error response structure"""
    response = client.get("/api/profile/fetch")
    data = response.json()
    
    # Error response should have these fields
    assert "status" in data
    assert data["status"] == "error"
    assert "message" in data
    assert "timestamp" in data


# ──────────────────────────────────────────────────────────────────────────────
# Notes for Running Tests
# ──────────────────────────────────────────────────────────────────────────────

"""
To run these tests:

1. Install test dependencies:
    pip install pytest pytest-asyncio pytest-cov httpx

2. Run all tests:
    pytest ai/tests/test_profile_api.py

3. Run with coverage:
    pytest ai/tests/test_profile_api.py --cov=ai --cov-report=html

4. Run specific test:
    pytest ai/tests/test_profile_api.py::test_fetch_profile_endpoint_success

5. Run with verbose output:
    pytest ai/tests/test_profile_api.py -v

For integration testing, create a fixture that creates a real test database instance.
"""
