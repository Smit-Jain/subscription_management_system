// ─── Billing Module (Owner: Member C) ────────────────────────────────────────
// TODO(C): Add routes for taxes, discounts, invoices.
// Import authenticate and requireRole from '../../middleware/' as needed.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { module: 'billing', status: 'ok' } });
});

export default router;
