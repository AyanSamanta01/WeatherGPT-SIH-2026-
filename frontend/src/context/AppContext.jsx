import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  loginUserThunk, 
  signupUserThunk, 
  logoutUserThunk,
  updateUserProfile as updateUserProfileAction
} from '../store/slices/authSlice';
import { 
  setSelectedCity as setCityAction, 
  setTempUnit as setTempUnitAction, 
  fetchWeatherThunk 
} from '../store/slices/weatherSlice';
import { 
  dismissEmergencyAlert as dismissAlertAction, 
  triggerSimulatedAlert as triggerAlertAction, 
  addLiveAlert,
  fetchAlertsThunk 
} from '../store/slices/alertsSlice';
import { 
  setActiveConversationId as setConvIdAction, 
  setConversationsList as setConvsAction,
  removeConversation as removeConversationAction,
  clearAllConversations as clearAllConversationsAction,
  resetChat as resetChatAction,
  fetchConversationsThunk 
} from '../store/slices/chatSlice';
import { 
  addLocation, 
  deleteLocation, 
  setDefaultLocation, 
  fetchLocationsThunk 
} from '../store/slices/locationsSlice';
import { 
  setTheme as setThemeAction,
  toggleTheme as toggleThemeAction,
  setLanguage as setLangAction, 
  setVoiceEnabled as setVoiceAction, 
  setVoiceSpeed as setSpeedAction, 
  setNotificationsEnabled as setNotifAction 
} from '../store/slices/settingsSlice';
import { 
  locationService, 
  alertService, 
  authService 
} from '../services/api';
import { SUPPORTED_LANGUAGES, INDIAN_CITIES } from '../data/mockData';

