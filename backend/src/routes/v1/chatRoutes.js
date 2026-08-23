const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const validate = require('../../middleware/validate');
const { optionalAuth } = require('../../middleware/authMiddleware');
const { chatQuerySchema } = require('../../validation/chatValidation');

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

module.exports = router;
