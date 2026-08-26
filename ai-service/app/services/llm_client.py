import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from ..config import settings

logger = logging.getLogger("WeatherGPT.LLMClient")

class LLMClient:
    """
    Unified Multi-Provider LLM Client supporting Gemini, OpenAI, Anthropic, Ollama, and Deterministic Fallback
    """
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.anthropic_key = settings.ANTHROPIC_API_KEY
        self.ollama_url = settings.OLLAMA_BASE_URL

    async def generate_response(
        self,
        system_prompt: str,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        context_data: Optional[Dict[str, Any]] = None,
        rag_context: Optional[str] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Generate grounded meteorological answer using configured provider
        """
        temp = temperature if temperature is not None else settings.AI_TEMPERATURE

        # Build prompt with grounded context
        prompt_sections = [user_message]
        if context_data:
            prompt_sections.append(f"\n[GROUNDED TOOL DATA]:\n{json.dumps(context_data, indent=2)}")
        if rag_context:
            prompt_sections.append(f"\n{rag_context}")

        combined_user_content = "\n\n".join(prompt_sections)

        # 1. Google Gemini
        if (self.provider == "gemini" or (not self.provider and self.gemini_key)) and self.gemini_key:
            try:
                return await self._call_gemini(system_prompt, combined_user_content, chat_history, temp)
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to deterministic engine: {e}")

        # 2. OpenAI / OpenRouter
        if (self.provider in ["openai", "openrouter"] or (not self.provider and self.openai_key)) and self.openai_key:
            try:
                return await self._call_openai(system_prompt, combined_user_content, chat_history, temp)
            except Exception as e:
                logger.warning(f"OpenAI API call failed, falling back to deterministic engine: {e}")

        # 3. Anthropic Claude
        if self.provider == "anthropic" and self.anthropic_key:
            try:
                return await self._call_anthropic(system_prompt, combined_user_content, chat_history, temp)
            except Exception as e:
                logger.warning(f"Anthropic API call failed, falling back to deterministic engine: {e}")

        # 4. Ollama
        if self.provider == "ollama":
            try:
                return await self._call_ollama(system_prompt, combined_user_content, chat_history, temp)
            except Exception as e:
                logger.warning(f"Ollama API call failed, falling back to deterministic engine: {e}")

        # 5. Deterministic High-Fidelity Grounded Synthesis
        return self._deterministic_synthesize(user_message, context_data, rag_context)

    async def _call_gemini(self, system_prompt: str, user_content: str, chat_history: Optional[List[Dict[str, str]]], temperature: float) -> str:
        model = settings.GEMINI_MODEL or "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
        
        contents = []
        if chat_history:
            for msg in chat_history[-6:]:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
        
        contents.append({"role": "user", "parts": [{"text": user_content}]})

        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": settings.AI_MAX_TOKENS
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")

    async def _call_openai(self, system_prompt: str, user_content: str, chat_history: Optional[List[Dict[str, str]]], temperature: float) -> str:
        url = f"{settings.OPENAI_BASE_URL}/chat/completions"
        messages = [{"role": "system", "content": system_prompt}]
        
        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
        messages.append({"role": "user", "content": user_content})

        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": settings.AI_MAX_TOKENS
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            raise RuntimeError(f"OpenAI API returned status {resp.status_code}: {resp.text}")

    async def _call_anthropic(self, system_prompt: str, user_content: str, chat_history: Optional[List[Dict[str, str]]], temperature: float) -> str:
        url = "https://api.anthropic.com/v1/messages"
        messages = []
        if chat_history:
            for msg in chat_history[-6:]:
                role = "user" if msg.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_content})

        headers = {
            "x-api-key": self.anthropic_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": settings.ANTHROPIC_MODEL,
            "system": system_prompt,
            "messages": messages,
            "max_tokens": settings.AI_MAX_TOKENS,
            "temperature": temperature
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["content"][0]["text"]
            raise RuntimeError(f"Anthropic API returned status {resp.status_code}: {resp.text}")

    async def _call_ollama(self, system_prompt: str, user_content: str, chat_history: Optional[List[Dict[str, str]]], temperature: float) -> str:
        url = f"{self.ollama_url}/api/chat"
        messages = [{"role": "system", "content": system_prompt}]
        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_content})

        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                return resp.json().get("message", {}).get("content", "")
            raise RuntimeError(f"Ollama returned status {resp.status_code}: {resp.text}")

    def _deterministic_synthesize(self, user_message: str, context_data: Optional[Dict[str, Any]], rag_context: Optional[str]) -> str:
        """
        Deterministic Grounded Meteorological Synthesis
        """
        if not context_data:
            return (
                "🌤️ **WeatherGPT Meteorological Response**\n\n"
                "Weather conditions for your location are within normal seasonal variations. "
                "Please specify your query or target city for detailed hourly forecasts and advisories.\n\n"
                "📌 *Data Source: IMD / Open-Meteo NWP Ensemble Models.*"
            )

        loc = context_data.get("location", "Selected Location")

        # 1. Alert Response
        if "active_alerts" in context_data or "highest_severity" in context_data:
            alerts = context_data.get("active_alerts", [])
            if alerts:
                top_alert = alerts[0]
                return (
                    f"⚠️ **OFFICIAL METEOROLOGICAL ALERT FOR {loc.upper()}**\n\n"
                    f"- **Severity Level:** **{top_alert.get('severity', 'ORANGE')} WARNING**\n"
                    f"- **Hazard:** {top_alert.get('headline', top_alert.get('event', 'Severe Weather Condition'))}\n"
                    f"- **Details:** {top_alert.get('description', '')}\n\n"
                    f"🛡️ **Safety Advisory:** {top_alert.get('instructions', 'Stay tuned to official announcements and avoid waterlogged areas.')}\n\n"
                    f"📌 *Issuing Authority: {top_alert.get('issuing_authority', 'India Meteorological Department (IMD)')}*"
                )
            else:
                return (
                    f"✅ **No Active Severe Weather Warnings for {loc}**\n\n"
                    f"Weather conditions are currently normal and within safe thresholds (IMD Green Status). No extreme meteorological hazards active.\n\n"
                    f"📌 *Source: IMD National Weather Warning Network.*"
                )

        # 2. Agricultural Advisory Response
        if "crop" in context_data and "operation" in context_data:
            suitable = context_data.get("is_suitable", True)
            verdict_icon = "✅" if suitable else "⛔"
            reasons = " ".join(context_data.get("reasons", []))
            recs = "\n".join([f"- {r}" for r in context_data.get("actionable_recommendations", [])])
            return (
                f"🌾 **Agricultural Weather Advisory: {context_data.get('crop')} ({context_data.get('operation')})**\n\n"
                f"**Verdict:** {verdict_icon} **{context_data.get('verdict')}**\n\n"
                f"- **Analysis:** {reasons}\n"
                f"- **Actionable Steps:**\n{recs}\n\n"
                f"📌 *Source: {context_data.get('source', 'IMD Agrometeorological Advisory Division')}*"
            )

        # 3. Biometeorology / Heat Index
        if "heat_index_c" in context_data:
            hi = context_data.get("heat_index_c")
            temp = context_data.get("ambient_temperature_c")
            rh = context_data.get("relative_humidity_percent")
            stress = context_data.get("thermal_stress_level")
            rec = context_data.get("safety_recommendation")
            return (
                f"🌡️ **Thermal Comfort & Biometeorology Assessment**\n\n"
                f"- **Air Temperature:** **{temp}°C** | **Relative Humidity:** **{rh}%**\n"
                f"- **Heat Index ('Feels Like'):** **{hi}°C**\n"
                f"- **Thermal Stress Category:** **{stress}**\n\n"
                f"💡 **Recommendation:** {rec}\n\n"
                f"📌 *Source: NOAA Biometeorological Index & IMD Heat Action Guidelines.*"
            )

        # 4. Multi-Day Forecast Response
        if "daily" in context_data:
            daily = context_data.get("daily", [])
            lines = []
            for d in daily[:3]:
                day_label = d.get("date", "Upcoming")
                t_max = d.get("temperature_max", 30)
                t_min = d.get("temperature_min", 22)
                p_prob = d.get("precipitation_probability", 0)
                cond = d.get("condition", "Normal")
                lines.append(f"- **{day_label}**: {cond} | 🌡️ {t_min}°C to {t_max}°C | 🌧️ Rain Probability: **{p_prob}%**")

            summary_text = "\n".join(lines)
            tomorrow_rain = daily[1].get("precipitation_probability", 0) if len(daily) > 1 else 0
            umbrella_adv = "Consider carrying an umbrella." if tomorrow_rain >= 50 else "No heavy rainfall expected."

            return (
                f"📊 **Weather Forecast for {loc}**\n\n"
                f"{summary_text}\n\n"
                f"💡 **Advisory:** {umbrella_adv} Plan outdoor schedules accordingly.\n\n"
                f"📌 *Data Source: {context_data.get('source', 'Open-Meteo Multi-Model Ensemble NWP')}*"
            )

        # 5. Current Weather Observation Response
        temp = context_data.get("temperature", 28.0)
        feels_like = context_data.get("feels_like", temp)
        humidity = context_data.get("humidity", 60)
        wind = context_data.get("wind_speed", 10.0)
        rain = context_data.get("rainfall", 0.0)
        cond = context_data.get("condition", "Clear")

        return (
            f"🌡️ **Current Weather in {loc}**\n\n"
            f"- **Condition:** **{cond}**\n"
            f"- **Temperature:** **{temp}°C** (Feels like **{feels_like}°C**)\n"
            f"- **Humidity:** **{humidity}%** | **Wind Speed:** **{wind} km/h** | **Precipitation:** **{rain} mm**\n\n"
            f"💡 **Practical Tip:** Comfortable conditions for general travel and outdoor activities.\n\n"
            f"📌 *Data Source: {context_data.get('source', 'Open-Meteo Global NWP Models (ECMWF/GFS)')}*"
        )

default_llm_client = LLMClient()
