// ─── Config: PrismaClient singleton ──────────────────────────────────────────
// Patches Decimal.prototype.toJSON so money fields serialize as numbers.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient, Prisma } from '@prisma/client';

// Globally patch Decimal → Number in JSON
if (Prisma?.Decimal?.prototype) {
  Prisma.Decimal.prototype.toJSON = function () {
    return Number(this);
  };
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
