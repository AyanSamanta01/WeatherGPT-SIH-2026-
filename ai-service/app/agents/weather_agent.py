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

logger = logging.getLogger("WeatherGPT.WeatherAgent")

class WeatherAgent:
    """
    Main ReAct Meteorological Agent & Autonomous Decision Engine for SIH 2026
    """
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
                data=AgentQueryResponseData(
                    answer=blocked_msg,
                    location="N/A",
                    sources=["SecurityGuardrail"],
                    risk=RiskLevel.LOW,
                    intent=IntentCategory.OUT_OF_DOMAIN.value,
                    language=target_lang,
                    conversation_id=cid,
                    guardrail_status="rejected",
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

        # Step 4: RAG Domain Knowledge Retrieval
        rag_chunks = default_retriever.search(user_message, top_k=2)
        rag_prompt_chunk = default_retriever.format_for_prompt(rag_chunks)
        rag_sources = [r.source for r in rag_chunks]

        # Step 5: Tool Execution (ReAct loop)
        tools_used = []
        tool_data: Optional[Dict[str, Any]] = None

        if intent_res.requires_tool_call and intent_res.suggested_tools:
            primary_tool = intent_res.suggested_tools[0]
            tools_used.append(primary_tool)

            tool_args: Dict[str, Any] = {
                "location_name": location_name,
                "latitude": final_lat,
                "longitude": final_lon
            }

            if primary_tool == "get_weather_forecast":
                tool_args["days"] = 5 if intent_res.intent == IntentCategory.FORECAST_EXTENDED else 3
            elif primary_tool == "get_agricultural_advisory":
                # Extract crop and operation from text
                crop = "Mustard" if "mustard" in user_message.lower() or "सरसों" in user_message else "Wheat"
                op = "Spraying" if "spray" in user_message.lower() or "छिड़काव" in user_message else "Irrigation"
                tool_args["crop_name"] = crop
                tool_args["operation"] = op
                tool_args["wind_speed_kmh"] = 18.0
                tool_args["rainfall_prob"] = 15.0
            elif primary_tool == "calculate_biometeorology":
                tool_args["temperature_c"] = 34.0
                tool_args["humidity_percent"] = 75.0
                tool_args["wind_speed_kmh"] = 12.0
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
        combined_system_prompt = f"{sys_prompt}\n\n{lang_prompt}"

        # Step 7: LLM Response Generation
        raw_answer = await default_llm_client.generate_response(
            system_prompt=combined_system_prompt,
            user_message=user_message,
            chat_history=resolved_context.get("history_messages"),
            context_data=tool_data,
            rag_context=rag_prompt_chunk
        )

        # Step 8: Multilingual Localization
        final_answer = default_multilingual_service.localize_weather_response(
            english_text=raw_answer,
            target_language=target_lang,
            tool_data=tool_data
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

        # Step 11: Update Session Context Memory
        default_context_manager.update_session(
            session=session,
            user_message=user_message,
            assistant_response=final_answer,
            location=location_name,
            coordinates=(final_lat, final_lon),
            intent=intent_res.intent.value,
            tool_data=tool_data
        )

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
            conversationId=cid
        )

default_weather_agent = WeatherAgent()
