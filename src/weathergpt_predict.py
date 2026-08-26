"""
WeatherGPT Production Prediction & Risk Assessment Module
=========================================================
Provides high-performance ML inference and hazard evaluation
using trained WeatherGPT models and meteorological risk engines.
"""

import os
import json
import numpy as np
import pandas as pd
from xgboost import XGBRegressor, XGBClassifier
from lightgbm import Booster

from src.weathergpt_risk_engine import assess_weather_risk

_MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

_TEMP_MODEL = None
_RAIN_CLF_MODEL = None
_RAIN_AMOUNT_BOOSTER = None
_METADATA = None
_FEATURE_COLUMNS = None


def load_models(models_dir=_MODELS_DIR):
    """
    Loads and caches trained models and metadata.
    """
    global _TEMP_MODEL, _RAIN_CLF_MODEL, _RAIN_AMOUNT_BOOSTER, _METADATA, _FEATURE_COLUMNS
    
    if _TEMP_MODEL is not None and _RAIN_CLF_MODEL is not None:
        return _TEMP_MODEL, _RAIN_CLF_MODEL, _RAIN_AMOUNT_BOOSTER, _METADATA, _FEATURE_COLUMNS
        
    metadata_path = os.path.join(models_dir, "model_metadata.json")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Model metadata not found at {metadata_path}. Please run train_pipeline.py first.")
        
    with open(metadata_path, "r") as f:
        _METADATA = json.load(f)
        
    feat_path = os.path.join(models_dir, "feature_columns.json")
    with open(feat_path, "r") as f:
        _FEATURE_COLUMNS = json.load(f)
        
    # 1. Load Temperature Model
    temp_path = os.path.join(models_dir, "temperature_xgb.json")
    _TEMP_MODEL = XGBRegressor()
    _TEMP_MODEL.load_model(temp_path)
    
    # 2. Load Rain Classifier Model
    rain_path = os.path.join(models_dir, "rain_classifier_xgb.json")
    _RAIN_CLF_MODEL = XGBClassifier()
    _RAIN_CLF_MODEL.load_model(rain_path)
    
    # 3. Load Rainfall Amount Model
    amount_path = os.path.join(models_dir, "rainfall_amount_lgbm.txt")
    _RAIN_AMOUNT_BOOSTER = Booster(model_file=amount_path)
    
    return _TEMP_MODEL, _RAIN_CLF_MODEL, _RAIN_AMOUNT_BOOSTER, _METADATA, _FEATURE_COLUMNS


def preprocess_input(input_data, feature_columns):
    """
    Prepares input dataframe into aligned feature matrix.
    """
    if isinstance(input_data, dict):
        df = pd.DataFrame([input_data])
    elif isinstance(input_data, pd.Series):
        df = pd.DataFrame([input_data.to_dict()])
    elif isinstance(input_data, pd.DataFrame):
        df = input_data.copy()
    else:
        raise ValueError("input_data must be a dict, pd.Series, or pd.DataFrame")
        
    # Drop unwanted columns if present
    drop_cols = ["timestamp", "target_temperature_6h", "target_rainfall_6h"]
    for col in drop_cols:
        if col in df.columns:
            df = df.drop(columns=[col])
            
    # One-hot encode location if present as string/categorical
    if "location" in df.columns:
        df_encoded = pd.get_dummies(df, columns=["location"], dtype=int)
    else:
        df_encoded = df.copy()
        
    # Reindex to exact feature columns ordering
    df_aligned = df_encoded.reindex(columns=feature_columns, fill_value=0)
    return df_aligned, df


def weathergpt_predict(input_dataframe: pd.DataFrame, include_risk_assessment: bool = True):
    """
    Unified production inference function for WeatherGPT.
    
    Parameters:
    -----------
    input_dataframe : pd.DataFrame or dict
        Input dataframe or record containing meteorological variables and location.
    include_risk_assessment : bool
        If True, enriches output with IMD hazard scores, heat index, and advisories.
        
    Returns:
    --------
    dict (if single row) or pd.DataFrame (if multiple rows) containing:
        - temperature_c: predicted 6-hour ahead temperature
        - rain_probability: probability of rain in next 6 hours
        - rain_prediction: binary rain indicator (0 or 1) based on frozen validation threshold
        - rainfall_mm: predicted 6-hour rainfall amount (>= 0.0 mm)
        - risk_assessment (optional): IMD hazard classifications, composite risk score, and advisories
    """
    temp_model, rain_clf, amount_booster, metadata, feature_cols = load_models()
    
    is_single_row = False
    if isinstance(input_dataframe, dict) or (isinstance(input_dataframe, pd.DataFrame) and len(input_dataframe) == 1):
        is_single_row = True
        
    X_mat, original_df = preprocess_input(input_dataframe, feature_cols)
    
    # 1. Temperature Prediction
    temp_preds = temp_model.predict(X_mat)
    
    # 2. Rain Probability & Binary Classification
    rain_probs = rain_clf.predict_proba(X_mat)[:, 1]
    threshold = metadata.get("selected_rain_threshold", 0.65)
    rain_preds = (rain_probs >= threshold).astype(int)
    
    # 3. Rainfall Amount Prediction
    raw_amount_preds = amount_booster.predict(X_mat)
    is_log_transformed = metadata.get("rainfall_amount_is_log_transformed", True)
    
    if is_log_transformed:
        amount_preds = np.maximum(np.expm1(raw_amount_preds), 0.0)
    else:
        amount_preds = np.maximum(raw_amount_preds, 0.0)
        
    results = []
    for i in range(len(X_mat)):
        pred_temp = round(float(temp_preds[i]), 2)
        pred_prob = round(float(rain_probs[i]), 4)
        pred_rain = int(rain_preds[i])
        pred_amt = round(float(amount_preds[i]), 2)
        
        # Zero out amount if rain binary prediction is 0
        if pred_rain == 0 and pred_prob < 0.35:
            effective_rainfall = 0.0
        else:
            effective_rainfall = pred_amt
            
        rec = {
            "temperature_c": pred_temp,
            "rain_probability": pred_prob,
            "rain_prediction": pred_rain,
            "rainfall_mm": round(effective_rainfall, 2)
        }
        
        if include_risk_assessment:
            # Extract atmospheric context from original row if present
            row = original_df.iloc[i] if isinstance(original_df, pd.DataFrame) else {}
            humidity = float(row.get("humidity_percent", 65.0))
            wind_speed = float(row.get("wind_speed_kmh", 12.0))
            loc_name = str(row.get("location", "Monitored City"))
            
            risk_info = assess_weather_risk(
                temperature_c=pred_temp,
                rainfall_mm=effective_rainfall,
                rain_probability=pred_prob,
                humidity_percent=humidity,
                wind_speed_kmh=wind_speed,
                location_name=loc_name
            )
            rec["risk_assessment"] = risk_info
            
        results.append(rec)
        
    if is_single_row:
        return results[0]
    return pd.DataFrame(results)


if __name__ == "__main__":
    print("WeatherGPT inference module loaded.")
