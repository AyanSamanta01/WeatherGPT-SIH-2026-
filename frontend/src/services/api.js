import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('weathergpt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful fallback handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.warn(`API Error [${error.config?.url}]:`, error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// 1. Auth Service
export const authService = {
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },
  signup: async (userData) => {
    return apiClient.post('/auth/signup', userData);
  },
  getProfile: async () => {
    return apiClient.get('/auth/me');
  },
  updateProfile: async (data) => {
    return apiClient.put('/auth/me', data);
  },
  logout: async () => {
    return Promise.resolve({ success: true });
  }
};

// 2. Weather Service
export const weatherService = {
  getCurrentWeather: async (city) => {
    return apiClient.get('/weather/current', { params: { city } });
  },
  getHourlyForecast: async (city) => {
    return apiClient.get('/weather/hourly', { params: { city } });
  },
  getDailyForecast: async (city) => {
    return apiClient.get('/weather/daily', { params: { city } });
  },
  geocodeSearch: async (q) => {
    return apiClient.get('/weather/geocode', { params: { q } });
  }
};

// 3. AI Chat Service
export const chatService = {
  sendMessage: async ({ message, latitude, longitude, language, conversationId }) => {
    return apiClient.post('/chat', {
      message,
      latitude,
      longitude,
      language,
      conversationId
    });
  },
  getConversations: async () => {
    return apiClient.get('/chat/conversations');
  },
  getConversationHistory: async (conversationId) => {
    return apiClient.get(`/chat/history/${conversationId}`);
  },
  deleteConversation: async (conversationId) => {
    return apiClient.delete(`/chat/conversations/${conversationId}`);
  }
};

// 4. Alert & GIS Service
export const alertService = {
  getAlerts: async (params = {}) => {
    return apiClient.get('/alerts', { params });
  },
  getGisLayers: async () => {
    return apiClient.get('/alerts/gis/layers');
  },
  checkHazardCoordinates: async (lat, lon) => {
    return apiClient.get('/alerts/hazard/check', { params: { lat, lon } });
  },
  getPreferences: async () => {
    return apiClient.get('/alerts/preferences');
  },
  updatePreferences: async (data) => {
    return apiClient.post('/alerts/preferences', data);
  }
};

// 5. Saved Locations Service
export const locationService = {
  getLocations: async () => {
    return apiClient.get('/locations');
  },
  addLocation: async (locationData) => {
    return apiClient.post('/locations', locationData);
  },
  deleteLocation: async (locationId) => {
    return apiClient.delete(`/locations/${locationId}`);
  }
};

// 6. Analytics Service
export const analyticsService = {
  getClimateTrends: async (lat, lon, years = 10) => {
    return apiClient.get('/analytics/climate', { params: { lat, lon, years } });
  }
};

export default apiClient;
