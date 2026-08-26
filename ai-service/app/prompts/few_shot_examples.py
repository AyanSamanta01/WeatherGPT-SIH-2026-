"""
Few-Shot Examples for Intent Understanding, Tool Selection, and Grounded Output Synthesis
"""

FEW_SHOT_TOOL_CALLING_EXAMPLES = [
    {
        "user_query": "Will I need an umbrella in Mumbai tomorrow evening?",
        "thought": "User is asking about precipitation for tomorrow evening in Mumbai. Need coordinates for Mumbai and 3-day forecast data.",
        "tool_call": {
            "name": "get_weather_forecast",
            "arguments": {"location_name": "Mumbai", "days": 2, "variables": ["precipitation", "precipitation_probability", "temperature_2m"]}
        },
        "mock_tool_output": {
            "location": "Mumbai, Maharashtra",
            "latitude": 19.076,
            "longitude": 72.877,
            "forecast_day": "Tomorrow",
            "precipitation_probability": 85,
            "precipitation_mm": 18.5,
            "temp_max": 31.0,
            "temp_min": 26.5,
            "condition": "Moderate to Heavy Rain / Thunderstorms",
            "source": "Open-Meteo GFS/ECMWF NWP"
        },
        "grounded_response": "🌧️ **Yes, you should definitely carry an umbrella in Mumbai tomorrow evening.**\n\n- **Rain Probability:** **85%** with approximately **18.5 mm** of rainfall expected.\n- **Temperatures:** High of **31°C**, low of **26.5°C**.\n- **Conditions:** Moderate to heavy rain accompanied by evening thunderstorms.\n\n💡 *Advisory:* Evening coastal commute may encounter minor waterlogging on major arterial roads. Plan your travel with extra buffer time.\n\n📌 *Data Source: Open-Meteo NWP Forecast Models.*"
    },
    {
        "user_query": "क्या कल जयपुर में सरसों की फसल पर कीटनाशक का छिड़काव करना सुरक्षित रहेगा?",
        "thought": "User is an Indian farmer asking in Hindi about pesticide spraying on Mustard crop in Jaipur tomorrow. Need weather forecast focusing on wind speed and rainfall probability.",
        "tool_call": {
            "name": "get_weather_forecast",
            "arguments": {"location_name": "Jaipur", "days": 2, "variables": ["wind_speed_10m", "precipitation_probability"]}
        },
        "mock_tool_output": {
            "location": "Jaipur, Rajasthan",
            "forecast_day": "Tomorrow",
            "wind_speed_kmh": 22.4,
            "precipitation_probability": 10,
            "condition": "Dry & Sunny",
            "source": "IMD Agro-NWP"
        },
        "grounded_response": "🌾 **कृषि मौसम सलाह - जयपुर (सरसों फसल):**\n\nकल जयपुर में सरसों की फसल पर कीटनाशक का छिड़काव करना **उचित नहीं रहेगा**।\n\n- **कारण (हवा की गति):** कल हवा की गति लगभग **22.4 किमी/घंटा** रहने का अनुमान है। कीटनाशक छिड़काव के लिए हवा की गति 15 किमी/घंटा से कम होनी चाहिए, अन्यथा दवा उड़कर बर्बाद होगी और समान रूप से नहीं लगेगी।\n- **वर्षा संभावना:** केवल **10%** (मौसम सूखा रहेगा)।\n\n💡 *सुझाव:* हवा थमने तक (सुबह 7 से 9 बजे के बीच जब हवा शांत हो) छिड़काव टालें।\n\n📌 *स्रोत: IMD कृषि मौसम पूर्वानुमान।*",
        "language": "hi"
    },
    {
        "user_query": "Any severe cyclone alert for coastal Odisha right now?",
        "thought": "User is asking about active disaster warnings or cyclone alerts for coastal Odisha. Need to check active CAP alerts.",
        "tool_call": {
            "name": "get_active_alerts",
            "arguments": {"location_name": "Puri, Odisha", "alert_type": "cyclone"}
        },
        "mock_tool_output": {
            "location": "Coastal Odisha (Puri, Jagatsinghpur)",
            "active_alerts": [
                {
                    "severity": "ORANGE",
                    "event": "Deep Depression intensifying into Cyclonic Storm",
                    "issuing_authority": "India Meteorological Department (IMD)",
                    "headline": "IMD Cyclone Alert: Squally winds 65-75 km/h along coastal Odisha",
                    "instructions": "Fishermen advised not to venture into Bay of Bengal. Coastal residents should secure thatched houses."
                }
            ],
            "risk_level": "high"
        },
        "grounded_response": "⚠️ **OFFICIAL IMD CYCLONE ALERT (ORANGE WARNING) FOR COASTAL ODISHA**\n\n- **Event:** Deep depression over Bay of Bengal intensifying into a Cyclonic Storm.\n- **Wind Speeds:** Squally winds of **65-75 km/h** gusting to **85 km/h**.\n- **Issuing Authority:** India Meteorological Department (IMD).\n\n🛡️ **NDMA Safety Instructions:**\n1. **Fishermen Advisory:** Complete prohibition on venturing into the sea.\n2. **Coastal Residents:** Keep emergency food, potable water, flashlights, and portable radio charged.\n3. **Helpline:** State Emergency Operation Center: **1070** | National Disaster Helpline: **112**.\n\n📌 *Official IMD Disaster Warning.*"
    }
]
