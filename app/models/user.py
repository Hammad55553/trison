from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

# SQLAlchemy User Model for Database
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    role = Column(String, default="client")
    is_verified = Column(Boolean, default=False)
    total_points = Column(Integer, default=0)
    referral_code = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0)

# Pydantic Schemas for API
class UserBase(BaseModel):
    phone_number: str = Field(..., description="User's phone number")
    email: Optional[EmailStr] = Field(None, description="User's email address")
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    role: str = Field(default="client", description="User role")
    is_verified: bool = Field(default=False, description="User verification status")
    total_points: int = Field(default=0, description="Total points earned")
    referral_code: Optional[str] = Field(None, description="User's referral code")

class UserCreate(UserBase):
    pass

class UserInDB(UserBase):
    id: int = Field(..., description="User ID")
    hashed_password: Optional[str] = Field(None, description="Hashed password")
    created_at: datetime = Field(..., description="Account creation time")
    updated_at: datetime = Field(..., description="Last update time")
    last_login: Optional[datetime] = Field(None, description="Last login time")
    login_count: int = Field(default=0, description="Number of logins")

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Account creation time")
    last_login: Optional[datetime] = Field(None, description="Last login time")

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    total_points: Optional[int] = None
    is_verified: Optional[bool] = None 