import re
from typing import Dict, Any, Optional, Tuple, List
from ..models.enums import IntentCategory, LanguageCode, TargetSector
from ..models.schemas import IntentResult
from ..services.multilingual_service import default_multilingual_service
from ..tools.geocoding_tools import INDIAN_CITIES_GEOCODE

NON_LOCATION_STOPWORDS = {
    "tomorrow", "today", "yesterday", "next week", "the morning", "the evening", 
    "morning", "evening", "afternoon", "night", "august", "sunday", "monday", "tuesday",
    "wednesday", "thursday", "friday", "saturday", "wheat", "mustard", "paddy", "rice",
    "cotton", "crops", "crop", "field", "fields", "farm", "farming", "spraying", "spray",
    "growing", "pesticides", "pesticide", "fertilizer", "cricket", "running", "sports",
    "football", "outdoor", "rain", "forecast", "weather", "help", "me", "india",
    "kal", "aaj", "barish", "mausam", "kheti", "fasal"
}

KNOWN_CROPS = {
    "wheat": "Wheat", "gehun": "Wheat", "गेहूं": "Wheat",
    "mustard": "Mustard", "sarson": "Mustard", "सरसों": "Mustard",
    "paddy": "Paddy / Rice", "rice": "Paddy / Rice", "dhan": "Paddy / Rice", "धान": "Paddy / Rice", "ধান": "Paddy / Rice",
    "cotton": "Cotton", "kapas": "Cotton", "कपास": "Cotton",
    "maize": "Maize", "corn": "Maize", "makka": "Maize", "मक्का": "Maize",
    "sugarcane": "Sugarcane", "ganna": "Sugarcane", "गन्ना": "Sugarcane",
    "soybean": "Soybean", "soya": "Soybean", "सोयाबीन": "Soybean",
    "gram": "Gram / Chickpea", "chana": "Gram / Chickpea", "चना": "Gram / Chickpea",
    "tea": "Tea", "chai": "Tea", "চা": "Tea", "चाय": "Tea",
    "potato": "Potato", "aloo": "Potato", "आलू": "Potato", "আলু": "Potato",
    "tomato": "Tomato", "tamatar": "Tomato", "टमाटर": "Tomato",
    "onion": "Onion", "pyaz": "Onion", "प्याज": "Onion"
}

KNOWN_OPERATIONS = {
    "spray": "Spraying", "spraying": "Spraying", "pesticide": "Spraying", "fungicide": "Spraying", "insecticide": "Spraying", "छिड़काव": "Spraying",
    "sow": "Sowing", "sowing": "Sowing", "planting": "Sowing", "plant": "Sowing", "बुवाई": "Sowing", "বপন": "Sowing",
    "irrigate": "Irrigation", "irrigation": "Irrigation", "watering": "Irrigation", "water": "Irrigation", "सिंचाई": "Irrigation", "সেচ": "Irrigation",
    "harvest": "Harvesting", "harvesting": "Harvesting", "cutting": "Harvesting", "कटाई": "Harvesting", "ফসল কাটা": "Harvesting",
    "fertilize": "Fertilizing", "fertilizer": "Fertilizing", "urea": "Fertilizing", "खाद": "Fertilizing"
}

