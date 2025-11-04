from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from auth import verify_google_token, create_access_token
from repositories.mysql_repositories import MySQLUserRepository
from database import get_db
import os

router = APIRouter(prefix="/auth", tags=["authentication"])

class GoogleTokenRequest(BaseModel):
    token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/google/token", response_model=TokenResponse)
async def authenticate_google_token(
    request: GoogleTokenRequest,
    db: Session = Depends(get_db)
):
    """Exchange Google ID token for backend JWT"""
    try:
        # Verify Google token
        google_user_info = await verify_google_token(request.token)
        
        user_repo = MySQLUserRepository(db)
        
        # Check if user exists
        user = user_repo.get_user_by_google_id(google_user_info["sub"])
        
        if not user:
            # Create new user
            user = user_repo.create_user(
                google_id=google_user_info["sub"],
                email=google_user_info["email"],
                display_name=google_user_info["name"],
                avatar_url=google_user_info.get("picture", "")
            )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth2 login flow"""
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = "http://localhost:3000/auth/callback"  # Frontend callback
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={google_client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"access_type=offline"
    )
    
    return {"auth_url": google_auth_url}
