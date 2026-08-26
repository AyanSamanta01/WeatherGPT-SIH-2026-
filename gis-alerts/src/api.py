"""
WeatherGPT GIS & Alert Microservice (FastAPI on Port 8001 / Embedded)
====================================================================
Production REST API for GIS Spatial Geofencing, IMD 4-Color Hazard Evaluation,
CAP 1.2 Protocol Generation/Parsing, and Multi-Channel Alert Dispatching.
"""

from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .spatial_geofencing import SpatialGeofenceEngine, calculate_haversine_distance_km
from .alert_rules_engine import AlertRulesEngine, IMDColorCode
from .cap_protocol import CAPAlertBuilder
from .geojson_builder import build_alert_geojson_feature, build_feature_collection
from .notification_dispatcher import NotificationDispatcher

app = FastAPI(
    title="WeatherGPT GIS & Alert Microservice",
    description="Spatial Geofencing, IMD 4-Color Hazard Classification, CAP 1.2 Protocol & Emergency Notification Hub",
    version="1.0.0"
)

# Enable CORS for backend (port 5000) and frontend (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service instances
spatial_engine = SpatialGeofenceEngine()
rules_engine = AlertRulesEngine()
cap_builder = CAPAlertBuilder()
notification_dispatcher = NotificationDispatcher()


# -------------------------------------------------------------
# Pydantic Request & Response Schemas
# -------------------------------------------------------------
class GeofenceCheckRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of location to test")
    longitude: float = Field(..., description="Longitude of location to test")
    include_nearby_radius_km: Optional[float] = Field(50.0, description="Proximity search radius in km")


class HazardEvaluationRequest(BaseModel):
    temperature_c: float = Field(28.0, description="Ambient temperature in °C")
    rainfall_mm: float = Field(0.0, description="Rainfall / precipitation in mm")
    wind_speed_kmh: float = Field(15.0, description="Wind speed in km/h")
    humidity_pct: float = Field(65.0, description="Relative humidity %")
    lightning_detected: bool = Field(False, description="Whether lightning strikes are active")


class CAPGenerateRequest(BaseModel):
    headline: str = Field(..., description="Warning alert headline")
    description: str = Field(..., description="Full warning description")
    instruction: str = Field(..., description="Protective action directives")
    event_type: str = Field("Tropical Cyclone", description="Hazard event type")
    severity: str = Field("Extreme", description="Severity level")
    urgency: str = Field("Immediate", description="Urgency level")
    certainty: str = Field("Observed", description="Certainty level")
    area_desc: str = Field("Odisha & West Bengal Coastal Corridor", description="Impacted geographic area description")
    polygons: Optional[List[List[List[float]]]] = Field(None, description="GeoJSON coordinates array of polygon rings")
    circles: Optional[List[Dict[str, Any]]] = Field(None, description="Array of circles {lat, lon, radius_km}")
    format: str = Field("json", description="Output format: json or xml")


class CAPParseRequest(BaseModel):
    xml_payload: str = Field(..., description="Raw OASIS CAP 1.2 XML string")


class DispatchNotificationRequest(BaseModel):
    alert_id: str = Field(..., description="Unique alert identifier")
    headline: str = Field(..., description="Disaster alert title")
    severity: str = Field("EMERGENCY", description="Severity category")
    advisories: List[str] = Field(..., description="Safety actions and advisories")
    geometry: Optional[Dict[str, Any]] = None
    channels: Optional[List[str]] = Field(["sms", "push", "email"], description="Notification delivery channels")


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@app.get("/")
@app.get("/health")
def health_check():
    """Health check probe."""
    return {
        "status": "healthy",
        "service": "WeatherGPT GIS & Alert Microservice",
        "version": "1.0.0",
        "loaded_gis_layers": list(spatial_engine.layers.keys()),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/v1/gis/layers")
def get_all_gis_layers():
    """
    Returns all registered GeoJSON boundary, cyclone, flood basin, and heatwave layers.
    """
    return {
        "status": "success",
        "total_layers": len(spatial_engine.layers),
        "layers": spatial_engine.layers
    }


@app.post("/api/v1/gis/geofence/check")
def check_geofence(req: GeofenceCheckRequest):
    """
    Evaluates whether the given coordinate falls within active metropolitan boundaries,
    cyclone hazard corridors, flood basins, or heatwave zones.
    """
    containing_polygons = spatial_engine.query_containing_polygons(req.latitude, req.longitude)
    nearby_zones = []
    if req.include_nearby_radius_km and req.include_nearby_radius_km > 0:
        nearby_zones = spatial_engine.get_nearby_zones(req.latitude, req.longitude, req.include_nearby_radius_km)

    return {
        "latitude": req.latitude,
        "longitude": req.longitude,
        "is_inside_hazard_zone": len(containing_polygons) > 0,
        "matched_zones_count": len(containing_polygons),
        "matched_zones": containing_polygons,
        "nearby_zones": nearby_zones
    }


@app.post("/api/v1/gis/hazard/evaluate")
def evaluate_hazard(req: HazardEvaluationRequest):
    """
    Evaluates meteorological observation metrics against official IMD SOP alert rules.
    """
    return rules_engine.evaluate_composite_hazard(
        temperature_c=req.temperature_c,
        rainfall_mm=req.rainfall_mm,
        wind_speed_kmh=req.wind_speed_kmh,
        humidity_pct=req.humidity_pct,
        lightning_detected=req.lightning_detected
    )


@app.post("/api/v1/gis/cap/generate")
def generate_cap_alert(req: CAPGenerateRequest):
    """
    Generates a standard WMO / NDMA compliant CAP 1.2 XML or JSON bulletin.
    """
    alert_dict = cap_builder.build_cap_alert(
        headline=req.headline,
        description=req.description,
        instruction=req.instruction,
        event_type=req.event_type,
        severity=req.severity,
        urgency=req.urgency,
        certainty=req.certainty,
        area_desc=req.area_desc,
        polygons=req.polygons,
        circles=req.circles
    )

    if req.format.lower() == "xml":
        xml_content = cap_builder.to_xml(alert_dict)
        return {
            "format": "xml",
            "identifier": alert_dict["identifier"],
            "xml_payload": xml_content
        }

    return {
        "format": "json",
        "alert": alert_dict
    }


@app.post("/api/v1/gis/cap/parse")
def parse_cap_xml(req: CAPParseRequest):
    """
    Parses an incoming OASIS CAP 1.2 XML string into structured JSON.
    """
    try:
        parsed = cap_builder.parse_xml(req.xml_payload)
        return {
            "status": "success",
            "parsed_cap": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CAP 1.2 XML format: {str(e)}")


@app.post("/api/v1/gis/notifications/dispatch")
def dispatch_notification(req: DispatchNotificationRequest):
    """
    Dispatches emergency alerts to subscribers filtered by spatial containment and severity.
    """
    return notification_dispatcher.dispatch_alert(
        alert_id=req.alert_id,
        headline=req.headline,
        severity=req.severity,
        advisories=req.advisories,
        geometry=req.geometry,
        channels=req.channels
    )


@app.get("/api/v1/gis/notifications/history")
def get_notification_history():
    """Returns recent emergency notification dispatch history."""
    return {
        "history": notification_dispatcher.get_dispatch_history()
    }
