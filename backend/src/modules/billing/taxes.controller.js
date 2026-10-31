// ─── Taxes Controller (Member C) ──────────────────────────────────────────────
// Routes:
//   GET    /api/billing/taxes        — list all taxes (Admin, Staff)
//   GET    /api/billing/taxes/:id    — get single tax (Admin, Staff)
//   POST   /api/billing/taxes        — create tax (Admin only)
//   PUT    /api/billing/taxes/:id    — update tax (Admin only)
//   DELETE /api/billing/taxes/:id    — delete tax (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2 } from '../../utils/money.js';

function shapeTax(t) {
  const appliesToStr = t.appliesToAll
    ? 'All products'
    : t.products && t.products.length > 0
    ? `${t.products.length} product${t.products.length > 1 ? 's' : ''}`
    : 'Custom';

  return {
    id: t.id,
    name: t.name,
    percentage: round2(t.percentage),
    appliesToAll: t.appliesToAll,
    appliesTo: appliesToStr,
    isActive: t.isActive,
    status: t.isActive ? 'active' : 'inactive',
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    products: (t.products || []).map((p) => ({
      id: p.product?.id || p.productId,
      name: p.product?.name || '',
    })),
  };
}

// ── List Taxes ────────────────────────────────────────────────────────────────
export const listTaxes = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const where = {};
  if (status === 'active')   where.isActive = true;
  if (status === 'inactive') where.isActive = false;
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const taxes = await prisma.tax.findMany({
    where,
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { percentage: 'desc' },
  });

  return success(res, taxes.map(shapeTax), 'Taxes fetched');
});

// ── Get Single Tax ────────────────────────────────────────────────────────────
export const getTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tax = await prisma.tax.findUnique({
    where: { id },
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
    },
  });

  if (!tax) throw new AppError('Tax rule not found', 404);

  return success(res, shapeTax(tax));
});

// ── Create Tax ────────────────────────────────────────────────────────────────
export const createTax = asyncHandler(async (req, res) => {
  const { name, percentage, appliesToAll, appliesTo, isActive, status, productIds } = req.body;

  // Derive appliesToAll from boolean or string
  let isAppliesToAll = Boolean(appliesToAll);
  if (appliesTo && typeof appliesTo === 'string') {
    isAppliesToAll = appliesTo.trim().toLowerCase().includes('all');
  }

  // Derive isActive from boolean or string
  let active = isActive !== undefined ? Boolean(isActive) : true;
  if (status) {
    active = status.toLowerCase() === 'active';
  }

  const tax = await prisma.$transaction(async (tx) => {
    const createdTax = await tx.tax.create({
      data: {
        name: name.trim(),
        percentage: round2(percentage),
        appliesToAll: isAppliesToAll,
        isActive: active,
      },
    });

    if (!isAppliesToAll && Array.isArray(productIds) && productIds.length > 0) {
      await tx.taxProduct.createMany({
        data: productIds.map((productId) => ({
          taxId: createdTax.id,
          productId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.tax.findUnique({
      where: { id: createdTax.id },
      include: {
        products: { include: { product: { select: { id: true, name: true } } } },
      },
    });
  });

  return created(res, shapeTax(tax), 'Tax rule created');
});

// ── Update Tax ────────────────────────────────────────────────────────────────
export const updateTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.tax.findUnique({ where: { id } });
  if (!existing) throw new AppError('Tax rule not found', 404);

  const { name, percentage, appliesToAll, appliesTo, isActive, status, productIds } = req.body;

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (percentage !== undefined) data.percentage = round2(percentage);

  if (appliesToAll !== undefined) {
    data.appliesToAll = Boolean(appliesToAll);
  } else if (appliesTo !== undefined && typeof appliesTo === 'string') {
    data.appliesToAll = appliesTo.trim().toLowerCase().includes('all');
  }

  if (isActive !== undefined) {
    data.isActive = Boolean(isActive);
  } else if (status !== undefined) {
    data.isActive = status.toLowerCase() === 'active';
  }

  const updatedTax = await prisma.$transaction(async (tx) => {
    await tx.tax.update({ where: { id }, data });

    if (Array.isArray(productIds)) {
      await tx.taxProduct.deleteMany({ where: { taxId: id } });
      if (productIds.length > 0) {
        await tx.taxProduct.createMany({
          data: productIds.map((productId) => ({
            taxId: id,
            productId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return tx.tax.findUnique({
      where: { id },
      include: {
        products: { include: { product: { select: { id: true, name: true } } } },
      },
    });
  });

  return success(res, shapeTax(updatedTax), 'Tax rule updated');
});

// ── Delete Tax ────────────────────────────────────────────────────────────────
export const deleteTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.tax.findUnique({ where: { id } });
  if (!existing) throw new AppError('Tax rule not found', 404);

  await prisma.tax.delete({ where: { id } });

  return success(res, { success: true }, 'Tax rule deleted');
});
