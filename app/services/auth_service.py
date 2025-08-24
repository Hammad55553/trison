from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token, verify_token,
    generate_otp, generate_user_id
)
from app.models.user import UserCreate, UserInDB, UserResponse
from app.schemas.auth import TokenResponse, RegisterRequest
from app.core.config import settings
import logging
import redis
try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    async def send_otp(self, phone_number: str) -> Dict[str, Any]:
        """Send OTP to phone number."""
        try:
            # Generate OTP
            otp = generate_otp()
            
            # Store OTP in Redis with expiration (5 minutes)
            otp_key = f"otp:{phone_number}"
            self.redis_client.setex(otp_key, 300, otp)
            
            # Send OTP via Twilio SMS
            if TWILIO_AVAILABLE and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
                try:
                    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                    message = client.messages.create(
                        body=f"Your Trison Solar OTP is: {otp}. Valid for 5 minutes.",
                        from_=settings.TWILIO_PHONE_NUMBER,
                        to=f"+{phone_number}" if not phone_number.startswith('+') else phone_number
                    )
                    logger.info(f"OTP SMS sent successfully to {phone_number}. SID: {message.sid}")
                except TwilioException as twilio_error:
                    logger.error(f"Twilio SMS error: {twilio_error}")
                    # Fallback to logging OTP if SMS fails
                    logger.info(f"OTP for {phone_number}: {otp}")
            else:
                # Fallback: log OTP if Twilio not configured
                logger.info(f"OTP for {phone_number}: {otp}")
                logger.warning("Twilio not configured. OTP only logged to console.")
                
                # In development mode, return OTP in response for testing
                if settings.DEBUG:
                    return {"success": True, "otp": otp, "message": "OTP generated (Twilio not configured)"}
                
                return {"success": True, "message": "OTP sent successfully"}
        except Exception as e:
            logger.error(f"Error sending OTP: {e}")
            raise e
    
    async def verify_otp(self, phone_number: str, otp: str) -> TokenResponse:
        """Verify OTP and return tokens."""
        try:
            # Get stored OTP from Redis
            otp_key = f"otp:{phone_number}"
            stored_otp = self.redis_client.get(otp_key)
            
            if not stored_otp or stored_otp != otp:
                raise ValueError("Invalid OTP")
            
            # Delete OTP from Redis after successful verification
            self.redis_client.delete(otp_key)
            
            # Check if user exists in PostgreSQL
            from app.models.user import User
            user = self.db.query(User).filter(User.phone_number == phone_number).first()
            
            if not user:
                # Create new user if doesn't exist
                user_data = UserCreate(
                    phone_number=phone_number,
                    is_verified=True
                )
                user = await self._create_user(user_data)
            else:
                # Update user verification status
                user.is_verified = True
                user.last_login = datetime.utcnow()
                user.login_count = user.login_count + 1 if user.login_count else 1
                user.updated_at = datetime.utcnow()
                self.db.commit()
            
            # Generate tokens
            access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            # Log token information for debugging
            logger.info(f"=== USER LOGIN SUCCESSFUL ===")
            logger.info(f"User ID: {user.id}")
            logger.info(f"Phone: {user.phone_number}")
            logger.info(f"Name: {user.first_name} {user.last_name}")
            logger.info(f"Role: {user.role}")
            logger.info(f"Points: {user.total_points}")
            logger.info(f"Access Token: {access_token[:50]}...")
            logger.info(f"Refresh Token: {refresh_token[:50]}...")
            logger.info(f"Token Expires: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
            logger.info(f"================================")
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user_id=str(user.id),
                role=user.role
            )
            
        except Exception as e:
            logger.error(f"Error verifying OTP: {e}")
            raise e
    
    async def login(self, phone_number: str, otp: str) -> TokenResponse:
        """Login user with phone number and OTP."""
        return await self.verify_otp(phone_number, otp)
    
    async def register(self, request: RegisterRequest) -> TokenResponse:
        """Register new user."""
        try:
            # Check if user already exists
            from app.models.user import User
            existing_user = self.db.query(User).filter(User.phone_number == request.phone_number).first()
            if existing_user:
                raise ValueError("User already exists")
            
            # Create user data
            user_data = UserCreate(
                phone_number=request.phone_number,
                email=request.email,
                first_name=request.first_name,
                last_name=request.last_name,
                is_verified=True
            )
            
            # Create user
            user = await self._create_user(user_data)
            
            # Generate tokens
            access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
            refresh_token = create_refresh_token(data={"sub": str(user.id)})
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user_id=str(user.id),
                role=user.role
            )
            
        except Exception as e:
            logger.error(f"Error during registration: {e}")
            raise e
    
    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token."""
        try:
            # Verify refresh token
            payload = verify_token(refresh_token)
            if not payload or payload.get("type") != "refresh":
                raise ValueError("Invalid refresh token")
            
            user_id = payload.get("sub")
            from app.models.user import User
            user = self.db.query(User).filter(User.id == int(user_id)).first()
            
            if not user:
                raise ValueError("User not found")
            
            # Generate new tokens
            access_token = create_access_token(data={"sub": user_id, "role": user.role})
            new_refresh_token = create_refresh_token(data={"sub": user_id})
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=new_refresh_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user_id=user_id,
                role=user.role
            )
            
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            raise e
    
    async def logout(self, refresh_token: str, access_token: str) -> bool:
        """Logout user and invalidate tokens."""
        try:
            # Add tokens to blacklist
            self.redis_client.setex(f"blacklist:{access_token}", 3600, "1")  # 1 hour
            self.redis_client.setex(f"blacklist:{refresh_token}", 86400, "1")  # 24 hours
            
            return True
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            raise e
    
    async def get_current_user(self, user_id: str) -> Dict[str, Any]:
        """Get current user information."""
        try:
            from app.models.user import User
            user = self.db.query(User).filter(User.id == int(user_id)).first()
            if not user:
                raise ValueError("User not found")
            
            return {
                "id": str(user.id),
                "phone_number": user.phone_number,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "is_verified": user.is_verified,
                "total_points": user.total_points,
                "created_at": user.created_at,
                "last_login": user.last_login
            }
        except Exception as e:
            logger.error(f"Error getting current user: {e}")
            raise e
    
    async def _create_user(self, user_data: UserCreate) -> Any:
        """Create new user in database."""
        try:
            from app.models.user import User
            
            user_dict = user_data.dict()
            user_dict["created_at"] = datetime.utcnow()
            user_dict["updated_at"] = datetime.utcnow()
            user_dict["last_login"] = datetime.utcnow()
            user_dict["login_count"] = 1
            
            # No password needed for OTP-based authentication
            # user_dict["hashed_password"] = None
            
            # Generate referral code
            user_dict["referral_code"] = f"TRS{generate_user_id()[:8].upper()}"
            
            # Create user instance
            user = User(**user_dict)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            return user
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            self.db.rollback()
            raise e 