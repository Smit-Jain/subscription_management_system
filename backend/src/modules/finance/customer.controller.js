// ─── Finance: Customer Portal Controller (Member D) ──────────────────────────
// Customer-scoped endpoints for viewing subscriptions, invoices, payment history,
// updating profile, and performing plan-permitted subscription actions.
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2 } from '../../utils/money.js';
import { shapeInvoice } from './invoices.controller.js';
import { shapePayment } from './payments.controller.js';

/**
 * Shape subscription for customer portal.
 */
function shapeCustomerSub(sub) {
  const plan = sub.plan || {};
  const total = sub.lines.reduce((s, l) => s + Number(l.amount), 0);
  const isPaused = Boolean(sub.isPaused);
  const statusStr = sub.status.toLowerCase();

  let displayStatus = statusStr;
  if (isPaused) displayStatus = 'paused';

  return {
    id:           sub.id,
    number:       sub.number,
    plan:         plan.name || 'Standard',
    planId:       sub.planId,
    status:       displayStatus,
    isPaused,
    startDate:    sub.startDate.toISOString().slice(0, 10),
    expiryDate:   sub.expiryDate.toISOString().slice(0, 10),
    paymentTerms: sub.paymentTerms,
    total:        round2(total),
    templateId:   sub.templateId,
    planConfig: {
      pausable:      plan.pausable,
      closableEarly: plan.closableEarly,
      renewable:     plan.renewable,
      billingPeriod: plan.billingPeriod,
    },
    lines: (sub.lines || []).map((l) => ({
      id:        l.id,
      product:   l.product?.name || l.description || 'Service',
      qty:       l.quantity,
      unitPrice: round2(l.unitPrice),
      amount:    round2(l.amount),
    })),
  };
}

/**
 * Get customer's subscriptions.
 * GET /api/finance/customer/subscriptions
 */
export const getCustomerSubscriptions = asyncHandler(async (req, res) => {
  const customerId = req.query.customerId || req.user?.id;

  if (!customerId) {
    throw new AppError('Customer ID required', 400);
  }

  const subs = await prisma.subscription.findMany({
    where: { customerId },
    include: {
      plan:  true,
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return success(res, subs.map(shapeCustomerSub), 'Customer subscriptions fetched');
});

/**
 * Get single customer subscription detail.
 * GET /api/finance/customer/subscriptions/:id
 */
export const getCustomerSubscriptionDetail = asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.findUnique({
    where: { id: req.params.id },
    include: {
      plan:     true,
      lines:    { include: { product: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!sub) {
    throw new AppError('Subscription not found', 404);
  }

  // Security check: Customer can only view their own
  if (req.user?.role === 'CUSTOMER' && sub.customerId !== req.user.id) {
    throw new AppError('You do not have access to this subscription', 403);
  }

  return success(res, shapeCustomerSub(sub), 'Subscription details fetched');
});

/**
 * Perform plan-allowed action on subscription (Pause / Resume / Renew / Close).
 * PATCH /api/finance/customer/subscriptions/:id/action
 */
export const performSubscriptionAction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const actionRaw = req.body.action || '';
  const action = actionRaw.charAt(0).toUpperCase() + actionRaw.slice(1).toLowerCase();

  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: { plan: true },
  });

  if (!sub) {
    throw new AppError('Subscription not found', 404);
  }

  if (req.user?.role === 'CUSTOMER' && sub.customerId !== req.user.id) {
    throw new AppError('You do not have permission to modify this subscription', 403);
  }

  const plan = sub.plan;
  const updates = {};

  switch (action) {
    case 'Pause':
      if (!plan.pausable) {
        throw new AppError('This plan does not permit pausing', 400);
      }
      if (sub.status !== 'ACTIVE') {
        throw new AppError('Only active subscriptions can be paused', 400);
      }
      updates.isPaused = true;
      break;

    case 'Resume':
      if (!plan.pausable) {
        throw new AppError('This plan does not permit pausing/resuming', 400);
      }
      if (!sub.isPaused) {
        throw new AppError('Subscription is not paused', 400);
      }
      updates.isPaused = false;
      updates.status = 'ACTIVE';
      break;

    case 'Renew':
      if (!plan.renewable) {
        throw new AppError('This plan does not permit manual renewal', 400);
      }
      // Extend expiry date by 1 year / 1 month depending on period
      const newExpiry = new Date(sub.expiryDate);
      if (plan.billingPeriod === 'YEARLY') {
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      } else {
        newExpiry.setMonth(newExpiry.getMonth() + 1);
      }
      updates.expiryDate = newExpiry;
      updates.status     = 'ACTIVE';
      updates.isPaused   = false;
      break;

    case 'Close':
      if (!plan.closableEarly) {
        throw new AppError('This plan does not permit early closure', 400);
      }
      updates.status   = 'CLOSED';
      updates.isPaused = false;
      break;

    default:
      throw new AppError(`Unsupported action: ${action}`, 400);
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data:  updates,
    include: { plan: true, lines: { include: { product: true } } },
  });

  return success(res, shapeCustomerSub(updated), `Subscription ${action.toLowerCase()}d successfully`);
});

