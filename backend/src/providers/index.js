const env = require('../config/env');
const OpenMeteoProvider = require('./openMeteoProvider');
const OpenWeatherProvider = require('./openWeatherProvider');
const IMDProvider = require('./imdProvider');
const logger = require('../utils/logger');

class WeatherProviderFactory {
  static getProvider(providerName = env.WEATHER_PROVIDER) {
    switch (providerName.toLowerCase()) {
      case 'openweather':
        return new OpenWeatherProvider();
      case 'imd':
        return new IMDProvider();
      case 'open-meteo':
      default:
        return new OpenMeteoProvider();
    }
  }
}

const defaultProvider = WeatherProviderFactory.getProvider();
logger.info(`🌤️ Active Weather Provider: ${defaultProvider.name}`);

module.exports = {
  WeatherProviderFactory,
  defaultProvider
};
