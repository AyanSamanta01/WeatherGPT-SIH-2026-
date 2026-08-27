# WeatherGPT — Requirements & Project Tracker

> **Project:** WeatherGPT — Conversational AI for Weather Forecasting, Alerts, and Climate Information  
> **SIH 2026 Problem Statement:** SIH26068  
> **Organization:** Ministry of Earth Sciences (MoES)  
> **Department:** India Meteorological Department (IMD)  
> **Theme:** Disaster Management  
> **Last reviewed:** 2026-08-27

## 1. Purpose

Single source of truth for WeatherGPT functional requirements, non-functional requirements, ML/data requirements, AI/LLM requirements, backend/frontend/GIS requirements, deployment requirements, acceptance criteria, and task tracking.

The repository documentation identifies WeatherGPT as an end-to-end meteorological intelligence and conversational platform integrating historical data, ML forecasting, NWP, hazard detection, disaster warnings, GIS, climate analytics and multilingual conversational AI. 

## 2. Product Goal

WeatherGPT shall provide a unified conversational weather-intelligence platform combining:
- real-time weather observations;
- historical meteorological data;
- ML-based short-term forecasting;
- Numerical Weather Prediction (NWP);
- extreme-weather/hazard detection;
- disaster alerts and early warnings;
- GIS/location intelligence;
- climate analytics;
- multilingual natural-language interaction; and
- voice accessibility.

The system shall distinguish observations, forecasts, model outputs and official warnings.

## 3. System Architecture

```text
React / Mobile UI
       |
       v
Node.js / Express API Gateway
       |
       +------------------+------------------+
       |                  |                  |
       v                  v                  v
Weather Providers     AI/LLM Service     Weather ML
Open-Meteo/IMD/OW     Python FastAPI     Python Models
       |                  |                  |
       +------------------+------------------+
                          |
                    GIS / Alerts
                          |
                          v
                     PostgreSQL
```

Repository components include `frontend/`, `backend/`, `ai-service/`, `gis-alerts/`, `src/`, `models/`, `dataset/`, `Docs/`, `.github/workflows/`, and `docker-compose.yml`.

## 4. Functional Requirements

### FR-01 Current Weather
- [ ] Current weather by city
- [ ] Current weather by coordinates
- [ ] Temperature, precipitation, humidity, pressure, wind and cloud cover
- [ ] Observation timestamp
- [ ] Data-source provenance

### FR-02 Forecasting
- [ ] Hourly forecasts
- [ ] Daily forecasts
- [ ] 6-hour temperature prediction
- [ ] 6-hour rain/no-rain prediction
- [ ] 6-hour rainfall amount prediction
- [ ] Clear observed-vs-predicted presentation

### FR-03 Natural-Language Queries
- [ ] Intent detection
- [ ] Location extraction
- [ ] Time/date extraction
- [ ] Weather-variable extraction
- [ ] Tool routing

### FR-04 Conversational AI
- [ ] Multi-turn conversation
- [ ] Context management
- [ ] Weather-data grounding
- [ ] Tool/function calling
- [ ] Source/provenance support
- [ ] Hallucination safeguards
- [ ] Uncertainty-aware responses

### FR-05 Multilingual
- [ ] English
- [ ] Hindi
- [ ] Bengali
- [ ] Additional configured Indian languages
- [ ] Persistent language preference
- [ ] Preserve weather units and warning severity

### FR-06 Voice
- [ ] Speech-to-text weather queries
- [ ] Voice query processing
- [ ] Text-to-speech where supported
- [ ] Accessibility testing

### FR-07 Location Management
- [ ] Geocoding
- [ ] Coordinate queries
- [ ] Saved locations
- [ ] Default location
- [ ] Location CRUD
- [ ] Location-aware forecast/alerts

### FR-08 Alerts & Disaster Warning
- [ ] Active alerts
- [ ] Hazard threshold evaluation
- [ ] Severity classification
- [ ] Nearby/location-specific alerts
- [ ] GIS alert layers
- [ ] CAP 1.2 ingestion
- [ ] Real-time alert broadcasting
- [ ] Notification preferences

### FR-09 Hazard Engine
- [ ] Heat/thermal-stress indicators
- [ ] Rainfall severity
- [ ] Wind/squall severity
- [ ] Composite risk score
- [ ] Green/Yellow/Orange/Red status
- [ ] Sector-specific advisories

