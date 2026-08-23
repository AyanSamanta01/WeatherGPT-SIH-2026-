const express = require('express');
const router = express.Router();
const v1Routes = require('./v1');

const prisma = require('../config/db');

// Liveness probe endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'WeatherGPT Backend Gateway'
  });
});

// Readiness probe endpoint
router.get('/ready', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    if (prisma && prisma.$queryRaw) {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = 'unavailable';
  }

  const isReady = true; // Server is ready to receive traffic (with memory fallback if DB is starting)

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    database: dbStatus,
    weatherProvider: process.env.WEATHER_PROVIDER || 'open-meteo',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount v1 API
router.use('/api/v1', v1Routes);

// Fallback legacy mount for /api to /api/v1 for backward compatibility
router.use('/api', v1Routes);

module.exports = router;
