// ─── Discounts Controller (Member C) ──────────────────────────────────────────
// Routes:
//   GET    /api/billing/discounts        — list all discounts (Admin, Staff)
//   GET    /api/billing/discounts/:id    — get single discount (Admin, Staff)
//   POST   /api/billing/discounts        — create discount (Admin only)
//   PUT    /api/billing/discounts/:id    — update discount (Admin only)
//   DELETE /api/billing/discounts/:id    — delete discount (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { round2 } from '../../utils/money.js';

function shapeDiscount(d) {
  const appliesToStr = d.appliesTo === 'PRODUCTS'
    ? (d.products && d.products.length > 0 ? `${d.products.length} product${d.products.length > 1 ? 's' : ''}` : 'Specific products')
    : 'All subscriptions';

  return {
    id: d.id,
    name: d.name,
    code: d.code || '',
    type: d.type.toLowerCase(), // 'percentage' | 'fixed'
    rawType: d.type,            // 'PERCENTAGE' | 'FIXED'
    value: round2(d.value),
    minPurchase: d.minPurchase ? round2(d.minPurchase) : null,
    minQty: d.minQuantity || null,
    minQuantity: d.minQuantity || null,
    startDate: d.startDate.toISOString().slice(0, 10),
    endDate: d.endDate ? d.endDate.toISOString().slice(0, 10) : null,
    usageLimit: d.usageLimit || null,
    used: d.usedCount || 0,
    usedCount: d.usedCount || 0,
    appliesTo: appliesToStr,
    rawAppliesTo: d.appliesTo,
    isActive: d.isActive,
    status: d.isActive ? 'active' : 'inactive',
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    products: (d.products || []).map((p) => ({
      id: p.product?.id || p.productId,
      name: p.product?.name || '',
    })),
    subscriptions: (d.subscriptions || []).map((s) => ({
      id: s.subscription?.id || s.subscriptionId,
      number: s.subscription?.number || '',
    })),
  };
}

