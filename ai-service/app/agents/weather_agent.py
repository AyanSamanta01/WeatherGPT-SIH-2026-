import time
import logging
from typing import Dict, Any, Optional, List
from ..models.schemas import (
    AgentQueryRequest,
    AgentQueryResponse,
    AgentQueryResponseData,
    WeatherCard
)
from ..models.enums import IntentCategory, RiskLevel, LanguageCode
from ..services.guardrails import default_guardrail_service
from ..services.context_manager import default_context_manager
from ..services.grounding_service import default_grounding_service
from ..services.multilingual_service import default_multilingual_service
from ..services.llm_client import default_llm_client
from ..prompts.system_prompts import get_system_prompt_for_persona
from ..prompts.multilingual_prompts import get_language_guidelines
from ..rag.knowledge_retriever import default_retriever
from .intent_classifier import default_intent_classifier
from .tool_executor import default_tool_executor
from ..config import settings

logger = logging.getLogger("WeatherGPT.WeatherAgent")

class WeatherAgent:
    """
    Intelligent Multi-Step ReAct Meteorological Agent & Autonomous Decision Engine for SIH 2026
    """
    def _generate_suggested_actions(
        self,
        intent: IntentCategory,
        location_name: str,
        tool_data: Optional[Dict[str, Any]],
        language: str
    ) -> List[str]:
        """
        Generate contextual interactive quick-action chips
        """
        loc_short = location_name.split(",")[0].strip() if location_name else "Your Location"
        if loc_short in ["N/A", "Selected Location", "India / Real-Time Gateway"]:
            loc_short = "Local City"

        if intent in [IntentCategory.GREETING_OR_CHITCHAT, IntentCategory.CAPABILITIES_QUERY]:
            return [
                "🌤️ Weather in Mumbai today",
                "🌾 Can I spray wheat in Punjab tomorrow?",
                "🛰️ Compare GFS vs ECMWF consensus for Delhi"
            ]
        elif intent == IntentCategory.AGRI_ADVISORY:
            return [
                f"📊 5-Day Rainfall Outlook in {loc_short}",
                f"💧 Best irrigation timing for {loc_short}",
                f"⚠️ Active weather alerts for {loc_short}"
            ]
        elif intent in [IntentCategory.NWP_CONSENSUS, IntentCategory.ML_FORECAST]:
            return [
                f"⚡ 6-Hour XGBoost Forecast for {loc_short}",
                f"🌧️ Rain probability timeline in {loc_short}",
                f"🌡️ Heat Index & 'Feels Like' in {loc_short}"
            ]
        elif intent in [IntentCategory.FORECAST_SHORT_TERM, IntentCategory.FORECAST_EXTENDED]:
            return [
                f"🌧️ Umbrella necessity tomorrow in {loc_short}",
                f"🌾 Agro spraying suitability in {loc_short}",
                f"🛰️ Model agreement (ECMWF vs GFS) for {loc_short}"
            ]
        elif intent == IntentCategory.ALERT_CHECK:
            return [
                "🚨 NDMA Disaster Safety Guidelines",
                f"🌧️ 24-Hour Rainfall Intensity in {loc_short}",
                "📞 Emergency helpline & relief status"
            ]
        elif intent == IntentCategory.OUTDOOR_ACTIVITY:
            return [
                f"🏃 Best time for outdoor run in {loc_short}",
                f"🏏 Safe for cricket match in {loc_short}",
                f"📊 3-day temperature forecast in {loc_short}"
            ]
        else:
            return [
                f"🌧️ Will it rain tomorrow in {loc_short}?",
                f"🌡️ Heat Index & humidity in {loc_short}",
                f"🌾 Agricultural advisory for {loc_short}"
            ]

    async def process_query(self, request: AgentQueryRequest) -> AgentQueryResponse:
        start_time = time.time()
        user_message = (request.message or request.prompt or "").strip()
        cid = request.conversationId or request.conversation_id or f"conv_{int(time.time() * 1000)}"
        target_lang = (request.language or "en").lower()

        # Step 1: Pre-flight Safety Guardrail
        safety_check = default_guardrail_service.check_input_safety(user_message)
        if not safety_check.passed:
            blocked_msg = "⚠️ Your request could not be processed due to safety and security guardrail policies."
            return AgentQueryResponse(
                status="rejected",
                answer=blocked_msg,
                location="N/A",
                sources=["SecurityGuardrail"],
                risk="low",
                conversationId=cid,
                suggested_actions=["Check normal weather", "Ask about agriculture", "Help options"],
                suggestedActions=["Check normal weather", "Ask about agriculture", "Help options"],
                data=AgentQueryResponseData(
                    answer=blocked_msg,
                    location="N/A",
                    sources=["SecurityGuardrail"],
                    risk=RiskLevel.LOW,
                    intent=IntentCategory.OUT_OF_DOMAIN.value,
                    language=target_lang,
                    conversation_id=cid,
                    guardrail_status="rejected",
                    suggested_actions=["Check normal weather", "Ask about agriculture", "Help options"],
                    processing_time_ms=round((time.time() - start_time) * 1000, 2)
                )
            )

        # Step 2: Session & Context Management
        session = default_context_manager.get_or_create_session(cid)
        resolved_context = default_context_manager.resolve_contextual_query(
            current_query=user_message,
            session=session,
            explicit_location=None,
            explicit_lat=request.latitude,
            explicit_lon=request.longitude
        )

        lat = resolved_context["resolved_lat"]
        lon = resolved_context["resolved_lon"]
        loc_hint = resolved_context["resolved_location"]

        # Step 3: Intent Classification & NLU
        intent_res = default_intent_classifier.classify_intent(
            message=user_message,
            explicit_lat=lat,
            explicit_lon=lon
        )
        
        final_lat = intent_res.latitude or lat or 22.5726
        final_lon = intent_res.longitude or lon or 88.3639
        location_name = intent_res.location_name or loc_hint or "Selected Location"

        # Adapt language: if user explicitly provided a non-English language use it; otherwise use detected language from text
        detected_lang = intent_res.language_detected.value
        target_lang = (request.language or "").lower()
        if not target_lang or target_lang == "en":
            target_lang = detected_lang

        # Step 4: RAG Domain Knowledge Retrieval
        rag_chunks = default_retriever.search(user_message, top_k=2)
        rag_prompt_chunk = default_retriever.format_for_prompt(rag_chunks)
        rag_sources = [r.source for r in rag_chunks]

        # Step 5: Multi-Step ReAct Tool Execution Loop
        tools_used = []
        tool_data: Optional[Dict[str, Any]] = None

        if intent_res.intent in [IntentCategory.GREETING_OR_CHITCHAT, IntentCategory.CAPABILITIES_QUERY]:
            tool_data = {
                "is_greeting": (intent_res.intent == IntentCategory.GREETING_OR_CHITCHAT),
                "is_capabilities": (intent_res.intent == IntentCategory.CAPABILITIES_QUERY),
                "location": "India / Real-Time Gateway"
            }
            location_name = "India / Real-Time Gateway"

        elif intent_res.requires_tool_call and intent_res.suggested_tools:
            primary_tool = intent_res.suggested_tools[0]
            
            # Sub-case A: Dynamic Multi-Step Agricultural Advisory
            if primary_tool == "get_agricultural_advisory":
                tools_used.append("get_weather_forecast")
                tools_used.append("get_agricultural_advisory")

                # Step A1: Fetch live weather / forecast telemetry first
                fc_res = await default_tool_executor.execute_tool("get_weather_forecast", {
                    "location_name": location_name,
                    "latitude": final_lat,
                    "longitude": final_lon,
                    "days": 3
                })

                live_temp = 28.0
                live_wind = 8.0
                live_rain_prob = 10.0
                live_humidity = 65.0
                
                if fc_res.status == "success" and fc_res.data:
                    fc_data = fc_res.data
                    if "location" in fc_data and fc_data["location"]:
                        location_name = fc_data["location"]
                    daily = fc_data.get("daily", [])
                    target_day = daily[1] if (len(daily) > 1 and intent_res.temporal_scope == "tomorrow") else (daily[0] if daily else {})
                    live_temp = target_day.get("temperature_max", 28.0)
                    live_wind = target_day.get("wind_speed_max", 8.0)
                    live_rain_prob = target_day.get("precipitation_probability", 10.0)

                # Step A2: Extract crop & operation from entities
                crop = intent_res.entities.get("crop", "Wheat")
                operation = intent_res.entities.get("operation", "Spraying")

                # Step A3: Execute agricultural advisory with REAL live data
                agri_res = await default_tool_executor.execute_tool("get_agricultural_advisory", {
                    "crop_name": crop,
                    "operation": operation,
                    "temperature_c": live_temp,
                    "rainfall_prob": live_rain_prob,
                    "wind_speed_kmh": live_wind
                })

                if agri_res.status == "success":
                    tool_data = agri_res.data
                    tool_data["location"] = location_name
                    tool_data["live_temperature_c"] = live_temp
                    tool_data["live_wind_speed_kmh"] = live_wind
                    tool_data["live_rain_probability"] = live_rain_prob

            # Sub-case B: Dynamic Multi-Step Biometeorology / Outdoor
            elif primary_tool == "calculate_biometeorology":
                tools_used.append("get_current_weather")
                tools_used.append("calculate_biometeorology")

                cw_res = await default_tool_executor.execute_tool("get_current_weather", {
                    "location_name": location_name,
                    "latitude": final_lat,
                    "longitude": final_lon
                })
                live_temp = 30.0
                live_rh = 60.0
                live_wind = 10.0
                if cw_res.status == "success" and cw_res.data:
                    cw_data = cw_res.data
                    if "location" in cw_data and cw_data["location"]:
                        location_name = cw_data["location"]
                    live_temp = cw_data.get("temperature", 30.0)
                    live_rh = cw_data.get("humidity", 60.0)
                    live_wind = cw_data.get("wind_speed", 10.0)

                bio_res = await default_tool_executor.execute_tool("calculate_biometeorology", {
                    "temperature_c": live_temp,
                    "humidity_percent": live_rh,
                    "wind_speed_kmh": live_wind
                })
                if bio_res.status == "success":
                    tool_data = bio_res.data
                    tool_data["location"] = location_name

            # Sub-case C: Single Direct Tools
            else:
                tools_used.append(primary_tool)
                tool_args: Dict[str, Any] = {
                    "location_name": location_name,
                    "latitude": final_lat,
                    "longitude": final_lon
                }
                if primary_tool == "get_weather_forecast":
                    tool_args["days"] = 5 if intent_res.intent == IntentCategory.FORECAST_EXTENDED else 3
                elif primary_tool == "search_meteorological_knowledge":
                    tool_args["query"] = user_message

                exec_res = await default_tool_executor.execute_tool(primary_tool, tool_args)
                if exec_res.status == "success":
                    tool_data = exec_res.data
                    if "location" in tool_data and tool_data["location"]:
                        location_name = tool_data["location"]

        # Step 6: System Prompt & Multilingual Directives
        persona = request.sector.value if request.sector else intent_res.target_sector.value
        sys_prompt = get_system_prompt_for_persona(persona)
        lang_prompt = get_language_guidelines(target_lang)
        combined_system_prompt = (
            f"{sys_prompt}\n\n{lang_prompt}\n\n"
            "INTERACTION STYLE INSTRUCTIONS:\n"
            "- Speak naturally, politely, and authoritatively.\n"
            "- If the user greeted or asked who you are, introduce yourself warmly and outline capabilities without fabricating weather data.\n"
            "- Always cite official data sources (IMD, Open-Meteo, ECMWF, GFS, ICAR).\n"
            "- Structure responses with clean Markdown bullet points and icons."
        )

        # Step 7: LLM Response Generation
        is_llm_active = bool(settings.AI_PROVIDER != "fallback" and (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY or settings.AI_PROVIDER == "ollama"))
        
        raw_answer = await default_llm_client.generate_response(
            system_prompt=combined_system_prompt,
            user_message=user_message,
            chat_history=resolved_context.get("history_messages"),
            context_data=tool_data,
            rag_context=rag_prompt_chunk
        )

        # Step 8: Multilingual Localization (Preserves LLM outputs)
        final_answer = default_multilingual_service.localize_weather_response(
            english_text=raw_answer,
            target_language=target_lang,
            tool_data=tool_data,
            is_llm_generated=is_llm_active
        )

        # Step 9: Post-Generation Guardrail & Hallucination Check
        has_official_alert = bool(tool_data and tool_data.get("active_alerts"))
        guardrail_eval = default_guardrail_service.verify_factual_consistency(
            generated_answer=final_answer,
            tool_data=tool_data,
            official_alerts_found=has_official_alert
        )

        # Step 10: Grounding, Risk & WeatherCard Assembly
        sources = default_grounding_service.extract_sources(tool_data, rag_sources)
        risk = default_grounding_service.compute_risk(tool_data or {})
        weather_card = default_grounding_service.assemble_weather_card(location_name, tool_data)

        # Generate smart follow-up suggestions
        suggested_actions = self._generate_suggested_actions(
            intent=intent_res.intent,
            location_name=location_name,
            tool_data=tool_data,
            language=target_lang
        )

        # Step 11: Update Session Context Memory
        if intent_res.intent not in [IntentCategory.GREETING_OR_CHITCHAT, IntentCategory.CAPABILITIES_QUERY]:
            default_context_manager.update_session(
                session=session,
                user_message=user_message,
                assistant_response=final_answer,
                location=location_name,
                coordinates=(final_lat, final_lon),
                intent=intent_res.intent.value,
                tool_data=tool_data
            )
        else:
            session.add_message("user", user_message, intent_res.intent.value)
            session.add_message("assistant", final_answer, intent_res.intent.value)

        proc_time = round((time.time() - start_time) * 1000, 2)

        data_obj = AgentQueryResponseData(
            answer=final_answer,
            location=location_name,
            sources=sources,
            risk=risk,
            intent=intent_res.intent.value,
            language=target_lang,
            conversation_id=cid,
            weatherCard=weather_card,
            tools_used=tools_used,
            rag_sources=rag_sources,
            suggested_actions=suggested_actions,
            conversation_mode="greeting" if intent_res.intent == IntentCategory.GREETING_OR_CHITCHAT else "direct_answer",
            confidence=guardrail_eval.confidence_score,
            guardrail_status="passed" if guardrail_eval.passed else "flagged",
            processing_time_ms=proc_time
        )

        return AgentQueryResponse(
            status="success",
            data=data_obj,
            answer=final_answer,
            location=location_name,
            sources=sources,
            risk=risk.value,
            conversationId=cid,
            suggested_actions=suggested_actions,
            suggestedActions=suggested_actions
        )

default_weather_agent = WeatherAgent()
