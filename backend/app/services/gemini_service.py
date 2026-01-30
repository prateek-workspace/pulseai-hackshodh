"""
Gemini API Service for Pulse AI
Proxies requests to the hosted Gemini API
"""

import os
import httpx
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    """
    Service to interact with hosted Gemini API
    """
    
    def __init__(self):
        self.api_url = os.getenv("GEMINI_API_URL", "http://localhost:8001")
        self.timeout = 30.0
    
    async def generate(self, prompt: str) -> Dict:
        """
        Generate response from Gemini API
        
        Args:
            prompt: Text prompt to send to Gemini
        
        Returns:
            Dict with generated response
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/generate",
                    json={"text": prompt}
                )
                response.raise_for_status()
                return {
                    "success": True,
                    "data": response.json()
                }
            except httpx.HTTPStatusError as e:
                return {
                    "success": False,
                    "error": f"HTTP error: {e.response.status_code}",
                    "detail": str(e)
                }
            except httpx.RequestError as e:
                return {
                    "success": False,
                    "error": "Request failed",
                    "detail": str(e)
                }
    
    async def health_check(self) -> Dict:
        """
        Check Gemini API health
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(f"{self.api_url}/health")
                response.raise_for_status()
                return {
                    "status": "healthy",
                    "gemini_api": "connected"
                }
            except Exception as e:
                return {
                    "status": "unhealthy",
                    "gemini_api": "disconnected",
                    "error": str(e)
                }
    
    async def generate_health_insight(
        self, 
        care_score: float,
        signals: list,
        user_context: Optional[str] = None
    ) -> str:
        """
        Generate health insight using Gemini
        """
        signal_summary = ", ".join([
            f"{s['signal']} ({s['current']} vs baseline {s['baseline']})"
            for s in signals[:5]
        ]) if signals else "no significant deviations"
        
        prompt = f"""You are a calm, supportive health assistant. Provide a brief, 
        non-alarming insight based on this health data:
        
        CareScore: {care_score}/100
        Key signals: {signal_summary}
        {f"Additional context: {user_context}" if user_context else ""}
        
        Guidelines:
        - Never diagnose or suggest specific conditions
        - Be supportive and calm in tone
        - Focus on general wellness suggestions
        - Keep response under 100 words
        - If CareScore is high, gently suggest consulting a healthcare provider
        
        Provide a brief, helpful insight:"""
        
        result = await self.generate(prompt)
        
        if result["success"]:
            return result["data"].get("response", result["data"])
        else:
            return "We're analyzing your health data. Continue monitoring your signals for personalized insights."
