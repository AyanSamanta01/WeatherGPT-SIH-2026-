const { defaultProvider, WeatherProviderFactory } = require('../providers');
const prisma = require('../config/db');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

class WeatherService {
  constructor() {
    this.provider = defaultProvider;
  }

  setProvider(providerName) {
    this.provider = WeatherProviderFactory.getProvider(providerName);
  }

  async getCurrentWeather({ lat, lon, units = 'metric' }) {
    const cacheKey = `weather:current:${lat.toFixed(2)}:${lon.toFixed(2)}:${units}:${this.provider.name}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const data = await this.provider.getCurrentWeather({ lat, lon, units });

    // Cache current weather for 10 minutes (600s)
    cache.set(cacheKey, data, 600);

    // Background persistence to weather_records table
    try {
      const isDb = prisma && typeof prisma.isDbConnected === 'function' ? prisma.isDbConnected() : false;
      if (isDb && prisma.weatherRecord) {
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
    const cacheKey = `weather:forecast:${lat.toFixed(2)}:${lon.toFixed(2)}:${days}:${this.provider.name}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const data = await this.provider.getForecast({ lat, lon, days });

    // Cache forecast for 30 minutes (1800s)
    cache.set(cacheKey, data, 1800);

    // Background persistence of forecast predictions to database
    try {
      const isDb = prisma && typeof prisma.isDbConnected === 'function' ? prisma.isDbConnected() : false;
      if (isDb && prisma.forecast && data.forecasts && Array.isArray(data.forecasts)) {
        const forecastRecords = data.forecasts.map(f => ({
          locationName: `Coord (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          latitude: lat,
          longitude: lon,
          forecastTime: f.forecastTime,
          temperature: f.temperature || 0,
          rainfallProbability: f.rainfallProbability || 0,
          precipitation: f.precipitation || 0,
          windSpeed: f.windSpeed || 0,
          source: f.source || this.provider.name,
          model: f.model || data.model || 'nwp-standard'
        }));

        prisma.forecast.createMany({
          data: forecastRecords,
          skipDuplicates: true
        }).catch(e => logger.debug('DB forecast records save skipped:', e.message));
      }
    } catch (err) {
      logger.debug('DB forecast persistence skipped:', err.message);
    }

    return data;
  }

  async getHistory({ lat, lon, from, to }) {
    const cacheKey = `weather:history:${lat.toFixed(2)}:${lon.toFixed(2)}:${from}:${to}:${this.provider.name}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const data = await this.provider.getHistory({ lat, lon, from, to });

    // Cache historical data for 24 hours (86400s)
    cache.set(cacheKey, data, 86400);
    return data;
  }

  async geocode({ query }) {
    const cacheKey = `geocode:${query.trim().toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.provider.geocode({ query });
    // Cache geocoding results for 7 days
    cache.set(cacheKey, results, 7 * 86400);
    return results;
  }
}

module.exports = new WeatherService();

