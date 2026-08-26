"""
WeatherGPT Spatial Geofencing & Point-in-Polygon Engine
======================================================
Implements high-precision Ray-Casting Point-in-Polygon (PIP), Haversine spatial distance,
and containment checks across arbitrary GeoJSON Polygons and MultiPolygons.
"""

import math
import json
import os
from typing import List, Tuple, Dict, Any, Union, Optional

EARTH_RADIUS_KM = 6371.0088


def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two points on the Earth's surface using Haversine formula.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c


def is_point_in_polygon_ring(point: Tuple[float, float], ring: List[List[float]]) -> bool:
    """
    Ray-Casting algorithm for 2D Point-in-Polygon containment on a single coordinate ring.
    :param point: (lon, lat) tuple
    :param ring: List of [lon, lat] vertices defining the ring
    :returns: True if point is inside the ring, False otherwise
    """
    x, y = point
    inside = False
    n = len(ring)
    if n < 3:
        return False

    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]

        # Check if point y is between yi and yj and if ray intersects edge
        intersect = ((yi > y) != (yj > y)) and \
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)

        if intersect:
            inside = not inside
        j = i

    return inside


def is_point_in_geojson_geometry(lat: float, lon: float, geometry: Dict[str, Any]) -> bool:
    """
    Evaluates whether (lat, lon) falls inside a GeoJSON Geometry (Point, Polygon, MultiPolygon).
    """
    if not geometry or not isinstance(geometry, dict):
        return False

    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")
    if not geom_type or coords is None:
        return False

    point = (lon, lat)  # Standard GeoJSON format is [longitude, latitude]

    if geom_type == "Polygon":
        if not coords or len(coords) == 0:
            return False
        # Outer boundary is index 0
        if not is_point_in_polygon_ring(point, coords[0]):
            return False
        # Check holes (indices 1..n) - if inside a hole, then outside the polygon
        for hole in coords[1:]:
            if is_point_in_polygon_ring(point, hole):
                return False
        return True

    elif geom_type == "MultiPolygon":
        for poly in coords:
            if not poly or len(poly) == 0:
                continue
            if is_point_in_polygon_ring(point, poly[0]):
                in_hole = False
                for hole in poly[1:]:
                    if is_point_in_polygon_ring(point, hole):
                        in_hole = True
                        break
                if not in_hole:
                    return True
        return False

    elif geom_type == "Point":
        # Proximity buffer of 10 km for point targets
        dist = calculate_haversine_distance_km(lat, lon, coords[1], coords[0])
        return dist <= 10.0

    return False


class SpatialGeofenceEngine:
    """
    In-memory spatial index and evaluation engine for regional hazard layers.
    """

    def __init__(self, data_dir: Optional[str] = None):
        if not data_dir:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
        self.data_dir = data_dir
        self.layers: Dict[str, Dict[str, Any]] = {}
        self.load_all_layers()

    def load_all_layers(self):
        """Loads all GeoJSON layer files from data directory."""
        if not os.path.exists(self.data_dir):
            return

        for fname in os.listdir(self.data_dir):
            if fname.endswith(".geojson") or fname.endswith(".json"):
                layer_id = os.path.splitext(fname)[0]
                fpath = os.path.join(self.data_dir, fname)
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        self.layers[layer_id] = json.load(f)
                except Exception as e:
                    print(f"[GIS] Warning loading layer {fname}: {e}")

    def query_containing_polygons(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        """
        Finds all active hazard or metropolitan boundary polygons that contain the given coordinates.
        """
        matched_features = []

        for layer_id, feature_collection in self.layers.items():
            features = feature_collection.get("features", [])
            for feat in features:
                geom = feat.get("geometry", {})
                if is_point_in_geojson_geometry(lat, lon, geom):
                    matched_features.append({
                        "layer_id": layer_id,
                        "layer_name": feature_collection.get("name", layer_id),
                        "properties": feat.get("properties", {}),
                        "geometry_type": geom.get("type")
                    })

        return matched_features

    def get_nearby_zones(self, lat: float, lon: float, radius_km: float = 50.0) -> List[Dict[str, Any]]:
        """
        Returns zones whose centers are within radius_km distance.
        """
        nearby = []
        for layer_id, feature_collection in self.layers.items():
            for feat in feature_collection.get("features", []):
                props = feat.get("properties", {})
                center = props.get("center")
                if center and len(center) >= 2:
                    c_lon, c_lat = center[0], center[1]
                    dist = calculate_haversine_distance_km(lat, lon, c_lat, c_lon)
                    if dist <= radius_km:
                        nearby.append({
                            "layer_id": layer_id,
                            "properties": props,
                            "distance_km": round(dist, 2)
                        })
        return nearby
