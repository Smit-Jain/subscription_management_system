// ─── Pagination helper ───────────────────────────────────────────────────────
// Usage in a controller:
//   const { skip, take, page, limit } = parsePagination(req.query);
//   const [items, total] = await Promise.all([
//     prisma.user.findMany({ skip, take, where }),
//     prisma.user.count({ where }),
//   ]);
//   return success(res, paginated(items, total, page, limit));
// ─────────────────────────────────────────────────────────────────────────────

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * Parse page & limit from query params (safely clamped).
 */
export function parsePagination(query) {
  let page  = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

/**
 * Build the paginated data envelope.
 */
export function paginated(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
