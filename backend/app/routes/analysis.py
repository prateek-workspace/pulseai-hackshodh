"""
Analysis Routes for Pulse AI
CareScore, anomaly detection, and training endpoints
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict

from app.database import get_db
from app.models.user import User
from app.models.health_data import HealthData
from app.models.care_score import CareScore
from app.services.carescore_engine import CareScoreEngine
from app.services.anomaly_detector import AnomalyDetector

router = APIRouter(prefix="/analysis", tags=["Analysis"])


class AnalyzeRequest(BaseModel):
    user_id: int
    current_data: Optional[Dict[str, float]] = None
    symptoms: Optional[List[str]] = None


class TrainRequest(BaseModel):
    user_id: int
    days: int = 14


@router.post("/train")
def train_baseline(request: TrainRequest, db: Session = Depends(get_db)):
    """
    Train personalized baseline for a user
    """
    detector = AnomalyDetector(db)
    baselines = detector.learn_baseline(request.user_id, request.days)
    
    if not baselines:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient data to train baseline"
        )
    
    return {
        "user_id": request.user_id,
        "training_days": request.days,
        "baselines_learned": list(baselines.keys()),
        "baseline_values": {
            k: {
                "median": round(v["median"], 2),
                "range": f"{round(v['q1'], 2)} - {round(v['q3'], 2)}"
            }
            for k, v in baselines.items()
        }
    }


@router.post("/analyze")
def analyze_health(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyze current health data and detect anomalies
    """
    # Get current data from latest readings if not provided
    if not request.current_data:
        latest = db.query(HealthData).filter(
            HealthData.user_id == request.user_id
        ).order_by(HealthData.timestamp.desc()).first()
        
        if not latest:
            raise HTTPException(status_code=404, detail="No health data found")
        
        request.current_data = {
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
    
    detector = AnomalyDetector(db)
    anomaly_result = detector.detect_anomalies(
        request.user_id, 
        request.current_data
    )
    
    drift_result = detector.analyze_drift(request.user_id)
    
    return {
        "user_id": request.user_id,
        "anomaly_analysis": anomaly_result,
        "drift_analysis": drift_result
    }


@router.get("/carescore/{user_id}")
def get_carescore(user_id: int, db: Session = Depends(get_db)):
    """
    Get current CareScore for a user
    """
    # Get latest CareScore
    latest_score = db.query(CareScore).filter(
        CareScore.user_id == user_id
    ).order_by(CareScore.timestamp.desc()).first()
    
    if not latest_score:
        raise HTTPException(status_code=404, detail="No CareScore found")
    
    return {
        "user_id": user_id,
        "care_score": latest_score.care_score,
        "status": latest_score.status,
        "components": {
            "severity": latest_score.severity_score,
            "persistence": latest_score.persistence_score,
            "cross_signal": latest_score.cross_signal_score,
            "manual_modifier": latest_score.manual_modifier
        },
        "additional_metrics": {
            "drift_score": latest_score.drift_score,
            "confidence": latest_score.confidence_score,
            "stability": latest_score.stability_score
        },
        "contributing_signals": json.loads(latest_score.contributing_signals) if latest_score.contributing_signals else [],
        "explanation": latest_score.explanation,
        "timestamp": latest_score.timestamp.isoformat()
    }


@router.post("/carescore/compute")
def compute_carescore(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Compute new CareScore for a user
    """
    # Get current data from latest readings if not provided
    if not request.current_data:
        latest = db.query(HealthData).filter(
            HealthData.user_id == request.user_id
        ).order_by(HealthData.timestamp.desc()).first()
        
        if not latest:
            raise HTTPException(status_code=404, detail="No health data found")
        
        request.current_data = {
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
    
    engine = CareScoreEngine(db)
    care_score = engine.compute_carescore(
        request.user_id,
        request.current_data,
        request.symptoms
    )
    
    return {
        "user_id": request.user_id,
        "care_score": care_score.care_score,
        "status": care_score.status,
        "components": {
            "severity": care_score.severity_score,
            "persistence": care_score.persistence_score,
            "cross_signal": care_score.cross_signal_score,
            "manual_modifier": care_score.manual_modifier
        },
        "additional_metrics": {
            "drift_score": care_score.drift_score,
            "confidence": care_score.confidence_score,
            "stability": care_score.stability_score
        },
        "explanation": care_score.explanation,
        "timestamp": care_score.timestamp.isoformat()
    }


@router.get("/carescore/{user_id}/history")
def get_carescore_history(
    user_id: int, 
    limit: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get CareScore history for a user
    """
    scores = db.query(CareScore).filter(
        CareScore.user_id == user_id
    ).order_by(CareScore.timestamp.desc()).limit(limit).all()
    
    return {
        "user_id": user_id,
        "history": [
            {
                "timestamp": s.timestamp.isoformat(),
                "care_score": s.care_score,
                "status": s.status,
                "drift_score": s.drift_score,
                "stability": s.stability_score
            }
            for s in scores
        ]
    }


@router.get("/status/{user_id}")
def get_user_status(user_id: int, db: Session = Depends(get_db)):
    """
    Get complete health status for a user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    latest_score = db.query(CareScore).filter(
        CareScore.user_id == user_id
    ).order_by(CareScore.timestamp.desc()).first()
    
    latest_data = db.query(HealthData).filter(
        HealthData.user_id == user_id
    ).order_by(HealthData.timestamp.desc()).first()
    
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },
        "baselines": {
            "heart_rate": user.baseline_heart_rate,
            "hrv": user.baseline_hrv,
            "sleep_hours": user.baseline_sleep_hours,
            "activity_level": user.baseline_activity_level,
            "breathing_rate": user.baseline_breathing_rate,
            "bp_systolic": user.baseline_bp_systolic,
            "bp_diastolic": user.baseline_bp_diastolic,
            "blood_sugar": user.baseline_blood_sugar
        },
        "current_care_score": {
            "score": latest_score.care_score if latest_score else None,
            "status": latest_score.status if latest_score else "unknown",
            "timestamp": latest_score.timestamp.isoformat() if latest_score else None
        },
        "latest_reading": {
            "timestamp": latest_data.timestamp.isoformat() if latest_data else None,
            "heart_rate": latest_data.heart_rate if latest_data else None,
            "hrv": latest_data.hrv if latest_data else None
        } if latest_data else None
    }
