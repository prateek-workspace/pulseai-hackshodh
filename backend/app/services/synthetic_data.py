"""
Synthetic Data Generator for Pulse AI
Generates realistic health data with gradual degradation for demo
"""

import random
import json
from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.health_data import HealthData


class SyntheticDataGenerator:
    """
    Generates 30-60 days of realistic health data
    Introduces gradual degradation to demonstrate CareScore rising
    """
    
    # Normal baseline ranges
    BASELINE_RANGES = {
        'heart_rate': (60, 80),
        'hrv': (30, 60),
        'sleep_duration': (6.5, 8.5),
        'sleep_quality': (70, 90),
        'activity_level': (5000, 12000),
        'breathing_rate': (12, 18),
        'bp_systolic': (110, 125),
        'bp_diastolic': (70, 82),
        'blood_sugar': (80, 110)
    }
    
    # Degradation patterns
    DEGRADATION_PATTERNS = {
        'sleep_decline': {
            'sleep_duration': -0.03,  # Lose 0.03 hours/day
            'sleep_quality': -0.5,
            'hrv': -0.3
        },
        'cardiac_stress': {
            'heart_rate': 0.15,
            'hrv': -0.4,
            'bp_systolic': 0.2,
            'bp_diastolic': 0.1
        },
        'metabolic_shift': {
            'blood_sugar': 0.3,
            'activity_level': -50,
            'sleep_quality': -0.3
        }
    }
    
    SYMPTOM_POOL = [
        'fatigue', 'headache', 'dizziness', 'gas', 'bloating',
        'poor_concentration', 'muscle_aches', 'mild_nausea'
    ]
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_demo_user(self, email: str = "demo@pulseai.com", name: str = "Demo User") -> User:
        """Create or get demo user"""
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            user = User(
                email=email,
                name=name,
                age=35,
                gender="not_specified",
                baseline_heart_rate=72,
                baseline_hrv=45,
                baseline_sleep_hours=7.5,
                baseline_activity_level=8500,
                baseline_breathing_rate=15,
                baseline_bp_systolic=118,
                baseline_bp_diastolic=76,
                baseline_blood_sugar=95
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        
        return user
    
    def generate_healthy_data(
        self, 
        user_id: int, 
        days: int = 14
    ) -> List[HealthData]:
        """Generate initial healthy baseline data"""
        data_points = []
        start_date = datetime.utcnow() - timedelta(days=days)
        
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            
            # Generate 2-4 data points per day
            num_readings = random.randint(2, 4)
            
            for i in range(num_readings):
                reading_time = current_date + timedelta(hours=random.randint(6, 22))
                
                data = HealthData(
                    user_id=user_id,
                    timestamp=reading_time,
                    source='wearable',
                    heart_rate=self._random_in_range('heart_rate'),
                    hrv=self._random_in_range('hrv'),
                    sleep_duration=self._random_in_range('sleep_duration') if i == 0 else None,
                    sleep_quality=self._random_in_range('sleep_quality') if i == 0 else None,
                    activity_level=self._random_in_range('activity_level') if i == num_readings - 1 else None,
                    breathing_rate=self._random_in_range('breathing_rate'),
                    is_anomaly=0
                )
                
                data_points.append(data)
        
        # Bulk insert
        self.db.add_all(data_points)
        self.db.commit()
        
        return data_points
    
    def generate_degradation_data(
        self,
        user_id: int,
        days: int = 30,
        pattern: str = 'sleep_decline',
        start_day: int = 14
    ) -> List[HealthData]:
        """Generate data with gradual health degradation"""
        data_points = []
        degradation = self.DEGRADATION_PATTERNS.get(pattern, {})
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            degradation_factor = max(0, day - start_day) if day >= start_day else 0
            
            num_readings = random.randint(2, 4)
            
            for i in range(num_readings):
                reading_time = current_date + timedelta(hours=random.randint(6, 22))
                
                # Apply degradation
                heart_rate = self._random_in_range('heart_rate') + degradation.get('heart_rate', 0) * degradation_factor
                hrv = max(10, self._random_in_range('hrv') + degradation.get('hrv', 0) * degradation_factor)
                sleep_dur = max(4, self._random_in_range('sleep_duration') + degradation.get('sleep_duration', 0) * degradation_factor) if i == 0 else None
                sleep_qual = max(30, self._random_in_range('sleep_quality') + degradation.get('sleep_quality', 0) * degradation_factor) if i == 0 else None
                activity = max(2000, self._random_in_range('activity_level') + degradation.get('activity_level', 0) * degradation_factor) if i == num_readings - 1 else None
                breathing = self._random_in_range('breathing_rate')
                
                # Determine if anomaly
                is_anomaly = 0
                if degradation_factor > 5:
                    is_anomaly = 1
                if degradation_factor > 10:
                    is_anomaly = 2
                if degradation_factor > 15:
                    is_anomaly = 3
                
                # Add symptoms for later days
                symptoms = None
                if degradation_factor > 7 and i == 0:
                    num_symptoms = min(3, degradation_factor // 5)
                    symptoms = json.dumps(random.sample(self.SYMPTOM_POOL, num_symptoms))
                
                data = HealthData(
                    user_id=user_id,
                    timestamp=reading_time,
                    source='wearable',
                    heart_rate=round(heart_rate, 1),
                    hrv=round(hrv, 1),
                    sleep_duration=round(sleep_dur, 2) if sleep_dur else None,
                    sleep_quality=round(sleep_qual, 1) if sleep_qual else None,
                    activity_level=round(activity) if activity else None,
                    breathing_rate=round(breathing, 1),
                    symptoms=symptoms,
                    is_anomaly=is_anomaly
                )
                
                data_points.append(data)
        
        self.db.add_all(data_points)
        self.db.commit()
        
        return data_points
    
    def generate_manual_inputs(
        self, 
        user_id: int, 
        days: int = 30,
        with_degradation: bool = True
    ) -> List[HealthData]:
        """Generate manual health inputs (BP, sugar)"""
        data_points = []
        start_date = datetime.utcnow() - timedelta(days=days)
        
        for day in range(days):
            # Manual inputs every 2-3 days
            if day % random.randint(2, 3) != 0:
                continue
            
            current_date = start_date + timedelta(days=day)
            reading_time = current_date + timedelta(hours=random.randint(8, 20))
            
            degradation_factor = day / 30 if with_degradation else 0
            
            bp_sys = self._random_in_range('bp_systolic') + (15 * degradation_factor)
            bp_dia = self._random_in_range('bp_diastolic') + (8 * degradation_factor)
            sugar = self._random_in_range('blood_sugar') + (20 * degradation_factor)
            
            data = HealthData(
                user_id=user_id,
                timestamp=reading_time,
                source='manual',
                bp_systolic=round(bp_sys, 1),
                bp_diastolic=round(bp_dia, 1),
                blood_sugar=round(sugar, 1)
            )
            
            data_points.append(data)
        
        self.db.add_all(data_points)
        self.db.commit()
        
        return data_points
    
    def _random_in_range(self, signal: str) -> float:
        """Get random value within baseline range with natural variation"""
        low, high = self.BASELINE_RANGES[signal]
        value = random.uniform(low, high)
        # Add small random noise
        noise = random.gauss(0, (high - low) * 0.05)
        return value + noise
    
    def generate_complete_demo(self, email: str = "demo@pulseai.com") -> Dict:
        """Generate complete demo dataset"""
        user = self.create_demo_user(email)
        
        # Clear existing data for user
        self.db.query(HealthData).filter(HealthData.user_id == user.id).delete()
        self.db.commit()
        
        # Generate 45 days of data with degradation starting at day 15
        wearable_data = self.generate_degradation_data(
            user.id, 
            days=45, 
            pattern='sleep_decline',
            start_day=15
        )
        
        manual_data = self.generate_manual_inputs(
            user.id, 
            days=45, 
            with_degradation=True
        )
        
        return {
            'user_id': user.id,
            'email': user.email,
            'wearable_records': len(wearable_data),
            'manual_records': len(manual_data),
            'total_days': 45,
            'degradation_pattern': 'sleep_decline',
            'degradation_start_day': 15
        }
