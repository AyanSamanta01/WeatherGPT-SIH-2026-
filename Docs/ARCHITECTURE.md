# WeatherGPT Architecture

## High-Level Flow

```text
User
  |
  v
React / Mobile UI
  |
  v
API Gateway / Backend
  |
  +------------------+------------------+------------------+
  |                  |                  |                  |
  v                  v                  v                  v
AI/LLM Service   Weather Service    Alert Engine       GIS Service
  |                  |                  |                  |
  |                  v                  v                  v
  |             Weather/NWP Data   Risk Rules        Maps/Geo Data
  |
  v
Tool Calling / Retrieval
  |
  v
Trusted Weather Data

                    |
                    v
              PostgreSQL/MongoDB
                    |
                    v
             Notifications/Voice
```

## Main Components

### 1. Frontend
Provides chat, forecast, maps, alerts, climate analytics, settings, and accessibility features.

### 2. Backend
Handles authentication, API orchestration, user locations, weather requests, chat requests, alerts, and database access.

### 3. AI/LLM Service
Converts natural-language questions into structured requests, calls trusted tools/APIs, and generates contextual answers.

### 4. Weather/ML Service
Processes forecast and historical weather data and provides derived indicators or ML-based risk scores.

### 5. GIS & Alert Service
Combines location and weather information to visualize hazards and generate location-specific warnings.

### 6. Database
Stores users, saved locations, alert preferences, chat history, weather metadata, and derived analytics.

### 7. DevOps
Provides containerization, CI/CD, logging, monitoring, testing, and deployment.
