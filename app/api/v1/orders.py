from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_orders():
    """Get orders list"""
    return {
        "success": True,
        "orders": []
    } 