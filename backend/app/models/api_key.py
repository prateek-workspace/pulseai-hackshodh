"""
API Key Model for Pulse AI
Used for webhook authentication
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    key = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)  # Friendly name for the key
    device_id = Column(String(255), nullable=True)  # Optional device binding
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Usage tracking
    request_count = Column(Integer, default=0)
    
    # Relationship
    user = relationship("User", back_populates="api_keys")


class DeviceRegistration(Base):
    __tablename__ = "device_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(String(255), nullable=False, unique=True, index=True)
    device_name = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=True)  # android, ios, etc.
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_sync_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationship
    user = relationship("User", back_populates="devices")
