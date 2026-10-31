// ─── Finance: Invoices Helper Controller (Member D) ──────────────────────────
// Provides invoice lookup for recording payments and invoice details.
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2 } from '../../utils/money.js';
import { assertOwnerOrStaff } from '../../middleware/ownership.js';

export function shapeInvoice(inv) {
  const total = round2(inv.total);
  const paid  = round2(inv.amountPaid);
  const remaining = round2(total - paid);
  const now = new Date();
  const isOverdue = inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueDate) < now;

  let displayStatus = inv.status.toLowerCase();
  if (isOverdue) displayStatus = 'overdue';
  else if (displayStatus === 'confirmed') displayStatus = 'pending';

  return {
    id:                 inv.id,
    number:             inv.number,
    subscriptionId:     inv.subscriptionId,
    subscriptionNumber: inv.subscription?.number || '',
    customerId:         inv.customerId,
    customerName:       inv.customer?.name || 'Customer',
    issueDate:          inv.issueDate ? inv.issueDate.toISOString().slice(0, 10) : '',
    dueDate:            inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : '',
    subtotal:           round2(inv.subtotal),
    tax:                round2(inv.taxTotal),
    discount:           round2(inv.discountTotal),
    total,
    amountPaid:         paid,
    remainingBalance:   remaining > 0 ? remaining : 0,
    status:             displayStatus,
    rawStatus:          inv.status,
    notes:              inv.notes || '',
    lines: (inv.lines || []).map((l) => ({
      id:          l.id,
      product:     l.description || l.product?.name || 'Service',
      qty:         l.quantity,
      unitPrice:   round2(l.unitPrice),
      taxPercent:  round2(l.taxPercent),
      amount:      round2(l.amount),
    })),
  };
}

/**
 * List invoices available for payment recording.
 * GET /api/finance/invoices
 */
export const listInvoicesForPayment = asyncHandler(async (req, res) => {
  const { status, customerId } = req.query;

  const where = {};
  if (req.user?.role === 'CUSTOMER') {
    where.customerId = req.user.id;
  } else if (customerId) {
    where.customerId = customerId;
  }

  if (status) {
    where.status = status.toUpperCase();
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      customer:     { select: { id: true, name: true, email: true } },
      subscription: { select: { id: true, number: true, plan: { select: { name: true } } } },
      lines:        { include: { product: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return success(res, invoices.map(shapeInvoice), 'Invoices fetched');
});

/**
 * Get single invoice with full line items.
 * GET /api/finance/invoices/:id
 */
export const getInvoiceDetail = asyncHandler(async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: {
      customer:     { select: { id: true, name: true, email: true, company: true, phone: true } },
      subscription: { select: { id: true, number: true, plan: { select: { name: true } } } },
      lines:        { include: { product: true } },
      payments:     true,
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (req.user?.role === 'CUSTOMER') {
    assertOwnerOrStaff(req, invoice.customerId);
  }

  return success(res, shapeInvoice(invoice), 'Invoice fetched');
});

