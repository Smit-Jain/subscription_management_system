# Auth Guide for Teammates

This guide explains how to use the authentication and authorization system built by Member A.

## Middleware Cheat Sheet

### `authenticate`

Requires a valid JWT. Sets `req.user = { id, name, email, role }`.

```js
import authenticate from '../../middleware/authenticate.js';

router.get('/my-stuff', authenticate, asyncHandler(async (req, res) => {
  console.log(req.user.id);   // UUID
  console.log(req.user.role); // 'ADMIN' | 'STAFF' | 'CUSTOMER'
}));
```

### `requireRole(...roles)`

Must come AFTER `authenticate`. Returns 403 if the user's role is not in the list.

```js
import requireRole from '../../middleware/requireRole.js';

// Admin only
router.use(authenticate, requireRole('ADMIN'));

// Admin + Staff
router.use(authenticate, requireRole('ADMIN', 'STAFF'));
```

### Ownership helpers (`src/middleware/ownership.js`)

```js
import { assertOwnerOrStaff, scopeToCustomer, isStaffOrAdmin } from '../../middleware/ownership.js';

// Throw 403 if a CUSTOMER is trying to access another customer's invoice
assertOwnerOrStaff(req, invoice.customerId);

// Scope queries automatically
const invoices = await prisma.invoice.findMany({
  where: {
    ...scopeToCustomer(req),  // customers see only their own; staff see all
    status: 'PAID',
  },
});
```

## Password Rules

Single source of truth: `src/modules/auth/validators.js` → `passwordSchema`

- More than 8 characters (minimum 9)
- At least one uppercase letter
- At least one lowercase letter
- At least one special character

## Roles

| Role | Can access |
|------|-----------|
| `ADMIN` | Everything. Staff/customer management. Taxes & discounts (admin only). |
| `STAFF` | Admin portal (except staff management, taxes, discounts). Customer management. |
| `CUSTOMER` | Customer portal only. Own data only. |

## Sending emails

```js
import { sendEmail, emailTemplate } from '../../utils/email.js';

await sendEmail({
  to: customer.email,
  subject: 'Your invoice is ready',
  html: emailTemplate('Invoice Ready', `<p>Hi ${name}, your invoice #${number} is ready.</p>`),
});
```

If SMTP is not configured, the email prints to the server console — development still works.

## Seed Users (for testing)

| Email | Password | Role |
|-------|----------|------|
| `admin@brightloop.com` | `Admin@12345` | ADMIN |
| `rahul@brightloop.com` | `Staff@12345` | STAFF |
| `priya@brightloop.com` | `Staff@12345` | STAFF |
| `arjun@techcorp.in` | `Customer@123` | CUSTOMER |
| `sneha@greenfield.co` | `Customer@123` | CUSTOMER |
| `vikram@cloudnine.io` | `Customer@123` | CUSTOMER |
| `ananya@finwave.com` | `Customer@123` | CUSTOMER |
| `karthik@logicgate.dev` | `Customer@123` | CUSTOMER |

## For Member D (Profile + Change Password)

The customer Profile page belongs to you. Auth service functions are exported for you:

```js
// In your frontend service file:
import { apiClient } from '../../utils/apiClient.js';

// GET /api/auth/me
export const getMe = () => apiClient.get('/auth/me');

// PATCH /api/auth/me
export const updateProfile = (data) => apiClient.patch('/auth/me', data);

// POST /api/auth/change-password
export const changePassword = (data) => apiClient.post('/auth/change-password', data);
```

These backend endpoints are already built and tested. Just wire them into your UI.
