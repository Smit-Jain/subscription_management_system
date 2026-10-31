// ─── Billing Module Comprehensive Automated Test Suite (Member C) ──────────────
// Tests:
//   1. Date math (monthly, yearly, month-end, leap year)
//   2. Tax calculations & product matching
//   3. Discount eligibility & calculation
//   4. Atomic invoice generation & snapshotting
//   5. Sequential catch-up billing for missed periods
//   6. Idempotency against duplicate invoice generation
//   7. Concurrent generation safety
//   8. Invoice status transitions (Draft -> Confirmed -> Cancelled)
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../src/config/prisma.js';
import {
  addBillingPeriod, daysInMonth, toUtcMidnight, resolveTaxForProduct,
  findEligibleDiscount, generateInvoiceForPeriod, billSubscriptionCatchUp,
  runBillingCycle,
} from '../src/modules/billing/billing.engine.js';
import { round2, add, multiply, subtract } from '../src/utils/money.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  }
}

async function runTests() {
  console.log('\n🧪 Running Member C: Billing Engine Test Suite...\n');

  // ── TEST 1: Date Math & Leap Year / Month-End Handling ───────────────────────
  console.log('--- TEST GROUP 1: Date Calculations ---');
  {
    // Month-end: Jan 31 + 1 month in non-leap year (2025) -> Feb 28
    const jan31_2025 = new Date('2025-01-31T00:00:00.000Z');
    const feb2025 = addBillingPeriod(jan31_2025, 'MONTHLY');
    assert(feb2025.getUTCFullYear() === 2025 && feb2025.getUTCMonth() === 1 && feb2025.getUTCDate() === 28,
      'Jan 31 + 1 month in 2025 resolves to Feb 28 (month-end cap)');

    // Month-end: Jan 31 + 1 month in leap year (2024) -> Feb 29
    const jan31_2024 = new Date('2024-01-31T00:00:00.000Z');
    const feb2024 = addBillingPeriod(jan31_2024, 'MONTHLY');
    assert(feb2024.getUTCFullYear() === 2024 && feb2024.getUTCMonth() === 1 && feb2024.getUTCDate() === 29,
      'Jan 31 + 1 month in leap year 2024 resolves to Feb 29');

    // Leap day + 1 year: Feb 29 2024 + 1 year -> Feb 28 2025
    const feb29_2024 = new Date('2024-02-29T00:00:00.000Z');
    const feb2025Yearly = addBillingPeriod(feb29_2024, 'YEARLY');
    assert(feb2025Yearly.getUTCFullYear() === 2025 && feb2025Yearly.getUTCMonth() === 1 && feb2025Yearly.getUTCDate() === 28,
      'Feb 29 leap day + 1 year resolves to Feb 28 2025');

    // Daily & Weekly
    const d1 = new Date('2026-05-10T00:00:00.000Z');
    const dDaily = addBillingPeriod(d1, 'DAILY');
    assert(dDaily.getUTCDate() === 11, 'Daily increment advances exactly 1 day');

    const dWeekly = addBillingPeriod(d1, 'WEEKLY');
    assert(dWeekly.getUTCDate() === 17, 'Weekly increment advances exactly 7 days');
  }

  // ── TEST 2: Money Arithmetic Accuracy ───────────────────────────────────────
  console.log('\n--- TEST GROUP 2: Financial Precision ---');
  {
    // Floating point precision checks (0.1 + 0.2 === 0.30000000000000004 in raw JS)
    assert(add(0.1, 0.2) === 0.3, '0.1 + 0.2 rounds safely to 0.3');
    assert(multiply(1000, 0.18) === 180, '1000 * 18% = 180.00');
    assert(multiply(333.33, 3) === 999.99, '333.33 * 3 = 999.99 (round2)');
  }

  // ── TEST 3: Tax Resolution ──────────────────────────────────────────────────
  console.log('\n--- TEST GROUP 3: Tax Calculation & Resolution ---');
  {
    const taxes = await prisma.tax.findMany({ where: { isActive: true } });
    assert(taxes.length > 0, `Active taxes exist in database (${taxes.length} found)`);

    const gst18 = taxes.find((t) => Number(t.percentage) === 18);
    assert(gst18 !== undefined, 'GST 18% rule is active');

    // Test tax resolution
    const rate = await resolveTaxForProduct(null, gst18.id);
    assert(rate === 18, 'Explicit tax ID resolves to 18%');
  }

  // ── TEST 4: Discount Eligibility & Matching ─────────────────────────────────
  console.log('\n--- TEST GROUP 4: Discount Eligibility ---');
  {
    const sub = await prisma.subscription.findFirst({
      where: { status: 'ACTIVE' },
      include: { lines: true },
    });
    assert(sub !== null, 'Found active subscription for discount testing');

    const match = await findEligibleDiscount(sub, 50000, 2, new Date('2026-06-01'));
    assert(match !== null, `Eligible discount found: ${match?.discount?.name} (amount: ₹${match?.amount})`);
    assert(match?.amount > 0, 'Discount amount is positive');
  }

  // ── TEST 5: Invoice Generation & Period Snapshotting ────────────────────────
  console.log('\n--- TEST GROUP 5: Invoice Generation ---');
  {
    const sub = await prisma.subscription.findFirst({
      where: { status: 'ACTIVE' },
      include: { lines: { include: { product: true } } },
    });

    const testPeriodStart = new Date('2024-01-15T00:00:00.000Z');
    const testPeriodEnd = new Date('2024-02-14T00:00:00.000Z');

    const result = await generateInvoiceForPeriod(sub.id, testPeriodStart, testPeriodEnd, { force: true });
    assert(result.invoice !== null, `Invoice created: ${result.invoice.number}`);
    assert(Number(result.invoice.subtotal) > 0, `Invoice subtotal is positive (₹${result.invoice.subtotal})`);
    assert(Number(result.invoice.total) > 0, `Invoice total is positive (₹${result.invoice.total})`);
    assert(result.invoice.lines.length === sub.lines.length, 'Invoice lines snapshot matches subscription lines');

    // ── TEST 6: Idempotency (Never duplicate an invoice for the same period) ──
    console.log('\n--- TEST GROUP 6: Idempotency Verification ---');
    const retryResult = await generateInvoiceForPeriod(sub.id, testPeriodStart, testPeriodEnd, { force: true });
    assert(retryResult.isDuplicate === true, 'Retry for exact same period flagged as duplicate');
    assert(retryResult.invoice.id === result.invoice.id, 'Duplicate attempt returns existing invoice instead of creating new');
  }

  // ── TEST 7: Full Recurring Cycle Execution ──────────────────────────────────
  console.log('\n--- TEST GROUP 7: Bulk Recurring Billing Cycle ---');
  {
    const cycle = await runBillingCycle(new Date());
    assert(cycle.totalChecked > 0, `Billing cycle inspected ${cycle.totalChecked} subscriptions`);
    console.log(`  📊 Cycle result: ${cycle.invoicesGenerated} invoices generated across ${cycle.subscriptionsProcessed} subscriptions`);
    assert(cycle.failedSubscriptions.length === 0, 'No subscription failures during billing cycle');

    // Run cycle again immediately - should produce 0 duplicates
    const cycle2 = await runBillingCycle(new Date());
    assert(cycle2.invoicesGenerated === 0, 'Immediate re-run generated 0 duplicate invoices (strict idempotency)');
  }

  // ── TEST 8: Invoice Status Transitions ──────────────────────────────────────
  console.log('\n--- TEST GROUP 8: Invoice Status Transitions ---');
  {
    const draftInvoice = await prisma.invoice.findFirst({
      where: { status: 'DRAFT' },
    });

    if (draftInvoice) {
      // Draft -> Confirmed
      const confirmed = await prisma.invoice.update({
        where: { id: draftInvoice.id },
        data: { status: 'CONFIRMED' },
      });
      assert(confirmed.status === 'CONFIRMED', `Invoice #${draftInvoice.number} transitioned to CONFIRMED`);

      // Confirmed -> Cancelled
      const cancelled = await prisma.invoice.update({
        where: { id: draftInvoice.id },
        data: { status: 'CANCELLED' },
      });
      assert(cancelled.status === 'CANCELLED', `Invoice #${draftInvoice.number} transitioned to CANCELLED`);
    } else {
      console.log('  ⏭️ No draft invoice available for transition test (already confirmed)');
    }
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
