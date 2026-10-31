// ─── Finance: Overdue Tracking & Chasing Controller (Member D) ───────────────
// Identifies overdue invoices, calculates days overdue, and sends reminders.
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2 } from '../../utils/money.js';
import { sendEmail, emailTemplate } from '../../utils/email.js';

/**
 * Shape an overdue invoice for frontend chasing view.
 */
export function shapeOverdueInvoice(inv) {
  const now = new Date();
  const due = new Date(inv.dueDate);
  const diffTime = now.getTime() - due.getTime();
  const daysOverdue = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const total = round2(inv.total);
  const paid  = round2(inv.amountPaid);
  const outstanding = round2(total - paid);

  return {
    id:             inv.id,
    number:         inv.number,
    customerId:     inv.customerId,
    customerName:   inv.customer?.name || 'Customer',
    customerEmail:  inv.customer?.email || '',
    customerPhone:  inv.customer?.phone || '',
    customerCompany:inv.customer?.company || '',
    subscriptionId: inv.subscriptionId,
    subscriptionNo: inv.subscription?.number || '',
    planName:       inv.subscription?.plan?.name || '',
    issueDate:      inv.issueDate.toISOString().slice(0, 10),
    dueDate:        inv.dueDate.toISOString().slice(0, 10),
    status:         'overdue',
    subtotal:       round2(inv.subtotal),
    tax:            round2(inv.taxTotal),
    discount:       round2(inv.discountTotal),
    total:          outstanding > 0 ? outstanding : total,
    originalTotal:  total,
    amountPaid:     paid,
    daysOverdue,
    sentAt:         inv.sentAt,
  };
}

/**
 * List all overdue invoices.
 * GET /api/finance/overdue
 */
export const listOverdueInvoices = asyncHandler(async (_req, res) => {
  const now = new Date();

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      dueDate: { lt: now },
      status:  { notIn: ['PAID', 'CANCELLED'] },
    },
    include: {
      customer:     { select: { id: true, name: true, email: true, phone: true, company: true } },
      subscription: { include: { plan: { select: { name: true } } } },
    },
    orderBy: { dueDate: 'asc' },
  });

  const shaped = overdueInvoices.map(shapeOverdueInvoice);
  return success(res, shaped, 'Overdue invoices fetched');
});

/**
 * Send payment reminder email for an overdue invoice.
 * POST /api/finance/invoices/:id/send-reminder
 */
export const sendReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer:     { select: { id: true, name: true, email: true } },
      subscription: { select: { number: true } },
    },
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  const outstanding = round2(round2(invoice.total) - round2(invoice.amountPaid));
  const customerEmail = invoice.customer?.email;

  if (!customerEmail) {
    throw new AppError('Customer has no registered email', 400);
  }

  const dueDateFormatted = invoice.dueDate.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  // Construct reminder email
  const html = emailTemplate(
    'Payment Reminder — Brightloop Software',
    `
    <p>Dear ${invoice.customer?.name || 'Valued Customer'},</p>
    <p>This is a friendly reminder that payment for invoice <strong>${invoice.number}</strong> was due on <strong>${dueDateFormatted}</strong> and is currently outstanding.</p>
    
    <div style="background-color: #F8F5EE; border: 1px solid #EADFCB; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Invoice:</strong> ${invoice.number}</p>
      <p style="margin: 4px 0;"><strong>Due Date:</strong> ${dueDateFormatted}</p>
      <p style="margin: 4px 0; font-size: 18px; color: #E05A47;"><strong>Outstanding Balance:</strong> ₹${outstanding.toLocaleString('en-IN')}</p>
    </div>

    <p>Please make the payment as soon as possible to avoid any interruption to your subscription services.</p>
    <p>If you have already processed this payment, please disregard this notice.</p>
    <br/>
    <p>Best regards,<br/><strong>Brightloop Finance Team</strong></p>
    `
  );

  await sendEmail({
    to:      customerEmail,
    subject: `Payment Reminder: Invoice ${invoice.number} is overdue`,
    html,
  });

  // Update sent timestamp
  await prisma.invoice.update({
    where: { id: invoice.id },
    data:  { sentAt: new Date() },
  });

  return success(res, { success: true }, `Reminder sent successfully to ${customerEmail}`);
});

