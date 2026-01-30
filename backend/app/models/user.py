"""
User Model for Pulse AI
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Baseline values (learned over time)
    baseline_heart_rate = Column(Float, nullable=True)
    baseline_hrv = Column(Float, nullable=True)
    baseline_sleep_hours = Column(Float, nullable=True)
    baseline_activity_level = Column(Float, nullable=True)
    baseline_breathing_rate = Column(Float, nullable=True)
    baseline_bp_systolic = Column(Float, nullable=True)
    baseline_bp_diastolic = Column(Float, nullable=True)
    baseline_blood_sugar = Column(Float, nullable=True)
    
    # Relationships
    health_data = relationship("HealthData", back_populates="user")
    care_scores = relationship("CareScore", back_populates="user")
    escalations = relationship("Escalation", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")
    devices = relationship("DeviceRegistration", back_populates="user")

