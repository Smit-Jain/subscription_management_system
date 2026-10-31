// ─── Money helpers ───────────────────────────────────────────────────────────
// Prisma Decimal values arrive as numbers in JSON (thanks to our toJSON patch).
// These helpers keep arithmetic safe by rounding to 2 decimals.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Round to 2 decimal places (banker's rounding not needed for display).
 */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Safe addition of two money values.
 */
export function add(a, b) {
  return round2(Number(a) + Number(b));
}

/**
 * Safe multiplication (qty × price).
 */
export function multiply(a, b) {
  return round2(Number(a) * Number(b));
}

/**
 * Safe subtraction.
 */
export function subtract(a, b) {
  return round2(Number(a) - Number(b));
}
