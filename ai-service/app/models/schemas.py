from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .enums import IntentCategory, RiskLevel, LanguageCode, AlertSeverity, TargetSector

class ChatMessage(BaseModel):
    role: str = Field(description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(description="Message text")
    timestamp: Optional[str] = None
    intent: Optional[str] = None
    risk_level: Optional[str] = None

class IntentResult(BaseModel):
    intent: IntentCategory
    confidence: float = 0.95
    entities: Dict[str, Any] = Field(default_factory=dict)
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    temporal_scope: Optional[str] = "current"  # current, tomorrow, multi_day, historical
    target_sector: TargetSector = TargetSector.GENERAL_PUBLIC
    language_detected: LanguageCode = LanguageCode.EN
    requires_tool_call: bool = True
    suggested_tools: List[str] = Field(default_factory=list)

class WeatherCard(BaseModel):
    location: str
    temperature: Optional[float] = None
    feels_like: Optional[float] = None
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    humidity: Optional[int] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[str] = None
    precipitation: Optional[float] = None
    precipitation_probability: Optional[int] = None
    condition: Optional[str] = "Normal"
    weather_code: Optional[int] = 0
    uv_index: Optional[float] = None
    risk_level: RiskLevel = RiskLevel.LOW
    source: str = "Open-Meteo NWP"
    timestamp: Optional[str] = None

class ToolCallRequest(BaseModel):
    name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)

class ToolCallResult(BaseModel):
    tool_name: str
    status: str = "success"  # success or error
    data: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    execution_time_ms: float = 0.0

class GuardrailResult(BaseModel):
    passed: bool = True
    reason: Optional[str] = None
    confidence_score: float = 1.0
    official_warning_present: bool = False
    hallucination_detected: bool = False
    disclaimer_added: bool = False

class RAGSearchResult(BaseModel):
    title: str
    content: str
    category: str
    source: str
    relevance_score: float

class AgentQueryRequest(BaseModel):
    message: Optional[str] = Field(default=None, description="User's query")
    prompt: Optional[str] = Field(default=None, description="Alias for message")
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    language: Optional[str] = Field(default="en", description="Target response language")
    conversationId: Optional[str] = Field(default=None, description="Conversation session ID")
    conversation_id: Optional[str] = Field(default=None, description="Alias for conversationId")
    conversationHistory: Optional[List[ChatMessage]] = Field(default_factory=list)
    sector: Optional[TargetSector] = Field(default=TargetSector.GENERAL_PUBLIC)
    units: Optional[str] = Field(default="metric")

class AgentQueryResponseData(BaseModel):
    answer: str
    location: str
    sources: List[str]
    risk: RiskLevel
    intent: str
    language: str
    conversation_id: Optional[str] = None
    weatherCard: Optional[WeatherCard] = None
    tools_used: List[str] = Field(default_factory=list)
    rag_sources: List[str] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    conversation_mode: Optional[str] = "direct_answer"
    confidence: float = 0.95
    guardrail_status: str = "passed"
    processing_time_ms: float = 0.0

class AgentQueryResponse(BaseModel):
    status: str = "success"
    data: AgentQueryResponseData
    # Mirror top-level fields for direct backward-compatibility with backend
    answer: str
    location: str
    sources: List[str]
    risk: str
    conversationId: Optional[str] = None
    suggested_actions: Optional[List[str]] = Field(default_factory=list)
    suggestedActions: Optional[List[str]] = Field(default_factory=list)


# -------------------------------------------------------------
# Voice STT & TTS Schemas
# -------------------------------------------------------------
class VoiceQueryRequest(BaseModel):
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded audio payload (WAV, MP3, WebM, OGG)")
    audio_format: Optional[str] = Field(default="wav", description="Audio container format: wav, mp3, ogg, webm, m4a")
    language: Optional[str] = Field(default="en", description="Spoken language code (e.g. en, hi, bn, ta, te, mr)")
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    city: Optional[str] = Field(default=None, description="Optional city name hint")
    conversationId: Optional[str] = Field(default=None, description="Conversation session ID")
    sector: Optional[TargetSector] = Field(default=TargetSector.GENERAL_PUBLIC)
    synthesize_audio: Optional[bool] = Field(default=True, description="Whether to generate TTS audio response")
    voice_speed: Optional[float] = Field(default=1.0, description="Speech rate for audio synthesis")


class VoiceQueryResponse(BaseModel):
    status: str = "success"
    transcript: str = Field(description="Transcribed user speech query")
    answer: str = Field(description="Grounded AI response text")
    location: str
    risk: str
    sources: List[str] = Field(default_factory=list)
    conversationId: Optional[str] = None
    weatherCard: Optional[WeatherCard] = None
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded synthesized audio response")
    audio_format: Optional[str] = Field(default="audio/mp3", description="Audio MIME type")
    language: str = "en"
    processing_time_ms: float = 0.0


class TranscribeRequest(BaseModel):
    audio_base64: str = Field(description="Base64 encoded audio payload")
    audio_format: Optional[str] = Field(default="wav")
    language: Optional[str] = Field(default="en")


class TranscribeResponse(BaseModel):
    status: str = "success"
    transcript: str
    confidence: float = 0.95
    language: str = "en"


class SynthesizeRequest(BaseModel):
    text: str = Field(description="Text to convert to spoken audio")
    language: Optional[str] = Field(default="en", description="Target regional language code")
    speed: Optional[float] = Field(default=1.0, description="Speech rate multiplier")


class SynthesizeResponse(BaseModel):
    status: str = "success"
    audio_base64: str
    audio_format: str = "audio/mp3"
    language: str = "en"
