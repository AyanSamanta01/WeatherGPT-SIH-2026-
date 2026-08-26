"""
WeatherGPT Extreme-Weather Risk Engine Unit Test Suite
======================================================
Tests meteorological hazard calculations, IMD color codes,
heat index, discomfort index, and composite risk evaluations.
"""

import json
from src.weathergpt_risk_engine import (
    calculate_heat_index,
    calculate_discomfort_index,
    classify_imd_rainfall,
    classify_wind_hazard,
    assess_weather_risk
)
from src.weathergpt_predict import weathergpt_predict
import pandas as pd
import os

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(WORKSPACE_DIR, "dataset")
MASTER_DATASET_PATH = os.path.join(DATASET_DIR, "WeatherGPT_10_Cities_V3_Master.csv")

def load_sample_dataset(nrows=10):
    """Loads sample data from master CSV if available, or falls back to individual city CSVs."""
    if os.path.exists(MASTER_DATASET_PATH):
        df = pd.read_csv(MASTER_DATASET_PATH, nrows=nrows)
        if "location" not in df.columns:
            df["location"] = df["city"] if "city" in df.columns else "Mumbai"
        return df
    
    city_files = [f for f in os.listdir(DATASET_DIR) if f.endswith("_V3.csv") and not f.startswith("V3_")]
    if not city_files:
        raise FileNotFoundError(f"No city datasets (*_V3.csv) found in {DATASET_DIR}")
    
    # Pick first city file
    cf = city_files[0]
    city_name = cf.replace("_V3.csv", "")
    cpath = os.path.join(DATASET_DIR, cf)
    df = pd.read_csv(cpath, nrows=nrows)
    df["location"] = city_name
    return df


def test_heat_index():
    print("\n--- 1. Testing Heat Index & Thermal Stress ---")
    
    # Test Normal
    res_normal = calculate_heat_index(temperature_c=22.0, humidity_percent=50.0)
    assert res_normal["heat_category"] == "Normal"
    print(f"Normal Condition: {res_normal}")
    
    # Test Caution / Extreme Caution
    res_caution = calculate_heat_index(temperature_c=34.0, humidity_percent=70.0)
    assert res_caution["heat_category"] in ["Extreme Caution", "Danger"]
    print(f"Humid Summer Heat: {res_caution}")
    
    # Test Extreme Heat
    res_extreme = calculate_heat_index(temperature_c=44.0, humidity_percent=60.0)
    assert res_extreme["heat_category"] in ["Danger", "Extreme Danger"]
    print(f"Heatwave Peak: {res_extreme}")
    print("[PASSED] Heat index calculation verified.")


def test_rainfall_classification():
    print("\n--- 2. Testing IMD Rainfall Classification ---")
    
    no_rain = classify_imd_rainfall(0.0, 0.1)
    assert no_rain["rainfall_code"] == "NO_RAIN"
    
    mod_rain = classify_imd_rainfall(20.0, 0.9)
    assert mod_rain["rainfall_code"] == "MODERATE_RAIN"
    
    heavy_rain = classify_imd_rainfall(85.0, 0.95)
    assert heavy_rain["rainfall_code"] == "HEAVY_RAIN"
    assert heavy_rain["severity"] == "severe"
    
    extreme_rain = classify_imd_rainfall(250.0, 1.0)
    assert extreme_rain["rainfall_code"] == "EXTREMELY_HEAVY_RAIN"
    assert extreme_rain["severity"] == "extreme"
    
    print(f"Moderate Rain: {mod_rain['rainfall_category']} (Risk: {mod_rain['flood_risk']})")
    print(f"Heavy Rain: {heavy_rain['rainfall_category']} (Severity: {heavy_rain['severity']})")
    print(f"Extreme Inundation: {extreme_rain['rainfall_category']} (Flood Risk: {extreme_rain['flood_risk']})")
    print("[PASSED] IMD rainfall classification verified.")


def test_wind_classification():
    print("\n--- 3. Testing Wind Speed Classification ---")
    
    calm = classify_wind_hazard(10.0)
    assert calm["wind_code"] == "CALM_LIGHT"
    
    strong = classify_wind_hazard(50.0)
    assert strong["wind_code"] == "STRONG_BREEZE"
    
    cyclone = classify_wind_hazard(95.0)
    assert cyclone["wind_code"] == "CYCLONIC_STORM"
    
    print(f"Calm: {calm['wind_category']}")
    print(f"Strong Breeze: {strong['wind_category']}")
    print(f"Cyclonic Storm: {cyclone['wind_category']}")
    print("[PASSED] Wind hazard classification verified.")


