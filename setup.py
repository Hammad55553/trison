#!/usr/bin/env python3
"""
Setup script for Trison Solar Backend
This script helps initialize the database with sample data
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.security import generate_user_id, generate_qr_code
from app.core.config import settings

async def setup_database():
    """Initialize database with sample data"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client.trison
        
        print("Connected to MongoDB successfully!")
        
        # Create sample products
        sample_products = [
            {
                "_id": generate_user_id(),
                "name": "Trison Solar Panel 100W",
                "description": "High-efficiency 100W solar panel for residential use",
                "category": "Solar Panels",
                "subcategory": "Residential",
                "brand": "Trison",
                "model_number": "TRS-100W",
                "sku": "TRS-100W-001",
                "price": 15000.0,
                "original_price": 18000.0,
                "currency": "PKR",
                "stock_quantity": 50,
                "min_stock_level": 5,
                "weight": 8.5,
                "dimensions": {"length": 100, "width": 50, "height": 3},
                "specifications": {
                    "power": "100W",
                    "voltage": "12V",
                    "efficiency": "18%",
                    "warranty": "25 years"
                },
                "features": [
                    "High efficiency monocrystalline cells",
                    "Weather resistant",
                    "Easy installation",
                    "25-year warranty"
                ],
                "images": [],
                "is_active": True,
                "is_featured": True,
                "warranty_period": 300,
                "points_reward": 150,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "_id": generate_user_id(),
                "name": "Trison Solar Inverter 1000W",
                "description": "Pure sine wave inverter for solar systems",
                "category": "Inverters",
                "subcategory": "Solar Inverters",
                "brand": "Trison",
                "model_number": "TRS-INV-1000W",
                "sku": "TRS-INV-1000W-001",
                "price": 25000.0,
                "original_price": 30000.0,
                "currency": "PKR",
                "stock_quantity": 30,
                "min_stock_level": 3,
                "weight": 5.0,
                "dimensions": {"length": 30, "width": 20, "height": 15},
                "specifications": {
                    "power": "1000W",
                    "input_voltage": "12V/24V",
                    "output_voltage": "220V AC",
                    "efficiency": "90%"
                },
                "features": [
                    "Pure sine wave output",
                    "Overload protection",
                    "Low battery protection",
                    "LCD display"
                ],
                "images": [],
                "is_active": True,
                "is_featured": False,
                "warranty_period": 24,
                "points_reward": 250,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "_id": generate_user_id(),
                "name": "Trison Solar Battery 100Ah",
                "description": "Deep cycle solar battery for energy storage",
                "category": "Batteries",
                "subcategory": "Deep Cycle",
                "brand": "Trison",
                "model_number": "TRS-BAT-100AH",
                "sku": "TRS-BAT-100AH-001",
                "price": 35000.0,
                "original_price": 40000.0,
                "currency": "PKR",
                "stock_quantity": 25,
                "min_stock_level": 2,
                "weight": 25.0,
                "dimensions": {"length": 40, "width": 20, "height": 25},
                "specifications": {
                    "capacity": "100Ah",
                    "voltage": "12V",
                    "cycle_life": "1000 cycles",
                    "warranty": "2 years"
                },
                "features": [
                    "Deep cycle design",
                    "Long cycle life",
                    "Maintenance free",
                    "High capacity"
                ],
                "images": [],
                "is_active": True,
                "is_featured": True,
                "warranty_period": 24,
                "points_reward": 350,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Insert sample products
        for product in sample_products:
            await db.products.insert_one(product)
        
        print(f"Inserted {len(sample_products)} sample products")
        
        # Create sample QR codes
        sample_qr_codes = []
        for i, product in enumerate(sample_products):
            qr_code = {
                "_id": generate_user_id(),
                "code": generate_qr_code(),
                "product_id": str(product["_id"]),
                "product_name": product["name"],
                "type": "product",
                "points_value": 10,
                "is_active": True,
                "max_scans": 100,
                "current_scans": 0,
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=365),
                "description": f"QR code for {product['name']}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            sample_qr_codes.append(qr_code)
        
        # Insert sample QR codes
        for qr_code in sample_qr_codes:
            await db.qr_codes.insert_one(qr_code)
        
        print(f"Inserted {len(sample_qr_codes)} sample QR codes")
        
        # Create sample admin user
        admin_user = {
            "_id": generate_user_id(),
            "phone_number": "03001234567",
            "email": "admin@trison.com",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
            "is_active": True,
            "is_verified": True,
            "total_points": 0,
            "referral_code": "TRSADMIN001",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "login_count": 1,
            "device_tokens": []
        }
        
        await db.users.insert_one(admin_user)
        print("Created admin user (Phone: 03001234567)")
        
        print("\nDatabase setup completed successfully!")
        print("\nSample data created:")
        print("- 3 sample products")
        print("- 3 sample QR codes")
        print("- 1 admin user (Phone: 03001234567)")
        print("\nYou can now start the application!")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    print("Setting up Trison Solar Backend Database...")
    asyncio.run(setup_database()) 