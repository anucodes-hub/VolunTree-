import math
import google.generativeai as genai
import numpy as np
import os
from dotenv import load_dotenv
from firebase_admin import firestore

load_dotenv()

class MatchingService:
    """
    Finds the best-fit volunteers using Vertex AI Semantic Embeddings 
    and Location-aware search.
    """
    
    # Configure Gemini for embeddings
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)

    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        # Haversine formula
        R = 6371 # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return round(R * c, 1)

    @staticmethod
    def get_best_matches(case_lat, case_lng, category, description=""):
        db = firestore.client()
        matches = []
        
        # 1. Generate embedding for the NEED using Gemini/Vertex AI
        try:
            target_text = f"{category}: {description}"
            # Using Gemini embedding-004 (latest)
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=target_text,
                task_type="retrieval_query"
            )
            need_embedding = response['embedding']
        except Exception as e:
            print(f"Embedding error: {e}")
            # Fallback to empty list or basic keyword match logic if needed
            return []

        # 2. Fetch volunteers from Firestore
        try:
            volunteers_ref = db.collection('volunteers')
            volunteers = volunteers_ref.stream()
            
            for doc in volunteers:
                v = doc.to_dict()
                v_id = doc.id
                v_location = v.get("location", [0, 0])
                v_embedding = v.get("embedding")
                
                dist = MatchingService.calculate_distance(case_lat, case_lng, v_location[0], v_location[1])
                
                # Semantic Similarity Score
                if v_embedding:
                    # Cosine similarity
                    similarity = np.dot(need_embedding, v_embedding) / (np.linalg.norm(need_embedding) * np.linalg.norm(v_embedding))
                    skill_score = int(similarity * 100)
                else:
                    skill_score = 50 # Default if no embedding
                
                # Proximity boost (20 points if within 10km, scaling down)
                proximity_boost = max(0, 20 - (dist * 2)) 
                
                total_match = min(99, skill_score + int(proximity_boost))
                
                matches.append({
                    "volunteer_id": v_id,
                    "name": v.get("name", "Unknown"),
                    "match_score": int(total_match),
                    "distance_km": dist,
                    "skills": [v.get("skills", "General Support")[:50] + "..."]
                })
        except Exception as e:
            print(f"Firestore Matching Error: {e}")

        # Return top 3 matches
        return sorted(matches, key=lambda x: x["match_score"], reverse=True)[:3]
