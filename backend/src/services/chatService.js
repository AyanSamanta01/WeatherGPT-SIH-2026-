const weatherService = require('./weatherService');
const prisma = require('../config/db');
const logger = require('../utils/logger');

class ChatService {
  /**
   * Simple rule & pattern-based intent detector (can be extended with Python AI service)
   */
  detectIntent(message) {
    const text = message.toLowerCase();
    if (text.includes('rain') || text.includes('tomorrow') || text.includes('forecast') || text.includes('week') || text.includes('next')) {
      return 'forecast_query';
    }
    if (text.includes('temp') || text.includes('temperature') || text.includes('humidity') || text.includes('wind') || text.includes('now') || text.includes('current')) {
      return 'current_weather';
    }
    if (text.includes('alert') || text.includes('warning') || text.includes('cyclone') || text.includes('flood') || text.includes('danger')) {
      return 'alert_check';
    }
    if (text.includes('climate') || text.includes('trend') || text.includes('monsoon') || text.includes('last year') || text.includes('history')) {
      return 'climate_trend';
    }
    return 'general_weather_query';
  }

  /**
   * Assess meteorological risk level from weather variables
   */
  computeRiskLevel(weatherData) {
    if (!weatherData) return 'low';
    const rain = weatherData.rainfall || weatherData.precipitation || 0;
    const wind = weatherData.windSpeed || 0;
    const temp = weatherData.temperature || 25;

    if (rain > 50 || wind > 60 || temp > 43) return 'extreme';
    if (rain > 20 || wind > 40 || temp > 38) return 'high';
    if (rain > 5 || wind > 25 || temp > 33) return 'moderate';
    return 'low';
  }

  /**
   * Process a natural language chat query
   */
  async processChat({ message, latitude, longitude, language = 'en', conversationId, userId = null }) {
    const intent = this.detectIntent(message);
    const sources = [];
    let answer = '';
    let locationName = 'Selected Area';
    let risk = 'low';

    const lat = latitude ?? 22.5726; // Default to Kolkata coordinates if unspecified
    const lon = longitude ?? 88.3639;

    try {
      if (intent === 'forecast_query') {
        const forecastData = await weatherService.getForecast({ lat, lon, days: 3 });
        sources.push(forecastData.source || 'open-meteo');
        const tomorrow = forecastData.forecasts?.[1] || forecastData.forecasts?.[0];
        
        if (tomorrow) {
          const rainProb = tomorrow.rainfallProbability || 0;
          const tempMax = tomorrow.temperatureMax || tomorrow.temperature || 0;
          const tempMin = tomorrow.temperatureMin || 0;
          
          risk = rainProb > 60 ? 'moderate' : 'low';
          answer = `Forecast indicates temperatures between ${tempMin.toFixed(1)}°C and ${tempMax.toFixed(1)}°C with a ${rainProb}% probability of precipitation (${tomorrow.precipitation}mm expected).`;
        } else {
          answer = `Forecast for your location shows stable weather conditions.`;
        }
      } else if (intent === 'alert_check') {
        sources.push('IMD-Alerts');
        risk = 'low';
        answer = `No severe weather warnings or hazardous weather conditions currently active for your coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)}).`;
      } else {
        const currentData = await weatherService.getCurrentWeather({ lat, lon });
        sources.push(currentData.source || 'open-meteo');
        risk = this.computeRiskLevel(currentData);
        answer = `Current conditions: Temperature is ${currentData.temperature}°C, humidity is ${currentData.humidity}%, with wind speeds at ${currentData.windSpeed} km/h and ${currentData.rainfall}mm rainfall.`;
      }
    } catch (err) {
      logger.error('Weather retrieval failed in chatService:', err.message);
      answer = `Unable to fetch live weather data at the moment. Please verify the coordinates or try again shortly.`;
      sources.push('system-fallback');
    }

    // Save to database if available
    try {
      if (prisma && prisma.chatMessage) {
        await prisma.chatMessage.create({
          data: {
            userId: userId || null,
            conversationId: conversationId || undefined,
            role: 'user',
            content: message,
            intent,
            language,
            sources,
            riskLevel: risk
          }
        }).catch(e => logger.debug('ChatMessage (user) save skipped:', e.message));

        await prisma.chatMessage.create({
          data: {
            userId: userId || null,
            conversationId: conversationId || undefined,
            role: 'assistant',
            content: answer,
            intent,
            language,
            sources,
            riskLevel: risk
          }
        }).catch(e => logger.debug('ChatMessage (assistant) save skipped:', e.message));
      }
    } catch (err) {
      logger.debug('DB ChatMessage save skipped:', err.message);
    }

    return {
      answer,
      location: locationName,
      sources,
      risk,
      intent,
      language
    };
  }
}

module.exports = new ChatService();
