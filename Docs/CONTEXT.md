# WeatherGPT: AI Context & Project Guide

**Target Audience:** AI/LLM Models | **Purpose:** Token-efficient project understanding | **Last Updated:** August 2026

---

## 🎯 Executive Summary

**WeatherGPT** is a conversational AI platform that integrates meteorological datasets, forecasting models, and disaster warning systems into a natural language interface. It enables users to query weather information, receive forecasts, get alerts, and access climate analysis through chat, voice, and GIS visualization.

**Core Mission:** Transform fragmented weather data across multiple portals into an accessible, intelligent, multi-lingual conversational platform serving farmers, aviation, maritime, urban planning, and disaster management sectors.

---

## 🏗️ Project Architecture at a Glance

### Layered System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
│  (React/Mobile UI → Chat, Maps, Alerts, Analytics, Voice)       │
└──────────────────────────┬──────────────────────────────────────┘
                          │
┌──────────────────────────v──────────────────────────────────────┐
│                  API GATEWAY / BACKEND LAYER                     │
│         (Node.js/Express | Authentication | Orchestration)      │
└──────────┬─────────────────┬────────────────┬──────────────────┘
           │                 │                │
     ┌─────v─────┐    ┌─────v──────┐   ┌────v──────┐
     │ AI/LLM    │    │   Weather  │   │ GIS/Alerts│
     │  Service  │    │   Service  │   │  Service  │
     │ (Python)  │    │ (ML/Data)  │   │           │
     └─────┬─────┘    └─────┬──────┘   └────┬──────┘
           │                │              │
     ┌─────v─────────────────v──────────────v──────┐
     │   Trusted Data Sources & APIs               │
     │  (Weather APIs, NWP Models, GIS Data)       │
     └─────┬──────────────────────────────────────┘
           │
     ┌─────v──────────────────────────┐
     │  PostgreSQL / MongoDB           │
     │  (Users, Chat History, Alerts,  │
     │   Locations, Analytics)         │
     └────────────────────────────────┘
