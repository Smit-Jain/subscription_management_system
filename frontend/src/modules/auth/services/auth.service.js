// ============================================================
// Auth Services — Member A
// TODO(A): Replace remaining mock returns with real API calls:
//   POST /auth/signup, POST /auth/forgot-password,
//   POST /auth/reset-password, GET /staff, POST /staff, DELETE /staff/:id
// ============================================================
import { mockStaff } from '../../../mock/users';

const API       = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'brightloop_token';
const USER_KEY  = 'brightloop_user';

// ── Real login → stores JWT so all modules can attach it ──────────────────────
export async function login(email, password) {
  const res  = await fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Login failed');

  localStorage.setItem(TOKEN_KEY, json.data.token);
  localStorage.setItem(USER_KEY,  JSON.stringify(json.data.user));
  return json;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Helpers used by catalog, billing and finance service files
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

// ── Remaining stubs (Member A owns these) ────────────────────────────────────
export async function signup(data) {
  // TODO(A): Replace with real signup API
  await new Promise((r) => setTimeout(r, 600));
  return { success: true };
}

export async function forgotPassword(email) {
  // TODO(A): Replace with real forgot-password API
  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}

export async function resetPassword(token, password) {
  // TODO(A): Replace with real reset-password API
  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}

export async function getStaff() {
  await new Promise((r) => setTimeout(r, 300));
  return mockStaff;
}

export async function addStaff(data) {
  // TODO(A): Replace with real add-staff API
  await new Promise((r) => setTimeout(r, 400));
  return { id: `s${Date.now()}`, ...data };
}

export async function deleteStaff(id) {
  // TODO(A): Replace with real delete-staff API
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}
