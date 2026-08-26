"""
WeatherGPT Extreme-Weather & Hazard Risk Assessment Engine
=========================================================
Meteorological risk, thermal stress, and extreme hazard evaluation module
aligned with India Meteorological Department (IMD) and WMO standards.
"""

import math
from typing import Dict, Any, List, Optional


def calculate_heat_index(temperature_c: float, humidity_percent: float) -> Dict[str, Any]:
    """
    Computes the NOAA/IMD Heat Index ("Feels Like" thermal stress temperature).
    Uses the full Rothfusz polynomial regression equation with humidity adjustments.
    
    Parameters:
    -----------
    temperature_c : float
        Air temperature in Celsius.
    humidity_percent : float
        Relative humidity in percentage (0 - 100).
        
    Returns:
    --------
    dict with:
        - heat_index_c: float (calculated Heat Index in °C)
        - heat_category: str (Normal, Caution, Extreme Caution, Danger, Extreme Danger)
        - thermal_advisory: str (Actionable health & outdoor activity guidance)
    """
    t_c = float(temperature_c)
    rh = max(0.0, min(100.0, float(humidity_percent)))
    
    # Heat index is only meteorologically valid when T >= 20°C
    if t_c < 20.0:
        return {
            "heat_index_c": round(t_c, 1),
            "heat_category": "Normal",
            "thermal_advisory": "Comfortable thermal conditions."
        }
        
    # Convert to Fahrenheit for standard Rothfusz formula
    t_f = t_c * 1.8 + 32.0
    
    # Steadman simple approximation
    hi_simple = 0.5 * (t_f + 61.0 + ((t_f - 68.0) * 1.2) + (rh * 0.094))
    
    if hi_simple >= 80.0:
        # Full Rothfusz regression equation
        hi_f = (
            -42.379
            + 2.04901523 * t_f
            + 10.14333127 * rh
            - 0.22475541 * t_f * rh
            - 0.00683783 * (t_f ** 2)
            - 0.05481717 * (rh ** 2)
            + 0.00122874 * (t_f ** 2) * rh
            + 0.00085282 * t_f * (rh ** 2)
            - 0.00000199 * (t_f ** 2) * (rh ** 2)
        )
        
        # Adjustment for low relative humidity
        if rh < 13.0 and 80.0 <= t_f <= 112.0:
            adj = ((13.0 - rh) / 4.0) * math.sqrt((17.0 - abs(t_f - 95.0)) / 17.0)
            hi_f -= adj
        # Adjustment for high relative humidity
        elif rh > 85.0 and 80.0 <= t_f <= 87.0:
            adj = ((rh - 85.0) / 10.0) * ((87.0 - t_f) / 5.0)
            hi_f += adj
    else:
        hi_f = hi_simple
        
    hi_c = (hi_f - 32.0) / 1.8
    
    # Heat stress categorization (IMD / NOAA standards)
    if hi_c < 27.0:
        category = "Normal"
        advisory = "Comfortable thermal conditions. No heat stress expected."
    elif hi_c < 32.0:
        category = "Caution"
        advisory = "Fatigue possible with prolonged exposure and physical activity. Stay hydrated."
    elif hi_c < 41.0:
        category = "Extreme Caution"
        advisory = "Heat cramps and heat exhaustion possible. Limit direct sun exposure during afternoon hours."
    elif hi_c < 54.0:
        category = "Danger"
        advisory = "Heat exhaustion likely; heat stroke possible with continuous activity. Avoid strenuous outdoor tasks."
    else:
        category = "Extreme Danger"
        advisory = "Severe heat emergency: Heat stroke imminent. Immediate cooling and indoor rest required."
        
    return {
        "heat_index_c": round(hi_c, 1),
        "heat_category": category,
        "thermal_advisory": advisory
    }


