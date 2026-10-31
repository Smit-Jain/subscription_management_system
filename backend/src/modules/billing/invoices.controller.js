// ─── Invoices Controller (Member C) ───────────────────────────────────────────
// Routes:
//   GET    /api/billing/invoices             — list invoices (filtered, paginated, role-scoped)
//   GET    /api/billing/invoices/:id         — get one invoice with lines and payments
//   POST   /api/billing/invoices/generate    — trigger recurring billing run (Admin/Staff)
//   POST   /api/billing/invoices             — generate single invoice for subscription
//   PUT    /api/billing/invoices/:id/confirm — mark DRAFT as CONFIRMED
//   PUT    /api/billing/invoices/:id/cancel  — mark DRAFT/CONFIRMED as CANCELLED
//   POST   /api/billing/invoices/:id/send    — email invoice to customer
//   GET    /api/billing/invoices/:id/pdf     — download / print invoice HTML/PDF
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import { parsePagination, paginated } from '../../utils/pagination.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2 } from '../../utils/money.js';
import { scopeToCustomer, assertOwnerOrStaff } from '../../middleware/ownership.js';
import { generateInvoiceForPeriod, addBillingPeriod, toUtcMidnight } from './billing.engine.js';
import { executeScheduledBillingRun } from './scheduler.js';
import { sendEmail, emailTemplate } from '../../utils/email.js';
import { generateInvoiceHtml } from './pdf.js';

export function shapeInvoice(inv) {
  const isOverdue =
    inv.status !== 'PAID' &&
    inv.status !== 'CANCELLED' &&
    new Date(inv.dueDate) < new Date();

  const displayStatus = isOverdue ? 'overdue' : inv.status.toLowerCase();

  return {
    id: inv.id,
    number: inv.number,
    customerId: inv.customerId,
    customerName: inv.customer?.name || '',
    customerEmail: inv.customer?.email || '',
    subscriptionId: inv.subscriptionId,
    subscriptionNumber: inv.subscription?.number || '',
    issueDate: inv.issueDate.toISOString().slice(0, 10),
    dueDate: inv.dueDate.toISOString().slice(0, 10),
    billingPeriodStart: inv.billingPeriodStart.toISOString().slice(0, 10),
    billingPeriodEnd: inv.billingPeriodEnd.toISOString().slice(0, 10),
    status: displayStatus,
    rawStatus: inv.status,
    subtotal: round2(inv.subtotal),
    tax: round2(inv.taxTotal),
    taxTotal: round2(inv.taxTotal),
    discount: round2(inv.discountTotal),
    discountTotal: round2(inv.discountTotal),
    total: round2(inv.total),
    amountPaid: round2(inv.amountPaid),
    outstanding: round2(Math.max(0, Number(inv.total) - Number(inv.amountPaid))),
    notes: inv.notes || '',
    sentAt: inv.sentAt ? inv.sentAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
    lines: (inv.lines || []).map((l) => ({
      id: l.id,
      productId: l.productId,
      product: l.description,
      description: l.description,
      qty: l.quantity,
      quantity: l.quantity,
      unitPrice: round2(l.unitPrice),
      tax: round2(l.taxPercent),
      taxPercent: round2(l.taxPercent),
      taxAmount: round2(l.taxAmount),
      discountAmount: round2(l.discountAmount),
      amount: round2(l.amount),
    })),
    discounts: (inv.invoiceDiscounts || []).map((id) => ({
      id: id.discountId,
      name: id.discount?.name || 'Discount',
      amount: round2(id.amount),
    })),
    payments: (inv.payments || []).map((p) => ({
      id: p.id,
      amount: round2(p.amount),
      method: p.method,
      paidAt: p.paidAt.toISOString(),
      note: p.note || '',
    })),
  };
}

// ── List Invoices ─────────────────────────────────────────────────────────────
export const listInvoices = asyncHandler(async (req, res) => {
  const { status, customerId, subscriptionId, dateFrom, dateTo, search, page, limit } = req.query;

  const where = {
    ...scopeToCustomer(req),
  };

  if (customerId && !where.customerId) {
    where.customerId = customerId;
  }
  if (subscriptionId) {
    where.subscriptionId = subscriptionId;
  }

  // Handle derived "overdue" vs raw database status
  if (status) {
    const s = status.toUpperCase();
    if (s === 'OVERDUE') {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['PAID', 'CANCELLED'] };
    } else {
      where.status = s;
    }
  }

  if (dateFrom || dateTo) {
    where.issueDate = {};
    if (dateFrom) where.issueDate.gte = new Date(dateFrom);
    if (dateTo)   where.issueDate.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const pagination = parsePagination(req.query);

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        subscription: { select: { id: true, number: true } },
        lines: true,
        invoiceDiscounts: { include: { discount: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ]);

  const shaped = invoices.map(shapeInvoice);

  // If the client requested pagination query, return paginated envelope;
  // otherwise return direct array for frontend DataTable compatibility
  if (page || limit) {
    return success(res, paginated(shaped, total, pagination.page, pagination.limit));
  }
  return success(res, shaped, 'Invoices fetched');
});

