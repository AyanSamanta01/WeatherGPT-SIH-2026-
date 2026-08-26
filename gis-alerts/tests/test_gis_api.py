"""
Integration Tests for GIS & Alerts FastAPI Microservice
======================================================
"""

import pytest
from fastapi.testclient import TestClient
from src.api import app

client = TestClient(app)


def test_api_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "loaded_gis_layers" in data
    assert len(data["loaded_gis_layers"]) >= 3


def test_get_gis_layers():
    resp = client.get("/api/v1/gis/layers")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["total_layers"] >= 3
    assert "india_metropolitan_boundaries" in data["layers"]


def test_geofence_check_mumbai():
    # Mumbai coordinates
    payload = {
        "latitude": 19.0760,
        "longitude": 72.8777,
        "include_nearby_radius_km": 50.0
    }
    resp = client.post("/api/v1/gis/geofence/check", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_inside_hazard_zone"] is True
    assert data["matched_zones_count"] >= 1
    matched_names = [z["properties"].get("city_name") for z in data["matched_zones"]]
    assert "Mumbai" in matched_names


def test_hazard_evaluation_endpoint():
    payload = {
        "temperature_c": 44.0,
        "rainfall_mm": 95.0,
        "wind_speed_kmh": 65.0,
        "humidity_pct": 70.0,
        "lightning_detected": True
    }
    resp = client.post("/api/v1/gis/hazard/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["overall_severity"] in ["WARNING", "EMERGENCY"]
    assert data["color_code"]["level"] in ["Orange", "Red"]
    assert len(data["advisories"]) > 0


def test_cap_generation_and_parsing_endpoints():
    # 1. Generate XML
    gen_payload = {
        "headline": "Orange Alert: Heavy Downpour Expected",
        "description": "Rainfall between 120-150 mm in next 6 hours.",
        "instruction": "Avoid low-lying underpasses.",
        "event_type": "Heavy Rain",
        "severity": "Severe",
        "area_desc": "Chennai Metro",
        "format": "xml"
    }
    gen_resp = client.post("/api/v1/gis/cap/generate", json=gen_payload)
    assert gen_resp.status_code == 200
    xml_data = gen_resp.json()
    assert xml_data["format"] == "xml"
    assert "<headline>Orange Alert: Heavy Downpour Expected</headline>" in xml_data["xml_payload"]

    # 2. Parse XML back
    parse_resp = client.post("/api/v1/gis/cap/parse", json={"xml_payload": xml_data["xml_payload"]})
    assert parse_resp.status_code == 200
    parsed = parse_resp.json()
    assert parsed["status"] == "success"
    assert parsed["parsed_cap"]["info"]["headline"] == "Orange Alert: Heavy Downpour Expected"


def test_notification_dispatch_endpoint():
    dispatch_payload = {
        "alert_id": "ALT_TEST_999",
        "headline": "Emergency Red Alert: Test Run",
        "severity": "EMERGENCY",
        "advisories": ["Immediate protective action required."],
        "channels": ["sms", "push"]
    }
    resp = client.post("/api/v1/gis/notifications/dispatch", json=dispatch_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["alert_id"] == "ALT_TEST_999"
    assert data["status"] in ["DELIVERED", "NO_MATCHING_RECIPIENTS"]

    # Check history
    hist_resp = client.get("/api/v1/gis/notifications/history")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()["history"]) >= 1
