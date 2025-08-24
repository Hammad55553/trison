from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/balance")
async def get_points_balance(current_user: User = Depends(get_current_user)):
    """Get current points balance"""
    return {
        "success": True,
        "total_points": current_user.total_points
    }

@router.get("/transactions")
async def get_points_transactions(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    limit: int = 20,
    offset: int = 0,
    transaction_type: str = None
):
    """Get user's points transaction history."""
    try:
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = payload.get("sub")
        db = get_database()
        
        # Build query
        query = {"user_id": user_id}
        if transaction_type:
            query["type"] = transaction_type
        
        # Get transactions with pagination
        transactions = await db.points.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).skip(offset).limit(limit).to_list(length=limit)
        
        # Get total count
        total_transactions = await db.points.count_documents(query)
        
        return {
            "success": True,
            "message": "Points transactions retrieved successfully",
            "data": {
                "transactions": transactions,
                "total": total_transactions,
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting points transactions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get points transactions"
        )

@router.get("/summary")
async def get_points_summary(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get user's points summary."""
    try:
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = payload.get("sub")
        db = get_database()
        
        # Get user's current points
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Calculate points summary
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": "$type",
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            }
        ]
        
        summary_results = await db.points.aggregate(pipeline).to_list(length=None)
        
        # Process summary results
        summary = {
            "total_points_earned": 0,
            "total_points_spent": 0,
            "total_points_expired": 0,
            "current_balance": user.get("total_points", 0),
            "transaction_counts": {}
        }
        
        for result in summary_results:
            transaction_type = result["_id"]
            amount = result["total_amount"]
            count = result["count"]
            
            summary["transaction_counts"][transaction_type] = count
            
            if transaction_type == "earn":
                summary["total_points_earned"] = amount
            elif transaction_type == "spend":
                summary["total_points_spent"] = abs(amount)
            elif transaction_type == "expire":
                summary["total_points_expired"] = abs(amount)
        
        return {
            "success": True,
            "message": "Points summary retrieved successfully",
            "data": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting points summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get points summary"
        ) 