// ── List Discounts ────────────────────────────────────────────────────────────
export const listDiscounts = asyncHandler(async (req, res) => {
  const { status, type, search } = req.query;

  const where = {};
  if (status === 'active')   where.isActive = true;
  if (status === 'inactive') where.isActive = false;
  if (type) where.type = type.toUpperCase();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const discounts = await prisma.discount.findMany({
    where,
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
      subscriptions: { include: { subscription: { select: { id: true, number: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return success(res, discounts.map(shapeDiscount), 'Discounts fetched');
});

// ── Get Single Discount ───────────────────────────────────────────────────────
export const getDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const discount = await prisma.discount.findUnique({
    where: { id },
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
      subscriptions: { include: { subscription: { select: { id: true, number: true } } } },
    },
  });

  if (!discount) throw new AppError('Discount not found', 404);

  return success(res, shapeDiscount(discount));
});

// ── Create Discount ───────────────────────────────────────────────────────────
export const createDiscount = asyncHandler(async (req, res) => {
  const {
    name, code, type, value, minPurchase, minQuantity, minQty,
    startDate, endDate, usageLimit, appliesTo, isActive, status,
    productIds, subscriptionIds,
  } = req.body;

  const discountType = type ? type.toUpperCase() : 'PERCENTAGE';
  if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
    throw new AppError('Discount type must be PERCENTAGE or FIXED', 400);
  }

  const numVal = round2(value);
  if (discountType === 'PERCENTAGE' && (numVal < 0 || numVal > 100)) {
    throw new AppError('Percentage discount must be between 0% and 100%', 400);
  }
  if (discountType === 'FIXED' && numVal <= 0) {
    throw new AppError('Fixed discount amount must be greater than 0', 400);
  }

  const start = new Date(startDate || Date.now());
  let end = null;
  if (endDate) {
    end = new Date(endDate);
    if (isNaN(end.getTime())) throw new AppError('Invalid endDate', 400);
    if (end < start) throw new AppError('End date must be on or after start date', 400);
  }

  let appliesToEnum = 'SUBSCRIPTION';
  if (appliesTo && typeof appliesTo === 'string') {
    if (appliesTo.toUpperCase() === 'PRODUCTS' || appliesTo.toLowerCase().includes('product')) {
      appliesToEnum = 'PRODUCTS';
    }
  }

  let active = isActive !== undefined ? Boolean(isActive) : true;
  if (status) {
    active = status.toLowerCase() === 'active';
  }

  const minQ = minQuantity !== undefined ? minQuantity : minQty;

  const discount = await prisma.$transaction(async (tx) => {
    const createdDiscount = await tx.discount.create({
      data: {
        name: name.trim(),
        code: code ? code.trim().toUpperCase() : null,
        type: discountType,
        value: numVal,
        minPurchase: minPurchase ? round2(minPurchase) : null,
        minQuantity: minQ ? parseInt(minQ, 10) : null,
        startDate: start,
        endDate: end || new Date('2099-12-31'), // Default far future if open-ended
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        usedCount: 0,
        appliesTo: appliesToEnum,
        isActive: active,
      },
    });

    if (Array.isArray(productIds) && productIds.length > 0) {
      await tx.discountProduct.createMany({
        data: productIds.map((productId) => ({
          discountId: createdDiscount.id,
          productId,
        })),
        skipDuplicates: true,
      });
    }

    if (Array.isArray(subscriptionIds) && subscriptionIds.length > 0) {
      await tx.discountSubscription.createMany({
        data: subscriptionIds.map((subscriptionId) => ({
          discountId: createdDiscount.id,
          subscriptionId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.discount.findUnique({
      where: { id: createdDiscount.id },
      include: {
        products: { include: { product: { select: { id: true, name: true } } } },
        subscriptions: { include: { subscription: { select: { id: true, number: true } } } },
      },
    });
  });

  return created(res, shapeDiscount(discount), 'Discount created');
});

// ── Update Discount ───────────────────────────────────────────────────────────
export const updateDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new AppError('Discount not found', 404);

  const {
    name, code, type, value, minPurchase, minQuantity, minQty,
    startDate, endDate, usageLimit, appliesTo, isActive, status,
    productIds, subscriptionIds,
  } = req.body;

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (code !== undefined) data.code = code ? code.trim().toUpperCase() : null;

  if (type !== undefined) {
    const t = type.toUpperCase();
    if (!['PERCENTAGE', 'FIXED'].includes(t)) throw new AppError('Invalid discount type', 400);
    data.type = t;
  }

  if (value !== undefined) {
    const val = round2(value);
    const checkType = data.type || existing.type;
    if (checkType === 'PERCENTAGE' && (val < 0 || val > 100)) {
      throw new AppError('Percentage must be 0–100%', 400);
    }
    if (checkType === 'FIXED' && val <= 0) {
      throw new AppError('Fixed amount must be > 0', 400);
    }
    data.value = val;
  }

  if (minPurchase !== undefined) {
    data.minPurchase = minPurchase ? round2(minPurchase) : null;
  }

  const minQ = minQuantity !== undefined ? minQuantity : minQty;
  if (minQ !== undefined) {
    data.minQuantity = minQ ? parseInt(minQ, 10) : null;
  }

  if (startDate !== undefined) {
    data.startDate = new Date(startDate);
  }

  if (endDate !== undefined) {
    if (endDate) {
      const end = new Date(endDate);
      const start = data.startDate || existing.startDate;
      if (end < start) throw new AppError('End date must be on or after start date', 400);
      data.endDate = end;
    } else {
      data.endDate = new Date('2099-12-31');
    }
  }

  if (usageLimit !== undefined) {
    data.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
  }

  if (appliesTo !== undefined && typeof appliesTo === 'string') {
    data.appliesTo = (appliesTo.toUpperCase() === 'PRODUCTS' || appliesTo.toLowerCase().includes('product'))
      ? 'PRODUCTS'
      : 'SUBSCRIPTION';
  }

  if (isActive !== undefined) {
    data.isActive = Boolean(isActive);
  } else if (status !== undefined) {
    data.isActive = status.toLowerCase() === 'active';
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.discount.update({ where: { id }, data });

    if (Array.isArray(productIds)) {
      await tx.discountProduct.deleteMany({ where: { discountId: id } });
      if (productIds.length > 0) {
        await tx.discountProduct.createMany({
          data: productIds.map((productId) => ({ discountId: id, productId })),
          skipDuplicates: true,
        });
      }
    }

    if (Array.isArray(subscriptionIds)) {
      await tx.discountSubscription.deleteMany({ where: { discountId: id } });
      if (subscriptionIds.length > 0) {
        await tx.discountSubscription.createMany({
          data: subscriptionIds.map((subscriptionId) => ({ discountId: id, subscriptionId })),
          skipDuplicates: true,
        });
      }
    }

    return tx.discount.findUnique({
      where: { id },
      include: {
        products: { include: { product: { select: { id: true, name: true } } } },
        subscriptions: { include: { subscription: { select: { id: true, number: true } } } },
      },
    });
  });

  return success(res, shapeDiscount(updated), 'Discount updated');
});

// ── Delete Discount ───────────────────────────────────────────────────────────
export const deleteDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new AppError('Discount not found', 404);

  await prisma.discount.delete({ where: { id } });

  return success(res, { success: true }, 'Discount deleted');
});
