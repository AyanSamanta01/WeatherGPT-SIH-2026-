# WeatherGPT: AI Context & Project Guide

**Target Audience:** AI/LLM Models & Team Developers | **Purpose:** Complete project context, architecture & sync guide | **Last Updated:** August 2026

---

## 🎯 Executive Summary

**WeatherGPT** is an end-to-end meteorological intelligence and conversational platform designed for SIH 2026. It integrates historical meteorological datasets, machine learning forecasting models, extreme hazard detection engines, disaster warning systems, and an agentic multi-lingual LLM microservice into an accessible natural language interface for Indian and global cities.

**10 Key Metropolitan Reference Regions:**
1. **Kolkata** (22.5726° N, 88.3639° E)
2. **Delhi** (28.6139° N, 77.2090° E)
3. **Mumbai** (19.0760° N, 72.8777° E)
4. **Chennai** (13.0827° N, 80.2707° E)
5. **Bengaluru** (12.9716° N, 77.5946° E)
6. **Hyderabad** (17.3850° N, 78.4867° E)
7. **Ahmedabad** (23.0225° N, 72.5714° E)
8. **Guwahati** (26.1445° N, 91.7362° E)
9. **Bhubaneswar** (20.2961° N, 85.8245° E)
10. **Srinagar** (34.0837° N, 74.7973° E)

---

## 🏗️ Project Architecture at a Glance

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       USER INTERFACE LAYER (React + Vite)                   │
│   • ChatPage, ForecastPage, WeatherMapPage, AlertsPage, AnalyticsPage       │
│   • Accessible via: http://localhost:5173                                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (REST / SSE)
┌──────────────────────────────────────v──────────────────────────────────────┐
│                    API GATEWAY / BACKEND (Node.js / Express)                │
│   • Auth, User Locations, Weather Routes (/api/v1/weather)                  │
│   • GIS & Spatial Point-in-Polygon Geofencing (gisUtils.js)                 │
│   • Live Observation Hazard Engine (hazardEngine.js)                        │
│   • Server-Sent Events (SSE) Live Disaster Stream (/api/v1/alerts/stream)   │
│   • Accessible via: http://localhost:5000                                   │
└──────────────────┬──────────────────┬──────────────────┬────────────────────┘
                   │                  │                  │
