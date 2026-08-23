const { z } = require('zod');

const climateTrendsSchema = z.object({
  lat: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Invalid latitude (-90 to 90)'),
  lon: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Invalid longitude (-180 to 180)'),
  years: z.string().or(z.number()).optional().default(10).transform(val => parseInt(val, 10))
});

module.exports = {
  climateTrendsSchema
};
