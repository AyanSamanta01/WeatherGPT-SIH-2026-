"""
WeatherGPT AI & ML Microservice (Port 8000)
===========================================
FastAPI server serving ML forecast predictions, meteorological hazard assessments,
and natural language query reasoning for the WeatherGPT backend and frontend.
"""

import sys
import os
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure ai-service directory is in python path
AI_SERVICE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ai-service")
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

from src.weathergpt_predict import weathergpt_predict, load_models
from src.weathergpt_risk_engine import assess_weather_risk
from src.weathergpt_live_features import (
    get_live_weathergpt_forecast,
    resolve_location,
    CITY_COORDINATES
)
try:
    from app.services.voice_service import default_voice_service
except Exception as e:
    default_voice_service = None

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


class VoiceQueryRequest(BaseModel):
    audio_base64: Optional[str] = Field(None, description="Base64 encoded audio bytes")
    audio_format: Optional[str] = Field("wav", description="Audio format: wav, mp3, ogg, webm")
    message: Optional[str] = Field(None, description="Optional text query if pre-transcribed")
    latitude: Optional[float] = Field(None, example=19.0760)
    longitude: Optional[float] = Field(None, example=72.8777)
    city: Optional[str] = Field(None, example="Mumbai")
    language: str = Field("en", example="en")
    conversationId: Optional[str] = Field(None, example="conv_12345")
    synthesize_audio: bool = Field(True, description="Whether to return synthesized spoken audio")
    voice_speed: float = Field(1.0, description="Speech rate multiplier")


class VoiceQueryResponse(BaseModel):
    status: str = "success"
    transcript: str
    answer: str
    location: str
    risk: str
    sources: List[str]
    forecast: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    audio_base64: Optional[str] = None
    audio_format: Optional[str] = "audio/mp3"
    language: str = "en"
    processing_time_ms: float = 0.0


class SynthesizeRequest(BaseModel):
    text: str
    language: str = "en"
    speed: float = 1.0


class SynthesizeResponse(BaseModel):
    status: str = "success"
    audio_base64: str
    audio_format: str = "audio/mp3"
    language: str = "en"


class TranscribeRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio bytes")
    audio_format: Optional[str] = Field("wav", description="Audio format: wav, mp3, ogg, webm")
    language: Optional[str] = Field("en", description="Target language ISO code")


