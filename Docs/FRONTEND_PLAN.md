# WeatherGPT: Frontend Engineering & Integration Plan 📱

**Target Audience:** Frontend Lead (Member 1) & Full-Stack Contributors  
**Problem Statement ID:** `26068` (MoES / IMD - Disaster Management)  
**Status:** Ready for Execution  

---

## 🎯 Executive Summary
The goal of the **Frontend Lead** is to deliver a fast, modern, multilingual, voice-enabled, and GIS-powered web/mobile application for **WeatherGPT**. The frontend connects to the Node.js API Gateway, displays live NWP forecast models, streams real-time disaster warnings via Server-Sent Events (SSE), and enables natural-language interactions for farmers, disaster managers, and common citizens.

---

## 🗺️ System API Mapping Matrix

| Page / Component | Frontend Route / Action | Backend REST API Endpoint |
| :--- | :--- | :--- |
| **💬 Chat Interface** | `ChatPage.jsx` | `POST /api/v1/chat` or `POST /api/v1/ai/chat` |
| **📂 Chat Threads** | Sidebar History Drawer | `GET /api/v1/chat/conversations` |
| **📜 Message History** | Load Conversation | `GET /api/v1/chat/history/:conversationId` |
| **🗑️ Delete Thread** | Remove Conversation | `DELETE /api/v1/chat/conversations/:conversationId` |
| **🌤️ Current Weather** | `CurrentWeatherPage.jsx` | `GET /api/v1/weather/current?city=Mumbai` |
| **📊 Hourly Forecast** | 3-Hourly Graph | `GET /api/v1/weather/hourly?city=Mumbai` |
| **📅 7-Day Forecast** | `ForecastPage.jsx` | `GET /api/v1/weather/daily?city=Mumbai` |
| **🔍 Search & Geocode** | City Auto-Complete | `GET /api/v1/weather/geocode?q=Kolkata` |
| **🗺️ GIS Hazard Map** | `WeatherMapPage.jsx` | `GET /api/v1/alerts/gis/layers` (GeoJSON) |
| **🎯 Coordinate Hazard** | Click on Map | `GET /api/v1/alerts/hazard/check?lat=20.5&lon=85.8` |
| **🚨 Active Alerts** | `AlertsPage.jsx` | `GET /api/v1/alerts` |
| **⚡ Live Alert Stream** | Top Emergency Siren | `GET /api/v1/alerts/stream` (SSE EventSource) |
| **🔔 Alert Preferences** | Channel Subscriptions | `GET /api/v1/alerts/preferences` & `POST` |
| **📈 Climate Trends** | `AnalyticsPage.jsx` | `GET /api/v1/analytics/climate?lat=22.57&lon=88.36` |
| **🔐 User Login/Signup** | `AuthPage.jsx` | `POST /api/v1/auth/signup` & `/login` |
| **👤 Profile & Language** | `SettingsPage.jsx` | `GET /api/v1/auth/me` & `PUT /api/v1/auth/me` |
| **📍 Saved Locations** | Favorites List | `GET /api/v1/locations` & `POST /api/v1/locations` |

---

## 🔍 Frontend Codebase Audit

```
frontend/
├── index.html                   # HTML5 Entry point
├── package.json                 # React 18, Vite 6, Tailwind CSS, Leaflet, Recharts, Lucide
├── src/
│   ├── App.jsx                  # Main screen shell & navigation switcher
│   ├── context/AppContext.jsx   # Global state: selectedCity, weatherData, user, voice
│   ├── services/api.js          # Axios client with interceptors
│   ├── data/mockData.js         # Offline fallback data & mock templates
│   ├── components/
│   │   ├── layout/Navbar.jsx    # City switcher, language dropdown, profile
│   │   └── layout/Sidebar.jsx   # Screen routing sidebar
│   └── pages/
│       ├── ChatPage.jsx         # Conversational UI with STT/TTS
│       ├── CurrentWeatherPage.jsx # Live weather cards & telemetry
│       ├── ForecastPage.jsx     # 7-day NWP forecast breakdown
│       ├── WeatherMapPage.jsx   # React-Leaflet GIS disaster map
│       ├── AlertsPage.jsx       # CAP 1.2 disaster bulletin feed
│       ├── AnalyticsPage.jsx    # Recharts decadal climate trends
│       ├── SettingsPage.jsx     # User preferences & saved locations
│       └── AuthPage.jsx         # Sign-in & sign-up forms
```

---

## 🛠️ Step-by-Step Implementation Roadmap

### 📦 Milestone 1: Live API Client & App Context
**Goal:** Transition from offline mock datasets to live Node.js backend endpoints.

1. **Configure `api.js`**:
   - Ensure `API_BASE_URL` is set to `http://localhost:5000/api/v1`.
   - Attach stored JWT tokens to all requests via `axios` interceptors.
2. **Update `AppContext.jsx`**:
   - On initial load or city switch, trigger `weatherService.getCurrentWeather(selectedCity)`.
   - Store real telemetry (temperature, feelsLike, humidity, wind, pressure, condition, UV index).

---

### 💬 Milestone 2: Conversational AI & Message Threading
**Goal:** Deliver a conversational experience with multi-thread history and rich card widgets.

1. **Dynamic Query Dispatch (`ChatPage.jsx`)**:
   - Send query to `POST /api/v1/chat`:
     ```javascript
     const response = await apiClient.post('/chat', {
       message: inputQuery,
       latitude: weatherData.coordinates?.lat,
       longitude: weatherData.coordinates?.lon,
       language: currentLanguageCode,
       conversationId: activeConversationId
     });
     ```
