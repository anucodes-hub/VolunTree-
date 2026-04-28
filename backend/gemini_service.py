import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

import requests
from PIL import Image
from io import BytesIO

class GeminiService:
    @staticmethod
    async def analyze_report(category: str, description: str, image_url: str = None):
        """
        Multimodal analysis of the community need.
        Structures the output into JSON for Firestore.
        """
        prompt = f"""
        Role: Crisis Response Expert
        Task: Analyze the following community need report.
        
        Category: {category}
        User Description: {description}
        
        Analyze the urgency and provide a structured JSON response with:
        - "urgency_score": integer (1-100)
        - "ai_summary": string (short, impactful, mention image details if present)
        - "suggested_skills": list of strings (required for volunteers)
        - "confidence": float (0-1)
        
        Return ONLY valid JSON.
        """
        
        try:
            content = [prompt]
            
            if image_url:
                try:
                    response = requests.get(image_url)
                    img = Image.open(BytesIO(response.content))
                    content.append(img)
                except Exception as img_err:
                    print(f"Gemini Image Fetch Error: {img_err}")

            response = model.generate_content(content)
            # Clean response (Gemini sometimes adds markdown blocks)
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"Gemini Analysis Error: {e}")
            # Fallback if AI fails
            return {
                "urgency_score": 50,
                "ai_summary": f"Manual intake: {description[:50]}...",
                "suggested_skills": ["General Support"],
                "confidence": 0.5
            }

    @staticmethod
    async def analyze_audio_report(audio_bytes: bytes, mime_type: str = "audio/webm"):
        """
        Uses Gemini 1.5 Flash to 'listen' to a voice report and extract details.
        """
        prompt = """
        Listen to this community emergency report. 
        Extract:
        1. Category: One of (Water, Food, Medical, Shelter, Safety, Other)
        2. Description: A concise summary of what the person is saying.
        3. Urgency: 1-100 score.
        
        Return the result as ONLY JSON:
        {
          "category": "...",
          "description": "...",
          "urgency_score": 85
        }
        """
        
        try:
            response = model.generate_content([
                prompt,
                {
                    "mime_type": mime_type,
                    "data": audio_bytes
                }
            ])
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"Gemini Audio Error: {e}")
            return {"category": "Other", "description": "Voice note captured but AI extraction failed.", "urgency_score": 50}

    @staticmethod
    async def verify_impact(before_url: str, after_url: str):
        """
        Compares before and after photos to verify task completion.
        """
        prompt = """
        Compare these two images. 
        Image 1: The reported issue (Before).
        Image 2: The volunteer's work (After).
        
        Task: Verify if the issue shown in Image 1 has been resolved or improved in Image 2.
        
        Return JSON:
        {
          "verified": boolean,
          "confidence": float,
          "analysis": "short explanation of what was observed"
        }
        """
        
        try:
            content = [prompt]
            
            # Fetch both images
            for url in [before_url, after_url]:
                res = requests.get(url)
                content.append(Image.open(BytesIO(res.content)))

            response = model.generate_content(content)
            clean_json = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"Gemini Verification Error: {e}")
            return {"verified": False, "confidence": 0, "analysis": "AI verification error."}
