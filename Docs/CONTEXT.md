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
│   ├── test/                         # Automated API test suite
│   └── package.json
│
├── ai-service/                        # Python (FastAPI) AI/LLM Microservice
│   ├── app/
│   │   ├── agents/                   # ReAct Agent orchestrator, NLU Intent classifier, Tool executor
│   │   ├── tools/                    # Function definitions, Weather, Alerts, Climate, Agri, Geocoding tools
│   │   ├── prompts/                  # System prompts (Base, Kisan, Emergency, Sports), Multilingual prompts, Few-shots
│   │   ├── rag/                      # Meteorological knowledge base & Hybrid BM25/Semantic retriever
│   │   ├── services/                 # Multi-provider LLM client, Grounding service, Multilingual engine, Context manager, Guardrails
│   │   ├── models/                   # Pydantic schemas (AgentQueryRequest, AgentQueryResponse, WeatherCard) & Enums
│   │   ├── config.py                 # Configuration & Environment settings
│   │   └── main.py                   # FastAPI app with REST endpoints
│   ├── tests/                        # Automated Pytest suite (29 passed)
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Containerization Dockerfile
│   └── README.md                     # Microservice guide
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
│   ├── FOLDER_STRUCTURE.md            # Structure explained
│   ├── API.md                         # API endpoint reference
│   ├── DATABASE.md                    # Schema & data models
│   ├── AI_DESIGN.md                   # AI/LLM design patterns
│   ├── ALERTS_GIS.md                  # Alert & GIS functionality
│   ├── DEMO_FLOW.md                   # User journey examples
│   ├── DEVELOPMENT_PLAN.md            # Phases & timeline
│   ├── TEAM_TASKS.md                  # Role-based responsibilities
│   └── CONTEXT.md                     # THIS FILE
│
├── docker-compose.yml                 # Monorepo container orchestration
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

```text
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
- **Purpose:** API orchestration, authentication, caching, real-time dissemination, and business logic
- **Primary Tech:** Node.js, Express.js, Prisma ORM, Server-Sent Events (SSE), In-Memory TTL Cache
- **Database Schema (PostgreSQL via Prisma):**
  - `User`: User credentials (bcrypt), preferred multilingual language, device push tokens
  - `Conversation`: Multi-turn chat session threads with title and timestamp tracking
  - `ChatMessage`: Chronological messages linked to `Conversation`, with intents, sources, and risk tags
  - `Location`: Saved favorite user locations with atomic default location switching
  - `WeatherRecord`: Historical weather logs and raw telemetry snapshots
  - `Forecast`: NWP model predictions, precipitation probabilities, and timestamps
  - `Alert`: CAP 1.2 compliant disaster warnings with GeoJSON `geometry` (Polygons/MultiPolygons)
  - `AlertPreference`: Channel subscriptions (push/SMS/email) and severity thresholds
- **In-Memory TTL Caching Layer:**
  - 10-minute coordinate-keyed cache for observations (<5ms latency)
  - 30-minute cache for NWP forecasts with background PostgreSQL persistence
  - 24-hour cache for climate archives and 7-day cache for geocoding
- **Weather Providers Integration:**
  - `OpenMeteoProvider`: Default NWP forecast & live observation provider
  - `OpenWeatherProvider`: Secondary fallback provider
  - `IMDProvider`: National meteorological bulletins & advisories
- **AI Microservice Gateway:**
  - HTTP forwarder to Python FastAPI service (`${AI_SERVICE_URL}/api/v1/agent/query`)
  - Automatic zero-downtime fallback to local grounded meteorological reasoning engine
- **Real-Time Communication Gateway:**
  - Native Server-Sent Events (SSE) stream (`/api/v1/alerts/stream`) with 30s keep-alive heartbeats
  - Instant live disaster broadcast to connected React frontends upon alert creation or CAP ingestion
- **Complete REST API Endpoints (`/api/v1`):**
  - `/auth` (`signup`, `login`, `logout`, `GET /me`, `PUT /me`)
  - `/weather` (`current` [supports `?city=` & `?lat=`], `forecast`, `hourly`, `daily`, `history`, `geocode`)
  - `/chat` & `/ai` (`POST /`, `POST /chat`, `conversations`, `history/:conversationId`, `DELETE /conversations/:id`)
  - `/locations` (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`)
  - `/alerts` (`GET /`, `gis/layers`, `hazard/check`, `stream`, `nearby`, `cap/ingest`, `preferences`)
  - `/climate` & `/analytics` (`trends`, `climate`)
  - Swagger UI accessible at `/api-docs`