class TranscribeResponse(BaseModel):
    status: str = "success"
    text: str
    confidence: float
    language: str


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

    elif language == "bn":
        # Bengali response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name}-এ আগামী ৬ ঘণ্টায় বৃষ্টির সম্ভাবনা {rain_prob * 100:.0f}% (প্রায় {rainfall_amt:.1f} মিমি)। {advisory_text}"
            else:
                ans = f"{city_name}-এ আগামী ৬ ঘণ্টায় বৃষ্টির সম্ভাবনা কম ({rain_prob * 100:.0f}%)। তাপমাত্রা প্রায় {temp:.1f}°C থাকবে। {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name}-এ ৬ ঘণ্টার পূর্বাভাসিত তাপমাত্রা {temp:.1f}°C। {advisory_text}"
        else:
            ans = f"{city_name}-এর ৬ ঘণ্টার পূর্বাভাস: তাপমাত্রা {temp:.1f}°C, বৃষ্টিপাতের সম্ভাবনা {rain_prob * 100:.0f}% ({rainfall_amt:.1f} মিমি)। আবহাওয়া ঝুঁকি স্তর: {risk_lvl}। {advisory_text}"
        return ans

    elif language == "ta":
        # Tamil response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} பகுதியில் அடுத்த 6 மணி நேரத்தில் மழை பெய்ய {rain_prob * 100:.0f}% வாய்ப்புள்ளது (சுமார் {rainfall_amt:.1f} மிமீ). {advisory_text}"
            else:
                ans = f"{city_name} பகுதியில் அடுத்த 6 மணி நேரத்தில் மழைக்கான வாய்ப்பு குறைவு ({rain_prob * 100:.0f}%). வெப்பநிலை {temp:.1f}°C ஆக இருக்கும். {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} பகுதிக்கான 6 மணி நேர வெப்பநிலை முன்னறிவிப்பு {temp:.1f}°C. {advisory_text}"
        else:
            ans = f"{city_name} 6 மணி நேர வானிலை முன்னறிவிப்பு: வெப்பநிலை {temp:.1f}°C, மழை வாய்ப்பு {rain_prob * 100:.0f}% ({rainfall_amt:.1f} மிமீ). வானிலை அபாய நிலை: {risk_lvl}. {advisory_text}"
        return ans

    elif language == "te":
        # Telugu response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} లో రాబోయే 6 గంటల్లో వర్షం పడే అవకాశం {rain_prob * 100:.0f}% ఉంది (సుమారు {rainfall_amt:.1f} మిమీ). {advisory_text}"
            else:
                ans = f"{city_name} లో రాబోయే 6 గంటల్లో వర్ష సూచన తక్కువ ({rain_prob * 100:.0f}%). ఉష్ణోగ్రత దాదాపు {temp:.1f}°C ఉంటుంది. {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} లో 6 గంటల ఉష్ణోగ్రత అంచనా {temp:.1f}°C. {advisory_text}"
        else:
            ans = f"{city_name} 6 గంటల వాతావరణ అంచనా: ఉష్ణోగ్రత {temp:.1f}°C, వర్షపాత సంభావ్యత {rain_prob * 100:.0f}% ({rainfall_amt:.1f} మిమీ). వాతావరణ ప్రమాద స్థాయి: {risk_lvl}. {advisory_text}"
        return ans

    elif language == "mr":
        # Marathi response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} मध्ये पुढील ६ तासांत पावसाची {rain_prob * 100:.0f}% शक्यता आहे (अंदाजे {rainfall_amt:.1f} मिमी). {advisory_text}"
            else:
                ans = f"{city_name} मध्ये पुढील ६ तासांत पावसाची शक्यता कमी ({rain_prob * 100:.0f}%) आहे. तापमान सुमारे {temp:.1f}°C राहील. {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} मध्ये ६ तासांचे अंदाजित तापमान {temp:.1f}°C आहे. {advisory_text}"
        else:
            ans = f"{city_name} चा ६ तासांचा अंदाज: तापमान {temp:.1f}°C, पावसाची शक्यता {rain_prob * 100:.0f}% ({rainfall_amt:.1f} मिमी). हवामान धोका पातळी: {risk_lvl}। {advisory_text}"
        return ans

    elif language == "gu":
        # Gujarati response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} માં આગામી 6 કલાકમાં વરસાદની {rain_prob * 100:.0f}% શક્યતા છે (અંદાજે {rainfall_amt:.1f} મીમી). {advisory_text}"
            else:
                ans = f"{city_name} માં આગામી 6 કલાકમાં વરસાદની શક્યતા ઓછી ({rain_prob * 100:.0f}%) છે. તાપમાન લગભગ {temp:.1f}°C રહેશે. {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} માં 6 કલાકનું અનુમાનિત તાપમાન {temp:.1f}°C છે. {advisory_text}"
        else:
            ans = f"{city_name} નું 6 કલાકનું હવામાન અનુમાન: તાપમાન {temp:.1f}°C, વરસાદની શક્યતા {rain_prob * 100:.0f}% ({rainfall_amt:.1f} મીમી). હવામાન જોખમ સ્તર: {risk_lvl}. {advisory_text}"
        return ans

    elif language == "kn":
        # Kannada response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} ನಲ್ಲಿ ಮುಂದಿನ 6 ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ {rain_prob * 100:.0f}% ಇದೆ (ಸುಮಾರು {rainfall_amt:.1f} ಮಿಮೀ). {advisory_text}"
            else:
                ans = f"{city_name} ನಲ್ಲಿ ಮುಂದಿನ 6 ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಕಡಿಮೆ ({rain_prob * 100:.0f}%). ತಾಪಮಾನ ಸುಮಾರು {temp:.1f}°C ಇರುತ್ತದೆ. {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} ನಲ್ಲಿ 6 ಗಂಟೆಗಳ ಅಂದಾಜು ತಾಪಮಾನ {temp:.1f}°C. {advisory_text}"
        else:
            ans = f"{city_name} ನ 6 ಗಂಟೆಗಳ ಮುನ್ಸೂಚನೆ: ತಾಪಮಾನ {temp:.1f}°C, ಮಳೆ ಸಾಧ್ಯತೆ {rain_prob * 100:.0f}% ({rainfall_amt:.1f} ಮಿಮೀ). ಹವಾಮಾನ ಅಪಾಯದ ಮಟ್ಟ: {risk_lvl}. {advisory_text}"
        return ans

    elif language == "ml":
        # Malayalam response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} ൽ അടുത്ത 6 മണിക്കൂറിൽ മഴയ്ക്ക് {rain_prob * 100:.0f}% സാധ്യതയുണ്ട് (ഏകദേശം {rainfall_amt:.1f} മി.മീ). {advisory_text}"
            else:
                ans = f"{city_name} ൽ അടുത്ത 6 മണിക്കൂറിൽ മഴയ്ക്ക് സാധ്യത കുറവാണ് ({rain_prob * 100:.0f}%). താപനില ഏകദേശം {temp:.1f}°C ആയിരിക്കും. {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} ലെ 6 മണിക്കൂർ താപനില പ്രവചനം {temp:.1f}°C ആണ്. {advisory_text}"
        else:
            ans = f"{city_name} ലെ 6 മണിക്കൂർ കാലാവസ്ഥാ പ്രവചനം: താപനില {temp:.1f}°C, മഴ സാധ്യത {rain_prob * 100:.0f}% ({rainfall_amt:.1f} മി.മീ). അപകട നില: {risk_lvl}. {advisory_text}"
        return ans

    elif language == "pa":
        # Punjabi response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} ਵਿੱਚ ਅਗਲੇ 6 ਘੰਟਿਆਂ ਵਿੱਚ ਮੀਂਹ ਪੈਣ ਦੀ {rain_prob * 100:.0f}% ਸੰਭਾਵਨਾ ਹੈ (ਲਗਭਗ {rainfall_amt:.1f} ਮਿਮੀ)। {advisory_text}"
            else:
                ans = f"{city_name} ਵਿੱਚ ਅਗਲੇ 6 ਘੰਟਿਆਂ ਵਿੱਚ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਘੱਟ ({rain_prob * 100:.0f}%) ਹੈ। ਤਾਪਮਾਨ ਲਗਭਗ {temp:.1f}°C ਰਹੇਗਾ। {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} ਵਿੱਚ 6 ਘੰਟੇ ਦਾ ਪੂਰਵ ਅਨੁਮਾਨਿਤ ਤਾਪਮਾਨ {temp:.1f}°C ਹੈ। {advisory_text}"
        else:
            ans = f"{city_name} ਦਾ 6 ਘੰਟੇ ਦਾ ਪੂਰਵ ਅਨੁਮਾਨ: ਤਾਪਮਾਨ {temp:.1f}°C, ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ {rain_prob * 100:.0f}% ({rainfall_amt:.1f} ਮਿਮੀ)। ਮੌਸਮ ਖ਼ਤਰਾ ਪੱਧਰ: {risk_lvl}। {advisory_text}"
        return ans

    elif language == "or":
        # Odia response
        if is_rain_query:
            if rain_pred or rain_prob > 0.5:
                ans = f"{city_name} ରେ ଆଗାମୀ 6 ଘଣ୍ଟାରେ ବର୍ଷା ହେବାର ସମ୍ଭାବନା {rain_prob * 100:.0f}% ଅଛି (ପ୍ରାୟ {rainfall_amt:.1f} ମିମି)। {advisory_text}"
            else:
                ans = f"{city_name} ରେ ଆଗାମୀ 6 ଘଣ୍ଟାରେ ବର୍ଷା ସମ୍ଭାବନା କମ୍ ({rain_prob * 100:.0f}%)। ତାପମାତ୍ରା ପ୍ରାୟ {temp:.1f}°C ରହିବ। {advisory_text}"
        elif is_temp_query:
            ans = f"{city_name} ରେ 6 ଘଣ୍ଟାର ପୂର୍ବାନୁମାନ ତାପମାତ୍ରା {temp:.1f}°C। {advisory_text}"
        else:
            ans = f"{city_name} ର 6 ଘଣ୍ଟାର ପୂର୍ବାନୁମାନ: ତାପମାତ୍ରା {temp:.1f}°C, ବର୍ଷା ସମ୍ଭାବନା {rain_prob * 100:.0f}% ({rainfall_amt:.1f} ମିମି)। ବିପଦ ସ୍ତର: {risk_lvl}। {advisory_text}"
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