### FR-10 GIS
- [ ] GeoJSON layers
- [ ] Point-in-polygon geofencing
- [ ] Nearby-alert queries
- [ ] Radius/distance queries
- [ ] Interactive hazard map

### FR-11 Climate Analytics
- [ ] Historical weather queries
- [ ] Multi-year trends
- [ ] Climate charts
- [ ] Location/period/variable metadata
- [ ] Historical vs prediction separation

### FR-12 NWP Consensus
- [ ] NWP model integration
- [ ] ECMWF/GFS/ICON comparison where available
- [ ] ML-vs-NWP comparison
- [ ] Consensus/confidence indicator
- [ ] Uncertainty representation

### FR-13 Authentication
- [ ] Signup/login
- [ ] JWT authentication
- [ ] Secure password hashing
- [ ] Profile management
- [ ] Language preference
- [ ] User data isolation

### FR-14 Conversation Management
- [ ] List conversations
- [ ] Retrieve history
- [ ] Delete conversations
- [ ] Bounded conversation context

### FR-15 Data Ingestion
- [ ] Real-time observation ingestion
- [ ] Forecast/NWP ingestion
- [ ] Timestamp/location/unit validation
- [ ] Provider failure handling
- [ ] Historical-data versioning

## 5. Machine Learning Requirements

### ML-01 Dataset

Verified V3 dataset:
- 10 Indian cities
- 1,020,180 master rows
- 102,018 rows/city
- 58 master columns
- 55 model features
- 2015-01-02 through 2026-08-22
- 0 missing values
- 0 duplicate rows
- 0 duplicate location+timestamp records

Cities: Kolkata, Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, Ahmedabad, Guwahati, Bhubaneswar, Srinagar.

- [x] V3 city datasets
- [x] Master dataset
- [x] Dataset validation
- [x] Backup

### ML-02 Temporal Split

| Split | Percentage | Rows/city | Total |
|---|---:|---:|---:|
| Train | 80% | 81,614 | 816,140 |
| Validation | 10% | 10,202 | 102,020 |
| Test | 10% | 10,202 | 102,020 |

- [x] Exact counts verified
- [x] Chronological ordering verified
- [x] Temporal leakage check passed
- [x] Test reserved for final evaluation

### ML-03 Temperature Model

Target: `target_temperature_6h`

- [x] XGBoost regression
- [x] Validation
- [x] Persistence baseline
- [x] Baseline comparison
- [ ] Final test evaluation
- [ ] Final production training
- [ ] Model serialization
- [ ] Inference integration

Current validation: MAE **0.9612 °C**, RMSE **1.3353 °C**. Persistence baseline MAE **3.9761 °C**; MAE improvement **75.83%** and RMSE improvement **73.01%**.

### ML-04 Rain Classifier

Target: `target_rainfall_6h > 0`.

- [x] Binary target
- [x] Class distribution
- [x] XGBoost classifier
- [x] Precision/Recall/F1
- [x] ROC-AUC
- [x] Validation-only threshold optimization
- [x] Threshold selected: **0.60**
- [ ] Final test evaluation
- [ ] Production threshold freeze
- [ ] API integration

At threshold 0.60: Precision **0.5933**, Recall **0.7257**, F1 **0.6528**.

### ML-05 Rainfall Amount

Only actual rain events are supplied to the amount model.

- [x] Zero-rain removal
- [x] Normal LightGBM
- [x] Log-transformed LightGBM
- [x] Validation comparison
- [ ] Heavy-rain evaluation
- [ ] Final test evaluation
- [ ] Production serialization
- [ ] API integration

| Model | MAE | RMSE |
|---|---:|---:|
| Normal LightGBM | 0.9671 mm | 1.8201 mm |
| Log LightGBM | **0.8574 mm** | 1.8461 mm |

Current candidate: **log-transformed LightGBM**, subject to final test and heavy-rain evaluation.

### ML-06 Final Evaluation
- [ ] Temperature test MAE/RMSE
- [ ] Rain classifier Accuracy/Precision/Recall/F1/ROC-AUC
- [ ] Confusion matrix
- [ ] Rain amount MAE/RMSE
- [ ] Per-city evaluation
- [ ] Seasonal/monsoon evaluation
- [ ] Heavy-rain subset evaluation

