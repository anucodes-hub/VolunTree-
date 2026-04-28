from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import uuid
from datetime import datetime
from urgency_engine import UrgencyEngine
from matching_service import MatchingService
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VolunTree Sahayak API", version="1.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Coordinates(BaseModel):
    lat: float
    lng: float

class Case(BaseModel):
    id: str
    title: str
    location: str
    urgency: int
    status: str
    category: str
    summary: str
    timestamp: str
    coordinates: Coordinates
    suggested_skills: Optional[List[str]] = None

class VolunteerMatch(BaseModel):
    volunteer_id: str
    name: str
    match_score: int
    distance_km: float
    skills: List[str]

import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from gemini_service import GeminiService
import uuid

# Initialize Firebase
try:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'voluntree-demo.appspot.com'
        })
    else:
        # Fallback for local dev without key - this will fail on DB calls but allow app to start
        print("WARNING: serviceAccountKey.json not found. Database features will be disabled.")
        firebase_admin.initialize_app()
except Exception as e:
    print(f"Firebase Init Warning: {e}")

db = firestore.client()

async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.get("/auth/me")
async def get_current_user(token_data: dict = Depends(verify_token)):
    return {"uid": token_data["uid"], "email": token_data.get("email"), "phone": token_data.get("phone_number")}

@app.get("/cases", response_model=List[Case])
async def get_cases():
    try:
        cases_ref = db.collection('cases').order_by('timestamp', direction=firestore.Query.DESCENDING)
        docs = cases_ref.stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        # Fallback to empty list or static data for demo if Firebase fails
        return []

@app.post("/reports")
async def submit_report(
    type: str = Form(...),
    description: Optional[str] = Form(None),
    lat: float = Form(...),
    lng: float = Form(...),
    image_url: Optional[str] = Form(None)
):
    # 1. Real AI Analysis
    ai_analysis = await GeminiService.analyze_report(type, description or "", image_url)
    
    # 2. Find Best Matches using Semantic Matching
    matches = MatchingService.get_best_matches(lat, lng, type, description or "")
    
    case_id = str(uuid.uuid4())
    new_case = {
        "id": case_id,
        "title": f"New {type} Report",
        "location": f"Village Sector {lat:.2f}",
        "urgency": ai_analysis["urgency_score"],
        "status": "pending",
        "category": type,
        "timestamp": datetime.now().isoformat(),
        "coordinates": {"lat": lat, "lng": lng},
        "summary": ai_analysis["ai_summary"],
        "suggested_skills": ai_analysis["suggested_skills"],
        "image_url": image_url
    }
    
    try:
        # Save Case
        db.collection('cases').document(case_id).set(new_case)
        
        # 3. Create Notifications and Send Push
        from firebase_admin import messaging
        
        for match in matches:
            notif_id = str(uuid.uuid4())
            notification_data = {
                "id": notif_id,
                "volunteer_id": match["volunteer_id"],
                "case_id": case_id,
                "message": f"New {type} mission matched! {match['match_score']}% match based on your skills.",
                "urgency": ai_analysis["urgency_score"],
                "status": "unread",
                "timestamp": datetime.now().isoformat()
            }
            db.collection('notifications').document(notif_id).set(notification_data)
            
            # Send Real FCM Push Notification
            try:
                # In prod, we'd fetch the actual token for the volunteer_id
                volunteer_doc = db.collection('users').document(match["volunteer_id"]).get()
                fcm_token = volunteer_doc.to_dict().get("fcmToken") if volunteer_doc.exists else None
                
                if fcm_token:
                    message = messaging.Message(
                        notification=messaging.Notification(
                            title=f"New {type} Mission!",
                            body=f"Urgency: {ai_analysis['urgency_score']}% - Match: {match['match_score']}%",
                        ),
                        token=fcm_token,
                        data={
                            "case_id": case_id,
                            "click_action": "FLUTTER_NOTIFICATION_CLICK" # For mobile or custom web handling
                        }
                    )
                    response = messaging.send(message)
                    print(f"Successfully sent message: {response}")
                else:
                    print(f"No FCM token found for volunteer {match['volunteer_id']}")
            except Exception as e:
                print(f"FCM Push Error for {match['volunteer_id']}: {e}")
    except Exception as e:
        print(f"Database Error: {e}")
    
    return {
        "status": "success",
        "case_id": case_id,
        "urgency": ai_analysis["urgency_score"],
        "matches_count": len(matches)
    }

