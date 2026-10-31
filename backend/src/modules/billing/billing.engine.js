// ─── Billing Engine (Member C) ────────────────────────────────────────────────
// Core calculation engine, recurring billing generator, and missed-period recovery.
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { round2, add, multiply, subtract } from '../../utils/money.js';
import { nextSequence, formatNumber } from '../../utils/sequence.js';
import AppError from '../../utils/AppError.js';

// ── Date Math Helpers ─────────────────────────────────────────────────────────

/**
 * Return the last day of the month for a given year and month (1-indexed).
 */
export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Add exactly one billing period to a date, respecting month-end rules and leap years.
 * @param {Date|string} date
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} period
 * @returns {Date}
 */
export function addBillingPeriod(date, period) {
  const d = new Date(date);
  const p = (period || 'MONTHLY').toUpperCase();

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-indexed
  const day = d.getUTCDate();

  switch (p) {
    case 'DAILY': {
      const next = new Date(d);
      next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }

    case 'WEEKLY': {
      const next = new Date(d);
      next.setUTCDate(next.getUTCDate() + 7);
      return next;
    }

    case 'MONTHLY': {
      const targetMonth = month + 1;
      const targetYear = year + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12; // 0-indexed

      // Last day in target month (e.g., 28 in Feb, 29 in leap year Feb, 30 in Apr)
      const maxDays = daysInMonth(targetYear, normalizedMonth + 1);
      const targetDay = Math.min(day, maxDays);

      return new Date(Date.UTC(targetYear, normalizedMonth, targetDay, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
    }

    case 'YEARLY': {
      const targetYear = year + 1;
      // Handle leap day: Feb 29 + 1 year -> Feb 28
      const maxDays = daysInMonth(targetYear, month + 1);
      const targetDay = Math.min(day, maxDays);

      return new Date(Date.UTC(targetYear, month, targetDay, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
    }

    default:
      throw new Error(`Unsupported billing period: ${period}`);
  }
}

/**
 * Normalize date to UTC midnight for consistent period boundaries.
 */
export function toUtcMidnight(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// ── Tax Resolution ───────────────────────────────────────────────────────────

/**
 * Resolve tax percentage synchronously from a preloaded list of active taxes.
 */
export function resolveTaxFromCache(productId, explicitTaxId, activeTaxes) {
  if (explicitTaxId) {
    const tax = activeTaxes.find((t) => t.id === explicitTaxId);
    if (tax && tax.isActive) return round2(tax.percentage);
  }

  if (productId) {
    const specificTax = activeTaxes.find((t) =>
      t.products && t.products.some((tp) => tp.productId === productId)
    );
    if (specificTax) {
      return round2(specificTax.percentage);
    }
  }

  const globalTax = activeTaxes.find((t) => t.appliesToAll);
  if (globalTax) {
    return round2(globalTax.percentage);
  }

  return 0;
}

/**
 * Fallback async tax resolution.
 */
export async function resolveTaxForProduct(productId, explicitTaxId, tx = prisma) {
  const activeTaxes = await tx.tax.findMany({
    where: { isActive: true },
    include: { products: true },
  });
  return resolveTaxFromCache(productId, explicitTaxId, activeTaxes);
}

// ── Discount Matching ─────────────────────────────────────────────────────────

/**
 * Find the single most advantageous active discount for a subscription or order.
 */
export async function findEligibleDiscount(subscription, subtotal, totalQty, atDate = new Date(), tx = prisma) {
  const checkDate = new Date(atDate);

  const activeDiscounts = await tx.discount.findMany({
    where: {
      isActive: true,
      startDate: { lte: checkDate },
      endDate:   { gte: checkDate },
    },
    include: {
      products: true,
      subscriptions: true,
    },
  });

  const eligible = [];

  for (const disc of activeDiscounts) {
    // Check usage limit
    if (disc.usageLimit !== null && disc.usedCount >= disc.usageLimit) {
      continue;
    }

    // Check minPurchase
    if (disc.minPurchase !== null && subtotal < Number(disc.minPurchase)) {
      continue;
    }

    // Check minQuantity
    if (disc.minQuantity !== null && totalQty < disc.minQuantity) {
      continue;
    }

    // Check applicability
    if (disc.appliesTo === 'SUBSCRIPTION') {
      // Check if restricted to specific subscriptions
      if (disc.subscriptions.length > 0) {
        const matches = disc.subscriptions.some((s) => s.subscriptionId === subscription.id);
        if (!matches) continue;
      }
    } else if (disc.appliesTo === 'PRODUCTS') {
      // Must match at least one product in subscription lines
      const discProductIds = new Set(disc.products.map((p) => p.productId));
      const hasMatchingProduct = subscription.lines.some((l) => discProductIds.has(l.productId));
      if (!hasMatchingProduct) continue;
    }

    // Calculate effective discount amount
    let calculatedAmount = 0;
    if (disc.type === 'PERCENTAGE') {
      calculatedAmount = round2(multiply(subtotal, Number(disc.value) / 100));
    } else {
      calculatedAmount = round2(Math.min(Number(disc.value), subtotal));
    }

    if (calculatedAmount > 0) {
      eligible.push({ discount: disc, amount: calculatedAmount });
    }
  }

  if (eligible.length === 0) return null;

  // Pick highest discount amount
  eligible.sort((a, b) => b.amount - a.amount);
  return eligible[0];
}

// ── Single Period Invoice Generation (Atomic & Idempotent) ────────────────────

/**
 * Generates an invoice for a specific subscription and period.
 * Idempotent: If an invoice for (subscriptionId, periodStart) already exists, returns existing invoice.
 */
export async function generateInvoiceForPeriod(subscriptionId, periodStart, periodEnd, options = {}, txClient = null) {
  const runInTransaction = async (tx) => {
    // 1. Fetch complete subscription data with customer and plan
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        plan: true,
        lines: { include: { product: true } },
      },
    });

    if (!sub) throw new AppError('Subscription not found', 404);
    if (sub.status !== 'ACTIVE' && options.force !== true) {
      throw new AppError(`Subscription is ${sub.status}, not eligible for billing`, 400);
    }
    if (sub.isPaused && options.force !== true) {
      throw new AppError('Subscription is paused, billing skipped', 400);
    }

    const pStart = toUtcMidnight(periodStart);
    const pEnd = toUtcMidnight(periodEnd);

    // 2. Check for duplicate invoice using unique constraint
    const existing = await tx.invoice.findUnique({
      where: {
        subscriptionId_billingPeriodStart: {
          subscriptionId: sub.id,
          billingPeriodStart: pStart,
        },
      },
      include: {
        lines: true,
        invoiceDiscounts: { include: { discount: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    if (existing) {
      return { invoice: existing, isDuplicate: true };
    }

    // 3. Line items calculation & Tax resolution
    const activeTaxes = await tx.tax.findMany({
      where: { isActive: true },
      include: { products: true },
    });

    let subtotal = 0;
    let totalQty = 0;
    const computedLines = [];

    for (const line of sub.lines) {
      const qty = line.quantity || 1;
      const unitPrice = round2(line.unitPrice);
      const lineSubtotal = round2(multiply(qty, unitPrice));

      subtotal = add(subtotal, lineSubtotal);
      totalQty += qty;

      const taxPercent = resolveTaxFromCache(line.productId, line.taxId, activeTaxes);

      computedLines.push({
        productId: line.productId,
        description: line.description || line.product?.name || 'Subscription Line',
        quantity: qty,
        unitPrice,
        taxPercent,
        lineSubtotal,
      });
    }

    // 4. Automatic discount eligibility
    const eligibleDiscountResult = await findEligibleDiscount(sub, subtotal, totalQty, pStart, tx);
    let discountTotal = 0;
    let appliedDiscount = null;

    if (eligibleDiscountResult) {
      discountTotal = round2(eligibleDiscountResult.amount);
      appliedDiscount = eligibleDiscountResult.discount;

      // Safely increment usage count atomically
      await tx.discount.update({
        where: { id: appliedDiscount.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 5. Allocate discount across lines proportionally & compute line taxes
    let taxTotal = 0;
    const invoiceLinesData = [];

    for (const cl of computedLines) {
      // Proportional discount allocation for line
      const lineDiscount = subtotal > 0
        ? round2(multiply(discountTotal, cl.lineSubtotal / subtotal))
        : 0;

      const taxableLineAmount = Math.max(0, subtract(cl.lineSubtotal, lineDiscount));
      const lineTax = round2(multiply(taxableLineAmount, cl.taxPercent / 100));

      taxTotal = add(taxTotal, lineTax);
      const lineAmount = add(taxableLineAmount, lineTax);

      invoiceLinesData.push({
        productId: cl.productId,
        description: cl.description,
        quantity: cl.quantity,
        unitPrice: cl.unitPrice,
        taxPercent: cl.taxPercent,
        taxAmount: lineTax,
        discountAmount: lineDiscount,
        amount: lineAmount,
      });
    }

    // 6. Final grand total
    const grandTotal = round2(add(subtract(subtotal, discountTotal), taxTotal));

    // 7. Invoice Number sequence (atomic)
    const seq = await nextSequence('INV', tx);
    const invoiceNumber = formatNumber('INV', seq, pStart.getUTCFullYear());

    // 8. Dates: issueDate is now or pStart, dueDate = issueDate + paymentTermsDays
    const issueDate = options.issueDate ? new Date(options.issueDate) : new Date();
    const paymentDays = sub.paymentTermsDays || 30;
    const dueDate = options.dueDate
      ? new Date(options.dueDate)
      : new Date(issueDate.getTime() + paymentDays * 24 * 60 * 60 * 1000);

    // 9. Create Invoice and relations
    const invoice = await tx.invoice.create({
      data: {
        number: invoiceNumber,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        status: options.initialStatus || 'DRAFT',
        billingPeriodStart: pStart,
        billingPeriodEnd: pEnd,
        issueDate,
        dueDate,
        subtotal,
        discountTotal,
        taxTotal,
        total: grandTotal,
        amountPaid: 0,
        notes: options.notes || `Invoice for ${pStart.toISOString().slice(0, 10)} to ${pEnd.toISOString().slice(0, 10)}`,
        lines: { create: invoiceLinesData },
        ...(appliedDiscount ? {
          invoiceDiscounts: {
            create: [{
              discountId: appliedDiscount.id,
              amount: discountTotal,
            }],
          },
        } : {}),
      },
      include: {
        lines: { include: { product: true } },
        customer: { select: { id: true, name: true, email: true, company: true } },
        subscription: { select: { id: true, number: true, plan: true } },
        invoiceDiscounts: { include: { discount: true } },
      },
    });

    // 10. Advance subscription billing state
    const nextPeriodStart = addBillingPeriod(pStart, sub.plan.billingPeriod);
    const updateData = {
      lastBilledThrough: pEnd,
      nextBillingDate: nextPeriodStart,
    };

    // Auto-close check if plan is autoClose and expiry is reached
    if (sub.plan.autoClose && sub.expiryDate && nextPeriodStart >= sub.expiryDate) {
      updateData.status = 'CLOSED';
    }

    await tx.subscription.update({
      where: { id: sub.id },
      data: updateData,
    });

    return { invoice, isDuplicate: false };
  };

  if (txClient) {
    return runInTransaction(txClient);
  }
  return prisma.$transaction(runInTransaction, { maxWait: 15000, timeout: 30000 });
}

// ── Sequential Catch-up Billing for Missed Periods ────────────────────────────

/**
 * Checks a subscription for due periods and generates invoices sequentially.
 * Supports missed-billing recovery (e.g. 2 or 3 periods behind).
 *
 * @param {string} subscriptionId
 * @param {Date} [asOfDate] Reference date (defaults to now)
 * @returns {Promise<{ generated: number, invoices: object[], errors: string[] }>}
 */
export async function billSubscriptionCatchUp(subscriptionId, asOfDate = new Date()) {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!sub) throw new AppError('Subscription not found', 404);
  if (sub.status !== 'ACTIVE' || sub.isPaused) {
    return { generated: 0, invoices: [], errors: [`Subscription ${sub.number} is ${sub.status} or paused`] };
  }

  const periodType = sub.plan.billingPeriod;
  const expiry = sub.expiryDate ? toUtcMidnight(sub.expiryDate) : null;
  const now = toUtcMidnight(asOfDate);

  // Determine starting point:
  // If nextBillingDate is set, start there.
  // Else if lastBilledThrough is set, start one period after that.
  // Else start from subscription.startDate.
  let currentPeriodStart;
  if (sub.nextBillingDate) {
    currentPeriodStart = toUtcMidnight(sub.nextBillingDate);
  } else if (sub.lastBilledThrough) {
    currentPeriodStart = toUtcMidnight(addBillingPeriod(sub.lastBilledThrough, periodType));
  } else {
    currentPeriodStart = toUtcMidnight(sub.startDate);
  }

  const results = [];
  const errors = [];
  let loopCount = 0;
  const MAX_CATCH_UP_PERIODS = 60; // Guard against infinite loop

  while (currentPeriodStart <= now && loopCount < MAX_CATCH_UP_PERIODS) {
    loopCount++;

    // Don't bill past expiry
    if (expiry && currentPeriodStart >= expiry) {
      break;
    }

    const currentPeriodEnd = toUtcMidnight(addBillingPeriod(currentPeriodStart, periodType));
    // Sub-1 day or period boundary for end
    const periodEndBoundary = new Date(currentPeriodEnd.getTime() - 24 * 60 * 60 * 1000);

    try {
      const outcome = await generateInvoiceForPeriod(
        sub.id,
        currentPeriodStart,
        periodEndBoundary,
        { force: false }
      );

      if (!outcome.isDuplicate) {
        results.push(outcome.invoice);
      }
      currentPeriodStart = currentPeriodEnd;
    } catch (err) {
      // Prisma unique constraint violation (P2002) means already generated concurrently
      if (err.code === 'P2002') {
        currentPeriodStart = currentPeriodEnd;
        continue;
      }
      errors.push(`Period ${currentPeriodStart.toISOString().slice(0, 10)}: ${err.message}`);
      break; // Stop sequential chain on hard failure
    }
  }

  return {
    generated: results.length,
    invoices: results,
    errors,
  };
}

// ── Bulk Recurring Billing Engine Run ─────────────────────────────────────────

/**
 * Identify all active subscriptions due for billing and process them in batches.
 * Isolated execution: Failure of one subscription does not stop others.
 */
export async function runBillingCycle(asOfDate = new Date()) {
  const now = toUtcMidnight(asOfDate);

  // Find all ACTIVE, non-paused subscriptions due for billing
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      isPaused: false,
      OR: [
        { nextBillingDate: { lte: now } },
        { nextBillingDate: null },
      ],
    },
    select: { id: true, number: true },
  });

  const summary = {
    totalChecked: dueSubscriptions.length,
    invoicesGenerated: 0,
    subscriptionsProcessed: 0,
    failedSubscriptions: [],
    invoices: [],
  };

  for (const s of dueSubscriptions) {
    try {
      const outcome = await billSubscriptionCatchUp(s.id, now);
      summary.invoicesGenerated += outcome.generated;
      summary.subscriptionsProcessed++;
      summary.invoices.push(...outcome.invoices);
      if (outcome.errors.length > 0) {
        summary.failedSubscriptions.push({ number: s.number, errors: outcome.errors });
      }
    } catch (err) {
      summary.failedSubscriptions.push({ number: s.number, errors: [err.message] });
    }
  }

  return summary;
}
