# FitFusion AI

A full-stack AI fitness application built with **React**, **Flask**, and **Azure OpenAI GPT-4o**. Features multi-modal body analysis, real-time voice coaching via WebRTC, agentic RAG with self-reflection, and computer vision food identification.

---

## What It Does

- **AI Body Analysis** — Upload a photo and GPT-4o Vision analyzes posture, body composition, and equipment, then generates a personalized 7-day workout plan with sets/reps
- **Voice AI Coach** — Talk to your fitness coach hands-free using WebRTC streaming with Azure OpenAI's Real-Time API (<100ms latency). The AI has function-calling access to your profile, workout plans, and progress data mid-conversation
- **Food Recognition** — Photograph a meal or ingredients for nutritional breakdown and healthy recipe suggestions via computer vision
- **Agentic RAG** — Goes beyond basic retrieval: a 5-phase loop (Goal Analysis → Strategic Planning → Search & Refinement → Synthesis → Self-Reflection) that autonomously selects search strategies and terminates early when quality thresholds are met
- **Weekly Planning & Progress** — Structured workout schedules, activity logging, and visual progress analytics

## Architecture

```
React 18 (Frontend)
  ├── WebRTC voice streaming
  ├── Camera capture / photo upload
  └── Axios → Flask REST API

Flask (Backend)
  ├── Azure OpenAI GPT-4o / GPT-4o Vision
  ├── Azure OpenAI Real-Time API (WebRTC + Whisper)
  ├── Azure AI Search (vector + semantic retrieval)
  ├── Agentic RAG engine (reflection loop, strategy selection)
  ├── MCP server (Model Context Protocol for structured fitness data)
  └── User auth & profile management
```

## Key Technical Highlights

| Area | Details |
|------|---------|
| **Agentic RAG** | Self-assessing retrieval loop with quality scoring, dynamic strategy switching (Broad / Targeted / Progressive / Multi-Angle), and early termination logic |
| **Multi-Modal AI** | Combines vision (body photos, food images) + text + voice in a single pipeline through GPT-4o |
| **Real-Time Voice** | WebRTC bidirectional streaming with server-side VAD, Whisper transcription, and tool-calling during conversation |
| **MCP Integration** | Model Context Protocol server exposing structured fitness resources (`fitness://exercises/{id}`, `fitness://nutrition/{plan}`) with graceful fallback |
| **Vector Search** | Azure AI Search with Text Embedding 3-Small for semantic fitness knowledge retrieval |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Bootstrap 5, WebRTC, Axios |
| Backend | Python Flask, Flask-CORS |
| AI/ML | Azure OpenAI (GPT-4o, GPT-4o Vision, Whisper, Embeddings), Azure AI Search |
| Voice | Azure OpenAI Real-Time API, WebRTC, Server-Side VAD |
| Data | Azure AI Search (vector + keyword hybrid), MCP resource server |

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- Azure account with: Azure OpenAI (GPT-4o deployment), Azure AI Search

### Setup

```bash
# Clone
git clone https://github.com/GeorgeKava/FitnessAdvisor-React.git
cd FitnessAdvisor-React

# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # Then fill in your Azure keys
python app.py              # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm start                  # http://localhost:3000
```

See [.env.example](.env.example) for all required environment variables.

## API Endpoints

### Auth & Profile
```
POST /api/register              POST /api/login
GET  /api/user-profile          POST /api/update-profile
```

### AI Analysis
```
POST /api/analyze_body                    — Body composition analysis (GPT-4o Vision)
POST /api/identify_food                   — Food/ingredient recognition
POST /api/get_food_recommendations        — Personalized meal plans
POST /api/generate-weekly-plan            — Structured workout plans
```

### Voice Chat
```
POST /api/start-session                   — Initialize real-time voice session
POST /api/webrtc-sdp                      — WebRTC connection negotiation
POST /api/functions/get_user_profile      — Tool call: profile access
POST /api/functions/get_todays_plan       — Tool call: today's workout
```

### Progress
```
POST /api/log-activity                    — Log workouts and activities
GET  /api/get-activities                  — Retrieve activity history
POST /api/functions/get_progress_data     — Progress analytics
```

## Project Structure

```
├── backend/
│   ├── app.py                 # Flask API server
│   ├── ai.py                  # GPT-4o Vision analysis & recommendations
│   ├── ai_fast.py             # Fast-mode analysis
│   ├── agentic_rag.py         # Agentic RAG with reflection loop
│   ├── voice_chat.py          # WebRTC voice chat + Azure Real-Time API
│   ├── mcp_server.py          # MCP resource server (exercises, nutrition)
│   ├── mcp_client.py          # MCP client integration
│   └── daily_plan_generator.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── FitnessAdvisorPage.jsx   # Body analysis UI
│           ├── VoiceChatWebRTC.jsx      # Voice coaching interface
│           ├── IdentifyFoodPage.jsx     # Food recognition
│           ├── FoodRecommendationsPage.jsx
│           ├── WeeklyPlanPage.jsx
│           ├── ProgressPage.jsx
│           ├── DashboardPage.jsx
│           └── ProfilePage.jsx
├── .env.example
└── README.md
```

## License

MIT
