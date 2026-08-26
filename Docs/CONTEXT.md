# WeatherGPT: AI Context & Project Guide

**Target Audience:** AI/LLM Models & Team Developers | **Purpose:** Complete project context, architecture & sync guide | **Last Updated:** August 2026

---

## 🎯 Executive Summary

**WeatherGPT** is an end-to-end meteorological intelligence and conversational platform designed for SIH 2026. It integrates historical meteorological datasets, machine learning forecasting models, extreme hazard detection engines, and disaster warning systems into an accessible, multilingual natural language interface for 10 major Indian cities.

**10 Supported Metropolitan Regions:**
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

```
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
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (HTTP: http://localhost:8000)
┌──────────────────────────────────────v──────────────────────────────────────┐
│              WEATHER-ML & AI MICROSERVICE (Python FastAPI on Port 8000)     │
│   • 6-Hour Temperature Regressor (XGBoost | Test MAE: 0.96 °C)              │
│   • 6-Hour Rain / No-Rain Classifier (XGBoost @ 0.65 th | Test F1: 0.67)    │
│   • 6-Hour Rainfall Amount Regressor (LightGBM on rain > 0 | MAE: 0.79 mm)  │
│   • Meteorological Risk & IMD Hazard Engine (Heat Index, Discomfort, Wind)  │
│   • Real-Time Live Open-Meteo Feature Ingestion & Dynamic 24h Lags          │
│   • Natural Language Reasoning Endpoint (POST /api/v1/agent/query)          │
│   • Accessible via: http://localhost:8000                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Monorepo Structure

```
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
│   └── api.py                                # FastAPI Microservice (Port 8000)
│
├── train_pipeline.py                          # 13-stage reproducible ML training pipeline
├── test_inference.py                          # ML model prediction unit tests
├── test_risk_engine.py                        # Risk & hazard engine unit tests
├── test_live_pipeline.py                      # Live Open-Meteo data pipeline tests
├── test_api_server.py                         # FastAPI endpoint integration tests
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
│   └── server.js
│
├── frontend/                                  # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/layout/                # Navbar, Sidebar, Weather Cards
│   │   ├── pages/                            # ChatPage, ForecastPage, AlertsPage, Maps
│   │   └── services/api.js                   # Client REST API connector
│   └── vite.config.js
│
└── Docs/                                      # Project Documentation & Specifications
    ├── CONTEXT.md                             # THIS FILE
    ├── TEAM_TASKS.md                          # Role-based task tracking
    ├── ARCHITECTURE.md                        # System architecture
    ├── API.md                                 # Backend REST API reference
    └── ALERTS_GIS.md                          # GIS & hazard design
```

---

## 🤖 Weather-ML & AI Subsystem (Member 4 Deliverables)

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

---

## 🔌 API Integration Guide for Teammates

### For Member 2 (Backend Lead) & Member 3 (AI/LLM Engineer)

Start the Python AI/ML microservice:
```bash
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000
```

#### 1. Natural Language Agent Query (Called by `backend/src/services/chatService.js`)
- **Route**: `POST http://localhost:8000/api/v1/agent/query`
- **Request Body**:
  ```json
  {
    "message": "Will it rain in Mumbai in the next 6 hours?",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "city": "Mumbai",
    "language": "en"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "In Mumbai over the next 6 hours, our ML models predict a 95.4% probability of rain with an expected accumulation of approximately 0.2 mm. Predicted temperature is 26.0°C. Normal weather conditions expected.",
    "location": "Mumbai",
    "sources": [
      "WeatherGPT 6h XGBoost Temperature Regressor",
      "WeatherGPT Rain Classifier (F1: 0.67, AUC: 0.90)",
      "WeatherGPT Rainfall Amount LightGBM Regressor",
      "Open-Meteo Live Telemetry API",
      "IMD Risk & Hazard Engine"
    ],
    "risk": "low",
    "forecast": {
      "temperature_c": 25.99,
      "rain_probability": 0.954,
      "rain_predicted": true,
      "rainfall_mm": 0.24,
      "target_time": "2026-08-27 05:00:00"
    },
    "risk_assessment": {
      "composite_risk_score": 22,
      "risk_level": "LOW",
      "alert_severity": "INFO",
      "imd_color_code": {
        "level": "Green",
        "name": "NO WARNING (Normal)"
      },
      "advisories": ["Normal weather conditions expected over the 6-hour forecast horizon."]
    }
  }
  ```

#### 2. Direct Live 6-Hour Forecast & Hazard Endpoint
- **Route**: `GET http://localhost:8000/api/v1/ml/forecast?city=Kolkata`
- **Query Params**: `?city=Kolkata` or `?lat=22.57&lon=88.36`

#### 3. Model Metadata & Benchmarks
- **Route**: `GET http://localhost:8000/api/v1/ml/metadata`

---

## 🧪 Testing & Verification Commands

Every component has a dedicated automated test suite:

```bash
# 1. Test core ML prediction on historical samples across all 10 cities
python test_inference.py

# 2. Test Heat Index, IMD rainfall categories, and composite hazard scoring
python test_risk_engine.py

# 3. Test real-time Open-Meteo telemetry fetching & live 24h lag pipeline
python test_live_pipeline.py

# 4. Test FastAPI microservice endpoints (Port 8000)
python test_api_server.py
```

---

## 👥 Team Synchronization Checklist

- [x] **Member 4 (Weather/ML)**: Models trained, evaluated, risk engine built, live feature pipeline connected, FastAPI server operational on port 8000.
- [ ] **Member 2 (Backend)**: Ensure `AI_SERVICE_URL=http://localhost:8000` is set in `.env` so `chatService.js` routes to the Python service.
- [ ] **Member 3 (AI/LLM)**: Tool definitions in LLM agent can now tool-call `GET /api/v1/ml/forecast` or `POST /api/v1/agent/query`.
- [ ] **Member 1 (Frontend)**: Test Chat, Forecast, and Hazard Alerts in React UI against backend endpoints.
- [ ] **Member 5 (GIS/Alerts)**: GeoJSON layers and IMD 4-Color codes ready for Mapbox/Leaflet visualization.