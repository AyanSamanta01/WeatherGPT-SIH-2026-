import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { weatherService } from '../../services/api';
import { MOCK_WEATHER_BY_CITY, INDIAN_CITIES } from '../../data/mockData';

export const fetchWeatherThunk = createAsyncThunk(
  'weather/fetchWeather',
  async (cityName, { rejectWithValue }) => {
    try {
      const data = await weatherService.getCurrentWeather(cityName);
      if (data) return { cityName, data };
    } catch (err) {
      console.warn('Weather fetch error:', err);
    }
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
    availableCities: INDIAN_CITIES
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
