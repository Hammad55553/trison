from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class OrderItem(BaseModel):
    product_id: str = Field(..., description="Product ID")
    product_name: str = Field(..., description="Product name")
    quantity: int = Field(..., description="Quantity ordered")
    unit_price: float = Field(..., description="Unit price")
    total_price: float = Field(..., description="Total price for this item")
    points_earned: int = Field(default=0, description="Points earned from this item")

class OrderBase(BaseModel):
    user_id: str = Field(..., description="User ID who placed the order")
    order_number: str = Field(..., description="Unique order number")
    items: List[OrderItem] = Field(..., description="Order items")
    subtotal: float = Field(..., description="Order subtotal")
    tax_amount: float = Field(default=0.0, description="Tax amount")
    discount_amount: float = Field(default=0.0, description="Discount amount")
    shipping_amount: float = Field(default=0.0, description="Shipping amount")
    total_amount: float = Field(..., description="Total order amount")
    currency: str = Field(default="PKR", description="Order currency")
    status: str = Field(default="pending", description="Order status")
    payment_status: str = Field(default="pending", description="Payment status")
    payment_method: Optional[str] = Field(None, description="Payment method used")
    shipping_address: Optional[dict] = Field(None, description="Shipping address")
    billing_address: Optional[dict] = Field(None, description="Billing address")
    notes: Optional[str] = Field(None, description="Order notes")
    retailer_id: Optional[str] = Field(None, description="Associated retailer ID")
    total_points_earned: int = Field(default=0, description="Total points earned from order")

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    notes: Optional[str] = None
    tracking_number: Optional[str] = None

class OrderInDB(OrderBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = Field(None, description="Order processing timestamp")
    shipped_at: Optional[datetime] = Field(None, description="Order shipping timestamp")
    delivered_at: Optional[datetime] = Field(None, description="Order delivery timestamp")
    cancelled_at: Optional[datetime] = Field(None, description="Order cancellation timestamp")
    tracking_number: Optional[str] = Field(None, description="Shipping tracking number")
    estimated_delivery: Optional[datetime] = Field(None, description="Estimated delivery date")
    actual_delivery: Optional[datetime] = Field(None, description="Actual delivery date")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrderResponse(OrderBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    tracking_number: Optional[str]
    estimated_delivery: Optional[datetime]
    actual_delivery: Optional[datetime]

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str} 