const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/locationController');
const validate = require('../../middleware/validate');
const { authenticateJWT } = require('../../middleware/authMiddleware');
const {
  createLocationSchema,
  updateLocationSchema,
  locationIdParamSchema
} = require('../../validation/locationValidation');

/**
 * @swagger
 * /api/v1/locations:
 *   get:
 *     summary: List saved locations for the authenticated user
 *     tags: [Locations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved locations
 */
router.get('/', authenticateJWT, locationController.getLocations);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   get:
 *     summary: Get a single saved location by ID
 *     tags: [Locations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location details
 */
router.get('/:id', authenticateJWT, validate(locationIdParamSchema, 'params'), locationController.getLocation);

/**
 * @swagger
 * /api/v1/locations:
 *   post:
 *     summary: Add a new saved location for the user
 *     tags: [Locations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, latitude, longitude]
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Location added successfully
 */
router.post('/', authenticateJWT, validate(createLocationSchema, 'body'), locationController.createLocation);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   put:
 *     summary: Update a saved location name, coordinates, or default status
 *     tags: [Locations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.put('/:id', authenticateJWT, validate(locationIdParamSchema, 'params'), validate(updateLocationSchema, 'body'), locationController.updateLocation);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   delete:
 *     summary: Delete a saved location
 *     tags: [Locations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location deleted successfully
 */
router.delete('/:id', authenticateJWT, validate(locationIdParamSchema, 'params'), locationController.deleteLocation);

module.exports = router;

