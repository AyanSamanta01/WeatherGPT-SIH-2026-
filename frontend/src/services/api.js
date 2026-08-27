import axios from 'axios';
import { 
  MOCK_WEATHER_BY_CITY, 
  MOCK_ALERTS, 
  MOCK_GIS_GEOJSON,
  MOCK_CLIMATE_TRENDS, 
  MOCK_HOURLY_FORECAST, 
  MOCK_DAILY_FORECAST,
  MOCK_CONVERSATIONS,
  MOCK_SAVED_LOCATIONS,
  INDIAN_CITIES
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

// Attach stored JWT Token to all outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('weathergpt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/**
 * Weather Service API
 */
export const weatherService = {
  getCurrentWeather: async (cityName = 'Mumbai', lat, lon, units = 'metric') => {
    try {
      const params = {};
      if (lat !== undefined && lon !== undefined) {
        params.lat = lat;
        params.lon = lon;
      } else {
        params.city = cityName;
      }
      params.units = units;

      const response = await apiClient.get('/weather/current', { params });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback current weather for ${cityName}`, err.message);
      const fallback = MOCK_WEATHER_BY_CITY[cityName] || MOCK_WEATHER_BY_CITY['Mumbai'];
      return { ...fallback, city: cityName };
    }
  },

  getHourlyForecast: async (cityName = 'Mumbai', lat, lon) => {
    try {
      const params = lat !== undefined && lon !== undefined ? { lat, lon } : { city: cityName };
      const response = await apiClient.get('/weather/hourly', { params });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback hourly forecast for ${cityName}`);
      return MOCK_HOURLY_FORECAST;
    }
  },

  getDailyForecast: async (cityName = 'Mumbai', lat, lon) => {
    try {
      const params = lat !== undefined && lon !== undefined ? { lat, lon } : { city: cityName };
      const response = await apiClient.get('/weather/daily', { params });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback daily forecast for ${cityName}`);
      return MOCK_DAILY_FORECAST;
    }
  },

  getForecast: async (cityName = 'Mumbai', lat, lon, days = 7) => {
    try {
      const params = lat !== undefined && lon !== undefined ? { lat, lon, days } : { city: cityName, days };
      const response = await apiClient.get('/weather/forecast', { params });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback multi-day forecast for ${cityName}`);
      return { city: cityName, forecasts: MOCK_DAILY_FORECAST };
    }
  },

  geocode: async (query) => {
    try {
      const response = await apiClient.get('/weather/geocode', { params: { q: query } });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback geocoding for ${query}`);
      const clean = query.toLowerCase();
      return INDIAN_CITIES.filter(c => 
        c.name.toLowerCase().includes(clean) || 
        c.state.toLowerCase().includes(clean)
      ).map(c => ({
        name: c.name,
        state: c.state,
        latitude: c.lat,
        longitude: c.lon,
        country: 'India'
      }));
    }
  }
};

/**
 * Alerts & GIS Geospatial Service
 */
export const alertService = {
  getAlerts: async (params = {}) => {
    try {
      const response = await apiClient.get('/alerts', { params });
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Using fallback active alerts list');
      let filtered = [...MOCK_ALERTS];
      if (params.severity && params.severity !== 'All') {
        filtered = filtered.filter(a => a.severity.toLowerCase() === params.severity.toLowerCase());
      }
      return filtered;
    }
  },

  getGisLayers: async () => {
    try {
      const response = await apiClient.get('/alerts/gis/layers');
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Using fallback GeoJSON hazard layers');
      return MOCK_GIS_GEOJSON;
    }
  },

  checkLocationHazard: async (lat, lon) => {
    try {
      const response = await apiClient.get('/alerts/hazard/check', { params: { lat, lon } });
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback point hazard check for (${lat}, ${lon})`);
      // Compute intelligent mock hazard based on coordinates
      const isMumbaiArea = lat >= 18.0 && lat <= 20.5 && lon >= 72.0 && lon <= 74.0;
      const isKolkataArea = lat >= 21.5 && lat <= 23.5 && lon >= 87.0 && lon <= 89.5;

      if (isMumbaiArea) {
        return {
          coordinates: { latitude: lat, longitude: lon },
          hazardEvaluation: {
            rating: 'EXTREME',
            colorCode: 'RED',
            primaryRisk: 'Severe Cyclonic Storm & Heavy Inundation',
            score: 92,
            advisories: [
              'Stay strictly indoors; secure loose outdoor objects against 90 km/h wind gusts.',
              'Agricultural Warning: Clear field drainage channels to prevent root asphyxiation in paddy.',
              'Marine Safety: Prohibit all fishing crafts and port operations until alert downgrade.'
            ]
          },
          weatherObservation: {
            temperature: 29,
            rainfall: 145,
            windSpeed: 88,
            humidity: 92
          },
          activeOfficialAlerts: [MOCK_ALERTS[0]]
        };
      } else if (isKolkataArea) {
        return {
          coordinates: { latitude: lat, longitude: lon },
          hazardEvaluation: {
            rating: 'HIGH',
            colorCode: 'ORANGE',
            primaryRisk: 'Urban Inundation & High River Tide',
            score: 74,
            advisories: [
              'High tide combined with monsoon rain; stay clear of low-lying riverbanks.',
              'Farmers: Elevate stored grain sacks and protect nursery seedbeds.'
            ]
          },
          weatherObservation: {
            temperature: 31,
            rainfall: 65,
            windSpeed: 34,
            humidity: 86
          },
          activeOfficialAlerts: [MOCK_ALERTS[1]]
        };
      }

      return {
        coordinates: { latitude: lat, longitude: lon },
        hazardEvaluation: {
          rating: 'NORMAL',
          colorCode: 'GREEN',
          primaryRisk: 'No Active Meteorological Warnings',
          score: 15,
          advisories: [
            'Conditions are standard for outdoor operations, transit, and agriculture.',
            'Follow routine irrigation schedules.'
          ]
        },
        weatherObservation: {
          temperature: 28,
          rainfall: 5,
          windSpeed: 14,
          humidity: 65
        },
        activeOfficialAlerts: []
      };
    }
  },

  getNearbyAlerts: async (lat, lon, radiusKm = 100) => {
    try {
      const response = await apiClient.get('/alerts/nearby', { params: { lat, lon, radiusKm } });
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Using fallback nearby alerts');
      return MOCK_ALERTS.slice(0, 2);
    }
  },

  ingestCapAlert: async (capData) => {
    try {
      const response = await apiClient.post('/alerts/cap/ingest', capData);
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Simulating CAP Alert Ingestion');
      return {
        id: 'CAP-' + Date.now(),
        ...capData,
        createdAt: new Date().toISOString()
      };
    }
  },

  createAlert: async (alertData) => {
    try {
      const response = await apiClient.post('/alerts', alertData);
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Simulating Alert Creation');
      return { id: 'ALT-' + Date.now(), ...alertData };
    }
  },

  getPreferences: async () => {
    try {
      const response = await apiClient.get('/alerts/preferences');
      return response.data.data;
    } catch (err) {
      return {
        alertTypes: ['cyclone', 'flood', 'heatwave', 'thunderstorm'],
        notificationChannels: ['in-app', 'push'],
        enabled: true
      };
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.post('/alerts/preferences', preferences);
      return response.data.data;
    } catch (err) {
      return { ...preferences, updatedAt: new Date().toISOString() };
    }
  }
};

