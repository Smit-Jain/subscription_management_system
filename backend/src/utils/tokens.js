// ─── Token helpers ───────────────────────────────────────────────────────────
// JWT sign/verify + crypto tokens for password reset.
// ─────────────────────────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import env from '../config/env.js';

/**
 * Sign a JWT with minimal payload { sub, role }.
 * @param {{ id: string, role: string }} user
 * @returns {string}
 */
export function signJwt(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Verify a JWT. Returns the decoded payload or throws.
 * @param {string} token
 * @returns {{ sub: string, role: string }}
 */
export function verifyJwt(token) {
  return jwt.verify(token, env.jwtSecret);
}

/**
 * Generate a secure random token (hex string).
 * @param {number} bytes Default 32
 * @returns {string}
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * SHA-256 hash of a raw token (stored in DB instead of the raw token).
 * @param {string} raw
 * @returns {string}
 */
export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
