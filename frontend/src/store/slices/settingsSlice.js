import { createSlice } from '@reduxjs/toolkit';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('weathergpt_theme');
    if (saved) {
      if (saved === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return saved;
    }
  } catch (e) {
    // Fallback
  }
  return 'dark';
};

const initialTheme = getInitialTheme();

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: initialTheme,
    language: 'English',
    voiceEnabled: true,
    voiceSpeed: 1.0,
    notificationsEnabled: true,
    supportedLanguages: SUPPORTED_LANGUAGES
  },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      try {
        localStorage.setItem('weathergpt_theme', action.payload);
        if (action.payload === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch (e) {}
    },
    toggleTheme(state) {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      try {
        localStorage.setItem('weathergpt_theme', nextTheme);
        if (nextTheme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch (e) {}
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
    setVoiceEnabled(state, action) {
      state.voiceEnabled = action.payload;
    },
    setVoiceSpeed(state, action) {
      state.voiceSpeed = action.payload;
    },
    setNotificationsEnabled(state, action) {
      state.notificationsEnabled = action.payload;
    }
  }
});

export const { 
  setTheme,
  toggleTheme,
  setLanguage, 
  setVoiceEnabled, 
  setVoiceSpeed, 
  setNotificationsEnabled 
} = settingsSlice.actions;

export default settingsSlice.reducer;
