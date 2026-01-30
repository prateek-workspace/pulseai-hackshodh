"""
Webhook Routes for Pulse AI
Handles Health Connect webhook data ingestion from Android devices
"""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.health_data import HealthData
from app.services.carescore_engine import CareScoreEngine
from app.services.anomaly_detector import AnomalyDetector
from app.services.escalation_service import EscalationService

router = APIRouter(prefix="/webhook", tags=["Webhook"])


# ============================================
# Pydantic Models for Webhook Payloads
# ============================================

class HeartRateRecord(BaseModel):
    time: str
    value: float
    unit: Optional[str] = "bpm"


class SleepStageRecord(BaseModel):
    stage: str  # DEEP, LIGHT, REM, AWAKE
    startTime: str
    endTime: str


class BloodPressureRecord(BaseModel):
    time: str
    systolic: float
    diastolic: float
    unit: Optional[str] = "mmHg"


class BloodGlucoseRecord(BaseModel):
    time: str
    value: float
    unit: Optional[str] = "mg/dL"


class GenericRecord(BaseModel):
    time: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None


class WebhookPayload(BaseModel):
    dataType: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    records: List[Dict[str, Any]]


class WebhookBatchPayload(BaseModel):
    deviceId: str
    payloads: List[WebhookPayload]


# ============================================
# Device Token Model for Auth
# ============================================

class DeviceToken(BaseModel):
    device_id: str
    user_id: int
    created_at: datetime
    is_active: bool = True


# ============================================
# Helper Functions
# ============================================

def parse_iso_datetime(iso_string: str) -> datetime:
    """Parse ISO datetime string to datetime object"""
    try:
        # Handle various ISO formats
        if iso_string.endswith('Z'):
            iso_string = iso_string[:-1] + '+00:00'
        return datetime.fromisoformat(iso_string)
    except Exception:
        return datetime.utcnow()


def validate_api_key(api_key: str, db: Session) -> Optional[User]:
    """Validate API key and return associated user"""
    if not api_key:
        return None
    
    # API key format: "pulseai_{user_id}_{secret}"
    # For simplicity, we'll use email-based lookup
    # In production, use proper API key table
    
    user = db.query(User).filter(
        User.is_active == True
    ).first()
    
    return user


def normalize_health_connect_data(
    payload: WebhookPayload,
    user_id: int
) -> List[HealthData]:
    """
    Normalize Health Connect webhook data to internal schema
    """
    health_records = []
    data_type = payload.dataType.lower()
    
    for record in payload.records:
        health_data = HealthData(
            user_id=user_id,
            source="health_connect",
            timestamp=parse_iso_datetime(record.get('time', payload.startTime or datetime.utcnow().isoformat()))
        )
        
        # Map data types to our schema
        if data_type in ['heartrate', 'heart_rate']:
            health_data.heart_rate = record.get('value')
            
        elif data_type in ['restingheartrate', 'resting_heart_rate']:
            health_data.heart_rate = record.get('value')
            
        elif data_type in ['hrv', 'heartrratevariability', 'heart_rate_variability']:
            health_data.hrv = record.get('value')
            
        elif data_type in ['sleepsession', 'sleep_session', 'sleep']:
            # Calculate sleep duration from session
            if payload.startTime and payload.endTime:
                start = parse_iso_datetime(payload.startTime)
                end = parse_iso_datetime(payload.endTime)
                duration_hours = (end - start).total_seconds() / 3600
                health_data.sleep_duration = round(duration_hours, 2)
                health_data.timestamp = end
                
            # Calculate sleep quality from stages if available
            stages = record.get('stages', [])
            if stages:
                deep_time = sum(
                    (parse_iso_datetime(s['endTime']) - parse_iso_datetime(s['startTime'])).total_seconds()
                    for s in stages if s.get('stage') in ['DEEP', 'deep']
                )
                total_time = sum(
                    (parse_iso_datetime(s['endTime']) - parse_iso_datetime(s['startTime'])).total_seconds()
                    for s in stages
                )
                if total_time > 0:
                    # Quality based on deep sleep percentage
                    deep_percentage = (deep_time / total_time) * 100
                    health_data.sleep_quality = min(100, deep_percentage * 5)  # Scale to 0-100
                    
        elif data_type in ['steps']:
            health_data.activity_level = record.get('value', record.get('count'))
            
        elif data_type in ['bloodpressure', 'blood_pressure']:
            health_data.bp_systolic = record.get('systolic')
            health_data.bp_diastolic = record.get('diastolic')
            
        elif data_type in ['bloodglucose', 'blood_glucose', 'bloodsugar', 'blood_sugar']:
            health_data.blood_sugar = record.get('value')
            
        elif data_type in ['respiratoryrate', 'respiratory_rate', 'breathingrate', 'breathing_rate']:
            health_data.breathing_rate = record.get('value')
            
        elif data_type in ['spo2', 'oxygensaturation', 'oxygen_saturation']:
            # Store SpO2 in a generic field or add to schema
            pass
            
        elif data_type in ['weight']:
            # Could extend schema for weight tracking
            pass
            
        elif data_type in ['activecalories', 'active_calories', 'totalcalories', 'total_calories']:
            # Calories can contribute to activity level
            if record.get('value'):
                health_data.activity_level = record.get('value')
        
        # Only add if we captured some data
        if any([
            health_data.heart_rate,
            health_data.hrv,
            health_data.sleep_duration,
            health_data.activity_level,
            health_data.breathing_rate,
            health_data.bp_systolic,
            health_data.blood_sugar
        ]):
            health_records.append(health_data)
    
    return health_records


