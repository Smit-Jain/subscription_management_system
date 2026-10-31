// ─── Catalog: Subscriptions Controller (Member B) ────────────────────────────
// Routes:
//   GET    /api/catalog/subscriptions             — list all (admin/staff)
//   POST   /api/catalog/subscriptions             — create (admin/staff)
//   GET    /api/catalog/subscriptions/:id         — get one
//   PATCH  /api/catalog/subscriptions/:id/status  — status transition
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { nextSequence, formatNumber } from '../../utils/sequence.js';

// ── Valid status transitions ──────────────────────────────────────────────────
// draft → quotation → confirmed → active → closed
// Any status → paused (if plan.pausable)
// paused → active (resume)
// active|paused → closed (early close, if plan.closableEarly)
// active|paused → active (renew, if plan.renewable — resets expiryDate)
const VALID_TRANSITIONS = {
  DRAFT:     ['QUOTATION'],
  QUOTATION: ['CONFIRMED', 'DRAFT'],
  CONFIRMED: ['ACTIVE',    'DRAFT'],
  ACTIVE:    ['CLOSED'],
  CLOSED:    [],
  PAUSED:    ['ACTIVE', 'CLOSED'],
};

// ── List subscriptions ────────────────────────────────────────────────────────
export const listSubscriptions = asyncHandler(async (req, res) => {
  const { status, planId, customerId } = req.query;

  const where = {};
  if (status)     where.status     = status.toUpperCase();
  if (planId)     where.planId     = planId;
  if (customerId) where.customerId = customerId;

  // If the request comes from a CUSTOMER role, show only their own
  if (req.user?.role === 'CUSTOMER') {
    where.customerId = req.user.id;
  }

  const subs = await prisma.subscription.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, company: true } },
      plan:     { select: { id: true, name: true, billingPeriod: true } },
      lines:    { include: { product: true, tax: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return success(res, subs.map(shapeSub), 'Subscriptions fetched');
});

// ── Get one subscription ──────────────────────────────────────────────────────
export const getSubscription = asyncHandler(async (req, res) => {
  const sub = await findSubOrFail(req.params.id);

  // Customers can only see their own
  if (req.user?.role === 'CUSTOMER' && sub.customerId !== req.user.id) {
    throw new AppError('Not found', 404);
  }

  return success(res, shapeSub(sub));
});

// ── Create subscription ───────────────────────────────────────────────────────
export const createSubscription = asyncHandler(async (req, res) => {
  const {
    customerId, planId, templateId,
    startDate, expiryDate,
    paymentTerms = 'Net 30', paymentTermsDays = 30,
    lines = [],
  } = req.body;

  // Required field validation
  if (!customerId) throw new AppError('customerId is required', 400);
  if (!planId)     throw new AppError('planId is required', 400);
  if (!startDate)  throw new AppError('startDate is required', 400);
  if (!expiryDate) throw new AppError('expiryDate is required', 400);

  const start  = new Date(startDate);
  const expiry = new Date(expiryDate);
  if (isNaN(start.getTime()))  throw new AppError('startDate is not a valid date', 400);
  if (isNaN(expiry.getTime())) throw new AppError('expiryDate is not a valid date', 400);
  if (expiry <= start)         throw new AppError('expiryDate must be after startDate', 400);

  // Validate customer exists
  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || !customer.isActive) throw new AppError('Customer not found', 404);

  // Validate plan and check minQuantity
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw new AppError('Plan not found', 404);

  const totalQty = lines.reduce((sum, l) => sum + (Number(l.qty || l.quantity) || 0), 0);
  if (totalQty < plan.minQuantity) {
    throw new AppError(`Minimum quantity for this plan is ${plan.minQuantity}`, 400);
  }

  // Validate line products
  for (const line of lines) {
    if (!line.productId) throw new AppError('Each order line must have a productId', 400);
    const prod = await prisma.product.findUnique({ where: { id: line.productId } });
    if (!prod || !prod.isActive) throw new AppError(`Product ${line.productId} not found`, 404);
  }

  const sub = await prisma.$transaction(async (tx) => {
    const seq = await nextSequence('SUB', tx);
    const number = formatNumber('SUB', seq, new Date().getFullYear());

    return tx.subscription.create({
      data: {
        number,
        customerId,
        planId,
        templateId: templateId || null,
        status:     'DRAFT',
        startDate:  start,
        expiryDate: expiry,
        paymentTerms,
        paymentTermsDays: Number(paymentTermsDays) || 30,
        createdById: req.user?.id || null,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId || null,
            quantity:  Number(l.qty || l.quantity) || 1,
            unitPrice: Number(l.unitPrice) || 0,
            taxId:     l.taxId || null,
            amount:    Number(l.amount) || (Number(l.qty || l.quantity || 1) * Number(l.unitPrice || 0)),
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, company: true } },
        plan:     { select: { id: true, name: true, billingPeriod: true } },
        lines:    { include: { product: true, tax: true } },
      },
    });
  });

  return created(res, shapeSub(sub), 'Subscription created');
});

