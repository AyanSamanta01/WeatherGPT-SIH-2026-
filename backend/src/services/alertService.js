const prisma = require('../config/db');
const logger = require('../utils/logger');

class AlertService {
  /**
   * Calculate Haversine distance in KM between two coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
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
   * Get all active alerts
   */
  async getActiveAlerts() {
    try {
      if (prisma && prisma.alert) {
        return await prisma.alert.findMany({
          where: {
            validUntil: { gte: new Date() }
          },
          orderBy: { validFrom: 'desc' }
        });
      }
    } catch (err) {
      logger.warn('Failed to query alerts from DB, returning seed/fallback alerts:', err.message);
    }

    // Default mock alerts for demonstration
    return [
      {
        id: 'alert-mock-1',
        locationName: 'Coastal Odisha & West Bengal',
        latitude: 21.5,
        longitude: 87.5,
        radiusKm: 150,
        severity: 'warning',
        alertType: 'cyclone',
        title: 'Depression over Bay of Bengal',
        description: 'Squally weather with wind speed reaching 45-55 kmph gusting to 65 kmph likely over Northwest Bay of Bengal.',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 48 * 3600 * 1000),
        source: 'IMD'
      }
    ];
  }

  /**
   * Get alerts nearby specific coordinates
   */
  async getNearbyAlerts({ lat, lon, radiusKm = 100 }) {
    const allAlerts = await this.getActiveAlerts();

    return allAlerts.filter(alert => {
      const dist = this.calculateDistance(lat, lon, alert.latitude, alert.longitude);
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
            validUntil: new Date(data.validUntil)
          }
        });
      } catch (err) {
        // Fallback
      }
    }
    return { id: 'alert-temp-id', ...data, createdAt: new Date() };
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
        // Fallback
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
        // Fallback
      }
    }

    return { userId, ...data, updatedAt: new Date() };
  }
}

module.exports = new AlertService();
