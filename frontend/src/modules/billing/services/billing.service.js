// ============================================================
// Billing Services — Member C
// TODO(C): Replace mock returns with real API calls:
//   GET/POST/PUT/DELETE /taxes, /discounts, /invoices
// ============================================================
import { mockInvoices, mockTaxes, mockDiscounts } from '../../../mock/billing';

export async function getTaxes() {
  await new Promise((r) => setTimeout(r, 300));
  return mockTaxes;
}

export async function saveTax(data) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: data.id || `tax${Date.now()}`, ...data };
}

export async function deleteTax(id) {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}

export async function getDiscounts() {
  await new Promise((r) => setTimeout(r, 300));
  return mockDiscounts;
}

export async function saveDiscount(data) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: data.id || `disc${Date.now()}`, ...data };
}

export async function getInvoices() {
  await new Promise((r) => setTimeout(r, 300));
  return mockInvoices;
}

export async function getInvoice(id) {
  await new Promise((r) => setTimeout(r, 200));
  return mockInvoices.find((i) => i.id === id) || null;
}

export async function confirmInvoice(id) {
  // TODO(C): PUT /invoices/:id/confirm
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

export async function cancelInvoice(id) {
  // TODO(C): PUT /invoices/:id/cancel
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

export async function generateInvoices() {
  // TODO(C): POST /invoices/generate — bulk invoice generation
  await new Promise((r) => setTimeout(r, 1000));
  return { generated: 3 };
}
