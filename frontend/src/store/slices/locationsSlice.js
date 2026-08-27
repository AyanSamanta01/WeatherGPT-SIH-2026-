import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationService } from '../../services/api';

export const fetchLocationsThunk = createAsyncThunk(
  'locations/fetchLocations',
  async (_, { rejectWithValue }) => {
    try {
      const locs = await locationService.getLocations();
      return locs || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const locationsSlice = createSlice({
  name: 'locations',
  initialState: {
    savedLocations: [],
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
      .addCase(fetchLocationsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.savedLocations = action.payload;
      })
      .addCase(fetchLocationsThunk.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { addLocation, deleteLocation, setDefaultLocation } = locationsSlice.actions;
export default locationsSlice.reducer;
