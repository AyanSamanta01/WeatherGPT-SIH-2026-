import time
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import settings
from .models.schemas import (
    AgentQueryRequest,
    AgentQueryResponse,
    IntentResult,
    RAGSearchResult,
    VoiceQueryRequest,
    VoiceQueryResponse,
    TranscribeRequest,
    TranscribeResponse,
    SynthesizeRequest,
    SynthesizeResponse
)
from .agents.weather_agent import default_weather_agent
from .agents.intent_classifier import default_intent_classifier
from .tools.tool_definitions import LLM_TOOL_DEFINITIONS
from .rag.knowledge_retriever import default_retriever
from .services.voice_service import default_voice_service

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("WeatherGPT.AIService")

app = FastAPI(
    title="WeatherGPT AI/LLM Microservice",
    description="Agentic Natural-Language Weather Intelligence, RAG Retrieval, and Multilingual Reasoning for SIH 2026",
    version="1.0.0"
)

# Enable CORS for frontend and gateway communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RAGQueryRequest(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: Optional[int] = 2

@app.get("/")
async def root():
    return {
        "service": "WeatherGPT AI/LLM Microservice",
        "version": "1.0.0",
        "status": "operational",
        "configured_provider": settings.AI_PROVIDER,
        "voice_engine": "Native STT & Regional TTS Enabled",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "ai-service",
        "provider": settings.AI_PROVIDER,
        "voice_stt_tts": "active",
        "environment": settings.ENVIRONMENT
    }

@app.get("/ready")
async def readiness():
    return {
        "status": "ready",
        "tools_registered": len(LLM_TOOL_DEFINITIONS),
        "knowledge_chunks": len(default_retriever.documents)
    }

@app.post("/api/v1/agent/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest):
    """
    Main conversational AI entrypoint called by Backend chatService
    """
    try:
        response = await default_weather_agent.process_query(request)
        return response
    except Exception as err:
        logger.error(f"Agent processing failure: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Agent failed to process query: {str(err)}"
        )

@app.post("/api/v1/voice/query", response_model=VoiceQueryResponse)
async def query_voice_agent(request: VoiceQueryRequest):
    """
    Full Voice-in, Voice-out conversational entrypoint:
    Transcribes spoken audio -> Runs ReAct Meteorological Reasoning -> Synthesizes Regional Spoken Audio.
    """
    start_time = time.time()
    try:
        lang = request.language or "en"
        fmt = request.audio_format or "wav"

        # 1. Speech-to-Text Transcription
        transcript, confidence = await default_voice_service.transcribe_audio(
            audio_base64=request.audio_base64 or "",
            audio_format=fmt,
            language=lang
        )

        # 2. Run ReAct Agent Reasoning
        agent_req = AgentQueryRequest(
            message=transcript,
            latitude=request.latitude,
            longitude=request.longitude,
            language=lang,
            conversationId=request.conversationId,
            sector=request.sector
        )
        agent_resp = await default_weather_agent.process_query(agent_req)

        answer_text = agent_resp.answer
        weather_card = agent_resp.data.weatherCard if agent_resp.data else None
        loc_name = agent_resp.location
        risk_lvl = agent_resp.risk
        sources = agent_resp.sources

        # 3. Text-to-Speech Audio Synthesis (if requested)
        audio_b64 = None
        audio_mime = "audio/mp3"
        if request.synthesize_audio:
            audio_b64, audio_mime = await default_voice_service.synthesize_speech(
                text=answer_text,
                language=lang,
                speed=request.voice_speed or 1.0
            )

        proc_ms = round((time.time() - start_time) * 1000, 2)

        return VoiceQueryResponse(
            status="success",
            transcript=transcript,
            answer=answer_text,
            location=loc_name,
            risk=risk_lvl,
            sources=sources,
            conversationId=request.conversationId or agent_resp.conversationId,
            weatherCard=weather_card,
            audio_base64=audio_b64,
            audio_format=audio_mime,
            language=lang,
            processing_time_ms=proc_ms
        )

    except Exception as err:
        logger.error(f"Voice Agent processing failure: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice Agent failed to process query: {str(err)}"
        )

@app.post("/api/v1/voice/transcribe", response_model=TranscribeResponse)
async def transcribe_audio_endpoint(request: TranscribeRequest):
    """
    Direct Speech-to-Text (STT) transcription endpoint
    """
    try:
        transcript, conf = await default_voice_service.transcribe_audio(
            audio_base64=request.audio_base64,
            audio_format=request.audio_format or "wav",
            language=request.language or "en"
        )
        return TranscribeResponse(
            status="success",
            transcript=transcript,
            confidence=conf,
            language=request.language or "en"
        )
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.post("/api/v1/voice/synthesize", response_model=SynthesizeResponse)
async def synthesize_speech_endpoint(request: SynthesizeRequest):
    """
    Direct Text-to-Speech (TTS) audio generation endpoint
    """
    try:
        audio_b64, audio_mime = await default_voice_service.synthesize_speech(
            text=request.text,
            language=request.language or "en",
            speed=request.speed or 1.0
        )
        return SynthesizeResponse(
            status="success",
            audio_base64=audio_b64,
            audio_format=audio_mime,
            language=request.language or "en"
        )
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.post("/api/v1/agent/intent", response_model=IntentResult)
async def extract_intent(request: AgentQueryRequest):
    """
    Direct NLU intent detection & slot extraction endpoint
    """
    try:
        msg = request.message or request.prompt or ""
        return default_intent_classifier.classify_intent(
            message=msg,
            explicit_lat=request.latitude,
            explicit_lon=request.longitude
        )
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.get("/api/v1/agent/tools")
async def get_available_tools():
    """
    Retrieve registered LLM tool schemas for external agent integration
    """
    return {
        "status": "success",
        "tools": LLM_TOOL_DEFINITIONS
    }

@app.post("/api/v1/rag/search", response_model=List[RAGSearchResult])
async def search_domain_knowledge(request: RAGQueryRequest):
    """
    Query meteorological RAG domain knowledge base
    """
    try:
        results = default_retriever.search(
            query=request.query,
            category=request.category,
            top_k=request.top_k or 2
        )
        return results
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )

