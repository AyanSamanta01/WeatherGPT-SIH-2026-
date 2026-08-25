const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.string().optional().default('en'),
  deviceToken: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  preferredLanguage: z.string().optional(),
  deviceToken: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional()
});

module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema
};

