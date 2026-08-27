import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

const getInitialUser = () => {
  try {
    const token = localStorage.getItem('weathergpt_token');
    const savedUser = localStorage.getItem('weathergpt_user');
    if (token && savedUser) {
      return { ...JSON.parse(savedUser), isLoggedIn: true };
    }
  } catch (e) {
    console.warn('Error reading saved user:', e);
  }
  return { 
    name: 'Meteorology Officer',
    email: 'officer@weathergpt.gov.in',
    role: 'Lead Forecaster',
    isLoggedIn: true 
  };
};

export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const res = await authService.login(email, password);
      const userObj = res?.user ? { ...res.user, isLoggedIn: true } : {
        name: name || 'Ayan Samanta',
        email: email || 'user@weathergpt.gov.in',
        role: 'Meteorology Lead',
        isLoggedIn: true
      };
      localStorage.setItem('weathergpt_user', JSON.stringify(userObj));
      return userObj;
    } catch (err) {
      const fallbackUser = {
        name: name || 'Ayan Samanta',
        email: email || 'user@weathergpt.gov.in',
        role: 'Meteorology Lead',
        isLoggedIn: true
      };
      localStorage.setItem('weathergpt_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }
);

export const signupUserThunk = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await authService.signup(userData);
      const userObj = res?.user ? { ...res.user, isLoggedIn: true } : {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Meteorologist',
        preferredLanguage: userData.preferredLanguage || 'en',
        isLoggedIn: true
      };
      localStorage.setItem('weathergpt_user', JSON.stringify(userObj));
      return userObj;
    } catch (err) {
      const fallbackUser = {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Meteorologist',
        preferredLanguage: userData.preferredLanguage || 'en',
        isLoggedIn: true
      };
      localStorage.setItem('weathergpt_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    localStorage.removeItem('weathergpt_user');
    localStorage.removeItem('weathergpt_token');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    loading: false,
    error: null
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    updateUserProfile(state, action) {
      const updated = { ...state.user, ...action.payload, isLoggedIn: true };
      state.user = updated;
      localStorage.setItem('weathergpt_user', JSON.stringify(updated));
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(signupUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Sign up failed';
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = { isLoggedIn: false };
      });
  }
});

export const { setUser, updateUserProfile, clearError } = authSlice.actions;
export default authSlice.reducer;
