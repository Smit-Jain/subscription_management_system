// ─── Finance Module (Owner: Member D) ────────────────────────────────────────
// TODO(D): Add routes for payments, reports, customer portal.
// Import authenticate and requireRole from '../../middleware/' as needed.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { module: 'finance', status: 'ok' } });
});

export default router;
