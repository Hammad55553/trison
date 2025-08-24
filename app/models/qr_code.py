from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class QRCodeBase(BaseModel):
    code: str = Field(..., description="Unique QR code string")
    product_id: Optional[str] = Field(None, description="Associated product ID")
    product_name: Optional[str] = Field(None, description="Product name for display")
    type: str = Field(default="product", description="QR code type: product, reward, event")
    points_value: int = Field(default=0, description="Points earned when scanned")
    is_active: bool = Field(default=True, description="QR code status")
    max_scans: Optional[int] = Field(None, description="Maximum number of scans allowed")
    current_scans: int = Field(default=0, description="Current number of scans")
    valid_from: Optional[datetime] = Field(None, description="Validity start date")
    valid_until: Optional[datetime] = Field(None, description="Validity end date")
    description: Optional[str] = Field(None, description="QR code description")
    image_url: Optional[str] = Field(None, description="QR code image URL")
    created_by: Optional[str] = Field(None, description="User ID who created the QR code")
    retailer_id: Optional[str] = Field(None, description="Associated retailer ID")
    location: Optional[dict] = Field(None, description="QR code location coordinates")
    tags: List[str] = Field(default_factory=list, description="QR code tags")

class QRCodeCreate(QRCodeBase):
    pass

class QRCodeUpdate(BaseModel):
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    type: Optional[str] = None
    points_value: Optional[int] = None
    is_active: Optional[bool] = None
    max_scans: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[dict] = None
    tags: Optional[List[str]] = None

class QRCodeInDB(QRCodeBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_scanned_at: Optional[datetime] = Field(None, description="Last scan timestamp")
    total_points_awarded: int = Field(default=0, description="Total points awarded from this QR code")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class QRCodeResponse(QRCodeBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    last_scanned_at: Optional[datetime]
    total_points_awarded: int

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class QRCodeScan(BaseModel):
    qr_code_id: str = Field(..., description="QR code ID")
    user_id: str = Field(..., description="User ID who scanned")
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    location: Optional[dict] = Field(None, description="Scan location")
    device_info: Optional[dict] = Field(None, description="Device information")
    points_earned: int = Field(default=0, description="Points earned from this scan")
    is_valid: bool = Field(default=True, description="Whether the scan was valid")

class QRCodeScanInDB(QRCodeScan):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str} 

class QRCode(Base):
    __tablename__ = "qr_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    type = Column(String, default="product")
    points_value = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    max_scans = Column(Integer, default=1)
    current_scans = Column(Integer, default=0)
    valid_from = Column(DateTime(timezone=True), server_default=func.now())
    valid_until = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 