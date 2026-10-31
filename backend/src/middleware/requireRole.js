// ─── requireRole middleware ──────────────────────────────────────────────────
// Usage: requireRole('ADMIN'), requireRole('ADMIN', 'STAFF')
// Must be placed AFTER authenticate middleware.
// ─────────────────────────────────────────────────────────────────────────────
import AppError from '../utils/AppError.js';

export default function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }
    next();
  };
}
