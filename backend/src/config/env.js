const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('weathergpt_super_secure_jwt_secret_sih_2026_key'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  WEATHER_PROVIDER: z.enum(['open-meteo', 'openweather', 'imd']).default('open-meteo'),
  OPENWEATHER_API_KEY: z.string().optional(),
  IMD_API_KEY: z.string().optional(),
  AI_SERVICE_URL: z.string().default('http://localhost:8000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment configuration validation error:', parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