### AI Service Module (`ai-service`) — Fully Implemented
- **Purpose:** Production agentic natural-language weather intelligence, multi-provider LLM orchestration, RAG retrieval, native multilingual synthesis, and safety guardrails.
- **Primary Tech:** Python 3.14, FastAPI, Pydantic v2, Uvicorn, HTTPX, Pytest.
- **Implemented Architecture & Submodules:**
  1. **NLU & Intent Classifier (`app/agents/intent_classifier.py`):**
     - Full Intent Taxonomy: `CURRENT_WEATHER`, `FORECAST_SHORT_TERM`, `FORECAST_EXTENDED`, `ALERT_CHECK`, `CLIMATE_TREND`, `AGRI_ADVISORY`, `OUTDOOR_ACTIVITY`, `METEOROLOGICAL_EXPLANATION`, `OUT_OF_DOMAIN`.
     - Entity & Slot Extraction: Location geocoder (Indian cities, taluks, coordinates), temporal scopes (`current`, `tomorrow`, `multi_day`, `historical`), and target sector personas.
  2. **Multi-Provider LLM Integration (`app/services/llm_client.py`):**
     - Supports **Google Gemini** (`gemini-2.0-flash`), **OpenAI / OpenRouter** (`gpt-4o`, `gpt-4o-mini`), **Anthropic Claude** (`claude-3-5-sonnet`), **Ollama / Local LLM** (`llama3:8b`), and a **Deterministic High-Fidelity Fallback Engine** providing 100% operational uptime without requiring external API keys.
  3. **Autonomous ReAct Agent Loop & 8 Live Tools (`app/tools/` & `app/agents/`):**
     - `get_current_weather`: Real-time temperature, feels like, humidity, wind, rainfall observations.
     - `get_weather_forecast`: NWP ensemble multi-day forecasts (highs/lows, rain probabilities, conditions).
     - `get_active_alerts`: CAP 1.2 & IMD disaster warning feed.
     - `get_climate_trends`: Historical 30-year climatological normals and anomaly calculations.
     - `calculate_biometeorology`: Heat Index (NOAA Rothfusz regression) and Stull Wet-Bulb calculation.
     - `get_agricultural_advisory`: Kisan spraying window suitability and disease risk evaluator.
     - `geocode_location`: Indian city and global coordinate geocoding resolver.
     - `search_meteorological_knowledge`: RAG domain search.
  4. **Factual Grounding & WeatherCard Assembly (`app/services/grounding_service.py`):**
     - Strictly anchors responses to retrieved tool data with source provenance and risk scoring (`low`, `moderate`, `high`, `extreme`).
     - Generates structured `WeatherCard` payloads with all meteorological variables.
  5. **Domain Knowledge RAG Retrieval (`app/rag/`):**
     - Curated knowledge repository covering IMD 4-Color Warning Codes (Green, Yellow, Orange, Red), IMD 4-Stage Cyclone Warning Protocol, Indian Monsoon dynamics (SW/NE Monsoon, Western Disturbances, El Niño/La Niña/IOD), NDMA Heatwave/Lightning guidelines, and Crop Weather Calendars.
     - Hybrid BM25/keyword semantic retriever (`knowledge_retriever.py`).
  6. **Native Multilingual Response Generation (`app/services/multilingual_service.py`):**
     - Automatic script detection and localized synthesis for **11 Indian languages**: English (`en`), Hindi (`hi`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), Gujarati (`gu`), Kannada (`kn`), Malayalam (`ml`), Punjabi (`pa`), and Odia (`or`).
  7. **Conversation Context & Memory Manager (`app/services/context_manager.py`):**
     - Multi-turn state tracking with sliding window memory, resolving follow-up queries and location persistence.
  8. **Hallucination Safeguards & Guardrails (`app/services/guardrails.py`):**
     - Pre-flight prompt injection / jailbreak filters, domain boundary redirection, post-generation factual consistency verification, and official warning validation.
  9. **API Endpoints Exposed (`:8000`):**
     - `POST /api/v1/agent/query`: Gateway conversational query endpoint.
     - `POST /api/v1/agent/intent`: Standalone NLU intent and slot extraction.
     - `GET /api/v1/agent/tools`: Registered JSON Schema tool definitions.
     - `POST /api/v1/rag/search`: RAG domain knowledge search.
     - `GET /health` & `GET /ready`: Health check & readiness probes.
  10. **Test Coverage:** 29/29 Pytest unit and integration tests passing (`pytest tests/ -v`).


