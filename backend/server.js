const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const prisma = require('./src/config/db');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 WeatherGPT Backend Server running on port ${PORT} in [${env.NODE_ENV}] mode`);
  logger.info(`📖 Swagger OpenAPI docs available at: http://localhost:${PORT}/api-docs`);
  logger.info(`📡 API Version 1 endpoints at: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
      logger.info('Prisma database client disconnected.');
    }
    process.exit(0);
  });

  // Force close after 10s if graceful fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