### ML-07 Model Governance
- [ ] Model version
- [ ] Dataset version
- [ ] Feature schema
- [ ] Training date
- [ ] Validation metrics
- [ ] Test metrics
- [ ] Classification threshold
- [ ] Runtime/library versions
- [ ] Previous production model for rollback

## 6. AI / LLM Requirements

- [ ] Intent classification
- [ ] Slot extraction
- [ ] Weather-data tool calling
- [ ] Grounded answers
- [ ] RAG knowledge base
- [ ] Multilingual generation
- [ ] Conversation context
- [ ] Hallucination prevention
- [ ] Emergency-warning priority
- [ ] Uncertainty-aware generation
- [ ] Safety guardrails

The LLM must not invent current observations, forecasts or official warnings.

## 7. Backend Requirements

- [ ] `/api/v1` API versioning
- [ ] Authentication
- [ ] Weather/forecast/history/climate APIs
- [ ] Alert/GIS APIs
- [ ] Chat APIs
- [ ] Location CRUD
- [ ] Caching
- [ ] Rate limiting
- [ ] Provider fallback
- [ ] Input validation
- [ ] Structured errors
- [ ] Swagger/OpenAPI
- [ ] SSE alert stream

## 8. Frontend Requirements

- [ ] Responsive React UI
- [ ] Chat
- [ ] Current weather
- [ ] Forecast
- [ ] Hourly graph
- [ ] Daily forecast
- [ ] Weather map
- [ ] Alerts
- [ ] Climate analytics
- [ ] Saved locations
- [ ] Settings/language
- [ ] Voice UI
- [ ] Emergency banner
- [ ] Loading/error states
- [ ] Accessibility

## 9. GIS & Alert Requirements

- [ ] Metropolitan boundary GeoJSON
- [ ] Hazard polygons
- [ ] Point-in-polygon
- [ ] Haversine/radius queries
- [ ] IMD severity rules
- [ ] CAP 1.2 parser/generator
- [ ] GeoJSON FeatureCollection
- [ ] Notification dispatcher
- [ ] Alert integration tests

## 10. Database Requirements

The database stores **operational/application data and weather records**. It is **not an automatic model-training loop**.

Store where required:
- [ ] Users
- [ ] Saved locations
- [ ] Conversations/messages
- [ ] Alerts
- [ ] Weather observations
- [ ] Forecast/cache records
- [ ] Data-source metadata
- [ ] Model metadata
- [ ] Audit/operational records

### ML data policy
- [ ] Realtime observations may be stored for history, analytics and future retraining.
- [ ] Live data must **not automatically retrain production models**.
- [ ] Retraining must be explicit and versioned.
- [ ] Retraining must pass validation gates.
- [ ] Production rollback must remain possible.

## 11. Non-Functional Requirements

### NFR-01 Performance
- [ ] Forecast API target approximately ≤2 seconds under normal conditions, excluding unavoidable external-provider latency.
- [ ] Cached requests should be significantly faster.
- [ ] ML inference must not train models.
- [ ] Concurrent requests must not cause unacceptable degradation.

### NFR-02 Availability
- [ ] Target ≥99% monthly production availability.
- [ ] Provider failure must not crash the entire system.
- [ ] Graceful degradation/fallback.

### NFR-03 Reliability
- [ ] Timeouts
- [ ] Controlled retries
- [ ] Provider fallback
- [ ] Input validation
- [ ] Invalid ML features must not silently produce normal predictions

### NFR-04 Data Integrity
- [ ] Timestamp validation
- [ ] Unit/range validation
- [ ] Duplicate detection
- [ ] Missing-feature detection
- [ ] Chronological consistency

### NFR-05 Temporal Integrity
- [ ] No future information leakage
- [ ] Chronological train/validation/test
- [ ] Test set never used for tuning

### NFR-06 Security
- [ ] Secrets never committed
- [ ] HTTPS in production
- [ ] Secure password hashing
- [ ] Secure JWT handling
- [ ] Input validation
- [ ] Dependency vulnerability checks

### NFR-07 Privacy
- [ ] Minimal personal-data collection
- [ ] No passwords/tokens/API keys in logs
- [ ] User data isolation

### NFR-08 Scalability
- [ ] Horizontal backend scaling
- [ ] Additional cities without architectural redesign
- [ ] Growing historical dataset support

### NFR-09 Maintainability
- [ ] Modular services
- [ ] Environment-based configuration
- [ ] API documentation
- [ ] Versioned ML feature schema

