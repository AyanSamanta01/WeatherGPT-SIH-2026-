# PR: Production WeatherGPT ML Pipeline, Hazard Risk Engine & AI Microservice

## 📌 Summary of Changes

This Pull Request delivers the complete **Member 4 (Weather/ML Engineer)** subsystem for the WeatherGPT platform. It provides production-ready 6-hour machine learning forecasting models trained on over 1 million historical meteorological records across 10 Indian cities, an IMD/WMO-aligned extreme hazard and thermal stress risk engine, a real-time live telemetry data pipeline, and a FastAPI microservice on Port 8000 for seamless integration with the Node.js backend and LLM layer.

---

## 🚀 Key Features & Deliverables

### 1. Production Machine Learning Models (`models/`)
Trained on the **Master V3 Dataset** (1,020,180 rows, 10 Indian cities) using strict chronological temporal partitioning (80% train / 10% val / 10% test) with zero test set leakage:
- **6-Hour Temperature Regressor (XGBoost)**:
  - Final Test MAE: **`0.9612 °C`** | Test RMSE: **`1.3031 °C`**
  - **`73.69% improvement`** over the persistence baseline (3.6528 °C).
- **6-Hour Rain / No-Rain Binary Classifier (XGBoost)**:
  - Validation-optimized decision threshold: **`0.65`** (maximizing F1).
  - Final Test F1: **`0.6674`** | ROC-AUC: **`0.9004`** | Accuracy: **`0.8418`**.
- **6-Hour Rainfall Amount Regressor (LightGBM on Rain Events > 0)**:
  - Trained on log1p-transformed target with inverse expm1 transformation and zero-clipping.
  - Final Test MAE: **`0.7916 mm`** | Test RMSE: **`1.7665 mm`** across 22,959 positive rain test events.
- **Model Metadata & Schema**:
  - Saved in `models/model_metadata.json` (complete validation & test breakdown for all 10 cities) and `models/feature_columns.json` (64 aligned features).

### 2. Extreme-Weather & Hazard Risk Engine (`src/weathergpt_risk_engine.py`)
- **NOAA / IMD Heat Index**: Rothfusz polynomial regression equation with relative humidity adjustments (`Normal`, `Caution`, `Extreme Caution`, `Danger`, `Extreme Danger`).
- **Thom's Discomfort Index (DI)**: Thermal comfort scaling for outdoor workers and public advisories.
- **IMD Rainfall Severity**: Standard IMD brackets (`No Rain`, `Very Light`, `Light`, `Moderate`, `Rather Heavy`, `Heavy`, `Very Heavy`, `Extremely Heavy`).
- **Wind Speed & Squall Scale**: Beaufort / IMD gale brackets (`Calm/Light`, `Moderate`, `Strong Breeze`, `Gale/Squall`, `Cyclonic Storm`).
- **Multi-Hazard Composite Risk Score**: Continuous $0-100$ score, risk level (`LOW`, `MODERATE`, `HIGH`, `SEVERE`), IMD 4-Color Codes (`Green`, `Yellow`, `Orange`, `Red`), and actionable natural-language advisories.

### 3. Real-Time Live Telemetry Pipeline (`src/weathergpt_live_features.py`)
- Ingests the past 48 hours of hourly weather observations in real-time from Open-Meteo for any Indian city or `(lat, lon)` coordinate.
- Dynamically computes trigonometric time encodings (`hour_sin/cos`, `day_sin/cos`), wind direction vectors (`sin/cos`), and all multi-horizon lags (`1h`, `3h`, `6h`, `12h`, `24h`) on the fly.
- Feeds live feature vectors into `weathergpt_predict()` for zero-latency 6-hour forecast generation.

### 4. FastAPI AI & ML Microservice on Port 8000 (`src/api.py`)
Exposes asynchronous REST API endpoints directly consumed by the Node.js backend:
- `POST /api/v1/agent/query`: Multilingual grounded reasoning endpoint called by `backend/src/services/chatService.js` (via `AI_SERVICE_URL = http://localhost:8000`).
- `GET /api/v1/ml/forecast?city={city}`: Live 6h ML forecast + hazard indicators.
- `POST /api/v1/ml/predict`: Raw batch feature vector prediction.
- `GET /api/v1/ml/metadata`: Model metadata, benchmarks, and city breakdown metrics.
- `GET /api/v1/ml/cities`: List of supported Indian cities with geographic coordinates.
- `GET /api/v1/health`: System health and model readiness check.

---

## 📊 City-Wise Final Test Evaluation Breakdown

| City | Total Samples | Temp MAE (°C) | Temp RMSE (°C) | Rain F1 | Rain ROC-AUC | Rain Events | Rain Amount MAE (mm) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kolkata** | 10,202 | 0.9827 | 1.3134 | 0.7028 | 0.9025 | 2,662 | 0.9828 |
| **Delhi** | 10,202 | 1.1496 | 1.5308 | 0.5308 | 0.8818 | 1,413 | 0.7866 |
| **Mumbai** | 10,202 | 0.6910 | 0.8941 | 0.8629 | 0.9592 | 3,795 | 0.6804 |
| **Chennai** | 10,202 | 0.8192 | 1.1075 | 0.4994 | 0.8228 | 1,970 | 0.8444 |
| **Bengaluru** | 10,202 | 0.8007 | 1.0809 | 0.6197 | 0.8813 | 2,170 | 0.4735 |
| **Hyderabad** | 10,202 | 1.1179 | 1.4635 | 0.5876 | 0.8907 | 1,790 | 0.4695 |
| **Ahmedabad** | 10,202 | 1.2172 | 1.5815 | 0.6350 | 0.9119 | 1,704 | 0.7458 |
| **Guwahati** | 10,202 | 0.7979 | 1.0813 | 0.6681 | 0.8357 | 3,336 | 0.8972 |
| **Bhubaneswar** | 10,202 | 0.7601 | 1.0504 | 0.7256 | 0.9218 | 2,583 | 1.1523 |
| **Srinagar** | 10,202 | 1.2761 | 1.6739 | 0.5233 | 0.8679 | 1,536 | 0.7117 |

---

## 🧪 Verification & Automated Test Results

All 4 test suites pass with 100% assertions:
- `python test_inference.py` — PASSED (Single & batch prediction verification)
- `python test_risk_engine.py` — PASSED (Heat index, flood brackets, wind scales, composite scoring)
- `python test_live_pipeline.py` — PASSED (Live Open-Meteo ingestion, 24h dynamic lag construction)
- `python test_api_server.py` — PASSED (FastAPI endpoints, multilingual query reasoning)

---

## 👥 Integration Steps for Team Members

1. **Member 2 (Backend)**: Set `AI_SERVICE_URL=http://localhost:8000` in `.env` so `chatService.js` routes natural language chat queries to the Python microservice.
2. **Member 3 (AI/LLM)**: Tool-call `GET /api/v1/ml/forecast` and `POST /api/v1/agent/query` for verified weather-grounded tool executions.
3. **Member 1 (Frontend)**: Test Chat, Forecast, and Hazard Alerts in the React UI against backend endpoints.
4. **Member 5 (GIS/Alerts)**: GeoJSON layers and IMD 4-Color codes ready for Mapbox/Leaflet rendering.
