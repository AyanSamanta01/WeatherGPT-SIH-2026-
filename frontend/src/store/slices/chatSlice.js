import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/api';
import { INITIAL_CHAT_MESSAGES } from '../../data/mockData';

export const fetchConversationsThunk = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    try {
      const convs = await chatService.getConversations();
      if (convs && convs.length > 0) return convs;
    } catch (err) {
      console.warn('Chat conversations fetch error:', err);
    }
    return [];
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    activeConversationId: null,
    conversationsList: [],
    messages: INITIAL_CHAT_MESSAGES,
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
        state.messages = INITIAL_CHAT_MESSAGES;
      }
    },
    clearAllConversations(state) {
      state.conversationsList = [];
      state.activeConversationId = null;
      state.messages = INITIAL_CHAT_MESSAGES;
    },
    resetChat(state) {
      state.activeConversationId = null;
      state.messages = INITIAL_CHAT_MESSAGES;
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
