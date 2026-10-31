// ============================================================
// Auth Services — Member A
// TODO(A): Replace mock returns with real API calls:
//   POST /auth/login, POST /auth/signup, POST /auth/forgot-password,
//   POST /auth/reset-password, GET /staff, POST /staff, DELETE /staff/:id
// ============================================================
import { mockStaff } from '../../../mock/users';

export async function login(email, password) {
  // TODO(A): Replace with: return fetch(`${import.meta.env.VITE_API_URL}/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) })
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, token: 'mock-jwt-token', user: { id: 's1', name: 'Deepa Nambiar', role: 'admin' } };
}

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
