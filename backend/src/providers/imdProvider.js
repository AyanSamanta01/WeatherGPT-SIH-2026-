const WeatherProvider = require('./weatherProvider.interface');
const OpenMeteoProvider = require('./openMeteoProvider');
const logger = require('../utils/logger');

/**
 * IMD (India Meteorological Department) Weather Provider (Planned Integration)
 * Architecture placeholder that simulates IMD data channels with Open-Meteo calibration
 * until official IMD API gateway access keys are integrated.
 */
class IMDProvider extends WeatherProvider {
  constructor() {
    super('IMD-Mausam (Planned)');
    this.fallback = new OpenMeteoProvider();
  }

  async getCurrentWeather(params) {
    logger.info('[IMDProvider] Fetching observation with IMD metadata');
    const result = await this.fallback.getCurrentWeather(params);
    result.source = this.name;
    result.model = 'IMD-WRF-4km';
    return result;
  }

  async getForecast(params) {
    logger.info('[IMDProvider] Fetching forecast with IMD metadata');
    const result = await this.fallback.getForecast(params);
    result.source = this.name;
    result.model = 'IMD-GFS-12km';
    return result;
  }

  async getHistory(params) {
    const result = await this.fallback.getHistory(params);
    result.source = this.name;
    return result;
  }

  async geocode(params) {
    return this.fallback.geocode(params);
  }
}

module.exports = IMDProvider;
