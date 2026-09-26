import axios from 'axios';
import { INDIAN_CITIES } from '../config/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
 * Weather Service API (Powered by live backend & Open-Meteo)
 */
export const weatherService = {
  getCurrentWeather: async (cityName = 'Mumbai', lat, lon, units = 'metric') => {
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
  },

  getHourlyForecast: async (cityName = 'Mumbai', lat, lon) => {
    const params = lat !== undefined && lon !== undefined ? { lat, lon } : { city: cityName };
    const response = await apiClient.get('/weather/hourly', { params });
    return response.data.data;
  },

  getDailyForecast: async (cityName = 'Mumbai', lat, lon) => {
    const params = lat !== undefined && lon !== undefined ? { lat, lon } : { city: cityName };
    const response = await apiClient.get('/weather/daily', { params });
    return response.data.data;
  },

  getForecast: async (cityName = 'Mumbai', lat, lon, days = 7) => {
    const params = lat !== undefined && lon !== undefined ? { lat, lon, days } : { city: cityName, days };
    const response = await apiClient.get('/weather/forecast', { params });
    return response.data.data;
  },

  geocode: async (query) => {
    try {
      const response = await apiClient.get('/weather/geocode', { params: { q: query } });
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch (err) {
      console.warn(`[Geocode Notice] Backend geocode search fallback for: ${query}`);
    }

    const clean = (query || '').toLowerCase().trim();
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
};

/**
 * Alerts & GIS Geospatial Service
 */
export const alertService = {
  getAlerts: async (params = {}) => {
    const response = await apiClient.get('/alerts', { params });
    return response.data.data;
  },

  getGisLayers: async () => {
    const response = await apiClient.get('/alerts/gis/layers');
    return response.data.data;
  },

  checkLocationHazard: async (lat, lon) => {
    const response = await apiClient.get('/alerts/hazard/check', { params: { lat, lon } });
    return response.data.data;
  },

  getNearbyAlerts: async (lat, lon, radiusKm = 100) => {
    const response = await apiClient.get('/alerts/nearby', { params: { lat, lon, radiusKm } });
    return response.data.data;
  },

  ingestCapAlert: async (capData) => {
    const response = await apiClient.post('/alerts/cap/ingest', capData);
    return response.data.data;
  },

  createAlert: async (alertData) => {
    const response = await apiClient.post('/alerts', alertData);
    return response.data.data;
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
    const response = await apiClient.post('/alerts/preferences', preferences);
    return response.data.data;
  }
};

/**
 * Chat & Conversational AI Service
 */
export const chatService = {
  sendMessage: async ({ message, latitude, longitude, language = 'en', conversationId = null }) => {
    const response = await apiClient.post('/chat', {
      message,
      latitude,
      longitude,
      language,
      conversationId
    });
    return response.data.data;
  },

  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data.data || [];
  },

  getHistory: async (conversationId) => {
    const response = await apiClient.get(`/chat/history/${conversationId}`);
    return response.data.data || [];
  },

  deleteConversation: async (conversationId) => {
    const response = await apiClient.delete(`/chat/conversations/${conversationId}`);
    return response.data.data;
  }
};

/**
 * Climate Trends & Historical Analytics Service
 */
export const climateService = {
  getClimateTrends: async (lat, lon, years = 10) => {
    const params = lat !== undefined && lon !== undefined ? { lat, lon, years } : { years };
    const response = await apiClient.get('/climate/trends', { params });
    return response.data.data;
  }
};

/**
 * Authentication & User Profile Service
 */
export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data.data;
    if (data.token) {
      localStorage.setItem('weathergpt_token', data.token);
    }
    return data;
  },

  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    const data = response.data.data;
    if (data.token) {
      localStorage.setItem('weathergpt_token', data.token);
    }
    return data;
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data?.user || response.data.data;
    } catch (err) {
      return null;
    }
  },

  updateMe: async (updateData) => {
    const response = await apiClient.put('/auth/me', updateData);
    return response.data.data?.user || response.data.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
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
    const response = await apiClient.get('/locations');
    return response.data.data || [];
  },

  createLocation: async (locationData) => {
    const response = await apiClient.post('/locations', locationData);
    return response.data.data;
  },

  updateLocation: async (id, locationData) => {
    const response = await apiClient.put(`/locations/${id}`, locationData);
    return response.data.data;
  },

  deleteLocation: async (id) => {
    const response = await apiClient.delete(`/locations/${id}`);
    return response.data.data;
  }
};

export default apiClient;