@app.post("/api/v1/voice/query", response_model=VoiceQueryResponse)
async def voice_query(req: VoiceQueryRequest):
    """
    Voice-in, Voice-out conversational endpoint:
    Accepts speech audio, transcribes it, runs ML forecast reasoning,
    and returns grounded text along with synthesized speech audio.
    """
    start_time = time.time()
    lang = req.language or "en"
    fmt = req.audio_format or "wav"

    # 1. Transcribe speech if audio base64 provided
    transcript = req.message or ""
    if req.audio_base64 and default_voice_service:
        transcribed, _ = await default_voice_service.transcribe_audio(
            audio_base64=req.audio_base64,
            audio_format=fmt,
            language=lang
        )
        if transcribed:
            transcript = transcribed

    if not transcript:
        transcript = "What is the weather forecast for today?"

    # 2. Run agent query reasoning
    agent_req = AgentQueryRequest(
        message=transcript,
        latitude=req.latitude,
        longitude=req.longitude,
        city=req.city,
        language=lang,
        conversationId=req.conversationId
    )
    agent_resp = agent_query(agent_req)

    # 3. Synthesize speech audio
    audio_b64 = None
    audio_mime = "audio/mp3"
    if req.synthesize_audio and default_voice_service:
        audio_b64, audio_mime = await default_voice_service.synthesize_speech(
            text=agent_resp.answer,
            language=lang,
            speed=req.voice_speed
        )

    proc_time_ms = round((time.time() - start_time) * 1000, 2)

    return VoiceQueryResponse(
        status="success",
        transcript=transcript,
        answer=agent_resp.answer,
        location=agent_resp.location,
        risk=agent_resp.risk,
        sources=agent_resp.sources,
        forecast=agent_resp.forecast,
        risk_assessment=agent_resp.risk_assessment,
        audio_base64=audio_b64,
        audio_format=audio_mime,
        language=lang,
        processing_time_ms=proc_time_ms
    )


@app.post("/api/v1/voice/synthesize", response_model=SynthesizeResponse)
async def voice_synthesize(req: SynthesizeRequest):
    """
    Direct Text-to-Speech (TTS) audio synthesis endpoint
    """
    if not default_voice_service:
        raise HTTPException(status_code=500, detail="Voice service not initialized")
    try:
        audio_b64, audio_mime = await default_voice_service.synthesize_speech(
            text=req.text,
            language=req.language or "en",
            speed=req.speed or 1.0
        )
        return SynthesizeResponse(
            status="success",
            audio_base64=audio_b64,
            audio_format=audio_mime,
            language=req.language or "en"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/voice/transcribe", response_model=TranscribeResponse)
async def voice_transcribe(req: TranscribeRequest):
    """
    Direct Speech-to-Text (STT) audio transcription endpoint
    """
    if not default_voice_service:
        raise HTTPException(status_code=500, detail="Voice service not initialized")
    try:
        text, conf = await default_voice_service.transcribe_audio(
            audio_base64=req.audio_base64,
            audio_format=req.audio_format or "wav",
            language=req.language or "en"
        )
        return TranscribeResponse(
            status="success",
            text=text,
            confidence=conf,
            language=req.language or "en"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