### NFR-10 Observability
- [ ] Structured logs
- [ ] API latency monitoring
- [ ] API error monitoring
- [ ] Data-ingestion monitoring
- [ ] ML performance monitoring
- [ ] Critical-failure alerting

### NFR-11 Backup & Recovery
- [ ] Database backups
- [ ] Dataset backups
- [ ] Model backups
- [ ] Rollback model
- [ ] Define RPO/RTO
- [ ] Test restoration

### NFR-12 CI/CD
- [x] CI/CD baseline
- [x] Automated checks
- [ ] ML tests in CI
- [ ] AI-service tests in CI
- [ ] Backend tests in CI
- [ ] Frontend checks in CI
- [ ] Deployment blocked on failed required checks

### NFR-13 Usability
- [ ] Understandable forecast presentation
- [ ] Observed vs predicted distinction
- [ ] Human-readable errors
- [ ] Prominent warnings

### NFR-14 Accessibility
- [ ] Mobile support
- [ ] Readable typography
- [ ] Adequate contrast
- [ ] Keyboard/accessibility support
- [ ] Do not rely on colour alone
- [ ] Voice accessibility

## 12. API Tracking

### Weather
- [ ] `GET /api/v1/weather/current`
- [ ] `GET /api/v1/weather/forecast`
- [ ] `GET /api/v1/weather/hourly`
- [ ] `GET /api/v1/weather/daily`
- [ ] `GET /api/v1/weather/history`
- [ ] `GET /api/v1/weather/geocode`

### Climate
- [ ] `GET /api/v1/climate/trends`
- [ ] `GET /api/v1/analytics/climate`

### Alerts/GIS
- [ ] `GET /api/v1/alerts`
- [ ] `GET /api/v1/alerts/gis/layers`
- [ ] `GET /api/v1/alerts/hazard/check`
- [ ] `GET /api/v1/alerts/nearby`
- [ ] `GET /api/v1/alerts/stream`
- [ ] `POST /api/v1/alerts/cap/ingest`
- [ ] Alert preferences

### Chat
- [ ] `POST /api/v1/chat`
- [ ] `POST /api/v1/ai/chat`
- [ ] Conversation list/history/delete

### Locations
- [ ] List
- [ ] Details
- [ ] Create
- [ ] Update
- [ ] Delete

## 13. Team Tracker

### Member 1 — Frontend
- [ ] React/Vite
- [ ] Responsive UI
- [ ] Chat
- [ ] Weather
- [ ] Forecast
- [ ] Alerts
- [ ] Climate charts
- [ ] Settings
- [ ] Voice
- [ ] API integration
- [ ] Accessibility

### Member 2 — Backend
- [ ] Architecture
- [ ] Authentication
- [ ] REST APIs
- [ ] Weather providers
- [ ] Chat API
- [ ] Locations
- [ ] Alerts
- [ ] Database
- [ ] Caching
- [ ] Rate limiting
- [ ] SSE
- [ ] Integration tests

### Member 3 — AI/LLM
- [ ] NLU
- [ ] Intent classification
- [ ] Tool calling
- [ ] Grounding
- [ ] Prompt engineering
- [ ] RAG
- [ ] Multilingual responses
- [ ] Conversation context
- [ ] Hallucination safeguards

### Member 4 — Weather/ML
- [x] Dataset research
- [x] V3 datasets
- [x] Master dataset
- [x] Data validation
- [x] Temporal split
- [x] Temperature validation
- [x] Persistence baseline
- [x] Rain classifier
- [x] Threshold optimization
- [x] Rainfall preparation
- [x] Normal LightGBM
- [x] Log LightGBM
- [ ] Final test evaluation
- [ ] Final production training
- [ ] Model serialization
- [ ] Feature schema
- [ ] Model metadata
- [ ] Unified inference
- [ ] ML API
- [ ] Per-city/heavy-rain evaluation
- [ ] Model monitoring

### Member 5 — GIS/Alerts
- [ ] Geolocation
- [ ] Maps
- [ ] GeoJSON
- [ ] Hazard visualization
- [ ] Geofencing
- [ ] Alert rules
- [ ] IMD severity
- [ ] Advisories
- [ ] CAP 1.2
- [ ] Notifications
- [ ] Tests

