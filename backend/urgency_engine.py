import re

class UrgencyEngine:
    """
    Simulates the Gemini 2.5 Flash urgency scoring logic.
    In production, this would use multimodal prompts to analyze photos/voice.
    """
    
    CRITICAL_KEYWORDS = ["water", "medical", "blood", "emergency", "collapse", "death", "starving"]
    MODERATE_KEYWORDS = ["leak", "shortage", "broken", "repair", "fever", "request"]

    @staticmethod
    def calculate_score(description: str, category: str) -> int:
        score = 30 # Base score
        
        text = (description + " " + category).lower()
        
        # Keyword matching (Simulating AI understanding)
        for word in UrgencyEngine.CRITICAL_KEYWORDS:
            if word in text:
                score += 40
                break
        
        for word in UrgencyEngine.MODERATE_KEYWORDS:
            if word in text:
                score += 20
                break
                
        # Category weights
        if category.lower() == "medical":
            score += 15
        elif category.lower() == "water":
            score += 10
            
        return min(score, 98) # Cap at 98 for realism

    @staticmethod
    def generate_summary(description: str, category: str) -> str:
        """Simulates AI summarization."""
        if not description:
            return f"New {category} report submitted. Requires immediate attention."
        return f"AI Analysis: {description[:100]}... Structured as a high-priority {category} need."
