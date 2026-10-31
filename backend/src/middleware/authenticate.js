// ─── authenticate middleware ─────────────────────────────────────────────────
// Reads Bearer token, verifies JWT, loads user from DB (so deactivated users
// are blocked immediately), and sets req.user.
// ─────────────────────────────────────────────────────────────────────────────
import AppError from '../utils/AppError.js';
import { verifyJwt } from '../utils/tokens.js';
import prisma from '../config/prisma.js';

export default async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = header.split(' ')[1];
    const payload = verifyJwt(token);

    // Always load from DB so deactivated users are caught
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact support.', 403);
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    // JWT errors (expired, malformed, etc.)
    return next(new AppError('Invalid or expired token', 401));
  }
}
