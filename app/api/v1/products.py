from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_products():
    """Get products list"""
    return {
        "success": True,
        "products": [
            {
                "id": 1,
                "name": "Solar Panel 100W",
                "description": "High efficiency solar panel",
                "price": 15000,
                "points_reward": 100
            }
        ]
    } 