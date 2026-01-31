"""
CareScore Routes for Pulse AI
Endpoints for calculating and retrieving CareScore with Gemini AI integration
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import httpx
import logging

from app.database import get_db
from app.models import User, HealthData, CareScore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/care-score", tags=["CareScore"])

# Your Gemini hosted API endpoint
GEMINI_API_URL = "https://pulseai-gemini.prateekhnayak.workers.dev/generate"


async def get_gemini_analysis(health_data: dict, care_score: float, status: str) -> dict:
    """
    Call Gemini API for health analysis and suggestions
    """
    # Build prompt with health signals
    prompt = f"""You are a wellness advisor for a health monitoring app called Pulse AI.

A user has the following health signals:
- Heart Rate: {health_data.get('heart_rate', 'N/A')} bpm
- Heart Rate Variability (HRV): {health_data.get('hrv', 'N/A')} ms
- Sleep Duration: {health_data.get('sleep_duration', 'N/A')} hours
- Activity Level: {health_data.get('activity_level', 'N/A')} steps
- Blood Pressure: {health_data.get('bp_systolic', 'N/A')}/{health_data.get('bp_diastolic', 'N/A')} mmHg
- Blood Sugar: {health_data.get('blood_sugar', 'N/A')} mg/dL

Their current CareScore is {care_score}/100 (Status: {status}).
CareScore interpretation: 0-30 = Stable, 31-50 = Mild concern, 51-70 = Moderate concern, 71-100 = High concern.

Based on these health signals, provide:
1. A brief 2-3 sentence analysis of their current health status
2. 3-4 specific, actionable wellness suggestions (like drink more water, reduce salt intake, take a walk, etc.)

IMPORTANT RULES:
- You are NOT a doctor - never provide medical diagnoses or treatment recommendations
- Keep suggestions simple, lifestyle-focused, and safe for anyone
- Focus on: hydration, rest, light activity, stress management, diet tips
- Be encouraging and supportive

