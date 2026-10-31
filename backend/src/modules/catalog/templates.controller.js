// ─── Catalog: Quotation Templates Controller (Member B) ───────────────────────
// Routes:
//   GET    /api/catalog/templates         — list all (admin/staff)
//   POST   /api/catalog/templates         — create (admin/staff)
//   GET    /api/catalog/templates/:id     — get one (admin/staff)
//   PUT    /api/catalog/templates/:id     — update (admin/staff)
//   DELETE /api/catalog/templates/:id     — delete (admin only)
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../../config/prisma.js';
import { success, created } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── List all templates ────────────────────────────────────────────────────────
export const listTemplates = asyncHandler(async (_req, res) => {
  const templates = await prisma.quotationTemplate.findMany({
    include: {
      plan:  true,
      lines: { include: { product: true, variant: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return success(res, templates.map(shapeTemplate), 'Templates fetched');
});

// ── Get one template ──────────────────────────────────────────────────────────
export const getTemplate = asyncHandler(async (req, res) => {
  const tpl = await prisma.quotationTemplate.findUnique({
    where: { id: req.params.id },
    include: {
      plan:  true,
      lines: { include: { product: true, variant: true } },
    },
  });
  if (!tpl) throw new AppError('Template not found', 404);
  return success(res, shapeTemplate(tpl));
});

// ── Create template ───────────────────────────────────────────────────────────
export const createTemplate = asyncHandler(async (req, res) => {
  const { name, planId, validityDays = 30, notes, lines = [] } = req.body;

  if (!name || !name.trim()) throw new AppError('Template name is required', 400);
  if (!planId)               throw new AppError('planId is required', 400);

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw new AppError('Plan not found', 404);

  // Validate product IDs in lines
  for (const line of lines) {
    if (!line.productId) throw new AppError('Each line must have a productId', 400);
    const prod = await prisma.product.findUnique({ where: { id: line.productId } });
    if (!prod || !prod.isActive) throw new AppError(`Product ${line.productId} not found`, 404);
  }

  const tpl = await prisma.quotationTemplate.create({
    data: {
      name:         name.trim(),
      planId,
      validityDays: Number(validityDays) || 30,
      notes:        notes || null,
      lines: {
        create: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId || null,
          quantity:  Number(l.qty || l.quantity) || 1,
        })),
      },
    },
    include: {
      plan:  true,
      lines: { include: { product: true, variant: true } },
    },
  });

  return created(res, shapeTemplate(tpl), 'Template created');
});

// ── Update template ───────────────────────────────────────────────────────────
export const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, planId, validityDays, notes, lines } = req.body;

  const existing = await prisma.quotationTemplate.findUnique({ where: { id } });
  if (!existing) throw new AppError('Template not found', 404);

  if (planId) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) throw new AppError('Plan not found', 404);
  }

  const tpl = await prisma.$transaction(async (tx) => {
    // Replace lines if provided
    if (lines !== undefined) {
      await tx.quotationTemplateLine.deleteMany({ where: { templateId: id } });
    }

    return tx.quotationTemplate.update({
      where: { id },
      data: {
        ...(name         != null && { name: name.trim() }),
        ...(planId       != null && { planId }),
        ...(validityDays != null && { validityDays: Number(validityDays) }),
        ...(notes        != null && { notes }),
        ...(lines        != null && {
          lines: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId || null,
              quantity:  Number(l.qty || l.quantity) || 1,
            })),
          },
        }),
      },
      include: {
        plan:  true,
        lines: { include: { product: true, variant: true } },
      },
    });
  });

  return success(res, shapeTemplate(tpl), 'Template updated');
});

// ── Delete template ───────────────────────────────────────────────────────────
export const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.quotationTemplate.findUnique({ where: { id } });
  if (!existing) throw new AppError('Template not found', 404);

  await prisma.quotationTemplate.delete({ where: { id } });
  return success(res, null, 'Template deleted');
});

// ── Shape helper ──────────────────────────────────────────────────────────────
function shapeTemplate(t) {
  return {
    id:           t.id,
    name:         t.name,
    planId:       t.planId,
    plan:         t.plan?.name || '',
    validityDays: t.validityDays,
    notes:        t.notes || '',
    createdAt:    t.createdAt.toISOString(),
    updatedAt:    t.updatedAt.toISOString(),
    lines: (t.lines || []).map((l) => ({
      id:        l.id,
      productId: l.productId,
      product:   l.product?.name || '',
      variantId: l.variantId || null,
      qty:       l.quantity,
      unitPrice: Number(l.product?.salesPrice || 0),
    })),
  };
}
