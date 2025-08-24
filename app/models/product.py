from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class ProductBase(BaseModel):
    name: str = Field(..., description="Product name")
    description: Optional[str] = Field(None, description="Product description")
    category: str = Field(..., description="Product category")
    subcategory: Optional[str] = Field(None, description="Product subcategory")
    brand: str = Field(default="Trison", description="Product brand")
    model_number: Optional[str] = Field(None, description="Product model number")
    sku: str = Field(..., description="Stock keeping unit")
    price: float = Field(..., description="Product price")
    original_price: Optional[float] = Field(None, description="Original price before discount")
    currency: str = Field(default="PKR", description="Price currency")
    stock_quantity: int = Field(default=0, description="Available stock quantity")
    min_stock_level: int = Field(default=5, description="Minimum stock level for alerts")
    weight: Optional[float] = Field(None, description="Product weight in kg")
    dimensions: Optional[dict] = Field(None, description="Product dimensions")
    specifications: Optional[dict] = Field(None, description="Product specifications")
    features: Optional[List[str]] = Field(default_factory=list, description="Product features")
    images: List[str] = Field(default_factory=list, description="Product image URLs")
    is_active: bool = Field(default=True, description="Product availability status")
    is_featured: bool = Field(default=False, description="Featured product status")
    warranty_period: Optional[int] = Field(None, description="Warranty period in months")
    points_reward: int = Field(default=0, description="Points earned on purchase")
    retailer_id: Optional[str] = Field(None, description="Associated retailer ID")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    model_number: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    currency: Optional[str] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    weight: Optional[float] = None
    dimensions: Optional[dict] = None
    specifications: Optional[dict] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    warranty_period: Optional[int] = None
    points_reward: Optional[int] = None

class ProductInDB(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(None, description="User ID who created the product")
    total_sales: int = Field(default=0, description="Total units sold")
    total_revenue: float = Field(default=0.0, description="Total revenue generated")
    average_rating: float = Field(default=0.0, description="Average product rating")
    review_count: int = Field(default=0, description="Number of reviews")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ProductResponse(ProductBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    total_sales: int
    total_revenue: float
    average_rating: float
    review_count: int

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str} 