const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/alertController');
const validate = require('../../middleware/validate');
const { authenticateJWT } = require('../../middleware/authMiddleware');
const {
  nearbyAlertsSchema,
  alertPreferenceSchema,
  createAlertSchema
} = require('../../validation/alertValidation');

/**
 * @swagger
 * /api/v1/alerts:
 *   get:
 *     summary: Get all active weather alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of active alerts
 */
router.get('/', alertController.getAlerts);

/**
 * @swagger
 * /api/v1/alerts:
 *   post:
 *     summary: Publish a new weather alert (e.g. from IMD or Admin)
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [locationName, latitude, longitude, severity, alertType, title, description, validFrom, validUntil]
 *     responses:
 *       201:
 *         description: Alert created
 */
router.post('/', validate(createAlertSchema, 'body'), alertController.createAlert);

/**
 * @swagger
 * /api/v1/alerts/nearby:
 *   get:
 *     summary: Get alerts within radius of coordinates
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *           default: 100
 *     responses:
 *       200:
 *         description: List of nearby alerts
 */
router.get('/nearby', validate(nearbyAlertsSchema, 'query'), alertController.getNearbyAlerts);

/**
 * @swagger
 * /api/v1/alerts/preferences:
 *   get:
 *     summary: Get current user alert preferences
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User alert preferences
 */
router.get('/preferences', authenticateJWT, alertController.getPreferences);

/**
 * @swagger
 * /api/v1/alerts/preferences:
 *   post:
 *     summary: Update current user alert preferences
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alertTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               notificationChannels:
 *                 type: array
 *                 items:
 *                   type: string
 *               deviceToken:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.post('/preferences', authenticateJWT, validate(alertPreferenceSchema, 'body'), alertController.updatePreferences);

module.exports = router;
