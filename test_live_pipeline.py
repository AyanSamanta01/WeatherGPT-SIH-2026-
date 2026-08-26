"""
WeatherGPT Real-Time Live Data Pipeline Test Suite
=================================================
Tests live API telemetry retrieval, dynamic lag computation,
ML 6-hour prediction, and hazard risk assessment across Indian cities.
"""

import json
from src.weathergpt_live_features import (
    resolve_location,
    fetch_live_hourly_data,
    build_live_feature_vector,
    get_live_weathergpt_forecast,
    CITY_COORDINATES
)

def test_resolve_location():
    print("\n--- 1. Testing City & Coordinate Resolution ---")
    name1, lat1, lon1 = resolve_location("Kolkata")
    assert name1 == "Kolkata" and abs(lat1 - 22.5726) < 0.01
    
    name2, lat2, lon2 = resolve_location("Bangalore")
    assert name2 == "Bengaluru"
    
    # Coordinate match
    name3, lat3, lon3 = resolve_location({"lat": 19.07, "lon": 72.87})
    assert name3 == "Mumbai"
    print("[PASSED] City and coordinate resolution verified.")

def test_live_data_fetch():
    print("\n--- 2. Testing Live Open-Meteo Telemetry Fetch ---")
    df = fetch_live_hourly_data(22.5726, 88.3639)
    assert not df.empty, "Dataframe should not be empty"
    assert "temperature_c" in df.columns
    assert "rainfall_mm" in df.columns
    assert "humidity_percent" in df.columns
    assert len(df) >= 24, "Should have at least 24 hours of telemetry for lags"
    print(f"Fetched {len(df)} hourly records for Kolkata. Latest row:\n{df.iloc[-1][['timestamp', 'temperature_c', 'humidity_percent', 'wind_speed_kmh']].to_dict()}")
    print("[PASSED] Live telemetry fetch verified.")

def test_feature_engineering_live():
    print("\n--- 3. Testing Dynamic Feature Engineering & Lags ---")
    feature_row, current_obs = build_live_feature_vector("Delhi")
    assert "temperature_c_lag_24h" in feature_row.columns
    assert "hour_sin" in feature_row.columns
    assert "wind_direction_cos" in feature_row.columns
    assert not pd.isna(feature_row["temperature_c_lag_24h"].values[0]), "24h lag should be populated"
    print(f"Delhi Current Temp: {current_obs['temperature_c']} °C | 24h Lag Temp: {feature_row['temperature_c_lag_24h'].values[0]} °C")
    print("[PASSED] Dynamic feature vector construction verified.")

def test_end_to_end_live_forecast_cities():
    print("\n--- 4. Testing End-to-End Live ML Forecast Across Cities ---")
    test_cities = ["Kolkata", "Mumbai", "Delhi", "Bengaluru", "Srinagar"]
    
    for city in test_cities:
        res = get_live_weathergpt_forecast(city)
        print(f"\nCity: {res['city']} ({res['coordinates']['latitude']}, {res['coordinates']['longitude']})")
        print(f"  Observed At          : {res['current_observation']['observed_at']}")
        print(f"  Current Temp / Humid : {res['current_observation']['temperature_c']} °C / {res['current_observation']['humidity_percent']}%")
        print(f"  6h Forecast Target   : {res['forecast_6h']['target_time']}")
        print(f"  6h Forecast Temp     : {res['forecast_6h']['predicted_temperature_c']} °C")
        print(f"  Rain Probability     : {res['forecast_6h']['rain_probability'] * 100:.1f}% (Rain: {res['forecast_6h']['rain_predicted']})")
        print(f"  6h Forecast Rainfall : {res['forecast_6h']['predicted_rainfall_mm']} mm")
        print(f"  Risk Level / Score   : {res['risk_assessment'].get('risk_level')} (Score: {res['risk_assessment'].get('composite_risk_score')})")
        print(f"  IMD Color Code       : {res['risk_assessment'].get('imd_color_code', {}).get('level')} - {res['risk_assessment'].get('imd_color_code', {}).get('name')}")
        print(f"  Advisories           : {res['risk_assessment'].get('advisories')}")
        
        assert "forecast_6h" in res
        assert "predicted_temperature_c" in res["forecast_6h"]
        assert "risk_assessment" in res
        assert res["forecast_6h"]["predicted_rainfall_mm"] >= 0.0
        
    print("\n[PASSED] End-to-end live forecast verified across all test cities!")

if __name__ == "__main__":
    import pandas as pd
    print("=" * 60)
    print("RUNNING LIVE DATA PIPELINE INTEGRATION TESTS")
    print("=" * 60)
    test_resolve_location()
    test_live_data_fetch()
    test_feature_engineering_live()
    test_end_to_end_live_forecast_cities()
    print("=" * 60)
    print("ALL LIVE PIPELINE INTEGRATION TESTS PASSED!")
    print("=" * 60)
