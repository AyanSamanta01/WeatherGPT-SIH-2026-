"""
WeatherGPT Multi-Channel Emergency Notification Dispatcher
==========================================================
Simulates targeted emergency notification broadcasts (Web Push, SMS, WhatsApp/Telegram, Email)
with spatial geofence matching, severity escalation rules, and rate-limiting.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from .spatial_geofencing import is_point_in_geojson_geometry


class NotificationDispatcher:
    """
    Manages subscriber channel routing and emergency dispatch logs.
    """

    def __init__(self):
        # In-memory subscriber registry simulation
        self.subscribers: List[Dict[str, Any]] = [
            {
                "user_id": "usr_mumbai_01",
                "name": "Aarav Sharma",
                "phone": "+919820012345",
                "email": "aarav.mumbai@example.com",
                "channels": ["sms", "push", "email"],
                "min_severity": "WATCH",
                "location": {"lat": 19.0760, "lon": 72.8777, "city": "Mumbai"}
            },
            {
                "user_id": "usr_kolkata_01",
                "name": "Priyanka Roy",
                "phone": "+919830067890",
                "email": "priyanka.kolkata@example.com",
                "channels": ["sms", "push"],
                "min_severity": "WARNING",
                "location": {"lat": 22.5726, "lon": 88.3639, "city": "Kolkata"}
            },
            {
                "user_id": "usr_delhi_01",
                "name": "Rajesh Kumar",
                "phone": "+919811122233",
                "email": "rajesh.delhi@example.com",
                "channels": ["push", "email"],
                "min_severity": "EMERGENCY",
                "location": {"lat": 28.6139, "lon": 77.2090, "city": "Delhi"}
            },
            {
                "user_id": "usr_chennai_01",
                "name": "Karthik Raja",
                "phone": "+919840055566",
                "email": "karthik.chennai@example.com",
                "channels": ["sms", "push"],
                "min_severity": "WATCH",
                "location": {"lat": 13.0827, "lon": 80.2707, "city": "Chennai"}
            }
        ]
        self.dispatch_log: List[Dict[str, Any]] = []

    def dispatch_alert(
        self,
        alert_id: str,
        headline: str,
        severity: str,
        advisories: List[str],
        geometry: Optional[Dict[str, Any]] = None,
        channels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Filters subscribers based on spatial containment within hazard geometry and dispatches notifications.
        """
        targeted_subscribers = []
        severity_rank = {"INFO": 0, "WATCH": 1, "WARNING": 2, "EMERGENCY": 3}
        alert_sev_rank = severity_rank.get(severity.upper(), 1)

        for sub in self.subscribers:
            # 1. Severity threshold check
            sub_min_rank = severity_rank.get(sub.get("min_severity", "WATCH").upper(), 1)
            if alert_sev_rank < sub_min_rank:
                continue

            # 2. Spatial boundary check (if polygon provided)
            sub_lat = sub["location"]["lat"]
            sub_lon = sub["location"]["lon"]
            
            if geometry:
                is_inside = is_point_in_geojson_geometry(sub_lat, sub_lon, geometry)
                if not is_inside:
                    continue

            # 3. Channel matching
            active_channels = [c for c in sub["channels"] if (not channels or c in channels)]
            if active_channels:
                targeted_subscribers.append({
                    "user_id": sub["user_id"],
                    "name": sub["name"],
                    "phone": sub["phone"],
                    "channels_dispatched": active_channels,
                    "city": sub["location"]["city"]
                })

        dispatch_record = {
            "dispatch_id": f"DSP-{uuid.uuid4().hex[:8].upper()}",
            "alert_id": alert_id,
            "headline": headline,
            "severity": severity,
            "dispatched_at": datetime.now(timezone.utc).isoformat(),
            "recipients_count": len(targeted_subscribers),
            "recipients": targeted_subscribers,
            "status": "DELIVERED" if len(targeted_subscribers) > 0 else "NO_MATCHING_RECIPIENTS"
        }

        self.dispatch_log.append(dispatch_record)
        return dispatch_record

    def get_dispatch_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns recent dispatch history."""
        return self.dispatch_log[-limit:]
