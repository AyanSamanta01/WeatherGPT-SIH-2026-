const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const validate = require('../../middleware/validate');
const { optionalAuth, authenticateJWT } = require('../../middleware/authMiddleware');
const { chatQuerySchema, conversationIdParamSchema } = require('../../validation/chatValidation');

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: Process natural language weather questions
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Will it rain tomorrow in Mumbai?"
 *               latitude:
 *                 type: number
 *                 example: 19.076
 *               longitude:
 *                 type: number
 *                 example: 72.877
 *               language:
 *                 type: string
 *                 example: "en"
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI grounded weather answer
 */
router.post('/', optionalAuth, validate(chatQuerySchema, 'body'), chatController.handleChat);
router.post('/chat', optionalAuth, validate(chatQuerySchema, 'body'), chatController.handleChat);



/**
 * @swagger
 * /api/v1/chat/conversations:
 *   get:
 *     summary: List all chat conversations for user
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: List of user conversations
 */
router.get('/conversations', optionalAuth, chatController.getConversations);

/**
 * @swagger
 * /api/v1/chat/history/{conversationId}:
 *   get:
 *     summary: Get message history for a specific conversation
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chronological list of chat messages
 */
router.get('/history/:conversationId', optionalAuth, validate(conversationIdParamSchema, 'params'), chatController.getHistory);

/**
 * @swagger
 * /api/v1/chat/conversations/{conversationId}:
 *   delete:
 *     summary: Delete a conversation thread
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 */
router.delete('/conversations/:conversationId', optionalAuth, validate(conversationIdParamSchema, 'params'), chatController.deleteConversation);

module.exports = router;

