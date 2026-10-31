// ─── validate middleware ─────────────────────────────────────────────────────
// Wraps a Zod schema. Parses req.body and returns the standard 400 error shape.
// Usage: router.post('/', validate(signupSchema), controller.signup);
// ─────────────────────────────────────────────────────────────────────────────
import AppError from '../utils/AppError.js';

/**
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
export default function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Convert ZodError issues into { field: message } map
      const errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_root';
        errors[key] = issue.message;
      }
      return next(new AppError('Validation failed', 400, errors));
    }
    // Replace req.body with the validated & transformed data
    req.body = result.data;
    next();
  };
}
