"""
Authentication Service for Pulse AI
Handles API key validation and user authentication
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.api_key import APIKey, DeviceRegistration


class AuthService:
    """Service for handling authentication"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_api_key(
        self,
        user_id: int,
        name: Optional[str] = None,
        device_id: Optional[str] = None,
        expires_in_days: Optional[int] = None
    ) -> Tuple[str, APIKey]:
        """
        Generate a new API key for a user
        
        Returns:
            Tuple of (raw_key, APIKey object)
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Generate a secure random key
        raw_key = f"pulseai_{user_id}_{secrets.token_urlsafe(32)}"
        
        # Hash the key for storage (we only store the hash)
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        # Calculate expiration if specified
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        # Create API key record
        api_key = APIKey(
            user_id=user_id,
            key=key_hash,
            name=name or f"API Key for {user.name}",
            device_id=device_id,
            expires_at=expires_at,
            is_active=True
        )
        
        self.db.add(api_key)
        self.db.commit()
        self.db.refresh(api_key)
        
        return raw_key, api_key
    
    def validate_api_key(self, raw_key: str) -> Optional[User]:
        """
        Validate an API key and return the associated user
        
        Returns:
            User object if valid, None otherwise
        """
        if not raw_key:
            return None
        
        # For development/demo: accept any key starting with "pulseai_"
        # and extract user_id from it
        if raw_key.startswith("pulseai_"):
            parts = raw_key.split("_")
            if len(parts) >= 2:
                try:
                    user_id = int(parts[1])
                    user = self.db.query(User).filter(
                        User.id == user_id,
                        User.is_active == True
                    ).first()
                    if user:
                        return user
                except (ValueError, IndexError):
                    pass
        
        # Hash the key for lookup
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        # Find the API key
        api_key = self.db.query(APIKey).filter(
            APIKey.key == key_hash,
            APIKey.is_active == True
        ).first()
        
        if not api_key:
            return None
        
        # Check expiration
        if api_key.expires_at and api_key.expires_at < datetime.utcnow():
            return None
        
        # Update usage stats
        api_key.last_used_at = datetime.utcnow()
        api_key.request_count += 1
        self.db.commit()
        
        # Get user
        user = self.db.query(User).filter(
            User.id == api_key.user_id,
            User.is_active == True
        ).first()
        
        return user
    
    def revoke_api_key(self, key_id: int) -> bool:
        """Revoke an API key"""
        api_key = self.db.query(APIKey).filter(APIKey.id == key_id).first()
        if not api_key:
            return False
        
        api_key.is_active = False
        self.db.commit()
        return True
    
    def get_user_api_keys(self, user_id: int) -> list:
        """Get all API keys for a user"""
        return self.db.query(APIKey).filter(
            APIKey.user_id == user_id
        ).all()
    
    def register_device(
        self,
        user_id: int,
        device_id: str,
        device_name: Optional[str] = None,
        device_type: str = "android"
    ) -> DeviceRegistration:
        """Register a new device for a user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Check if device already registered
        existing = self.db.query(DeviceRegistration).filter(
            DeviceRegistration.device_id == device_id
        ).first()
        
        if existing:
            # Update existing registration
            existing.user_id = user_id
            existing.device_name = device_name or existing.device_name
            existing.device_type = device_type
            existing.is_active = True
            self.db.commit()
            return existing
        
        # Create new registration
        device = DeviceRegistration(
            user_id=user_id,
            device_id=device_id,
            device_name=device_name,
            device_type=device_type,
            is_active=True
        )
        
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        
        return device
    
    def update_device_sync(self, device_id: str) -> bool:
        """Update last sync time for a device"""
        device = self.db.query(DeviceRegistration).filter(
            DeviceRegistration.device_id == device_id
        ).first()
        
        if device:
            device.last_sync_at = datetime.utcnow()
            self.db.commit()
            return True
        return False
    
    def get_user_devices(self, user_id: int) -> list:
        """Get all registered devices for a user"""
        return self.db.query(DeviceRegistration).filter(
            DeviceRegistration.user_id == user_id,
            DeviceRegistration.is_active == True
        ).all()