┌──────────────────v──────┐  ┌────────v───────────────┐ ┌v───────────────────┐
│     AI / LLM SERVICE    │  │ WEATHER-ML & RISK      │ │ GIS & ALERTS        │
│ (Python FastAPI :8000)  │  │ (Python Models / ML)   │ │ (Python FastAPI     │
│ • ReAct Agent Loop      │  │ • 6h XGBoost Regressor │ │   & GeoJSON Hub)    │
│ • NLU & 10 Live Tools   │  │ • 6h Rain Classifier   │ │ • Ray-Casting PIP   │
│ • RAG Knowledge Base    │  │ • 6h Rain LightGBM     │ │ • IMD 4-Color SOP   │
│ • 11 Indian Languages   │  │ • NWP Consensus Engine │ │ • CAP 1.2 XML/JSON  │
│ • Safety Guardrails     │  │ • 24h Lag Telemetry    │ │ • Emergency Dispatch│
└─────────────────────────┘  └────────────────────────┘ └─────────────────────┘
```

---

## 📁 Repository Monorepo Structure

```text
WeatherGPT-SIH-2026-/
│
├── dataset/                                   # Historical Meteorological Datasets
│   ├── WeatherGPT_10_Cities_V3_Master.csv    # Master V3 Dataset (1,020,180 rows, 58 columns)
│   ├── V3_dataset_summary.csv                # Dataset verification metadata
│   └── [City]_V3.csv                         # Individual city CSVs (102,018 rows/city)
│
├── models/                                    # Serialized Production ML Models
│   ├── temperature_xgb.json                  # XGBoost 6h Temperature Regressor
│   ├── rain_classifier_xgb.json              # XGBoost Rain Binary Classifier
│   ├── rainfall_amount_lgbm.txt              # LightGBM Log-transformed Rainfall Booster
│   ├── feature_columns.json                  # 64 aligned one-hot feature schema
│   └── model_metadata.json                   # Complete training, validation & test benchmarks
│
├── src/                                       # Core Python ML & API Engine
│   ├── weathergpt_predict.py                 # Unified model inference module
│   ├── weathergpt_risk_engine.py             # IMD Heat Index, Discomfort, Rain/Wind scales
│   ├── weathergpt_live_features.py           # Live Open-Meteo telemetry & 24h lag engine
│   ├── weathergpt_nwp_consensus.py           # Multi-model NWP consensus analyzer (ECMWF, GFS, ICON)
│   └── api.py                                # FastAPI Microservice (Port 8000)
│
├── train_pipeline.py                          # 13-stage reproducible ML training pipeline
├── test_inference.py                          # ML model prediction unit tests
├── test_risk_engine.py                        # Risk & hazard engine unit tests
├── test_live_pipeline.py                      # Live Open-Meteo data pipeline tests
├── test_api_server.py                         # FastAPI endpoint integration tests
├── test_nwp_consensus.py                      # NWP multi-model consensus test suite
│
├── backend/                                   # Node.js / Express Backend
│   ├── prisma/
│   │   ├── schema.prisma                     # DB schema (User, Location, Record, Alert, Chat)
│   │   └── seed.js                           # Seed script
│   ├── src/
│   │   ├── controllers/                      # Route handlers (auth, weather, alert, chat)
│   │   ├── routes/v1/                        # REST API routes
│   │   ├── services/                         # hazardEngine.js, alertService.js, chatService.js
│   │   ├── providers/                        # Open-Meteo, OpenWeather, IMD providers
│   │   ├── utils/                            # gisUtils.js (Ray-casting PIP, GeoJSON)
│   │   └── config/                           # env.js (points AI_SERVICE_URL -> port 8000)
│   ├── test/                                 # Automated API test suite (34 passed)
│   └── package.json
│
├── ai-service/                                # Python (FastAPI) AI/LLM Microservice
│   ├── app/
│   │   ├── agents/                           # ReAct Agent orchestrator, NLU Intent classifier, Tool executor
│   │   ├── tools/                            # Function definitions, Weather, Alerts, Climate, Agri, Geocoding tools
│   │   ├── prompts/                          # System prompts (Base, Kisan, Emergency, Sports), Multilingual prompts, Few-shots
│   │   ├── rag/                              # Meteorological knowledge base & Hybrid BM25/Semantic retriever
│   │   ├── services/                         # Multi-provider LLM client, Grounding service, Multilingual engine, Context manager, Guardrails
│   │   ├── models/                           # Pydantic schemas (AgentQueryRequest, AgentQueryResponse, WeatherCard) & Enums
│   │   ├── config.py                         # Configuration & Environment settings
│   │   └── main.py                           # FastAPI app with REST endpoints
│   ├── tests/                                # Automated Pytest suite (29 passed)
│   ├── requirements.txt                      # Python dependencies
│   ├── Dockerfile                            # Containerization Dockerfile
│   └── README.md                             # Microservice guide
│
├── gis-alerts/                                # Python (FastAPI) GIS & Spatial Alert Subsystem
│   ├── data/                                 # Curated GeoJSON Boundary & Hazard Polygons
│   │   ├── india_metropolitan_boundaries.geojson # 10 metropolitan boundary polygons
│   │   ├── cyclone_hazard_corridors.geojson      # East & West Coast cyclone surge polygons
│   │   ├── flood_prone_river_basins.geojson      # Major Indian river flood plains
│   │   └── heatwave_vulnerability_zones.geojson  # Arid & Vidarbha/Telangana heat corridors
│   ├── src/                                  # Spatial geofencing, IMD rules, CAP 1.2, Dispatcher
│   │   ├── spatial_geofencing.py             # Ray-Casting Point-in-Polygon & Haversine distance
│   │   ├── alert_rules_engine.py             # IMD 4-Color SOP severity classification
│   │   ├── cap_protocol.py                   # WMO / NDMA CAP 1.2 XML & JSON generator/parser
│   │   ├── geojson_builder.py                # GeoJSON FeatureCollection builder & styler
│   │   ├── notification_dispatcher.py        # Multi-channel emergency notification hub
│   │   └── api.py                            # FastAPI Microservice
│   ├── tests/                                # Automated Pytest suite (17 passed)
│   ├── requirements.txt                      # Python dependencies
│   ├── Dockerfile                            # Containerization Dockerfile
│   └── README.md                             # Subsystem documentation
│
├── frontend/                                  # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/layout/                # Navbar, Sidebar, Weather Cards
│   │   ├── pages/                            # ChatPage, ForecastPage, AlertsPage, Maps, Analytics, Auth, Settings
│   │   └── services/api.js                   # Client REST API connector
│   └── vite.config.js
│
├── Docs/                                      # Project Documentation & Specifications
│   ├── CONTEXT.md                             # THIS FILE
│   ├── TEAM_TASKS.md                          # Role-based task tracking
│   ├── ARCHITECTURE.md                        # System architecture
│   ├── API.md                                 # Backend REST API reference
│   └── ALERTS_GIS.md                          # GIS & hazard design
│
├── docker-compose.yml                         # Monorepo container orchestration
└── .gitignore
```

---

## 🤖 Weather-ML & Subsystem (Member 4 Deliverables)

### 1. Dataset & Chronological Temporal Split
- **Dataset**: `WeatherGPT_10_Cities_V3_Master.csv` (1,020,180 rows, 58 raw columns, 10 Indian cities).
- **Timeframe**: `2015-01-02 00:00:00` to `2026-08-22 17:00:00`. Zero missing values, zero duplicates.
- **Strict Chronological Split (Per City)**:
  - **Train (80%)**: 81,614 rows/city (816,140 total) — `2015-01-02` to `2024-04-24`
  - **Validation (10%)**: 10,202 rows/city (102,020 total) — `2024-04-24` to `2025-06-23`
  - **Test (10%)**: 10,202 rows/city (102,020 total) — `2025-06-23` to `2026-08-22`
- **Features**: 64 features total (54 numerical meteorological lags and cyclic transformations + 10 one-hot city indicators).

### 2. Production Model Benchmarks

| Model | Algorithm | Target | Validation Benchmark | Final Unbiased Test Result |
| :--- | :--- | :--- | :--- | :--- |
| **Temperature 6h Regressor** | XGBoost Regressor | `target_temperature_6h` | MAE: **0.9636 °C** \| RMSE: 1.3363 °C | Test MAE: **0.9612 °C** \| RMSE: **1.3031 °C** (**73.7% improvement** over persistence baseline of 3.65 °C) |
| **Rain / No-Rain Classifier** | XGBoost Classifier | `target_rainfall_6h > 0` | F1: **0.6548** (Threshold: `0.65`) | Test Accuracy: **0.8418** \| Precision: **0.6333** \| Recall: **0.7053** \| F1: **0.6674** \| ROC-AUC: **0.9004** |
| **Rainfall Amount Regressor** | LightGBM (`log1p`) | `target_rainfall_6h > 0` | MAE: **0.8581 mm** \| RMSE: 1.8482 mm | Test MAE: **0.7916 mm** \| RMSE: **1.7665 mm** (Tested on 22,959 actual rain events) |

### 3. Extreme-Weather & Hazard Risk Engine (`src/weathergpt_risk_engine.py`)
- **NOAA / IMD Heat Index**: Rothfusz polynomial regression equation combining temperature and relative humidity with physiological thermal stress brackets (`Normal`, `Caution`, `Extreme Caution`, `Danger`, `Extreme Danger`).
- **Thom's Discomfort Index (DI)**: Thermal comfort scaling for outdoor workers and public advisories.
- **IMD Rainfall Severity**: Categorizes rainfall into standard IMD bands (`No Rain`, `Very Light`, `Light`, `Moderate`, `Rather Heavy`, `Heavy`, `Very Heavy`, `Extremely Heavy`).
- **Wind Speed & Squall Scale**: Beaufort / IMD gale brackets (`Calm/Light`, `Moderate`, `Strong Breeze`, `Gale/Squall`, `Cyclonic Storm`).
- **Composite Multi-Hazard Risk Score**: Continuous scale ($0 - 100$), risk level (`LOW`, `MODERATE`, `HIGH`, `SEVERE`), IMD 4-Color Codes (`Green`, `Yellow`, `Orange`, `Red`), and sector-specific advisories.

### 4. Real-Time Live Telemetry Pipeline (`src/weathergpt_live_features.py`)
- Resolves any Indian city or arbitrary `(lat, lon)` coordinate to the nearest supported metropolitan center.
- Ingests past 48 hours of hourly weather observations via Open-Meteo.
- Computes cyclic time encodings (`hour_sin/cos`, `day_sin/cos`), wind direction vectors (`sin/cos`), and all multi-horizon lags (`1h`, `3h`, `6h`, `12h`, `24h`) dynamically on the fly.
- Feeds live feature vectors into `weathergpt_predict()` for zero-latency 6-hour forecast generation.

### 5. NWP Multi-Model Consensus & Anomaly Analyzer (`src/weathergpt_nwp_consensus.py`)
- **Multi-Model Benchmark**: Side-by-side comparison of WeatherGPT 6h ML forecasts against global Numerical Weather Prediction models (**ECMWF IFS 9km**, **NOAA GFS 13km**, and **DWD ICON 13km**).
- **Consensus Confidence Index (0% - 100%)**: Dynamically measures inter-model agreement and atmospheric uncertainty from model standard deviation ($\sigma_T$, $\sigma_P$).
- **Micro-Climate Anomaly Detector**: Identifies localized convective downpours and urban heat island retention that coarse global grids smooth out.
- **REST Endpoint**: `GET http://localhost:8000/api/v1/ml/consensus?city={city}`