// ── Transition subscription status ────────────────────────────────────────────
export const transitionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'Send Quotation' | 'Confirm' | 'Activate' | 'Close' | 'Pause' | 'Resume' | 'Renew'

  const raw = await findSubOrFail(id);
  const plan = await prisma.plan.findUnique({ where: { id: raw.planId } });

  const currentStatus = raw.status;  // e.g. "ACTIVE"

  let nextStatus;
  let extraData = {};

  switch (action) {
    case 'Send Quotation':
      assertTransition(currentStatus, 'QUOTATION');
      nextStatus = 'QUOTATION';
      break;

    case 'Confirm':
      assertTransition(currentStatus, 'CONFIRMED');
      nextStatus = 'CONFIRMED';
      break;

    case 'Activate':
      assertTransition(currentStatus, 'ACTIVE');
      nextStatus = 'ACTIVE';
      extraData.isPaused = false;
      // TODO(C): Trigger invoice generation here once billing module is ready
      //          Call billingEngine.createInvoiceForSubscription(sub.id, tx)
      break;

    case 'Pause':
      if (!plan?.pausable) throw new AppError('This plan does not allow pausing', 400);
      if (currentStatus !== 'ACTIVE') throw new AppError('Only active subscriptions can be paused', 400);
      nextStatus = 'ACTIVE'; // status stays ACTIVE
      extraData.isPaused = true;
      break;

    case 'Resume':
      if (!raw.isPaused) throw new AppError('Subscription is not paused', 400);
      nextStatus = 'ACTIVE';
      extraData.isPaused = false;
      break;

    case 'Renew': {
      if (!plan?.renewable) throw new AppError('This plan does not allow renewal', 400);
      if (!['ACTIVE', 'CLOSED'].includes(currentStatus)) {
        throw new AppError('Only active or closed subscriptions can be renewed', 400);
      }
      nextStatus = 'ACTIVE';
      extraData.isPaused = false;
      // Extend expiryDate by one billing period
      const currentExpiry = new Date(raw.expiryDate);
      const newExpiry = addBillingPeriod(currentExpiry, raw.plan?.billingPeriod || plan?.billingPeriod);
      extraData.expiryDate = newExpiry;
      break;
    }

    case 'Close':
      if (currentStatus === 'ACTIVE' && !plan?.closableEarly) {
        throw new AppError('This plan does not allow early closing', 400);
      }
      if (!['ACTIVE', 'CONFIRMED', 'QUOTATION', 'PAUSED'].includes(currentStatus)) {
        throw new AppError(`Cannot close a subscription in ${currentStatus} status`, 400);
      }
      nextStatus = 'CLOSED';
      break;

    default:
      throw new AppError(`Unknown action: ${action}`, 400);
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data:  {
      status: nextStatus,
      ...extraData,
    },
    include: {
      customer: { select: { id: true, name: true, email: true, company: true } },
      plan:     { select: { id: true, name: true, billingPeriod: true } },
      lines:    { include: { product: true, tax: true } },
    },
  });

  return success(res, shapeSub(updated), `Subscription ${action} successful`);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function findSubOrFail(id) {
  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, company: true } },
      plan:     { select: { id: true, name: true, billingPeriod: true, pausable: true, closableEarly: true, renewable: true } },
      lines:    { include: { product: true, tax: true } },
    },
  });
  if (!sub) throw new AppError('Subscription not found', 404);
  return sub;
}

function assertTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new AppError(
      `Cannot transition from ${from} to ${to}. Allowed: ${allowed.join(', ') || 'none'}`,
      400
    );
  }
}

function addBillingPeriod(date, period) {
  const d = new Date(date);
  switch ((period || '').toUpperCase()) {
    case 'DAILY':   d.setDate(d.getDate() + 1);     break;
    case 'WEEKLY':  d.setDate(d.getDate() + 7);     break;
    case 'MONTHLY': d.setMonth(d.getMonth() + 1);   break;
    case 'YEARLY':  d.setFullYear(d.getFullYear() + 1); break;
    default:        d.setMonth(d.getMonth() + 1);   break;
  }
  return d;
}

function shapeSub(s) {
  const total = (s.lines || []).reduce((sum, l) => sum + Number(l.amount), 0);
  return {
    id:              s.id,
    number:          s.number,
    customerId:      s.customerId,
    customerName:    s.customer?.name || '',
    planId:          s.planId,
    plan:            s.plan?.name || '',
    templateId:      s.templateId || null,
    status:          s.status.toLowerCase(),
    isPaused:        s.isPaused,
    startDate:       s.startDate.toISOString().slice(0, 10),
    expiryDate:      s.expiryDate.toISOString().slice(0, 10),
    paymentTerms:    s.paymentTerms,
    paymentTermsDays: s.paymentTermsDays,
    total:           parseFloat(total.toFixed(2)),
    createdAt:       s.createdAt.toISOString(),
    updatedAt:       s.updatedAt.toISOString(),
    lines: (s.lines || []).map((l) => ({
      id:        l.id,
      productId: l.productId,
      product:   l.product?.name || '',
      variantId: l.variantId || null,
      qty:       l.quantity,
      unitPrice: Number(l.unitPrice),
      tax:       l.tax ? Number(l.tax.percentage) : 0,
      amount:    Number(l.amount),
    })),
  };
}
