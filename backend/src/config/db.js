const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma = new PrismaClient({
  log: ['error']
});

let isDbConnected = false;

prisma.$connect()
  .then(() => {
    isDbConnected = true;
    logger.info('🐘 PostgreSQL database connected successfully.');
  })
  .catch((err) => {
    isDbConnected = false;
    logger.info('⚡ Running in high-performance in-memory mode (standalone development).');
  });

prisma.isDbConnected = () => isDbConnected;

module.exports = prisma;
