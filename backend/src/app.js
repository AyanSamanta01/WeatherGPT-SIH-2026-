const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorResponse } = require('./utils/response');

const app = express();
const frontendDist = path.join(__dirname, '../../frontend/dist');

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to API routes
app.use('/api', apiLimiter);

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static frontend asset serving (disable default index.html hijack on root)
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false }));
}

// Root route: Real web browsers get React UI, API clients / test runners get JSON info
app.get('/', (req, res) => {
  const acceptHeader = req.headers['accept'] || '';
  const isHtmlClient = acceptHeader.includes('text/html');

  if (fs.existsSync(frontendDist) && isHtmlClient) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }

  return res.json({
    message: 'Welcome to WeatherGPT API Gateway',
    version: '1.0.0',
    documentation: '/api-docs',
    healthCheck: '/health'
  });
});

// Mount API Routes
app.use(routes);

// Specific SPA application routes for frontend
const SPA_ROUTES = [
  '/login',
  '/current',
  '/forecast',
  '/map',
  '/alerts',
  '/analytics',
  '/chat',
  '/settings'
];

if (fs.existsSync(frontendDist)) {
  app.get(SPA_ROUTES, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Catch-all for non-existent API routes & unknown paths
app.use((req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
