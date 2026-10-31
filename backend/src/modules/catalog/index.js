// ─── Catalog Module (Owner: Member B) ────────────────────────────────────────
// TODO(B): Add routes for products, plans, quotation templates, subscriptions.
// Import authenticate and requireRole from '../../middleware/' as needed.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { module: 'catalog', status: 'ok' } });
});

export default router;
