// ─── Response helpers ────────────────────────────────────────────────────────
// Consistent { success, data, message } shape for all responses.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object|null} data
 * @param {string} message
 * @param {number} statusCode
 */
export function success(res, data = null, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

/**
 * Send a 201 created response.
 */
export function created(res, data = null, message = 'Created') {
  return success(res, data, message, 201);
}

/**
 * Send an error response (use AppError + errorHandler in most cases).
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {object|null} errors  Field-level errors for 400 validation
 */
export function error(res, message = 'Something went wrong', statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}
