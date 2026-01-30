"""
CareScore Model for Pulse AI
Stores computed risk scores and analysis results
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class CareScore(Base):
    __tablename__ = "care_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # CareScore components (as per spec)
    severity_score = Column(Float, default=0)  # 0-40
    persistence_score = Column(Float, default=0)  # 0-25
    cross_signal_score = Column(Float, default=0)  # 0-20
    manual_modifier = Column(Float, default=0)  # 0-10
    
    # Final computed score
    care_score = Column(Float, default=0)  # 0-100
    
    # Additional metrics
    drift_score = Column(Float, default=0)  # How much deviation from baseline
    confidence_score = Column(Float, default=0)  # AI confidence 0-100
    stability_score = Column(Float, default=0)  # Trend stability 0-100
    
    # Explainability
    contributing_signals = Column(Text, nullable=True)  # JSON array
    explanation = Column(Text, nullable=True)  # Human-readable explanation
    
    # Status
    status = Column(String, default="stable")  # stable, mild, moderate, high
    
    # Relationship
    user = relationship("User", back_populates="care_scores")


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Escalation details
    level = Column(Integer, default=1)  # 1=awareness, 2=caution, 3=doctor
    care_score_id = Column(Integer, ForeignKey("care_scores.id"), nullable=True)
    
    # Content
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    health_summary = Column(Text, nullable=True)  # JSON
    
    # User interaction
    acknowledged = Column(Integer, default=0)
    action_taken = Column(String, nullable=True)  # dismissed, scheduled, contacted
    
    # Relationship
    user = relationship("User", back_populates="escalations")