---

## 🤖 AI / LLM Subsystem (Member 3 Deliverables)

### 1. NLU Intent Classifier & Slot Extraction (`ai-service/app/agents/intent_classifier.py`)
- **Intent Taxonomy**: `CURRENT_WEATHER`, `FORECAST_SHORT_TERM`, `FORECAST_EXTENDED`, `ALERT_CHECK`, `CLIMATE_TREND`, `AGRI_ADVISORY`, `OUTDOOR_ACTIVITY`, `METEOROLOGICAL_EXPLANATION`, `OUT_OF_DOMAIN`.
- **Slot Extraction**: Locations (Indian cities, taluks, coordinates), temporal scopes (`current`, `tomorrow`, `multi_day`, `historical`), and target sector personas.

### 2. Universal Multi-Provider LLM Integration (`ai-service/app/services/llm_client.py`)
- Supports **Google Gemini** (`gemini-2.0-flash`, `gemini-1.5-pro`), **OpenAI / OpenRouter** (`gpt-4o`, `gpt-4o-mini`), **Anthropic Claude** (`claude-3-5-sonnet`), **Ollama / Local LLM** (`llama3:8b`), and a **Deterministic Grounded Fallback Engine** ensuring 100% operational uptime without requiring external API keys.

### 3. Autonomous ReAct Agent Loop & 8 Live Tools (`ai-service/app/tools/`)
- `get_current_weather`: Real-time temperature, feels like, humidity, wind, rainfall observations.
- `get_weather_forecast`: NWP ensemble multi-day forecasts (highs/lows, rain probabilities, conditions).
- `get_active_alerts`: CAP 1.2 & IMD disaster warning feed.
- `get_climate_trends`: Historical 30-year climatological normals and anomaly calculations.
- `calculate_biometeorology`: Heat Index (NOAA Rothfusz regression) and Stull Wet-Bulb calculation.
- `get_agricultural_advisory`: Kisan spraying window suitability and disease risk evaluator.
- `geocode_location`: Indian city and global coordinate geocoding resolver.
- `search_meteorological_knowledge`: RAG domain search.

