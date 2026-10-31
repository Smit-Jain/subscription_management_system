// ─── Auth Validators (Zod schemas) ───────────────────────────────────────────
// Single source of truth for password rules and auth input shapes.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

// ── Password rules (shared — import this for signup, reset, change-password) ─
export const passwordSchema = z
  .string()
  .min(9, 'Password must be more than 8 characters')
  .refine((pw) => /[A-Z]/.test(pw), { message: 'Password must contain at least one uppercase letter' })
  .refine((pw) => /[a-z]/.test(pw), { message: 'Password must contain at least one lowercase letter' })
  .refine((pw) => /[^A-Za-z0-9]/.test(pw), { message: 'Password must contain at least one special character' });

// ── Signup ──
export const signupSchema = z.object({
  name:     z.string().trim().min(1, 'Name is required'),
  email:    z.string().trim().toLowerCase().email('Invalid email format'),
  password: passwordSchema,
  phone:    z.string().trim().optional(),
  company:  z.string().trim().optional(),
});

// ── Login ──
export const loginSchema = z.object({
  email:    z.string().trim().toLowerCase().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ── Forgot password ──
export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format'),
});

// ── Reset password ──
export const resetPasswordSchema = z.object({
  token:       z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// ── Change password ──
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     passwordSchema,
});

// ── Update profile ──
export const updateProfileSchema = z.object({
  name:    z.string().trim().min(1, 'Name is required').optional(),
  phone:   z.string().trim().optional(),
  company: z.string().trim().optional(),
});

// ── Staff create ──
export const createStaffSchema = z.object({
  name:     z.string().trim().min(1, 'Name is required'),
  email:    z.string().trim().toLowerCase().email('Invalid email format'),
  password: passwordSchema.optional(),
  phone:    z.string().trim().optional(),
});

// ── Staff update ──
export const updateStaffSchema = z.object({
  name:     z.string().trim().min(1, 'Name is required').optional(),
  phone:    z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

// ── Customer create (by staff/admin) ──
export const createCustomerSchema = z.object({
  name:     z.string().trim().min(1, 'Name is required'),
  email:    z.string().trim().toLowerCase().email('Invalid email format'),
  password: passwordSchema.optional(),
  phone:    z.string().trim().optional(),
  company:  z.string().trim().optional(),
});

// ── Customer update ──
export const updateCustomerSchema = z.object({
  name:     z.string().trim().min(1, 'Name is required').optional(),
  phone:    z.string().trim().optional(),
  company:  z.string().trim().optional(),
  isActive: z.boolean().optional(),
});
