# WeatherGPT Backend API Gateway (SIH 2026)

Production-ready Node.js / Express backend with PostgreSQL & Prisma ORM, multi-provider weather abstraction, JWT authentication, Zod validation, rate limiting, and Swagger OpenAPI documentation.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Weather Providers**:
  - 🟢 **Open-Meteo** (*Active Default* — Free real-time observations, 7-day forecast, geocoding & historical climate archive)
  - 🟡 **OpenWeatherMap** (*Supported* — Requires `OPENWEATHER_API_KEY`)
  - 🔵 **IMD / Mausam** (*Planned Integration* — Architectural abstraction in place for future official API gateway)
- **Security & Rate Limiting**: `express-rate-limit` (100 req/15min general, 20 req/15min auth)
- **Validation**: Zod schema validation layer
- **Documentation**: Swagger UI & OpenAPI 3.0 (`/api-docs` & `/api/v1/docs`)
- **Containers**: Docker Compose for PostgreSQL 16 Alpine

---

## 🏛️ Core Database Entities (Prisma Schema)

| Entity | Table Name | Purpose & Key Attributes |
| :--- | :--- | :--- |
| **`User`** | `users` | User accounts (`id`, `name`, `email`, `password_hash`, `preferred_language`, `device_token`, timestamps). |
| **`Location`** | `locations` | User saved geographic places (`id`, `user_id`, `name`, `latitude`, `longitude`, `is_default`). |
| **`WeatherRecord`** | `weather_records` | Timestamped weather observations (`id`, `latitude`, `longitude`, `observed_at`, `temperature`, `humidity`, `pressure`, `wind_speed`, `rainfall`, `source`, `raw_payload`). |
| **`Forecast`** | `forecasts` | Predictive meteorological data (`id`, `latitude`, `longitude`, `forecast_time`, `temperature`, `rainfall_probability`, `precipitation`, `wind_speed`, `source`, `model`). |
| **`Alert`** | `alerts` | Weather disaster alerts & warnings (`id`, `location_name`, `latitude`, `longitude`, `radius_km`, `severity`, `alert_type`, `title`, `description`, `valid_from`, `valid_until`, `source`). |
| **`ChatMessage`** | `chat_messages` | Full natural language chat history with AI reasoning metadata (`id`, `user_id`, `conversation_id`, `role`, `content`, `intent`, `language`, `sources`, `risk_level`). |
| **`AlertPreference`** | `alert_preferences` | User notification preferences for alerts (`id`, `user_id`, `location_id`, `alert_types`, `notification_channels`, `device_token`, `enabled`). |

---

## 🚀 Quick Start & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

### 3. Spin Up PostgreSQL (Docker)
```bash
docker compose up -d
```

### 4. Run Prisma Database Migrations & Seeds
Use **Prisma Migrations** to synchronize your PostgreSQL database schema:
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations (Creates database tables & tracking history)
npm run prisma:migrate

# Seed demo user, saved locations, and sample alerts
npm run prisma:seed
```

### 5. Inspect Database with Prisma Studio
Open the visual Prisma Studio GUI in your browser:
```bash
npm run prisma:studio
```
👉 Available at: **[http://localhost:5555](http://localhost:5555)**

### 6. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

---

## 🩺 Health & Readiness Checks

* **Liveness Probe**: `GET /health` — Verifies HTTP server is up.
* **Readiness Probe**: `GET /ready` — Verifies server state, weather provider status, and PostgreSQL database connectivity.

---

## 📖 API Documentation & Swagger

* **Interactive Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
* **Alternative Swagger Route**: [http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)

---

## 📡 API Specification (`/api/v1`)

### Authentication (Rate Limited: 20 req/15min)
* `POST /api/v1/auth/signup` — Register new user
* `POST /api/v1/auth/login` — Login user (returns JWT token)
* `POST /api/v1/auth/logout` — Logout user
* `GET  /api/v1/auth/me` — Get current profile (*Protected: `Authorization: Bearer <token>`*)

### Weather
* `GET /api/v1/weather/current?lat={lat}&lon={lon}&units={metric|imperial}` — Live weather observation
* `GET /api/v1/weather/forecast?lat={lat}&lon={lon}&days={7}` — Multi-day forecast
* `GET /api/v1/weather/history?lat={lat}&lon={lon}&from={YYYY-MM-DD}&to={YYYY-MM-DD}` — Historical weather
* `GET /api/v1/weather/geocode?q={cityName}` — Geocode search

### AI Chat Grounding
* `POST /api/v1/chat` — Process natural language query grounded in verified weather data
  ```json
  {
    "message": "Will it rain tomorrow in Mumbai?",
    "latitude": 19.076,
    "longitude": 72.877,
    "language": "en"
  }
  ```

### Alerts
* `GET  /api/v1/alerts` — Active weather alerts
* `GET  /api/v1/alerts/nearby?lat={lat}&lon={lon}&radiusKm={100}` — Alerts nearby coordinates
* `POST /api/v1/alerts` — Create alert
* `GET  /api/v1/alerts/preferences` — Get user alert settings (*Protected*)
* `POST /api/v1/alerts/preferences` — Update user alert settings (*Protected*)

### Saved Locations
* `GET    /api/v1/locations` — List user saved locations (*Protected*)
* `POST   /api/v1/locations` — Add location (*Protected*)
* `DELETE /api/v1/locations/:id` — Delete location (*Protected*)

### Climate
* `GET /api/v1/climate/trends?lat={lat}&lon={lon}&years={10}` — Multi-year temperature & rainfall trends

---

## 🧪 Running Automated Tests

```bash
npm test
```
