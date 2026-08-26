"""
WeatherGPT GeoJSON Map Layer & FeatureCollection Builder
========================================================
Transforms raw alert models, telemetry snapshots, and regional hazard zones
into standard RFC 7946 GeoJSON FeatureCollections with dynamic styling.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone


def build_alert_geojson_feature(
    alert_id: str,
    title: str,
    event_type: str,
    severity: str,
    color_hex: str,
    description: str,
    advisories: List[str],
    geometry: Dict[str, Any],
    issued_at: Optional[str] = None,
    expires_at: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates a styled single GeoJSON Feature for map rendering.
    """
    return {
        "type": "Feature",
        "id": alert_id,
        "properties": {
            "alert_id": alert_id,
            "title": title,
            "event_type": event_type,
            "severity": severity,
            "fill": color_hex,
            "fill-opacity": 0.35 if severity.lower() in ["extreme", "severe", "red", "orange"] else 0.2,
            "stroke": color_hex,
            "stroke-width": 2.5,
            "stroke-opacity": 0.85,
            "description": description,
            "advisories": advisories,
            "issued_at": issued_at or datetime.now(timezone.utc).isoformat(),
            "expires_at": expires_at or ""
        },
        "geometry": geometry
    }


def build_feature_collection(
    features: List[Dict[str, Any]],
    layer_name: str = "WeatherGPT_Active_Hazards",
    description: str = "Live meteorological warning layers"
) -> Dict[str, Any]:
    """
    Wraps features in a standard GeoJSON FeatureCollection.
    """
    return {
        "type": "FeatureCollection",
        "name": layer_name,
        "description": description,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_features": len(features),
        "features": features
    }
