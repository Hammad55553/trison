from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.schemas.auth import (
    LoginRequest, RegisterRequest, OTPRequest, OTPVerifyRequest,
    TokenResponse, RefreshTokenRequest, AuthResponse, LogoutRequest
)
from app.services.auth_service import AuthService
from app.core.security import verify_token
from app.core.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/send-otp", response_model=AuthResponse)
async def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """Send OTP to user's phone number."""
    try:
        auth_service = AuthService(db)
        result = await auth_service.send_otp(request.phone_number)
        return AuthResponse(
            success=True,
            message="OTP sent successfully",
            data=result
        )
    except Exception as e:
        logger.error(f"Error sending OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and return tokens."""
    try:
        auth_service = AuthService(db)
        result = await auth_service.verify_otp(request.phone_number, request.otp)
        return AuthResponse(
            success=True,
            message="OTP verified successfully",
            data=result.dict() if hasattr(result, 'dict') else result
        )
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with phone number and OTP."""
    try:
        auth_service = AuthService(db)
        result = await auth_service.login(request.phone_number, request.otp)
        return AuthResponse(
            success=True,
            message="Login successful",
            data=result.dict() if hasattr(result, 'dict') else result
        )
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed"
        )

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register new user."""
    try:
        auth_service = AuthService(db)
        result = await auth_service.register(request)
        return AuthResponse(
            success=True,
            message="Registration successful",
            data=result.dict() if hasattr(result, 'dict') else result
        )
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        # Return the actual error message from the service
        error_message = str(e) if str(e) else "Registration failed"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    try:
        auth_service = AuthService(db)
        result = await auth_service.refresh_token(request.refresh_token)
        return AuthResponse(
            success=True,
            message="Token refreshed successfully",
            data=result.dict() if hasattr(result, 'dict') else result
        )
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

@router.post("/logout", response_model=AuthResponse)
async def logout(
    raw_request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Logout user and invalidate tokens."""
    try:
        # Get raw body to debug
        body = await raw_request.body()
        logger.info(f"Raw logout request body: {body}")
        
        # Parse JSON manually
        try:
            body_json = await raw_request.json()
            logger.info(f"Parsed logout request body: {body_json}")
            refresh_token = body_json.get("refresh_token")
        except Exception as parse_error:
            logger.error(f"Error parsing request body: {parse_error}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request body format"
            )
        
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="refresh_token is required"
            )
        
        auth_service = AuthService(db)
        await auth_service.logout(refresh_token, credentials.credentials)
        return AuthResponse(
            success=True,
            message="Logout successful",
            data=None
        )
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )

@router.get("/me")
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information."""
    try:
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        auth_service = AuthService(db)
        user = await auth_service.get_current_user(payload.get("sub"))
        return {
            "success": True,
            "message": "User information retrieved",
            "data": user
        }
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get user information"
        ) 