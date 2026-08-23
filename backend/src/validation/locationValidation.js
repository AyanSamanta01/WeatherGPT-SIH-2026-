const { z } = require('zod');

const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isDefault: z.boolean().optional().default(false)
});

const locationIdParamSchema = z.object({
  id: z.string().min(1, 'Location ID is required')
});

module.exports = {
  createLocationSchema,
  locationIdParamSchema
};
