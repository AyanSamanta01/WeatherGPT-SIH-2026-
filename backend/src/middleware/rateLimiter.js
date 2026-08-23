const rateLimit = require('express-rate-limit');

/**
 * Standard API Rate Limiter
 * Limits each IP to 100 requests per 15 minutes by default
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    statusCode: 429,
    timestamp: new Date().toISOString()
  }
});

/**
 * Stricter Rate Limiter for Auth endpoints (login/signup)
 * Limits each IP to 20 auth attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    statusCode: 429,
    timestamp: new Date().toISOString()
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
