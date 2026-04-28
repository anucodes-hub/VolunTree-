Google Solutions Challenge:
Team Name: Code Commando


# 🌳 VolunTree: AI-Powered Disaster Response & Coordination

![VolunTree Header](https://via.placeholder.com/1200x300/10B981/ffffff?text=VolunTree+Sahayak)

**VolunTree** is a next-generation crisis coordination platform. It bridges the gap between field workers identifying community emergencies and the skilled volunteers equipped to solve them. By leveraging **Google's Gemini Multimodal AI** and **Firebase**, VolunTree automates the triage, matching, and verification of disaster relief efforts.

---

## 🚀 Key Features

### 1. Field Worker "Smart Intake"
*   **Voice-First Reporting**: Field workers facing urgent situations can simply hold the microphone button and speak. Gemini 1.5 Flash processes the audio, extracts the incident details, and automatically categorizes the emergency (e.g., Water, Medical, Shelter).
*   **Multimodal Evidence**: Workers can upload photos of the incident. Gemini Vision analyzes the images to assign an "Urgency Score" and tags the necessary skills required to fix it.

### 2. Intelligent Volunteer Matching
*   **Semantic Vector Search**: When an incident is reported, the backend uses `Vertex AI text-embedding-004` to compare the incident requirements against the skills of all registered volunteers.
*   **Push Notifications**: Matched volunteers receive instant alerts via Firebase Cloud Messaging (FCM).

### 3. AI-Powered "Proof of Impact"
*   **Verifiable Completion**: To mark a mission as complete, a volunteer must upload a "Proof of Fix" photo.
*   **Before/After AI Comparison**: Gemini analyzes the original incident photo against the new volunteer photo. It verifies whether the problem was actually resolved and issues an "AI Verified" badge, ensuring accountability.

### 4. Coordinator Control Center
*   **Real-time Operations Map**: Coordinators see a live view of all incidents popping up globally, color-coded by AI-determined urgency.
*   **Live Analytics**: A dashboard tracking Total Needs, Average Urgency, and Completion Rates synced in real-time via Firestore.

---

## 🛠 The Tech Stack

*   **Frontend**: React + Vite + TypeScript (Styled with modern glassmorphism UI & Framer Motion)
*   **Backend**: Python + FastAPI
*   **Database & Storage**: Firebase Firestore (NoSQL) & Firebase Storage
*   **Intelligence & AI**: Google Gemini 1.5 Flash (Voice & Image reasoning), Vertex AI Embeddings
*   **Deployment**: Vercel (Frontend) & Render.com / Google Cloud Run (Backend)

---

## 💻 Local Development Setup

To run VolunTree locally, you will need two terminal windows.

### 1. Backend (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend` folder and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_key_here
   ```
4. Start the backend server:
   ```bash
   python main.py
   ```
   *The backend will run on `http://localhost:8000`*

### 2. Frontend (React/Vite)
1. Navigate to the web directory:
   ```bash
   cd voluntree-web
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `voluntree-web` folder and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_API_URL=http://localhost:8000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

---

## 🌍 Deployment

VolunTree is designed to be easily deployed using modern cloud platforms.
* **Frontend**: Deploy `voluntree-web` to [Vercel](https://vercel.com). Ensure you add all `VITE_` environment variables to the Vercel dashboard.
* **Backend**: Deploy `backend` to [Render](https://render.com) as a Python Web Service. Set the Build Command to `pip install -r requirements.txt`, the Start Command to `uvicorn main:app --host 0.0.0.0 --port $PORT`, and add your `GEMINI_API_KEY` to the environment variables.
