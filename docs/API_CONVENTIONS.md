# API Conventions

All API endpoints follow these conventions. Read this before writing any endpoint.

## Base URL

```
http://localhost:5000/api
```

## Response Shapes

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "This email is already registered",
    "password": "Password must be more than 8 characters"
  }
}
```

The `errors` object is only present for 400 validation errors. Each key is the field name and the value is the human-readable error message.

## Status Codes

| Code | When |
|------|------|
| 200 | Successful read or update |
| 201 | Successfully created |
| 400 | Validation error (check `errors` object) |
| 401 | Not authenticated (no token or invalid token) |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 429 | Rate limited |
| 500 | Internal server error |

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOi...
```

## Pagination

Paginated endpoints accept these query parameters:

| Param | Default | Max | Description |
|-------|---------|-----|-------------|
| `page` | 1 | — | Page number |
| `limit` | 20 | 100 | Items per page |
| `search` | — | — | Search term (where applicable) |

Response shape for paginated lists:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
}
```

## Data Format

- Field names: **camelCase**
- Dates: **ISO 8601 strings** (e.g. `"2026-10-31T12:00:00.000Z"`)
- Money: **Numbers with 2 decimals** (e.g. `24900.00`), not strings
- IDs: **UUIDs** (strings)
- Booleans: `true` / `false`

## Using the Helpers

### Response helpers (`src/utils/response.js`)

```js
import { success, created, error } from '../../../utils/response.js';

// 200
return success(res, user, 'Profile updated');

// 201
return created(res, newInvoice, 'Invoice created');
```

### Pagination helper (`src/utils/pagination.js`)

```js
import { parsePagination, paginated } from '../../../utils/pagination.js';

const { skip, take, page, limit } = parsePagination(req.query);
const [items, total] = await Promise.all([
  prisma.invoice.findMany({ where, skip, take }),
  prisma.invoice.count({ where }),
]);
return success(res, paginated(items, total, page, limit));
```

### Validation (`src/middleware/validate.js`)

```js
import validate from '../../../middleware/validate.js';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  subscriptionId: z.string().uuid(),
  issueDate: z.string().datetime(),
});

router.post('/', validate(createInvoiceSchema), asyncHandler(controller));
```

### Sequence numbers (`src/utils/sequence.js`)

```js
import { nextSequence, formatNumber } from '../../../utils/sequence.js';

const n = await nextSequence('INV', tx);
const number = formatNumber('INV', n);  // → "INV-2026-0001"
```

### Money (`src/utils/money.js`)

```js
import { round2, add, multiply } from '../../../utils/money.js';

const lineTotal = multiply(qty, unitPrice);
const grandTotal = add(subtotal, taxAmount);
```

### Async handler (`src/utils/asyncHandler.js`)

```js
import asyncHandler from '../../../utils/asyncHandler.js';

router.get('/', asyncHandler(async (req, res) => {
  // If this throws, errorHandler catches it automatically
  const items = await prisma.product.findMany();
  return success(res, items);
}));
```

### Custom errors (`src/utils/AppError.js`)

```js
import AppError from '../../../utils/AppError.js';

if (!invoice) throw new AppError('Invoice not found', 404);
if (invoice.status === 'PAID') throw new AppError('Invoice is already paid', 400);
```
