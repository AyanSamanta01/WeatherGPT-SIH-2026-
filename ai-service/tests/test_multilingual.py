import pytest
from app.services.multilingual_service import default_multilingual_service
from app.models.enums import LanguageCode

def test_language_detection():
    assert default_multilingual_service.detect_language("Will it rain in Mumbai?") == LanguageCode.EN
    assert default_multilingual_service.detect_language("कल दिल्ली में मौसम कैसा रहेगा?") == LanguageCode.HI
    assert default_multilingual_service.detect_language("কলকাতায় কি আগামীকাল বৃষ্টি হবে?") == LanguageCode.BN
    assert default_multilingual_service.detect_language("சென்னையில் நாளை மழை பெய்யுமா?") == LanguageCode.TA
    assert default_multilingual_service.detect_language("హైదరాబాద్‌లో రేపు వాతావరణం ఎలా ఉంటుంది?") == LanguageCode.TE
    assert default_multilingual_service.detect_language("અમદાવાદમાં કાલે વરસાદ પડશે?") == LanguageCode.GU
    assert default_multilingual_service.detect_language("ਕੀ ਕੱਲ੍ਹ ਲੁਧਿਆਣਾ ਵਿੱਚ ਮੀਂਹ ਪਵੇਗਾ?") == LanguageCode.PA

def test_multilingual_response_localization():
    tool_mock = {
        "location": "Mumbai",
        "daily": [
            {"date": "Today", "temperature_max": 31, "temperature_min": 25},
            {"date": "Tomorrow", "temperature_max": 30, "temperature_min": 24, "precipitation_probability": 80, "precipitation_sum_mm": 25}
        ]
    }
    
    # Hindi localization check
    hi_resp = default_multilingual_service.localize_weather_response("English fallback", "hi", tool_mock)
    assert "पूर्वानुमान" in hi_resp or "मौसम" in hi_resp
    assert "30°C" in hi_resp
    assert "80%" in hi_resp

    # Bengali localization check
    bn_resp = default_multilingual_service.localize_weather_response("English fallback", "bn", tool_mock)
    assert "পূর্বাভাস" in bn_resp or "তাপমাত্রা" in bn_resp
    assert "80%" in bn_resp