### Weather-ML Module
- **Purpose:** Meteorological data ingestion, NWP model post-processing, and risk analytics
- **Primary Tech:** Python (Pandas, NumPy, Scikit-learn, Xarray)
- **Core Functions:**
  1. Process GFS, WRF, and IMD gridded forecast datasets
  2. Compute derived indices (Heat Index, Flash Flood Guidance, Fire Weather Index)
  3. Historical baseline comparisons and climate anomaly detection

### GIS & Alerts Module
- **Purpose:** Spatial geofencing, hazard classification, and CAP alert distribution
- **Primary Tech:** Ray-Casting Point-in-Polygon, GeoJSON, Turf.js / Leaflet
- **Core Functions:**
  1. **Spatial Geofencing:** Point-in-Polygon Ray Casting algorithm detecting whether user coordinates fall within arbitrary disaster boundary polygons
  2. **IMD Meteorological Hazard Scoring:** Evaluates real-time precipitation, wind gust speeds, and temperatures against official IMD threshold levels (`Green: No Warning`, `Yellow: Watch`, `Orange: Alert`, `Red: Warning`)
  3. **GeoJSON FeatureCollections:** Generates standard GeoJSON layers with embedded IMD color hex codes for instant map layer rendering
  4. **CAP 1.2 Ingestion:** Ingests official NDMA / SACHET / IMD XML-JSON bulletins with spatial coordinates and radius/polygon boundaries

---

## 👥 Team Task Status Matrix

| Role | Member | Completed Work | Pending Focus |
| :--- | :--- | :--- | :--- |
| **Frontend Lead** | Member 1 | React/Vite, Tailwind, UI Pages (Chat, Forecast, Alerts, Climate, Maps) | Web Speech voice integration, live SSE stream hook |
| **Backend Lead** | Member 2 | Express, Prisma ORM, JWT Auth, Caching, SSE, REST APIs (34/34 tests passing) | Maintained & stable |
| **AI/LLM Engineer**| Member 3 | FastAPI microservice, NLU, Multi-provider LLM, ReAct Agent, 8 Tools, RAG, 11 Indian Languages, Memory, Guardrails (29/29 tests passing) | Maintained & stable |
| **Weather/ML** | Member 4 | Exploration notebook (`Weather-ml.ipynb`) | `weather-ml/` data pipeline, ML training/inference API |
| **GIS & Alerts** | Member 5 | Hazard score rules in backend | `gis-alerts/` module, India GeoJSON boundary layers, CAP parser |
| **DevOps & CI/CD** | Member 6 | Docker compose orchestration, test suites | GitHub Actions CI/CD workflows, Frontend Dockerfile, E2E tests |