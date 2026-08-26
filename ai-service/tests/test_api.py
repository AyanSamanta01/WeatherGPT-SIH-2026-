import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

def test_api_health():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.get("/health")
    resp = asyncio.run(_run())
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_api_readiness():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.get("/ready")
    resp = asyncio.run(_run())
    assert resp.status_code == 200
    assert resp.json()["tools_registered"] > 0

def test_api_tools_list():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.get("/api/v1/agent/tools")
    resp = asyncio.run(_run())
    assert resp.status_code == 200
    assert "tools" in resp.json()
    assert len(resp.json()["tools"]) >= 5

def test_api_intent_endpoint():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post(
                "/api/v1/agent/intent",
                json={"message": "Will it rain tomorrow in Bengaluru?"}
            )
    resp = asyncio.run(_run())
    assert resp.status_code == 200
    data = resp.json()
    assert "forecast" in data["intent"]
    assert "Bengaluru" in (data.get("location_name") or "")

def test_api_rag_search():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post(
                "/api/v1/rag/search",
                json={"query": "IMD cyclone warning 4 stages"}
            )
    resp = asyncio.run(_run())
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) > 0
    assert "Cyclone" in results[0]["title"]

def test_api_agent_query_gateway_integration():
    """
    Test the exact endpoint and payload structure sent by Backend chatService.js
    """
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post(
                "/api/v1/agent/query",
                json={
                    "message": "Will I need an umbrella tomorrow in Mumbai?",
                    "latitude": 19.076,
                    "longitude": 72.877,
                    "language": "en",
                    "conversationId": "conv_test_sih_2026"
                }
            )
    resp = asyncio.run(_run())
    assert resp.status_code == 200
    res = resp.json()
    
    # Verify top-level backward compatibility fields
    assert "answer" in res
    assert "sources" in res
    assert "risk" in res
    assert len(res["sources"]) > 0

    # Verify structured data object
    assert "data" in res
    data = res["data"]
    assert data["conversation_id"] == "conv_test_sih_2026"
    assert data["guardrail_status"] == "passed"
    assert "tools_used" in data
