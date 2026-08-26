import time
from typing import Dict, Any, List, Optional
from ..models.schemas import ToolCallRequest, ToolCallResult
from ..tools.weather_tools import (
    get_current_weather,
    get_weather_forecast,
    get_weathergpt_ml_forecast,
    get_nwp_model_consensus
)
from ..tools.alert_tools import get_active_alerts
from ..tools.climate_tools import get_climate_trends
from ..tools.agri_tools import calculate_biometeorology, get_agricultural_advisory
from ..tools.geocoding_tools import geocode_location
from ..rag.knowledge_retriever import default_retriever

class ToolExecutor:
    """
    Tool execution and dispatch registry for autonomous ReAct agent loop
    """
    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> ToolCallResult:
        start_time = time.time()
        try:
            name = tool_name.strip()
            args = arguments or {}

            if name == "get_current_weather":
                data = await get_current_weather(
                    location_name=args.get("location_name"),
                    latitude=args.get("latitude"),
                    longitude=args.get("longitude"),
                    units=args.get("units", "metric")
                )
            elif name == "get_weathergpt_ml_forecast":
                data = await get_weathergpt_ml_forecast(
                    location_name=args.get("location_name"),
                    latitude=args.get("latitude"),
                    longitude=args.get("longitude")
                )
            elif name == "get_nwp_model_consensus":
                data = await get_nwp_model_consensus(
                    location_name=args.get("location_name"),
                    latitude=args.get("latitude"),
                    longitude=args.get("longitude")
                )
            elif name == "get_weather_forecast":
                data = await get_weather_forecast(
                    location_name=args.get("location_name"),
                    latitude=args.get("latitude"),
                    longitude=args.get("longitude"),
                    days=args.get("days", 3),
                    variables=args.get("variables")
                )
            elif name == "get_active_alerts":
                data = await get_active_alerts(
                    location_name=args.get("location_name"),
                    latitude=args.get("latitude"),
                    longitude=args.get("longitude"),
                    alert_type=args.get("alert_type", "all")
                )
            elif name == "get_climate_trends":
                data = await get_climate_trends(
                    location_name=args.get("location_name"),
                    latitude=args.get("latitude"),
                    longitude=args.get("longitude"),
                    years=args.get("years", 10)
                )
            elif name == "calculate_biometeorology":
                data = calculate_biometeorology(
                    temperature_c=args.get("temperature_c", 28.0),
                    humidity_percent=args.get("humidity_percent", 65.0),
                    wind_speed_kmh=args.get("wind_speed_kmh", 10.0)
                )
            elif name == "get_agricultural_advisory":
                data = get_agricultural_advisory(
                    crop_name=args.get("crop_name", "general"),
                    operation=args.get("operation", "spraying"),
                    temperature_c=args.get("temperature_c", 28.0),
                    rainfall_prob=args.get("rainfall_prob", 10.0),
                    wind_speed_kmh=args.get("wind_speed_kmh", 10.0)
                )
            elif name == "geocode_location":
                lat, lon, full_name = await geocode_location(args.get("location_name", ""))
                data = {"latitude": lat, "longitude": lon, "formatted_name": full_name}
            elif name == "search_meteorological_knowledge":
                results = default_retriever.search(
                    query=args.get("query", ""),
                    category=args.get("category"),
                    top_k=args.get("top_k", 2)
                )
                data = {"results": [r.dict() for r in results]}
            else:
                return ToolCallResult(
                    tool_name=tool_name,
                    status="error",
                    error_message=f"Unknown tool requested: {tool_name}",
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            return ToolCallResult(
                tool_name=tool_name,
                status="success",
                data=data,
                execution_time_ms=round((time.time() - start_time) * 1000, 2)
            )

        except Exception as err:
            return ToolCallResult(
                tool_name=tool_name,
                status="error",
                error_message=str(err),
                execution_time_ms=round((time.time() - start_time) * 1000, 2)
            )

default_tool_executor = ToolExecutor()