### Member 6 — DevOps/Testing
- [x] Repository structure
- [x] Environment configuration
- [x] Docker
- [x] CI/CD
- [ ] Production deployment
- [ ] Database deployment
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Monitoring
- [ ] Security checks
- [ ] Final integration
- [ ] Rollback procedure

## 14. Milestones

### Phase 1 — Foundation
- [x] Repository
- [x] Architecture
- [x] Team distribution
- [x] CI/CD baseline

### Phase 2 — Data & ML
- [x] V3 datasets
- [x] Master dataset
- [x] Temporal split
- [x] Temperature validation
- [x] Rain classifier
- [x] Rain threshold
- [x] Rainfall model comparison
- [ ] Final test evaluation
- [ ] Production artifacts
- [ ] Inference API

### Phase 3 — Core Platform
- [ ] Backend
- [ ] Database
- [ ] Frontend
- [ ] Weather-provider integration
- [ ] ML integration

### Phase 4 — AI
- [ ] Intent/slot extraction
- [ ] Tool calling
- [ ] Grounding
- [ ] RAG
- [ ] Multilingual support
- [ ] Voice
- [ ] NWP consensus

### Phase 5 — Alerts/GIS
- [ ] Hazard engine
- [ ] GIS
- [ ] Geofencing
- [ ] CAP ingestion
- [ ] SSE broadcasting
- [ ] Notifications

### Phase 6 — Production
- [ ] Security review
- [ ] Load testing
- [ ] E2E testing
- [ ] Monitoring
- [ ] Backup/restore
- [ ] Smoke testing
- [ ] Rollback test

### Phase 7 — SIH Demo
- [ ] End-to-end scenario
- [ ] Multilingual voice demo
- [ ] 6-hour ML forecast
- [ ] Emergency alert demo
- [ ] GIS hazard visualization
- [ ] Climate analytics
- [ ] Accuracy metrics
- [ ] Latency metrics
- [ ] Architecture presentation

## 15. Definition of Done

A feature is **Done** only when:
- [ ] Requirement implemented
- [ ] Tests added/updated
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Security reviewed
- [ ] CI checks pass
- [ ] Realistic-data testing completed
- [ ] No regression
- [ ] Clear Git commit
- [ ] PR reviewed where applicable

A model is **Production Ready** only when:
- [ ] Dataset/version recorded
- [ ] Feature schema recorded
- [ ] Validation completed
- [ ] Test evaluation completed without test-set tuning
- [ ] Threshold frozen
- [ ] Artifact serialized
- [ ] Independent inference test passes
- [ ] Metadata recorded
- [ ] Rollback artifact exists
- [ ] API integration passes

## 16. Critical Safety Rules

1. **Never invent an active weather warning.**
2. **Never suppress a high-severity warning because of a routine request.**
3. **Never present a prediction as an observation.**
4. **Preserve source and issue time for official warnings where available.**
5. **Represent forecast uncertainty honestly.**
6. **Never automatically retrain the production model from a single live observation.**
7. **Never use the held-out test set for threshold tuning or model selection.**
8. **Never silently change the production feature schema.**

## 17. Immediate Next Priorities

1. [ ] Complete final unbiased test evaluation.
2. [ ] Freeze final ML model and threshold choices.
3. [ ] Retrain final production models using train + validation only.
4. [ ] Serialize production model artifacts.
5. [ ] Serialize feature schema and model metadata.
6. [ ] Validate independent inference.
7. [ ] Expose ML predictions through FastAPI.
8. [ ] Integrate ML API with Node backend.
9. [ ] Connect frontend forecast UI.
10. [ ] Finish GIS/alert integration.
11. [ ] Complete E2E and performance testing.
12. [ ] Deploy and smoke test.
13. [ ] Prepare SIH demo and quantitative evidence.

## 18. Traceability Sources

| Source | Used for |
|---|---|
| SIH26068 problem statement | Product scope and SIH objectives |
| Repository `README.md` | Architecture, APIs, technologies and team structure |
| `Docs/CONTEXT.md` | Detailed architecture, ML pipeline, data schema and subsystems |
| `Docs/TEAM_TASKS.md` | Team responsibilities |
| WeatherGPT ML work | Dataset, validation, split and model metrics |

> **Implementation note:** Docker, Kubernetes, FastAPI, Node.js, PostgreSQL, React, XGBoost and LightGBM are implementation choices. Requirements describe the capability the system must provide; implementation technologies can change without changing the underlying requirement.
