import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import weatherReducer from './slices/weatherSlice';
import alertsReducer from './slices/alertsSlice';
import chatReducer from './slices/chatSlice';
import locationsReducer from './slices/locationsSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    weather: weatherReducer,
    alerts: alertsReducer,
    chat: chatReducer,
    locations: locationsReducer,
    settings: settingsReducer
  }
});

export default store;
