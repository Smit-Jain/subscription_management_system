// ============================================================
// Billing Services — Member C
// Real backend API calls for taxes, discounts, and invoices.
// ============================================================
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getToken() {
  return localStorage.getItem('brightloop_token') || '';
}

async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const json = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }

  return json.data;
}

// ────────────────────────────────────────────────────────────
// TAXES
// ────────────────────────────────────────────────────────────

export async function getTaxes() {
  try {
    const data = await api('/billing/taxes');
    return Array.isArray(data) ? data : data.items || [];
  } catch (err) {
    console.error('getTaxes error:', err.message);
    return [];
  }
}

export async function saveTax(data) {
  const { id, ...payload } = data;
  if (id && !id.startsWith('tax')) {
    return api(`/billing/taxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  return api('/billing/taxes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteTax(id) {
  return api(`/billing/taxes/${id}`, {
    method: 'DELETE',
  });
}

// ────────────────────────────────────────────────────────────
// DISCOUNTS
// ────────────────────────────────────────────────────────────

export async function getDiscounts() {
  try {
    const data = await api('/billing/discounts');
    return Array.isArray(data) ? data : data.items || [];
  } catch (err) {
    console.error('getDiscounts error:', err.message);
    return [];
  }
}

export async function saveDiscount(data) {
  const { id, ...payload } = data;
  if (id && !id.startsWith('disc')) {
    return api(`/billing/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  return api('/billing/discounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteDiscount(id) {
  return api(`/billing/discounts/${id}`, {
    method: 'DELETE',
  });
}

// ────────────────────────────────────────────────────────────
// INVOICES
// ────────────────────────────────────────────────────────────

export async function getInvoices(params = {}) {
  try {
    const qs = new URLSearchParams();
    if (params.status)   qs.set('status', params.status);
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo)   qs.set('dateTo', params.dateTo);
    if (params.search)   qs.set('search', params.search);

    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    const data = await api(`/billing/invoices${queryStr}`);
    return Array.isArray(data) ? data : data.items || [];
  } catch (err) {
    console.error('getInvoices error:', err.message);
    return [];
  }
}

export async function getInvoice(id) {
  try {
    return await api(`/billing/invoices/${id}`);
  } catch (err) {
    console.error('getInvoice error:', err.message);
    return null;
  }
}

export async function confirmInvoice(id) {
  return api(`/billing/invoices/${id}/confirm`, {
    method: 'PUT',
  });
}

export async function cancelInvoice(id) {
  return api(`/billing/invoices/${id}/cancel`, {
    method: 'PUT',
  });
}

export async function generateInvoices() {
  return api('/billing/invoices/generate', {
    method: 'POST',
  });
}

export async function sendInvoice(id) {
  return api(`/billing/invoices/${id}/send`, {
    method: 'POST',
  });
}

export function getInvoicePdfUrl(id) {
  const token = getToken();
  return `${BASE}/billing/invoices/${id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}
