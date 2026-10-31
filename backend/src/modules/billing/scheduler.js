// ─── Billing Scheduler (Member C) ─────────────────────────────────────────────
// Automatic background recurring billing job.
// Runs periodically (default every 1 hour in production, configurable via env).
// Isolated: failures are logged without crashing the process.
// ─────────────────────────────────────────────────────────────────────────────
import { runBillingCycle } from './billing.engine.js';

let intervalTimer = null;
let isJobRunning = false;

/**
 * Execute one cycle of recurring billing with concurrency locking.
 */
export async function executeScheduledBillingRun(triggerType = 'SCHEDULED') {
  if (isJobRunning) {
    console.log(`[Billing Scheduler] Previous run still active. Skipping ${triggerType} trigger.`);
    return { skipped: true, reason: 'Already running' };
  }

  isJobRunning = true;
  const startTime = new Date();
  console.log(`[Billing Scheduler] Starting ${triggerType} billing run at ${startTime.toISOString()}…`);

  try {
    const outcome = await runBillingCycle(startTime);
    const durationMs = Date.now() - startTime.getTime();

    console.log(
      `[Billing Scheduler] ${triggerType} run completed in ${durationMs}ms: ` +
      `${outcome.invoicesGenerated} invoices generated across ${outcome.subscriptionsProcessed} subscriptions. ` +
      `Failures: ${outcome.failedSubscriptions.length}`
    );

    if (outcome.failedSubscriptions.length > 0) {
      console.warn('[Billing Scheduler] Subscriptions with failures:', outcome.failedSubscriptions);
    }

    return { ...outcome, durationMs, triggerType };
  } catch (err) {
    console.error('[Billing Scheduler] Critical error during billing run:', err);
    return { success: false, error: err.message, triggerType };
  } finally {
    isJobRunning = false;
  }
}

/**
 * Start the background recurring billing timer.
 * @param {number} intervalMs Defaults to 1 hour (3,600,000 ms) or env BILLING_CRON_INTERVAL_MS
 */
export function startBillingScheduler(intervalMs = null) {
  if (intervalTimer) return;

  const ms = intervalMs || parseInt(process.env.BILLING_INTERVAL_MS, 10) || 60 * 60 * 1000;
  console.log(`[Billing Scheduler] Initializing background billing job (interval: ${ms / 1000}s)`);

  intervalTimer = setInterval(() => {
    executeScheduledBillingRun('SCHEDULED').catch((e) => {
      console.error('[Billing Scheduler] Unhandled timer error:', e);
    });
  }, ms);

  // Unref so the interval doesn't prevent graceful test exits
  if (intervalTimer.unref) {
    intervalTimer.unref();
  }
}

/**
 * Stop the background scheduler (useful during unit tests or graceful shutdown).
 */
export function stopBillingScheduler() {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
    console.log('[Billing Scheduler] Stopped background billing job.');
  }
}