def calculate_discomfort_index(temperature_c: float, humidity_percent: float) -> Dict[str, Any]:
    """
    Computes Thom's Discomfort Index (DI) for human physiological comfort.
    DI = T_c - 0.55 * (1 - 0.01 * RH) * (T_c - 14.5)
    """
    t_c = float(temperature_c)
    rh = max(0.0, min(100.0, float(humidity_percent)))
    
    di = t_c - 0.55 * (1.0 - 0.01 * rh) * (t_c - 14.5)
    
    if di < 21.0:
        level = "No Discomfort"
    elif di < 24.0:
        level = "Under 50% Population Feels Discomfort"
    elif di < 27.0:
        level = "Over 50% Population Feels Discomfort"
    elif di < 29.0:
        level = "Most People Feel Discomfort"
    elif di < 32.0:
        level = "Severe Discomfort / Stress"
    else:
        level = "State of Medical Emergency"
        
    return {
        "discomfort_index": round(di, 1),
        "discomfort_level": level
    }


def classify_imd_rainfall(rainfall_mm: float, rain_probability: float = 1.0) -> Dict[str, Any]:
    """
    Classifies rainfall amount according to official IMD 24h/6h meteorological brackets.
    """
    amt = max(0.0, float(rainfall_mm))
    prob = max(0.0, min(1.0, float(rain_probability)))
    
    if amt < 0.1 or prob < 0.25:
        category = "No Rain"
        severity = "normal"
        flood_risk = "None"
        code = "NO_RAIN"
        desc = "Dry weather conditions."
    elif amt <= 2.4:
        category = "Very Light Rain"
        severity = "normal"
        flood_risk = "None"
        code = "VERY_LIGHT_RAIN"
        desc = "Passing trace drizzle or very light showers."
    elif amt <= 7.5:
        category = "Light Rain"
        severity = "normal"
        flood_risk = "Low"
        code = "LIGHT_RAIN"
        desc = "Light rain. Good for standing crops, minimal commute impact."
    elif amt <= 35.5:
        category = "Moderate Rain"
        severity = "advisory"
        flood_risk = "Moderate"
        code = "MODERATE_RAIN"
        desc = "Moderate rain. Localized waterlogging in low-lying urban areas possible."
    elif amt <= 64.4:
        category = "Rather Heavy Rain"
        severity = "warning"
        flood_risk = "High"
        code = "RATHER_HEAVY_RAIN"
        desc = "Substantial rainfall. Expect traffic slow-downs and urban drainage congestion."
    elif amt <= 115.5:
        category = "Heavy Rain"
        severity = "severe"
        flood_risk = "Very High"
        code = "HEAVY_RAIN"
        desc = "Heavy rainfall alert (IMD Orange Alert). Inundation of lowlands and subways likely."
    elif amt <= 204.4:
        category = "Very Heavy Rain"
        severity = "extreme"
        flood_risk = "Critical (Flash Flood Risk)"
        code = "VERY_HEAVY_RAIN"
        desc = "Very heavy downpour (IMD Red Alert). High likelihood of flash floods and riverine swelling."
    else:
        category = "Extremely Heavy Rain"
        severity = "extreme"
        flood_risk = "Catastrophic Inundation"
        code = "EXTREMELY_HEAVY_RAIN"
        desc = "Extremely heavy deluge (IMD Red Emergency). Severe widespread flooding hazard."
        
    return {
        "rainfall_category": category,
        "rainfall_code": code,
        "severity": severity,
        "flood_risk": flood_risk,
        "description": desc
    }


