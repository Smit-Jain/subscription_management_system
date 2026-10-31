// ─── asyncHandler: wraps async route handlers ───────────────────────────────
// Usage: router.get('/foo', asyncHandler(async (req, res) => { ... }));
// ─────────────────────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
