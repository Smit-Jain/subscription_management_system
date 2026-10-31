// ============================================================
// Auth Services — Member A
// Real API calls for authentication, password recovery, and staff management.
// ============================================================
const API       = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'brightloop_token';
const USER_KEY  = 'brightloop_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

async function authApi(path, options = {}) {
  const token = getStoredToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const json = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data;
}

// ── Login & Logout ────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({ success: false, message: 'Login failed' }));
  if (!res.ok || !json.success) throw new Error(json.message || 'Login failed');

  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(USER_KEY,  JSON.stringify(json.data.user));
  return json;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Signup & Password Recovery ────────────────────────────────────────────────
export async function signup(data) {
  return authApi('/auth/signup', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
}

export async function forgotPassword(email) {
  return authApi('/auth/forgot-password', {
    method: 'POST',
    body:   JSON.stringify({ email }),
  });
}

export async function resetPassword(token, password) {
  return authApi('/auth/reset-password', {
    method: 'POST',
    body:   JSON.stringify({ token, password }),
  });
}

// ── Staff Management ──────────────────────────────────────────────────────────
export async function getStaff() {
  try {
    const data = await authApi('/staff');
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (err) {
    console.error('Failed to fetch staff:', err.message);
    return [];
  }
}

export async function addStaff(data) {
  return authApi('/staff', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
}

export async function deleteStaff(id) {
  return authApi(`/staff/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify({ isActive: false }),
  });
}
