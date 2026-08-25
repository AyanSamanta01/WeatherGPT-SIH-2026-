const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/alertController');
const validate = require('../../middleware/validate');
const { authenticateJWT } = require('../../middleware/authMiddleware');
const {
  nearbyAlertsSchema,
  hazardCheckSchema,
  alertPreferenceSchema,
  createAlertSchema,
  capAlertSchema
} = require('../../validation/alertValidation');

/**
 * @swagger
 * /api/v1/alerts:
 *   get:
 *     summary: Get all active weather alerts
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [advisory, watch, warning, severe, extreme]
 *       - in: query
 *         name: alertType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of active alerts
 */
router.get('/', alertController.getAlerts);

/**
 * @swagger
 * /api/v1/alerts/gis/layers:
 *   get:
 *     summary: Get GIS GeoJSON FeatureCollection of all active alerts for Map rendering
 *     tags: [GIS & Alerts]
 *     responses:
 *       200:
 *         description: GeoJSON FeatureCollection with styled polygons and markers
 */
router.get('/gis/layers', alertController.getGisLayers);

/**
 * @swagger
 * /api/v1/alerts/stream:
 *   get:
 *     summary: Real-Time Server-Sent Events (SSE) stream for live emergency alerts & disaster broadcast
 *     tags: [GIS & Alerts]
 *     responses:
 *       200:
 *         description: Event-stream connection for live real-time disaster alerts
 */
router.get('/stream', alertController.streamAlerts);


/**
 * @swagger
 * /api/v1/alerts/hazard/check:
 *   get:
 *     summary: Real-time meteorological hazard and IMD color-code evaluation for coordinates
 *     tags: [GIS & Alerts]
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
 *     responses:
 *       200:
 *         description: Live hazard evaluation and safety advisories
 */
router.get('/hazard/check', validate(hazardCheckSchema, 'query'), alertController.checkLocationHazard);

/**
 * @swagger
 * /api/v1/alerts/cap/ingest:
 *   post:
 *     summary: Ingest official CAP 1.2 / NDMA / SACHET disaster alert
 *     tags: [GIS & Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: CAP Alert successfully processed and ingested
 */
router.post('/cap/ingest', validate(capAlertSchema, 'body'), alertController.ingestCapAlert);

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
 *     summary: Get alerts within radius or intersecting GeoJSON polygons for coordinates
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
 *         description: List of nearby/intersecting alerts
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
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.post('/preferences', authenticateJWT, validate(alertPreferenceSchema, 'body'), alertController.updatePreferences);

module.exports = router;

