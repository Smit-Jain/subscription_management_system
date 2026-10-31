// ─── Server Entry Point ──────────────────────────────────────────────────────
import app from './app.js';
import env from './config/env.js';
import prisma from './config/prisma.js';

const PORT = env.port;

async function main() {
  // Test DB connection
  try {
    await prisma.$connect();
    console.log('✅  Database connected');
  } catch (err) {
    console.error('❌  Database connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀  Brightloop API running on http://localhost:${PORT}`);
    console.log(`    Environment: ${env.nodeEnv}`);
    console.log(`    Frontend:    ${env.frontendUrl}`);
    console.log(`    Health:      http://localhost:${PORT}/api/health`);
  });
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
