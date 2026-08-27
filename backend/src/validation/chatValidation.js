const { z } = require('zod');

const chatQuerySchema = z.object({
  message: z.string().nullish(),
  prompt: z.string().nullish(),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  language: z.string().nullish().default('en'),
  conversationId: z.string().nullish(),
  conversationHistory: z.array(z.any()).nullish()
}).refine(data => Boolean(data.message || data.prompt), {
  message: 'Message or prompt cannot be empty'
});

const conversationIdParamSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required')
});

module.exports = {
  chatQuerySchema,
  conversationIdParamSchema
};
