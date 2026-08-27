import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationService } from '../../services/api';
import { MOCK_SAVED_LOCATIONS } from '../../data/mockData';

export const fetchLocationsThunk = createAsyncThunk(
  'locations/fetchLocations',
  async () => {
    try {
      const locs = await locationService.getLocations();
      if (locs && locs.length > 0) return locs;
    } catch (err) {
      console.warn('Locations fetch error:', err);
    }
    return MOCK_SAVED_LOCATIONS;
  }
);

const locationsSlice = createSlice({
  name: 'locations',
  initialState: {
    savedLocations: MOCK_SAVED_LOCATIONS,
    loading: false
  },
  reducers: {
    addLocation(state, action) {
      state.savedLocations.unshift(action.payload);
    },
    deleteLocation(state, action) {
      state.savedLocations = state.savedLocations.filter(l => l.id !== action.payload);
    },
    setDefaultLocation(state, action) {
      state.savedLocations = state.savedLocations.map(l => ({
        ...l,
        isDefault: l.id === action.payload
      }));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationsThunk.fulfilled, (state, action) => {
        state.savedLocations = action.payload;
      });
  }
});

export const { addLocation, deleteLocation, setDefaultLocation } = locationsSlice.actions;
export default locationsSlice.reducer;
