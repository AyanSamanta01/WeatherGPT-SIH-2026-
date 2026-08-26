from .system_prompts import (
    BASE_SYSTEM_PROMPT,
    AGRI_SYSTEM_PROMPT,
    DISASTER_EMERGENCY_PROMPT,
    OUTDOOR_ACTIVITY_PROMPT,
    get_system_prompt_for_persona
)
from .multilingual_prompts import (
    LANGUAGE_INSTRUCTIONS,
    INDIAN_WEATHER_GLOSSARY,
    get_language_guidelines
)
from .few_shot_examples import FEW_SHOT_TOOL_CALLING_EXAMPLES

__all__ = [
    "BASE_SYSTEM_PROMPT",
    "AGRI_SYSTEM_PROMPT",
    "DISASTER_EMERGENCY_PROMPT",
    "OUTDOOR_ACTIVITY_PROMPT",
    "get_system_prompt_for_persona",
    "LANGUAGE_INSTRUCTIONS",
    "INDIAN_WEATHER_GLOSSARY",
    "get_language_guidelines",
    "FEW_SHOT_TOOL_CALLING_EXAMPLES"
]
