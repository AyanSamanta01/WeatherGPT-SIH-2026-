const { errorResponse } = require('../utils/response');

/**
 * Higher-order middleware function to validate incoming Express requests with Zod schemas.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        const summary = formattedErrors.map(e => `${e.field}: ${e.message}`).join('; ');
        return errorResponse(res, `Validation Error (${summary})`, 400, formattedErrors);
      }
      return errorResponse(res, err.message, 400);
    }
  };
};

module.exports = validate;