class IntentClassifier:
    """
    Intelligent Hybrid Natural Language Understanding (NLU) & Entity Extractor
    """
    def extract_location(self, message: str) -> Tuple[Optional[str], Optional[float], Optional[float]]:
        clean = message.lower()

        # 1. Match Indian cities and states (sorted by length descending for best precision)
        sorted_keys = sorted(INDIAN_CITIES_GEOCODE.keys(), key=len, reverse=True)
        for city_key in sorted_keys:
            lat, lon, full_name = INDIAN_CITIES_GEOCODE[city_key]
            # If in non-ascii script or word-boundary match in ascii
            if any(ord(c) > 127 for c in city_key):
                if city_key in clean:
                    return (full_name, lat, lon)
            else:
                pattern = rf"\b{re.escape(city_key)}\b"
                if re.search(pattern, clean):
                    return (full_name, lat, lon)

        # 2. Check for preposition patterns like "in Mumbai", "at Delhi", "for Kolkata", "near Jaipur"
        loc_match = re.search(r'\b(?:in|at|for|near|around|of|में|এর|இல்)\s+([A-Za-z\u0900-\u0D7F]+(?:\s+[A-Za-z\u0900-\u0D7F]+)?)', message, re.IGNORECASE)
        if loc_match:
            candidate = loc_match.group(1).strip()
            # Clean trailing words like "growing", "farming"
            words = candidate.split()
            filtered_words = [w for w in words if w.lower() not in NON_LOCATION_STOPWORDS]
            if filtered_words:
                clean_candidate = " ".join(filtered_words).title()
                cand_lower = clean_candidate.lower()
                for key, (lat, lon, full_name) in INDIAN_CITIES_GEOCODE.items():
                    if key == cand_lower or cand_lower in key:
                        return (full_name, lat, lon)
                if cand_lower not in NON_LOCATION_STOPWORDS:
                    return (clean_candidate, None, None)

        return (None, None, None)

    def extract_agri_entities(self, message: str) -> Dict[str, str]:
        clean = message.lower()
        extracted_crop = "Wheat"
        extracted_op = "Spraying"
        crop_found = False
        op_found = False

        for k, crop_name in KNOWN_CROPS.items():
            if k in clean:
                extracted_crop = crop_name
                crop_found = True
                break

        for k, op_name in KNOWN_OPERATIONS.items():
            if k in clean:
                extracted_op = op_name
                op_found = True
                break

        return {
            "crop": extracted_crop,
            "operation": extracted_op,
            "crop_explicit": crop_found,
            "operation_explicit": op_found
        }

    def extract_temporal_scope(self, message: str) -> str:
        clean = message.lower()
        if any(w in clean for w in ["tomorrow", "kal", "আগামীকাল", "நாளை", "రేపు", "उद्या", "কাল"]):
            return "tomorrow"
        elif any(w in clean for w in ["week", "7 days", "10 days", "next few days", "saptah", "সপ্তাহ", "हफ़्ता"]):
            return "multi_day"
        elif any(w in clean for w in ["evening", "tonight", "this afternoon", "आज शाम", "আজ সন্ধ্যায়"]):
            return "evening"
        elif any(w in clean for w in ["last year", "history", "trend", "past decade", "climate"]):
            return "historical"
        elif any(w in clean for w in ["6 hour", "6h", "6-hour", "next few hours"]):
            return "6h"
        return "current"

    def is_greeting_or_chitchat(self, clean: str) -> bool:
        # Check pure greeting patterns
        greetings = [
            "hi", "hello", "hey", "namaste", "good morning", "good evening", "good afternoon",
            "who are you", "what is weathergpt", "introduce yourself", "tell me about yourself",
            "kya hal hai", "kese ho", "kaise ho", "নমস্কার", "কেমন আছেন", "வணக்கம்"
        ]
        # Exact match or short greeting message without weather keywords
        if clean in greetings or any(clean.startswith(g) for g in ["hi ", "hello ", "hey ", "namaste "]):
            # If no specific weather question asked
            if not any(w in clean for w in ["rain", "temp", "forecast", "crop", "spray", "barish", "मौसम", "বৃষ্টি"]):
                return True
        if clean in ["who are you", "who are you?", "what are you", "what are you?"]:
            return True
        return False

    def is_capabilities_query(self, clean: str) -> bool:
        cap_patterns = [
            "what can you do", "what can you help me with", "how can you help", "how do you work",
            "features", "help me", "commands", "show options", "what are your capabilities",
            "kya kar sakte ho", "आप क्या कर सकते हैं", "কী করতে পারো"
        ]
        return any(p in clean for p in cap_patterns)

    def classify_intent(
        self,
        message: str,
        explicit_lat: Optional[float] = None,
        explicit_lon: Optional[float] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> IntentResult:
        if not message or not message.strip():
            return IntentResult(
                intent=IntentCategory.GREETING_OR_CHITCHAT,
                confidence=0.9,
                requires_tool_call=False
            )

        clean = message.strip().lower()
        lang = default_multilingual_service.detect_language(message)
        loc_name, lat, lon = self.extract_location(message)
        
        final_lat = explicit_lat if explicit_lat is not None else lat
        final_lon = explicit_lon if explicit_lon is not None else lon
        temporal = self.extract_temporal_scope(message)
        agri_entities = self.extract_agri_entities(message)

        # 1. Greetings & Pure Conversational Chitchat
        if self.is_greeting_or_chitchat(clean):
            return IntentResult(
                intent=IntentCategory.GREETING_OR_CHITCHAT,
                confidence=0.98,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=[],
                requires_tool_call=False,
                entities={"conversation_type": "greeting"}
            )

        # 2. Capabilities & Help Inquiry
        if self.is_capabilities_query(clean):
            return IntentResult(
                intent=IntentCategory.CAPABILITIES_QUERY,
                confidence=0.98,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=[],
                requires_tool_call=False,
                entities={"conversation_type": "capabilities"}
            )

        # 3. Agricultural Advisory
        if any(w in clean for w in [
            "spray", "pesticide", "fertilizer", "kisan", "crop", "wheat", "paddy", "mustard",
            "cotton", "sow", "harvest", "irrigate", "irrigation", "खेती", "फसल", "कीटनाशक", "छिड़काव", "সেচ", "কীটনাশক"
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
                suggested_tools=["get_agricultural_advisory", "get_weather_forecast", "get_current_weather"],
                requires_tool_call=True,
                entities=agri_entities
            )

        # 4. NWP Multi-Model Consensus & Comparison
        if any(w in clean for w in [
            "consensus", "gfs vs ecmwf", "ecmwf vs gfs", "compare models", "model comparison",
            "nwp spread", "model agreement", "forecast agreement", "confidence score", "icon vs gfs", "ecmwf", "gfs"
        ]):
            return IntentResult(
                intent=IntentCategory.NWP_CONSENSUS,
                confidence=0.97,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope="6h",
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["get_nwp_model_consensus", "get_weathergpt_ml_forecast"],
                requires_tool_call=True
            )

        # 5. WeatherGPT High-Resolution 6-Hour ML Forecast
        if any(w in clean for w in [
            "6 hour", "6h", "6-hour", "ml model", "ml forecast", "weathergpt predict", "weathergpt forecast",
            "xgboost", "lightgbm", "machine learning forecast", "regressor"
        ]):
            return IntentResult(
                intent=IntentCategory.ML_FORECAST,
                confidence=0.96,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope="6h",
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["get_weathergpt_ml_forecast", "get_current_weather"],
                requires_tool_call=True
            )

        # 6. Alert / Disaster Check
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

        # 7. Climate / Historical Trends
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

        # 8. Outdoor / Sports / Marine / Biometeorology
        if any(w in clean for w in [
            "heat index", "feels like", "safe for cricket", "cricket", "running", "sports",
            "fisherman", "sea", "rough sea", "wet bulb", "sunstroke", "match"
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

        # 9. Meteorological Concept Explanation (RAG)
        if any(w in clean for w in [
            "what causes", "how does", "explain western disturbance", "el nino", "la nina",
            "monsoon branch", "30-30 rule", "what is cyclone", "cyclone formation"
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

        # 10. Forecast Queries (Tomorrow, Rain, Extended)
        if any(w in clean for w in [
            "tomorrow", "forecast", "will it rain", "umbrella", "next week", "rain this evening",
            "kal", "barish", "বৃষ্টি", "மழை", "వర్షం", "पाऊस", "बारिश", "वर्षा", "पूर्वानुमान", "बरसात",
            "पड़ेगा", "होगी", "rain", "chance of rain", "raining", "shower", "छाता", "चाहिए", "कैसा रहेगा", "কেমন থাকবে"
        ]):
            scope = IntentCategory.FORECAST_EXTENDED if ("week" in clean or "10 days" in clean or "सप्ताह" in clean) else IntentCategory.FORECAST_SHORT_TERM
            return IntentResult(
                intent=scope,
                confidence=0.95,
                location_name=loc_name,
                latitude=final_lat,
                longitude=final_lon,
                temporal_scope=temporal,
                target_sector=TargetSector.GENERAL_PUBLIC,
                language_detected=lang,
                suggested_tools=["get_weather_forecast", "get_current_weather"],
                requires_tool_call=True
            )

        # 11. Current Weather Observation
        if any(w in clean for w in [
            "temp", "temperature", "now", "current", "humidity", "wind", "weather",
            "mausam", "kaisa hai", "weather today", "conditions"
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
