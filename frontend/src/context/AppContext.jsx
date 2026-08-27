import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_WEATHER_BY_CITY, INDIAN_CITIES } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & Screen state
  const [activeScreen, setActiveScreen] = useState('chat'); // 'chat' | 'current' | 'forecast' | 'map' | 'alerts' | 'analytics' | 'settings' | 'auth'
  
  // Selected City & Weather State
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [weatherData, setWeatherData] = useState(MOCK_WEATHER_BY_CITY['Mumbai']);
  const [tempUnit, setTempUnit] = useState('C'); // 'C' | 'F'

  // User Auth State
  const [user, setUser] = useState({
    name: 'Ayan Samanta',
    email: 'ayan.s@weathergpt.gov.in',
    role: 'Meteorology Researcher',
    isLoggedIn: true
  });

  // Settings State
  const [language, setLanguage] = useState('English');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  // Speech Recognition & Voice Synth State
  const [isListening, setIsListening] = useState(false);

  // Update weather data when selected city changes
  useEffect(() => {
    if (MOCK_WEATHER_BY_CITY[selectedCity]) {
      setWeatherData(MOCK_WEATHER_BY_CITY[selectedCity]);
    }
  }, [selectedCity]);

  // Voice speech synthesis helper
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const cleanText = text.replace(/[*#_`]/g, ''); // strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Convert temperature helper
  const formatTemp = (celsius) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32) + '°F';
    }
    return Math.round(celsius) + '°C';
  };

  const loginUser = (name, email) => {
    setUser({
      name: name || 'Ayan Samanta',
      email: email || 'user@weathergpt.gov.in',
      role: 'Weather Analyst',
      isLoggedIn: true
    });
    setActiveScreen('chat');
  };

  const logoutUser = () => {
    setUser({ isLoggedIn: false });
    setActiveScreen('auth');
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        selectedCity,
        setSelectedCity,
        weatherData,
        tempUnit,
        setTempUnit,
        formatTemp,
        user,
        loginUser,
        logoutUser,
        language,
        setLanguage,
        voiceEnabled,
        setVoiceEnabled,
        notificationsEnabled,
        setNotificationsEnabled,
        voiceSpeed,
        setVoiceSpeed,
        speakText,
        isListening,
        setIsListening,
        INDIAN_CITIES
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