### 4. RAG Domain Knowledge Retrieval (`ai-service/app/rag/`)
- Curated domain knowledge covering:
  - **IMD 4-Color Warning Codes** (Green, Yellow, Orange, Red) and NDMA Action Protocols.
  - **IMD 4-Stage Cyclone Warning Protocol** & WMO Wind Intensity Scales.
  - **Indian Monsoon Dynamics** (SW/NE Monsoon, Western Disturbances, El Niño/La Niña/IOD).
  - **NDMA Safety Guidelines** (Heatwave hydration thresholds, Lightning 30-30 rule).
  - **Crop Weather Calendars** (Kharif, Rabi, Zaid crop sensitivities & spraying limits).
- In-memory Hybrid BM25/keyword semantic retriever (`knowledge_retriever.py`).

### 5. Native Multilingual Response Generation (`ai-service/app/services/multilingual_service.py`)
- Automatic script detection from Unicode ranges for **11 Indian languages**:
  - English (`en`), Hindi (`hi`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), Gujarati (`gu`), Kannada (`kn`), Malayalam (`ml`), Punjabi (`pa`), Odia (`or`).
- Contextually preserves exact numerical temperatures, rain probabilities, and wind speeds in native phrasing.

### 6. Conversation Context & Anti-Hallucination Guardrails
- **Multi-Turn Memory (`context_manager.py`)**: Sliding-window context tracking resolving pronouns and follow-up turns.
- **Safety Guardrails (`guardrails.py`)**: Pre-flight prompt injection / jailbreak protection, domain boundary verification, post-generation factual consistency checking against tool data, and prohibition against false official warnings.

