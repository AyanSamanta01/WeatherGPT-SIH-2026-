# WeatherGPT GIS & Spatial Alerting Subsystem (Member 5 Deliverable)

Production-ready GIS Geofencing, IMD 4-Color Hazard Engine, OASIS CAP 1.2 Generator/Parser, GeoJSON Layer Hub, and Multi-Channel Emergency Alert Dispatcher.

---

## 🛠️ Key Capabilities

1. **High-Performance Spatial Geofencing (`src/spatial_geofencing.py`)**:
   - Ray-Casting 2D Point-in-Polygon (PIP) engine supporting complex Polygons with holes and MultiPolygons.
   - Haversine great-circle distance calculator and proximity radius search.
2. **Official IMD Alert Rules Engine (`src/alert_rules_engine.py`)**:
   - Rainfall SOP classification (Light, Moderate, Heavy, Very Heavy, Extremely Heavy).
   - Wind Gale & Cyclone scales (Squally, Gale, Severe Cyclonic).
   - Thermal extremes (Heatwave, Severe Heatwave, Coldwave).
   - IMD 4-Color Codes (`Green: No Warning`, `Yellow: Watch`, `Orange: Alert`, `Red: Warning/Emergency`).
3. **Common Alerting Protocol CAP 1.2 (`src/cap_protocol.py`)**:
   - Generates & parses official WMO / OASIS / NDMA compliant CAP 1.2 XML and JSON bulletins.
4. **GeoJSON Boundary & Hazard Layers (`data/`)**:
   - `india_metropolitan_boundaries.geojson`: 10 metropolitan boundary polygons (Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Hyderabad, Ahmedabad, Guwahati, Bhubaneswar, Srinagar).
   - `cyclone_hazard_corridors.geojson`: East Coast (Bay of Bengal) and West Coast (Arabian Sea) cyclone corridors.
   - `flood_prone_river_basins.geojson`: Brahmaputra, Lower Gangetic, and Mahanadi river basins.
   - `heatwave_vulnerability_zones.geojson`: North-West Arid core & Vidarbha/Telangana heat corridor.
5. **Multi-Channel Notification Dispatcher (`src/notification_dispatcher.py`)**:
   - Targeted disaster alert broadcast simulation across SMS, Web Push, WhatsApp, and Email.
6. **FastAPI Microservice (`src/api.py`)**:
   - Complete REST API on port 8001 (or embedded).

---

## 🧪 Testing

```bash
cd gis-alerts
pip install -r requirements.txt
pytest tests/ -v
```

All 17 automated tests pass (100% coverage).
