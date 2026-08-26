"""
Unit Tests for Spatial Geofencing & Point-in-Polygon Engine
==========================================================
"""

import pytest
from src.spatial_geofencing import (
    calculate_haversine_distance_km,
    is_point_in_polygon_ring,
    is_point_in_geojson_geometry,
    SpatialGeofenceEngine
)


def test_haversine_distance():
    # Mumbai to Pune (~120 km)
    mumbai_lat, mumbai_lon = 19.0760, 72.8777
    pune_lat, pune_lon = 18.5204, 73.8567
    dist = calculate_haversine_distance_km(mumbai_lat, mumbai_lon, pune_lat, pune_lon)
    assert 110.0 <= dist <= 130.0


def test_point_in_simple_polygon():
    # Square polygon from (0,0) to (10,10)
    square_ring = [[0.0, 0.0], [10.0, 0.0], [10.0, 10.0], [0.0, 10.0], [0.0, 0.0]]
    assert is_point_in_polygon_ring((5.0, 5.0), square_ring) is True
    assert is_point_in_polygon_ring((15.0, 5.0), square_ring) is False
    assert is_point_in_polygon_ring((-1.0, 5.0), square_ring) is False


def test_point_in_geojson_mumbai_boundary():
    engine = SpatialGeofenceEngine()
    # Coordinates inside Mumbai metro boundary (19.0760° N, 72.8777° E)
    matched = engine.query_containing_polygons(19.0760, 72.8777)
    assert len(matched) >= 1
    metro_matches = [m for m in matched if m["properties"].get("city_id") == "mumbai"]
    assert len(metro_matches) == 1
    assert metro_matches[0]["properties"]["city_name"] == "Mumbai"


def test_point_in_cyclone_corridor():
    engine = SpatialGeofenceEngine()
    # Coordinates along Odisha coast (Puri / Bhubaneswar: 19.8° N, 85.8° E)
    matched = engine.query_containing_polygons(19.8, 85.8)
    cyclone_matches = [m for m in matched if "corridor_id" in m["properties"]]
    assert len(cyclone_matches) >= 1
    assert "Odisha" in cyclone_matches[0]["properties"]["name"]


def test_nearby_zones_search():
    engine = SpatialGeofenceEngine()
    # Search within 100km of Delhi
    nearby = engine.get_nearby_zones(28.6139, 77.2090, radius_km=100.0)
    assert len(nearby) >= 1
    delhi_nearby = [n for n in nearby if n["properties"].get("city_id") == "delhi"]
    assert len(delhi_nearby) == 1
