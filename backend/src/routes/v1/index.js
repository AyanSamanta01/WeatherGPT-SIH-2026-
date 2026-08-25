const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const weatherRoutes = require('./weatherRoutes');
const chatRoutes = require('./chatRoutes');
const alertRoutes = require('./alertRoutes');
const locationRoutes = require('./locationRoutes');
const climateRoutes = require('./climateRoutes');

router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);
router.use('/chat', chatRoutes);
router.use('/ai', chatRoutes);
router.use('/alerts', alertRoutes);
router.use('/locations', locationRoutes);
router.use('/climate', climateRoutes);
router.use('/analytics', climateRoutes);

module.exports = router;

