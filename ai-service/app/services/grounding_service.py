from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from ..models.schemas import WeatherCard
from ..models.enums import RiskLevel

class GroundingService:
    """
    Factual grounding, data validation, and structured WeatherCard assembly
    """
    def compute_risk(self, tool_data: Dict[str, Any]) -> RiskLevel:
        if not tool_data:
            return RiskLevel.LOW

        # Check for active severe alerts first
        if "active_alerts" in tool_data or "highest_severity" in tool_data:
            severity = tool_data.get("highest_severity", "GREEN").upper()
            if severity == "RED":
                return RiskLevel.EXTREME
            elif severity == "ORANGE":
                return RiskLevel.HIGH
            elif severity == "YELLOW":
                return RiskLevel.MODERATE
            return RiskLevel.LOW

        # Check daily forecast rain / wind
        if "daily" in tool_data:
            daily = tool_data.get("daily", [])
            max_prob = max([d.get("precipitation_probability", 0) for d in daily], default=0)
            max_wind = max([d.get("wind_speed_max_kmh", 0) for d in daily], default=0)
            max_temp = max([d.get("temperature_max", 25) for d in daily], default=25)

            if max_prob > 80 or max_wind > 60 or max_temp > 43:
                return RiskLevel.EXTREME
            elif max_prob > 60 or max_wind > 40 or max_temp > 38:
                return RiskLevel.HIGH
            elif max_prob > 35 or max_wind > 25 or max_temp > 33:
                return RiskLevel.MODERATE
            return RiskLevel.LOW

        # Current weather checks
        temp = tool_data.get("temperature", 25)
        wind = tool_data.get("wind_speed", 0)
        rain = tool_data.get("rainfall", 0)

        if rain > 50 or wind > 65 or temp > 43:
            return RiskLevel.EXTREME
        elif rain > 20 or wind > 45 or temp > 38:
            return RiskLevel.HIGH
        elif rain > 5 or wind > 25 or temp > 33:
            return RiskLevel.MODERATE

        return RiskLevel.LOW

    def assemble_weather_card(self, location: str, tool_data: Optional[Dict[str, Any]]) -> Optional[WeatherCard]:
        if not tool_data:
            return None

        risk = self.compute_risk(tool_data)

        # Forecast case
        if "daily" in tool_data and tool_data["daily"]:
            today = tool_data["daily"][0]
            tomorrow = tool_data["daily"][1] if len(tool_data["daily"]) > 1 else today
            return WeatherCard(
                location=location,
                temperature=today.get("temperature_max"),
                temp_max=today.get("temperature_max"),
                temp_min=today.get("temperature_min"),
                precipitation=tomorrow.get("precipitation_sum_mm", 0.0),
                precipitation_probability=tomorrow.get("precipitation_probability", 0),
                wind_speed=today.get("wind_speed_max_kmh"),
                condition=tomorrow.get("condition", "Partly Cloudy"),
                weather_code=tomorrow.get("weather_code", 0),
                risk_level=risk,
                source=tool_data.get("source", "Open-Meteo Multi-Model Ensemble NWP"),
                timestamp=datetime.now(timezone.utc).isoformat()
            )

        # Current observation case
        if "temperature" in tool_data:
            return WeatherCard(
                location=location,
                temperature=tool_data.get("temperature"),
                feels_like=tool_data.get("feels_like"),
                humidity=tool_data.get("humidity"),
                wind_speed=tool_data.get("wind_speed"),
                wind_direction=str(tool_data.get("wind_direction", "SW")),
                precipitation=tool_data.get("rainfall", 0.0),
                condition=tool_data.get("condition", "Clear"),
                weather_code=tool_data.get("weather_code", 0),
                risk_level=risk,
                source=tool_data.get("source", "Open-Meteo Global NWP Models (ECMWF/GFS)"),
                timestamp=tool_data.get("timestamp", datetime.now(timezone.utc).isoformat())
            )

        return None

    def extract_sources(self, tool_data: Optional[Dict[str, Any]], rag_sources: Optional[List[str]] = None) -> List[str]:
        sources = []
        if tool_data and "source" in tool_data:
            sources.append(tool_data["source"])
        if rag_sources:
            sources.extend(rag_sources)
        if not sources:
            sources.append("Open-Meteo GFS/ECMWF NWP")
        return list(dict.fromkeys(sources))

default_grounding_service = GroundingService()
