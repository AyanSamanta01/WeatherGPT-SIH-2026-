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

module.exports = {
  handleChat
};
