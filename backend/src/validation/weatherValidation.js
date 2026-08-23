const { z } = require('zod');

const currentWeatherSchema = z.object({
  lat: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Invalid latitude (-90 to 90)'),
  lon: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Invalid longitude (-180 to 180)'),
  units: z.enum(['metric', 'imperial']).optional().default('metric')
});

const forecastWeatherSchema = z.object({
  lat: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Invalid latitude (-90 to 90)'),
  lon: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Invalid longitude (-180 to 180)'),
  days: z.string().or(z.number()).optional().default(7).transform(val => parseInt(val, 10))
});

const historyWeatherSchema = z.object({
  lat: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Invalid latitude (-90 to 90)'),
  lon: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Invalid longitude (-180 to 180)'),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
});

module.exports = {
  currentWeatherSchema,
  forecastWeatherSchema,
  historyWeatherSchema
};
