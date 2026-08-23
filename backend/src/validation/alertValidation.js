const { z } = require('zod');

const nearbyAlertsSchema = z.object({
  lat: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Invalid latitude (-90 to 90)'),
  lon: z.string().or(z.number()).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Invalid longitude (-180 to 180)'),
  radiusKm: z.string().or(z.number()).optional().default(100).transform(val => parseFloat(val))
});

const alertPreferenceSchema = z.object({
  locationId: z.string().optional(),
  alertTypes: z.array(z.string()).optional(),
  notificationChannels: z.array(z.string()).optional(),
  deviceToken: z.string().optional(),
  enabled: z.boolean().optional().default(true)
});

const createAlertSchema = z.object({
  locationName: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().positive().optional().default(50),
  severity: z.enum(['advisory', 'watch', 'warning', 'severe', 'extreme']),
  alertType: z.string().min(1, 'Alert type is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date()),
  source: z.string().optional().default('IMD')
});

module.exports = {
  nearbyAlertsSchema,
  alertPreferenceSchema,
  createAlertSchema
};
