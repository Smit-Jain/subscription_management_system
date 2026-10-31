// ─── Auth Routes ─────────────────────────────────────────────────────────────
import { Router } from 'express';
import asyncHandler from '../../../utils/asyncHandler.js';
import validate from '../../../middleware/validate.js';
import authenticate from '../../../middleware/authenticate.js';
import requireRole from '../../../middleware/requireRole.js';
import { loginLimiter, forgotPasswordLimiter, signupLimiter } from '../../../middleware/rateLimiters.js';
import * as ctrl from './controller.js';
import {
  signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  changePasswordSchema, updateProfileSchema,
  createStaffSchema, updateStaffSchema,
  createCustomerSchema, updateCustomerSchema,
} from './validators.js';

// ── /api/auth ──
export const authRouter = Router();

authRouter.post('/signup',          signupLimiter,         validate(signupSchema),         asyncHandler(ctrl.signup));
authRouter.post('/login',           loginLimiter,          validate(loginSchema),          asyncHandler(ctrl.login));
authRouter.post('/logout',          authenticate,                                          asyncHandler(ctrl.logout));
authRouter.get('/me',               authenticate,                                          asyncHandler(ctrl.getMe));
authRouter.patch('/me',             authenticate,          validate(updateProfileSchema),  asyncHandler(ctrl.updateMe));
authRouter.post('/change-password', authenticate,          validate(changePasswordSchema), asyncHandler(ctrl.changePassword));
authRouter.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), asyncHandler(ctrl.forgotPassword));
authRouter.post('/reset-password',                         validate(resetPasswordSchema),  asyncHandler(ctrl.resetPassword));

// ── /api/staff (ADMIN only) ──
export const staffRouter = Router();

staffRouter.use(authenticate, requireRole('ADMIN'));
staffRouter.get('/',      asyncHandler(ctrl.listStaff));
staffRouter.post('/',     validate(createStaffSchema),  asyncHandler(ctrl.createStaff));
staffRouter.get('/:id',   asyncHandler(ctrl.getStaff));
staffRouter.patch('/:id', validate(updateStaffSchema),  asyncHandler(ctrl.updateStaff));

// ── /api/customers (ADMIN + STAFF) ──
export const customersRouter = Router();

customersRouter.use(authenticate, requireRole('ADMIN', 'STAFF'));
customersRouter.get('/',      asyncHandler(ctrl.listCustomers));
customersRouter.post('/',     validate(createCustomerSchema), asyncHandler(ctrl.createCustomer));
customersRouter.get('/:id',   asyncHandler(ctrl.getCustomer));
customersRouter.patch('/:id', validate(updateCustomerSchema), asyncHandler(ctrl.updateCustomer));