/**
 * Get customer's invoices.
 * GET /api/finance/customer/invoices
 */
export const getCustomerInvoices = asyncHandler(async (req, res) => {
  const customerId = req.query.customerId || req.user?.id;

  if (!customerId) {
    throw new AppError('Customer ID required', 400);
  }

  const invoices = await prisma.invoice.findMany({
    where: { customerId },
    include: {
      customer:     { select: { id: true, name: true, email: true } },
      subscription: { select: { id: true, number: true, plan: { select: { name: true } } } },
      lines:        { include: { product: true } },
    },
    orderBy: { issueDate: 'desc' },
  });

  return success(res, invoices.map(shapeInvoice), 'Customer invoices fetched');
});

/**
 * Get customer's payments.
 * GET /api/finance/customer/payments
 */
export const getCustomerPayments = asyncHandler(async (req, res) => {
  const customerId = req.query.customerId || req.user?.id;

  if (!customerId) {
    throw new AppError('Customer ID required', 400);
  }

  const payments = await prisma.payment.findMany({
    where: {
      invoice: { customerId },
    },
    include: {
      invoice: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  });

  return success(res, payments.map(shapePayment), 'Customer payments fetched');
});

/**
 * Get customer profile.
 * GET /api/finance/customer/profile
 */
export const getCustomerProfile = asyncHandler(async (req, res) => {
  const customerId = req.query.customerId || req.user?.id;

  if (!customerId) {
    throw new AppError('Customer ID required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id:        true,
      name:      true,
      email:     true,
      phone:     true,
      company:   true,
      createdAt: true,
      subscriptionsAsCustomer: {
        where:   { status: 'ACTIVE' },
        include: { plan: true },
        take:    1,
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const activeSub = user.subscriptionsAsCustomer[0];

  return success(res, {
    id:      user.id,
    name:    user.name,
    email:   user.email,
    phone:   user.phone || '',
    company: user.company || '',
    address: '12 MG Road, Bengaluru 560001',
    plan:    activeSub?.plan?.name || 'Growth',
    joined:  user.createdAt.toISOString().slice(0, 10),
  }, 'Profile fetched');
});

/**
 * Update customer profile.
 * PUT /api/finance/customer/profile
 */
export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.body.id;

  if (!customerId) {
    throw new AppError('Authentication required', 401);
  }

  const { name, phone, company } = req.body;

  const updated = await prisma.user.update({
    where: { id: customerId },
    data: {
      name:    name || undefined,
      phone:   phone || undefined,
      company: company || undefined,
    },
    select: {
      id:      true,
      name:    true,
      email:   true,
      phone:   true,
      company: true,
    },
  });

  return success(res, updated, 'Profile updated successfully');
});

