// ─── Finance Seed (Owner: Member D) ──────────────────────────────────────────
// Seeds: Invoices and Payments linked to Member B's subscriptions and Member A's customers.
// Idempotent — safe to re-run.
// ─────────────────────────────────────────────────────────────────────────────
import { round2 } from '../../src/utils/money.js';

export default async function seedFinance(prisma) {
  console.log('  Seeding invoices & payments…');

  const paymentCount = await prisma.payment.count();
  if (paymentCount > 0) {
    console.log(`    ⏭️  Payments already seeded (${paymentCount} exist)`);
    return;
  }

  // Get existing subscriptions
  const subscriptions = await prisma.subscription.findMany({
    include: {
      customer: true,
      plan:     true,
      lines:    { include: { product: true } },
    },
    take: 10,
  });

  if (subscriptions.length === 0) {
    console.log('    ⚠️  No subscriptions found — skipping invoice/payment seed. Run catalog seed first.');
    return;
  }

  // Admin user for recordedById
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  let invSeq = 0;
  const createdInvoices = [];

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    invSeq++;
    const number = `INV-2024-${String(invSeq).padStart(4, '0')}`;

    // Calculate line amounts
    let subtotal = 0;
    const lines = sub.lines.map((sl) => {
      const lineSubtotal = Number(sl.quantity) * Number(sl.unitPrice);
      subtotal += lineSubtotal;
      return {
        productId:   sl.productId,
        description: sl.product?.name || 'Subscription Services',
        quantity:    sl.quantity,
        unitPrice:   sl.unitPrice,
        taxPercent:  18,
        taxAmount:   round2(lineSubtotal * 0.18),
        amount:      round2(lineSubtotal),
      };
    });

    if (subtotal === 0) subtotal = 25000;
    const taxTotal = round2(subtotal * 0.18);
    const total = round2(subtotal + taxTotal);

    // Determine status & dates based on index
    let status = 'PAID';
    let amountPaid = total;
    let issueDate = new Date('2024-01-15');
    let dueDate   = new Date('2024-02-14');

    if (i === 2 || i === 7) {
      // Overdue invoice (past due date, unpaid)
      status = 'CONFIRMED';
      amountPaid = 0;
      issueDate = new Date('2024-04-10');
      dueDate   = new Date('2024-05-10');
    } else if (i === 3) {
      // Pending invoice (future due date)
      status = 'CONFIRMED';
      amountPaid = 0;
      issueDate = new Date();
      dueDate   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (i === 4) {
      // Partial payment
      status = 'CONFIRMED';
      amountPaid = round2(total / 2);
      issueDate = new Date('2024-06-15');
      dueDate   = new Date('2024-07-30');
    }

    const invoice = await prisma.invoice.create({
      data: {
        number,
        subscriptionId:     sub.id,
        customerId:         sub.customerId,
        status,
        billingPeriodStart: sub.startDate,
        billingPeriodEnd:   sub.expiryDate,
        issueDate,
        dueDate,
        subtotal,
        taxTotal,
        discountTotal:      0,
        total,
        amountPaid,
        lines: { create: lines },
      },
    });

    createdInvoices.push({ invoice, status, amountPaid, customer: sub.customer });
    console.log(`    ✅ Invoice: ${number} (${sub.customer.name} / ₹${total}) [${status}]`);
  }

  // Update counter for invoice sequence
  await prisma.counter.upsert({
    where:  { key: 'INV' },
    create: { key: 'INV', value: invSeq },
    update: { value: invSeq },
  });

  // Seed payments for paid and partial invoices
  const methods = ['BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'CASH'];
  let payIndex = 0;

  for (const item of createdInvoices) {
    if (item.amountPaid > 0) {
      payIndex++;
      const method = methods[payIndex % methods.length];
      const paidAt = new Date(item.invoice.issueDate.getTime() + 10 * 24 * 60 * 60 * 1000);

      await prisma.payment.create({
        data: {
          invoiceId:    item.invoice.id,
          amount:       item.amountPaid,
          method,
          paidAt,
          note:         `Payment via ${method.replace('_', ' ')}`,
          recordedById: admin?.id || null,
        },
      });

      console.log(`    ✅ Payment: ₹${item.amountPaid} for ${item.invoice.number} via ${method}`);
    }
  }

  console.log('  ✅ Finance seed complete');
}
