# 🚀 Deploying WeatherGPT on Railway

WeatherGPT is pre-configured for **Railway** deployment. You can deploy the full-stack application (React Frontend + Node.js Express Backend + Open-Meteo Integration) with **1-click**.

---

## ⚡ Option 1: Single-Service Full-Stack Deployment (Fastest — 2 Minutes)

Because we created the unified production [`Dockerfile`](file:///d:/VS%20CODE/WeatherGPT-SIH-2026-/Dockerfile) and [`railway.json`](file:///d:/VS%20CODE/WeatherGPT-SIH-2026-/railway.json), Railway builds both the Vite frontend and the Express backend together.

### Step-by-Step:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete SIH WeatherGPT with Open-Meteo & Railway deployment"
   git push origin main
   ```
2. Go to **[railway.app](https://railway.app)** and sign in with GitHub.
3. Click **"New Project"** → Select **"Deploy from GitHub repo"**.
4. Choose your repository: `WeatherGPT-SIH-2026-`.
5. Click **"Deploy Now"**.
6. *(Optional Database)*:
   - In your Railway project canvas, click **`+ New`** → **`Database`** → **`Add PostgreSQL`**.
   - In your WeatherGPT service **Variables** tab, add:
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
     - `JWT_SECRET`: `weathergpt_super_secure_jwt_secret_sih_2026_key`
     - `NODE_ENV`: `production`
7. Click **"Generate Domain"** in the **Networking** section of your service settings.
8. Done! Your live app will be live at `https://weathergpt-production.up.railway.app`.

---

## 🌐 Option 2: Multi-Service Architecture (Microservices)

If you prefer separate services on Railway:

### 1. PostgreSQL Database
- Click **`+ New`** → **`Database`** → **`PostgreSQL`**.

### 2. Backend Service (`backend/`)
- Click **`+ New`** → **`GitHub Repo`** → Select `WeatherGPT-SIH-2026-`.
- In **Settings** → Set **Root Directory**: `backend`.
- In **Variables**:
  - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `JWT_SECRET`: `weathergpt_super_secure_jwt_secret_sih_2026_key`
- In **Networking** → Click **Generate Domain** (e.g. `https://weathergpt-backend.up.railway.app`).

### 3. Frontend Service (`frontend/`)
- Click **`+ New`** → **`GitHub Repo`** → Select `WeatherGPT-SIH-2026-`.
- In **Settings** → Set **Root Directory**: `frontend`.
- In **Variables**:
  - `VITE_API_URL`: `https://weathergpt-backend.up.railway.app/api/v1`
- In **Networking** → Click **Generate Domain** (e.g. `https://weathergpt.up.railway.app`).

---

## 🧪 Verification After Deployment

Once deployed on Railway, test:
1. **Live Geolocation & Weather**: Open the app URL, allow location, verify Open-Meteo live readings.
2. **AI Chat**: Test query: *"Will it rain heavily tonight?"*
3. **GIS Hazard Map**: Check `/map` to verify OpenStreetMap tiles and Doppler radar load.
4. **Health Check**: `https://<YOUR_RAILWAY_URL>/api/v1/weather/current?city=Mumbai`
