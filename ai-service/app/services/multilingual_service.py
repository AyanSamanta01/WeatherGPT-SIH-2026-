import re
from typing import Dict, Any, Optional
from ..models.enums import LanguageCode
from ..prompts.multilingual_prompts import INDIAN_WEATHER_GLOSSARY
from ..config import settings

class MultilingualService:
    """
    Language detection and native multilingual weather response synthesis
    """
    def detect_language(self, text: str) -> LanguageCode:
        if not text:
            return LanguageCode.EN

        # Check Unicode script ranges
        for char in text:
            code = ord(char)
            # Devanagari (Hindi, Marathi)
            if 0x0900 <= code <= 0x097F:
                if any(w in text for w in ["आहे", "पाऊस", "कसा", "होईल", "सांगा", "उद्या"]):
                    return LanguageCode.MR
                return LanguageCode.HI
            # Bengali / Assamese
            elif 0x0980 <= code <= 0x09FF:
                return LanguageCode.BN
            # Gurmukhi (Punjabi)
            elif 0x0A00 <= code <= 0x0A7F:
                return LanguageCode.PA
            # Gujarati
            elif 0x0A80 <= code <= 0x0AFF:
                return LanguageCode.GU
            # Odia
            elif 0x0B00 <= code <= 0x0B7F:
                return LanguageCode.OR
            # Tamil
            elif 0x0B80 <= code <= 0x0BFF:
                return LanguageCode.TA
            # Telugu
            elif 0x0C00 <= code <= 0x0C7F:
                return LanguageCode.TE
            # Kannada
            elif 0x0C80 <= code <= 0x0CFF:
                return LanguageCode.KN
            # Malayalam
            elif 0x0D00 <= code <= 0x0D7F:
                return LanguageCode.ML

        return LanguageCode.EN

    def localize_weather_response(
        self,
        english_text: str,
        target_language: str,
        tool_data: Optional[Dict[str, Any]] = None,
        is_llm_generated: bool = False
    ) -> str:
        """
        Localize response into target Indian language with standard meteorological terminology.
        Never overwrites LLM generated text if it already contains native language responses.
        """
        lang = (target_language or "en").lower()
        if lang == "en" or lang not in INDIAN_WEATHER_GLOSSARY:
            return english_text

        # If LLM generated the response directly in native language or rich prose, preserve it
        if is_llm_generated:
            # Check if LLM already generated in native script
            has_native_chars = any(ord(c) > 0x0800 for c in english_text)
            if has_native_chars:
                return english_text

        loc = tool_data.get("location", "क्षेत्र") if tool_data else "स्थान"

        # 1. Greetings & Capabilities
        if tool_data and tool_data.get("is_greeting"):
            if lang == "hi":
                return (
                    "👋 **नमस्ते! मैं WeatherGPT हूँ — आपका मौसम सलाहकार।**\n\n"
                    "मैं आपके लिए लाइव मौसम, अगले 6 घंटे का ML पूर्वानुमान, मॉडल तुलना (GFS vs ECMWF), किसान कृषि सलाह और आपदा चेतावनी जानकारी प्रदान करता हूँ।\n\n"
                    "💡 *आप किसी भी शहर का नाम या मौसम से जुड़ा सवाल पूछ सकते हैं!*"
                )
            elif lang == "bn":
                return (
                    "👋 **নমস্কার! আমি WeatherGPT — আপনার আবহাওয়া উপদেষ্টা।**\n\n"
                    "আমি লাইভ আবহাওয়া, ৬ ঘণ্টার পূর্বাভাস, কৃষি পরামর্শ এবং দুর্যোগের সতর্কতা প্রদান করি।\n\n"
                    "💡 *আপনি যেকোনো শহরের আবহাওয়া বা প্রশ্ন করতে পারেন!*"
                )

        # 2. Check if tool_data is forecast
        if tool_data and "daily" in tool_data:
            daily = tool_data.get("daily", [])
            if len(daily) > 1:
                tomorrow = daily[1]
                t_max = tomorrow.get("temperature_max", 31)
                t_min = tomorrow.get("temperature_min", 24)
                p_prob = tomorrow.get("precipitation_probability", 20)
                rain_mm = tomorrow.get("precipitation_sum_mm", 0)

                if lang == "hi":
                    umbrella_msg = "कृपया बाहर निकलते समय छाता साथ रखें।" if p_prob >= 40 else "भारी बारिश की संभावना नहीं है।"
                    return (
                        f"📊 **{loc} के लिए मौसम पूर्वानुमान:**\n\n"
                        f"- **कल का तापमान:** न्यूनतम **{t_min}°C** से अधिकतम **{t_max}°C**\n"
                        f"- **वर्षा की संभावना:** **{p_prob}%** (अनुमानित वर्षा: **{rain_mm} मिमी**)\n\n"
                        f"💡 **सलाह:** {umbrella_msg}\n\n"
                        f"📌 *स्रोत: IMD / Open-Meteo मौसम पूर्वानुमान मॉडल।* "
                    )
                elif lang == "bn":
                    umbrella_msg = "বাইরে বের হওয়ার সময় ছাতা সাথে রাখুন।" if p_prob >= 40 else "ভারী বৃষ্টির সম্ভাবনা কম।"
                    return (
                        f"📊 **{loc}-এর আবহাওয়ার পূর্বাভাস:**\n\n"
                        f"- **আগামীকালের তাপমাত্রা:** সর্বনিম্ন **{t_min}°C** থেকে সর্বোচ্চ **{t_max}°C**\n"
                        f"- **বৃষ্টিপাতের সম্ভাবনা:** **{p_prob}%** (সম্ভাব্য বৃষ্টি: **{rain_mm} মিমি**)\n\n"
                        f"💡 **পরামর্শ:** {umbrella_msg}\n\n"
                        f"📌 *উৎস: IMD / Open-Meteo আবহাওয়া মডেল।* "
                    )
                elif lang == "ta":
                    umbrella_msg = "வெளியே செல்லும்போது குடை எடுத்துச் செல்லவும்." if p_prob >= 40 else "கனமழைக்கு வாய்ப்பில்லை."
                    return (
                        f"📊 **{loc} வானிலை முன்னறிவிப்பு:**\n\n"
                        f"- **நாளைய வெப்பநிலை:** குறைந்தபட்சம் **{t_min}°C** முதல் அதிகபட்சம் **{t_max}°C**\n"
                        f"- **மழைப்பொழிவு வாய்ப்பு:** **{p_prob}%** (எதிர்பார்க்கப்படும் மழை: **{rain_mm} மிமீ**)\n\n"
                        f"💡 **ஆலோசனை:** {umbrella_msg}\n\n"
                        f"📌 *ஆதாரம்: IMD / Open-Meteo வானிலை மாதிரிகள்.* "
                    )
                elif lang == "te":
                    umbrella_msg = "బయటకు వెళ్ళేటప్పుడు గొడుగు తీసుకెళ్లడం మంచిది." if p_prob >= 40 else "భారీ వర్ష సూచన లేదు."
                    return (
                        f"📊 **{loc} వాతావరణ సూచన:**\n\n"
                        f"- **రేపటి ఉష్ణోగ్రత:** కనిష్ట **{t_min}°C** నుండి గరిష్ట **{t_max}°C**\n"
                        f"- **వర్షపాతం సంభావ్యత:** **{p_prob}%** (అంచనా వర్షం: **{rain_mm} మిమీ**)\n\n"
                        f"💡 **సలహా:** {umbrella_msg}\n\n"
                        f"📌 *మూలం: IMD / Open-Meteo వాతావరణ అంచనా మోడల్స్.* "
                    )
                elif lang == "mr":
                    umbrella_msg = "बाहेर पडताना छत्री सोबत ठेवावी." if p_prob >= 40 else "मुसळधार पावसाची शक्यता नाही."
                    return (
                        f"📊 **{loc} साठी हवामान अंदाज:**\n\n"
                        f"- **उद्याचे तापमान:** किमान **{t_min}°C** ते कमाल **{t_max}°C**\n"
                        f"- **पावसाची शक्यता:** **{p_prob}%** (अपेक्षित पाऊस: **{rain_mm} मिमी**)\n\n"
                        f"💡 **सल्ला:** {umbrella_msg}\n\n"
                        f"📌 *स्रोत: IMD / Open-Meteo हवामान अंदाज मॉडेल.* "
                    )

        # 3. Check if tool_data is current observation
        if tool_data and "temperature" in tool_data:
            temp = tool_data.get("temperature", 28)
            humidity = tool_data.get("humidity", 65)
            wind = tool_data.get("wind_speed", 12)
            rain = tool_data.get("rainfall", 0)

            if lang == "hi":
                return (
                    f"🌡️ **{loc} में वर्तमान मौसम:**\n\n"
                    f"- **तापमान:** **{temp}°C**\n"
                    f"- **नमी (आर्द्रता):** **{humidity}%**\n"
                    f"- **हवा की गति:** **{wind} किमी/घंटा** | **वर्षा:** **{rain} मिमी**\n\n"
                    f"📌 *स्रोत: IMD / Open-Meteo अवलोकन डेटा।* "
                )
            elif lang == "bn":
                return (
                    f"🌡️ **{loc}-এর বর্তমান আবহাওয়া:**\n\n"
                    f"- **তাপমাত্রা:** **{temp}°C**\n"
                    f"- **আর্দ্রতা:** **{humidity}%**\n"
                    f"- **বাতাসের গতিবেগ:** **{wind} কিমি/ঘণ্টা** | **বৃষ্টিপাত:** **{rain} মিমি**\n\n"
                    f"📌 *উৎস: IMD / Open-Meteo পর্যবেক্ষণ ডেটা।* "
                )
            elif lang == "ta":
                return (
                    f"🌡️ **{loc} தற்போதைய வானிலை:**\n\n"
                    f"- **வெப்பநிலை:** **{temp}°C**\n"
                    f"- **ஈரப்பதம்:** **{humidity}%**\n"
                    f"- **காற்றின் வேகம்:** **{wind} கிமீ/மணி** | **மழைப்பொழிவு:** **{rain} மிமீ**\n\n"
                    f"📌 *ஆதாரம்: IMD / Open-Meteo நேரடி தரவு.* "
                )

        return english_text

default_multilingual_service = MultilingualService()
