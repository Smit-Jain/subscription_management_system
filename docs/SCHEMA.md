# Database Schema Reference

> Last updated by Member A. If you need a schema change, open a small PR, tag Member A, create a new migration. **Never edit an existing migration file.**

## Table Ownership

| Owner | Tables |
|-------|--------|
| **A (Auth/Foundation)** | `User`, `PasswordResetToken`, `Counter` |
| **B (Catalog)** | `Product`, `ProductVariant`, `Plan`, `QuotationTemplate`, `QuotationTemplateLine`, `Subscription`, `SubscriptionLine` |
| **C (Billing)** | `Tax`, `TaxProduct`, `Discount`, `DiscountProduct`, `DiscountSubscription`, `Invoice`, `InvoiceLine`, `InvoiceDiscount` |
| **D (Finance)** | `Payment` |

## Enums

| Enum | Values |
|------|--------|
| `Role` | `ADMIN`, `STAFF`, `CUSTOMER` |
| `BillingPeriod` | `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |
| `SubscriptionStatus` | `DRAFT`, `QUOTATION`, `CONFIRMED`, `ACTIVE`, `CLOSED` |
| `InvoiceStatus` | `DRAFT`, `CONFIRMED`, `PAID`, `CANCELLED` |
| `DiscountType` | `FIXED`, `PERCENTAGE` |
| `DiscountAppliesTo` | `PRODUCTS`, `SUBSCRIPTION` |
| `PaymentMethod` | `CASH`, `CARD`, `BANK_TRANSFER`, `UPI`, `CHEQUE`, `OTHER` |

## Models

### User (Owner: A)
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| name | String | Required |
| email | String | Unique, stored lowercase |
| passwordHash | String | Never exposed to clients |
| role | Role | Default: `CUSTOMER` |
| phone | String? | Optional |
| company | String? | Optional |
| isActive | Boolean | Default: `true` |
| createdById | String? | FK → User (self-ref) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

**Indexes:** `role`, `isActive`

### PasswordResetToken (Owner: A)
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| userId | String | FK → User (cascade) |
| tokenHash | String | Unique, SHA-256 of raw token |
| expiresAt | DateTime | TTL from env |
| usedAt | DateTime? | Set on use (single use) |

### Counter (Owner: A)
| Field | Type | Notes |
|-------|------|-------|
| key | String | Unique, e.g. `"SUB"`, `"INV"` |
| value | Int | Auto-incremented atomically |

Usage: `nextSequence('SUB')` → 1, 2, 3… `formatNumber('SUB', 1, 2026)` → `"SUB-2026-0001"`

### Product (Owner: B)
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| type | String | e.g. "Software", "Service", "Add-on" |
| salesPrice | Decimal(12,2) | |
| costPrice | Decimal(12,2) | |
| notes | String? | |
| isActive | Boolean | |

### ProductVariant (Owner: B)
| Field | Type | Notes |
|-------|------|-------|
| productId | String | FK → Product (cascade) |
| attribute | String | e.g. "Brand" |
| value | String | e.g. "Odoo" |
| extraPrice | Decimal(12,2) | |

**Unique:** `(productId, attribute, value)`

### Plan (Owner: B)
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| price | Decimal(12,2) | |
| billingPeriod | BillingPeriod | |
| minQuantity | Int | Default: 1 |
| availableFrom | DateTime | |
| availableTo | DateTime? | Null = no end date |
| autoClose | Boolean | Default: false |
| closableEarly | Boolean | Default: true |
| pausable | Boolean | Default: true |
| renewable | Boolean | Default: true |
| isActive | Boolean | Default: true |

### QuotationTemplate / QuotationTemplateLine (Owner: B)
Template has `planId`, `validityDays`, `notes?`. Lines reference `productId`, `variantId?`, `quantity`.

### Subscription (Owner: B)
| Field | Type | Notes |
|-------|------|-------|
| number | String | Unique (SUB-YYYY-NNNN) |
| customerId | String | FK → User (restrict) |
| planId | String | FK → Plan (restrict) |
| status | SubscriptionStatus | Default: DRAFT |
| isPaused | Boolean | Default: false |
| startDate, expiryDate | DateTime | |
| paymentTerms | String | e.g. "Net 30" |
| paymentTermsDays | Int | Default: 30 |
| nextBillingDate | DateTime? | For auto-billing |
| lastBilledThrough | DateTime? | |

**Indexes:** `status`, `customerId`, `nextBillingDate`, `expiryDate`

### Tax / TaxProduct (Owner: C)
Tax has `name`, `percentage`, `appliesToAll`, `isActive`. TaxProduct is the join table to Product.

### Discount / DiscountProduct / DiscountSubscription (Owner: C)
Discount has `name`, `code?` (unique), `type`, `value`, `minPurchase?`, `minQuantity?`, `startDate`, `endDate`, `usageLimit?`, `usedCount`, `appliesTo`, `isActive`.

### Invoice / InvoiceLine / InvoiceDiscount (Owner: C)
| Field | Type | Notes |
|-------|------|-------|
| number | String | Unique (INV-YYYY-NNNN) |
| subscriptionId | String | FK → Subscription (restrict) |
| customerId | String | FK → User (restrict) |
| billingPeriodStart/End | DateTime | |
| subtotal, discountTotal, taxTotal, total, amountPaid | Decimal(12,2) | |

**Unique:** `(subscriptionId, billingPeriodStart)` — prevents double billing

> **Note:** "Overdue" is **derived** (`dueDate < today AND status NOT IN (PAID, CANCELLED)`), not stored.

### Payment (Owner: D)
| Field | Type | Notes |
|-------|------|-------|
| invoiceId | String | FK → Invoice (restrict) |
| amount | Decimal(12,2) | |
| method | PaymentMethod | |
| paidAt | DateTime | |
| recordedById | String? | FK → User |

## How to Request a Schema Change

1. Open a PR with a clear title (e.g. "Add `currency` field to Invoice").
2. Tag Member A as reviewer.
3. Create a **new** migration: `npx prisma migrate dev --name add_invoice_currency`
4. **Never** edit an existing migration file.
