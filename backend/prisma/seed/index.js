// ─── Master Seed Runner ──────────────────────────────────────────────────────
// Runs all module seeds in order. Each teammate edits only their own seed file.
// Usage: node prisma/seed/index.js
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import seedAuth    from './auth.seed.js';
import seedCatalog from './catalog.seed.js';
import seedBilling from './billing.seed.js';
import seedFinance from './finance.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...\n');

  console.log('[1/4] Auth');
  await seedAuth(prisma);

  console.log('[2/4] Catalog');
  await seedCatalog(prisma);

  console.log('[3/4] Billing');
  await seedBilling(prisma);

  console.log('[4/4] Finance');
  await seedFinance(prisma);

  console.log('\n✅  Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
