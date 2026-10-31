// ─── Catalog: Products Controller (Member B) ─────────────────────────────────
// Routes:
//   GET    /api/catalog/products          — list all (admin/staff)
//   POST   /api/catalog/products          — create (admin only)
//   GET    /api/catalog/products/:id      — get one (admin/staff)
//   PUT    /api/catalog/products/:id      — update (admin only)
//   DELETE /api/catalog/products/:id      — delete (admin only)
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── List all products ─────────────────────────────────────────────────────────
export const listProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
  });

  const shaped = products.map(shapeProduct);
  return success(res, shaped, 'Products fetched');
});

// ── Get one product ───────────────────────────────────────────────────────────
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { variants: true },
  });
  if (!product || !product.isActive) throw new AppError('Product not found', 404);
  return success(res, shapeProduct(product));
});

// ── Create product ────────────────────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const { name, type, salesPrice, costPrice, notes, variants = [] } = req.body;

  // Validation
  if (!name || !name.trim()) throw new AppError('Product name is required', 400);
  if (salesPrice == null || isNaN(Number(salesPrice))) throw new AppError('salesPrice must be a number', 400);
  if (costPrice == null || isNaN(Number(costPrice)))   throw new AppError('costPrice must be a number', 400);
  if (Number(salesPrice) < Number(costPrice)) {
    throw new AppError('Sales price must be greater than or equal to cost price', 400);
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      type: type || 'Service',
      salesPrice: Number(salesPrice),
      costPrice:  Number(costPrice),
      notes: notes || null,
      variants: {
        create: variants.map((v) => ({
          attribute:  v.attribute || '',
          value:      v.value     || '',
          extraPrice: Number(v.extraPrice) || 0,
        })),
      },
    },
    include: { variants: true },
  });

  return created(res, shapeProduct(product), 'Product created');
});

// ── Update product ────────────────────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, type, salesPrice, costPrice, notes, variants = [] } = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || !existing.isActive) throw new AppError('Product not found', 404);

  if (salesPrice != null && costPrice != null && Number(salesPrice) < Number(costPrice)) {
    throw new AppError('Sales price must be greater than or equal to cost price', 400);
  }

  // Replace variants: delete old, create new
  const product = await prisma.$transaction(async (tx) => {
    await tx.productVariant.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        ...(name       != null && { name: name.trim() }),
        ...(type       != null && { type }),
        ...(salesPrice != null && { salesPrice: Number(salesPrice) }),
        ...(costPrice  != null && { costPrice:  Number(costPrice) }),
        ...(notes      != null && { notes }),
        variants: {
          create: variants.map((v) => ({
            attribute:  v.attribute || '',
            value:      v.value     || '',
            extraPrice: Number(v.extraPrice) || 0,
          })),
        },
      },
      include: { variants: true },
    });
  });

  return success(res, shapeProduct(product), 'Product updated');
});

// ── Delete product (soft delete) ──────────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || !existing.isActive) throw new AppError('Product not found', 404);

  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return success(res, null, 'Product deleted');
});

// ── Shape helper (camelCase, numbers not Decimal objects) ────────────────────
function shapeProduct(p) {
  return {
    id:         p.id,
    name:       p.name,
    type:       p.type,
    salesPrice: Number(p.salesPrice),
    costPrice:  Number(p.costPrice),
    notes:      p.notes || '',
    isActive:   p.isActive,
    createdAt:  p.createdAt.toISOString(),
    updatedAt:  p.updatedAt.toISOString(),
    variants:   (p.variants || []).map((v) => ({
      id:         v.id,
      attribute:  v.attribute,
      value:      v.value,
      extraPrice: Number(v.extraPrice),
    })),
  };
}