export const useApp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux Selectors
  const user = useSelector((state) => state.auth.user);
  const authLoading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  const selectedCity = useSelector((state) => state.weather.selectedCity);
  const weatherData = useSelector((state) => state.weather.weatherData);
  const weatherLoading = useSelector((state) => state.weather.loading);
  const tempUnit = useSelector((state) => state.weather.tempUnit);

  const emergencyAlert = useSelector((state) => state.alerts.emergencyAlert);
  const activeAlertsList = useSelector((state) => state.alerts.alertsList);

  const activeConversationId = useSelector((state) => state.chat.activeConversationId);
  const conversationsList = useSelector((state) => state.chat.conversationsList);

  const savedLocations = useSelector((state) => state.locations.savedLocations);

  const theme = useSelector((state) => state.settings.theme);
  const language = useSelector((state) => state.settings.language);
  const voiceEnabled = useSelector((state) => state.settings.voiceEnabled);
  const voiceSpeed = useSelector((state) => state.settings.voiceSpeed);
  const notificationsEnabled = useSelector((state) => state.settings.notificationsEnabled);

  const setTheme = useCallback((newTheme) => {
    dispatch(setThemeAction(newTheme));
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    dispatch(toggleThemeAction());
  }, [dispatch]);

  // Active Screen derived from router path
  const path = location.pathname.replace('/', '') || 'chat';
  const activeScreen = path === 'login' ? 'auth' : path;

  const setActiveScreen = useCallback((screenName) => {
    if (screenName === 'auth') {
      navigate('/login');
    } else {
      navigate('/' + screenName);
    }
  }, [navigate]);

  // Language Details Helper
  const getLanguageDetails = useCallback(() => {
    return SUPPORTED_LANGUAGES.find(l => l.name === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Voice speech synthesis helper
  const speakText = useCallback((text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown formatting
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\n+/g, ' ');

    const langInfo = getLanguageDetails();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;
    utterance.pitch = 1.0;
    utterance.lang = langInfo.speechCode || 'en-IN';

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, voiceSpeed, getLanguageDetails]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Format Temperature Helper
  const formatTemp = useCallback((celsius) => {
    if (celsius === undefined || celsius === null) return '--°';
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32) + '°F';
    }
    return Math.round(celsius) + '°C';
  }, [tempUnit]);

  // Weather Actions
  const setSelectedCity = useCallback((cityName) => {
    dispatch(setCityAction(cityName));
    dispatch(fetchWeatherThunk(cityName));
  }, [dispatch]);

  const fetchWeatherData = useCallback((cityName) => {
    dispatch(fetchWeatherThunk(cityName));
  }, [dispatch]);

  const setTempUnit = useCallback((unit) => {
    dispatch(setTempUnitAction(unit));
  }, [dispatch]);

  // Auth Actions
  const loginUser = useCallback(async (name, email, password) => {
    const resultAction = await dispatch(loginUserThunk({ name, email, password }));
    if (loginUserThunk.fulfilled.match(resultAction)) {
      navigate('/current');
      return true;
    }
    return false;
  }, [dispatch, navigate]);

  const signupUser = useCallback(async (userData) => {
    const resultAction = await dispatch(signupUserThunk(userData));
    if (signupUserThunk.fulfilled.match(resultAction)) {
      navigate('/current');
      return true;
    }
    return false;
  }, [dispatch, navigate]);

  const logoutUser = useCallback(async () => {
    await dispatch(logoutUserThunk());
    navigate('/login');
  }, [dispatch, navigate]);

  const updateUserProfile = useCallback(async (profileData) => {
    dispatch(updateUserProfileAction(profileData));
    try {
      await authService.updateMe(profileData);
    } catch (err) {
      // Fallback
    }
    return true;
  }, [dispatch]);

  // Language & Settings Actions
  const setLanguage = useCallback(async (newLangName) => {
    dispatch(setLangAction(newLangName));
    const langObj = SUPPORTED_LANGUAGES.find(l => l.name === newLangName);
    if (langObj && user?.isLoggedIn) {
      try {
        await authService.updateMe({ preferredLanguage: langObj.code });
      } catch (err) {
        // Fallback
      }
    }
  }, [dispatch, user]);

  const setVoiceEnabled = useCallback((enabled) => {
    dispatch(setVoiceAction(enabled));
  }, [dispatch]);

  const setVoiceSpeed = useCallback((speed) => {
    dispatch(setSpeedAction(speed));
  }, [dispatch]);

  const setNotificationsEnabled = useCallback((enabled) => {
    dispatch(setNotifAction(enabled));
  }, [dispatch]);

  // Alert Actions
  const dismissEmergencyAlert = useCallback(() => {
    dispatch(dismissAlertAction());
  }, [dispatch]);

  const triggerSimulatedAlert = useCallback((customAlert) => {
    dispatch(triggerAlertAction(customAlert));
    if (voiceEnabled) {
      speakText(`High Priority Alert: ${customAlert?.title || 'Severe Cyclone Warning'}`);
    }
  }, [dispatch, voiceEnabled, speakText]);

  // Chat Actions
  const setActiveConversationId = useCallback((id) => {
    dispatch(setConvIdAction(id));
  }, [dispatch]);

  const setConversationsList = useCallback((list) => {
    dispatch(setConvsAction(list));
  }, [dispatch]);

  const deleteConversation = useCallback(async (convId) => {
    dispatch(removeConversationAction(convId));
    try {
      await chatService.deleteConversation(convId);
    } catch (err) {
      // Fallback
    }
  }, [dispatch]);

  const clearAllHistory = useCallback(() => {
    dispatch(clearAllConversationsAction());
  }, [dispatch]);

  // Location Actions
  const addSavedLocation = useCallback(async (locData) => {
    try {
      const newLoc = await locationService.createLocation(locData);
      dispatch(addLocation(newLoc));
    } catch (err) {
      dispatch(addLocation({ id: 'loc-' + Date.now(), ...locData }));
    }
  }, [dispatch]);

  const removeSavedLocation = useCallback(async (id) => {
    try {
      await locationService.deleteLocation(id);
    } catch (err) {
      // Fallback
    }
    dispatch(deleteLocation(id));
  }, [dispatch]);

  const setDefaultSavedLocation = useCallback(async (id) => {
    try {
      await locationService.updateLocation(id, { isDefault: true });
    } catch (err) {
      // Fallback
    }
    dispatch(setDefaultLocation(id));
    const target = savedLocations.find(l => l.id === id);
    if (target) setSelectedCity(target.name.split(' ')[0]);
  }, [dispatch, savedLocations, setSelectedCity]);

  return {
    user,
    authLoading,
    authError,
    loginUser,
    signupUser,
    logoutUser,
    updateUserProfile,
    theme,
    setTheme,
    toggleTheme,
    activeScreen,
    setActiveScreen,
    selectedCity,
    setSelectedCity,
    weatherData,
    weatherLoading,
    fetchWeatherData,
    tempUnit,
    setTempUnit,
    formatTemp,
    language,
    setLanguage,
    getLanguageDetails,
    voiceEnabled,
    setVoiceEnabled,
    voiceSpeed,
    setVoiceSpeed,
    speakText,
    stopSpeaking,
    notificationsEnabled,
    setNotificationsEnabled,
    emergencyAlert,
    dismissEmergencyAlert,
    triggerSimulatedAlert,
    activeAlertsList,
    activeConversationId,
    setActiveConversationId,
    conversationsList,
    setConversationsList,
    deleteConversation,
    clearAllHistory,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    setDefaultSavedLocation,
    INDIAN_CITIES,
    SUPPORTED_LANGUAGES
  };
};

export const AppProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Load initial remote state on startup
  useEffect(() => {
    dispatch(fetchAlertsThunk());
    dispatch(fetchConversationsThunk());
    dispatch(fetchLocationsThunk());
  }, [dispatch]);

  // Server-Sent Events (SSE) Live Disaster Alerts Listener
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    let eventSource = null;

    try {
      eventSource = new EventSource(`${apiBaseUrl}/alerts/stream`);

      eventSource.addEventListener('alert', (event) => {
        try {
          const alertPayload = JSON.parse(event.data);
          const alertItem = alertPayload.alert || alertPayload;
          dispatch(addLiveAlert(alertItem));
        } catch (parseErr) {
          console.error('[SSE] Failed to parse alert:', parseErr);
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('[SSE] EventSource init failed:', err.message);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [dispatch]);

  return <>{children}</>;
};
