"""
Escalation Routes for Pulse AI
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.care_score import CareScore, Escalation
from app.services.escalation_service import EscalationService

router = APIRouter(prefix="/escalation", tags=["Escalation"])


class EscalateRequest(BaseModel):
    user_id: int
    care_score_id: Optional[int] = None


class AcknowledgeRequest(BaseModel):
    action: str = "dismissed"  # dismissed, scheduled, contacted


@router.post("/check")
def check_escalation(request: EscalateRequest, db: Session = Depends(get_db)):
    """
    Check if escalation is needed for a user
    """
    # Get the CareScore
    if request.care_score_id:
        care_score = db.query(CareScore).filter(
            CareScore.id == request.care_score_id
        ).first()
    else:
        care_score = db.query(CareScore).filter(
            CareScore.user_id == request.user_id
        ).order_by(CareScore.timestamp.desc()).first()
    
    if not care_score:
        raise HTTPException(status_code=404, detail="No CareScore found")
    
    service = EscalationService(db)
    escalation = service.check_escalation(request.user_id, care_score)
    
    if escalation:
        return {
            "escalation_triggered": True,
            "escalation": {
                "id": escalation.id,
                "level": escalation.level,
                "title": escalation.title,
                "message": escalation.message,
                "health_summary": json.loads(escalation.health_summary) if escalation.health_summary else None,
                "timestamp": escalation.timestamp.isoformat()
            }
        }
    
    return {
        "escalation_triggered": False,
        "message": "No escalation needed at this time"
    }


@router.get("/user/{user_id}")
def get_user_escalations(
    user_id: int, 
    include_acknowledged: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get escalations for a user
    """
    service = EscalationService(db)
    escalations = service.get_user_escalations(
        user_id, 
        include_acknowledged=include_acknowledged
    )
    
    return {
        "user_id": user_id,
        "escalations": [
            {
                "id": e.id,
                "level": e.level,
                "title": e.title,
                "message": e.message,
                "acknowledged": bool(e.acknowledged),
                "action_taken": e.action_taken,
                "timestamp": e.timestamp.isoformat()
            }
            for e in escalations
        ]
    }


@router.post("/{escalation_id}/acknowledge")
def acknowledge_escalation(
    escalation_id: int, 
    request: AcknowledgeRequest,
    db: Session = Depends(get_db)
):
    """
    Acknowledge an escalation
    """
    service = EscalationService(db)
    success = service.acknowledge_escalation(escalation_id, request.action)
    
    if not success:
        raise HTTPException(status_code=404, detail="Escalation not found")
    
    return {
        "success": True,
        "escalation_id": escalation_id,
        "action": request.action
    }


@router.get("/{escalation_id}")
def get_escalation(escalation_id: int, db: Session = Depends(get_db)):
    """
    Get a specific escalation with full details
    """
    escalation = db.query(Escalation).filter(
        Escalation.id == escalation_id
    ).first()
    
    if not escalation:
        raise HTTPException(status_code=404, detail="Escalation not found")
    
    return {
        "id": escalation.id,
        "user_id": escalation.user_id,
        "level": escalation.level,
        "title": escalation.title,
        "message": escalation.message,
        "health_summary": json.loads(escalation.health_summary) if escalation.health_summary else None,
        "acknowledged": bool(escalation.acknowledged),
        "action_taken": escalation.action_taken,
        "timestamp": escalation.timestamp.isoformat()
    }