def test_composite_risk_scenarios():
    print("\n--- 4. Testing Composite Multi-Hazard Scenarios ---")
    
    # Scenario A: Monsoon Deluge in Mumbai
    mumbai_deluge = assess_weather_risk(
        temperature_c=28.0,
        rainfall_mm=95.0,
        rain_probability=0.98,
        humidity_percent=92.0,
        wind_speed_kmh=55.0,
        location_name="Mumbai"
    )
    print(f"\nMumbai Deluge Scenario -> Risk Score: {mumbai_deluge['composite_risk_score']}, Level: {mumbai_deluge['risk_level']}, IMD Code: {mumbai_deluge['imd_color_code']['level']}")
    assert mumbai_deluge["risk_level"] in ["HIGH", "SEVERE"]
    assert mumbai_deluge["imd_color_code"]["level"] in ["Orange", "Red"]
    assert len(mumbai_deluge["advisories"]) > 0
    
    # Scenario B: Calm winter morning in Srinagar
    srinagar_calm = assess_weather_risk(
        temperature_c=12.0,
        rainfall_mm=0.0,
        rain_probability=0.05,
        humidity_percent=45.0,
        wind_speed_kmh=8.0,
        location_name="Srinagar"
    )
    print(f"Srinagar Pleasant Scenario -> Risk Score: {srinagar_calm['composite_risk_score']}, Level: {srinagar_calm['risk_level']}, IMD Code: {srinagar_calm['imd_color_code']['level']}")
    assert srinagar_calm["risk_level"] == "LOW"
    assert srinagar_calm["imd_color_code"]["level"] == "Green"
    
    # Scenario C: Scorching Delhi summer heatwave
    delhi_heatwave = assess_weather_risk(
        temperature_c=43.5,
        rainfall_mm=0.0,
        rain_probability=0.1,
        humidity_percent=35.0,
        wind_speed_kmh=22.0,
        location_name="Delhi"
    )
    print(f"Delhi Summer Heatwave -> Risk Score: {delhi_heatwave['composite_risk_score']}, Level: {delhi_heatwave['risk_level']}, Heat Category: {delhi_heatwave['components']['heat_assessment']['heat_category']}")
    assert delhi_heatwave["risk_level"] in ["MODERATE", "HIGH", "SEVERE"]
    print("[PASSED] Composite multi-hazard scenarios verified.")


def test_end_to_end_prediction_with_risk():
    print("\n--- 5. Testing End-to-End Prediction with Risk Integration ---")
    df = load_sample_dataset(nrows=10)
    sample = df.iloc[[0]]
    
    prediction = weathergpt_predict(sample, include_risk_assessment=True)
    print(f"\nCity: {sample['location'].values[0]}")
    print(f"  Predicted Temp: {prediction['temperature_c']} °C")
    print(f"  Rain Prob: {prediction['rain_probability'] * 100:.1f}% | Rain Prediction: {prediction['rain_prediction']}")
    print(f"  Predicted Rainfall: {prediction['rainfall_mm']} mm")
    print(f"  Risk Level: {prediction['risk_assessment']['risk_level']} (Score: {prediction['risk_assessment']['composite_risk_score']})")
    print(f"  IMD Color Code: {prediction['risk_assessment']['imd_color_code']['level']} - {prediction['risk_assessment']['imd_color_code']['name']}")
    print(f"  Advisories: {prediction['risk_assessment']['advisories']}")
    
    assert "risk_assessment" in prediction
    assert "composite_risk_score" in prediction["risk_assessment"]
    assert "imd_color_code" in prediction["risk_assessment"]
    print("\n[PASSED] Full end-to-end ML prediction + Risk Assessment verified successfully!")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING WEATHERGPT RISK ENGINE TESTS")
    print("=" * 60)
    test_heat_index()
    test_rainfall_classification()
    test_wind_classification()
    test_composite_risk_scenarios()
    test_end_to_end_prediction_with_risk()
    print("=" * 60)
    print("ALL RISK ENGINE UNIT TESTS PASSED!")
    print("=" * 60)
