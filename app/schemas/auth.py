from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    phone_number: str = Field(..., description="User's phone number")
    otp: Optional[str] = Field(None, description="OTP for verification")

class RegisterRequest(BaseModel):
    phone_number: str = Field(..., description="User's phone number")
    email: Optional[EmailStr] = Field(None, description="User's email address")
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    password: Optional[str] = Field(None, description="User's password")
    referral_code: Optional[str] = Field(None, description="Referral code")

class OTPRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number to send OTP")

class OTPVerifyRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number")
    otp: str = Field(..., description="OTP to verify")

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user_id: str = Field(..., description="User ID")
    role: str = Field(..., description="User role")

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")

class AuthResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[dict] = Field(None, description="Response data (tokens, OTP, etc.)")

class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token to invalidate") 