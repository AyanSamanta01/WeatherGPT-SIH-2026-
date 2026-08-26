"""
WeatherGPT Common Alerting Protocol (CAP 1.2) Engine
===================================================
Generates and parses official WMO / OASIS / NDMA compliant CAP 1.2 XML and JSON bulletins.
Handles spatial geocoding polygons, circles, severity, urgency, certainty, and multi-lingual infos.
"""

import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Union


CAP_XML_NAMESPACE = "urn:oasis:names:tc:emergency:cap:1.2"


class CAPAlertBuilder:
    """
    Constructs compliant CAP 1.2 XML and JSON alerts.
    """

    def __init__(
        self,
        sender: str = "alerts.in@weathergpt.gov.in",
        status: str = "Actual",          # Actual | Exercise | System | Test | Draft
        msg_type: str = "Alert",         # Alert | Update | Cancel | Ack | Error
        scope: str = "Public"            # Public | Restricted | Private
    ):
        self.sender = sender
        self.status = status
        self.msg_type = msg_type
        self.scope = scope

    def build_cap_alert(
        self,
        headline: str,
        description: str,
        instruction: str,
        event_type: str,
        severity: str,                   # Extreme | Severe | Moderate | Minor | Unknown
        urgency: str = "Immediate",      # Immediate | Expected | Future | Past | Unknown
        certainty: str = "Observed",     # Observed | Likely | Possible | Unlikely | Unknown
        category: str = "Met",           # Geo | Met | Safety | Security | Rescue | Fire | Health | Env | Transport | Infra | Other
        area_desc: str = "National Reference Zone",
        polygons: Optional[List[List[List[float]]]] = None, # List of [ [ [lon, lat], ... ] ]
        circles: Optional[List[Dict[str, Any]]] = None,     # List of { lat, lon, radius_km }
        expires_hours: int = 12,
        language: str = "en-IN"
    ) -> Dict[str, Any]:
        """
        Builds in-memory CAP 1.2 structured alert object.
        """
        now = datetime.now(timezone.utc)
        expires = now + timedelta(hours=expires_hours)
        alert_id = f"WeatherGPT-CAP-{uuid.uuid4().hex[:12].upper()}"

        info_block = {
            "language": language,
            "category": category,
            "event": event_type,
            "urgency": urgency,
            "severity": severity,
            "certainty": certainty,
            "eventCode": [{"valueName": "SAME", "value": event_type.upper()[:3]}],
            "effective": now.isoformat(),
            "onset": now.isoformat(),
            "expires": expires.isoformat(),
            "senderName": "WeatherGPT National Early Warning Center",
            "headline": headline,
            "description": description,
            "instruction": instruction,
            "area": {
                "areaDesc": area_desc,
                "polygon": [],
                "circle": []
            }
        }

        # Format GeoJSON polygon to CAP polygon string "lat1,lon1 lat2,lon2 ..."
        if polygons:
            for poly in polygons:
                # poly is list of [lon, lat]
                coord_str = " ".join([f"{pt[1]:.5f},{pt[0]:.5f}" for pt in poly])
                info_block["area"]["polygon"].append(coord_str)

        if circles:
            for c in circles:
                circle_str = f"{c['lat']:.5f},{c['lon']:.5f} {c.get('radius_km', 25.0):.1f}"
                info_block["area"]["circle"].append(circle_str)

        alert_dict = {
            "identifier": alert_id,
            "sender": self.sender,
            "sent": now.isoformat(),
            "status": self.status,
            "msgType": self.msg_type,
            "scope": self.scope,
            "info": info_block
        }

        return alert_dict

    def to_xml(self, cap_alert: Dict[str, Any]) -> str:
        """
        Serializes CAP 1.2 dictionary to valid OASIS CAP 1.2 XML string.
        """
        root = ET.Element(f"{{{CAP_XML_NAMESPACE}}}alert")
        root.set("xmlns", CAP_XML_NAMESPACE)

        ET.SubElement(root, "identifier").text = cap_alert["identifier"]
        ET.SubElement(root, "sender").text = cap_alert["sender"]
        ET.SubElement(root, "sent").text = cap_alert["sent"]
        ET.SubElement(root, "status").text = cap_alert["status"]
        ET.SubElement(root, "msgType").text = cap_alert["msgType"]
        ET.SubElement(root, "scope").text = cap_alert["scope"]

        info = cap_alert.get("info", {})
        info_el = ET.SubElement(root, "info")
        ET.SubElement(info_el, "language").text = info.get("language", "en-IN")
        ET.SubElement(info_el, "category").text = info.get("category", "Met")
        ET.SubElement(info_el, "event").text = info.get("event", "Severe Weather")
        ET.SubElement(info_el, "urgency").text = info.get("urgency", "Immediate")
        ET.SubElement(info_el, "severity").text = info.get("severity", "Severe")
        ET.SubElement(info_el, "certainty").text = info.get("certainty", "Likely")
        ET.SubElement(info_el, "effective").text = info.get("effective", "")
        ET.SubElement(info_el, "expires").text = info.get("expires", "")
        ET.SubElement(info_el, "senderName").text = info.get("senderName", "")
        ET.SubElement(info_el, "headline").text = info.get("headline", "")
        ET.SubElement(info_el, "description").text = info.get("description", "")
        ET.SubElement(info_el, "instruction").text = info.get("instruction", "")

        area = info.get("area", {})
        area_el = ET.SubElement(info_el, "area")
        ET.SubElement(area_el, "areaDesc").text = area.get("areaDesc", "")
        for poly_str in area.get("polygon", []):
            ET.SubElement(area_el, "polygon").text = poly_str
        for circle_str in area.get("circle", []):
            ET.SubElement(area_el, "circle").text = circle_str

        xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
        return xml_declaration + ET.tostring(root, encoding="utf-8").decode("utf-8")

    @staticmethod
    def parse_xml(xml_string: str) -> Dict[str, Any]:
        """
        Parses an incoming OASIS CAP 1.2 XML string into a structured dictionary.
        """
        root = ET.fromstring(xml_string)
        # Strip namespace if present
        def find_text(elem, tag, default=""):
            for child in elem:
                if child.tag.endswith(tag) or child.tag == tag:
                    return child.text or default
            return default

        identifier = find_text(root, "identifier")
        sender = find_text(root, "sender")
        sent = find_text(root, "sent")
        status = find_text(root, "status", "Actual")
        msg_type = find_text(root, "msgType", "Alert")
        scope = find_text(root, "scope", "Public")

        # Find info element
        info_el = None
        for child in root:
            if child.tag.endswith("info") or child.tag == "info":
                info_el = child
                break

        info_dict = {}
        if info_el is not None:
            info_dict = {
                "language": find_text(info_el, "language", "en-IN"),
                "category": find_text(info_el, "category", "Met"),
                "event": find_text(info_el, "event"),
                "urgency": find_text(info_el, "urgency"),
                "severity": find_text(info_el, "severity"),
                "certainty": find_text(info_el, "certainty"),
                "headline": find_text(info_el, "headline"),
                "description": find_text(info_el, "description"),
                "instruction": find_text(info_el, "instruction"),
                "area": {"polygon": [], "circle": [], "areaDesc": ""}
            }
            # Area parsing
            for child in info_el:
                if child.tag.endswith("area") or child.tag == "area":
                    info_dict["area"]["areaDesc"] = find_text(child, "areaDesc")
                    for p in child:
                        if p.tag.endswith("polygon"):
                            info_dict["area"]["polygon"].append(p.text)
                        elif p.tag.endswith("circle"):
                            info_dict["area"]["circle"].append(p.text)

        return {
            "identifier": identifier,
            "sender": sender,
            "sent": sent,
            "status": status,
            "msgType": msg_type,
            "scope": scope,
            "info": info_dict
        }
