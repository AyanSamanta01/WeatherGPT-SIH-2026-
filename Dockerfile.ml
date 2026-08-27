# -------------------------------------------------------------
# WeatherGPT ML Forecasting & Inference Engine Dockerfile
# -------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python ML dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML source code and pre-trained XGBoost / LightGBM models
COPY src/ ./src/
COPY models/ ./models/

EXPOSE 8000

ENV PORT=8000
ENV HOST=0.0.0.0

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
