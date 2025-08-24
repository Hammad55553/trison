from fastapi import APIRouter
from .auth import router as auth_router
# from .qr_codes import router as qr_codes_router
# from .users import router as users_router
# from .products import router as products_router
# from .orders import router as orders_router
# from .points import router as points_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(users_router, prefix="/users", tags=["Users"])
# api_router.include_router(qr_codes_router, prefix="/qr-codes", tags=["QR Codes"])
# api_router.include_router(products_router, prefix="/products", tags=["Products"])
# api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])
# api_router.include_router(points_router, prefix="/points", tags=["Points"]) 