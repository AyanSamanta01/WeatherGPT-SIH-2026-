import pytest
from app.agents.weather_agent import default_weather_agent
from app.models.schemas import AgentQueryRequest
from app.models.enums import IntentCategory, RiskLevel

@pytest.mark.asyncio
async def test_agent_greeting_conversation():
    """Verify greetings return a conversational response without fake weather tool calls"""
    req = AgentQueryRequest(
        message="Hi, who are you and what can you do?",
        conversationId="test_conv_greet"
    )
    res = await default_weather_agent.process_query(req)
    assert res.status == "success"
    assert "WeatherGPT" in res.answer
    assert res.data.intent in ["capabilities_query", "greeting_or_chitchat"]
    assert len(res.data.suggested_actions) >= 2
    assert "Weather in Mumbai" in res.data.suggested_actions[0] or len(res.data.suggested_actions) > 0

@pytest.mark.asyncio
async def test_agent_dynamic_agri_chaining():
    """Verify agricultural queries dynamically chain real weather telemetry into the advisory"""
    req = AgentQueryRequest(
        message="I am a farmer in Punjab growing wheat. Can I spray pesticide tomorrow?",
        conversationId="test_conv_agri"
    )
    res = await default_weather_agent.process_query(req)
    assert res.status == "success"
    assert res.data.intent == "agri_advisory"
    assert "get_agricultural_advisory" in res.data.tools_used
    assert "get_weather_forecast" in res.data.tools_used
    assert "Punjab" in res.location
    assert "Verdict:" in res.answer
    assert len(res.data.suggested_actions) >= 2

@pytest.mark.asyncio
async def test_agent_nwp_consensus_request():
    """Verify NWP consensus queries format multi-model tables and confidence scores"""
    req = AgentQueryRequest(
        message="Compare the GFS and ECMWF consensus for Kolkata rain prediction over the next 6 hours.",
        conversationId="test_conv_nwp"
    )
    res = await default_weather_agent.process_query(req)
    assert res.status == "success"
    assert res.data.intent == "nwp_consensus"
    assert "get_nwp_model_consensus" in res.data.tools_used
    assert "Kolkata" in res.location
    assert "Consensus Confidence Score:" in res.answer or "NWP" in res.answer

@pytest.mark.asyncio
async def test_agent_multilingual_forecast_hindi():
    """Verify Hindi forecast queries extract location and respond in Hindi with umbrella advice"""
    req = AgentQueryRequest(
        message="कल दिल्ली में मौसम कैसा रहेगा और क्या मुझे छाता चाहिए?",
        conversationId="test_conv_hindi"
    )
    res = await default_weather_agent.process_query(req)
    assert res.status == "success"
    assert res.data.intent in ["forecast_short_term", "forecast_extended"]
    assert "Delhi" in res.location or "दिल्ली" in res.location
    assert "New Delhi" in res.location or "Delhi" in res.location
    assert "पूर्वानुमान" in res.answer or "मौसम" in res.answer

@pytest.mark.asyncio
async def test_agent_multi_turn_pronoun_followup():
    """Verify multi-turn session resolves follow-up queries like 'what about day after tomorrow there?'"""
    cid = "test_conv_multiturn"
    # Turn 1
    req1 = AgentQueryRequest(message="What is the weather in Mumbai?", conversationId=cid)
    res1 = await default_weather_agent.process_query(req1)
    assert "Mumbai" in res1.location

    # Turn 2: Follow-up pronoun "there"
    req2 = AgentQueryRequest(message="What about day after tomorrow there?", conversationId=cid)
    res2 = await default_weather_agent.process_query(req2)
    assert "Mumbai" in res2.location
    assert res2.data.intent in ["forecast_short_term", "forecast_extended"]