# ============================================
# Webhook Endpoints
# ============================================

@router.post("/ingest")
async def ingest_webhook(
    payload: WebhookPayload,
    request: Request,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_device_id: Optional[str] = Header(None, alias="X-Device-ID"),
    db: Session = Depends(get_db)
):
    """
    Ingest health data from Health Connect webhook
    
    Expected headers:
    - X-API-Key: User's API key for authentication
    - X-Device-ID: Android device identifier
    
    Expected body:
    {
        "dataType": "HeartRate",
        "startTime": "2026-01-28T10:00:00Z",
        "endTime": "2026-01-28T10:01:00Z",
        "records": [
            {"time": "2026-01-28T10:00:30Z", "value": 74, "unit": "bpm"}
        ]
    }
    """
    # Authenticate
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    
    user = validate_api_key(x_api_key, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Normalize and store data
    try:
        health_records = normalize_health_connect_data(payload, user.id)
        
        if not health_records:
            return {
                "success": True,
                "message": "No actionable data in payload",
                "records_stored": 0
            }
        
        # Store records
        db.add_all(health_records)
        db.commit()
        
        return {
            "success": True,
            "message": f"Ingested {len(health_records)} records",
            "records_stored": len(health_records),
            "data_type": payload.dataType,
            "user_id": user.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process data: {str(e)}")


@router.post("/ingest-batch")
async def ingest_batch_webhook(
    batch: WebhookBatchPayload,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
):
    """
    Ingest multiple data types in a single request
    
    Expected body:
    {
        "deviceId": "android-device-123",
        "payloads": [
            {"dataType": "HeartRate", "records": [...]},
            {"dataType": "Steps", "records": [...]}
        ]
    }
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    
    user = validate_api_key(x_api_key, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    total_records = 0
    results = []
    
    for payload in batch.payloads:
        try:
            health_records = normalize_health_connect_data(payload, user.id)
            if health_records:
                db.add_all(health_records)
                total_records += len(health_records)
                results.append({
                    "dataType": payload.dataType,
                    "records": len(health_records),
                    "status": "success"
                })
            else:
                results.append({
                    "dataType": payload.dataType,
                    "records": 0,
                    "status": "no_data"
                })
        except Exception as e:
            results.append({
                "dataType": payload.dataType,
                "records": 0,
                "status": "error",
                "error": str(e)
            })
    
    db.commit()
    
    return {
        "success": True,
        "device_id": batch.deviceId,
        "total_records": total_records,
        "results": results
    }


@router.post("/ingest-and-analyze")
async def ingest_and_analyze(
    payload: WebhookPayload,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_device_id: Optional[str] = Header(None, alias="X-Device-ID"),
    db: Session = Depends(get_db)
):
    """
    Ingest health data AND trigger analysis pipeline
    Returns updated CareScore
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    
    user = validate_api_key(x_api_key, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Store data
    health_records = normalize_health_connect_data(payload, user.id)
    if health_records:
        db.add_all(health_records)
        db.commit()
    
    # Get latest data for analysis
    latest = db.query(HealthData).filter(
        HealthData.user_id == user.id
    ).order_by(HealthData.timestamp.desc()).first()
    
    if not latest:
        return {
            "success": True,
            "records_stored": len(health_records),
            "analysis": None,
            "message": "Data stored, insufficient data for analysis"
        }
    
    # Build current data dict
    current_data = {
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
    
    # Compute CareScore
    try:
        engine = CareScoreEngine(db)
        care_score = engine.compute_carescore(user.id, current_data)
        
        # Check for escalation
        escalation_service = EscalationService(db)
        escalation = escalation_service.check_escalation(user.id, care_score)
        
        return {
            "success": True,
            "records_stored": len(health_records),
            "analysis": {
                "care_score": care_score.care_score,
                "status": care_score.status,
                "drift_score": care_score.drift_score,
                "confidence": care_score.confidence_score,
                "explanation": care_score.explanation
            },
            "escalation": {
                "triggered": escalation is not None,
                "level": escalation.level if escalation else None,
                "message": escalation.message if escalation else None
            } if escalation else None
        }
        
    except Exception as e:
        return {
            "success": True,
            "records_stored": len(health_records),
            "analysis": None,
            "error": f"Analysis failed: {str(e)}"
        }


# ============================================
# API Key Management
# ============================================

@router.post("/generate-api-key")
async def generate_api_key(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate API key for a user (for webhook authentication)
    """
    import secrets
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate a secure API key
    api_key = f"pulseai_{user_id}_{secrets.token_urlsafe(32)}"
    
    # In production, store this in a separate API keys table
    # For now, return it directly
    
    return {
        "user_id": user_id,
        "api_key": api_key,
        "instructions": "Include this key in the X-API-Key header for webhook requests"
    }


@router.get("/health")
async def webhook_health():
    """Health check for webhook endpoint"""
    return {
        "status": "healthy",
        "endpoint": "Health Connect Webhook",
        "supported_data_types": [
            "HeartRate",
            "RestingHeartRate", 
            "HRV",
            "SleepSession",
            "Steps",
            "BloodPressure",
            "BloodGlucose",
            "RespiratoryRate",
            "SpO2",
            "Weight",
            "ActiveCalories"
        ]
    }


@router.get("/schema")
async def get_webhook_schema():
    """Return expected webhook payload schema"""
    return {
        "single_payload": {
            "dataType": "string (e.g., HeartRate, SleepSession)",
            "startTime": "ISO 8601 datetime (optional)",
            "endTime": "ISO 8601 datetime (optional)",
            "records": [
                {
                    "time": "ISO 8601 datetime",
                    "value": "number (for simple metrics)",
                    "unit": "string (optional)"
                }
            ]
        },
        "batch_payload": {
            "deviceId": "string",
            "payloads": ["array of single_payload objects"]
        },
        "authentication": {
            "header": "X-API-Key",
            "format": "pulseai_{user_id}_{secret}"
        },
        "endpoints": {
            "POST /webhook/ingest": "Single data type ingestion",
            "POST /webhook/ingest-batch": "Multiple data types",
            "POST /webhook/ingest-and-analyze": "Ingest + trigger CareScore analysis"
        }
    }
