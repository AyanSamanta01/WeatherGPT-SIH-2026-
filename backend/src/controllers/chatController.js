const chatService = require('../services/chatService');
const { successResponse } = require('../utils/response');

const handleChat = async (req, res, next) => {
  try {
    const { message, latitude, longitude, language, conversationId } = req.body;
    const userId = req.user?.id || null;

    const result = await chatService.processChat({
      message,
      latitude,
      longitude,
      language: language || req.user?.preferredLanguage || 'en',
      conversationId,
      userId
    });

    return successResponse(res, result, 'Chat query processed successfully');
  } catch (err) {
    next(err);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const conversations = await chatService.getConversations(userId);
    return successResponse(res, conversations, 'Conversations retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id || null;
    const history = await chatService.getConversationHistory(conversationId, userId);
    return successResponse(res, history, 'Chat history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id || null;
    const result = await chatService.deleteConversation(conversationId, userId);
    return successResponse(res, result, 'Conversation deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleChat,
  getConversations,
  getHistory,
  deleteConversation
};