---

## 🛰️ GIS & Alerts Subsystem (Member 5 Deliverables)

### 1. Spatial Geofencing & Point-in-Polygon Engine (`gis-alerts/src/spatial_geofencing.py`)
- High-precision Ray-Casting 2D Point-in-Polygon (PIP) engine supporting complex Polygons with holes and MultiPolygons.
- Haversine great-circle distance calculator and proximity radius search.

### 2. Official IMD Alert Rules Engine (`gis-alerts/src/alert_rules_engine.py`)
- Standard Operating Procedure (SOP) threshold evaluations for Rainfall (Light $\to$ Extremely Heavy $\ge 204.5\text{ mm}$), Wind Gale/Cyclonic Storms ($\ge 89\text{ km/h}$), and Thermal Extremes (Heatwaves $\ge 40^\circ\text{C}$ & Coldwaves $\le 4^\circ\text{C}$).
- Standard IMD 4-Color Matrix (`Green: No Warning`, `Yellow: Watch`, `Orange: Alert`, `Red: Warning/Emergency`) with sector-specific advisories for citizens, farmers, and fishermen.

### 3. Common Alerting Protocol (CAP 1.2) Generator & Parser (`gis-alerts/src/cap_protocol.py`)
- Two-way WMO / OASIS / NDMA compliant CAP 1.2 XML and JSON serialization/deserialization with spatial polygons and circles.

### 4. Curated India Boundary & Disaster Hazard Layers (`gis-alerts/data/`)
- `india_metropolitan_boundaries.geojson`: 10 reference metropolitan boundaries (Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Hyderabad, Ahmedabad, Guwahati, Bhubaneswar, Srinagar).
- `cyclone_hazard_corridors.geojson`: East Coast (Bay of Bengal) & West Coast (Arabian Sea) storm surge polygons.
- `flood_prone_river_basins.geojson`: Brahmaputra, Lower Gangetic, and Mahanadi river basins.
- `heatwave_vulnerability_zones.geojson`: North-West Arid core & Vidarbha/Telangana heat corridors.

### 5. Multi-Channel Emergency Notification Dispatcher (`gis-alerts/src/notification_dispatcher.py`)
- Targeted disaster alert broadcast simulation across Web Push, SMS, WhatsApp, and Email filtered by spatial geofence containment.

---

## 🔌 API Integration Guide

### 1. AI Service Endpoints (Port 8000)
- `POST /api/v1/agent/query`: Gateway conversational query endpoint (called by `backend/src/services/chatService.js`).
- `POST /api/v1/agent/intent`: Standalone NLU intent and slot extraction.
- `GET /api/v1/agent/tools`: Registered JSON Schema tool definitions.
- `POST /api/v1/rag/search`: RAG domain knowledge search.
- `GET /health` & `GET /ready`: Health check & readiness probes.

### 2. ML Inference & Forecast Endpoints (Port 8000)
- `GET /api/v1/ml/forecast?city=Kolkata`: Live 6-hour ML prediction (temperature, rain probability, rainfall accumulation, composite hazard score).
- `GET /api/v1/ml/consensus?city=Delhi`: NWP Multi-model consensus comparison (ECMWF, GFS, ICON).
- `GET /api/v1/ml/metadata`: Production model metrics, benchmarks, and feature schemas.

