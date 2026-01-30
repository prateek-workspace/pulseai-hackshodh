"""
Health Data Routes for Pulse AI
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.health_data import HealthData

router = APIRouter(prefix="/health", tags=["Health Data"])


class HealthDataInput(BaseModel):
    user_id: int
    source: str = "wearable"
    heart_rate: Optional[float] = None
    hrv: Optional[float] = None
    sleep_duration: Optional[float] = None
    sleep_quality: Optional[float] = None
    activity_level: Optional[float] = None
    breathing_rate: Optional[float] = None
    bp_systolic: Optional[float] = None
    bp_diastolic: Optional[float] = None
    blood_sugar: Optional[float] = None
    symptoms: Optional[str] = None


class HealthDataResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    source: str
    heart_rate: Optional[float]
    hrv: Optional[float]
    sleep_duration: Optional[float]
    sleep_quality: Optional[float]
    activity_level: Optional[float]
    breathing_rate: Optional[float]
    bp_systolic: Optional[float]
    bp_diastolic: Optional[float]
    blood_sugar: Optional[float]
    is_anomaly: int

    class Config:
        from_attributes = True


@router.post("/ingest", response_model=HealthDataResponse)
def ingest_health_data(data: HealthDataInput, db: Session = Depends(get_db)):
    """
    Ingest health data from wearables or manual input
    """
    # Verify user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    health_data = HealthData(
        user_id=data.user_id,
        source=data.source,
        heart_rate=data.heart_rate,
        hrv=data.hrv,
        sleep_duration=data.sleep_duration,
        sleep_quality=data.sleep_quality,
        activity_level=data.activity_level,
        breathing_rate=data.breathing_rate,
        bp_systolic=data.bp_systolic,
        bp_diastolic=data.bp_diastolic,
        blood_sugar=data.blood_sugar,
        symptoms=data.symptoms
    )
    
    db.add(health_data)
    db.commit()
    db.refresh(health_data)
    
    return health_data


@router.get("/user/{user_id}", response_model=List[HealthDataResponse])
def get_user_health_data(
    user_id: int, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get health data for a user
    """
    data = db.query(HealthData).filter(
        HealthData.user_id == user_id
    ).order_by(HealthData.timestamp.desc()).limit(limit).all()
    
    return data


@router.get("/user/{user_id}/latest")
def get_latest_readings(user_id: int, db: Session = Depends(get_db)):
    """
    Get the latest reading for each signal
    """
    latest = db.query(HealthData).filter(
        HealthData.user_id == user_id
    ).order_by(HealthData.timestamp.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No health data found")
    
    return {
        "timestamp": latest.timestamp,
        "heart_rate": latest.heart_rate,
        "hrv": latest.hrv,
        "sleep_duration": latest.sleep_duration,
        "sleep_quality": latest.sleep_quality,
        "activity_level": latest.activity_level,
        "breathing_rate": latest.breathing_rate,
        "bp_systolic": latest.bp_systolic,
        "bp_diastolic": latest.bp_diastolic,
        "blood_sugar": latest.blood_sugar
    }


@router.get("/user/{user_id}/trends")
def get_health_trends(
    user_id: int, 
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Get health trends over time
    """
    from datetime import timedelta
    from sqlalchemy import func
    
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    data = db.query(HealthData).filter(
        HealthData.user_id == user_id,
        HealthData.timestamp >= cutoff
    ).order_by(HealthData.timestamp).all()
    
    if not data:
        return {"message": "No data found for the specified period"}
    
    # Group by day and calculate averages
    trends = {}
    for d in data:
        day_key = d.timestamp.strftime("%Y-%m-%d")
        if day_key not in trends:
            trends[day_key] = {
                "heart_rate": [],
                "hrv": [],
                "sleep_duration": [],
                "activity_level": [],
                "breathing_rate": []
            }
        
        if d.heart_rate:
            trends[day_key]["heart_rate"].append(d.heart_rate)
        if d.hrv:
            trends[day_key]["hrv"].append(d.hrv)
        if d.sleep_duration:
            trends[day_key]["sleep_duration"].append(d.sleep_duration)
        if d.activity_level:
            trends[day_key]["activity_level"].append(d.activity_level)
        if d.breathing_rate:
            trends[day_key]["breathing_rate"].append(d.breathing_rate)
    
    # Calculate daily averages
    result = []
    for day, signals in sorted(trends.items()):
        result.append({
            "date": day,
            "heart_rate": round(sum(signals["heart_rate"]) / len(signals["heart_rate"]), 1) if signals["heart_rate"] else None,
            "hrv": round(sum(signals["hrv"]) / len(signals["hrv"]), 1) if signals["hrv"] else None,
            "sleep_duration": round(sum(signals["sleep_duration"]) / len(signals["sleep_duration"]), 2) if signals["sleep_duration"] else None,
            "activity_level": round(sum(signals["activity_level"]) / len(signals["activity_level"])) if signals["activity_level"] else None,
            "breathing_rate": round(sum(signals["breathing_rate"]) / len(signals["breathing_rate"]), 1) if signals["breathing_rate"] else None
        })
    
    return {"trends": result, "days": days}
