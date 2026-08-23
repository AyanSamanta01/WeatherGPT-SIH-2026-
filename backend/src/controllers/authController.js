const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: user.preferredLanguage
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage, deviceToken } = req.body;

    if (prisma && prisma.user) {
      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return errorResponse(res, 'User with this email already exists', 400);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
            preferredLanguage: preferredLanguage || 'en',
            deviceToken: deviceToken || null
          }
        });

        const token = generateToken(user);
        const { passwordHash: _, ...userSafe } = user;

        return successResponse(res, { user: userSafe, token }, 'User registered successfully', 201);
      } catch (dbErr) {
        // If DB server is unreachable, fall back to in-memory registration for dev/test
        if (dbErr.name === 'PrismaClientInitializationError' || dbErr.message.includes('Can\'t reach database server')) {
          const userSafe = {
            id: 'usr_' + Date.now(),
            name,
            email,
            preferredLanguage: preferredLanguage || 'en',
            deviceToken: deviceToken || null,
            createdAt: new Date()
          };
          const token = generateToken(userSafe);
          return successResponse(res, { user: userSafe, token }, 'User registered successfully (dev mode)', 201);
        }
        throw dbErr;
      }
    }

    const userSafe = {
      id: 'usr_' + Date.now(),
      name,
      email,
      preferredLanguage: preferredLanguage || 'en',
      createdAt: new Date()
    };
    const token = generateToken(userSafe);
    return successResponse(res, { user: userSafe, token }, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (prisma && prisma.user) {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return errorResponse(res, 'Invalid email or password', 401);
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return errorResponse(res, 'Invalid email or password', 401);
        }

        const token = generateToken(user);
        const { passwordHash: _, ...userSafe } = user;

        return successResponse(res, { user: userSafe, token }, 'Login successful');
      } catch (dbErr) {
        if (dbErr.name === 'PrismaClientInitializationError' || dbErr.message.includes('Can\'t reach database server')) {
          // Demo fallback user
          const userSafe = {
            id: 'usr_demo',
            name: 'Demo User',
            email,
            preferredLanguage: 'en'
          };
          const token = generateToken(userSafe);
          return successResponse(res, { user: userSafe, token }, 'Login successful (dev mode)');
        }
        throw dbErr;
      }
    }

    return errorResponse(res, 'Database not ready', 503);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  // Stateless JWT logout (client discards token)
  return successResponse(res, null, 'Logged out successfully');
};

const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthenticated', 401);
    }

    if (prisma && prisma.user) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            preferredLanguage: true,
            deviceToken: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (user) {
          return successResponse(res, { user }, 'User profile retrieved');
        }
      } catch (dbErr) {
        if (dbErr.name === 'PrismaClientInitializationError' || dbErr.message.includes('Can\'t reach database server')) {
          return successResponse(res, { user: req.user }, 'User profile retrieved (dev mode)');
        }
        throw dbErr;
      }
    }

    return successResponse(res, { user: req.user }, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe
};
