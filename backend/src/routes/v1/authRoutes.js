const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const validate = require('../../middleware/validate');
const { authenticateJWT } = require('../../middleware/authMiddleware');
const { authLimiter } = require('../../middleware/rateLimiter');
const { signupSchema, loginSchema, updateProfileSchema } = require('../../validation/authValidation');

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/signup', authLimiter, validate(signupSchema, 'body'), authController.signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, validate(loginSchema, 'body'), authController.login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authenticateJWT, authController.getMe);

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     summary: Update user profile, preferred language, or password
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated
 */
router.put('/me', authenticateJWT, validate(updateProfileSchema, 'body'), authController.updateMe);

module.exports = router;

