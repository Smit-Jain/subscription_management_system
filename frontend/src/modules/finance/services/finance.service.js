// ============================================================
// Finance Services — Member D
// TODO(D): Replace mock returns with real API calls:
//   GET /payments, GET /reports, GET /overdue-invoices
// ============================================================
import { mockInvoices, mockPayments } from '../../../mock/billing';
import { mockSubscriptions } from '../../../mock/subscriptions';

export async function getPayments() {
  await new Promise((r) => setTimeout(r, 300));
  return mockPayments;
}

export async function recordPayment(data) {
  // TODO(D): POST /payments
  await new Promise((r) => setTimeout(r, 500));
  return { id: `pay${Date.now()}`, ...data, status: 'completed' };
}

export async function getOverdueInvoices() {
  await new Promise((r) => setTimeout(r, 300));
  return mockInvoices.filter((i) => i.status === 'overdue');
}

export async function sendReminder(invoiceId) {
  // TODO(D): POST /invoices/:id/send-reminder
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

export async function getDashboardStats() {
  await new Promise((r) => setTimeout(r, 300));
  const activeCount = mockSubscriptions.filter((s) => s.status === 'active').length;
  const revenueCollected = mockPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdueInvoices = mockInvoices.filter((i) => i.status === 'overdue');
  const amountOwed = overdueInvoices.reduce((sum, i) => sum + i.total, 0);

  return {
    activeSubscriptions: activeCount,
    revenueCollected,
    amountOwed,
    overdueCount: overdueInvoices.length,
  };
}

export async function getRevenueChartData() {
  await new Promise((r) => setTimeout(r, 300));
  return [
    { month: 'Jan', revenue: 180000, invoiced: 220000 },
    { month: 'Feb', revenue: 210000, invoiced: 240000 },
    { month: 'Mar', revenue: 195000, invoiced: 215000 },
    { month: 'Apr', revenue: 275000, invoiced: 310000 },
    { month: 'May', revenue: 310000, invoiced: 340000 },
    { month: 'Jun', revenue: 290000, invoiced: 320000 },
    { month: 'Jul', revenue: 340000, invoiced: 380000 },
    { month: 'Aug', revenue: 365000, invoiced: 400000 },
    { month: 'Sep', revenue: 320000, invoiced: 360000 },
    { month: 'Oct', revenue: 400000, invoiced: 440000 },
    { month: 'Nov', revenue: 380000, invoiced: 420000 },
    { month: 'Dec', revenue: 450000, invoiced: 490000 },
  ];
}

export async function getCustomerSubscriptions(customerId) {
  await new Promise((r) => setTimeout(r, 300));
  return mockSubscriptions.filter((s) => s.customerId === customerId);
}

export async function getCustomerInvoices(customerId) {
  await new Promise((r) => setTimeout(r, 300));
  return mockInvoices.filter((i) => i.customerId === customerId);
}

export async function getCustomerPayments(customerId) {
  await new Promise((r) => setTimeout(r, 300));
  return mockPayments.filter((p) => p.customerId === customerId);
}
