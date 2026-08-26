import pytest
from app.agents.intent_classifier import default_intent_classifier
from app.models.enums import IntentCategory, LanguageCode, TargetSector

def test_intent_forecast_extraction():
    res = default_intent_classifier.classify_intent("Will it rain tomorrow in Mumbai?")
    assert res.intent in [IntentCategory.FORECAST_SHORT_TERM, IntentCategory.FORECAST_EXTENDED]
    assert res.location_name is not None
    assert "Mumbai" in res.location_name
    assert res.temporal_scope == "tomorrow"
    assert "get_weather_forecast" in res.suggested_tools

def test_intent_current_weather():
    res = default_intent_classifier.classify_intent("What is the temperature and humidity right now in Kolkata?")
    assert res.intent == IntentCategory.CURRENT_WEATHER
    assert res.location_name is not None
    assert "Kolkata" in res.location_name
    assert "get_current_weather" in res.suggested_tools

def test_intent_agri_advisory():
    res = default_intent_classifier.classify_intent("Should I spray pesticide on mustard crops today in Jaipur?")
    assert res.intent == IntentCategory.AGRI_ADVISORY
    assert res.target_sector == TargetSector.FARMER
    assert "get_agricultural_advisory" in res.suggested_tools

def test_intent_alert_check():
    res = default_intent_classifier.classify_intent("Any cyclone or flood warning for Puri Odisha?")
    assert res.intent == IntentCategory.ALERT_CHECK
    assert res.target_sector == TargetSector.DISASTER_RESPONDER
    assert "get_active_alerts" in res.suggested_tools

def test_intent_climate_trends():
    res = default_intent_classifier.classify_intent("How does this monsoon compare to last year?")
    assert res.intent == IntentCategory.CLIMATE_TREND
    assert res.temporal_scope == "historical"
    assert "get_climate_trends" in res.suggested_tools

def test_intent_multilingual_hindi():
    res = default_intent_classifier.classify_intent("क्या कल दिल्ली में बारिश होगी?")
    assert res.intent in [IntentCategory.FORECAST_SHORT_TERM, IntentCategory.FORECAST_EXTENDED]
    assert res.language_detected == LanguageCode.HI
