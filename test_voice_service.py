"""
WeatherGPT Native AI Voice (STT & TTS) Test Suite
==================================================
Tests server-side Speech-to-Text (STT), Text-to-Speech (TTS),
and the /api/v1/voice/query endpoint on the WeatherGPT AI Microservice.
"""

import os
import sys
import base64
import asyncio
from fastapi.testclient import TestClient

# Ensure utf-8 output encoding for console
sys.stdout.reconfigure(encoding='utf-8')

# Ensure ai-service is in python path
AI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai-service")
if AI_DIR not in sys.path:
    sys.path.insert(0, AI_DIR)

from src.api import app
from app.services.voice_service import default_voice_service

client = TestClient(app)


def test_text_cleaner_for_speech():
    print("\n--- 1. Testing Markdown Cleaner for TTS Audio ---")
    markdown_text = (
        "### Weather Advisory for **Mumbai** 🌧️\n"
        "- Expected rain: **45.2 mm**\n"
        "- [Official Alert](http://imd.gov.in)\n"
        "`Heat index: Normal`\n"
        "Take precautions!"
    )
    clean = default_voice_service.clean_text_for_speech(markdown_text)
    print(f"Original:\n{markdown_text}")
    print(f"Cleaned for Speech:\n{clean}")
    assert "**" not in clean
    assert "###" not in clean
    assert "🌧️" not in clean
    assert "http" not in clean
    print("[PASSED] Markdown cleaner verified.")


def test_voice_tts_synthesis_english():
    print("\n--- 2. Testing TTS Audio Synthesis (English) ---")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    text = "In Kolkata over the next 6 hours, our ML models predict mild temperatures around 28 degrees Celsius."
    b64_audio, mime = loop.run_until_complete(
        default_voice_service.synthesize_speech(text=text, language="en", speed=1.0)
    )
    assert len(b64_audio) > 100, "Expected non-empty audio base64 string"
    assert mime in ["audio/mp3", "audio/wav"]
    print(f"Generated Audio MIME: {mime} | Base64 Length: {len(b64_audio)} chars")
    print("[PASSED] English TTS synthesis verified.")


def test_voice_tts_synthesis_hindi():
    print("\n--- 3. Testing TTS Audio Synthesis (Hindi) ---")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    text = "मुंबई में अगले 6 घंटों में हल्की बारिश की संभावना है। तापमान 29 डिग्री रहेगा।"
    b64_audio, mime = loop.run_until_complete(
        default_voice_service.synthesize_speech(text=text, language="hi", speed=1.0)
    )
    assert len(b64_audio) > 100
    print(f"Hindi Audio MIME: {mime} | Base64 Length: {len(b64_audio)} chars")
    print("[PASSED] Hindi TTS synthesis verified.")


def test_voice_stt_transcription():
    print("\n--- 4. Testing STT Speech-to-Text Transcription ---")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    # Generate a dummy synthetic audio base64
    synth_wav = default_voice_service._generate_synthetic_wav("Testing audio waveform")
    b64_audio = base64.b64encode(synth_wav).decode("utf-8")

    transcript, conf = loop.run_until_complete(
        default_voice_service.transcribe_audio(audio_base64=b64_audio, language="en")
    )
    assert len(transcript) > 0
    print(f"Transcribed Text: '{transcript}' (Confidence: {conf:.2f})")
    print("[PASSED] STT transcription verified.")


def test_voice_query_endpoint():
    print("\n--- 5. Testing POST /api/v1/voice/query Endpoint ---")
    # Generate dummy audio
    synth_wav = default_voice_service._generate_synthetic_wav("Is it going to rain in Mumbai?")
    b64_audio = base64.b64encode(synth_wav).decode("utf-8")

    payload = {
        "audio_base64": b64_audio,
        "audio_format": "wav",
        "language": "en",
        "city": "Mumbai",
        "synthesize_audio": True
    }
    resp = client.post("/api/v1/voice/query", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert data["status"] == "success"
    assert "transcript" in data
    assert "answer" in data
    assert data["location"] == "Mumbai"
    assert "audio_base64" in data
    assert len(data["audio_base64"]) > 100
    print(f"User Voice Transcript: {data['transcript']}")
    print(f"Grounded AI Answer: {data['answer']}")
    print(f"Spoken Response Audio Length: {len(data['audio_base64'])} chars")
    print(f"Risk Level: {data['risk']}")
    print("[PASSED] Voice Query endpoint verified.")


def test_voice_synthesize_endpoint():
    print("\n--- 6. Testing POST /api/v1/voice/synthesize Endpoint ---")
    payload = {
        "text": "Critical weather alert: High wind speed expected near coastal regions.",
        "language": "en",
        "speed": 1.0
    }
    resp = client.post("/api/v1/voice/synthesize", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert len(data["audio_base64"]) > 100
    print(f"Synthesize Response Audio Length: {len(data['audio_base64'])} chars")
    print("[PASSED] Voice synthesize endpoint verified.")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING WEATHERGPT NATIVE AI VOICE (STT & TTS) TEST SUITE")
    print("=" * 60)
    test_text_cleaner_for_speech()
    test_voice_tts_synthesis_english()
    test_voice_tts_synthesis_hindi()
    test_voice_stt_transcription()
    test_voice_query_endpoint()
    test_voice_synthesize_endpoint()
    print("=" * 60)
    print("ALL NATIVE AI VOICE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
