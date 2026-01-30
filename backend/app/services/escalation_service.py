"""
Escalation Service for Pulse AI
Implements smart escalation logic without diagnosis
"""

import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.care_score import CareScore, Escalation


class EscalationService:
    """
    Smart escalation logic for Pulse AI
    
    Escalation Levels:
    1. Normal monitoring → No alert
    2. Early drift → In-app awareness
    3. Sustained drift → Caution notification  
    4. High-confidence anomaly → Doctor consultation recommendation
    
    IMPORTANT: Never diagnose disease - only provide early-warning decision support
    """
    
    ESCALATION_LEVELS = {
        1: {
            'name': 'awareness',
            'threshold': 31,  # CareScore > 30
            'title': 'Health Insights Available',
            'urgency': 'low'
        },
        2: {
            'name': 'caution',
            'threshold': 51,  # CareScore > 50
            'title': 'Health Changes Detected',
            'urgency': 'medium'
        },
        3: {
            'name': 'consultation',
            'threshold': 71,  # CareScore > 70
            'title': 'Consider Consulting a Healthcare Provider',
            'urgency': 'high'
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_escalation(
        self, 
        user_id: int, 
        care_score: CareScore
    ) -> Optional[Escalation]:
        """
        Check if escalation is needed based on CareScore
        Returns Escalation if needed, None otherwise
        """
        # Determine escalation level
        level = self._determine_level(care_score.care_score)
        
        if level == 0:
            return None  # No escalation needed
        
        # Check if we've already escalated at this level recently
        if self._has_recent_escalation(user_id, level):
            return None
        
        # Generate escalation
        escalation = self._create_escalation(user_id, care_score, level)
        
        return escalation
    
    def _determine_level(self, score: float) -> int:
        """Determine escalation level from CareScore"""
        if score >= self.ESCALATION_LEVELS[3]['threshold']:
            return 3
        elif score >= self.ESCALATION_LEVELS[2]['threshold']:
            return 2
        elif score >= self.ESCALATION_LEVELS[1]['threshold']:
            return 1
        return 0
    
    def _has_recent_escalation(
        self, 
        user_id: int, 
        level: int, 
        hours: int = 24
    ) -> bool:
        """Check if user has received this escalation level recently"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        recent = self.db.query(Escalation).filter(
            Escalation.user_id == user_id,
            Escalation.level == level,
            Escalation.timestamp >= cutoff
        ).first()
        
        return recent is not None
    
    def _create_escalation(
        self, 
        user_id: int, 
        care_score: CareScore,
        level: int
    ) -> Escalation:
        """Create escalation record"""
        level_config = self.ESCALATION_LEVELS[level]
        
        # Generate message based on level
        message = self._generate_message(level, care_score)
        
        # Generate health summary
        health_summary = self._generate_health_summary(care_score)
        
        escalation = Escalation(
            user_id=user_id,
            level=level,
            care_score_id=care_score.id,
            title=level_config['title'],
            message=message,
            health_summary=json.dumps(health_summary)
        )
        
        self.db.add(escalation)
        self.db.commit()
        self.db.refresh(escalation)
        
        return escalation
    
    def _generate_message(self, level: int, care_score: CareScore) -> str:
        """Generate appropriate message based on escalation level"""
        
        if level == 1:
            return (
                "We've noticed some changes in your health data. "
                "Your body might be adapting to new conditions or activities. "
                "Continue monitoring and take note of how you feel."
            )
        
        elif level == 2:
            return (
                "Your recent health readings show patterns that differ from your usual baseline. "
                "This doesn't mean something is wrong, but it's worth paying attention to. "
                "Consider reviewing your recent activities, sleep, and stress levels."
            )
        
        elif level == 3:
            return (
                "Your health data shows sustained changes that may benefit from "
                "professional evaluation. We recommend consulting with a healthcare "
                "provider to review these patterns. This is not a diagnosis - your "
                "doctor can help determine if any action is needed."
            )
        
        return "Health monitoring update available."
    
    def _generate_health_summary(self, care_score: CareScore) -> Dict:
        """Generate health summary for escalation"""
        contributing = json.loads(care_score.contributing_signals) if care_score.contributing_signals else []
        
        summary = {
            'care_score': care_score.care_score,
            'status': care_score.status,
            'drift_score': care_score.drift_score,
            'confidence': care_score.confidence_score,
            'stability': care_score.stability_score,
            'key_signals': [
                {
                    'signal': sig['signal'],
                    'current': sig['current'],
                    'baseline': sig['baseline'],
                    'deviation': sig['level']
                }
                for sig in contributing[:3]  # Top 3 signals
            ],
            'recommendation': self._get_recommendation(care_score.status),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return summary
    
    def _get_recommendation(self, status: str) -> str:
        """Get recommendation based on status"""
        recommendations = {
            'stable': "Continue your current health routine.",
            'mild': "Monitor your health signals and note any changes in how you feel.",
            'moderate': "Consider reviewing recent lifestyle changes and monitor closely.",
            'high': "We recommend scheduling a check-in with your healthcare provider."
        }
        return recommendations.get(status, recommendations['stable'])
    
    def get_user_escalations(
        self, 
        user_id: int, 
        limit: int = 10,
        include_acknowledged: bool = False
    ) -> List[Escalation]:
        """Get recent escalations for a user"""
        query = self.db.query(Escalation).filter(Escalation.user_id == user_id)
        
        if not include_acknowledged:
            query = query.filter(Escalation.acknowledged == 0)
        
        return query.order_by(Escalation.timestamp.desc()).limit(limit).all()
    
    def acknowledge_escalation(
        self, 
        escalation_id: int, 
        action: str = 'dismissed'
    ) -> bool:
        """Acknowledge an escalation"""
        escalation = self.db.query(Escalation).filter(
            Escalation.id == escalation_id
        ).first()
        
        if not escalation:
            return False
        
        escalation.acknowledged = 1
        escalation.action_taken = action
        self.db.commit()
        
        return True