def classify_wind_hazard(wind_speed_kmh: float) -> Dict[str, Any]:
    """
    Classifies wind speed into IMD Gale & Hazard categories.
    """
    spd = max(0.0, float(wind_speed_kmh))
    
    if spd < 20.0:
        category = "Calm / Light Breeze"
        severity = "normal"
        code = "CALM_LIGHT"
        desc = "Calm to gentle wind. No structural or marine hazard."
    elif spd < 40.0:
        category = "Moderate Breeze"
        severity = "normal"
        code = "MODERATE_BREEZE"
        desc = "Moderate breeze. Leaves and small twigs in motion."
    elif spd < 62.0:
        category = "Strong Breeze / High Wind"
        severity = "advisory"
        code = "STRONG_BREEZE"
        desc = "Strong wind gusts. Caution for two-wheelers, marine boats, and temporary hoardings."
    elif spd < 89.0:
        category = "Gale / Squall Force"
        severity = "warning"
        code = "GALE_SQUALL"
        desc = "Squally gale weather. Structural damage to kutcha structures; tree branches break."
    else:
        category = "Storm / Cyclonic Force"
        severity = "extreme"
        code = "CYCLONIC_STORM"
        desc = "Violent storm force winds. Severe danger to power lines, roofs, and trees."
        
    return {
        "wind_category": category,
        "wind_code": code,
        "severity": severity,
        "description": desc
    }


