"""
Patients Router for Pulse AI
Handles patient-specific endpoints including care team management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import User, PatientDoctor, PatientCaretaker, DoctorProfile, CaretakerProfile

router = APIRouter(prefix="/patients", tags=["Patients"])


class CareTeamMember(BaseModel):
    id: int
    name: str
    role: str
    specialization: Optional[str] = None
    status: str


class DoctorSearchResult(BaseModel):
    id: int
    name: str
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    city: Optional[str] = None


class ConnectionRequest(BaseModel):
    target_user_id: int


@router.get("/care-team/{patient_user_id}", response_model=List[CareTeamMember])
def get_care_team(patient_user_id: int, db: Session = Depends(get_db)):
    """Get all connected doctors and caretakers for a patient"""
    care_team = []
    
    # Get connected doctors
    doctor_connections = db.query(PatientDoctor).filter(
        PatientDoctor.patient_id == patient_user_id
    ).all()
    
    for conn in doctor_connections:
        doctor = db.query(User).filter(User.id == conn.doctor_id).first()
        if doctor:
            profile = db.query(DoctorProfile).filter(
                DoctorProfile.user_id == conn.doctor_id
            ).first()
            
            care_team.append(CareTeamMember(
                id=doctor.id,
                name=doctor.name,
                role="doctor",
                specialization=profile.specialization if profile else None,
                status=conn.status
            ))
    
    # Get connected caretakers
    caretaker_connections = db.query(PatientCaretaker).filter(
        PatientCaretaker.patient_id == patient_user_id
    ).all()
    
    for conn in caretaker_connections:
        caretaker = db.query(User).filter(User.id == conn.caretaker_id).first()
        if caretaker:
            care_team.append(CareTeamMember(
                id=caretaker.id,
                name=caretaker.name,
                role="caretaker",
                status=conn.status
            ))
    
    return care_team


@router.get("/search-doctors", response_model=List[DoctorSearchResult])
def search_doctors(
    query: Optional[str] = None,
    specialization: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Search for doctors to connect with"""
    doctors_query = db.query(User, DoctorProfile).join(
        DoctorProfile, User.id == DoctorProfile.user_id
    ).filter(User.role == "doctor")
    
    if query:
        doctors_query = doctors_query.filter(User.name.ilike(f"%{query}%"))
    
    if specialization:
        doctors_query = doctors_query.filter(
            DoctorProfile.specialization.ilike(f"%{specialization}%")
        )
    
    if city:
        doctors_query = doctors_query.filter(DoctorProfile.city.ilike(f"%{city}%"))
    
    results = doctors_query.limit(20).all()
    
    return [
        DoctorSearchResult(
            id=user.id,
            name=user.name,
            specialization=profile.specialization,
            hospital_name=profile.hospital_name,
            city=profile.city
        )
        for user, profile in results
    ]


@router.post("/connect-doctor/{patient_user_id}")
def request_doctor_connection(
    patient_user_id: int,
    request: ConnectionRequest,
    db: Session = Depends(get_db)
):
    """Request connection with a doctor"""
    # Check if patient exists
    patient = db.query(User).filter(User.id == patient_user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if doctor exists
    doctor = db.query(User).filter(
        User.id == request.target_user_id, 
        User.role == "doctor"
    ).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check if connection already exists
    existing = db.query(PatientDoctor).filter(
        PatientDoctor.patient_id == patient_user_id,
        PatientDoctor.doctor_id == request.target_user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    # Create connection request
    connection = PatientDoctor(
        patient_id=patient_user_id,
        doctor_id=request.target_user_id,
        status="pending"
    )
    
    db.add(connection)
    db.commit()
    
    # Send notification to doctor
    from app.services.notification_service import NotificationService
    notification_service = NotificationService(db)
    notification_service.send_connection_notification(
        to_user_id=request.target_user_id,
        from_user_id=patient_user_id,
        connection_type="doctor_request",
        action="request"
    )
    
    return {"message": "Connection request sent", "status": "pending"}


@router.post("/invite-caretaker/{patient_user_id}")
def invite_caretaker(
    patient_user_id: int,
    request: ConnectionRequest,
    db: Session = Depends(get_db)
):
    """Invite a caretaker to monitor patient"""
    # Check if patient exists
    patient = db.query(User).filter(User.id == patient_user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if caretaker exists
    caretaker = db.query(User).filter(
        User.id == request.target_user_id,
        User.role == "caretaker"
    ).first()
    if not caretaker:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    
    # Check if connection already exists
    existing = db.query(PatientCaretaker).filter(
        PatientCaretaker.patient_id == patient_user_id,
        PatientCaretaker.caretaker_id == request.target_user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    # Create connection
    connection = PatientCaretaker(
        patient_id=patient_user_id,
        caretaker_id=request.target_user_id,
        status="pending"
    )
    
    db.add(connection)
    db.commit()
    
    # Send notification
    from app.services.notification_service import NotificationService
    notification_service = NotificationService(db)
    notification_service.send_connection_notification(
        to_user_id=request.target_user_id,
        from_user_id=patient_user_id,
        connection_type="caretaker_invite",
        action="request"
    )
    
    return {"message": "Caretaker invitation sent", "status": "pending"}


@router.post("/accept-connection/{user_id}")
def accept_connection(
    user_id: int,
    request: ConnectionRequest,
    connection_type: str,  # "doctor" or "caretaker"
    db: Session = Depends(get_db)
):
    """Accept a pending connection request"""
    if connection_type == "doctor":
        connection = db.query(PatientDoctor).filter(
            PatientDoctor.doctor_id == user_id,
            PatientDoctor.patient_id == request.target_user_id,
            PatientDoctor.status == "pending"
        ).first()
    else:
        connection = db.query(PatientCaretaker).filter(
            PatientCaretaker.caretaker_id == user_id,
            PatientCaretaker.patient_id == request.target_user_id,
            PatientCaretaker.status == "pending"
        ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    connection.status = "accepted"
    db.commit()
    
    # Send notification
    from app.services.notification_service import NotificationService
    notification_service = NotificationService(db)
    notification_service.send_connection_notification(
        to_user_id=request.target_user_id,
        from_user_id=user_id,
        connection_type=f"{connection_type}_request",
        action="accept"
    )
    
    return {"message": "Connection accepted", "status": "accepted"}


@router.delete("/remove-connection/{patient_user_id}")
def remove_connection(
    patient_user_id: int,
    target_user_id: int,
    connection_type: str,  # "doctor" or "caretaker"
    db: Session = Depends(get_db)
):
    """Remove a connection"""
    if connection_type == "doctor":
        connection = db.query(PatientDoctor).filter(
            PatientDoctor.patient_id == patient_user_id,
            PatientDoctor.doctor_id == target_user_id
        ).first()
    else:
        connection = db.query(PatientCaretaker).filter(
            PatientCaretaker.patient_id == patient_user_id,
            PatientCaretaker.caretaker_id == target_user_id
        ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    db.delete(connection)
    db.commit()
    
    return {"message": "Connection removed"}
