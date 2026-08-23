const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
} catch (err) {
  logger.warn('Prisma Client initialized in disconnected/standalone mode until DB migration is completed:', err.message);
  prisma = new PrismaClient();
}

module.exports = prisma;
