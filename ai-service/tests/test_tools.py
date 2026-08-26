import asyncio
import pytest
from app.agents.tool_executor import default_tool_executor
from app.tools.agri_tools import calculate_heat_index, calculate_biometeorology, get_agricultural_advisory

def test_get_current_weather_tool():
    async def _run():
        return await default_tool_executor.execute_tool(
            "get_current_weather",
            {"location_name": "Mumbai", "latitude": 19.076, "longitude": 72.877}
        )
    res = asyncio.run(_run())
    assert res.status == "success"
    assert "temperature" in res.data
    assert "humidity" in res.data
    assert "source" in res.data

def test_get_weather_forecast_tool():
    async def _run():
        return await default_tool_executor.execute_tool(
            "get_weather_forecast",
            {"location_name": "Kolkata", "latitude": 22.57, "longitude": 88.36, "days": 3}
        )
    res = asyncio.run(_run())
    assert res.status == "success"
    assert "daily" in res.data
    assert len(res.data["daily"]) >= 1

def test_get_active_alerts_tool():
    async def _run():
        return await default_tool_executor.execute_tool(
            "get_active_alerts",
            {"location_name": "Puri, Odisha"}
        )
    res = asyncio.run(_run())
    assert res.status == "success"
    assert "active_alerts" in res.data
    assert "highest_severity" in res.data

def test_heat_index_calculation():
    # 35°C with 70% humidity should yield high heat index > 40°C
    hi = calculate_heat_index(35.0, 70.0)
    assert hi > 40.0

    # 25°C with 50% humidity should remain close to 25°C
    hi_mild = calculate_heat_index(25.0, 50.0)
    assert 24.0 <= hi_mild <= 27.0

def test_biometeorology_extremes():
    bio = calculate_biometeorology(38.0, 80.0, 10.0)
    assert bio["thermal_stress_level"] in ["DANGER", "EXTREME DANGER"]
    assert "heat_index_c" in bio
    assert "wet_bulb_temperature_c" in bio

def test_agricultural_spraying_advisory():
    # Unfavorable due to high wind (>15 km/h)
    res_windy = get_agricultural_advisory("Mustard", "spraying", 25.0, 10.0, 22.0)
    assert res_windy["is_suitable"] is False
    assert res_windy["verdict"] == "NOT RECOMMENDED"

    # Favorable (low wind, low rain prob)
    res_good = get_agricultural_advisory("Wheat", "spraying", 22.0, 10.0, 8.0)
    assert res_good["is_suitable"] is True
    assert res_good["verdict"] == "SUITABLE"
