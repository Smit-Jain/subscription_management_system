// ─── Billing Validators (Member C) ──────────────────────────────────────────
// Zod schemas for Taxes, Discounts, Invoices.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

export const taxSchema = z.object({
  name: z.string().trim().min(1, 'Tax name is required'),
  percentage: z.coerce
    .number()
    .min(0, 'Percentage must be at least 0%')
    .max(100, 'Percentage cannot exceed 100%'),
  appliesToAll: z.boolean().optional(),
  appliesTo: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updateTaxSchema = taxSchema.partial();

export const discountSchema = z.object({
  name: z.string().trim().min(1, 'Discount name is required'),
  code: z.string().trim().optional().nullable(),
  type: z.enum(['FIXED', 'PERCENTAGE', 'fixed', 'percentage']),
  value: z.coerce.number().positive('Discount value must be greater than 0'),
  minPurchase: z.coerce.number().min(0).optional().nullable(),
  minQuantity: z.coerce.number().int().min(1).optional().nullable(),
  minQty: z.coerce.number().int().min(1).optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  appliesTo: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  productIds: z.array(z.string().uuid()).optional(),
  subscriptionIds: z.array(z.string().uuid()).optional(),
}).refine((data) => {
  const t = data.type.toUpperCase();
  if (t === 'PERCENTAGE' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['value'],
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
      return false;
    }
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const updateDiscountSchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: z.string().trim().optional().nullable(),
  type: z.enum(['FIXED', 'PERCENTAGE', 'fixed', 'percentage']).optional(),
  value: z.coerce.number().positive().optional(),
  minPurchase: z.coerce.number().min(0).optional().nullable(),
  minQuantity: z.coerce.number().int().min(1).optional().nullable(),
  minQty: z.coerce.number().int().min(1).optional().nullable(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional().nullable(),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  appliesTo: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  productIds: z.array(z.string().uuid()).optional(),
  subscriptionIds: z.array(z.string().uuid()).optional(),
});

export const manualInvoiceSchema = z.object({
  subscriptionId: z.string().uuid('Valid subscriptionId is required'),
  issueDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  notes: z.string().optional().nullable(),
});