### 3. GIS & Alerts Microservice Endpoints (Port 8001)
- `GET /api/v1/gis/layers`: Returns all registered GeoJSON boundary, cyclone, flood basin, and heatwave layers.
- `POST /api/v1/gis/geofence/check`: Evaluates if coordinates fall inside active hazard polygons.
- `POST /api/v1/gis/hazard/evaluate`: Evaluates live meteorological observation metrics against official IMD SOP alert rules.
- `POST /api/v1/gis/cap/generate`: Generates official WMO / NDMA compliant CAP 1.2 XML or JSON bulletins.
- `POST /api/v1/gis/cap/parse`: Parses incoming OASIS CAP 1.2 XML strings into structured JSON.
- `POST /api/v1/gis/notifications/dispatch`: Dispatches multi-channel simulated emergency alerts.
- `GET /api/v1/gis/notifications/history`: Returns recent emergency notification dispatch history.

### 4. Backend Gateway Endpoints (Port 5000)
- `/auth`: `POST /signup`, `POST /login`, `POST /logout`, `GET /me`, `PUT /me`
- `/weather`: `GET /current`, `GET /forecast`, `GET /hourly`, `GET /daily`, `GET /history`, `GET /geocode`
- `/chat` & `/ai`: `POST /`, `POST /chat`, `GET /conversations`, `GET /history/:conversationId`, `DELETE /conversations/:id`
- `/locations`: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`
- `/alerts`: `GET /`, `GET /gis/layers`, `GET /hazard/check`, `GET /stream` (SSE), `GET /nearby`, `POST /cap/ingest`, `GET/POST /preferences`
- `/climate` & `/analytics`: `GET /trends`, `GET /climate`

---

## 🧪 Testing & Verification Commands

```bash
# 1. Test core ML prediction on historical samples across all 10 cities
python test_inference.py

# 2. Test Heat Index, IMD rainfall categories, and composite hazard scoring
python test_risk_engine.py

# 3. Test real-time Open-Meteo telemetry fetching & live 24h lag pipeline
python test_live_pipeline.py

# 4. Test ML FastAPI microservice endpoints
python test_api_server.py

# 5. Test NWP multi-model consensus & anomaly analyzer
python test_nwp_consensus.py

# 6. Test AI/LLM microservice pytest suite (29 tests)
cd ai-service && pytest tests/ -v && cd ..

# 7. Test GIS & Alerts microservice pytest suite (17 tests)
cd gis-alerts && pytest tests/ -v && cd ..

# 8. Test Backend API automated test suite (34 tests)
cd backend && npm test && cd ..
```

---

## 👥 Team Task Status Matrix

| Role | Member | Completed Work | Pending Focus |
| :--- | :--- | :--- | :--- |
| **Frontend Lead** | Member 1 | React/Vite, Tailwind, UI Pages (Chat, Forecast, Alerts, Climate, Maps) | Web Speech voice integration, live SSE stream hook |
| **Backend Lead** | Member 2 | Express, Prisma ORM, JWT Auth, Caching, SSE, REST APIs (34/34 tests passing) | Maintained & stable |
| **AI/LLM Engineer**| Member 3 | FastAPI microservice, NLU, Multi-provider LLM, ReAct Agent, 8 Tools, RAG, 11 Indian Languages, Memory, Guardrails (29/29 tests passing) | Maintained & stable |
| **Weather/ML** | Member 4 | 10-city V3 dataset (1M rows), XGBoost/LightGBM 6h models (MAE 0.96°C, F1 0.67), live 24h lag pipeline, IMD risk engine, NWP consensus analyzer (ECMWF/GFS/ICON), FastAPI microservice (Port 8000) | Production ready & synchronized |
| **GIS & Alerts** | Member 5 | Dedicated `gis-alerts/` package, Ray-Casting PIP engine, GeoJSON layers (Metros, Cyclone corridors, Flood basins, Heat zones), IMD 4-Color hazard rules, CAP 1.2 XML/JSON generator & parser, Notification dispatcher (17/17 tests passing) | Maintained & stable |
| **DevOps & CI/CD** | Member 6 | Docker compose orchestration, test suites | GitHub Actions CI/CD workflows, Frontend Dockerfile, E2E tests |
