const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorResponse } = require('./utils/response');

const app = express();

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

// Root info route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to WeatherGPT API Gateway',
    version: '1.0.0',
    documentation: '/api-docs',
    healthCheck: '/health'
  });
});

// Mount API Routes
app.use(routes);

// Static frontend serving if built dist is present in production mode
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDist) && process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
  const spaRoutes = ['/login', '/current', '/forecast', '/map', '/alerts', '/analytics', '/chat', '/settings'];
  app.get(spaRoutes, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Catch-all for API
app.use((req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
