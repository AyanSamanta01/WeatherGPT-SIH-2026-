"""
WeatherGPT AI & ML Microservice Unit & Endpoint Test Suite
==========================================================
Tests FastAPI endpoints: /health, /api/v1/agent/query, /api/v1/ml/forecast,
/api/v1/ml/metadata, and /api/v1/ml/cities using TestClient.
"""

import sys
import json
from fastapi.testclient import TestClient
from src.api import app

# Ensure utf-8 output encoding for console
sys.stdout.reconfigure(encoding='utf-8')

client = TestClient(app)


def test_health():
    print("\n--- 1. Testing GET /api/v1/health ---")
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"] is True
    print(f"Health Response: {data}")
    print("[PASSED] Health endpoint verified.")


def test_agent_query_english():
    print("\n--- 2. Testing POST /api/v1/agent/query (English) ---")
    payload = {
        "message": "Will it rain in Mumbai in the next 6 hours?",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "city": "Mumbai",
        "language": "en"
    }
    resp = client.post("/api/v1/agent/query", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "answer" in data
    assert data["location"] == "Mumbai"
    assert "sources" in data
    assert "forecast" in data
    assert "risk_assessment" in data
    print(f"Agent Answer: {data['answer']}")
    print(f"Risk Level: {data['risk']}")
    print(f"Forecast Temp: {data['forecast']['temperature_c']} °C | Rain Prob: {data['forecast']['rain_probability'] * 100:.1f}%")
    print("[PASSED] Agent query (English) verified.")


def test_agent_query_hindi():
    print("\n--- 3. Testing POST /api/v1/agent/query (Hindi) ---")
    payload = {
        "message": "क्या दिल्ली में आज बारिश होगी?",
        "city": "Delhi",
        "language": "hi"
    }
    resp = client.post("/api/v1/agent/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["answer"]) > 0
    print(f"Hindi Agent Answer (UTF-8 bytes length: {len(data['answer'].encode('utf-8'))}): {data['answer']}")
    print("[PASSED] Agent query (Hindi) verified.")


def test_ml_forecast_endpoint():
    print("\n--- 4. Testing GET /api/v1/ml/forecast ---")
    resp = client.get("/api/v1/ml/forecast?city=Bengaluru")
    assert resp.status_code == 200
    data = resp.json()
    assert data["city"] == "Bengaluru"
    assert "forecast_6h" in data
    assert "risk_assessment" in data
    print(f"Bengaluru Forecast: Temp = {data['forecast_6h']['predicted_temperature_c']} °C, Rain = {data['forecast_6h']['predicted_rainfall_mm']} mm")
    print("[PASSED] Direct ML forecast endpoint verified.")


def test_ml_metadata():
    print("\n--- 5. Testing GET /api/v1/ml/metadata ---")
    resp = client.get("/api/v1/ml/metadata")
    assert resp.status_code == 200
    data = resp.json()
    assert data["model_version"] == "3.0.0"
    assert "validation_metrics" in data
    assert "test_metrics" in data
    print(f"Metadata verified: {data['model_version']} (Test Temp MAE: {data['test_metrics']['temperature']['test_mae']:.4f} °C)")
    print("[PASSED] Metadata endpoint verified.")


def test_cities_endpoint():
    print("\n--- 6. Testing GET /api/v1/ml/cities ---")
    resp = client.get("/api/v1/ml/cities")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["cities"]) == 10
    print(f"Supported Cities Count: {len(data['cities'])}")
    print("[PASSED] Cities endpoint verified.")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING FASTAPI MICROSERVICE ENDPOINT TESTS")
    print("=" * 60)
    test_health()
    test_agent_query_english()
    test_agent_query_hindi()
    test_ml_forecast_endpoint()
    test_ml_metadata()
    test_cities_endpoint()
    print("=" * 60)
    print("ALL FASTAPI MICROSERVICE ENDPOINT TESTS PASSED!")
    print("=" * 60)
