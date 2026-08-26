"""
Unit Tests for Common Alerting Protocol (CAP 1.2) Engine
========================================================
"""

import pytest
from src.cap_protocol import CAPAlertBuilder, CAP_XML_NAMESPACE


def test_build_cap_json_alert():
    builder = CAPAlertBuilder()
    alert = builder.build_cap_alert(
        headline="Red Warning: Flash Flood Inundation",
        description="Continuous rainfall exceeding 220 mm detected.",
        instruction="Evacuate to elevated shelters immediately.",
        event_type="Flash Flood",
        severity="Extreme",
        urgency="Immediate",
        certainty="Observed",
        area_desc="Mumbai Metropolitan Region",
        polygons=[[[72.775, 18.890], [72.990, 18.890], [73.050, 19.180], [72.775, 18.890]]],
        circles=[{"lat": 19.0760, "lon": 72.8777, "radius_km": 20.0}]
    )

    assert "identifier" in alert
    assert alert["status"] == "Actual"
    assert alert["msgType"] == "Alert"
    assert alert["info"]["event"] == "Flash Flood"
    assert alert["info"]["severity"] == "Extreme"
    assert len(alert["info"]["area"]["polygon"]) == 1
    assert len(alert["info"]["area"]["circle"]) == 1
    assert "18.89000,72.77500" in alert["info"]["area"]["polygon"][0]


def test_cap_xml_serialization_and_deserialization():
    builder = CAPAlertBuilder()
    alert = builder.build_cap_alert(
        headline="Cyclone Alert: Very Severe Storm Approaching",
        description="Gale winds of 100 km/h expected.",
        instruction="Total suspension of fishing operations.",
        event_type="Tropical Cyclone",
        severity="Extreme",
        urgency="Immediate",
        area_desc="Odisha Coastal Belt"
    )

    xml_output = builder.to_xml(alert)
    assert '<?xml version="1.0" encoding="UTF-8"?>' in xml_output
    assert CAP_XML_NAMESPACE in xml_output
    assert "<headline>Cyclone Alert: Very Severe Storm Approaching</headline>" in xml_output

    # Parse back from XML
    parsed = builder.parse_xml(xml_output)
    assert parsed["identifier"] == alert["identifier"]
    assert parsed["info"]["headline"] == alert["info"]["headline"]
    assert parsed["info"]["event"] == "Tropical Cyclone"
    assert parsed["info"]["severity"] == "Extreme"
