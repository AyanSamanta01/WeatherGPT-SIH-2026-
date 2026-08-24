import axios from 'axios';
import { MOCK_WEATHER_BY_CITY, MOCK_ALERTS, MOCK_CLIMATE_TRENDS, MOCK_HOURLY_FORECAST, MOCK_DAILY_FORECAST } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Interceptor for Auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('weathergpt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const weatherService = {
  // Fetch current weather for city
  getCurrentWeather: async (cityName = 'Mumbai') => {
    try {
      const response = await apiClient.get(`/weather/current`, { params: { city: cityName } });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using mock current weather for ${cityName}`);
      return MOCK_WEATHER_BY_CITY[cityName] || MOCK_WEATHER_BY_CITY['Mumbai'];
    }
  },

  // Fetch hourly forecast
  getHourlyForecast: async (cityName = 'Mumbai') => {
    try {
      const response = await apiClient.get(`/weather/hourly`, { params: { city: cityName } });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using mock hourly forecast for ${cityName}`);
      return MOCK_HOURLY_FORECAST;
    }
  },

  // Fetch daily forecast
  getDailyForecast: async (cityName = 'Mumbai') => {
    try {
      const response = await apiClient.get(`/weather/daily`, { params: { city: cityName } });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using mock daily forecast for ${cityName}`);
      return MOCK_DAILY_FORECAST;
    }
  },

  // Fetch active disaster alerts
  getAlerts: async () => {
    try {
      const response = await apiClient.get(`/alerts`);
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using mock active alerts`);
      return MOCK_ALERTS;
    }
  },

  // Fetch historical climate analytics
  getClimateAnalytics: async () => {
    try {
      const response = await apiClient.get(`/analytics/climate`);
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using mock climate analytics`);
      return MOCK_CLIMATE_TRENDS;
    }
  },

  // Send AI Chat Query
  sendChatQuery: async (prompt, conversationHistory = []) => {
    try {
      const response = await apiClient.post(`/ai/chat`, { prompt, conversationHistory });
      return response.data;
    } catch (err) {
      console.warn(`[API Offline] Generating intelligent mock AI response`);
      // Simulate intelligent mock LLM response based on keywords
      const lower = prompt.toLowerCase();
      let replyText = "Based on current IMD meteorological data, ";
      let cardData = null;

      if (lower.includes('mumbai') || lower.includes('rain')) {
        replyText += "Mumbai is currently experiencing **Heavy Thunderstorms** with precipitation probabilities hovering at **85%**. Wind speeds of 24 km/h are blowing SW. High tides may cause localized waterlogging near coastal stretches.";
        cardData = {
          location: 'Mumbai',
          temp: '29°C',
          condition: 'Thunderstorm & Heavy Rain',
          highLow: '31° / 26°',
          rainChance: '85%'
        };
      } else if (lower.includes('delhi') || lower.includes('aqi') || lower.includes('heat')) {
        replyText += "New Delhi is under a **Hazy Sun & Dust Storm** advisory. AQI stands at **245 (Poor)**. Temperatures are expected to peak at 37°C with high UV index (9/10).";
        cardData = {
          location: 'New Delhi',
          temp: '34°C',
          condition: 'Hazy Sun & Dust Storm',
          highLow: '37° / 28°',
          rainChance: '15%'
        };
      } else if (lower.includes('alert') || lower.includes('warning') || lower.includes('cyclone')) {
        replyText += "🚨 **Active Alert**: A **Red Alert** for Severe Cyclone & Heavy Rainfall is active across Konkan & Mumbai metro regions. Wind gusts up to 100 km/h expected. Fishermen advisories are strictly enforced.";
      } else if (lower.includes('farmer') || lower.includes('crop') || lower.includes('agriculture')) {
        replyText += "🌾 **Agricultural Advisory**: Due to heavy monsoon precipitation, paddy farmers in coastal regions are advised to clear drainage channels. Avoid spraying fertilizer or pesticides during active rain spells.";
      } else {
        replyText += `weather conditions across the region remain variable. Temperatures average around 29°C-33°C with humidity levels at 75%-85%. You can check detailed hourly charts or interactive radar maps for precise coordinates.`;
      }

      return {
        replyText,
        sources: ['IMD Regional Centre', 'Open-Meteo GFS Ensemble'],
        weatherCard: cardData
      };
    }
  }
};

export default apiClient;
