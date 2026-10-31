// ─── Catalog Module Router (Owner: Member B) ─────────────────────────────────
// All routes mounted under /api/catalog by routes/index.js
// Auth gates:
//   Admin only  — create/update/delete products, plans
//   Admin+Staff — create templates, subscriptions; read all
//   Customer    — read only their own subscriptions
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import requireRole  from '../../middleware/requireRole.js';

import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} from './products.controller.js';

import {
  listPlans, getPlan, createPlan, updatePlan,
} from './plans.controller.js';

import {
  listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
} from './templates.controller.js';

import {
  listSubscriptions, getSubscription, createSubscription, transitionStatus,
} from './subscriptions.controller.js';

import {
  listCustomers, getCustomer,
} from './customers.controller.js';

const router = Router();

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) =>
  res.json({ success: true, data: { module: 'catalog', status: 'ok' } })
);

// ── Products ──────────────────────────────────────────────────────────────────
router.get(   '/products',     authenticate, requireRole('ADMIN', 'STAFF'), listProducts);
router.get(   '/products/:id', authenticate, requireRole('ADMIN', 'STAFF'), getProduct);
router.post(  '/products',     authenticate, requireRole('ADMIN'),          createProduct);
router.put(   '/products/:id', authenticate, requireRole('ADMIN'),          updateProduct);
router.delete('/products/:id', authenticate, requireRole('ADMIN'),          deleteProduct);

// ── Plans ─────────────────────────────────────────────────────────────────────
router.get( '/plans',     authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), listPlans);
router.get( '/plans/:id', authenticate, requireRole('ADMIN', 'STAFF'),             getPlan);
router.post('/plans',     authenticate, requireRole('ADMIN'),                      createPlan);
router.put( '/plans/:id', authenticate, requireRole('ADMIN'),                      updatePlan);

// ── Quotation Templates ───────────────────────────────────────────────────────
router.get(   '/templates',     authenticate, requireRole('ADMIN', 'STAFF'), listTemplates);
router.get(   '/templates/:id', authenticate, requireRole('ADMIN', 'STAFF'), getTemplate);
router.post(  '/templates',     authenticate, requireRole('ADMIN', 'STAFF'), createTemplate);
router.put(   '/templates/:id', authenticate, requireRole('ADMIN', 'STAFF'), updateTemplate);
router.delete('/templates/:id', authenticate, requireRole('ADMIN'),          deleteTemplate);

// ── Subscriptions ─────────────────────────────────────────────────────────────
router.get( '/subscriptions',                authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), listSubscriptions);
router.get( '/subscriptions/:id',            authenticate, requireRole('ADMIN', 'STAFF', 'CUSTOMER'), getSubscription);
router.post('/subscriptions',                authenticate, requireRole('ADMIN', 'STAFF'),             createSubscription);
router.patch('/subscriptions/:id/status',    authenticate, requireRole('ADMIN', 'STAFF'),             transitionStatus);

// ── Customers (read-only here — full CRUD is Member A's) ─────────────────────
router.get('/customers',     authenticate, requireRole('ADMIN', 'STAFF'), listCustomers);
router.get('/customers/:id', authenticate, requireRole('ADMIN', 'STAFF'), getCustomer);

export default router;
