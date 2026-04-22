"""
Profile Service - Business logic for user profile operations
Handles profile retrieval, validation, and data transformation
"""

from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, Dict, Any

from ai.db.profile_repository import ProfileRepository


class ProfileService:
    """Service layer for profile operations"""

    @staticmethod
    async def fetch_user_profile(
        phone: Optional[str] = None,
        user_id: Optional[UUID] = None,
        session: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Fetch user profile by phone or user ID
        
        Args:
            phone: User phone number (optional)
            user_id: User UUID (optional)
            session: Async database session
            
        Returns:
            Dictionary with user profile data
            
        Raises:
            ValueError: If neither phone nor user_id provided
            Exception: If database query fails
        """
        
        # Validate input
        if not phone and not user_id:
            raise ValueError("Either phone number or user_id must be provided")
        
        if not session:
            raise ValueError("Database session is required")
        
        # Fetch profile
        profile_data = None
        
        if phone:
            profile_data = await ProfileRepository.get_user_profile_by_phone(phone, session)
        elif user_id:
            profile_data = await ProfileRepository.get_user_profile_by_id(user_id, session)
        
        if not profile_data:
            raise ValueError("User profile not found")
        
        return profile_data

    @staticmethod
    def validate_profile_data(profile_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate profile data and return validation errors if any
        
        Args:
            profile_data: Profile dictionary to validate
            
        Returns:
            Dictionary of validation errors (empty if valid)
        """
        errors = {}
        
        # Validate required fields
        required_fields = {
            "id": "User ID",
            "email": "Email",
            "full_name": "Full Name",
        }
        
        for field, label in required_fields.items():
            if not profile_data.get(field):
                errors[field] = f"{label} is required"
        
        # Validate email format (basic)
        email = profile_data.get("email", "")
        if email and "@" not in email:
            errors["email"] = "Invalid email format"
        
        # Validate phone if present
        phone = profile_data.get("phone", "")
        if phone and len(str(phone).replace("+", "").replace("-", "").replace(" ", "")) < 7:
            errors["phone"] = "Invalid phone number"
        
        # Validate profile completion percentage
        profile_completion = profile_data.get("profile_completion", 0)
        if not isinstance(profile_completion, int) or profile_completion < 0 or profile_completion > 100:
            errors["profile_completion"] = "Profile completion must be between 0 and 100"
        
        # Validate experience dates
        for idx, exp in enumerate(profile_data.get("experience") or []):
            if exp.get("start_date") and exp.get("end_date"):
                if exp["start_date"] > exp["end_date"]:
                    errors[f"experience_{idx}"] = "Start date must be before end date"
        
        # Validate education dates
        for idx, edu in enumerate(profile_data.get("education") or []):
            if edu.get("start_year") and edu.get("end_year"):
                if edu["start_year"] > edu["end_year"]:
                    errors[f"education_{idx}"] = "Start year must be before end year"
        
        return errors

    @staticmethod
    def calculate_profile_completion(profile_data: Dict[str, Any]) -> int:
        """
        Calculate profile completion percentage based on filled fields
        
        Args:
            profile_data: Profile dictionary
            
        Returns:
            Profile completion percentage (0-100)
        """
        total_fields = 0
        filled_fields = 0
        
        # Basic fields
        basic_fields = [
            "full_name", "email", "phone", "headline", 
            "summary", "current_location"
        ]
        for field in basic_fields:
            total_fields += 1
            if profile_data.get(field):
                filled_fields += 1
        
        # Profile sections
        section_fields = {
            "experience": len(profile_data.get("experience") or []) > 0,
            "education": len(profile_data.get("education") or []) > 0,
            "skills": len(profile_data.get("skills") or []) > 0,
            "certifications": len(profile_data.get("certifications") or []) > 0,
        }
        
        for section, has_data in section_fields.items():
            total_fields += 1
            if has_data:
                filled_fields += 1
        
        # Social links
        social_links = ["linkedin_url", "github_url", "portfolio_url"]
        for link in social_links:
            total_fields += 1
            if profile_data.get(link):
                filled_fields += 1
        
        # Calculate percentage
        if total_fields == 0:
            return 0
        
        completion_percentage = int((filled_fields / total_fields) * 100)
        return min(completion_percentage, 100)

    @staticmethod
    def enrich_profile_data(profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich profile data with computed fields
        
        Args:
            profile_data: Profile dictionary
            
        Returns:
            Enriched profile data
        """
        
        # Calculate profile completion if not set
        if not profile_data.get("profile_completion") or profile_data["profile_completion"] == 0:
            profile_data["profile_completion"] = ProfileService.calculate_profile_completion(profile_data)
        
        # Add computed fields
        profile_data["total_experience_years"] = ProfileService._calculate_total_experience_years(
            profile_data.get("experience") or []
        )
        
        profile_data["skills_count"] = len(profile_data.get("skills") or [])
        profile_data["education_count"] = len(profile_data.get("education") or [])
        profile_data["certifications_count"] = len(profile_data.get("certifications") or [])
        
        return profile_data

    @staticmethod
    def _calculate_total_experience_years(experience_list: list) -> float:
        """
        Calculate total years of experience from experience list
        
        Args:
            experience_list: List of experience entries
            
        Returns:
            Total years of experience
        """
        if not experience_list:
            return 0.0
        
        total_years = 0.0
        from datetime import date
        
        for exp in experience_list:
            start_date = exp.get("start_date")
            end_date = exp.get("end_date")
            
            if start_date and end_date:
                # Convert to date if string
                if isinstance(start_date, str):
                    start_date = date.fromisoformat(start_date)
                if isinstance(end_date, str):
                    end_date = date.fromisoformat(end_date)
                
                # Calculate years
                years = (end_date - start_date).days / 365.25
                total_years += years
            elif start_date and not end_date:
                # Current role, calculate from start_date to today
                if isinstance(start_date, str):
                    start_date = date.fromisoformat(start_date)
                
                years = (date.today() - start_date).days / 365.25
                total_years += years
        
        return round(total_years, 1)
