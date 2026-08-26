import time
from typing import Dict, Any, List, Optional
from ..models.schemas import ChatMessage

class ConversationSession:
    def __init__(self, conversation_id: str):
        self.conversation_id = conversation_id
        self.messages: List[ChatMessage] = []
        self.last_location: Optional[str] = None
        self.last_coordinates: Optional[tuple] = None  # (lat, lon)
        self.last_intent: Optional[str] = None
        self.last_tool_data: Optional[Dict[str, Any]] = None
        self.last_active_timestamp: float = time.time()

    def add_message(self, role: str, content: str, intent: Optional[str] = None):
        msg = ChatMessage(
            role=role,
            content=content,
            intent=intent,
            timestamp=str(time.time())
        )
        self.messages.append(msg)
        self.last_active_timestamp = time.time()
        # Keep maximum last 12 messages in active sliding memory
        if len(self.messages) > 12:
            self.messages = self.messages[-12:]

class ConversationContextManager:
    """
    Session context, memory resolution, and multi-turn state persistence
    """
    def __init__(self):
        self.sessions: Dict[str, ConversationSession] = {}

    def get_or_create_session(self, conversation_id: Optional[str]) -> ConversationSession:
        cid = conversation_id or f"conv_{int(time.time() * 1000)}"
        if cid not in self.sessions:
            self.sessions[cid] = ConversationSession(cid)
        return self.sessions[cid]

    def resolve_contextual_query(
        self,
        current_query: str,
        session: ConversationSession,
        explicit_location: Optional[str] = None,
        explicit_lat: Optional[float] = None,
        explicit_lon: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Extract & resolve conversational slots from history
        """
        resolved_location = explicit_location
        resolved_lat = explicit_lat
        resolved_lon = explicit_lon

        # If location not mentioned explicitly, check session memory
        if not resolved_location and not (resolved_lat and resolved_lon):
            if session.last_location:
                resolved_location = session.last_location
            if session.last_coordinates:
                resolved_lat, resolved_lon = session.last_coordinates

        # Check if the query is a pronoun or follow-up like "there", "what about tomorrow?", "will it rain?"
        is_follow_up = False
        lower_q = current_query.lower()
        if any(w in lower_q for w in ["there", "tomorrow", "what about", "and", "how about", "will i need", "umbrella"]):
            is_follow_up = True

        return {
            "resolved_location": resolved_location,
            "resolved_lat": resolved_lat,
            "resolved_lon": resolved_lon,
            "is_follow_up": is_follow_up,
            "previous_intent": session.last_intent,
            "history_messages": [m.model_dump() for m in session.messages]
        }

    def update_session(
        self,
        session: ConversationSession,
        user_message: str,
        assistant_response: str,
        location: Optional[str] = None,
        coordinates: Optional[tuple] = None,
        intent: Optional[str] = None,
        tool_data: Optional[Dict[str, Any]] = None
    ):
        session.add_message("user", user_message, intent)
        session.add_message("assistant", assistant_response, intent)
        if location:
            session.last_location = location
        if coordinates and coordinates[0] is not None and coordinates[1] is not None:
            session.last_coordinates = coordinates
        if intent:
            session.last_intent = intent
        if tool_data:
            session.last_tool_data = tool_data

default_context_manager = ConversationContextManager()