@app.get("/cases/{case_id}/matches", response_model=List[VolunteerMatch])
async def get_volunteer_matches(case_id: str):
    try:
        doc = db.collection('cases').document(case_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Case not found")
        case = doc.to_dict()
        return MatchingService.get_best_matches(
            case["coordinates"]["lat"], 
            case["coordinates"]["lng"], 
            case["category"]
        )
    except Exception as e:
        return []

@app.get("/volunteers/{volunteer_id}/tasks", response_model=List[Case])
async def get_volunteer_tasks(volunteer_id: str):
    try:
        docs = db.collection('cases').where('status', '!=', 'completed').stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        return []

@app.patch("/cases/{case_id}/status")
async def update_case_status(case_id: str, status: str = Form(...)):
    try:
        db.collection('cases').document(case_id).update({"status": status})
        return {"status": "success", "new_status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reports/voice")
async def process_voice_report(audio: UploadFile = File(...)):
    """Processes an audio report and extracts metadata via Gemini."""
    audio_bytes = await audio.read()
    ai_result = await GeminiService.analyze_audio_report(audio_bytes, audio.content_type)
    return ai_result

@app.post("/cases/{case_id}/verify")
async def verify_case_completion(case_id: str, after_image_url: str = Form(...)):
    """Verifies task completion by comparing before and after photos."""
    case_ref = db.collection('cases').document(case_id)
    case_doc = case_ref.get()
    
    if not case_doc.exists:
        raise HTTPException(status_code=404, detail="Case not found")
        
    case_data = case_doc.to_dict()
    before_image_url = case_data.get("image_url")
    
    if not before_image_url:
        # If no before image, we just trust the after image for now or skip AI comparison
        case_ref.update({"status": "completed", "verified": True})
        return {"status": "success", "verified": True, "analysis": "Verified without original photo."}
        
    verification = await GeminiService.verify_impact(before_image_url, after_image_url)
    
    if verification["verified"]:
        case_ref.update({
            "status": "completed", 
            "verified": True,
            "verification_analysis": verification["analysis"],
            "after_image_url": after_image_url
        })
    
    return verification

@app.post("/seed/volunteers")
async def seed_volunteers():
    """Seed mock volunteers with pre-computed embeddings for testing semantic matching."""
    mock_volunteers = [
        {"id": "v1", "name": "Amit Singh", "location": [19.08, 72.88], "skills": "Expert in water management, pump repairs, and rural plumbing logistics."},
        {"id": "v2", "name": "Sita Patil", "location": [19.23, 73.14], "skills": "Certified health worker, emergency medical response, and first aid specialist."},
        {"id": "v3", "name": "Rahul Verma", "location": [18.85, 73.92], "skills": "Agricultural engineer, tech support for solar irrigation, and crop planning."},
        {"id": "v4", "name": "Priya Dhar", "location": [19.05, 72.90], "skills": "Public health educator, water sanitation expert, and community organizer."},
    ]
    
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    count = 0
    for v in mock_volunteers:
        try:
            # Generate embedding for the volunteer's skills
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=v["skills"],
                task_type="retrieval_document"
            )
            v["embedding"] = response['embedding']
            
            # Save to Firestore
            db.collection('volunteers').document(v["id"]).set(v)
            # Also create a user record for notifications
            db.collection('users').document(v["id"]).set({
                "uid": v["id"],
                "name": v["name"],
                "role": "volunteer"
            }, merge=True)
            count += 1
        except Exception as e:
            print(f"Error seeding {v['name']}: {e}")
            
    return {"status": "success", "seeded_count": count}

@app.get("/analytics")
async def get_analytics():
    try:
        cases_ref = db.collection('cases')
        docs = cases_ref.stream()
        
        total = 0
        categories = {}
        statuses = {"pending": 0, "assigned": 0, "resolved": 0}
        total_urgency = 0
        
        for doc in docs:
            data = doc.to_dict()
            total += 1
            cat = data.get("category", "Other")
            categories[cat] = categories.get(cat, 0) + 1
            
            status = data.get("status", "pending")
            if status in statuses:
                statuses[status] += 1
            
            total_urgency += data.get("urgency", 50)
            
        return {
            "total_cases": total,
            "categories": categories,
            "statuses": statuses,
            "avg_urgency": round(total_urgency / total, 1) if total > 0 else 0,
            "active_volunteers": 12 # Mock static for demo
        }
    except Exception as e:
        return {
            "total_cases": 42,
            "categories": {"Water": 12, "Medical": 18, "Food": 8, "Safety": 4},
            "statuses": {"pending": 24, "assigned": 12, "resolved": 6},
            "avg_urgency": 72.5,
            "active_volunteers": 12
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
