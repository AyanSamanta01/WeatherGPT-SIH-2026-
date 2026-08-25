const prisma = require('../config/db');
const logger = require('../utils/logger');
const { calculateDistance, isPointInGeoJson, alertsToGeoJson } = require('../utils/gisUtils');
const hazardEngine = require('./hazardEngine');
const weatherService = require('./weatherService');

class AlertService {
  constructor() {
    this.inMemoryAlerts = [
      {
        id: 'alert-mock-1',
        locationName: 'Bay of Bengal Coast',
        latitude: 21.5,
        longitude: 87.5,
        radiusKm: 150,
        severity: 'warning',
        alertType: 'cyclone',
        title: 'Deep Depression warning over Bay of Bengal',
        description: 'Squally weather with wind speed reaching 45-55 kmph gusting to 65 kmph likely over Northwest Bay of Bengal.',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[86.5, 20.5], [88.5, 20.5], [88.5, 22.5], [86.5, 22.5], [86.5, 20.5]]
          ]
        },
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 72 * 3600 * 1000),
        source: 'IMD'
      },
      {
        id: 'alert-mock-2',
        locationName: 'Northwest Plains',
        latitude: 28.6,
        longitude: 77.2,
        radiusKm: 100,
        severity: 'advisory',
        alertType: 'heatwave',
        title: 'Heatwave condition advisory',
        description: 'Daytime temperatures exceeding 42°C with low humidity. Stay hydrated.',
        geometry: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 48 * 3600 * 1000),
        source: 'IMD'
      }
    ];
  }

  /**
   * Get all active alerts
   */
  async getActiveAlerts(filters = {}) {
    if (prisma && prisma.alert) {
      try {
        const whereClause = {
          validUntil: { gte: new Date() }
        };

        if (filters.severity) {
          whereClause.severity = filters.severity;
        }
        if (filters.alertType) {
          whereClause.alertType = filters.alertType;
        }

        const alerts = await prisma.alert.findMany({
          where: whereClause,
          orderBy: { validFrom: 'desc' }
        });

        if (alerts && alerts.length > 0) {
          return alerts;
        }
      } catch (err) {
        logger.debug('DB getActiveAlerts fallback to memory:', err.message);
      }
    }

    const now = new Date();
    return this.inMemoryAlerts.filter(a => {
      if (new Date(a.validUntil) < now) return false;
      if (filters.severity && a.severity !== filters.severity) return false;
      if (filters.alertType && a.alertType !== filters.alertType) return false;
      return true;
    });
  }

  /**
   * Get GIS GeoJSON FeatureCollection of all active alerts for Map rendering
   */
  async getGisLayers() {
    const alerts = await this.getActiveAlerts();
    return alertsToGeoJson(alerts);
  }

  /**
   * Get alerts affecting specific coordinates (Using both spatial Point-in-Polygon & radius proximity)
   */
  async getNearbyAlerts({ lat, lon, radiusKm = 100 }) {
    const allAlerts = await this.getActiveAlerts();

    return allAlerts.filter(alert => {
      // 1. If alert has a GeoJSON polygon / geometry, perform Ray-Casting Point-in-Polygon containment check
      if (alert.geometry) {
        const isInsidePolygon = isPointInGeoJson(lat, lon, alert.geometry);
        if (isInsidePolygon) return true;
      }

      // 2. Otherwise/also check radial distance
      const dist = calculateDistance(lat, lon, alert.latitude, alert.longitude);
      return dist <= (radiusKm + (alert.radiusKm || 0));
    });
  }

  /**
   * Create an alert
   */
  async createAlert(data) {
    if (prisma && prisma.alert) {
      try {
        return await prisma.alert.create({
          data: {
            ...data,
            validFrom: new Date(data.validFrom),
            validUntil: new Date(data.validUntil),
            geometry: data.geometry || null
          }
        });
      } catch (err) {
        logger.debug('DB createAlert fallback:', err.message);
      }
    }

    const newAlert = {
      id: 'alert_' + Date.now(),
      ...data,
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
      createdAt: new Date()
    };
    this.inMemoryAlerts.unshift(newAlert);
    return newAlert;
  }

  /**
   * Ingest a standard Common Alerting Protocol (CAP 1.2 / NDMA / SACHET) alert payload
   */
  async ingestCapAlert(capData) {
    const alertRecord = {
      locationName: capData.areaDesc || capData.locationName || 'Monitored Region',
      latitude: capData.latitude || 20.0,
      longitude: capData.longitude || 85.0,
      radiusKm: capData.radiusKm || 50.0,
      severity: capData.severity?.toLowerCase() || 'warning',
      alertType: capData.event?.toLowerCase() || capData.alertType || 'general',
      title: capData.headline || capData.title || 'Official Weather Warning',
      description: capData.description || capData.instruction || 'Official weather warning issued by authorities.',
      geometry: capData.geometry || (capData.polygon ? {
        type: 'Polygon',
        coordinates: [capData.polygon]
      } : null),
      validFrom: capData.effective ? new Date(capData.effective) : new Date(),
      validUntil: capData.expires ? new Date(capData.expires) : new Date(Date.now() + 48 * 3600 * 1000),
      source: capData.senderName || capData.source || 'IMD-CAP-Feed'
    };

    return await this.createAlert(alertRecord);
  }

  /**
   * Evaluate live hazard level at coordinates against meteorological thresholds
   */
  async evaluateLocationHazard({ lat, lon }) {
    try {
      const currentWeather = await weatherService.getCurrentWeather({ lat, lon });
      const evaluation = hazardEngine.evaluate({
        temperature: currentWeather.temperature,
        rainfall: currentWeather.rainfall,
        windSpeed: currentWeather.windSpeed,
        humidity: currentWeather.humidity
      });

      // Also check active official IMD disaster alerts in this vicinity
      const nearbyAlerts = await this.getNearbyAlerts({ lat, lon, radiusKm: 50 });

      return {
        coordinates: { latitude: lat, longitude: lon },
        weatherObservation: {
          temperature: currentWeather.temperature,
          rainfall: currentWeather.rainfall,
          windSpeed: currentWeather.windSpeed,
          humidity: currentWeather.humidity,
          observedAt: currentWeather.observedAt,
          source: currentWeather.source
        },
        hazardEvaluation: evaluation,
        activeOfficialAlerts: nearbyAlerts
      };
    } catch (err) {
      logger.error('Failed to evaluate location hazard:', err.message);
      throw err;
    }
  }

  /**
   * Get user alert preferences
   */
  async getPreferences(userId) {
    if (prisma && prisma.alertPreference) {
      try {
        const prefs = await prisma.alertPreference.findFirst({
          where: { userId }
        });
        if (prefs) return prefs;
      } catch (err) {
        logger.debug('DB getPreferences fallback:', err.message);
      }
    }

    return {
      userId,
      alertTypes: ['cyclone', 'flood', 'heatwave', 'thunderstorm'],
      notificationChannels: ['in-app', 'push'],
      enabled: true
    };
  }

  /**
   * Upsert user alert preferences
   */
  async updatePreferences(userId, data) {
    if (prisma && prisma.alertPreference) {
      try {
        const existing = await prisma.alertPreference.findFirst({
          where: { userId }
        });

        if (existing) {
          return await prisma.alertPreference.update({
            where: { id: existing.id },
            data
          });
        } else {
          return await prisma.alertPreference.create({
            data: {
              userId,
              ...data
            }
          });
        }
      } catch (err) {
        logger.debug('DB updatePreferences fallback:', err.message);
      }
    }

    return { userId, ...data, updatedAt: new Date() };
  }
}

module.exports = new AlertService();

