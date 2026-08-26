"""
WeatherGPT Alert Rules & IMD SOP Severity Engine
================================================
Evaluates live weather telemetry or NWP forecast metrics against authoritative
India Meteorological Department (IMD) and NDMA disaster warning thresholds.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


class IMDColorCode:
    GREEN = {"level": "Green", "hex": "#22c55e", "meaning": "NO WARNING", "action": "No specific action required."}
    YELLOW = {"level": "Yellow", "hex": "#eab308", "meaning": "WATCH (Be Updated)", "action": "Stay updated on evolving weather conditions."}
    ORANGE = {"level": "Orange", "hex": "#f97316", "meaning": "ALERT (Be Prepared)", "action": "Prepare for disruption. Avoid vulnerable outdoor areas."}
    RED = {"level": "Red", "hex": "#ef4444", "meaning": "WARNING (Take Action)", "action": "Take immediate protective safety action. Follow disaster authority directives."}


class AlertRulesEngine:
    """
    Evaluates meteorological variables and produces structured, standardized warnings.
    """

    @staticmethod
    def evaluate_rainfall(rainfall_mm: float) -> Dict[str, Any]:
        """
        IMD Standard 24h / 6h Rainfall Classification:
        - Very Light: 0.1 - 2.4 mm
        - Light: 2.5 - 15.5 mm
        - Moderate: 15.6 - 64.4 mm
        - Heavy: 64.5 - 115.5 mm (Yellow/Orange)
        - Very Heavy: 115.6 - 204.4 mm (Orange/Red)
        - Extremely Heavy: >= 204.5 mm (Red)
        """
        if rainfall_mm >= 204.5:
            return {
                "category": "Extremely Heavy Rain",
                "severity": "EMERGENCY",
                "color_code": IMDColorCode.RED,
                "hazard_score": 95,
                "advisories": [
                    "Catastrophic flash flooding and widespread inundation expected.",
                    "Complete suspension of non-emergency movement.",
                    "Move immediately to higher ground from low-lying areas."
                ]
            }
        elif rainfall_mm >= 115.6:
            return {
                "category": "Very Heavy Rain",
                "severity": "WARNING",
                "color_code": IMDColorCode.ORANGE,
                "hazard_score": 75,
                "advisories": [
                    "Severe waterlogging and localized flash floods likely.",
                    "Avoid traveling on waterlogged roads and subways.",
                    "Farmers should clear drainage channels in standing crops."
                ]
            }
        elif rainfall_mm >= 64.5:
            return {
                "category": "Heavy Rain",
                "severity": "WATCH",
                "color_code": IMDColorCode.YELLOW,
                "hazard_score": 50,
                "advisories": [
                    "Heavy rain expected. Traffic congestion likely.",
                    "Postpone agricultural spraying and fertilizer application."
                ]
            }
        elif rainfall_mm >= 15.6:
            return {
                "category": "Moderate Rain",
                "severity": "INFO",
                "color_code": IMDColorCode.GREEN,
                "hazard_score": 20,
                "advisories": ["Normal wet weather. Carry rain gear."]
            }
        else:
            return {
                "category": "Light / No Rain",
                "severity": "INFO",
                "color_code": IMDColorCode.GREEN,
                "hazard_score": 0,
                "advisories": []
            }

    @staticmethod
    def evaluate_wind(wind_speed_kmh: float, gust_speed_kmh: Optional[float] = None) -> Dict[str, Any]:
        """
        IMD / Beaufort Gale and Cyclone Wind Thresholds:
        - Squally Wind: 45 - 61 km/h (Yellow)
        - Gale Wind: 62 - 88 km/h (Orange)
        - Severe Cyclonic Storm Force: >= 89 km/h (Red)
        """
        peak_wind = max(wind_speed_kmh, (gust_speed_kmh or wind_speed_kmh))

        if peak_wind >= 89.0:
            return {
                "category": "Severe Cyclonic Gale Force Wind",
                "severity": "EMERGENCY",
                "color_code": IMDColorCode.RED,
                "hazard_score": 90,
                "advisories": [
                    "Dangerous structural damage, uprooting of large trees and power poles.",
                    "Total suspension of fishing and marine operations.",
                    "Stay inside reinforced brick buildings away from glass windows."
                ]
            }
        elif peak_wind >= 62.0:
            return {
                "category": "Gale Force Wind",
                "severity": "WARNING",
                "color_code": IMDColorCode.ORANGE,
                "hazard_score": 68,
                "advisories": [
                    "Minor structural damage to thatched roofs and tin sheds.",
                    "Small boats and trawlers must return immediately to harbor.",
                    "Secure loose rooftop objects, signboards, and outdoor furniture."
                ]
            }
        elif peak_wind >= 45.0:
            return {
                "category": "Squally Wind",
                "severity": "WATCH",
                "color_code": IMDColorCode.YELLOW,
                "hazard_score": 40,
                "advisories": [
                    "Squally wind conditions. Fishermen advised not to venture into deep sea."
                ]
            }
        else:
            return {
                "category": "Calm / Moderate Breeze",
                "severity": "INFO",
                "color_code": IMDColorCode.GREEN,
                "hazard_score": 0,
                "advisories": []
            }

    @staticmethod
    def evaluate_thermal_extremes(temperature_c: float, relative_humidity_pct: float = 50.0) -> Dict[str, Any]:
        """
        Evaluates Heatwave and Coldwave conditions based on IMD criteria.
        """
        # Heatwave Criteria (Plains: max temp >= 40°C, Severe >= 45°C)
        if temperature_c >= 45.0:
            return {
                "category": "Severe Heatwave",
                "severity": "EMERGENCY",
                "color_code": IMDColorCode.RED,
                "hazard_score": 85,
                "advisories": [
                    "Extreme heat danger. High likelihood of heat stroke across all age groups.",
                    "Avoid sun exposure between 11:00 AM and 4:00 PM.",
                    "Drink oral rehydration salts (ORS), lassi, lemon water frequently."
                ]
            }
        elif temperature_c >= 40.0:
            return {
                "category": "Heatwave",
                "severity": "WARNING",
                "color_code": IMDColorCode.ORANGE,
                "hazard_score": 60,
                "advisories": [
                    "Moderate health risk for vulnerable populations (infants, elderly).",
                    "Keep cattle in shaded sheds with clean drinking water."
                ]
            }
        elif temperature_c <= 4.0:
            return {
                "category": "Severe Coldwave",
                "severity": "WARNING",
                "color_code": IMDColorCode.ORANGE,
                "hazard_score": 65,
                "advisories": [
                    "Severe coldwave. High risk of frostbite and hypothermia.",
                    "Provide light evening irrigation to standing crops to protect against frost injury."
                ]
            }
        else:
            return {
                "category": "Normal Thermal Range",
                "severity": "INFO",
                "color_code": IMDColorCode.GREEN,
                "hazard_score": 0,
                "advisories": []
            }

    def evaluate_composite_hazard(
        self,
        temperature_c: float = 28.0,
        rainfall_mm: float = 0.0,
        wind_speed_kmh: float = 15.0,
        humidity_pct: float = 65.0,
        lightning_detected: bool = False
    ) -> Dict[str, Any]:
        """
        Produces an overall unified hazard assessment combining all meteorological variables.
        """
        rain_eval = self.evaluate_rainfall(rainfall_mm)
        wind_eval = self.evaluate_wind(wind_speed_kmh)
        temp_eval = self.evaluate_thermal_extremes(temperature_c, humidity_pct)

        # Composite score
        scores = [rain_eval["hazard_score"], wind_eval["hazard_score"], temp_eval["hazard_score"]]
        if lightning_detected:
            scores.append(80)

        max_score = max(scores)
        
        # Determine highest severity color code
        if max_score >= 80:
            overall_color = IMDColorCode.RED
            overall_severity = "EMERGENCY"
        elif max_score >= 60:
            overall_color = IMDColorCode.ORANGE
            overall_severity = "WARNING"
        elif max_score >= 35:
            overall_color = IMDColorCode.YELLOW
            overall_severity = "WATCH"
        else:
            overall_color = IMDColorCode.GREEN
            overall_severity = "INFO"

        all_advisories = []
        for ev in [rain_eval, wind_eval, temp_eval]:
            all_advisories.extend(ev["advisories"])
            
        if lightning_detected:
            all_advisories.insert(0, "Lightning active in area: Follow NDMA 30-30 Rule. Avoid open fields, tall trees, and metal structures.")

        return {
            "composite_hazard_score": max_score,
            "overall_severity": overall_severity,
            "color_code": overall_color,
            "components": {
                "rainfall": rain_eval,
                "wind": wind_eval,
                "temperature": temp_eval,
                "lightning": {"active": lightning_detected}
            },
            "advisories": all_advisories,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
