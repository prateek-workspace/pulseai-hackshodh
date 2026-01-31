"""
Gemini AI Health Suggestions Service
Generates conservative, lifestyle-oriented health guidance based on CareScore
"""

import os
import logging
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class HealthSuggestionsService:
    """Service to generate health suggestions using Gemini AI"""
    
    def __init__(self):
        self.model = None
        if GEMINI_API_KEY:
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                logger.error(f"Failed to initialize Gemini model: {e}")
    
    def _get_system_prompt(self) -> str:
        """Base system prompt for health suggestions"""
        return """You are a wellness advisor providing general lifestyle suggestions. 
        
CRITICAL RULES:
1. You are NOT a doctor and cannot provide medical advice or diagnoses
2. All suggestions must be general wellness tips only
3. Never recommend medications or specific treatments
4. Always encourage consulting a healthcare professional for medical concerns
5. Keep suggestions actionable, simple, and safe for anyone
6. Focus on: hydration, rest, light activity, stress management, nutrition
7. Be encouraging and supportive in tone
8. Keep responses concise (3-5 suggestions max)

DISCLAIMER you must include: These are general wellness suggestions only and do not constitute medical advice. Consult your healthcare provider for personalized guidance."""
    
    def generate_suggestions(
        self,
        care_score: int,
        status: str,
        contributing_factors: Optional[List[str]] = None,
        recent_metrics: Optional[dict] = None
    ) -> dict:
        """
        Generate health suggestions based on CareScore and health status
        
        Args:
            care_score: Current CareScore (0-100)
            status: Status level (Stable, Mild, Moderate, High)
            contributing_factors: List of factors contributing to the score
            recent_metrics: Recent health metrics (optional)
            
        Returns:
            Dictionary with suggestions and disclaimer
        """
        
        # Default suggestions if Gemini is not available
        if not self.model:
            return self._get_fallback_suggestions(care_score, status)
        
        try:
            # Build the prompt
            prompt = self._build_prompt(care_score, status, contributing_factors, recent_metrics)
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=500,
                    temperature=0.3  # Lower temperature for more consistent, safe responses
                )
            )
            
            # Parse and return suggestions
            suggestions = self._parse_response(response.text)
            
            return {
                "suggestions": suggestions,
                "status": status,
                "care_score": care_score,
                "disclaimer": "These are general wellness suggestions only and do not constitute medical advice. Consult your healthcare provider for personalized guidance.",
                "source": "gemini"
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._get_fallback_suggestions(care_score, status)
    
    def _build_prompt(
        self,
        care_score: int,
        status: str,
        contributing_factors: Optional[List[str]],
        recent_metrics: Optional[dict]
    ) -> str:
        """Build the prompt for Gemini"""
        
        prompt = f"""
{self._get_system_prompt()}

Current Health Status:
- Health Score: {care_score}/100 (higher = more attention needed)
- Status: {status}
"""
        
        if contributing_factors:
            prompt += f"- Contributing Factors: {', '.join(contributing_factors)}\n"
        
        if recent_metrics:
            prompt += "\nRecent Metrics:\n"
            if recent_metrics.get('heart_rate'):
                prompt += f"- Heart Rate: {recent_metrics['heart_rate']} bpm\n"
            if recent_metrics.get('hrv'):
                prompt += f"- Heart Rate Variability: {recent_metrics['hrv']} ms\n"
            if recent_metrics.get('sleep_duration'):
                prompt += f"- Sleep Duration: {recent_metrics['sleep_duration']} hours\n"
            if recent_metrics.get('activity_level'):
                prompt += f"- Activity Level: {recent_metrics['activity_level']} steps\n"
        
        prompt += """
Based on this health status, provide 3-5 specific, actionable wellness suggestions. 
Format each suggestion as a short, clear sentence.
Focus on hydration, rest, gentle activity, and stress management.
"""
        
        return prompt
    
    def _parse_response(self, text: str) -> List[str]:
        """Parse Gemini response into a list of suggestions"""
        
        # Split by newlines and filter
        lines = text.strip().split('\n')
        suggestions = []
        
        for line in lines:
            line = line.strip()
            # Skip empty lines or disclaimer text
            if not line:
                continue
            if 'disclaimer' in line.lower() or 'consult' in line.lower():
                continue
            # Remove bullet points or numbers
            if line.startswith(('-', '*', '•')):
                line = line[1:].strip()
            elif line[0].isdigit() and (line[1] == '.' or line[1] == ')'):
                line = line[2:].strip()
            
            if line and len(line) > 10:  # Ensure it's a meaningful suggestion
                suggestions.append(line)
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def _get_fallback_suggestions(self, care_score: int, status: str) -> dict:
        """Provide fallback suggestions when Gemini is unavailable"""
        
        if care_score >= 70:
            suggestions = [
                "Take time to rest and prioritize sleep tonight",
                "Stay hydrated - aim for 8 glasses of water today",
                "Consider some gentle stretching or deep breathing exercises",
                "Reduce caffeine and alcohol intake temporarily",
                "Reach out to your healthcare provider if you feel unwell"
            ]
        elif care_score >= 50:
            suggestions = [
                "Ensure you're getting adequate sleep (7-9 hours)",
                "Take short breaks throughout the day to rest",
                "Stay hydrated with water and herbal teas",
                "Try a 10-minute walk or light stretching",
                "Practice deep breathing when feeling stressed"
            ]
        elif care_score >= 30:
            suggestions = [
                "Maintain your regular sleep schedule",
                "Continue staying active with moderate exercise",
                "Keep hydration levels consistent",
                "Monitor how you're feeling throughout the day"
            ]
        else:
            suggestions = [
                "Keep up your healthy habits",
                "Stay consistent with your sleep and activity routines",
                "Continue monitoring your health metrics"
            ]
        
        return {
            "suggestions": suggestions,
            "status": status,
            "care_score": care_score,
            "disclaimer": "These are general wellness suggestions only and do not constitute medical advice. Consult your healthcare provider for personalized guidance.",
            "source": "fallback"
        }


# Singleton instance
_health_suggestions_service = None

def get_health_suggestions_service() -> HealthSuggestionsService:
    """Get singleton instance of HealthSuggestionsService"""
    global _health_suggestions_service
    if _health_suggestions_service is None:
        _health_suggestions_service = HealthSuggestionsService()
    return _health_suggestions_service
