const axios = require('axios');
const WeatherProvider = require('./weatherProvider.interface');
const env = require('../config/env');
const logger = require('../utils/logger');

class OpenWeatherProvider extends WeatherProvider {
  constructor() {
    super('openweather');
    this.apiKey = env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather({ lat, lon, units = 'metric' }) {
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not configured in .env');
    }

    const response = await axios.get(`${this.baseUrl}/weather`, {
      params: {
        lat,
        lon,
        units,
        appid: this.apiKey
      }
    });

    const data = response.data;
    return {
      latitude: lat,
      longitude: lon,
      observedAt: new Date(data.dt * 1000),
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      pressure: data.main?.pressure,
      windSpeed: data.wind?.speed,
      rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
      weatherCode: data.weather?.[0]?.id,
      source: this.name,
      units: {
        temperature: units === 'metric' ? '°C' : '°F',
        windSpeed: units === 'metric' ? 'm/s' : 'mph',
        rainfall: 'mm'
      },
      raw: data
    };
  }

  async getForecast({ lat, lon, days = 7 }) {
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not configured in .env');
    }

    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: this.apiKey
      }
    });

    const forecasts = (response.data.list || []).map(item => ({
      forecastTime: new Date(item.dt * 1000),
      temperature: item.main?.temp,
      rainfallProbability: (item.pop || 0) * 100,
      precipitation: item.rain ? (item.rain['3h'] || 0) : 0,
      windSpeed: item.wind?.speed || 0,
      weatherCode: item.weather?.[0]?.id,
      source: this.name,
      model: 'owm-forecast'
    }));

    return {
      latitude: lat,
      longitude: lon,
      forecasts,
      source: this.name,
      model: 'owm-forecast',
      raw: response.data
    };
  }

  async getHistory({ lat, lon, from, to }) {
    throw new Error('Historical weather on OpenWeather requires paid Historical API tier.');
  }

  async geocode({ query }) {
    if (!this.apiKey) return [];
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
      params: { q: query, limit: 5, appid: this.apiKey }
    });
    return (response.data || []).map(item => ({
      name: item.name,
      latitude: item.lat,
      longitude: item.lon,
      country: item.country,
      admin1: item.state
    }));
  }
}

module.exports = OpenWeatherProvider;
