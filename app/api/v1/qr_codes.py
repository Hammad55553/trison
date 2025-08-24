from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token
from app.core.database import get_mongodb
from app.models.qr_code import QRCodeScan
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/scan")
async def scan_qr_code(
    qr_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Scan a QR code and award points."""
    try:
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = payload.get("sub")
        db = get_mongodb()
        
        # Extract QR code from request
        qr_code = qr_data.get("qr_code")
        if not qr_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR code is required"
            )
        
        # Find QR code in database
        qr_record = await db.qr_codes.find_one({"code": qr_code, "is_active": True})
        if not qr_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid QR code"
            )
        
        # Check if QR code is still valid
        now = datetime.utcnow()
        if qr_record.get("valid_from") and now < qr_record["valid_from"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR code not yet valid"
            )
        
        if qr_record.get("valid_until") and now > qr_record["valid_until"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR code has expired"
            )
        
        # Check if user has already scanned this QR code
        existing_scan = await db.qr_scans.find_one({
            "qr_code_id": str(qr_record["_id"]),
            "user_id": user_id
        })
        
        if existing_scan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR code already scanned"
            )
        
        # Check if QR code has reached max scans
        if qr_record.get("max_scans") and qr_record["current_scans"] >= qr_record["max_scans"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR code scan limit reached"
            )
        
        # Award points
        points_earned = qr_record.get("points_value", 0)
        
        # Update user points
        await db.users.update_one(
            {"_id": user_id},
            {
                "$inc": {"total_points": points_earned},
                "$set": {"updated_at": now}
            }
        )
        
        # Record the scan
        scan_data = QRCodeScan(
            qr_code_id=str(qr_record["_id"]),
            user_id=user_id,
            scanned_at=now,
            points_earned=points_earned,
            is_valid=True
        )
        
        await db.qr_scans.insert_one(scan_data.dict())
        
        # Update QR code scan count
        await db.qr_codes.update_one(
            {"_id": qr_record["_id"]},
            {
                "$inc": {"current_scans": 1},
                "$set": {"last_scanned_at": now, "updated_at": now}
            }
        )
        
        # Record points transaction
        points_transaction = {
            "user_id": user_id,
            "type": "earn",
            "amount": points_earned,
            "source": "qr_scan",
            "reference_id": str(qr_record["_id"]),
            "reference_type": "qr_code",
            "description": f"Points earned from scanning QR code: {qr_record.get('product_name', 'Unknown')}",
            "created_at": now,
            "updated_at": now
        }
        
        await db.points.insert_one(points_transaction)
        
        return {
            "success": True,
            "message": "QR code scanned successfully",
            "data": {
                "points_earned": points_earned,
                "product_name": qr_record.get("product_name"),
                "description": qr_record.get("description"),
                "scanned_at": now.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning QR code: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to scan QR code"
        )

@router.get("/history")
async def get_scan_history(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    limit: int = 20,
    offset: int = 0
):
    """Get user's QR scan history."""
    try:
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = payload.get("sub")
        db = get_mongodb()
        
        # Get scan history with pagination
        scans = await db.qr_scans.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("scanned_at", -1).skip(offset).limit(limit).to_list(length=limit)
        
        # Get total count
        total_scans = await db.qr_scans.count_documents({"user_id": user_id})
        
        return {
            "success": True,
            "message": "Scan history retrieved successfully",
            "data": {
                "scans": scans,
                "total": total_scans,
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting scan history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get scan history"
        ) 