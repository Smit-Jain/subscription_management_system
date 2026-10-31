// ─── Finance: Payments Controller (Member D) ──────────────────────────────────
// Handles recording payments against invoices, partial payments, payment listing
// and status updates for invoices.
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2, add, subtract } from '../../utils/money.js';
import { parsePagination, paginated } from '../../utils/pagination.js';
import { isStaffOrAdmin, assertOwnerOrStaff } from '../../middleware/ownership.js';

// Map human-readable frontend method to DB enum
const METHOD_MAP_TO_DB = {
  'Cash':          'CASH',
  'Credit Card':   'CARD',
  'Card':          'CARD',
  'Bank Transfer': 'BANK_TRANSFER',
  'UPI':           'UPI',
  'Cheque':        'CHEQUE',
  'Other':         'OTHER',
  'CASH':          'CASH',
  'CARD':          'CARD',
  'BANK_TRANSFER': 'BANK_TRANSFER',
  'CHEQUE':        'CHEQUE',
  'OTHER':         'OTHER',
};

// Map DB enum to frontend label
const METHOD_MAP_TO_FRONTEND = {
  CASH:          'Cash',
  CARD:          'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  UPI:           'UPI',
  CHEQUE:        'Cheque',
  OTHER:         'Other',
};

/**
 * Shape a database payment record for frontend consistency.
 */
export function shapePayment(p) {
  const inv = p.invoice || {};
  const cust = inv.customer || {};

  return {
    id:            p.id,
    invoiceId:     p.invoiceId,
    invoiceNumber: inv.number || '',
    customerId:    cust.id || inv.customerId || '',
    customerName:  cust.name || 'Unknown Customer',
    amount:        round2(p.amount),
    method:        METHOD_MAP_TO_FRONTEND[p.method] || p.method,
    date:          p.paidAt ? p.paidAt.toISOString().slice(0, 10) : '',
    note:          p.note || '',
    status:        'completed',
    createdAt:     p.createdAt,
  };
}

/**
 * Record a new payment against an invoice.
 * POST /api/finance/payments
 */
export const recordPayment = asyncHandler(async (req, res) => {
  const { invoiceId, amount, method, paidAt, date, note } = req.body;

  const paymentAmount = round2(Number(amount));
  if (paymentAmount <= 0) {
    throw new AppError('Payment amount must be greater than 0', 400);
  }

  // Find invoice
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (invoice.status === 'PAID') {
    throw new AppError('This invoice has already been fully paid', 400);
  }

  if (invoice.status === 'CANCELLED') {
    throw new AppError('Cannot record payment on a cancelled invoice', 400);
  }

  const invoiceTotal = round2(invoice.total);
  const currentPaid  = round2(invoice.amountPaid);
  const remaining    = round2(invoiceTotal - currentPaid);

  if (paymentAmount > remaining + 0.01) {
    throw new AppError(
      `Payment amount (₹${paymentAmount}) exceeds outstanding balance (₹${remaining})`,
      400
    );
  }

  const dbMethod = METHOD_MAP_TO_DB[method] || 'BANK_TRANSFER';
  const paymentDate = paidAt ? new Date(paidAt) : (date ? new Date(date) : new Date());

  // Execute in transaction: create payment & update invoice
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId:    invoice.id,
        amount:       paymentAmount,
        method:       dbMethod,
        paidAt:       paymentDate,
        note:         note || null,
        recordedById: req.user?.id || null,
      },
      include: {
        invoice: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const newAmountPaid = add(currentPaid, paymentAmount);
    const isFullyPaid = newAmountPaid >= invoiceTotal - 0.01;

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        status:     isFullyPaid ? 'PAID' : (invoice.status === 'DRAFT' ? 'CONFIRMED' : invoice.status),
      },
    });

    return payment;
  });

  return created(res, shapePayment(result), 'Payment recorded successfully');
});

/**
 * List all payments with filtering and pagination.
 * GET /api/finance/payments
 */
export const listPayments = asyncHandler(async (req, res) => {
  const { invoiceId, customerId, method, dateFrom, dateTo } = req.query;
  const { skip, take, page, limit } = parsePagination(req.query);

  const where = {};

  if (invoiceId) where.invoiceId = invoiceId;

  // Role check: customer can only see payments for their own invoices
  if (req.user?.role === 'CUSTOMER') {
    where.invoice = { customerId: req.user.id };
  } else if (customerId) {
    where.invoice = { customerId };
  }

  if (method) {
    const dbMethod = METHOD_MAP_TO_DB[method];
    if (dbMethod) where.method = dbMethod;
  }

  if (dateFrom || dateTo) {
    where.paidAt = {};
    if (dateFrom) where.paidAt.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      where.paidAt.lte = to;
    }
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      skip,
      take,
    }),
    prisma.payment.count({ where }),
  ]);

  const shaped = payments.map(shapePayment);

  // If unpaginated request, return array directly for frontend backward-compatibility
  if (!req.query.page && !req.query.limit) {
    return success(res, shaped, 'Payments fetched');
  }

  return success(res, paginated(shaped, total, page, limit), 'Payments fetched');
});

/**
 * Get single payment details.
 * GET /api/finance/payments/:id
 */
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: {
      invoice: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (req.user?.role === 'CUSTOMER') {
    assertOwnerOrStaff(req, payment.invoice.customerId);
  }

  return success(res, shapePayment(payment), 'Payment fetched');
});

