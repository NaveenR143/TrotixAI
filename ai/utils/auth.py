import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Request, HTTPException, Depends
from dotenv import load_dotenv

load_dotenv()

# Logger for auth failures
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "default_secret_key_change_me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Generate a JWT access token.
    
    Args:
        data: Payload to include in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


async def get_current_user(request: Request):
    """
    FastAPI dependency to get the current authenticated user from cookies or Authorization header.
    """
    token = request.cookies.get("access_token")
    
    if not token:
        # Check Authorization header if cookie not present
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            
    if not token:
        logger.warning("Authentication failed: Missing access_token cookie and Authorization header.")
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            logger.error("Authentication failed: Token payload missing 'sub'")
            raise HTTPException(status_code=401, detail="Invalid authentication token")
            
        return user_id
        
    except jwt.ExpiredSignatureError:
        logger.warning("Authentication failed: Token expired")
        raise HTTPException(status_code=401, detail="Authentication token expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Authentication failed: Invalid token - {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