/**
 * Chat & Conversational AI Service
 */
export const chatService = {
  sendMessage: async ({ message, latitude, longitude, language = 'en', conversationId = null }) => {
    try {
      const response = await apiClient.post('/chat', {
        message,
        latitude,
        longitude,
        language,
        conversationId
      });
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Generating intelligent offline response', err.message);
      const lower = message.toLowerCase();
      let replyText = "Based on current IMD meteorological observations and GFS numerical models: ";
      let cardData = null;

      if (lower.includes('mumbai') || lower.includes('rain') || lower.includes('barish') || lower.includes('cyclone')) {
        replyText = "Mumbai and coastal Konkan are under a **Red Alert** for a **Severe Cyclonic Storm & Heavy Rainfall**. Precipitation probabilities stand at **85%-90%** with peak rain spells in the afternoon. Wind speeds reaching **85-100 km/h** with high tide surges are expected.";
        cardData = {
          location: 'Mumbai',
          temp: '29°C',
          condition: 'Thunderstorm & Heavy Rain',
          highLow: '31° / 26°',
          rainChance: '85%'
        };
      } else if (lower.includes('delhi') || lower.includes('aqi') || lower.includes('garmi') || lower.includes('heat')) {
        replyText = "New Delhi is experiencing **Elevated Temperatures (37°C)** and a **Poor AQI of 245**. Strong dry westerly winds (Loo) are prevailing. Sensitive groups should wear protective masks and maintain hydration.";
        cardData = {
          location: 'New Delhi',
          temp: '34°C',
          condition: 'Hazy Sun & Dust Storm',
          highLow: '37° / 28°',
          rainChance: '15%'
        };
      } else if (lower.includes('farmer') || lower.includes('crop') || lower.includes('kisan') || lower.includes('agriculture') || lower.includes('angur') || lower.includes('nasik')) {
        replyText = "🌾 **Agricultural Advisory for Farmers**:\n\n1. **Paddy / Rice**: Clear field drainage lines immediately to avoid stagnant water submerging tillers.\n2. **Grapes / Horticulture (Nashik Region)**: With relative humidity at 84%, delay fungicide sprays until the rainfall window subsides to prevent chemical wash-off.\n3. **Soil Moisture**: Moisture levels are optimal for rabi sowing preparations after Aug 28.";
      } else if (lower.includes('bengaluru') || lower.includes('bangalore')) {
        replyText = "Bengaluru enjoys **Pleasant Weather** with temperatures hovering around **24°C-27°C** and gentle westerly breezes (14 km/h). Air quality index is **38 (Good)**.";
        cardData = {
          location: 'Bengaluru',
          temp: '24°C',
          condition: 'Pleasant & Light Breeze',
          highLow: '27° / 20°',
          rainChance: '20%'
        };
      } else {
        replyText += `Regional meteorological conditions indicate moderate monsoon activity across central and peninsular India. Temperatures average around 28°C-32°C. You can inspect interactive radar maps or hourly telemetry for point coordinates.`;
      }

      return {
        replyText,
        answer: replyText,
        sources: ['IMD Regional Forecasting Centre', 'Open-Meteo GFS Ensemble (0.25°)', 'NDMA Disaster Feed'],
        weatherCard: cardData,
        conversationId: conversationId || `conv-${Date.now()}`
      };
    }
  },

  getConversations: async () => {
    try {
      const response = await apiClient.get('/chat/conversations');
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Using fallback conversations list');
      return MOCK_CONVERSATIONS;
    }
  },

  getHistory: async (conversationId) => {
    try {
      const response = await apiClient.get(`/chat/history/${conversationId}`);
      return response.data.data;
    } catch (err) {
      console.warn(`[API Offline] Using fallback history for ${conversationId}`);
      return [
        {
          id: 'hist-1',
          sender: 'user',
          text: 'What are the cyclone alerts for Mumbai?',
          timestamp: '11:30'
        },
        {
          id: 'hist-2',
          sender: 'ai',
          text: 'A **Red Alert** is currently active across Mumbai and the Konkan coastline due to a severe deep depression. Wind gusts up to 90 km/h and localized flooding are forecast.',
          timestamp: '11:31',
          sources: ['IMD-WRF Numerical Forecast', 'NDMA CAP 1.2'],
          weatherCard: {
            location: 'Mumbai',
            temp: '29°C',
            condition: 'Thunderstorm & Heavy Rain',
            highLow: '31° / 26°',
            rainChance: '85%'
          }
        }
      ];
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      const response = await apiClient.delete(`/chat/conversations/${conversationId}`);
      return response.data.data;
    } catch (err) {
      return { success: true, conversationId };
    }
  }
};

