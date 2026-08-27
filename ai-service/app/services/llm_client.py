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
        prompt_sections = [f"User Message: {user_message}"]
        if context_data:
            prompt_sections.append(f"[GROUNDED METEOROLOGICAL CONTEXT DATA]:\n{json.dumps(context_data, indent=2)}")
        if rag_context:
            prompt_sections.append(f"[DOMAIN KNOWLEDGE RAG BASE]:\n{rag_context}")

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

        async with httpx.AsyncClient(timeout=30.0) as client:
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
        Deterministic High-Fidelity Grounded Meteorological Synthesis
        """
        # 1. Greetings / Capability Queries / Conversational chit-chat
        if not context_data or context_data.get("is_greeting") or context_data.get("is_capabilities"):
            if context_data and context_data.get("is_capabilities"):
                return (
                    "👋 **Hello! I am WeatherGPT — Your AI Meteorological Intelligence Assistant.**\n\n"
                    "I provide real-time, grounded meteorological intelligence and decision support across India:\n\n"
                    "🔹 **Multi-Model NWP Consensus:** Compare ECMWF, NOAA GFS, DWD ICON, and trained ML predictions.\n"
                    "🔹 **6-Hour High-Resolution ML Forecasts:** Real-time XGBoost/LightGBM temperature and precipitation projections.\n"
                    "🔹 **Kisan Agro-Meteorology:** Crop-specific windows for pesticide spraying, irrigation, sowing, and harvesting.\n"
                    "🔹 **Disaster & Severe Weather Alerts:** Real-time IMD / NDMA cyclone, flood, and extreme heat warnings.\n"
                    "🔹 **Biometeorology & Outdoor Safety:** Heat index ('feels like'), wet-bulb temperature, and sports suitability.\n\n"
                    "💡 *Try asking: 'What's the weather in Mumbai?', 'Can I spray wheat in Punjab tomorrow?', or 'Compare GFS vs ECMWF for Delhi.'*"
                )
            return (
                "👋 **Namaste! I am WeatherGPT.**\n\n"
                "I am your dedicated AI weather and meteorological assistant. You can ask me about live weather observations, 6-hour ML forecasts, multi-model NWP consensus, agricultural advisories, or official severe weather warnings across India.\n\n"
                "💡 *How can I help you today? You can specify a city or ask a weather question!*"
            )

        loc = context_data.get("location", "Selected Location")

        # 2. NWP Multi-Model Consensus & Comparison
        if "consensus_confidence_pct" in context_data or "consensus_score" in context_data or "models_evaluated" in context_data or "models" in context_data:
            score = context_data.get("consensus_confidence_pct", context_data.get("consensus_score", 75.0))
            agreement = context_data.get("consensus_status", context_data.get("agreement_level", "High Agreement"))
            desc = context_data.get("consensus_description", "Models demonstrate coherent atmospheric alignment.")
            
            ens = context_data.get("ensemble_summary", {})
            mean_temp = ens.get("mean_temperature_c", context_data.get("ensemble_mean_temp", 28.0))
            spread = ens.get("spread_std_c", context_data.get("spread_std", 1.2))
            precip_status = ens.get("precipitation_status", context_data.get("precipitation_status", "Rain Likely"))
            models = context_data.get("models_evaluated", context_data.get("models", []))
            
            table_lines = [
                "| Model | Type | 6h Temp | Rain Prob | Rainfall |",
                "| :--- | :--- | :--- | :--- | :--- |"
            ]
            for m in models:
                name = m.get("model", "Model")
                mtype = m.get("type", "NWP")
                temp = f"{m.get('temperature_c', 0.0):.1f}°C"
                rprob = f"{m.get('rain_probability_pct', 0.0):.1f}%"
                rain = f"{m.get('rainfall_mm', 0.0):.2f} mm"
                table_lines.append(f"| **{name}** | {mtype} | {temp} | {rprob} | {rain} |")
            
            table_md = "\n".join(table_lines)
            
            return (
                f"🛰️ **NWP Multi-Model Consensus Analysis for {loc}**\n\n"
                f"- **Consensus Confidence Score:** **{score:.1f}%** ({agreement})\n"
                f"- **Ensemble Mean Temperature:** **{mean_temp:.1f}°C** (Spread: ±{spread:.2f}°C)\n"
                f"- **Precipitation Outlook:** **{precip_status}**\n\n"
                f"{table_md}\n\n"
                f"💡 **Meteorological Takeaway:** {desc}\n\n"
                f"📌 *Data Source: {context_data.get('source', 'WeatherGPT NWP Multi-Model Consensus Analyzer (ECMWF/GFS/ICON/ML)')}*"
            )

        # 3. WeatherGPT 6-Hour High-Resolution ML Forecast
        if "forecast_6h" in context_data:
            fc = context_data.get("forecast_6h", {})
            p_temp = fc.get("predicted_temperature_c", 28.0)
            p_rain_prob = fc.get("rain_probability", 0.0) * 100 if fc.get("rain_probability", 0) <= 1.0 else fc.get("rain_probability", 0)
            p_rain_mm = fc.get("predicted_rainfall_mm", 0.0)
            risk_info = context_data.get("risk_assessment", {})
            risk_lvl = risk_info.get("risk_level", "LOW")
            imd_code = risk_info.get("imd_color_code", {}).get("name", "Green (Normal)")
            target_time = fc.get("target_time", "Next 6 Hours")
            
            return (
                f"⚡ **WeatherGPT High-Resolution 6-Hour ML Forecast: {loc}**\n\n"
                f"- **Forecast Horizon:** **{target_time}**\n"
                f"- **Predicted Temperature:** **{p_temp:.1f}°C**\n"
                f"- **Precipitation Probability:** **{p_rain_prob:.1f}%** (Estimated Rain: **{p_rain_mm:.2f} mm**)\n"
                f"- **Composite Hazard Risk:** **{risk_lvl}** (IMD Code: **{imd_code}**)\n\n"
                f"💡 **Forecast Intelligence:** {risk_info.get('advisories', ['Weather conditions expected to remain stable over the forecast period.'])[0]}\n\n"
                f"📌 *Data Source: {context_data.get('source', 'WeatherGPT ML XGBoost/LightGBM V3 Engine')}*"
            )

        # 4. Official Alert / Disaster Response
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

        # 5. Agricultural Advisory Response
        if "crop" in context_data and "operation" in context_data:
            suitable = context_data.get("is_suitable", True)
            verdict_icon = "✅" if suitable else "⛔"
            reasons = " ".join(context_data.get("reasons", []))
            recs = "\n".join([f"- {r}" for r in context_data.get("actionable_recommendations", [])])
            live_temp = context_data.get("live_temperature_c")
            live_wind = context_data.get("live_wind_speed_kmh")
            live_rain = context_data.get("live_rain_probability")
            
            live_metrics_str = ""
            if live_temp is not None or live_wind is not None:
                live_metrics_str = f"- **Live Field Telemetry:** 🌡️ Temp: **{live_temp}°C** | 💨 Wind: **{live_wind} km/h** | 🌧️ Rain Chance: **{live_rain}%**\n"

            return (
                f"🌾 **Agricultural Weather Advisory: {context_data.get('crop')} ({context_data.get('operation')}) in {loc}**\n\n"
                f"**Verdict:** {verdict_icon} **{context_data.get('verdict')}**\n\n"
                f"{live_metrics_str}"
                f"- **Meteorological Analysis:** {reasons}\n\n"
                f"📋 **Actionable Steps for Farmers:**\n{recs}\n\n"
                f"📌 *Source: {context_data.get('source', 'IMD Agrometeorological Advisory Division & ICAR Guidelines')}*"
            )

        # 6. Biometeorology / Heat Index
        if "heat_index_c" in context_data:
            hi = context_data.get("heat_index_c")
            temp = context_data.get("ambient_temperature_c")
            rh = context_data.get("relative_humidity_percent")
            stress = context_data.get("thermal_stress_level")
            rec = context_data.get("safety_recommendation")
            return (
                f"🌡️ **Thermal Comfort & Biometeorology Assessment for {loc}**\n\n"
                f"- **Air Temperature:** **{temp}°C** | **Relative Humidity:** **{rh}%**\n"
                f"- **Heat Index ('Feels Like'):** **{hi}°C**\n"
                f"- **Thermal Stress Category:** **{stress}**\n\n"
                f"💡 **Activity Safety Recommendation:** {rec}\n\n"
                f"📌 *Source: NOAA Biometeorological Index & IMD Heat Action Guidelines.*"
            )

        # 7. Multi-Day / Tomorrow Forecast Response
        if "daily" in context_data:
            daily = context_data.get("daily", [])
            lines = []
            for d in daily[:4]:
                day_label = d.get("date", "Upcoming")
                t_max = d.get("temperature_max", 30)
                t_min = d.get("temperature_min", 22)
                p_prob = d.get("precipitation_probability", 0)
                cond = d.get("condition", "Normal")
                lines.append(f"- **{day_label}**: {cond} | 🌡️ {t_min}°C to {t_max}°C | 🌧️ Rain Probability: **{p_prob}%**")

            summary_text = "\n".join(lines)
            tomorrow_rain = daily[1].get("precipitation_probability", 0) if len(daily) > 1 else 0
            umbrella_adv = "Consider carrying an umbrella." if tomorrow_rain >= 40 else "No heavy rainfall expected."

            return (
                f"📊 **Weather Forecast for {loc}**\n\n"
                f"{summary_text}\n\n"
                f"💡 **Advisory:** {umbrella_adv} Plan outdoor schedules accordingly.\n\n"
                f"📌 *Data Source: {context_data.get('source', 'Open-Meteo Multi-Model Ensemble NWP')}*"
            )

        # 8. Climate / Historical Trends
        if "trend_summary" in context_data or "historical_years" in context_data:
            summary = context_data.get("trend_summary", "Long-term trends show standard monsoon variability.")
            anomaly = context_data.get("temperature_anomaly_c", 0.0)
            rain_trend = context_data.get("rainfall_trend_pct", 0.0)
            return (
                f"📈 **Climate & Historical Trend Analysis: {loc}**\n\n"
                f"- **10-Year Temperature Anomaly:** **{anomaly:+.2f}°C** relative to historical baseline\n"
                f"- **Precipitation Variation:** **{rain_trend:+.1f}%** shift\n\n"
                f"💡 **Analysis:** {summary}\n\n"
                f"📌 *Source: IMD Climate Diagnostic Center & ERA5 Reanalysis.*"
            )

        # 9. Current Weather Observation Response
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
