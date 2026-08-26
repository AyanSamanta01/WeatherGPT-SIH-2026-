import pytest
from app.services.context_manager import default_context_manager

def test_multi_turn_context_resolution():
    cid = "test_conv_123"
    session = default_context_manager.get_or_create_session(cid)

    # Turn 1: User asks about weather in Jaipur
    default_context_manager.update_session(
        session=session,
        user_message="What is the weather in Jaipur?",
        assistant_response="Jaipur is currently 32°C and sunny.",
        location="Jaipur, Rajasthan",
        coordinates=(26.9124, 75.7873),
        intent="current_weather"
    )

    # Turn 2: User asks follow-up: "What about tomorrow?" without specifying location
    resolved = default_context_manager.resolve_contextual_query(
        current_query="What about tomorrow?",
        session=session
    )

    assert resolved["resolved_location"] == "Jaipur, Rajasthan"
    assert resolved["resolved_lat"] == 26.9124
    assert resolved["resolved_lon"] == 75.7873
    assert resolved["is_follow_up"] is True
    assert len(resolved["history_messages"]) == 2
