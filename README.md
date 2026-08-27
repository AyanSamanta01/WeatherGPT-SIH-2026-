# WeatherGPT 🌦️
### Conversational AI for Weather Forecasting, Alerts, and Climate Information
**SIH 2026 Problem Statement ID:** `26068`  
**Organization:** Ministry of Earth Sciences (MoES) | **Department:** India Meteorological Department (IMD)   
**Theme:** Disaster Management

> 📢 **PPT Presentation Kit:** See [FEATURES_README.md](file:///c:/Users/ms673/OneDrive/Desktop/github/WeatherGPT-SIH-2026-/FEATURES_README.md) for the complete slide-by-slide deck, speaker notes, benchmarks, and demo script for SIH 2026 presentations.

---

## 📌 Problem Overview
Weather information in India is often distributed across disconnected portals, bulletins, satellite products, and forecast models. This makes it difficult for common citizens, farmers, researchers, and disaster managers to quickly obtain actionable, contextual insights.

**WeatherGPT** is an AI-powered conversational platform that bridges meteorological datasets, NWP forecasting models, and disaster warning systems to deliver accurate, localized, real-time weather intelligence and emergency alerts in natural language.

---

## 🏗️ Architecture

```
                       React / Mobile UI (Member 1)
                                   │
                                   ▼  (HTTP REST + SSE EventSource)
        ┌────────────────────────────────────────────────────────┐
        │               WeatherGPT Backend Gateway               │
        │  (Node.js / Express, Auth, Rate-Limiting, Cache, SSE)   │
        └──────┬───────────────┬─────────────────┬───────────────┘
               │               │                 │
               ▼               ▼                 ▼
         Weather APIs    AI Microservice   Prisma PostgreSQL
        (Open-Meteo,     (Python FastAPI/  (Users, Locations,
         IMD, OW)         LLM Orchestrator) Alerts, Records)
```

---

## 🚀 Key Features

- **Multi-Source Weather Engine**: Real-time observations, 7-day NWP forecasts, multi-year historical archives, and geocoding via Open-Meteo, OpenWeather, and IMD providers.
- **In-Memory TTL Caching**: High-performance caching layer (<5ms response time) protecting against external rate limits.
- **Meteorological Hazard Engine**: Evaluates live weather against official IMD extreme weather thresholds (Heavy rainfall ≥64.5mm, Squalls ≥45km/h, Heatwaves ≥40°C/45°C) and generates agro-meteorological advisories.
- **GIS & Spatial Geofencing**: Point-in-Polygon spatial containment algorithms, GeoJSON `FeatureCollection` layers with IMD 4-color status (`Green`, `Yellow`, `Orange`, `Red`), and Common Alerting Protocol (CAP 1.2) disaster ingestion.
- **Real-Time Disaster Broadcasting (SSE)**: Server-Sent Events live stream (`GET /api/v1/alerts/stream`) to push instant disaster warnings and sirens to connected clients.
- **AI Microservice Gateway**: HTTP bridge forwarding queries to the Python LLM service with zero-downtime fallback to local grounded meteorological reasoning.
- **Conversation & Session Management**: Multi-turn chat threading, message history retrieval, and auto-generated titles.
- **User & Location Management**: JWT authentication with bcrypt hashing, multilingual language preference, and saved location CRUD with default location switching.
- **Interactive OpenAPI / Swagger Documentation**: Live API test bench available at `/api-docs`.

---

## 📡 API Reference Summary

All endpoints are versioned under `/api/v1`:

### 🔐 Authentication & Profile
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register new user with language & deviceToken |
| `POST` | `/api/v1/auth/login` | Login and receive JWT access token |
| `POST` | `/api/v1/auth/logout` | Stateless logout |
| `GET` | `/api/v1/auth/me` | Get authenticated user profile |
| `PUT` | `/api/v1/auth/me` | Update profile, preferred language, or password |

### 🌤️ Weather & Climate
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/weather/current` | Real-time observation by coordinates or city name (`?city=Mumbai`) |
| `GET` | `/api/v1/weather/forecast` | Multi-day NWP forecast & precipitation probability |
| `GET` | `/api/v1/weather/hourly` | 3-hourly forecast breakdown for graphs/cards |
| `GET` | `/api/v1/weather/daily` | 7-day daily forecast summary |
| `GET` | `/api/v1/weather/history` | Historical weather records |
| `GET` | `/api/v1/weather/geocode` | Geocode city name to coordinates |
| `GET` | `/api/v1/climate/trends` | Multi-year climate archive aggregation |
| `GET` | `/api/v1/analytics/climate` | Climate analytics alias for frontend charts |

### 🚨 Alerts & GIS
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/alerts` | Active weather & disaster alerts |
| `GET` | `/api/v1/alerts/gis/layers` | GeoJSON FeatureCollection for Map rendering |
| `GET` | `/api/v1/alerts/hazard/check` | Real-time IMD hazard & color-code evaluation |
| `GET` | `/api/v1/alerts/nearby` | Spatial Point-in-Polygon & radius alert query |
| `GET` | `/api/v1/alerts/stream` | **Real-time SSE live disaster stream** |
| `POST` | `/api/v1/alerts/cap/ingest` | Ingest official CAP 1.2 / NDMA disaster bulletins |
| `GET/POST` | `/api/v1/alerts/preferences` | Manage user alert subscriptions & channels |

### 💬 Conversational AI
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/chat` | Natural language weather chat query (`message` or `prompt`) |
| `POST` | `/api/v1/ai/chat` | AI chat alias returning `replyText`, `sources`, `weatherCard` |
| `GET` | `/api/v1/chat/conversations` | List conversation threads |
| `GET` | `/api/v1/chat/history/:id` | Chronological message history |
| `DELETE` | `/api/v1/chat/conversations/:id`| Delete conversation thread |

### 📍 Locations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/locations` | List user's saved locations |
| `GET` | `/api/v1/locations/:id` | Get single saved location |
| `POST` | `/api/v1/locations` | Save new location |
| `PUT` | `/api/v1/locations/:id` | Update location or set as default |
| `DELETE` | `/api/v1/locations/:id` | Delete saved location |

---

## 🧪 Quick Start & Verification

### 1. Installation
```bash
cd backend
npm install
```

### 2. Run Database Migrations (Optional / Local Dev)
```bash
npx prisma db push
npx prisma db seed
```

### 3. Run Automated Test Suite
```bash
npm test
```
*Expected Result:* **34 Passed, 0 Failed.**


### 4. Start Development Server
```bash
npm run dev
```
- API Base URL: `http://localhost:5000`
- Interactive Swagger UI: `http://localhost:5000/api-docs`

---

## 👥 Team Distribution (SIH 2026)
- **Member 1**: Frontend Lead (React, UI/UX, Voice, Maps)
- **Member 2**: Backend Lead (Express, REST APIs, Auth, Caching, SSE, GIS, DB)
- **Member 3**: AI/LLM Engineer (FastAPI, LangChain, RAG, Prompt Engineering)
- **Member 4**: Weather/ML Engineer (NWP Processing, ML Models)
- **Member 5**: GIS & Alert Engineer (GeoJSON Layers, Geofencing)
- **Member 6**: DevOps, Integration & Testing (Docker, CI/CD, Testing)
