const { defaultProvider, WeatherProviderFactory } = require('../providers');
const prisma = require('../config/db');
const logger = require('../utils/logger');

class WeatherService {
  constructor() {
    this.provider = defaultProvider;
  }

  setProvider(providerName) {
    this.provider = WeatherProviderFactory.getProvider(providerName);
  }

  async getCurrentWeather({ lat, lon, units = 'metric' }) {
    const data = await this.provider.getCurrentWeather({ lat, lon, units });

    // Optional background persistence to weather_records table
    try {
      if (prisma && prisma.weatherRecord) {
        prisma.weatherRecord.create({
          data: {
            locationName: `Coord (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
            latitude: lat,
            longitude: lon,
            observedAt: data.observedAt,
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
            pressure: data.pressure || null,
            windSpeed: data.windSpeed || 0,
            rainfall: data.rainfall || 0,
            source: data.source || this.provider.name,
            rawPayload: data.raw || null
          }
        }).catch(e => logger.debug('DB weather record save skipped:', e.message));
      }
    } catch (err) {
      logger.debug('DB persistence skipped:', err.message);
    }

    return data;
  }

  async getForecast({ lat, lon, days = 7 }) {
    const data = await this.provider.getForecast({ lat, lon, days });
    return data;
  }

  async getHistory({ lat, lon, from, to }) {
    const data = await this.provider.getHistory({ lat, lon, from, to });
    return data;
  }

  async geocode({ query }) {
    return this.provider.geocode({ query });
  }
}

module.exports = new WeatherService();
