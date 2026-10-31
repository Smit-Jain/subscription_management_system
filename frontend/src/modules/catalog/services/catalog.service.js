// ============================================================
// Catalog Services — Member B
// Real API calls replacing the mock data.
// All function signatures are UNCHANGED — UI works with no page edits.
// Base URL: VITE_API_URL (set in frontend/.env → http://localhost:5000/api)
// ============================================================

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ── Auth token helper ─────────────────────────────────────────────────────────
// TODO(A): When real auth is ready, replace this with the token from AuthContext.
//          For now it reads from localStorage where Member A's login stores it.
function getToken() {
  return localStorage.getItem('brightloop_token') || '';
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getProducts() {
  return api('/catalog/products');
}

/**
 * Create or update a product.
 * @param {object} data  — shape: { id?, name, type, salesPrice, costPrice, notes, variants[] }
 */
export async function saveProduct(data) {
  const { id, ...body } = data;

  // Map frontend shape → backend shape
  const payload = {
    name:       body.name,
    type:       body.type,
    salesPrice: parseFloat(body.salesPrice) || 0,
    costPrice:  parseFloat(body.costPrice)  || 0,
    notes:      body.notes || '',
    variants:   (body.variants || []).map((v) => ({
      attribute:  v.attribute,
      value:      v.value,
      extraPrice: parseFloat(v.extraPrice) || 0,
    })),
  };

  if (id) {
    // Update
    return api(`/catalog/products/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(payload),
    });
  }
  // Create
  return api('/catalog/products', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}

export async function deleteProduct(id) {
  return api(`/catalog/products/${id}`, { method: 'DELETE' });
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANS
// ─────────────────────────────────────────────────────────────────────────────

export async function getPlans() {
  return api('/catalog/plans');
}

/**
 * Create or update a plan.
 * @param {object} data — shape matches PlansPage BLANK form
 */
export async function savePlan(data) {
  const { id, ...body } = data;

  const payload = {
    name:          body.name,
    price:         parseFloat(body.price) || 0,
    billingPeriod: body.billingPeriod || 'monthly',
    minQty:        parseInt(body.minQty) || 1,
    availableFrom: body.availableFrom || new Date().toISOString().slice(0, 10),
    availableTo:   body.availableTo   || null,
    description:   body.description   || '',
    features:      body.features      || [],
    color:         body.color         || 'sky',
    autoClose:     Boolean(body.autoClose),
    closableEarly: Boolean(body.closableEarly),
    pausable:      Boolean(body.pausable),
    renewable:     Boolean(body.renewable),
  };

  if (id) {
    return api(`/catalog/plans/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(payload),
    });
  }
  return api('/catalog/plans', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTATION TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTemplates() {
  return api('/catalog/templates');
}

/**
 * Create or update a quotation template.
 * @param {object} data — shape matches QuotationTemplatesPage BLANK form
 */
export async function saveTemplate(data) {
  const { id, ...body } = data;

  // The UI stores lines as { product (name), qty, unitPrice }.
  // The API needs lines as { productId, qty }.
  // We pass lines as-is and let the backend resolve by product name via a
  // "product" field. BUT the backend expects productId, so we need to
  // either (a) pass productId if available, or (b) resolve name→id.
  // The UI's QuotationTemplatesPage now uses product names from the product list.
  // We store productId on lines when loaded from the API (shapeTemplate sets productId).
  const lines = (body.lines || []).map((l) => ({
    productId: l.productId || l.id || null,  // productId when coming from API
    qty:       l.qty       || 1,
    unitPrice: l.unitPrice || 0,
  })).filter((l) => l.productId); // skip lines without productId

  const payload = {
    name:         body.name,
    planId:       body.planId || null,  // The UI passes plan name, we need planId
    validityDays: parseInt(body.validityDays) || 30,
    notes:        body.notes || '',
    lines,
  };

  if (id) {
    return api(`/catalog/templates/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(payload),
    });
  }
  return api('/catalog/templates', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}

export async function deleteTemplate(id) {
  return api(`/catalog/templates/${id}`, { method: 'DELETE' });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getSubscriptions() {
  return api('/catalog/subscriptions');
}

export async function getSubscription(id) {
  return api(`/catalog/subscriptions/${id}`);
}

/**
 * Create or update a subscription.
 * @param {object} data — shape matches NewSubscriptionPage form
 */
export async function saveSubscription(data) {
  const { id, ...body } = data;

  const payload = {
    customerId:  body.customerId,
    planId:      body.planId     || null,  // UI passes plan name, see note below
    templateId:  body.templateId || null,
    startDate:   body.startDate,
    expiryDate:  body.expiryDate,
    paymentTerms: body.paymentTerms || 'Net 30',
    lines: (body.lines || []).map((l) => ({
      productId: l.productId || null,
      variantId: l.variantId || null,
      qty:       l.qty || 1,
      unitPrice: l.unitPrice || 0,
      tax:       l.tax || 0,
      amount:    l.amount || 0,
    })).filter((l) => l.productId),
  };

  if (id) {
    // Status transition is a separate PATCH endpoint
    return api(`/catalog/subscriptions/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(payload),
    });
  }
  return api('/catalog/subscriptions', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}

/**
 * Transition subscription status.
 * action: 'Send Quotation' | 'Confirm' | 'Activate' | 'Close' | 'Pause' | 'Resume' | 'Renew'
 */
export async function transitionSubscription(id, action) {
  return api(`/catalog/subscriptions/${id}/status`, {
    method: 'PATCH',
    body:   JSON.stringify({ action }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomers() {
  return api('/catalog/customers');
}

export async function getCustomer(id) {
  return api(`/catalog/customers/${id}`);
}
