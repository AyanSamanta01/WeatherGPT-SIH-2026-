import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/api';

export const DEFAULT_WELCOME_MESSAGES = [
  {
    id: 'welcome-1',
    sender: 'ai',
    text: "Namaste! I am **WeatherGPT AI**, your conversational meteorology intelligence assistant grounded in real-time IMD radars, Open-Meteo GFS ensemble forecasts, and NCMRWF numerical prediction systems.\n\nAsk me about current city telemetry, agricultural spraying advisories, or disaster alerts.",
    timestamp: 'Just now',
    sources: ['IMD Operational Radar', 'Open-Meteo GFS Ensemble', 'NCMRWF Unified Model'],
    suggestedActions: [
      'Current weather in Mumbai',
      'Can I spray pesticide on crops tomorrow?',
      'Active severe weather warnings in India'
    ]
  }
];

export const fetchConversationsThunk = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const convs = await chatService.getConversations();
      return convs || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    activeConversationId: null,
    conversationsList: [],
    messages: DEFAULT_WELCOME_MESSAGES,
    loading: false
  },
  reducers: {
    setActiveConversationId(state, action) {
      state.activeConversationId = action.payload;
    },
    setConversationsList(state, action) {
      state.conversationsList = action.payload;
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    removeConversation(state, action) {
      state.conversationsList = state.conversationsList.filter(c => c.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = null;
        state.messages = DEFAULT_WELCOME_MESSAGES;
      }
    },
    clearAllConversations(state) {
      state.conversationsList = [];
      state.activeConversationId = null;
      state.messages = DEFAULT_WELCOME_MESSAGES;
    },
    resetChat(state) {
      state.activeConversationId = null;
      state.messages = DEFAULT_WELCOME_MESSAGES;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
        state.conversationsList = action.payload;
      });
  }
});

export const { 
  setActiveConversationId, 
  setConversationsList, 
  setMessages, 
  addMessage, 
  removeConversation,
  clearAllConversations,
  resetChat 
} = chatSlice.actions;

export default chatSlice.reducer;
