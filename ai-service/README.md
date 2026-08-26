# WeatherGPT AI/LLM Microservice (Member 3 — AI/LLM Engineer)

Agentic Natural-Language Weather Intelligence, RAG Retrieval, Multilingual Reasoning, and Guardrails for SIH 2026.

---

## 🌟 Capabilities & Features

1. **Natural-Language Query Understanding (NLU)**:
   - Full intent taxonomy (`current_weather`, `forecast_short_term`, `forecast_extended`, `alert_check`, `climate_trend`, `agri_advisory`, `outdoor_activity`, `meteorological_explanation`).
   - Slot & entity extraction for Indian cities, taluks, coordinates, temporal horizons, and target sectors (Farmers, Fishermen, Commuters).

2. **Universal Multi-Provider LLM Integration**:
   - **Google Gemini** (`gemini-2.0-flash`, `gemini-1.5-pro`)
   - **OpenAI / OpenRouter** (`gpt-4o`, `gpt-4o-mini`)
   - **Anthropic Claude** (`claude-3-5-sonnet`)
   - **Ollama / Local LLM** (`llama3:8b`, `mistral`)
   - **High-Fidelity Deterministic Fallback Engine**: Guarantees 100% uptime, immediate test passing, and operational resilience even in zero-key or offline environments.

3. **Autonomous ReAct Agent & Tool/Function Calling**:
   - `get_current_weather`: Live observation fetcher (temperature, humidity, wind, rainfall).
   - `get_weather_forecast`: Multi-model NWP forecast fetcher.
   - `get_active_alerts`: IMD / NDMA CAP 1.2 disaster warnings.
   - `get_climate_trends`: Historical climate anomalies and multi-year precipitation comparisons.
   - `calculate_biometeorology`: Heat Index (NOAA regression) and Wet-Bulb temperature.
   - `get_agricultural_advisory`: Agrochemical spraying windows and crop disease risk evaluators.
   - `geocode_location`: Comprehensive Indian city and global coordinate resolver.

4. **Factual Grounding & WeatherCard Assembly**:
   - Strict citation of numerical data sources with confidence scores and risk indicators (`low`, `moderate`, `high`, `extreme`).
   - Generates structured `WeatherCard` payloads with all meteorological variables for React UI cards.

5. **RAG (Retrieval-Augmented Generation)**:
   - Curated domain knowledge base over IMD Cyclone Warning 4-stage protocols, 4-color warning codes (Green, Yellow, Orange, Red), Indian Monsoon dynamics (SW/NE Monsoon, Western Disturbances, El Niño/La Niña/IOD), NDMA heatwave/lightning guidelines, and agricultural crop calendars.

6. **Native Multilingual Response Generation**:
   - Auto-detects and generates grounded weather advisories in 11 Indian languages: English (`en`), Hindi (`hi`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), Gujarati (`gu`), Kannada (`kn`), Malayalam (`ml`), Punjabi (`pa`), and Odia (`or`).

7. **Multi-Turn Conversation Memory**:
   - Sliding-window context tracking resolving pronouns and follow-up turns (e.g., Turn 1: *"How is the weather in Jaipur?"* -> Turn 2: *"What about tomorrow?"* -> Turn 3: *"Will I need an umbrella there?"*).

8. **Hallucination Safeguards & Guardrails**:
   - Pre-flight prompt injection / jailbreak filters.
   - Domain boundary redirection.
   - Post-generation factual consistency verification (ensuring reported numbers match retrieved tool data).
   - Strict prohibition on generating false official disaster alarms.

---

## 🚀 Running the AI Microservice

### 1. Installation
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Configuration
Copy `.env.example` to `.env` and configure your preferred provider:
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger documentation is available at:
`http://localhost:8000/docs`

---

## 🧪 Running Automated Tests

Run the complete test suite:
```bash
pytest tests/ -v
```

---

## 📡 API Endpoints

- `POST /api/v1/agent/query`: Primary gateway endpoint called by Backend `chatService.js`.
- `POST /api/v1/agent/intent`: Standalone NLU intent and entity extraction.
- `GET /api/v1/agent/tools`: Registered JSON Schema function definitions for LLM tool calling.
- `POST /api/v1/rag/search`: Query meteorological RAG domain knowledge base.
- `GET /health` & `GET /ready`: Health check probes.
