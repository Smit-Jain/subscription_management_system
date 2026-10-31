// ─── Rate limiters ───────────────────────────────────────────────────────────
// Per-route limiters using express-rate-limit.
// Returns the standard error shape with 429.
// ─────────────────────────────────────────────────────────────────────────────
import rateLimit from 'express-rate-limit';

const limiterOptions = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.',
      });
    },
  });

/** Login: 10 attempts per 15 minutes per IP */
export const loginLimiter = limiterOptions(
  15 * 60 * 1000,
  10,
  'Too many login attempts. Please try again in 15 minutes.'
);

/** Forgot password: 5 per 15 minutes per IP */
export const forgotPasswordLimiter = limiterOptions(
  15 * 60 * 1000,
  5,
  'Too many password reset requests. Please try again in 15 minutes.'
);

/** Signup: 10 per hour per IP */
export const signupLimiter = limiterOptions(
  60 * 60 * 1000,
  10,
  'Too many signup attempts. Please try again in an hour.'
);
