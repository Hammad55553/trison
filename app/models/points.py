from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class PointsTransactionBase(BaseModel):
    user_id: str = Field(..., description="User ID")
    type: str = Field(..., description="Transaction type: earn, spend, expire, bonus")
    amount: int = Field(..., description="Points amount (positive for earn, negative for spend)")
    balance_after: int = Field(..., description="Points balance after transaction")
    source: str = Field(..., description="Source of points: qr_scan, purchase, referral, bonus")
    reference_id: Optional[str] = Field(None, description="Reference ID (order_id, qr_code_id, etc.)")
    reference_type: Optional[str] = Field(None, description="Reference type: order, qr_code, user")
    description: Optional[str] = Field(None, description="Transaction description")
    expires_at: Optional[datetime] = Field(None, description="Points expiration date")
    is_active: bool = Field(default=True, description="Transaction status")

class PointsTransactionCreate(PointsTransactionBase):
    pass

class PointsTransactionInDB(PointsTransactionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class PointsTransactionResponse(PointsTransactionBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class UserPointsSummary(BaseModel):
    user_id: str = Field(..., description="User ID")
    total_points_earned: int = Field(default=0, description="Total points earned")
    total_points_spent: int = Field(default=0, description="Total points spent")
    total_points_expired: int = Field(default=0, description="Total points expired")
    current_balance: int = Field(default=0, description="Current points balance")
    points_expiring_soon: int = Field(default=0, description="Points expiring in next 30 days")
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class PointsSummaryResponse(UserPointsSummary):
    pass 

class Points(Base):
    __tablename__ = "points"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # earn, spend, expire
    amount = Column(Integer, nullable=False)
    source = Column(String)  # qr_scan, purchase, referral
    reference_id = Column(String)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 