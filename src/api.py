"""
WeatherGPT AI & ML Microservice (Port 8000)
===========================================
FastAPI server serving ML forecast predictions, meteorological hazard assessments,
and natural language query reasoning for the WeatherGPT backend and frontend.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.weathergpt_predict import weathergpt_predict, load_models
from src.weathergpt_risk_engine import assess_weather_risk
from src.weathergpt_live_features import (
    get_live_weathergpt_forecast,
    resolve_location,
    CITY_COORDINATES
)

app = FastAPI(
    title="WeatherGPT AI & ML Microservice",
    description="High-performance ML 6h Forecasting and Extreme-Weather Hazard Engine for 10 Indian Cities",
    version="3.0.0"
)

# Enable CORS for backend (port 5000) and frontend (port 5173/3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")


# -------------------------------------------------------------
# Request & Response Schemas
# -------------------------------------------------------------
class AgentQueryRequest(BaseModel):
    message: str = Field(..., example="Will it rain heavily in Mumbai this evening?")
    latitude: Optional[float] = Field(None, example=19.0760)
    longitude: Optional[float] = Field(None, example=72.8777)
    city: Optional[str] = Field(None, example="Mumbai")
    language: str = Field("en", example="en")
    conversationId: Optional[str] = Field(None, example="conv_12345")


class AgentQueryResponse(BaseModel):
    answer: str
    location: str
    sources: List[str]
    risk: str
    forecast: Dict[str, Any]
    risk_assessment: Dict[str, Any]


class PredictRequest(BaseModel):
    data: List[Dict[str, Any]]
    include_risk_assessment: bool = True


# -------------------------------------------------------------
# Helper: Grounded Multi-Lingual Answer Synthesizer
# -------------------------------------------------------------
def synthesize_grounded_answer(
    message: str,
    city_name: str,
    forecast: Dict[str, Any],
    risk: Dict[str, Any],
    current_obs: Dict[str, Any],
    language: str = "en"
) -> str:
    """
    Synthesizes natural language responses strictly grounded in ML forecast data.
    """
    f6 = forecast.get("forecast_6h", {})
    temp = f6.get("predicted_temperature_c", current_obs.get("temperature_c", 25.0))
    rain_prob = f6.get("rain_probability", 0.0)
    rain_pred = f6.get("rain_predicted", False)
    rainfall_amt = f6.get("predicted_rainfall_mm", 0.0)
    risk_lvl = risk.get("risk_level", "LOW")
    advisories = risk.get("advisories", [])
    advisory_text = " ".join(advisories) if advisories else "Normal conditions expected."

    msg_lower = message.lower()
    
    # Check what user asked for
    is_rain_query = any(k in msg_lower for k in ["rain", "umbrella", "shower", "monsoon", "flood", "precipitation"])
    is_temp_query = any(k in msg_lower for k in ["temp", "temperature", "hot", "cold", "heat", "warm", "degrees"])
    
    if language == "hi":
        # Hindi response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} में अगले 6 घंटों में बारिश की {rain_prob * 100:.0f}% संभावना है (लगभग {rainfall_amt:.1f} मिमी)। {advisory_text}"
            else:
                ans = f"{city_name} में अगले 6 घंटों में बारिश की संभावना कम ({rain_prob * 100:.0f}%) है। तापमान लगभग {temp:.1f}°C रहेगा। {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} में 6 घंटे का पूर्वानुमानित तापमान {temp:.1f}°C है। {advisory_text}"
        else:
            ans = f"{city_name} का 6 घंटे का पूर्वानुमान: तापमान {temp:.1f}°C, बारिश की संभावना {rain_prob * 100:.0f}% ({rainfall_amt:.1f} मिमी)। मौसम जोखिम स्तर: {risk_lvl}। {advisory_text}"
        return ans

    # Default English response
    if is_rain_query:
        if rain_pred or rain_prob > 0.5:
            ans = (
                f"In {city_name} over the next 6 hours, our ML models predict a {rain_prob * 100:.1f}% probability of rain "
                f"with an expected accumulation of approximately {rainfall_amt:.1f} mm. "
                f"Predicted temperature is {temp:.1f}°C. {advisory_text}"
            )
        else:
            ans = (
                f"No significant rain is predicted in {city_name} over the next 6 hours (rain probability is low at {rain_prob * 100:.1f}%). "
                f"Temperatures are forecast around {temp:.1f}°C. {advisory_text}"
            )
    elif is_temp_query:
        ans = (
            f"The 6-hour temperature forecast for {city_name} is {temp:.1f}°C "
            f"(current observation: {current_obs.get('temperature_c', temp):.1f}°C). "
            f"Thermal risk level is {risk.get('components', {}).get('heat_assessment', {}).get('heat_category', 'Normal')}. {advisory_text}"
        )
    else:
        ans = (
            f"6-Hour Forecast for {city_name}: Temperature expected at {temp:.1f}°C with a {rain_prob * 100:.1f}% probability of rain "
            f"({rainfall_amt:.1f} mm). Overall meteorological hazard level is {risk_lvl}. {advisory_text}"
        )
    return ans


# -------------------------------------------------------------
# Microservice Routes
# -------------------------------------------------------------
@app.get("/")
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    """Health check returning loaded models and service metadata."""
    try:
        load_models(MODELS_DIR)
        models_ready = True
    except Exception as e:
        models_ready = False
        
    return {
        "status": "healthy",
        "service": "WeatherGPT AI & ML Microservice",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": models_ready,
        "supported_cities": list(CITY_COORDINATES.keys())
    }


@app.post("/api/v1/agent/query", response_model=AgentQueryResponse)
def agent_query(req: AgentQueryRequest):
    """
    Main Natural Language Agent endpoint invoked by backend chatService.js.
    Extracts location, queries live ML forecast, and synthesizes grounded answers.
    """
    # 1. Resolve Location (from coordinates, explicit city, or extracted from message)
    target_loc = req.city
    if not target_loc:
        if req.latitude is not None and req.longitude is not None:
            target_loc = (req.latitude, req.longitude)
        else:
            # Check if any supported city is mentioned in the query text
            msg_lower = req.message.lower()
            for key, val in CITY_COORDINATES.items():
                if key in msg_lower:
                    target_loc = val["name"]
                    break
            if not target_loc:
                target_loc = "Kolkata"  # Default city fallback
                
    try:
        live_result = get_live_weathergpt_forecast(target_loc, include_risk_assessment=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate live forecast: {str(e)}")
        
    city_name = live_result["city"]
    current_obs = live_result.get("current_observation", {})
    forecast_data = live_result.get("forecast_6h", {})
    risk_data = live_result.get("risk_assessment", {})
    
    # 2. Synthesize Grounded Natural Language Explanation
    answer_text = synthesize_grounded_answer(
        message=req.message,
        city_name=city_name,
        forecast=live_result,
        risk=risk_data,
        current_obs=current_obs,
        language=req.language
    )
    
    risk_level_str = risk_data.get("risk_level", "low").lower()
    
    return AgentQueryResponse(
        answer=answer_text,
        location=city_name,
        sources=[
            "WeatherGPT 6h XGBoost Temperature Regressor",
            "WeatherGPT Rain Classifier (F1: 0.67, AUC: 0.90)",
            "WeatherGPT Rainfall Amount LightGBM Regressor",
            "Open-Meteo Live Telemetry API",
            "IMD Risk & Hazard Engine"
        ],
        risk=risk_level_str,
        forecast={
            "temperature_c": forecast_data.get("predicted_temperature_c"),
            "rain_probability": forecast_data.get("rain_probability"),
            "rain_predicted": forecast_data.get("rain_predicted"),
            "rainfall_mm": forecast_data.get("predicted_rainfall_mm"),
            "target_time": forecast_data.get("target_time")
        },
        risk_assessment=risk_data
    )


@app.get("/api/v1/ml/forecast")
def get_live_forecast(
    city: Optional[str] = Query(None, description="City name (e.g. Kolkata, Mumbai, Delhi)"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    """
    Direct endpoint for fetching live 6-hour ML forecast and hazard indicators.
    """
    if city:
        query_loc = city
    elif lat is not None and lon is not None:
        query_loc = (lat, lon)
    else:
        query_loc = "Kolkata"
        
    try:
        return get_live_weathergpt_forecast(query_loc, include_risk_assessment=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ml/predict")
def batch_predict(req: PredictRequest):
    """
    Raw feature vector prediction endpoint.
    """
    try:
        df = pd.DataFrame(req.data)
        predictions = weathergpt_predict(df, include_risk_assessment=req.include_risk_assessment)
        if isinstance(predictions, pd.DataFrame):
            return {"predictions": predictions.to_dict(orient="records")}
        return {"predictions": [predictions]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")


@app.get("/api/v1/ml/metadata")
def get_metadata():
    """Returns trained model benchmarks, validation metrics, and hyperparameters."""
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    if not os.path.exists(meta_path):
        raise HTTPException(status_code=404, detail="Model metadata not found")
    with open(meta_path, "r") as f:
        return json.load(f)


from src.weathergpt_nwp_consensus import evaluate_nwp_consensus


@app.get("/api/v1/ml/consensus")
def get_nwp_consensus(
    city: Optional[str] = Query(None, description="City name (e.g. Kolkata, Mumbai, Delhi)"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    """
    Evaluates WeatherGPT ML forecast against global NWP models (ECMWF, GFS, ICON),
    computing ensemble spread, consensus confidence score, and detecting micro-climate anomalies.
    """
    if city:
        query_loc = city
    elif lat is not None and lon is not None:
        query_loc = (lat, lon)
    else:
        query_loc = "Mumbai"
        
    try:
        return evaluate_nwp_consensus(query_loc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ml/cities")
def get_cities():
    """Returns list of supported Indian cities and their coordinates."""
    return {"cities": list(CITY_COORDINATES.values())}


if __name__ == "__main__":
    import uvicorn
    print("Starting WeatherGPT AI & ML Microservice on port 8000...")
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=False)
