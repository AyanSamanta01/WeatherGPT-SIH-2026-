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
    RAGSearchResult
)
from .agents.weather_agent import default_weather_agent
from .agents.intent_classifier import default_intent_classifier
from .tools.tool_definitions import LLM_TOOL_DEFINITIONS
from .rag.knowledge_retriever import default_retriever

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
        "docs_url": "/docs"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "ai-service",
        "provider": settings.AI_PROVIDER,
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
