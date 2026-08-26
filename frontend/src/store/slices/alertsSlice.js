import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertService } from '../../services/api';
import { MOCK_ALERTS } from '../../data/mockData';

export const fetchAlertsThunk = createAsyncThunk(
  'alerts/fetchAlerts',
  async () => {
    try {
      const data = await alertService.getAlerts();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Alerts fetch error:', err);
    }
    return MOCK_ALERTS;
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    emergencyAlert: MOCK_ALERTS[0], // Active high-priority alert for demonstration
    alertsList: MOCK_ALERTS,
    loading: false
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
        title: 'Red Alert: Severe Cyclone Flash Inundation Warning (Bay of Bengal)',
        category: 'cyclone',
        severity: 'extreme',
        issuedBy: 'India Meteorological Department (IMD)',
        issuedAt: 'Just now',
        affectedRegions: ['Digha', 'Kakdwip', 'Sagar Island', 'Sundarbans'],
        summary: 'Deep Cyclonic system making coastal landfall. Severe squalls of 100-115 km/h with 4-meter storm surge.',
        advisories: [
          'Immediate evacuation of low-lying coastal mangrove settlements.',
          'Total ban on deep-sea and trawler fishing operations.',
          'Protect stored seeds & livestock in flood-resistant shelters.'
        ]
      };
      state.emergencyAlert = newAlert;
      state.alertsList = [newAlert, ...state.alertsList];
    },
    addLiveAlert(state, action) {
      const alertItem = action.payload;
      state.emergencyAlert = alertItem;
      state.alertsList = [alertItem, ...state.alertsList.filter(a => a.id !== alertItem.id)];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertsThunk.fulfilled, (state, action) => {
        state.alertsList = action.payload;
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
