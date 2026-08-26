"""
WeatherGPT NWP Multi-Model Consensus Test Suite
==============================================
Tests the multi-model comparison engine across WeatherGPT ML, ECMWF, GFS, and ICON.
"""

import sys
import json
from fastapi.testclient import TestClient

# Ensure utf-8 output encoding for console
sys.stdout.reconfigure(encoding='utf-8')

from src.weathergpt_nwp_consensus import evaluate_nwp_consensus, print_nwp_consensus_table
from src.api import app

client = TestClient(app)


def test_nwp_consensus_engine():
    print("\n--- 1. Testing Multi-Model NWP Consensus Engine ---")
    cities = ["Mumbai", "Delhi", "Kolkata", "Bengaluru"]
    
    for city in cities:
        res = evaluate_nwp_consensus(city)
        print_nwp_consensus_table(res)
        
        assert "consensus_confidence_pct" in res
        assert 0.0 <= res["consensus_confidence_pct"] <= 100.0
        assert len(res["models"]) >= 3, "Should compare against at least ML + 2 NWP models"
        assert "ensemble_summary" in res
        assert "mean_temperature_c" in res["ensemble_summary"]
        assert "temperature_spread_std" in res["ensemble_summary"]
        
    print("\n[PASSED] Multi-model NWP consensus engine verified across all test cities!")


def test_nwp_consensus_api_endpoint():
    print("\n--- 2. Testing GET /api/v1/ml/consensus Endpoint ---")
    resp = client.get("/api/v1/ml/consensus?city=Delhi")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data["city"] == "Delhi"
    assert "consensus_confidence_pct" in data
    assert "models" in data
    print(f"API Response -> Delhi Consensus Score: {data['consensus_confidence_pct']}% ({data['consensus_status']})")
    print(f"Ensemble Mean Temp: {data['ensemble_summary']['mean_temperature_c']} °C")
    print("[PASSED] /api/v1/ml/consensus endpoint verified.")


if __name__ == "__main__":
    print("=" * 80)
    print("RUNNING WEATHERGPT NWP MULTI-MODEL CONSENSUS TESTS")
    print("=" * 80)
    test_nwp_consensus_engine()
    test_nwp_consensus_api_endpoint()
    print("=" * 80)
    print("ALL NWP CONSENSUS TESTS PASSED!")
    print("=" * 80)
