"""
JSON Schema Tool Definitions for LLM Function / Tool Calling
"""

LLM_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Fetch real-time weather observations (temperature, feels_like, humidity, wind, rainfall, conditions) for coordinates or a named location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location_name": {
                        "type": "string",
                        "description": "Name of the city, district, or town (e.g., 'Mumbai', 'Kolkata', 'Jaipur')"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude coordinate (-90.0 to 90.0)"
                    },
                    "longitude": {
                        "type": "number",
                        "description": "Longitude coordinate (-180.0 to 180.0)"
                    },
                    "units": {
                        "type": "string",
                        "enum": ["metric", "imperial"],
                        "default": "metric"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather_forecast",
            "description": "Fetch multi-day NWP numerical weather forecasts (1-10 days) including daily highs/lows, hourly precipitation probabilities, wind speeds, and cloud cover.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location_name": {
                        "type": "string",
                        "description": "City or area name"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude"
                    },
                    "longitude": {
                        "type": "number",
                        "description": "Longitude"
                    },
                    "days": {
                        "type": "integer",
                        "description": "Forecast horizon in days (1 to 10)",
                        "default": 3
                    },
                    "variables": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Specific variables (e.g. ['precipitation', 'temperature', 'wind_speed'])"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_active_alerts",
            "description": "Fetch active official meteorological and disaster warnings (IMD, NDMA, CAP 1.2 bulletins) for a location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location_name": {
                        "type": "string",
                        "description": "City or state name"
                    },
                    "latitude": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "alert_type": {
                        "type": "string",
                        "description": "Optional filter: 'cyclone', 'flood', 'heatwave', 'thunderstorm', 'rain', 'all'"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_climate_trends",
            "description": "Fetch multi-year historical climate analytics, monthly averages, and precipitation/temperature anomaly comparisons.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location_name": {
                        "type": "string"
                    },
                    "latitude": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "years": {
                        "type": "integer",
                        "description": "Years of history to compare (e.g., 5, 10)",
                        "default": 10
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_biometeorology",
            "description": "Calculate biometeorological human comfort indices: Heat Index ('Feels Like'), Wet-Bulb Temperature, Wind Chill, and outdoor thermal safety category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "temperature_c": {
                        "type": "number",
                        "description": "Ambient dry-bulb temperature in Celsius"
                    },
                    "humidity_percent": {
                        "type": "number",
                        "description": "Relative humidity percentage (0-100)"
                    },
                    "wind_speed_kmh": {
                        "type": "number",
                        "description": "Wind speed in km/h",
                        "default": 10.0
                    }
                },
                "required": ["temperature_c", "humidity_percent"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_agricultural_advisory",
            "description": "Evaluate agricultural suitability for spraying pesticides, sowing, harvesting, and irrigation based on crop type and current/forecast weather.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop_name": {
                        "type": "string",
                        "description": "Target crop (e.g. 'wheat', 'mustard', 'rice', 'cotton', 'paddy')"
                    },
                    "operation": {
                        "type": "string",
                        "enum": ["spraying", "irrigation", "sowing", "harvesting", "general_health"],
                        "description": "Planned farming activity"
                    },
                    "temperature_c": {
                        "type": "number"
                    },
                    "rainfall_prob": {
                        "type": "number"
                    },
                    "wind_speed_kmh": {
                        "type": "number"
                    }
                },
                "required": ["crop_name", "operation"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weathergpt_ml_forecast",
            "description": "Fetch WeatherGPT 6-hour high-resolution ML forecasts (temperature, rain probability, rainfall amount, and IMD hazard risk assessment) generated by trained XGBoost & LightGBM production models.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location_name": {
                        "type": "string",
                        "description": "City or location name (e.g., 'Kolkata', 'Mumbai', 'Delhi', 'Bengaluru')"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude coordinate"
                    },
                    "longitude": {
                        "type": "number",
                        "description": "Longitude coordinate"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_nwp_model_consensus",
            "description": "Evaluate WeatherGPT ML forecasts side-by-side against global NWP models (ECMWF IFS, NOAA GFS, DWD ICON) to calculate ensemble spread, consensus confidence percentage, and micro-climate anomaly flags.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location_name": {
                        "type": "string",
                        "description": "City or location name"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude"
                    },
                    "longitude": {
                        "type": "number",
                        "description": "Longitude"
                    }
                },
                "required": []
            }
        }
    }
]

