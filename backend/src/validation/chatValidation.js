const { z } = require('zod');

const chatQuerySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  language: z.string().optional().default('en'),
  conversationId: z.string().optional()
});

module.exports = {
  chatQuerySchema
};