```

---

## 📁 Repository Structure (Monorepo)

```
weathergpt/
│
├── frontend/                          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page-level components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API client & external service calls
│   │   ├── store/                    # State management (Redux/Zustand)
│   │   └── utils/                    # Helper functions
│   └── package.json
│
├── backend/                           # Node.js / Express.js
│   ├── prisma/
│   │   ├── schema.prisma             # PostgreSQL schema (Users, Locations, Records, Alerts, Chat)
│   │   └── seed.js                   # Development seed script
│   ├── src/
│   │   ├── controllers/              # Route handlers (auth, weather, alerts, chat, climate)
│   │   ├── routes/                   # API endpoints (v1 routes)
│   │   ├── services/                 # Business logic (weather, alerts, chat, climate, location)
│   │   ├── providers/                # Weather provider integrations (Open-Meteo, OpenWeather, IMD)
│   │   ├── middleware/               # Auth (JWT), logging, error handling, validation
│   │   ├── utils/                    # Common utilities & logger
│   │   └── config/                   # Environment, database & Swagger config
│   └── package.json
│
├── ai-service/                        # Python (FastAPI)
│   ├── app/
│   │   ├── agents/                   # LLM orchestration & agents
│   │   ├── tools/                    # Tool/function definitions for LLM
│   │   ├── prompts/                  # System & few-shot prompts
│   │   └── services/                 # LLM calls, RAG, intent detection
│   └── requirements.txt
│
├── weather-ml/                        # ML & Data Processing
│   ├── data/                          # Raw & processed datasets
│   ├── notebooks/                     # EDA & experimentation
│   ├── models/                        # Trained ML models
│   └── src/                           # Forecast processing, feature engineering
│
├── gis-alerts/                        # GIS & Alert Engine
│   ├── src/                           # Map visualization, hazard detection
│   └── data/                          # GIS boundaries, risk layers
│
├── Docs/                              # Comprehensive documentation
│   ├── README.md                      # Problem statement & overview
│   ├── ARCHITECTURE.md                # System architecture
│   ├── FOLDER_STRUCTURE.md            # This structure explained
│   ├── API.md                         # API endpoint reference
│   ├── DATABASE.md                    # Schema & data models
│   ├── AI_DESIGN.md                   # AI/LLM design patterns
│   ├── ALERTS_GIS.md                  # Alert & GIS functionality
│   ├── DEMO_FLOW.md                   # User journey examples
│   ├── DEVELOPMENT_PLAN.md            # Phases & timeline
│   ├── TEAM_TASKS.md                  # Role-based responsibilities
│   └── CONTEXT.md                     # THIS FILE
│
├── docker-compose.yml                 # Container orchestration
└── .gitignore
```

---

## 🔄 Data Flow: From Question to Answer

### Complete Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: USER INPUT                                                     │
│ ─────────────────────────────────────────────────────────────────────── │
│ User: "Will it rain tomorrow in Mumbai?"                                 │
│        [Via Chat, Voice, or Structured Query]                           │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────v────────────────────────────────────────────────┐
│ PHASE 2: BACKEND PROCESSING                                             │
│ ─────────────────────────────────────────────────────────────────────── │
│  • Authenticate user                                                     │
│  • Extract location (user default or explicit)                          │
│  • Timestamp & timezone handling                                        │
│  • Build weather query context                                          │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────v────────────────────────────────────────────────┐
│ PHASE 3: AI/LLM SERVICE (Intent & Reasoning)                             │
│ ─────────────────────────────────────────────────────────────────────── │
│ 1. Parse natural language question                                       │
│    └─ Intent: "forecast_query" | Scope: "precipitation"                 │
│                                                                          │
│ 2. Structure request                                                     │
│    └─ {location: "Mumbai", time: "tomorrow", var: "rain", ...}          │
│                                                                          │
│ 3. Select appropriate tool/function (Tool Calling)                       │
│    └─ [get_forecast, get_current, get_alerts, get_climate, ...]        │
│                                                                          │
│ 4. Invoke tool with guardrails (never hallucinate data)                  │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────v────────────────────────────────────────────────┐
│ PHASE 4: WEATHER SERVICE (Data Retrieval)                                │
│ ─────────────────────────────────────────────────────────────────────── │
│ • Query weather APIs or NWP models (GFS, WRF, OpenWeatherMap, etc.)      │
│ • Fetch forecast: Probability of rain, intensity, timing                │
│ • Include data timestamp & confidence levels                            │
│ • Filter by location boundaries (GIS)                                    │
│                                                                          │
│ Returns: {rain_prob: 0.75, amount: "15mm", time: "18:00-22:00", ...}   │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────v────────────────────────────────────────────────┐
│ PHASE 5: ANALYTICS & RISK ENGINE (ML)                                    │
│ ─────────────────────────────────────────────────────────────────────── │
│ • Compute derived metrics (flooding risk, heat index, etc.)             │
│ • Cross-reference historical patterns                                   │
│ • ML-based risk scoring                                                 │
│ • Check active alerts in that region                                    │
│                                                                          │
│ Returns: {risk_level: "moderate", advisories: [...], related_alerts: [...]}
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────v────────────────────────────────────────────────┐
│ PHASE 6: LLM RESPONSE GENERATION                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│ • Ground response in retrieved data (RAG-style)                         │
│ • Generate natural language explanation                                  │
│ • Add practical advice (bring umbrella, travel advisory, etc.)          │
│ • Include data source & confidence disclaimer                           │
│ • Support multilingual output                                           │
│                                                                          │
│ Response:                                                                │
│ "Tomorrow evening in Mumbai, there's a 75% chance of rain (15mm).       │
│  Consider carrying an umbrella. Data source: GFS Model, 6h forecast."   │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
┌────────────────────────v────────────────────────────────────────────────┐
│ PHASE 7: DELIVERY TO USER                                               │
│ ─────────────────────────────────────────────────────────────────────── │
│ • Chat response with formatting                                         │
│ • Related map visualization (precipitation overlay)                     │
│ • Alert notifications (if applicable)                                   │
│ • Voice playback (if requested)                                         │
│ • Save to chat history & user preferences                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI/LLM Integration Strategy

### Tool/Function Calling Framework

The AI service uses **function calling** to ground responses in verified weather data:

```python
# PSEUDO-CODE: LLM Tool Definitions

TOOLS = [
    {
        "name": "get_current_weather",
        "description": "Fetch real-time weather for a location",
        "parameters": {
            "location": str,        # "Mumbai, India" or lat/lon
            "units": str            # "metric" | "imperial"
        }
    },
    {
        "name": "get_forecast",
        "description": "Get weather forecast for next 7-10 days",
        "parameters": {
            "location": str,
            "time_range": str,      # "tomorrow", "next_week", "specific_date"
            "variables": list       # ["temperature", "precipitation", "wind"]
        }
    },
    {
        "name": "get_alerts",
        "description": "Fetch active weather alerts for a location",
        "parameters": {
            "location": str,
            "alert_type": str       # "flood", "cyclone", "heat", "wind"
        }
    },
    {
        "name": "get_climate_analysis",
        "description": "Historical trends and climate patterns",
        "parameters": {
            "location": str,
            "metric": str,          # "temperature_trend", "rainfall_pattern"
            "period": str           # "monthly", "seasonal", "yearly"
        }
    }
]

# PSEUDO-CODE: LLM Processing Loop

