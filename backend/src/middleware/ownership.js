// ─── Ownership helpers ───────────────────────────────────────────────────────
// Helpers for customer-scoped data access.
// ─────────────────────────────────────────────────────────────────────────────
import AppError from '../utils/AppError.js';

/**
 * True if the user is STAFF or ADMIN.
 */
export function isStaffOrAdmin(user) {
  return user && (user.role === 'ADMIN' || user.role === 'STAFF');
}

/**
 * Throws 403 if the current user is a CUSTOMER trying to access another
 * customer's data. Staff and admin pass through.
 * @param {import('express').Request} req
 * @param {string} ownerId  The customerId that owns the resource
 */
export function assertOwnerOrStaff(req, ownerId) {
  if (isStaffOrAdmin(req.user)) return;
  if (req.user.id !== ownerId) {
    throw new AppError('You do not have access to this resource', 403);
  }
}

/**
 * Returns a Prisma `where` fragment:
 *   - For CUSTOMER → { customerId: req.user.id }  (scoped)
 *   - For STAFF/ADMIN → {} (see everything)
 *
 * Spread into any Prisma query: prisma.invoice.findMany({ where: { ...scopeToCustomer(req), ...otherFilters } })
 */
export function scopeToCustomer(req) {
  if (isStaffOrAdmin(req.user)) return {};
  return { customerId: req.user.id };
}