Format your response as JSON:
{{"analysis": "your analysis here", "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]}}
"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GEMINI_API_URL,
                json={"text": prompt},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                # Parse the response - Gemini returns text that should be JSON
                if isinstance(result, dict):
                    return result
                elif isinstance(result, str):
                    import json
                    try:
                        return json.loads(result)
                    except:
                        return {"analysis": result, "suggestions": []}
            else:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        logger.error(f"Failed to call Gemini API: {e}")
        return None


def calculate_simple_care_score(health_data: dict, user: User) -> dict:
    """
    Calculate CareScore without complex engine dependencies
    Uses simple deviation-based scoring
    """
    score = 0
    deviations = []
    
    # Heart rate scoring (normal: 60-100 bpm)
    hr = health_data.get('heart_rate')
    if hr:
        baseline = user.baseline_heart_rate or 72
        if hr > 100 or hr < 55:
            deviation = abs(hr - baseline) / baseline * 100
            score += min(15, deviation / 2)
            deviations.append(f"Heart rate: {hr} bpm (baseline: {baseline})")
    
    # HRV scoring (higher is generally better, normal: 20-70ms)
    hrv = health_data.get('hrv')
    if hrv:
        baseline = user.baseline_hrv or 50
        if hrv < 30:
            score += 10
            deviations.append(f"Low HRV: {hrv} ms")
    
    # Sleep scoring (optimal: 7-9 hours)
    sleep = health_data.get('sleep_duration')
    if sleep:
        if sleep < 6:
            score += 8
            deviations.append(f"Insufficient sleep: {sleep} hours")
        elif sleep < 7:
            score += 4
    
    # Blood pressure scoring
    bp_sys = health_data.get('bp_systolic')
    bp_dia = health_data.get('bp_diastolic')
    if bp_sys and bp_dia:
        if bp_sys >= 180 or bp_dia >= 120:
            score += 20
            deviations.append(f"High blood pressure: {bp_sys}/{bp_dia}")
        elif bp_sys >= 140 or bp_dia >= 90:
            score += 12
            deviations.append(f"Elevated blood pressure: {bp_sys}/{bp_dia}")
        elif bp_sys >= 130:
            score += 5
    
    # Blood sugar scoring (normal fasting: 70-100 mg/dL)
    sugar = health_data.get('blood_sugar')
    if sugar:
        if sugar >= 200:
            score += 15
            deviations.append(f"High blood sugar: {sugar} mg/dL")
        elif sugar >= 140:
            score += 8
            deviations.append(f"Elevated blood sugar: {sugar} mg/dL")
        elif sugar <= 70:
            score += 10
            deviations.append(f"Low blood sugar: {sugar} mg/dL")
    
    # Activity level scoring (recommended: 7000-10000 steps)
    activity = health_data.get('activity_level')
    if activity is not None:
        if activity < 3000:
            score += 5
            deviations.append("Low physical activity")
    
    # Normalize score to 0-100
    score = min(100, max(0, score))
    
    # Determine status
    if score <= 30:
        status = 'Stable'
    elif score <= 50:
        status = 'Mild'
    elif score <= 70:
        status = 'Moderate'
    else:
        status = 'High'
    
    return {
        'score': round(score, 1),
        'status': status,
        'deviations': deviations
    }


def get_fallback_suggestions(score: float, deviations: list) -> list:
    """Generate fallback suggestions when Gemini is unavailable"""
    suggestions = []
    
    if score >= 50:
        suggestions.append("Take time to rest and prioritize quality sleep tonight")
        suggestions.append("Stay well hydrated - aim for 8 glasses of water today")
    
    if any("blood pressure" in d.lower() for d in deviations):
        suggestions.append("Consider reducing salt intake in your meals")
        suggestions.append("Practice deep breathing exercises for 5 minutes")
    
    if any("blood sugar" in d.lower() for d in deviations):
        suggestions.append("Avoid sugary snacks and processed foods today")
        suggestions.append("Take a 15-minute walk after meals")
    
    if any("sleep" in d.lower() for d in deviations):
        suggestions.append("Avoid caffeine after 2 PM")
        suggestions.append("Try to maintain a consistent sleep schedule")
    
    if any("activity" in d.lower() for d in deviations):
        suggestions.append("Take short walking breaks every hour")
        suggestions.append("Try gentle stretching or light exercise")
    
    if not suggestions:
        suggestions = [
            "Keep up your healthy habits!",
            "Stay consistent with sleep and activity routines",
            "Continue monitoring your health metrics"
        ]
    
    return suggestions[:4]


@router.post("/calculate/{user_id}")
async def calculate_care_score(user_id: int, db: Session = Depends(get_db)):
    """
    Calculate CareScore for a user based on their health data.
    Uses Gemini AI for analysis and suggestions.
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get latest health data
    latest_health = db.query(HealthData).filter(
        HealthData.user_id == user_id
    ).order_by(HealthData.timestamp.desc()).first()
    
    if not latest_health:
        raise HTTPException(
            status_code=400, 
            detail="No health data found. Please sync your health data first."
        )
    
    # Build health data dict
    health_data = {
        'heart_rate': latest_health.heart_rate,
        'hrv': latest_health.hrv,
        'sleep_duration': latest_health.sleep_duration,
        'sleep_quality': latest_health.sleep_quality,
        'activity_level': latest_health.activity_level,
        'breathing_rate': latest_health.breathing_rate,
        'bp_systolic': latest_health.bp_systolic,
        'bp_diastolic': latest_health.bp_diastolic,
        'blood_sugar': latest_health.blood_sugar
    }
    
    # Calculate CareScore
    try:
        result = calculate_simple_care_score(health_data, user)
        score = result['score']
        status = result['status']
        deviations = result['deviations']
        
        # Get Gemini analysis and suggestions
        gemini_result = await get_gemini_analysis(health_data, score, status)
        
        if gemini_result:
            analysis = gemini_result.get('analysis', '')
            suggestions = gemini_result.get('suggestions', [])
        else:
            analysis = f"Your current health status is {status.lower()}."
            suggestions = get_fallback_suggestions(score, deviations)
        
        # Save CareScore to database
        care_score_record = CareScore(
            user_id=user_id,
            care_score=score,
            severity_score=min(40, score * 0.4),
            persistence_score=0,  # Would need historical data
            cross_signal_score=len(deviations) * 3,
            manual_modifier=0,
            drift_score=score * 0.5,
            confidence_score=85 if gemini_result else 70,
            stability_score=100 - score,
            explanation=analysis,
            status=status.lower()
        )
        
        db.add(care_score_record)
        db.commit()
        db.refresh(care_score_record)
        
        return {
            "message": "CareScore calculated successfully",
            "care_score": score,
            "status": status,
            "components": {
                "severity": care_score_record.severity_score,
                "persistence": care_score_record.persistence_score,
                "cross_signal": care_score_record.cross_signal_score,
                "manual_modifier": care_score_record.manual_modifier
            },
            "analysis": analysis,
            "suggestions": suggestions,
            "deviations": deviations,
            "timestamp": care_score_record.timestamp.isoformat(),
            "disclaimer": "This is for informational purposes only and does not constitute medical advice."
        }
        
    except Exception as e:
        logger.error(f"CareScore calculation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate CareScore: {str(e)}")


@router.get("/latest/{user_id}")
def get_latest_care_score(user_id: int, db: Session = Depends(get_db)):
    """Get the latest CareScore for a user"""
    care_score = db.query(CareScore).filter(
        CareScore.user_id == user_id
    ).order_by(CareScore.timestamp.desc()).first()
    
    if not care_score:
        return {
            "care_score": None,
            "message": "No CareScore calculated yet"
        }
    
    return {
        "care_score": care_score.care_score,
        "status": care_score.status,
        "components": {
            "severity": care_score.severity_score,
            "persistence": care_score.persistence_score,
            "cross_signal": care_score.cross_signal_score,
            "manual_modifier": care_score.manual_modifier
        },
        "explanation": care_score.explanation,
        "confidence": care_score.confidence_score,
        "stability": care_score.stability_score,
        "timestamp": care_score.timestamp.isoformat()
    }


@router.get("/history/{user_id}")
def get_care_score_history(
    user_id: int, 
    limit: int = 30,
    db: Session = Depends(get_db)
):
    """Get CareScore history for a user"""
    scores = db.query(CareScore).filter(
        CareScore.user_id == user_id
    ).order_by(CareScore.timestamp.desc()).limit(limit).all()
    
    return {
        "history": [
            {
                "care_score": s.care_score,
                "status": s.status,
                "timestamp": s.timestamp.isoformat()
            }
            for s in scores
        ],
        "count": len(scores)
    }


@router.get("/suggestions/{user_id}")
async def get_health_suggestions(user_id: int, db: Session = Depends(get_db)):
    """Get AI-generated health suggestions based on current health data"""
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get latest health data
    latest_health = db.query(HealthData).filter(
        HealthData.user_id == user_id
    ).order_by(HealthData.timestamp.desc()).first()
    
    # Get latest care score
    care_score = db.query(CareScore).filter(
        CareScore.user_id == user_id
    ).order_by(CareScore.timestamp.desc()).first()
    
    if not latest_health:
        return {
            "suggestions": [
                "Sync your health data to get personalized suggestions",
                "Stay hydrated and maintain regular sleep patterns"
            ],
            "disclaimer": "These are general wellness suggestions only."
        }
    
    health_data = {
        'heart_rate': latest_health.heart_rate,
        'hrv': latest_health.hrv,
        'sleep_duration': latest_health.sleep_duration,
        'activity_level': latest_health.activity_level,
        'bp_systolic': latest_health.bp_systolic,
        'bp_diastolic': latest_health.bp_diastolic,
        'blood_sugar': latest_health.blood_sugar
    }
    
    score = care_score.care_score if care_score else 25
    status = care_score.status if care_score else "stable"
    
    # Get Gemini suggestions
    gemini_result = await get_gemini_analysis(health_data, score, status)
    
    if gemini_result and gemini_result.get('suggestions'):
        suggestions = gemini_result['suggestions']
        analysis = gemini_result.get('analysis', '')
    else:
        suggestions = get_fallback_suggestions(score, [])
        analysis = "Based on your recent health data, here are some suggestions to maintain your wellness."
    
    return {
        "care_score": score,
        "status": status,
        "analysis": analysis,
        "suggestions": suggestions,
        "disclaimer": "These are general wellness suggestions only and do not constitute medical advice. Consult your healthcare provider for personalized guidance."
    }