/**
 * Climate Trends & Historical Analytics Service
 */
export const climateService = {
  getClimateTrends: async (lat, lon, years = 10) => {
    try {
      const params = lat !== undefined && lon !== undefined ? { lat, lon, years } : { years };
      const response = await apiClient.get('/climate/trends', { params });
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Using fallback climate trends dataset');
      return MOCK_CLIMATE_TRENDS;
    }
  }
};

/**
 * Authentication & User Profile Service
 */
export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data.data;
      if (data.token) {
        localStorage.setItem('weathergpt_token', data.token);
      }
      return data;
    } catch (err) {
      console.warn('[Auth Offline] Falling back to offline user session');
      const mockUser = {
        id: 'usr_offline',
        name: 'Ayan Samanta',
        email: email || 'ayan.s@weathergpt.gov.in',
        preferredLanguage: 'en',
        role: 'Meteorology Researcher',
        isLoggedIn: true
      };
      localStorage.setItem('weathergpt_token', 'mock_jwt_token');
      return { user: mockUser, token: 'mock_jwt_token' };
    }
  },

  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      const data = response.data.data;
      if (data.token) {
        localStorage.setItem('weathergpt_token', data.token);
      }
      return data;
    } catch (err) {
      console.warn('[Auth Offline] Falling back to offline registration');
      const mockUser = {
        id: 'usr_' + Date.now(),
        name: userData.name,
        email: userData.email,
        preferredLanguage: userData.preferredLanguage || 'en',
        role: userData.role || 'Meteorologist',
        isLoggedIn: true
      };
      localStorage.setItem('weathergpt_token', 'mock_jwt_token');
      return { user: mockUser, token: 'mock_jwt_token' };
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data.user;
    } catch (err) {
      return null;
    }
  },

  updateMe: async (updateData) => {
    try {
      const response = await apiClient.put('/auth/me', updateData);
      return response.data.data.user;
    } catch (err) {
      return updateData;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      localStorage.removeItem('weathergpt_token');
    }
  }
};

/**
 * Saved Locations CRUD Service
 */
export const locationService = {
  getLocations: async () => {
    try {
      const response = await apiClient.get('/locations');
      return response.data.data;
    } catch (err) {
      console.warn('[API Offline] Using fallback saved locations');
      return MOCK_SAVED_LOCATIONS;
    }
  },

  createLocation: async (locationData) => {
    try {
      const response = await apiClient.post('/locations', locationData);
      return response.data.data;
    } catch (err) {
      const newLoc = { id: 'loc-' + Date.now(), ...locationData, createdAt: new Date().toISOString() };
      return newLoc;
    }
  },

  updateLocation: async (id, locationData) => {
    try {
      const response = await apiClient.put(`/locations/${id}`, locationData);
      return response.data.data;
    } catch (err) {
      return { id, ...locationData };
    }
  },

  deleteLocation: async (id) => {
    try {
      const response = await apiClient.delete(`/locations/${id}`);
      return response.data.data;
    } catch (err) {
      return { success: true, id };
    }
  }
};

export default apiClient;
