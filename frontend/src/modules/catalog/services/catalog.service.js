// ============================================================
// Catalog Services — Member B
// TODO(B): Replace mock returns with real API calls:
//   GET/POST/PUT/DELETE /products, /plans, /templates, /subscriptions
// ============================================================
import { mockProducts, mockPlans, mockQuotationTemplates } from '../../../mock/products';
import { mockSubscriptions } from '../../../mock/subscriptions';
import { mockUsers } from '../../../mock/users';

export async function getProducts() {
  await new Promise((r) => setTimeout(r, 300));
  return mockProducts;
}

export async function saveProduct(data) {
  // TODO(B): Replace with real API
  await new Promise((r) => setTimeout(r, 400));
  return { id: data.id || `p${Date.now()}`, ...data };
}

export async function deleteProduct(id) {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}

export async function getPlans() {
  await new Promise((r) => setTimeout(r, 300));
  return mockPlans;
}

export async function savePlan(data) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: data.id || `pl${Date.now()}`, ...data };
}

export async function getTemplates() {
  await new Promise((r) => setTimeout(r, 300));
  return mockQuotationTemplates;
}

export async function saveTemplate(data) {
  await new Promise((r) => setTimeout(r, 400));
  return { id: data.id || `qt${Date.now()}`, ...data };
}

export async function getSubscriptions() {
  await new Promise((r) => setTimeout(r, 300));
  return mockSubscriptions;
}

export async function getSubscription(id) {
  await new Promise((r) => setTimeout(r, 200));
  return mockSubscriptions.find((s) => s.id === id) || null;
}

export async function saveSubscription(data) {
  // TODO(B): Replace with real API. Also trigger invoice generation on activation.
  await new Promise((r) => setTimeout(r, 500));
  return { id: data.id || `sub${Date.now()}`, ...data };
}

export async function getCustomers() {
  await new Promise((r) => setTimeout(r, 300));
  return mockUsers.filter((u) => u.role === 'customer');
}

export async function getCustomer(id) {
  await new Promise((r) => setTimeout(r, 200));
  return mockUsers.find((u) => u.id === id) || null;
}
