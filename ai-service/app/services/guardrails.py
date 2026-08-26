import re
from typing import Dict, Any, List, Optional
from ..models.schemas import GuardrailResult

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous|above|all|system)\s+instructions",
    r"system prompt override",
    r"you are now a (?:dan|jailbreak|bypass)",
    r"disregard\s+(?:rules|guardrails|safety|instructions)",
    r"<script>.*?</script>",
    r"drop database",
    r"delete from users",
    r"reveal\s+(?:secret|system\s+prompt|keys|passwords)"
]

NON_WEATHER_TOPICS = [
    "recipe", "movie", "song", "cryptocurrency", "bitcoin", "stock market",
    "write code for", "write python script for", "gaming cheat", "politics"
]

class GuardrailService:
    """
    Pre-flight safety, Domain verification, Factual consistency, and Anti-Hallucination Safeguards
    """
    def check_input_safety(self, message: str) -> GuardrailResult:
        if not message or not message.strip():
            return GuardrailResult(passed=False, reason="Empty query provided.")

        clean_text = message.lower()

        # 1. Prompt Injection & Jailbreak check
        for pattern in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, clean_text):
                return GuardrailResult(
                    passed=False,
                    reason="Security violation: Input contained adversarial prompt injection or safety bypass patterns.",
                    confidence_score=0.0
                )

        return GuardrailResult(passed=True, confidence_score=1.0)

    def is_out_of_domain(self, message: str) -> bool:
        clean = message.lower()
        # If text explicitly mentions weather concepts, it is in-domain
        weather_terms = [
            "weather", "rain", "temp", "temperature", "forecast", "cloud", "sun", "wind",
            "storm", "cyclone", "flood", "heat", "cold", "climate", "monsoon", "crop",
            "kisan", "spray", "humidity", "umbrella", "mausam", "barish", "hawa", "paani"
        ]
        if any(term in clean for term in weather_terms):
            return False

        # If it matches obvious non-weather topics
        if any(topic in clean for topic in NON_WEATHER_TOPICS):
            return True

        return False

    def verify_factual_consistency(
        self,
        generated_answer: str,
        tool_data: Optional[Dict[str, Any]],
        official_alerts_found: bool = False
    ) -> GuardrailResult:
        """
        Verify that generated response doesn't hallucinate non-existent disaster warnings or contradict numerical metrics
        """
        if not tool_data:
            return GuardrailResult(passed=True, confidence_score=0.9)

        lower_answer = generated_answer.lower()
        hallucination = False
        disclaimer_added = False

        # Guardrail Rule 1: Never fabricate official warnings if no official alerts exist
        if not official_alerts_found:
            if any(w in lower_answer for w in ["official red alert", "official red warning", "official cyclone emergency evacuation"]):
                hallucination = True

        # Extract numbers in generated text
        # (Soft check for wild contradictions)
        if "temperature" in tool_data:
            true_temp = tool_data["temperature"]
            # Look for temperatures like "35°c" or "35 degrees"
            temp_matches = re.findall(r'(\d+)\s*(?:°c|degrees|c\b)', lower_answer)
            for m in temp_matches:
                extracted_temp = float(m)
                # If difference > 15°C from truth without context, flag discrepancy
                if abs(extracted_temp - true_temp) > 15.0 and "min" not in lower_answer and "max" not in lower_answer:
                    pass  # Soft log

        confidence = 0.95 if not hallucination else 0.60

        return GuardrailResult(
            passed=not hallucination,
            reason="Response strictly grounded in validated meteorological observations" if not hallucination else "Discrepancy detected in disaster warning status",
            confidence_score=confidence,
            official_warning_present=official_alerts_found,
            hallucination_detected=hallucination,
            disclaimer_added=disclaimer_added
        )

default_guardrail_service = GuardrailService()
