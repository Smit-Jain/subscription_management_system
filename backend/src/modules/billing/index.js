// ─── Billing Module Router (Owner: Member C) ──────────────────────────────────
// Mounts routes for Taxes, Discounts, and Invoices.
// Role access:
//   - Admin only: Tax CRUD, Discount CRUD.
//   - Admin + Staff: Read taxes/discounts, generate invoices, confirm/cancel invoices.
//   - Customer: Read-only access to own invoices.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import requireRole from '../../middleware/requireRole.js';
import validate from '../../middleware/validate.js';

import {
  listTaxes, getTax, createTax, updateTax, deleteTax,
} from './taxes.controller.js';

import {
  listDiscounts, getDiscount, createDiscount, updateDiscount, deleteDiscount,
} from './discounts.controller.js';

import {
  listInvoices, getInvoice, triggerInvoiceGeneration, createManualInvoice,
  confirmInvoice, cancelInvoice, sendInvoiceEmail, getInvoicePdf,
} from './invoices.controller.js';

import {
  taxSchema, updateTaxSchema, discountSchema, updateDiscountSchema, manualInvoiceSchema,
} from './validators.js';

import { startBillingScheduler } from './scheduler.js';

const router = Router();

// Start recurring billing scheduler in background
if (process.env.NODE_ENV !== 'test') {
  startBillingScheduler();
}

// ── Health Check ──────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { module: 'billing', status: 'ok' } });
});

// ── Taxes ─────────────────────────────────────────────────────────────────────
router.get(   '/taxes',     authenticate, requireRole('ADMIN', 'STAFF'),             listTaxes);
router.get(   '/taxes/:id', authenticate, requireRole('ADMIN', 'STAFF'),             getTax);
router.post(  '/taxes',     authenticate, requireRole('ADMIN'), validate(taxSchema), createTax);
router.put(   '/taxes/:id', authenticate, requireRole('ADMIN'), validate(updateTaxSchema), updateTax);
router.delete('/taxes/:id', authenticate, requireRole('ADMIN'),                      deleteTax);

// ── Discounts ─────────────────────────────────────────────────────────────────
router.get(   '/discounts',     authenticate, requireRole('ADMIN', 'STAFF'),                  listDiscounts);
router.get(   '/discounts/:id', authenticate, requireRole('ADMIN', 'STAFF'),                  getDiscount);
router.post(  '/discounts',     authenticate, requireRole('ADMIN'), validate(discountSchema), createDiscount);
router.put(   '/discounts/:id', authenticate, requireRole('ADMIN'), validate(updateDiscountSchema), updateDiscount);
router.delete('/discounts/:id', authenticate, requireRole('ADMIN'),                           deleteDiscount);

// ── Invoices ──────────────────────────────────────────────────────────────────
router.get( '/invoices',                 authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), listInvoices);
router.get( '/invoices/:id',             authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), getInvoice);
router.post('/invoices/generate',         authenticate, requireRole('ADMIN', 'STAFF'),             triggerInvoiceGeneration);
router.post('/invoices',                 authenticate, requireRole('ADMIN', 'STAFF'), validate(manualInvoiceSchema), createManualInvoice);

// Support both PUT and POST for confirm/cancel
router.put( '/invoices/:id/confirm',     authenticate, requireRole('ADMIN', 'STAFF'), confirmInvoice);
router.post('/invoices/:id/confirm',     authenticate, requireRole('ADMIN', 'STAFF'), confirmInvoice);
router.put( '/invoices/:id/cancel',      authenticate, requireRole('ADMIN', 'STAFF'), cancelInvoice);
router.post('/invoices/:id/cancel',      authenticate, requireRole('ADMIN', 'STAFF'), cancelInvoice);

router.post('/invoices/:id/send',        authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), sendInvoiceEmail);
router.get( '/invoices/:id/pdf',         authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), getInvoicePdf);

export default router;
