import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { weatherService } from '../../services/api';
import { INDIAN_CITIES, DEFAULT_CITY } from '../../config/constants';

export const fetchWeatherThunk = createAsyncThunk(
  'weather/fetchWeather',
  async (cityOrPayload, { rejectWithValue }) => {
    try {
      let cityName = DEFAULT_CITY;
      let lat, lon;

      if (typeof cityOrPayload === 'string') {
        cityName = cityOrPayload;
      } else if (cityOrPayload && typeof cityOrPayload === 'object') {
        cityName = cityOrPayload.cityName || cityOrPayload.city || DEFAULT_CITY;
        lat = cityOrPayload.lat;
        lon = cityOrPayload.lon;
      }

      const data = await weatherService.getCurrentWeather(cityName, lat, lon);
      return { cityName: data?.city || cityName, data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    selectedCity: DEFAULT_CITY,
    weatherData: null,
    loading: false,
    error: null,
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
      if (action.payload?.city) {
        state.selectedCity = action.payload.city;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCity = action.payload.cityName;
        state.weatherData = action.payload.data;
      })
      .addCase(fetchWeatherThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedCity, setTempUnit, setWeatherData } = weatherSlice.actions;
export default weatherSlice.reducer;
