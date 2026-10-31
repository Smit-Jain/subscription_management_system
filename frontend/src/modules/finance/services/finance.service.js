// ============================================================
// Finance Services — Member D
// Real REST API calls backed by PostgreSQL & Express backend.
// ============================================================
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Read auth token from localStorage.
 */
function getToken() {
  return localStorage.getItem('brightloop_token') || '';
}

/**
 * Fetch wrapper with bearer auth token.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getPayments(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const data = await api(`/finance/payments${qs ? `?${qs}` : ''}`);
    return Array.isArray(data) ? data : (data.items || []);
  } catch (err) {
    console.error('getPayments error:', err.message);
    return [];
  }
}

export async function recordPayment(data) {
  const payload = {
    invoiceId: data.invoiceId,
    amount:    parseFloat(data.amount) || 0,
    method:    data.method || 'Bank Transfer',
    date:      data.date || new Date().toISOString().slice(0, 10),
    note:      data.note || '',
  };
  return api('/finance/payments', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}

export async function getInvoicesForPayment() {
  try {
    const data = await api('/finance/invoices');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('getInvoicesForPayment error:', err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERDUE TRACKING & REMINDERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getOverdueInvoices() {
  try {
    const data = await api('/finance/overdue');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('getOverdueInvoices error:', err.message);
    return [];
  }
}

export async function sendReminder(invoiceId) {
  return api(`/finance/invoices/${invoiceId}/send-reminder`, {
    method: 'POST',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD & REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardStats(filters = {}) {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const qs = new URLSearchParams(cleanFilters).toString();
    return await api(`/finance/dashboard/stats${qs ? `?${qs}` : ''}`);
  } catch (err) {
    console.error('getDashboardStats error:', err.message);
    return {
      activeSubscriptions: 0,
      revenueCollected: 0,
      amountOwed: 0,
      overdueCount: 0,
      recentPayments: [],
      overdueInvoices: [],
      invoiceStatusData: [
        { name: 'Paid',      value: 0 },
        { name: 'Pending',   value: 0 },
        { name: 'Overdue',   value: 0 },
        { name: 'Draft',     value: 0 },
        { name: 'Confirmed', value: 0 },
      ],
    };
  }
}

export async function getRevenueChartData() {
  try {
    const data = await api('/finance/dashboard/revenue-chart');
    return Array.isArray(data) && data.length ? data : getEmptyChartData();
  } catch (err) {
    console.error('getRevenueChartData error:', err.message);
    return getEmptyChartData();
  }
}

function getEmptyChartData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month) => ({ month, revenue: 0, invoiced: 0 }));
}

export async function getReportsData() {
  try {
    return await api('/finance/reports');
  } catch (err) {
    console.error('getReportsData error:', err.message);
    return {
      summary: {
        totalRevenue:    '₹0',
        totalInvoiced:   '₹0',
        avgInvoiceValue: '₹0',
        collectionRate:  '0%',
      },
      planData: [],
    };
  }
}

export function exportCsv() {
  const token = getToken();
  window.open(`${BASE}/finance/reports/export${token ? `?token=${encodeURIComponent(token)}` : ''}`, '_blank');
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER PORTAL
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomerSubscriptions(customerId) {
  try {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const data = await api(`/finance/customer/subscriptions${qs}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('getCustomerSubscriptions error:', err.message);
    return [];
  }
}

export async function getCustomerSubscription(id) {
  try {
    return await api(`/finance/customer/subscriptions/${id}`);
  } catch (err) {
    console.error('getCustomerSubscription error:', err.message);
    return null;
  }
}

export async function performSubscriptionAction(subId, action) {
  return api(`/finance/customer/subscriptions/${subId}/action`, {
    method: 'PATCH',
    body:   JSON.stringify({ action }),
  });
}

export async function getCustomerInvoices(customerId) {
  try {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const data = await api(`/finance/customer/invoices${qs}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('getCustomerInvoices error:', err.message);
    return [];
  }
}

export async function getCustomerInvoice(id) {
  try {
    return await api(`/finance/customer/invoices/${id}`);
  } catch (err) {
    console.error('getCustomerInvoice error:', err.message);
    return null;
  }
}

export async function getCustomerPayments(customerId) {
  try {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const data = await api(`/finance/customer/payments${qs}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('getCustomerPayments error:', err.message);
    return [];
  }
}

export async function getCustomerProfile(customerId) {
  try {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    return await api(`/finance/customer/profile${qs}`);
  } catch (err) {
    console.error('getCustomerProfile error:', err.message);
    return null;
  }
}

export async function updateCustomerProfile(data) {
  return api('/finance/customer/profile', {
    method: 'PUT',
    body:   JSON.stringify(data),
  });
}
