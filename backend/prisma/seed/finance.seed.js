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

  // Admin user for recordedById
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  // Check if invoices already exist (e.g., from Member C or prior run)
  const existingInvoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      subscription: true,
      payments: true,
    },
  });

  const methods = ['BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'CASH'];

  if (existingInvoices.length > 0) {
    console.log(`    Found ${existingInvoices.length} existing invoices. Seeding payments…`);
    let payIndex = 0;

    for (let i = 0; i < existingInvoices.length; i++) {
      const inv = existingInvoices[i];
      if (inv.payments && inv.payments.length > 0) continue;

      // Seed payments for some invoices to create a realistic mix of Paid, Partial, and Overdue
      if (i % 3 === 0) {
        // Full payment
        payIndex++;
        const method = methods[payIndex % methods.length];
        const payAmount = round2(inv.total);
        const paidAt = new Date(inv.issueDate.getTime() + 5 * 24 * 60 * 60 * 1000);

        await prisma.payment.create({
          data: {
            invoiceId:    inv.id,
            amount:       payAmount,
            method,
            paidAt,
            note:         `Payment via ${method.replace('_', ' ')}`,
            recordedById: admin?.id || null,
          },
        });

        await prisma.invoice.update({
          where: { id: inv.id },
          data:  { amountPaid: payAmount, status: 'PAID' },
        });

        console.log(`    ✅ Payment: ₹${payAmount} for ${inv.number} (Full / PAID)`);
      } else if (i % 3 === 1) {
        // Partial payment
        payIndex++;
        const method = methods[payIndex % methods.length];
        const payAmount = round2(Number(inv.total) / 2);
        const paidAt = new Date(inv.issueDate.getTime() + 8 * 24 * 60 * 60 * 1000);

        await prisma.payment.create({
          data: {
            invoiceId:    inv.id,
            amount:       payAmount,
            method,
            paidAt,
            note:         `Partial payment via ${method.replace('_', ' ')}`,
            recordedById: admin?.id || null,
          },
        });

        await prisma.invoice.update({
          where: { id: inv.id },
          data:  { amountPaid: payAmount, status: 'CONFIRMED' },
        });

        console.log(`    ✅ Payment: ₹${payAmount} for ${inv.number} (Partial / CONFIRMED)`);
      }
      // i % 3 === 2 remains unpaid (can be overdue or pending)
    }

    console.log('  ✅ Finance seed complete');
    return;
  }

  // If no invoices exist yet, generate starter invoices & payments from subscriptions
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

  let invSeq = 0;
  const createdInvoices = [];

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    invSeq++;
    const number = `INV-2024-${String(invSeq).padStart(4, '0')}`;

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

    let status = 'PAID';
    let amountPaid = total;
    let issueDate = new Date('2024-01-15');
    let dueDate   = new Date('2024-02-14');

    if (i === 2 || i === 7) {
      status = 'CONFIRMED';
      amountPaid = 0;
      issueDate = new Date('2024-04-10');
      dueDate   = new Date('2024-05-10');
    } else if (i === 3) {
      status = 'CONFIRMED';
      amountPaid = 0;
      issueDate = new Date();
      dueDate   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (i === 4) {
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

  await prisma.counter.upsert({
    where:  { key: 'INV' },
    create: { key: 'INV', value: invSeq },
    update: { value: invSeq },
  });

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
