// ─── Finance Module Validators (Member D) ────────────────────────────────────
// Zod schemas for validating incoming requests.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount:    z.coerce.number().positive('Payment amount must be greater than 0'),
  method:    z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER', 'Cash', 'Credit Card', 'Card', 'Bank Transfer', 'UPI', 'Cheque', 'Other']),
  paidAt:    z.string().optional(),
  date:      z.string().optional(),
  note:      z.string().max(500).optional().nullable(),
});

export const subscriptionActionSchema = z.object({
  action: z.enum(['Pause', 'Resume', 'Renew', 'Close', 'pause', 'resume', 'renew', 'close']),
});

export const updateProfileSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Invalid email address'),
  phone:   z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

