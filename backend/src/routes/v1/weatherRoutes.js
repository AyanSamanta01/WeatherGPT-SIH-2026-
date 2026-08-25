const express = require('express');
const router = express.Router();
const weatherController = require('../../controllers/weatherController');
const validate = require('../../middleware/validate');
const {
  currentWeatherSchema,
  forecastWeatherSchema,
  historyWeatherSchema
} = require('../../validation/weatherValidation');

/**
 * @swagger
 * /api/v1/weather/current:
 *   get:
 *     summary: Get current weather for latitude and longitude
 *     tags: [Weather]
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
 *         name: units
 *         schema:
 *           type: string
 *           enum: [metric, imperial]
 *     responses:
 *       200:
 *         description: Current weather report
 */
router.get('/current', validate(currentWeatherSchema, 'query'), weatherController.getCurrentWeather);

/**
 * @swagger
 * /api/v1/weather/forecast:
 *   get:
 *     summary: Get multi-day weather forecast
 *     tags: [Weather]
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
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Weather forecast data
 */
router.get('/forecast', validate(forecastWeatherSchema, 'query'), weatherController.getForecast);

/**
 * @swagger
 * /api/v1/weather/hourly:
 *   get:
 *     summary: Get 3-hourly forecast breakdown for a city or coordinates
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: Hourly forecast list
 */
router.get('/hourly', validate(forecastWeatherSchema, 'query'), weatherController.getHourlyForecast);

/**
 * @swagger
 * /api/v1/weather/daily:
 *   get:
 *     summary: Get 7-day daily forecast summary for a city or coordinates
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: 7-day daily forecast list
 */
router.get('/daily', validate(forecastWeatherSchema, 'query'), weatherController.getDailyForecast);


/**
 * @swagger
 * /api/v1/weather/history:
 *   get:
 *     summary: Get historical weather data between dates
 *     tags: [Weather]
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
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-01-10"
 *     responses:
 *       200:
 *         description: Historical weather data
 */
router.get('/history', validate(historyWeatherSchema, 'query'), weatherController.getHistory);

/**
 * @swagger
 * /api/v1/weather/geocode:
 *   get:
 *     summary: Search coordinates by city or place name
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of geocoded places
 */
router.get('/geocode', weatherController.geocode);

module.exports = router;
