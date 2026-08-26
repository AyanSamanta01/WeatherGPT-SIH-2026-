"""
WeatherGPT Inference Unit Test and Demonstration Script
======================================================
Tests the production prediction module against sample records from each of the 10 cities.
"""

import os
import json
import pandas as pd
from src.weathergpt_predict import weathergpt_predict

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(WORKSPACE_DIR, "dataset")
MASTER_DATASET_PATH = os.path.join(DATASET_DIR, "WeatherGPT_10_Cities_V3_Master.csv")

def load_test_dataset():
    """Loads sample data from master CSV if available, or falls back to individual city CSVs."""
    if os.path.exists(MASTER_DATASET_PATH):
        return pd.read_csv(MASTER_DATASET_PATH)
    
    city_files = [f for f in os.listdir(DATASET_DIR) if f.endswith("_V3.csv") and not f.startswith("V3_")]
    if not city_files:
        raise FileNotFoundError(f"No city datasets (*_V3.csv) found in {DATASET_DIR}")
    
    dfs = []
    for cf in city_files:
        cpath = os.path.join(DATASET_DIR, cf)
        dfs.append(pd.read_csv(cpath, nrows=50))
    return pd.concat(dfs, ignore_index=True)

def test_inference_cities():
    print("\n" + "=" * 60)
    print("TESTING WEATHERGPT PRODUCTION PREDICTION FUNCTION")
    print("=" * 60)
    
    df = load_test_dataset()
    
    # Select one test sample from each city (from tail to ensure test domain sample)
    cities = df["location"].unique()
    
    for city in cities:
        city_df = df[df["location"] == city]
        sample_row = city_df.iloc[[-1]]  # last row
        
        actual_temp = sample_row["target_temperature_6h"].values[0]
        actual_rain = sample_row["target_rainfall_6h"].values[0]
        
        pred = weathergpt_predict(sample_row)
        
        print(f"\nCity: {city} (Timestamp: {sample_row['timestamp'].values[0]})")
        print(f"  Predicted Temperature : {pred['temperature_c']} °C  (Actual: {actual_temp:.2f} °C)")
        print(f"  Rain Probability      : {pred['rain_probability'] * 100:.2f}%")
        print(f"  Rain Prediction (0/1) : {pred['rain_prediction']} (Actual Rain: {actual_rain:.2f} mm)")
        print(f"  Rainfall Amount       : {pred['rainfall_mm']} mm")
        
        assert isinstance(pred, dict), "Output must be a dict for single row"
        assert "temperature_c" in pred and "rain_probability" in pred
        assert "rain_prediction" in pred and "rainfall_mm" in pred
        assert pred["rainfall_mm"] >= 0.0, "Rainfall must never be negative"
        assert 0.0 <= pred["rain_probability"] <= 1.0, "Rain probability must be between 0 and 1"
        
    print("\n" + "=" * 60)
    print("[PASSED] Production prediction function verified successfully across all cities!")
    print("=" * 60)

if __name__ == "__main__":
    test_inference_cities()
