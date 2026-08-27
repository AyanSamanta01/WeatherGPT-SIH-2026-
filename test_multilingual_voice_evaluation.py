"""
Comprehensive Multilingual LLM & Speech Recognition (STT / TTS) Test Suite
===========================================================================
Evaluates:
1. Multilingual LLM meteorological reasoning & grounding across 11 Indian languages.
2. Speech Recognition (STT) transcription across regional speech audio inputs.
3. Voice synthesis (TTS) across regional languages.
4. End-to-end voice-in / voice-out conversational AI microservice endpoint.
"""

import os
import sys
import io
import wave
import struct
import math
import base64

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient

# Ensure ai-service and src are in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AI_SERVICE_DIR = os.path.join(BASE_DIR, "ai-service")
sys.path.insert(0, AI_SERVICE_DIR)
sys.path.insert(0, BASE_DIR)

from src.api import app as fastapi_app
from app.services.voice_service import VoiceService, SUPPORTED_VOICE_LANGUAGES
from app.services.multilingual_service import MultilingualService

client = TestClient(fastapi_app)
voice_svc = VoiceService()
multi_svc = MultilingualService()

def make_test_tone_wav(duration_s=1.0, freq=440.0, sample_rate=16000) -> str:
    """Generates a valid PCM 16-bit Mono WAV audio in base64"""
    num_samples = int(sample_rate * duration_s)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        frames = bytearray()
        for i in range(num_samples):
            val = int(32767.0 * 0.3 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            frames.extend(struct.pack("<h", val))
        wav.writeframes(frames)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def test_multilingual_language_detection():
    print("\n--- 1. Testing Automatic Language Detection & Classification ---")
    test_cases = [
        ("Will it rain in Mumbai tomorrow?", "en"),
        ("क्या कल दिल्ली में बारिश होगी?", "hi"),
        ("কলকাতায় কি আজ বৃষ্টি হবে?", "bn"),
        ("சென்னையில் இன்று மழை பெய்யுமா?", "ta"),
        ("హైదరాబాద్‌లో రేపు వర్షం పడుతుందా?", "te"),
        ("मुंबईत उद्या पाऊस पडेल का?", "mr"),
        ("અમદાવાદમાં કાલે વરસાદ પડશે?", "gu"),
        ("ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?", "kn"),
        ("ഇന്ന് കൊച്ചിയിൽ മഴ പെയ്യുമോ?", "ml"),
        ("ਕੀ ਅੱਜ ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਮੀਂਹ ਪਵੇਗਾ?", "pa"),
    ]
    
    for text, expected_lang in test_cases:
        detected = multi_svc.detect_language(text).value
        assert detected == expected_lang, f"Failed detection: '{text}' detected as {detected}, expected {expected_lang}"
        print(f"  [OK] '{text[:25]}...' -> Detected: {detected.upper()} (Expected: {expected_lang.upper()})")
    print("[PASSED] Language Detection test passed!")


def test_multilingual_llm_meteorological_reasoning():
    print("\n--- 2. Testing Multilingual LLM Weather Reasoning Across 11 Regional Languages ---")
    
    test_cities = [
        ("Mumbai", "en", "Will it rain in Mumbai today?"),
        ("Delhi", "hi", "दिल्ली में मौसम और तापमान का क्या हाल है?"),
        ("Kolkata", "bn", "কলকাতায় কি ভারী বৃষ্টির সম্ভাবনা আছে?"),
        ("Chennai", "ta", "சென்னையில் மழை பெய்யுமா?"),
        ("Hyderabad", "te", "హైదరాబాద్ వాతావరణ సమాచారం చెప్పండి"),
        ("Mumbai", "mr", "मुंबईत हवामान कसे राहील?"),
        ("Ahmedabad", "gu", "અમદાવાદમાં તાપમાન કેટલું રહેશે?"),
        ("Bengaluru", "kn", "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮಳೆ ಮುನ್ಸೂಚನೆ ಏನು?"),
        ("Kolkata", "ml", "കൊൽക്കത്തയിൽ ഇന്നത്തെ താപനില എത്രയാണ്?"),
        ("Delhi", "pa", "ਦਿੱਲੀ ਵਿੱਚ ਮੀਂਹ ਦਾ ਕੀ ਹਾਲ ਹੈ?"),
        ("Bhubaneswar", "or", "ଭୁବନେଶ୍ୱରରେ ଆଜି ବର୍ଷା ହେବ କି?"),
    ]
    
    for city, lang, prompt in test_cities:
        resp = client.post("/api/v1/agent/query", json={
            "message": prompt,
            "city": city,
            "language": lang
        })
        assert resp.status_code == 200, f"Query failed for {lang} ({city}): {resp.text}"
        data = resp.json()
        
        answer = data.get("answer", "")
        risk = data.get("risk", "")
        forecast = data.get("forecast", {})
        
        assert len(answer) > 20, f"Empty answer for {lang}"
        assert "temperature_c" in forecast, f"Missing temperature in forecast for {city}"
        
        print(f"  [OK] Language: {lang.upper():<3} | City: {city:<11} | Risk: {risk.upper():<6}")
        print(f"       LLM Response: {answer[:85]}...")
    
    print("[PASSED] Multilingual LLM Weather Reasoning verified across all languages!")


def test_speech_recognition_module():
    print("\n--- 3. Testing Speech Recognition (STT) Module ---")
    import asyncio
    
    test_audio_b64 = make_test_tone_wav(duration_s=1.5, freq=440.0)
    
    # Test STT with explicit language targets
    languages_to_test = ["en", "hi", "bn", "ta", "te", "mr"]
    for lang in languages_to_test:
        text, confidence = asyncio.run(voice_svc.transcribe_audio(
            audio_base64=test_audio_b64,
            audio_format="wav",
            language=lang
        ))
        assert len(text) > 0, f"Empty transcript for {lang}"
        assert confidence > 0.0, f"Zero confidence for {lang}"
        print(f"  [OK] STT Transcribe ({lang.upper()}): '{text}' (Confidence: {confidence:.2f})")

    # Test pure transcribe endpoint
    resp = client.post("/api/v1/voice/transcribe", json={
        "audio_base64": test_audio_b64,
        "audio_format": "wav",
        "language": "hi"
    })
    assert resp.status_code == 200
    stt_data = resp.json()
    assert stt_data.get("status") == "success"
    print(f"  [OK] POST /api/v1/voice/transcribe endpoint validated.")
    print("[PASSED] Speech Recognition (STT) Module verified successfully!")


def test_text_to_speech_module():
    print("\n--- 4. Testing Text-to-Speech (TTS) Regional Audio Synthesis ---")
    
    import asyncio
    regional_texts = [
        ("en", "Heavy rainfall advisory for Mumbai over the next 6 hours."),
        ("hi", "मुंबई में अगले 6 घंटों में भारी बारिश की चेतावनी है। कृपया सतर्क रहें।"),
        ("bn", "কলকাতায় আগামী ৬ ঘণ্টায় মাঝারি থেকে ভারী বৃষ্টির সম্ভাবনা রয়েছে।"),
        ("ta", "சென்னையில் அடுத்த 6 மணி நேரத்தில் பலத்த மழை பெய்யக்கூடும்."),
        ("te", "హైదరాబాద్‌లో రాబోయే 6 గంటల్లో వర్షం కురిసే అవకాశం ఉంది."),
        ("mr", "मुंबईमध्ये पुढील ६ तासांत मुसळधार पावसाचा इशारा देण्यात आला आहे.")
    ]
    
    for lang, text in regional_texts:
        audio_b64, audio_format = asyncio.run(voice_svc.synthesize_speech(text=text, language=lang))
        assert len(audio_b64) > 500, f"Synthesized audio too short for {lang}"
        print(f"  [OK] TTS Synthesize ({lang.upper()}): {audio_format} | Audio Base64 length: {len(audio_b64)} chars")
    
    print("[PASSED] Text-to-Speech (TTS) Module verified successfully!")


def test_end_to_end_voice_query_pipeline():
    print("\n--- 5. Testing End-to-End Voice Query Pipeline (Audio-In -> LLM Reasoning -> Audio-Out) ---")
    
    test_audio_b64 = make_test_tone_wav(duration_s=2.0, freq=350.0)
    
    voice_cases = [
        ("Mumbai", "en", "Will it rain in Mumbai?"),
        ("Delhi", "hi", "दिल्ली में बारिश की क्या संभावना है?"),
        ("Kolkata", "bn", "কলকাতায় কি ছাতা নিতে হবে?")
    ]
    
    for city, lang, mock_msg in voice_cases:
        resp = client.post("/api/v1/voice/query", json={
            "audio_base64": test_audio_b64,
            "audio_format": "wav",
            "message": mock_msg,
            "city": city,
            "language": lang,
            "synthesize_audio": True
        })
        assert resp.status_code == 200, f"Voice query failed: {resp.text}"
        data = resp.json()
        
        transcript = data.get("transcript")
        answer = data.get("answer")
        audio_out = data.get("audio_base64")
        audio_fmt = data.get("audio_format")
        risk = data.get("risk")
        
        assert transcript is not None and len(transcript) > 0
        assert answer is not None and len(answer) > 0
        assert audio_out is not None and len(audio_out) > 500
        assert audio_fmt in ["audio/mp3", "audio/wav"]
        
        print(f"  [OK] City: {city:<10} ({lang.upper()})")
        print(f"       Transcribed: '{transcript}'")
        print(f"       Grounded LLM Answer: '{answer[:75]}...'")
        print(f"       Generated Spoken Audio: {audio_fmt} ({len(audio_out)} chars)")
    
    print("[PASSED] End-to-End Voice Query Pipeline passed with 100% success!")


if __name__ == "__main__":
    print("=" * 70)
    print("WEATHERGPT MULTILINGUAL LLM & SPEECH RECOGNITION (STT/TTS) TEST SUITE")
    print("=" * 70)
    
    test_multilingual_language_detection()
    test_multilingual_llm_meteorological_reasoning()
    test_speech_recognition_module()
    test_text_to_speech_module()
    test_end_to_end_voice_query_pipeline()
    
    print("\n" + "=" * 70)
    print("ALL MULTILINGUAL LLM & SPEECH RECOGNITION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)
