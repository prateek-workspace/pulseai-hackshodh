"""
Anomaly Detection Service for Pulse AI
Implements personalized baseline learning and drift detection
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.health_data import HealthData


class AnomalyDetector:
    """
    Anomaly detection using statistical methods
    For production, this would use LSTM/GRU or Autoencoder models
    This implementation uses z-score based detection with temporal smoothing
    """
    
    SIGNALS = [
        'heart_rate', 'hrv', 'sleep_duration', 'sleep_quality',
        'activity_level', 'breathing_rate'
    ]
    
    MANUAL_SIGNALS = ['bp_systolic', 'bp_diastolic', 'blood_sugar']
    
    def __init__(self, db: Session):
        self.db = db
    
    def learn_baseline(self, user_id: int, days: int = 14) -> Dict[str, float]:
        """
        Learn personalized baseline for each health signal
        Uses median and IQR for robustness against outliers
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        data = self.db.query(HealthData).filter(
            HealthData.user_id == user_id,
            HealthData.timestamp >= cutoff
        ).all()
        
        if not data:
            return {}
        
        baselines = {}
        
        for signal in self.SIGNALS + self.MANUAL_SIGNALS:
            values = [getattr(d, signal) for d in data if getattr(d, signal) is not None]
            if len(values) >= 5:  # Minimum data requirement
                baselines[signal] = {
                    'median': float(np.median(values)),
                    'mean': float(np.mean(values)),
                    'std': float(np.std(values)),
                    'q1': float(np.percentile(values, 25)),
                    'q3': float(np.percentile(values, 75)),
                    'iqr': float(np.percentile(values, 75) - np.percentile(values, 25))
                }
        
        # Update user baselines
        self._update_user_baselines(user_id, baselines)
        
        return baselines
    
    def _update_user_baselines(self, user_id: int, baselines: Dict) -> None:
        """Update user baseline values in database"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        baseline_mapping = {
            'heart_rate': 'baseline_heart_rate',
            'hrv': 'baseline_hrv',
            'sleep_duration': 'baseline_sleep_hours',
            'activity_level': 'baseline_activity_level',
            'breathing_rate': 'baseline_breathing_rate',
            'bp_systolic': 'baseline_bp_systolic',
            'bp_diastolic': 'baseline_bp_diastolic',
            'blood_sugar': 'baseline_blood_sugar'
        }
        
        for signal, user_attr in baseline_mapping.items():
            if signal in baselines:
                setattr(user, user_attr, baselines[signal]['median'])
        
        self.db.commit()
    
    def detect_anomalies(
        self, 
        user_id: int,
        current_data: Dict[str, float],
        baselines: Dict[str, Dict] = None
    ) -> Dict:
        """
        Detect anomalies in current health data
        Returns anomaly analysis with severity levels
        """
        if baselines is None:
            baselines = self.learn_baseline(user_id)
        
        if not baselines:
            return {
                'has_anomaly': False,
                'anomalies': [],
                'overall_risk': 'unknown',
                'message': 'Insufficient baseline data for analysis'
            }
        
        anomalies = []
        
        for signal, value in current_data.items():
            if value is None or signal not in baselines:
                continue
            
            baseline = baselines[signal]
            z_score = self._calculate_modified_z_score(
                value, baseline['median'], baseline['iqr']
            )
            
            is_anomaly = abs(z_score) >= 2.0  # Modified z-score threshold
            severity = self._get_severity(z_score)
            
            if is_anomaly:
                anomalies.append({
                    'signal': signal,
                    'current_value': value,
                    'baseline_median': baseline['median'],
                    'z_score': round(z_score, 2),
                    'severity': severity,
                    'direction': 'high' if value > baseline['median'] else 'low'
                })
        
        # Calculate overall risk
        if not anomalies:
            overall_risk = 'normal'
        elif any(a['severity'] == 'severe' for a in anomalies):
            overall_risk = 'high'
        elif any(a['severity'] == 'moderate' for a in anomalies):
            overall_risk = 'moderate'
        else:
            overall_risk = 'mild'
        
        return {
            'has_anomaly': len(anomalies) > 0,
            'anomalies': anomalies,
            'overall_risk': overall_risk,
            'num_signals_affected': len(anomalies),
            'analyzed_at': datetime.utcnow().isoformat()
        }
    
    def _calculate_modified_z_score(
        self, 
        value: float, 
        median: float, 
        iqr: float
    ) -> float:
        """
        Calculate modified z-score using median and IQR
        More robust against outliers than standard z-score
        """
        if iqr == 0:
            iqr = median * 0.1 if median else 1
        
        # Modified z-score using IQR
        mad = iqr / 1.349  # Convert IQR to MAD approximation
        modified_z = 0.6745 * (value - median) / mad if mad else 0
        
        return modified_z
    
    def _get_severity(self, z_score: float) -> str:
        """Get severity level from z-score"""
        abs_z = abs(z_score)
        if abs_z >= 4.0:
            return 'severe'
        elif abs_z >= 3.0:
            return 'moderate'
        elif abs_z >= 2.0:
            return 'mild'
        return 'normal'
    
    def analyze_drift(self, user_id: int, window_days: int = 7) -> Dict:
        """
        Analyze clinical drift over time
        Detects sustained deviations vs one-time spikes
        """
        cutoff = datetime.utcnow() - timedelta(days=window_days)
        
        data = self.db.query(HealthData).filter(
            HealthData.user_id == user_id,
            HealthData.timestamp >= cutoff
        ).order_by(HealthData.timestamp).all()
        
        if len(data) < 3:
            return {
                'has_drift': False,
                'drift_signals': [],
                'message': 'Insufficient recent data for drift analysis'
            }
        
        baselines = self.learn_baseline(user_id, days=30)
        drift_signals = []
        
        for signal in self.SIGNALS:
            if signal not in baselines:
                continue
            
            values = [getattr(d, signal) for d in data if getattr(d, signal) is not None]
            if len(values) < 3:
                continue
            
            baseline = baselines[signal]
            
            # Check if recent trend is consistently above/below baseline
            recent_avg = np.mean(values[-3:])  # Last 3 readings
            z_score = self._calculate_modified_z_score(
                recent_avg, baseline['median'], baseline['iqr']
            )
            
            # Check trend direction
            if len(values) >= 5:
                trend = np.polyfit(range(len(values)), values, 1)[0]
                trend_direction = 'increasing' if trend > 0 else 'decreasing'
            else:
                trend_direction = 'unknown'
            
            if abs(z_score) >= 1.5:  # Lower threshold for drift
                drift_signals.append({
                    'signal': signal,
                    'recent_average': round(recent_avg, 2),
                    'baseline': round(baseline['median'], 2),
                    'deviation': round(z_score, 2),
                    'trend': trend_direction,
                    'sustained': len(values) >= 5
                })
        
        return {
            'has_drift': len(drift_signals) > 0,
            'drift_signals': drift_signals,
            'window_days': window_days,
            'data_points_analyzed': len(data)
        }
