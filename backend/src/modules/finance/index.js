// ─── Finance Module Router (Owner: Member D) ──────────────────────────────────
// Mounts payments, overdue tracking, dashboard, analytics, and customer portal.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import requireRole from '../../middleware/requireRole.js';
import validate from '../../middleware/validate.js';

import {
  recordPayment,
  listPayments,
  getPayment,
} from './payments.controller.js';

import {
  listOverdueInvoices,
  sendReminder,
} from './overdue.controller.js';

import {
  getDashboardStats,
  getRevenueChart,
  getReports,
  exportReportsCsv,
} from './dashboard.controller.js';

import {
  listInvoicesForPayment,
  getInvoiceDetail,
} from './invoices.controller.js';

import {
  getCustomerSubscriptions,
  getCustomerSubscriptionDetail,
  performSubscriptionAction,
  getCustomerInvoices,
  getCustomerPayments,
  getCustomerProfile,
  updateCustomerProfile,
} from './customer.controller.js';

import {
  recordPaymentSchema,
  subscriptionActionSchema,
  updateProfileSchema,
} from './validators.js';

const router = Router();

// Module health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { module: 'finance', status: 'ok' } });
});

// ─── Payments ─────────────────────────────────────────────────────────────────
router.get(
  '/payments',
  authenticate,
  listPayments
);

router.post(
  '/payments',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  validate(recordPaymentSchema),
  recordPayment
);

router.get(
  '/payments/:id',
  authenticate,
  getPayment
);

// ─── Overdue & Chasing ────────────────────────────────────────────────────────
router.get(
  '/overdue',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  listOverdueInvoices
);

router.post(
  '/invoices/:id/send-reminder',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  sendReminder
);

// ─── Invoices Lookup (For Payment Recording & Details) ────────────────────────
router.get(
  '/invoices',
  authenticate,
  listInvoicesForPayment
);

router.get(
  '/invoices/:id',
  authenticate,
  getInvoiceDetail
);

// ─── Finance Dashboard & Reports ──────────────────────────────────────────────
router.get(
  '/dashboard/stats',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  getDashboardStats
);

router.get(
  '/dashboard/revenue-chart',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  getRevenueChart
);

router.get(
  '/reports',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  getReports
);

router.get(
  '/reports/export',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  exportReportsCsv
);

// ─── Customer Portal ──────────────────────────────────────────────────────────
router.get(
  '/customer/subscriptions',
  authenticate,
  getCustomerSubscriptions
);

router.get(
  '/customer/subscriptions/:id',
  authenticate,
  getCustomerSubscriptionDetail
);

router.patch(
  '/customer/subscriptions/:id/action',
  authenticate,
  validate(subscriptionActionSchema),
  performSubscriptionAction
);

router.get(
  '/customer/invoices',
  authenticate,
  getCustomerInvoices
);

router.get(
  '/customer/invoices/:id',
  authenticate,
  getInvoiceDetail
);

router.get(
  '/customer/payments',
  authenticate,
  getCustomerPayments
);

router.get(
  '/customer/profile',
  authenticate,
  getCustomerProfile
);

router.put(
  '/customer/profile',
  authenticate,
  validate(updateProfileSchema),
  updateCustomerProfile
);

export default router;
