// ─── Auth Controller ─────────────────────────────────────────────────────────
import * as authService from './service.js';
import { success, created } from '../../utils/response.js';
import { parsePagination, paginated } from '../../utils/pagination.js';

// ── Auth ──

export async function signup(req, res) {
  const result = await authService.signup(req.body);
  return created(res, result, 'Account created successfully');
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  return success(res, result, 'Logged in successfully');
}

export async function logout(_req, res) {
  // Stateless — client discards the token
  return success(res, null, 'Logged out successfully');
}

export async function getMe(req, res) {
  const user = await authService.getMe(req.user.id);
  return success(res, user);
}

export async function updateMe(req, res) {
  const user = await authService.updateMe(req.user.id, req.body);
  return success(res, user, 'Profile updated');
}

export async function changePassword(req, res) {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  return success(res, null, 'Password changed successfully');
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  // Always same response
  return success(res, null, 'If that email exists, we\'ve sent password reset instructions.');
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  return success(res, null, 'Password reset successfully. Please sign in.');
}

// ── Staff ──

export async function listStaff(req, res) {
  const { skip, take, page, limit } = parsePagination(req.query);
  const search = req.query.search || '';
  const result = await authService.listStaff({ page, limit, skip, search });
  return success(res, paginated(result.items, result.total, result.page, result.limit));
}

export async function createStaff(req, res) {
  const result = await authService.createStaff(req.body, req.user.id);
  const data = { user: result.user };
  if (result.devResetLink) data.devResetLink = result.devResetLink;
  return created(res, data, 'Staff member created');
}

export async function getStaff(req, res) {
  const user = await authService.getStaffById(req.params.id);
  return success(res, user);
}

export async function updateStaff(req, res) {
  const user = await authService.updateStaff(req.params.id, req.body, req.user.id);
  return success(res, user, 'Staff member updated');
}

// ── Customers ──

export async function listCustomers(req, res) {
  const { skip, take, page, limit } = parsePagination(req.query);
  const search = req.query.search || '';
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const result = await authService.listCustomers({ page, limit, skip, search, isActive });
  return success(res, paginated(result.items, result.total, result.page, result.limit));
}

export async function getCustomer(req, res) {
  const user = await authService.getCustomerById(req.params.id);
  return success(res, user);
}

export async function createCustomer(req, res) {
  const result = await authService.createCustomer(req.body, req.user.id);
  const data = { user: result.user };
  if (result.devResetLink) data.devResetLink = result.devResetLink;
  return created(res, data, 'Customer created');
}

export async function updateCustomer(req, res) {
  const user = await authService.updateCustomer(req.params.id, req.body, req.user);
  return success(res, user, 'Customer updated');
}
