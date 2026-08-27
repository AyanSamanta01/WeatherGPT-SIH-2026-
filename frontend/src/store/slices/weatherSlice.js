import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { weatherService } from '../../services/api';
import { openMeteoService } from '../../services/openMeteoService';
import { MOCK_WEATHER_BY_CITY, INDIAN_CITIES } from '../../data/mockData';

const CITY_COORDS = {
  Mumbai: { lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
  Delhi: { lat: 28.6139, lon: 77.2090, state: 'National Capital Territory of Delhi' },
  Kolkata: { lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  Chennai: { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  Bengaluru: { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  Hyderabad: { lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  Ahmedabad: { lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  Pune: { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  Bhubaneswar: { lat: 20.2961, lon: 85.8245, state: 'Odisha' },
  Guwahati: { lat: 26.1445, lon: 91.7362, state: 'Assam' },
  Nashik: { lat: 19.9975, lon: 73.7898, state: 'Maharashtra' },
  Jaipur: { lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  Lucknow: { lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
  Chandigarh: { lat: 30.7333, lon: 76.7794, state: 'Punjab & Haryana' },
  Patna: { lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  Kochi: { lat: 9.9312, lon: 76.2673, state: 'Kerala' },
  Varanasi: { lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' }
};

export const fetchWeatherThunk = createAsyncThunk(
  'weather/fetchWeather',
  async (locationParam) => {
    // 1. If locationParam is coordinates object: { lat, lon, cityName, stateName }
    if (typeof locationParam === 'object' && locationParam?.lat && locationParam?.lon) {
      const { lat, lon, cityName, stateName } = locationParam;
      try {
        const liveData = await openMeteoService.fetchLiveWeatherByCoords(lat, lon, cityName, stateName);
        return { cityName: liveData.city, data: liveData };
      } catch (err) {
        console.warn('Open-Meteo coords fetch error:', err);
        return {
          cityName: cityName || 'My Location',
          data: {
            ...(MOCK_WEATHER_BY_CITY[cityName] || MOCK_WEATHER_BY_CITY['Mumbai']),
            city: cityName || 'My Location',
            state: stateName || 'India',
            coordinates: { lat, lon }
          }
        };
      }
    }

    // 2. If locationParam is cityName string
    const cityName = typeof locationParam === 'string' ? locationParam : 'Mumbai';

    // A. Check known Indian city coordinates for instant Open-Meteo lookup
    if (CITY_COORDS[cityName]) {
      const { lat, lon, state } = CITY_COORDS[cityName];
      try {
        const liveData = await openMeteoService.fetchLiveWeatherByCoords(lat, lon, cityName, state);
        return { cityName, data: liveData };
      } catch (err) {
        console.warn('Open-Meteo city fetch error, attempting fallback:', err);
      }
    }

    // B. Try dynamic geocoding via Open-Meteo for any town/village name
    try {
      const geoResults = await openMeteoService.searchCity(cityName);
      if (geoResults && geoResults.length > 0) {
        const first = geoResults[0];
        const liveData = await openMeteoService.fetchLiveWeatherByCoords(
          first.lat, 
          first.lon, 
          first.name, 
          first.state || first.country
        );
        return { cityName: first.name, data: liveData };
      }
    } catch (err) {
      console.warn('Open-Meteo dynamic geocode error:', err);
    }

    // C. Try backend API proxy if online
    try {
      const data = await weatherService.getCurrentWeather(cityName);
      if (data && !data.offline) return { cityName, data };
    } catch (_) {}

    // D. Final local fallback
    return { 
      cityName, 
      data: MOCK_WEATHER_BY_CITY[cityName] || MOCK_WEATHER_BY_CITY['Mumbai'] 
    };
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    selectedCity: 'Mumbai',
    weatherData: MOCK_WEATHER_BY_CITY['Mumbai'],
    loading: false,
    tempUnit: 'C', // 'C' | 'F'
    availableCities: Array.from(new Set([...INDIAN_CITIES, ...Object.keys(CITY_COORDS)]))
  },
  reducers: {
    setSelectedCity(state, action) {
      state.selectedCity = action.payload;
    },
    setTempUnit(state, action) {
      state.tempUnit = action.payload;
    },
    setWeatherData(state, action) {
      state.weatherData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeatherThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCity = action.payload.cityName;
        state.weatherData = action.payload.data;
      })
      .addCase(fetchWeatherThunk.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setSelectedCity, setTempUnit, setWeatherData } = weatherSlice.actions;
export default weatherSlice.reducer;