2. **Rich Renderers**:
   - Parse markdown bullet points and bold highlights.
   - If the backend returns `weatherCard`, render an interactive widget with temperature, condition icon, and rain probability.
   - Display verified data sources (`IMD-WRF`, `Open-Meteo GFS Ensemble`) and risk badges (`Extreme`, `High`, `Moderate`, `Low`).
3. **Chat History Drawer**:
   - Add a sidebar toggle in `ChatPage.jsx` that calls `GET /api/v1/chat/conversations`.
   - Clicking a thread loads message history from `GET /api/v1/chat/history/:id`.

---

### 🎙️ Milestone 3: Multilingual Voice Interaction for Rural Farmers (SIH Key Feature 8)
**Goal:** Enable rural users with low literacy to query weather and receive audio advisories.

1. **Speech-to-Text (STT) Microphone**:
   - Use browser Web Speech API (`webkitSpeechRecognition`):
     ```javascript
     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
     recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Bengali' ? 'bn-IN' : 'en-US';
     recognition.onresult = (e) => {
       const transcript = e.results[0][0].transcript;
       handleSendMessage(transcript);
     };
     ```
2. **Text-to-Speech (TTS) Voice Readout**:
   - When AI messages arrive, strip markdown syntax and speak via `window.speechSynthesis`:
     ```javascript
     const utterance = new SpeechSynthesisUtterance(cleanText);
     utterance.rate = 0.95;
     window.speechSynthesis.speak(utterance);
     ```

---

### 🗺️ Milestone 4: Interactive GIS Disaster Map & GeoJSON Layers (SIH Key Feature 4 & 5)
**Goal:** Visualize disaster hazard zones and provide coordinate inspection.

1. **GeoJSON Disaster Layers (`WeatherMapPage.jsx`)**:
   - Fetch active GeoJSON polygons using `GET /api/v1/alerts/gis/layers`.
   - Render polygon danger zones using `react-leaflet` `<GeoJSON />` component:
     - 🔴 **Red (`#ef4444`)**: Severe Cyclonic Storms / Flash Floods
     - 🟠 **Orange (`#f97316`)**: Heavy Inundation / Squalls
     - 🟡 **Yellow (`#eab308`)**: Heatwaves / Thunderstorm Watches
2. **Coordinate Hazard Inspector**:
   - Add a map click listener:
     ```javascript
     const handleMapClick = async (e) => {
       const { lat, lng } = e.latlng;
       const res = await apiClient.get(`/alerts/hazard/check?lat=${lat}&lon=${lng}`);
       // Open popup displaying IMD hazard color code and agricultural safety advisories
     };
     ```

---

### ⚡ Milestone 5: Real-Time Disaster Streaming (SSE) & Push Alerts
**Goal:** Disseminate emergency warnings instantly without page refreshes.

1. **Server-Sent Events Listener (`AppContext.jsx`)**:
   ```javascript
   useEffect(() => {
     const eventSource = new EventSource('http://localhost:5000/api/v1/alerts/stream');
     
     eventSource.addEventListener('alert', (event) => {
       const alertData = JSON.parse(event.data);
       // Trigger Emergency Banner & Sound Effect
       setEmergencyAlert(alertData.alert);
     });

     return () => eventSource.close();
   }, []);
   ```
2. **Emergency Siren Modal / Toast**:
   - Render a high-priority top-of-screen banner with CAP 1.2 headline, severity badge, and immediate safety steps.

---

### 📈 Milestone 6: Climate Trends & Historical Analytics
**Goal:** Present long-term climate anomaly data to researchers.

1. **Recharts Integration in `AnalyticsPage.jsx`**:
   - Call `GET /api/v1/analytics/climate?lat=22.57&lon=88.36&years=10`.
   - Render `monthlyTemperature` deviations and `decadalRainfall` trends.

---

### 🔐 Milestone 7: Multilingual Preferences & Location CRUD
**Goal:** Support personalization for different regional users.

1. **Multilingual UI Support**:
   - Language selector in `Navbar.jsx` supporting: `English`, `हिन्दी`, `বাংলা`, `தமிழ்`, `తెలుగు`, `मराठी`.
   - Sync language preference to user profile via `PUT /api/v1/auth/me`.
2. **Saved Locations CRUD**:
   - In `SettingsPage.jsx`, display saved locations from `GET /api/v1/locations`.
   - Allow users to add favorite farms/districts via `POST /api/v1/locations` and set default favorite.

---

## 🏆 Presentation Script for SIH 2026 Jury

1. **Introduction**: Introduce WeatherGPT as an AI-powered conversational weather and disaster intelligence platform for MoES / IMD.
2. **Rural Voice Demonstration**:
   - Switch language to **Hindi**.
   - Tap the microphone: *"क्या कल नासिक में अंगूर की खेती के लिए मौसम ठीक रहेगा?"*
   - Show how the AI synthesizes GFS forecast data and speaks the agricultural advisory aloud.
3. **Interactive GIS Map**:
   - Open **WeatherMapPage**.
   - Zoom into Bay of Bengal and click on the **Red Alert Cyclone Polygon**.
   - Inspect the Point-in-Polygon hazard rating and evacuation guidelines.
4. **Live Real-Time Disaster Dissemination**:
   - Trigger a simulated CAP 1.2 disaster bulletin from the backend.
   - Show how the frontend UI instantly flashes the emergency alert siren without refreshing.
