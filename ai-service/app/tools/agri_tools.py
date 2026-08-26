import math
from typing import Dict, Any, Optional

def calculate_heat_index(temp_c: float, rh: float) -> float:
    """
    Calculate Heat Index in Celsius using the NOAA / Rothfusz multiple regression equation
    """
    # Convert Celsius to Fahrenheit
    T = (temp_c * 9.0 / 5.0) + 32.0
    R = rh

    if T < 80.0:
        # Simple formula for cooler temperatures
        hi_f = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094))
    else:
        # Full Rothfusz regression
        hi_f = (
            -42.379
            + 2.04901523 * T
            + 10.14333127 * R
            - 0.22475541 * T * R
            - 0.00683783 * T * T
            - 0.05481717 * R * R
            + 0.00122874 * T * T * R
            + 0.00085282 * T * R * R
            - 0.00000199 * T * T * R * R
        )

        # Adjustments
        if R < 13.0 and 80.0 <= T <= 112.0:
            adj = ((13.0 - R) / 4.0) * math.sqrt((17.0 - abs(T - 95.0)) / 17.0)
            hi_f -= adj
        elif R > 85.0 and 80.0 <= T <= 87.0:
            adj = ((R - 85.0) / 10.0) * ((87.0 - T) / 5.0)
            hi_f += adj

    # Convert back to Celsius
    hi_c = (hi_f - 32.0) * 5.0 / 9.0
    return round(hi_c, 1)

def calculate_wet_bulb(temp_c: float, rh: float) -> float:
    """
    Stull's empirical formula for Wet-Bulb temperature in Celsius
    """
    T = temp_c
    RH = rh
    tw = (
        T * math.atan(0.151977 * math.sqrt(RH + 8.313659))
        + math.atan(T + RH)
        - math.atan(RH - 1.676331)
        + 0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH)
        - 4.686035
    )
    return round(tw, 1)

def calculate_biometeorology(
    temperature_c: float,
    humidity_percent: float,
    wind_speed_kmh: float = 10.0
) -> Dict[str, Any]:
    """
    Calculate comprehensive biometeorological indicators
    """
    temp_c = float(temperature_c)
    rh = float(max(0.0, min(humidity_percent, 100.0)))
    wind = float(wind_speed_kmh)

    heat_index_c = calculate_heat_index(temp_c, rh)
    wet_bulb_c = calculate_wet_bulb(temp_c, rh)

    # Determine thermal stress category
    if heat_index_c >= 54.0 or wet_bulb_c >= 32.0:
        stress_level = "EXTREME DANGER"
        recommendation = "Imminent risk of heat stroke / sunstroke. Suspend all outdoor strenuous activity. Stay in cooled environment."
    elif heat_index_c >= 41.0 or wet_bulb_c >= 29.0:
        stress_level = "DANGER"
        recommendation = "Heat cramps and heat exhaustion likely; heat stroke possible with prolonged exposure. Drink electrolyte-rich fluids."
    elif heat_index_c >= 32.0:
        stress_level = "EXTREME CAUTION"
        recommendation = "Heat cramps or heat exhaustion possible. Take frequent breaks and hydrate."
    elif heat_index_c >= 27.0:
        stress_level = "CAUTION"
        recommendation = "Comfortable for normal activity; fatigue possible with prolonged exposure."
    else:
        stress_level = "NORMAL / COMFORTABLE"
        recommendation = "Pleasant ambient thermal conditions."

    return {
        "ambient_temperature_c": temp_c,
        "relative_humidity_percent": rh,
        "wind_speed_kmh": wind,
        "heat_index_c": heat_index_c,
        "wet_bulb_temperature_c": wet_bulb_c,
        "thermal_stress_level": stress_level,
        "safety_recommendation": recommendation,
        "source": "NOAA Biometeorology & Stull Wet-Bulb Algorithm"
    }

def get_agricultural_advisory(
    crop_name: str,
    operation: str,
    temperature_c: Optional[float] = 28.0,
    rainfall_prob: Optional[float] = 10.0,
    wind_speed_kmh: Optional[float] = 10.0
) -> Dict[str, Any]:
    """
    Evaluate crop operation suitability based on meteorological thresholds
    """
    crop = (crop_name or "general").lower()
    op = (operation or "spraying").lower()
    wind = wind_speed_kmh or 10.0
    rain_prob = rainfall_prob or 10.0
    temp = temperature_c or 28.0

    suitable = True
    reasons = []
    recommendations = []

    if "spray" in op:
        if wind > 15.0:
            suitable = False
            reasons.append(f"Wind speed ({wind} km/h) exceeds safe spraying threshold (15 km/h) causing chemical drift.")
            recommendations.append("Delay spraying until early morning (7-9 AM) when wind speeds are calm.")
        if rain_prob > 35.0:
            suitable = False
            reasons.append(f"Rainfall probability is {rain_prob}%, which may wash off agrochemicals.")
            recommendations.append("Postpone application until a 24-hour dry window is forecast.")
        if temp > 35.0:
            reasons.append(f"High temperature ({temp}°C) accelerates evaporation and can cause phytotoxicity leaf burn.")
            recommendations.append("Spray during cooler twilight hours.")

    elif "irrigat" in op:
        if rain_prob > 50.0:
            suitable = False
            reasons.append(f"High probability of rain ({rain_prob}%) in the upcoming forecast.")
            recommendations.append("Hold irrigation to save energy and prevent waterlogging.")
        else:
            recommendations.append("Proceed with light to moderate irrigation according to crop stage.")

    elif "sow" in op:
        if rain_prob < 20.0 and temp > 38.0:
            recommendations.append("Ensure sufficient pre-sowing irrigation (Ronan) to guarantee uniform seed germination.")
        else:
            recommendations.append("Soil moisture conditions are conducive for seedbed preparation.")

    if not reasons:
        reasons.append(f"Weather conditions are suitable for {op} on {crop.title()} crops.")

    return {
        "crop": crop.title(),
        "operation": op.title(),
        "is_suitable": suitable,
        "verdict": "SUITABLE" if suitable else "NOT RECOMMENDED",
        "reasons": reasons,
        "actionable_recommendations": recommendations,
        "weather_context": {
            "temperature_c": temp,
            "wind_speed_kmh": wind,
            "rainfall_probability": rain_prob
        },
        "source": "IMD Agrometeorological Advisory Services (AAS) & ICAR Guidelines"
    }
