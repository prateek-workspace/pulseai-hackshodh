"""
Health Data Model for Pulse AI
Stores wearable and manual health inputs
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class HealthData(Base):
    __tablename__ = "health_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, default="wearable")  # wearable, manual, smart_ring
    
    # Wearable data
    heart_rate = Column(Float, nullable=True)
    hrv = Column(Float, nullable=True)  # Heart Rate Variability in ms
    sleep_duration = Column(Float, nullable=True)  # Hours
    sleep_quality = Column(Float, nullable=True)  # 0-100 score
    activity_level = Column(Float, nullable=True)  # Steps or active minutes
    breathing_rate = Column(Float, nullable=True)  # Breaths per minute
    
    # Manual inputs
    bp_systolic = Column(Float, nullable=True)
    bp_diastolic = Column(Float, nullable=True)
    blood_sugar = Column(Float, nullable=True)  # mg/dL
    symptoms = Column(Text, nullable=True)  # JSON array of symptoms
    
    # Computed flags
    is_anomaly = Column(Integer, default=0)  # 0=normal, 1=mild, 2=moderate, 3=severe
    
    # Relationship
    user = relationship("User", back_populates="health_data")