def assess_weather_risk(
    temperature_c: float,
    rainfall_mm: float,
    rain_probability: float,
    humidity_percent: float = 65.0,
    wind_speed_kmh: float = 12.0,
    location_name: str = "General Location"
) -> Dict[str, Any]:
    """
    Comprehensive multi-hazard composite risk assessment combining
    ML-predicted metrics with meteorological hazard scales.
    
    Returns:
    --------
    dict containing:
        - risk_score: int (0 to 100)
        - risk_level: str ("LOW", "MODERATE", "HIGH", "SEVERE")
        - alert_severity: str ("INFO", "WATCH", "WARNING", "EMERGENCY")
        - imd_color_code: dict ({ level: 'Green'|'Yellow'|'Orange'|'Red', message: str })
        - heat_assessment: dict
        - discomfort_assessment: dict
        - rainfall_assessment: dict
        - wind_assessment: dict
        - active_hazards: list of str
        - advisories: list of str
    """
    heat = calculate_heat_index(temperature_c, humidity_percent)
    discomfort = calculate_discomfort_index(temperature_c, humidity_percent)
    rain = classify_imd_rainfall(rainfall_mm, rain_probability)
    wind = classify_wind_hazard(wind_speed_kmh)
    
    hazards = []
    advisories = []
    
    # Score components (0 - 100 scale)
    temp_score = 0
    rain_score = 0
    wind_score = 0
    
    # 1. Thermal scoring & hazards
    if heat["heat_category"] == "Extreme Danger":
        temp_score = 100
        hazards.append("EXTREME_HEAT_EMERGENCY")
        advisories.append(heat["thermal_advisory"])
    elif heat["heat_category"] == "Danger":
        temp_score = 75
        hazards.append("DANGEROUS_HEAT_STRESS")
        advisories.append(heat["thermal_advisory"])
    elif heat["heat_category"] == "Extreme Caution":
        temp_score = 45
        hazards.append("HEAT_EXHAUSTION_CAUTION")
        advisories.append(heat["thermal_advisory"])
    elif heat["heat_category"] == "Caution":
        temp_score = 25
        
    # Coldwave check
    if temperature_c <= 4.0:
        temp_score = max(temp_score, 70)
        hazards.append("COLDWAVE_WARNING")
        advisories.append(f"Coldwave alert: Temperatures dropping to {temperature_c:.1f}°C. Protect vulnerable individuals and crops.")
        
    # 2. Rainfall & Flooding scoring
    if rain["rainfall_code"] == "EXTREMELY_HEAVY_RAIN":
        rain_score = 100
        hazards.append("CATASTROPHIC_FLOOD_RISK")
        advisories.append("Red Emergency: Extremely heavy rainfall. Evacuate flood-prone basements/lowlands.")
    elif rain["rainfall_code"] == "VERY_HEAVY_RAIN":
        rain_score = 85
        hazards.append("FLASH_FLOOD_WARNING")
        advisories.append("Red Alert: Very heavy downpour expected. Avoid all non-essential road travel.")
    elif rain["rainfall_code"] == "HEAVY_RAIN":
        rain_score = 65
        hazards.append("HEAVY_RAINFALL_WARNING")
        advisories.append("Orange Alert: Heavy rain forecast. Expect severe waterlogging in urban transit corridors.")
    elif rain["rainfall_code"] == "RATHER_HEAVY_RAIN":
        rain_score = 45
        hazards.append("URBAN_WATERLOGGING_WATCH")
        advisories.append("Yellow Watch: Substantial rain showers. Carry waterproof gear and check traffic updates.")
    elif rain["rainfall_code"] == "MODERATE_RAIN":
        rain_score = 25
        hazards.append("MODERATE_RAIN_SHOWERS")
        advisories.append("Carry an umbrella; wet road conditions expected.")
    elif rain["rainfall_code"] == "LIGHT_RAIN" and rain_probability >= 0.5:
        rain_score = 10
        advisories.append("Light rain or drizzle likely. Good idea to keep an umbrella handy.")
        
    # 3. Wind scoring
    if wind["wind_code"] == "CYCLONIC_STORM":
        wind_score = 100
        hazards.append("CYCLONIC_STORM_FORCE_WIND")
        advisories.append("Severe Wind Danger: Remain inside reinforced structures. Complete suspension of marine activities.")
    elif wind["wind_code"] == "GALE_SQUALL":
        wind_score = 70
        hazards.append("SQUALL_GALE_WARNING")
        advisories.append("High Wind Warning: Secure outdoor furniture, roofing sheets, and stay clear of old trees.")
    elif wind["wind_code"] == "STRONG_BREEZE":
        wind_score = 35
        hazards.append("STRONG_WIND_GUSTS")
        advisories.append("Brisk gusty winds. Caution for two-wheelers and high-profile vehicles.")
        
    # Composite risk score calculation (weighted maximum priority)
    composite_score = int(min(100, max(temp_score, rain_score, wind_score) * 0.75 + (temp_score + rain_score + wind_score) * 0.15))
    
    # Classify overall risk level and IMD 4-color code
    if composite_score >= 80:
        risk_level = "SEVERE"
        alert_severity = "EMERGENCY"
        imd_color = {
            "level": "Red",
            "name": "WARNING (Take Action)",
            "message": "Severe hazardous weather conditions imminent or active."
        }
    elif composite_score >= 55:
        risk_level = "HIGH"
        alert_severity = "WARNING"
        imd_color = {
            "level": "Orange",
            "name": "ALERT (Be Prepared)",
            "message": "High impact meteorological hazard expected. Prepare protective measures."
        }
    elif composite_score >= 30:
        risk_level = "MODERATE"
        alert_severity = "WATCH"
        imd_color = {
            "level": "Yellow",
            "name": "WATCH (Be Updated)",
            "message": "Deteriorating weather conditions likely. Stay updated with forecasts."
        }
    else:
        risk_level = "LOW"
        alert_severity = "INFO"
        imd_color = {
            "level": "Green",
            "name": "NO WARNING (Normal)",
            "message": "No severe weather warnings active."
        }
        
    if not advisories:
        advisories.append("Normal weather conditions expected over the 6-hour forecast horizon.")
        
    return {
        "location": location_name,
        "composite_risk_score": composite_score,
        "risk_level": risk_level,
        "alert_severity": alert_severity,
        "imd_color_code": imd_color,
        "active_hazards": hazards,
        "advisories": advisories,
        "components": {
            "heat_assessment": heat,
            "discomfort_assessment": discomfort,
            "rainfall_assessment": rain,
            "wind_assessment": wind
        }
    }


if __name__ == "__main__":
    print("Testing WeatherGPT Risk Engine...")
    demo = assess_weather_risk(
        temperature_c=36.5,
        rainfall_mm=45.0,
        rain_probability=0.88,
        humidity_percent=78.0,
        wind_speed_kmh=48.0,
        location_name="Mumbai"
    )
    import json
    print(json.dumps(demo, indent=2))
