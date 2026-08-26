import re
from typing import Dict, Any, Optional, Tuple
from ..models.enums import IntentCategory, LanguageCode, TargetSector
from ..models.schemas import IntentResult
from ..services.multilingual_service import default_multilingual_service
from ..tools.geocoding_tools import INDIAN_CITIES_GEOCODE

class IntentClassifier:
    """
    Rule & Pattern-based Natural Language Understanding (NLU) & Entity Extractor
    """
    def extract_location(self, message: str) -> Tuple[Optional[str], Optional[float], Optional[float]]:
        clean = message.lower()

        # Check for explicitly matching registered Indian cities
        for city_key, (lat, lon, full_name) in INDIAN_CITIES_GEOCODE.items():
            pattern = rf"\b{re.escape(city_key)}\b"
            if re.search(pattern, clean):
                return (full_name, lat, lon)

        # Check for patterns like "in Mumbai", "at Delhi", "for Kolkata", "near Jaipur"
        loc_match = re.search(r'\b(?:in|at|for|near|around|of)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)', message, re.IGNORECASE)
        if loc_match:
            candidate = loc_match.group(1).strip()
            # Ignore common time words captured by preposition
            if candidate.lower() not in ["tomorrow", "today", "yesterday", "next week", "the morning", "the evening", "august", "sunday", "monday"]:
                return (candidate.title(), None, None)

        return (None, None, None)

    def extract_temporal_scope(self, message: str) -> str:
        clean = message.lower()
        if any(w in clean for w in ["tomorrow", "kal", "আগামীকাল", "நாளை", "రేపు"]):
            return "tomorrow"
        elif any(w in clean for w in ["week", "7 days", "10 days", "next few days", "saptah"]):
            return "multi_day"
        elif any(w in clean for w in ["last year", "history", "trend", "past decade", "climate"]):
            return "historical"
        return "current"

    def classify_intent(
        self,
        message: str,
        explicit_lat: Optional[float] = None,
        explicit_lon: Optional[float] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> IntentResult:
        if not message:
            return IntentResult(
                intent=IntentCategory.GENERAL_QUERY,
                confidence=0.5,
                requires_tool_call=False
            )

        clean = message.lower()
        lang = default_multilingual_service.detect_language(message)
        loc_name, lat, lon = self.extract_location(message)
        
        # Override with explicit parameters if provided
        final_lat = explicit_lat if explicit_lat is not None else lat
        final_lon = explicit_lon if explicit_lon is not None else lon
        temporal = self.extract_temporal_scope(message)

        # 1. Agricultural Advisory
        if any(w in clean for w in [
            "spray", "pesticide", "fertilizer", "kisan", "crop", "wheat", "paddy", "mustard",
            "cotton", "sow", "harvest", "irrigate", "irrigation", "खेती", "फसल", "कीटनाशक", "छिड़काव"
        ]):
            return IntentResult(
                intent=IntentCategory.AGRI_ADVISORY,
                confidence=0.96,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.FARMER,
                language_detected=lang,
                suggested_tools=["get_agricultural_advisory", "get_weather_forecast"],
                requires_tool_call=True
            )

        # 2. Alert / Disaster Check
        if any(w in clean for w in [
            "alert", "warning", "cyclone", "flood", "tsunami", "danger", "evacuate",
            "storm warning", "ndma", "hazard", "चक्रवात", "तूफान", "बाढ़", "चेतावनी", "সতর্কবার্তা"
        ]):
            return IntentResult(
                intent=IntentCategory.ALERT_CHECK,
                confidence=0.98,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.DISASTER_RESPONDER,
                language_detected=lang,
                suggested_tools=["get_active_alerts", "get_current_weather"],
                requires_tool_call=True
            )

        # 3. Climate / Historical Trends
        if any(w in clean for w in [
            "climate", "trend", "monsoon compare", "last year", "past 10 years", "historical rainfall",
            "global warming", "anomaly"
        ]):
            return IntentResult(
                intent=IntentCategory.CLIMATE_TREND,
                confidence=0.92,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope="historical",
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["get_climate_trends"],
                requires_tool_call=True
            )

        # 4. Outdoor / Sports / Marine
        if any(w in clean for w in [
            "heat index", "feels like", "safe for cricket", "cricket", "running", "sports",
            "fisherman", "sea", "rough sea", "wet bulb", "sunstroke"
        ]):
            return IntentResult(
                intent=IntentCategory.OUTDOOR_ACTIVITY,
                confidence=0.93,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.COMMUTER_TRAVELER,
                language_detected=lang,
                suggested_tools=["calculate_biometeorology", "get_current_weather"],
                requires_tool_call=True
            )

        # 5. Meteorological Concept Explanation (RAG)
        if any(w in clean for w in [
            "what causes", "how does", "explain western disturbance", "el nino", "la nina",
            "monsoon branch", "30-30 rule", "what is cyclone"
        ]):
            return IntentResult(
                intent=IntentCategory.METEOROLOGICAL_EXPLANATION,
                confidence=0.90,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["search_meteorological_knowledge"],
                requires_tool_call=True
            )

        # 6. Forecast Queries
        if any(w in clean for w in [
            "tomorrow", "forecast", "will it rain", "umbrella", "next week", "rain this evening",
            "kal", "barish", "বৃষ্টি", "மழை", "వర్షం", "पाऊस", "बारिश", "वर्षा", "पूर्वानुमान", "बरसात",
            "पड़ेगा", "होगी"
        ]):
            scope = IntentCategory.FORECAST_EXTENDED if "week" in clean or "10 days" in clean or "सप्ताह" in clean else IntentCategory.FORECAST_SHORT_TERM
            return IntentResult(
                intent=scope,
                confidence=0.95,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["get_weather_forecast"],
                requires_tool_call=True
            )

        # 7. Current Weather Query
        if any(w in clean for w in [
            "temp", "temperature", "now", "current", "humidity", "wind", "weather",
            "mausam", "kaisa hai"
        ]):
            return IntentResult(
                intent=IntentCategory.CURRENT_WEATHER,
                confidence=0.94,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope="current",
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["get_current_weather"],
                requires_tool_call=True
            )

        # Default general query
        return IntentResult(
            intent=IntentCategory.GENERAL_QUERY,
            confidence=0.80,
            location_name=loc_name,
            latitude=final_lat,
            longitude=final_lon,
            temporal_scope=temporal,
            target_sector=TargetSector.GENERAL_PUBLIC,
            language_detected=lang,
            suggested_tools=["get_current_weather"],
            requires_tool_call=True
        )

default_intent_classifier = IntentClassifier()
