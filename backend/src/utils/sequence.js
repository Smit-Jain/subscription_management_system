// ─── Sequence generator ──────────────────────────────────────────────────────
// Atomically increments a counter row.
// Usage:
//   const n = await nextSequence('SUB', tx);       // → 1, 2, 3 …
//   const number = formatNumber('SUB', n, 2026);   // → "SUB-2026-0001"
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../config/prisma.js';

/**
 * Get the next value for the given sequence key. Uses the Counter table.
 * @param {string} key   e.g. "SUB" or "INV"
 * @param {object} [tx]  Optional Prisma transaction client
 * @returns {Promise<number>}
 */
export async function nextSequence(key, tx) {
  const db = tx || prisma;
  const counter = await db.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

/**
 * Format a human-readable number like SUB-2026-0001.
 * @param {string} prefix  e.g. "SUB" or "INV"
 * @param {number} n       Sequence value
 * @param {number} [year]  Defaults to current year
 * @returns {string}
 */
export function formatNumber(prefix, n, year) {
  const y = year || new Date().getFullYear();
  return `${prefix}-${y}-${String(n).padStart(4, '0')}`;
}
