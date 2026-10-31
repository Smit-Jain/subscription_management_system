// ─── Central error handler ───────────────────────────────────────────────────
// Must be registered LAST on the Express app.
// ─────────────────────────────────────────────────────────────────────────────
import env from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message    = err.message || 'Internal server error';
  let errors     = err.errors || null;

  // Prisma unique constraint violation → 409
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists`;
    errors = { [field]: `This ${field} is already taken` };
  }

  // Log unexpected errors
  if (statusCode >= 500 && env.isDev) {
    console.error('─'.repeat(60));
    console.error('💥  Unhandled error:', err);
    console.error('─'.repeat(60));
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (env.isDev && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}
