const express = require('express');
const router = express.Router();
const climateController = require('../../controllers/climateController');
const validate = require('../../middleware/validate');
const { climateTrendsSchema } = require('../../validation/climateValidation');

/**
 * @swagger
 * /api/v1/climate/trends:
 *   get:
 *     summary: Get historical multi-year climate trends
 *     tags: [Climate]
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
 *         name: years
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Historical climate trends
 */
router.get('/trends', validate(climateTrendsSchema, 'query'), climateController.getClimateTrends);
router.get('/climate', validate(climateTrendsSchema, 'query'), climateController.getClimateTrends);
router.get('/', validate(climateTrendsSchema, 'query'), climateController.getClimateTrends);

module.exports = router;

