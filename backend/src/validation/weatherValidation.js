const { z } = require('zod');

const currentWeatherSchema = z.object({
  lat: z.string().or(z.number()).optional().transform(val => val !== undefined ? parseFloat(val) : undefined),
  lon: z.string().or(z.number()).optional().transform(val => val !== undefined ? parseFloat(val) : undefined),
  city: z.string().optional(),
  q: z.string().optional(),
  units: z.enum(['metric', 'imperial']).optional().default('metric')
}).refine(data => (data.lat !== undefined && data.lon !== undefined) || data.city || data.q, {
  message: 'Must provide either lat & lon coordinates OR a city/q name'
});

const forecastWeatherSchema = z.object({
  lat: z.string().or(z.number()).optional().transform(val => val !== undefined ? parseFloat(val) : undefined),
  lon: z.string().or(z.number()).optional().transform(val => val !== undefined ? parseFloat(val) : undefined),
  city: z.string().optional(),
  q: z.string().optional(),
  days: z.string().or(z.number()).optional().default(7).transform(val => parseInt(val, 10))
}).refine(data => (data.lat !== undefined && data.lon !== undefined) || data.city || data.q, {
  message: 'Must provide either lat & lon coordinates OR a city/q name'
});

const historyWeatherSchema = z.object({
  lat: z.string().or(z.number()).optional().transform(val => val !== undefined ? parseFloat(val) : undefined),
  lon: z.string().or(z.number()).optional().transform(val => val !== undefined ? parseFloat(val) : undefined),
  city: z.string().optional(),
  q: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
}).refine(data => (data.lat !== undefined && data.lon !== undefined) || data.city || data.q, {
  message: 'Must provide either lat & lon coordinates OR a city/q name'
});

module.exports = {
  currentWeatherSchema,
  forecastWeatherSchema,
  historyWeatherSchema
};

