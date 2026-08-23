const axios = require('axios');
const WeatherProvider = require('./weatherProvider.interface');
const logger = require('../utils/logger');

class OpenMeteoProvider extends WeatherProvider {
  constructor() {
    super('open-meteo');
    this.forecastBaseUrl = 'https://api.open-meteo.com/v1/forecast';
    this.archiveBaseUrl = 'https://archive-api.open-meteo.com/v1/archive';
    this.geoBaseUrl = 'https://geocoding-api.open-meteo.com/v1/search';
  }

  /**
   * Fetch current weather
   */
  async getCurrentWeather({ lat, lon, units = 'metric' }) {
    try {
      const response = await axios.get(this.forecastBaseUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation,weather_code',
          timezone: 'auto'
        },
        timeout: 8000
      });

      const current = response.data.current;
      return {
        latitude: lat,
        longitude: lon,
        observedAt: current.time ? new Date(current.time) : new Date(),
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        pressure: current.surface_pressure,
        windSpeed: current.wind_speed_10m,
        rainfall: current.precipitation || 0.0,
        weatherCode: current.weather_code,
        source: this.name,
        units: {
          temperature: response.data.current_units?.temperature_2m || '°C',
          windSpeed: response.data.current_units?.wind_speed_10m || 'km/h',
          rainfall: response.data.current_units?.precipitation || 'mm'
        },
        raw: response.data
      };
    } catch (err) {
      logger.error('Open-Meteo getCurrentWeather error:', err.message);
      throw new Error(`Failed to fetch current weather from Open-Meteo: ${err.message}`);
    }
  }

  /**
   * Fetch weather forecast
   */
  async getForecast({ lat, lon, days = 7 }) {
    try {
      const response = await axios.get(this.forecastBaseUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code',
          forecast_days: Math.min(Math.max(days, 1), 16),
          timezone: 'auto'
        },
        timeout: 8000
      });

      const daily = response.data.daily;
      const forecasts = (daily.time || []).map((dateStr, idx) => ({
        forecastTime: new Date(dateStr),
        temperatureMax: daily.temperature_2m_max?.[idx],
        temperatureMin: daily.temperature_2m_min?.[idx],
        temperature: ((daily.temperature_2m_max?.[idx] + daily.temperature_2m_min?.[idx]) / 2) || 0,
        rainfallProbability: daily.precipitation_probability_max?.[idx] || 0,
        precipitation: daily.precipitation_sum?.[idx] || 0,
        windSpeed: daily.wind_speed_10m_max?.[idx] || 0,
        weatherCode: daily.weather_code?.[idx],
        source: this.name,
        model: 'ecmwf_seamless'
      }));

      return {
        latitude: lat,
        longitude: lon,
        forecasts,
        source: this.name,
        model: 'ecmwf_seamless',
        raw: response.data
      };
    } catch (err) {
      logger.error('Open-Meteo getForecast error:', err.message);
      throw new Error(`Failed to fetch forecast from Open-Meteo: ${err.message}`);
    }
  }

  /**
   * Fetch historical weather
   */
  async getHistory({ lat, lon, from, to }) {
    try {
      const response = await axios.get(this.archiveBaseUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: from,
          end_date: to,
          daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max',
          timezone: 'auto'
        },
        timeout: 10000
      });

      const daily = response.data.daily || {};
      const history = (daily.time || []).map((dateStr, idx) => ({
        date: dateStr,
        temperatureMax: daily.temperature_2m_max?.[idx],
        temperatureMin: daily.temperature_2m_min?.[idx],
        temperatureMean: daily.temperature_2m_mean?.[idx],
        rainfall: daily.precipitation_sum?.[idx] || 0,
        windSpeed: daily.wind_speed_10m_max?.[idx] || 0
      }));

      return {
        latitude: lat,
        longitude: lon,
        from,
        to,
        history,
        source: this.name,
        raw: response.data
      };
    } catch (err) {
      logger.error('Open-Meteo getHistory error:', err.message);
      throw new Error(`Failed to fetch historical weather from Open-Meteo: ${err.message}`);
    }
  }

  /**
   * Geocode location query
   */
  async geocode({ query }) {
    try {
      const response = await axios.get(this.geoBaseUrl, {
        params: {
          name: query,
          count: 5,
          language: 'en',
          format: 'json'
        },
        timeout: 5000
      });

      const results = (response.data.results || []).map(item => ({
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
        admin1: item.admin1,
        timezone: item.timezone
      }));

      return results;
    } catch (err) {
      logger.error('Open-Meteo geocode error:', err.message);
      return [];
    }
  }
}

module.exports = OpenMeteoProvider;
