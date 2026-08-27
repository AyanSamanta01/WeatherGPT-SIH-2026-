import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertService } from '../../services/api';

export const fetchAlertsThunk = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await alertService.getAlerts();
      return data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    emergencyAlert: null,
    alertsList: [],
    loading: false,
    error: null
  },
  reducers: {
    setEmergencyAlert(state, action) {
      state.emergencyAlert = action.payload;
    },
    dismissEmergencyAlert(state) {
      state.emergencyAlert = null;
    },
    triggerSimulatedAlert(state, action) {
      const newAlert = action.payload || {
        id: 'ALT-' + Date.now().toString().slice(-4),
        title: 'Red Alert: Severe Weather Warning (IMD Live Feed)',
        category: 'cyclone',
        severity: 'extreme',
        issuedBy: 'India Meteorological Department (IMD)',
        issuedAt: 'Just now',
        affectedRegions: ['Coastal Corridor'],
        summary: 'Deep convective weather system actively monitored by satellite radar feeds.',
        advisories: [
          'Stay informed with regional meteorological advisories.',
          'Follow safety precautions for ongoing operations.'
        ]
      };
      state.emergencyAlert = newAlert;
      state.alertsList = [newAlert, ...state.alertsList.filter(a => a.id !== newAlert.id)];
    },
    addLiveAlert(state, action) {
      const alertItem = action.payload;
      state.emergencyAlert = alertItem;
      state.alertsList = [alertItem, ...state.alertsList.filter(a => a.id !== alertItem.id)];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAlertsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.alertsList = action.payload;
        if (action.payload && action.payload.length > 0 && !state.emergencyAlert) {
          const highSeverity = action.payload.find(a => a.severity === 'extreme' || a.severity === 'severe');
          if (highSeverity) state.emergencyAlert = highSeverity;
        }
      })
      .addCase(fetchAlertsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setEmergencyAlert, 
  dismissEmergencyAlert, 
  triggerSimulatedAlert, 
  addLiveAlert 
} = alertsSlice.actions;

export default alertsSlice.reducer;