// ── Get Single Invoice ────────────────────────────────────────────────────────
export const getInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, company: true } },
      subscription: { select: { id: true, number: true, plan: true } },
      lines: { include: { product: true } },
      invoiceDiscounts: { include: { discount: true } },
      payments: { include: { recordedBy: { select: { id: true, name: true } } } },
    },
  });

  if (!invoice) throw new AppError('Invoice not found', 404);

  assertOwnerOrStaff(req, invoice.customerId);

  return success(res, shapeInvoice(invoice));
});

// ── Trigger Recurring Billing Generation ──────────────────────────────────────
export const triggerInvoiceGeneration = asyncHandler(async (req, res) => {
  const result = await executeScheduledBillingRun('MANUAL');
  return success(res, {
    generated: result.invoicesGenerated || 0,
    subscriptionsProcessed: result.subscriptionsProcessed || 0,
    failedSubscriptions: result.failedSubscriptions || [],
    durationMs: result.durationMs,
  }, `Generated ${result.invoicesGenerated || 0} new invoice(s).`);
});

// ── Create Single Manual Invoice for Subscription ─────────────────────────────
export const createManualInvoice = asyncHandler(async (req, res) => {
  const { subscriptionId, issueDate, dueDate, notes } = req.body;

  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!sub) throw new AppError('Subscription not found', 404);

  // Determine period boundaries
  let pStart;
  if (sub.nextBillingDate) {
    pStart = toUtcMidnight(sub.nextBillingDate);
  } else if (sub.lastBilledThrough) {
    pStart = toUtcMidnight(addBillingPeriod(sub.lastBilledThrough, sub.plan.billingPeriod));
  } else {
    pStart = toUtcMidnight(sub.startDate);
  }

  const pNext = addBillingPeriod(pStart, sub.plan.billingPeriod);
  const pEnd = new Date(pNext.getTime() - 24 * 60 * 60 * 1000);

  const { invoice, isDuplicate } = await generateInvoiceForPeriod(
    subscriptionId,
    pStart,
    pEnd,
    { issueDate, dueDate, notes, force: true }
  );

  if (isDuplicate) {
    return success(res, shapeInvoice(invoice), 'Invoice for this billing period already exists');
  }

  return created(res, shapeInvoice(invoice), 'Invoice generated');
});

// ── Confirm Invoice ───────────────────────────────────────────────────────────
export const confirmInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) throw new AppError('Invoice not found', 404);

  if (invoice.status !== 'DRAFT') {
    throw new AppError(`Cannot confirm invoice in ${invoice.status} status`, 400);
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'CONFIRMED' },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      subscription: { select: { id: true, number: true } },
      lines: true,
      invoiceDiscounts: { include: { discount: true } },
    },
  });

  return success(res, shapeInvoice(updated), 'Invoice confirmed');
});

// ── Cancel Invoice ────────────────────────────────────────────────────────────
export const cancelInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) throw new AppError('Invoice not found', 404);

  if (invoice.status === 'PAID') {
    throw new AppError('Cannot cancel a paid invoice', 400);
  }
  if (invoice.status === 'CANCELLED') {
    throw new AppError('Invoice is already cancelled', 400);
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      subscription: { select: { id: true, number: true } },
      lines: true,
      invoiceDiscounts: { include: { discount: true } },
    },
  });

  return success(res, shapeInvoice(updated), 'Invoice cancelled');
});

// ── Send Invoice via Email ────────────────────────────────────────────────────
export const sendInvoiceEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      subscription: true,
      lines: true,
    },
  });

  if (!invoice) throw new AppError('Invoice not found', 404);
  assertOwnerOrStaff(req, invoice.customerId);

  const shaped = shapeInvoice(invoice);

  const bodyHtml = `
    <p>Dear ${shaped.customerName},</p>
    <p>Please find your invoice <strong>#${shaped.number}</strong> for the amount of <strong>₹${Number(shaped.total).toFixed(2)}</strong>.</p>
    <div style="background:#FBF6EC;padding:16px;border-radius:8px;margin:20px 0;border:1px solid #EADFCB;">
      <p style="margin:4px 0;"><strong>Invoice Number:</strong> ${shaped.number}</p>
      <p style="margin:4px 0;"><strong>Issue Date:</strong> ${shaped.issueDate}</p>
      <p style="margin:4px 0;"><strong>Due Date:</strong> ${shaped.dueDate}</p>
      <p style="margin:4px 0;"><strong>Total Amount:</strong> ₹${Number(shaped.total).toFixed(2)}</p>
      <p style="margin:4px 0;"><strong>Status:</strong> ${shaped.status.toUpperCase()}</p>
    </div>
    <p>Please complete payment on or before ${shaped.dueDate}.</p>
  `;

  await sendEmail({
    to: invoice.customer.email,
    subject: `Brightloop Invoice #${shaped.number}`,
    html: emailTemplate(`Invoice #${shaped.number}`, bodyHtml),
  });

  await prisma.invoice.update({
    where: { id },
    data: { sentAt: new Date() },
  });

  return success(res, { sent: true, recipient: invoice.customer.email }, `Invoice sent to ${invoice.customer.email}`);
});

// ── Download / View Invoice PDF ───────────────────────────────────────────────
export const getInvoicePdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      subscription: true,
      lines: true,
      invoiceDiscounts: { include: { discount: true } },
    },
  });

  if (!invoice) throw new AppError('Invoice not found', 404);
  assertOwnerOrStaff(req, invoice.customerId);

  const shaped = shapeInvoice(invoice);
  const html = generateInvoiceHtml(shaped);

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});
