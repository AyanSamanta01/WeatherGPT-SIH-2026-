"""
Unit & Integration Tests for AI-Service & WeatherGPT ML Models Bridge
====================================================================
Verifies that the ReAct agent and tool executor seamlessly invoke
the 6h XGBoost/LightGBM ML models and NWP consensus analyzer.
"""

import pytest
from app.models.schemas import AgentQueryRequest
from app.models.enums import IntentCategory
from app.agents.intent_classifier import default_intent_classifier
from app.agents.tool_executor import default_tool_executor
from app.agents.weather_agent import default_weather_agent


def test_intent_classification_ml_forecast():
    """Verifies that 6-hour ML forecast queries trigger ML_FORECAST intent."""
    msg = "What is WeatherGPT's 6-hour ML model predicting for Kolkata?"
    res = default_intent_classifier.classify_intent(msg)
    assert res.intent == IntentCategory.ML_FORECAST
    assert "get_weathergpt_ml_forecast" in res.suggested_tools
    assert res.location_name == "Kolkata, West Bengal"


def test_intent_classification_nwp_consensus():
    """Verifies that model comparison queries trigger NWP_CONSENSUS intent."""
    msg = "Is there consensus between ECMWF, GFS and WeatherGPT for Mumbai?"
    res = default_intent_classifier.classify_intent(msg)
    assert res.intent == IntentCategory.NWP_CONSENSUS
    assert "get_nwp_model_consensus" in res.suggested_tools
    assert res.location_name == "Mumbai, Maharashtra"


@pytest.mark.asyncio
async def test_tool_execution_ml_forecast():
    """Verifies direct tool execution of get_weathergpt_ml_forecast."""
    res = await default_tool_executor.execute_tool(
        "get_weathergpt_ml_forecast",
        {"location_name": "Kolkata", "latitude": 22.5726, "longitude": 88.3639}
    )
    assert res.status == "success"
    assert "predicted_temperature_c" in res.data
    assert "rain_probability" in res.data
    assert "predicted_rainfall_mm" in res.data
    assert res.data["forecast_horizon"] == "6 hours"


@pytest.mark.asyncio
async def test_tool_execution_nwp_consensus():
    """Verifies direct tool execution of get_nwp_model_consensus."""
    res = await default_tool_executor.execute_tool(
        "get_nwp_model_consensus",
        {"location_name": "Delhi", "latitude": 28.6139, "longitude": 77.2090}
    )
    assert res.status == "success"
    assert "consensus_confidence_pct" in res.data
    assert "consensus_status" in res.data


@pytest.mark.asyncio
async def test_agent_end_to_end_ml_query():
    """Verifies end-to-end agent reasoning for an ML query."""
    req = AgentQueryRequest(
        message="Give me the 6h ML forecast for Mumbai with risk assessment",
        language="en"
    )
    resp = await default_weather_agent.process_query(req)
    assert resp.status == "success"
    assert resp.location is not None
    assert resp.data.weatherCard is not None

