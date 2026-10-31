// ─── AppError: custom error class ────────────────────────────────────────────
// Throw this anywhere; errorHandler middleware catches it and sends the right
// HTTP response. Usage:  throw new AppError('Not found', 404);
// For validation:        throw new AppError('Validation failed', 400, { email: 'Already taken' });
// ─────────────────────────────────────────────────────────────────────────────

export default class AppError extends Error {
  /**
   * @param {string}  message     Human-readable message
   * @param {number}  statusCode  HTTP status (default 500)
   * @param {object}  errors      Optional field-level errors { field: message }
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
