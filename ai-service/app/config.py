import os
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PORT: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    HOST: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    ENVIRONMENT: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    LOG_LEVEL: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    AI_PROVIDER: str = Field(default_factory=lambda: os.getenv("AI_PROVIDER", "fallback").lower())
    
    # Gemini
    GEMINI_API_KEY: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    GEMINI_MODEL: str = Field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite"))

    # OpenAI
    OPENAI_API_KEY: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    OPENAI_BASE_URL: str = Field(default_factory=lambda: os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"))
    OPENAI_MODEL: str = Field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini"))

    # Anthropic
    ANTHROPIC_API_KEY: str = Field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", ""))
    ANTHROPIC_MODEL: str = Field(default_factory=lambda: os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"))

    # Ollama
    OLLAMA_BASE_URL: str = Field(default_factory=lambda: os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"))
    OLLAMA_MODEL: str = Field(default_factory=lambda: os.getenv("OLLAMA_MODEL", "llama3:8b"))

    # Parameters
    AI_TEMPERATURE: float = Field(default_factory=lambda: float(os.getenv("AI_TEMPERATURE", "0.2")))
    AI_MAX_TOKENS: int = Field(default_factory=lambda: int(os.getenv("AI_MAX_TOKENS", "1024")))

    # Gateways & CORS
    BACKEND_API_URL: str = Field(default_factory=lambda: os.getenv("BACKEND_API_URL", "http://localhost:5000/api/v1"))
    OPEN_METEO_BASE_URL: str = Field(default_factory=lambda: os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1"))
    CORS_ORIGIN: str = Field(default_factory=lambda: os.getenv("CORS_ORIGIN", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:80"))

settings = Settings()
