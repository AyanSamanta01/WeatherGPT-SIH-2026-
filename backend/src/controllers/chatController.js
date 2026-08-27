const chatService = require('../services/chatService');
const { successResponse } = require('../utils/response');

const handleChat = async (req, res, next) => {
  try {
    const textQuery = req.body.message || req.body.prompt;
    const { latitude, longitude, language, conversationId } = req.body;
    const userId = req.user?.id || null;

    const result = await chatService.processChat({
      message: textQuery,
      latitude,
      longitude,
      language: language || req.user?.preferredLanguage || 'en',
      conversationId,
      userId
    });

    const enriched = {
      ...result,
      reply: result.answer,       // primary key the frontend checks
      replyText: result.answer,   // backward compat alias
      text: result.answer,        // secondary fallback
      weatherCard: result.weatherCard || null
    };

    return successResponse(res, enriched, 'Chat query processed successfully');
  } catch (err) {
    next(err);
  }
};


const handleVoiceChat = async (req, res, next) => {
  try {
    const { audio_base64, audio_format, latitude, longitude, language, conversationId } = req.body;
    const userId = req.user?.id || null;

    const result = await chatService.processVoiceChat({
      audio_base64,
      audio_format: audio_format || 'wav',
      latitude,
      longitude,
      language: language || req.user?.preferredLanguage || 'en',
      conversationId,
      userId
    });

    return successResponse(res, result, 'Voice query processed successfully');
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
  handleVoiceChat,
  getConversations,
  getHistory,
  deleteConversation
};