def process_user_query(user_question: str, context: dict):
    # 1. Intent Detection
    intent = llm.extract_intent(user_question, context)
    
    # 2. Call LLM with tools
    response = llm.call_with_tools(
        user_message=user_question,
        system_prompt=SYSTEM_PROMPT,
        tools=TOOLS,
        conversation_history=context['chat_history']
    )
    
    # 3. Handle tool calls iteratively
    while response.contains_tool_calls():
        tool_call = response.next_tool_call()
        tool_result = execute_tool(tool_call.name, tool_call.arguments)
        
        # Add tool result back to context
        response = llm.continue_conversation(
            tool_result=tool_result,
            conversation_history=context
        )
    
    # 4. Final response (guaranteed to use fetched data)
    return response.final_message

# PSEUDO-CODE: System Prompt (Guard Rails)

SYSTEM_PROMPT = """
You are WeatherGPT, a weather expert AI assistant.

CRITICAL RULES:
1. NEVER fabricate weather data. Always use tool results.
2. If data is unavailable, say so explicitly.
3. Include source and timestamp with every forecast.
4. Distinguish between official warnings and AI-generated advisories.
5. Show uncertainty: "75% confidence", "might change", etc.
6. Respond in the user's language (detected from query or profile).
7. Be concise for mobile; verbose for desktop (detect device type).
8. For critical alerts (floods, cyclones), escalate to human warning.

CONTEXT:
- User Location: {user_location}
- User Language: {user_language}
- Current Time: {timestamp}
- Recent Chat: {chat_history_summary}
"""
```

### Retrieval-Augmented Generation (RAG) Pipeline

```
Query → Embed → Search Weather Vector DB → Retrieve Context → Prompt → LLM → Answer
```

**Use Case:**
- User asks: "How does this monsoon compare to last year?"
- System retrieves historical rainfall data
- LLM synthesizes comparison using both current and historical data
- Response grounded in verified metrics

---

## 🗂️ Key Module Explanations

### Frontend Module
- **Purpose:** Provide accessible, responsive UI for all user interactions
- **Primary Tech:** React, Vite, Tailwind CSS
- **Key Features:**
  - Chat interface with message history
  - Real-time weather cards & interactive forecasts
  - GIS map overlay with alerts
  - Voice input/output controls
  - Accessibility (WCAG 2.1) for rural users
  - Multi-language support (Hindi, Tamil, Telugu, Kannada, etc.)

### Backend Module
- **Purpose:** API orchestration, authentication, business logic
- **Primary Tech:** Node.js, Express.js, Prisma ORM
- **Database Schema (PostgreSQL):**
  - `User`: User profile, credentials, preferred language, device tokens
  - `Location`: Saved & default favorite user locations
  - `WeatherRecord`: Point-in-time observations and historical weather logs
  - `Forecast`: NWP model predictions and rain probabilities
  - `Alert`: CAP-compatible disaster warnings (flood, cyclone, heatwave, thunderstorm)
  - `ChatMessage`: Conversational history with detected intents and sources
  - `AlertPreference`: Channel subscriptions and notification filters
- **Weather Providers Integration:**
  - `OpenMeteoProvider` (default free NWP & forecast source)
  - `OpenWeatherProvider` (secondary fallback)
  - `IMDProvider` (national agency bulletins and advisories)
- **API Endpoints (`/api/v1`):**
  - `/auth` (`register`, `login`, `me`)
  - `/weather` (`current`, `forecast`, `historical`)
  - `/alerts` (`active`, `all`, `preferences`)
  - `/chat` (`query`, `history/:conversationId`)
  - `/locations` (CRUD user locations)
  - `/climate` (`trends`)
  - Swagger UI accessible at `/api-docs`

### AI Service Module
- **Purpose:** LLM integration & conversational logic
- **Primary Tech:** Python, FastAPI, LangChain/LlamaIndex (optional)
- **Core Functions:**
  1. **Query Understanding:** Parse user intent from natural language
  2. **Tool Routing:** Select appropriate weather/analytics tools
  3. **Response Generation:** LLM-based synthesis of grounded data
  4. **Multilingual Support:** Translate prompts, responses

### Weather-ML Module
- **Purpose:** Meteorological data ingestion, NWP model post-processing, and risk analytics
- **Primary Tech:** Python (Pandas, NumPy, Scikit-learn, Xarray)
- **Core Functions:**
  1. Process GFS, WRF, and IMD gridded forecast datasets
  2. Compute derived indices (Heat Index, Flash Flood Guidance, Fire Weather Index)
  3. Historical baseline comparisons and climate anomaly detection

### GIS & Alerts Module
- **Purpose:** Spatial geofencing, hazard visualization, and CAP alert distribution
- **Primary Tech:** PostGIS / Turf.js / Leaflet
- **Core Functions:**
  1. Point-in-polygon checks for active disaster zones
  2. Multi-tier alert severity management (`advisory`, `warning`, `severe`, `extreme`)
  3. GeoJSON overlays for precipitation radar, wind vectors, and cyclone tracks