/**
 * GIS and Spatial Computation Utilities for WeatherGPT
 * Supports Haversine distance calculations, GeoJSON Point-in-Polygon ray-casting,
 * and standard GeoJSON FeatureCollection generation with IMD color codes.
 */

/**
 * Calculate Haversine distance in kilometers between two coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Standard Ray-Casting Algorithm for Point-in-Polygon containment
 * @param {Array<number>} point - [lon, lat]
 * @param {Array<Array<number>>} ring - Array of [lon, lat] polygon vertices
 * @returns {boolean} - true if point is inside polygon
 */
function isPointInRing(point, ring) {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Check if a coordinate [lat, lon] falls within a GeoJSON Geometry (Point, Polygon, MultiPolygon)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {object} geometry - GeoJSON geometry object { type, coordinates }
 * @returns {boolean}
 */
function isPointInGeoJson(lat, lon, geometry) {
  if (!geometry || !geometry.type || !geometry.coordinates) {
    return false;
  }

  const point = [lon, lat]; // GeoJSON standard is [longitude, latitude]

  if (geometry.type === 'Polygon') {
    // Check outer boundary ring (index 0)
    if (!geometry.coordinates[0] || geometry.coordinates[0].length === 0) return false;
    const inOuter = isPointInRing(point, geometry.coordinates[0]);
    if (!inOuter) return false;

    // Check if point is in any hole (indices 1..n)
    for (let h = 1; h < geometry.coordinates.length; h++) {
      if (isPointInRing(point, geometry.coordinates[h])) {
        return false; // Point inside hole is outside polygon
      }
    }
    return true;
  }

  if (geometry.type === 'MultiPolygon') {
    for (const polygonCoords of geometry.coordinates) {
      if (isPointInRing(point, polygonCoords[0])) {
        let inHole = false;
        for (let h = 1; h < polygonCoords.length; h++) {
          if (isPointInRing(point, polygonCoords[h])) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return true;
      }
    }
    return false;
  }

  if (geometry.type === 'Point') {
    const dist = calculateDistance(lat, lon, geometry.coordinates[1], geometry.coordinates[0]);
    return dist <= 5; // 5km proximity for point targets
  }

  return false;
}

/**
 * IMD Standard 4-Color Alert Styling Map
 */
const IMD_COLOR_MAP = {
  normal: { color: '#22c55e', fill: '#22c55e', level: 'Green (Normal)' },
  advisory: { color: '#eab308', fill: '#fef08a', level: 'Yellow (Watch)' },
  watch: { color: '#eab308', fill: '#fef08a', level: 'Yellow (Watch)' },
  warning: { color: '#f97316', fill: '#fed7aa', level: 'Orange (Alert)' },
  severe: { color: '#ef4444', fill: '#fca5a5', level: 'Red (Warning/Take Action)' },
  extreme: { color: '#b91c1c', fill: '#f87171', level: 'Red (Extreme Emergency)' }
};

/**
 * Convert Alert records into a standard GeoJSON FeatureCollection for Mapbox/Leaflet UI
 */
function alertsToGeoJson(alerts = []) {
  const features = alerts.map(alert => {
    const style = IMD_COLOR_MAP[alert.severity?.toLowerCase()] || IMD_COLOR_MAP.warning;

    let geometry = alert.geometry;

    // If no custom polygon geometry is stored, fallback to a GeoJSON Point representation
    if (!geometry) {
      geometry = {
        type: 'Point',
        coordinates: [alert.longitude, alert.latitude]
      };
    }

    return {
      type: 'Feature',
      id: alert.id,
      geometry,
      properties: {
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        alertType: alert.alertType,
        locationName: alert.locationName,
        radiusKm: alert.radiusKm,
        source: alert.source,
        validFrom: alert.validFrom,
        validUntil: alert.validUntil,
        // Map styling tokens
        strokeColor: style.color,
        fillColor: style.fill,
        fillOpacity: 0.45,
        strokeWeight: 2,
        imdColorCode: style.level
      }
    };
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      generatedAt: new Date().toISOString(),
      featureCount: features.length,
      standard: 'IMD-CAP-GeoJSON-v1.0'
    },
    features
  };
}

module.exports = {
  calculateDistance,
  isPointInRing,
  isPointInGeoJson,
  alertsToGeoJson,
  IMD_COLOR_MAP
};
