// ─── Root Route Aggregator ───────────────────────────────────────────────────
// Mounts all module routers under /api.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';

// Auth module (Member A)
import { authRouter, staffRouter, customersRouter } from '../modules/auth/routes.js';

// Placeholder modules
import catalogRouter  from '../modules/catalog/index.js';
import billingRouter  from '../modules/billing/index.js';
import financeRouter  from '../modules/finance/index.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Auth (Member A)
router.use('/auth',      authRouter);
router.use('/staff',     staffRouter);
router.use('/customers', customersRouter);

// Catalog (Member B)
router.use('/catalog',   catalogRouter);

// Billing (Member C)
router.use('/billing',   billingRouter);

// Finance (Member D)
router.use('/finance',   financeRouter);

export default router;
