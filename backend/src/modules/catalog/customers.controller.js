// ─── Catalog: Customers Controller (Member B) ────────────────────────────────
// Customers are USERS with role=CUSTOMER in the auth module.
// Member B exposes a thin read-only view here for the catalog dropdown
// and customer list. Full CRUD on users belongs to Member A.
// Routes:
//   GET  /api/catalog/customers      — list customers (admin/staff)
//   GET  /api/catalog/customers/:id  — get one customer + their subs (admin/staff)
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── List all customers ────────────────────────────────────────────────────────
export const listCustomers = asyncHandler(async (_req, res) => {
  const customers = await prisma.user.findMany({
    where:   { role: 'CUSTOMER', isActive: true },
    select:  {
      id: true, name: true, email: true, phone: true,
      company: true, isActive: true, createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  const shaped = customers.map((c) => ({
    id:      c.id,
    name:    c.name,
    email:   c.email,
    phone:   c.phone || '',
    company: c.company || '',
    role:    'customer',
    status:  c.isActive ? 'active' : 'inactive',
    joined:  c.createdAt.toISOString().slice(0, 10),
  }));

  return success(res, shaped, 'Customers fetched');
});

// ── Get one customer ──────────────────────────────────────────────────────────
export const getCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await prisma.user.findUnique({
    where:  { id },
    select: {
      id: true, name: true, email: true, phone: true,
      company: true, isActive: true, createdAt: true,
      subscriptionsAsCustomer: {
        include: {
          plan:  { select: { id: true, name: true, billingPeriod: true } },
          lines: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer || customer.role === 'STAFF' || customer.role === 'ADMIN') {
    throw new AppError('Customer not found', 404);
  }

  const subs = (customer.subscriptionsAsCustomer || []).map((s) => ({
    id:          s.id,
    number:      s.number,
    plan:        s.plan?.name || '',
    status:      s.status.toLowerCase(),
    startDate:   s.startDate.toISOString().slice(0, 10),
    expiryDate:  s.expiryDate.toISOString().slice(0, 10),
    total:       (s.lines || []).reduce((sum, l) => sum + Number(l.amount), 0),
  }));

  return success(res, {
    id:      customer.id,
    name:    customer.name,
    email:   customer.email,
    phone:   customer.phone || '',
    company: customer.company || '',
    role:    'customer',
    status:  customer.isActive ? 'active' : 'inactive',
    joined:  customer.createdAt.toISOString().slice(0, 10),
    plan:    subs[0]?.plan || '',
    subscriptions: subs,
  });
});
