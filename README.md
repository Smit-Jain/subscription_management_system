# Brightloop Software – Subscription Management System

Enterprise-grade subscription management platform built for **Brightloop Software**.
Covers the full lifecycle: product catalog → subscriptions → billing → payments → finance reporting.

---

## 👥 Team Ownership & Architecture

| Member | Domain | Key Responsibilities |
|---|---|---|
| **Member A** | Foundation & Auth | Project skeleton, database schema, JWT authentication (bcrypt), role-based access control (ADMIN / STAFF / CUSTOMER), staff management, password reset flow, shared UI components & layouts |
| **Member B** | Catalog & Subscriptions | Products with variants, plans with billing periods, quotation templates, subscription lifecycle (Draft → Quotation → Confirmed → Active → Closed), auto-generated subscription numbers |
| **Member C** | Billing Engine | Tax rules, discount campaigns, automatic invoice generation (cron), missed-billing recovery, idempotent billing engine, invoice lifecycle (Draft → Confirmed → Paid / Cancelled), PDF & email |
| **Member D** | Finance & Payments | Payment recording (multi-method), overdue tracking, finance dashboard with analytics, customer self-service portal |

---

## 🚀 Technology Stack

### Frontend
- **React 18** + **Vite 8** + **Tailwind CSS v3**
- **React Router v6**, **Lucide React**, **Recharts**
- Custom warm design palette: `cream`, `paper`, `ink`, `forest`, `marigold`, `coral`, `lilac`, `mint`, `sky`

### Backend
- **Node.js (ESM)** + **Express 4**
- **Prisma ORM 5.22.0** + **PostgreSQL** (Neon Serverless)
- REST APIs under `/api` — responses shaped as `{ success, data, message }`
- **JWT Bearer token** authentication, `camelCase` fields, ISO-8601 timestamps

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (we use Neon Serverless — configure your own in `.env`)

### 1. Clone & configure environment

```bash
git clone <repo-url>
cd subscription_management_system
```

Copy the example env files and fill in your own values:

```bash
cp backend/.env.example backend/.env
```

Create `frontend/.env` and add:
```env
VITE_API_URL=http://localhost:5001/api
```

> ⚠️ **Port note:** macOS AirPlay occupies port 5000. This project runs the backend on **port 5001**.

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend starts at → `http://localhost:5001`  
Health check → `http://localhost:5001/api/health`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at → `http://localhost:5173`

---

## 🗂️ API Reference

### Auth — `/api/auth`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/signup` | Public |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |
| GET | `/auth/me` | Authenticated |
| PATCH | `/auth/me` | Authenticated |
| POST | `/auth/change-password` | Authenticated |

### Catalog — `/api/catalog`
| Method | Endpoint | Access |
|---|---|---|
| GET / POST | `/catalog/products` | Admin, Staff |
| PATCH / DELETE | `/catalog/products/:id` | Admin only |
| GET / POST / PATCH | `/catalog/plans` | Admin only (GET: all roles) |
| GET / POST / PATCH / DELETE | `/catalog/templates` | Admin, Staff |
| GET / POST | `/catalog/subscriptions` | Admin, Staff, Customer |
| PATCH | `/catalog/subscriptions/:id/status` | Admin, Staff |
| GET | `/catalog/customers` | Admin, Staff |
| GET | `/catalog/customers/:id` | Admin, Staff |

### Billing — `/api/billing`
| Method | Endpoint | Access |
|---|---|---|
| GET / POST / PATCH / DELETE | `/billing/taxes` | Admin (GET: Staff) |
| GET / POST / PATCH / DELETE | `/billing/discounts` | Admin only |
| GET / POST | `/billing/invoices` | Admin, Staff |
| PATCH | `/billing/invoices/:id/status` | Admin, Staff |
| POST | `/billing/invoices/generate` | Admin only |

### Finance — `/api/finance`
| Method | Endpoint | Access |
|---|---|---|
| GET / POST | `/finance/payments` | Admin, Staff |
| GET | `/finance/dashboard` | Admin, Staff |
| GET | `/finance/overdue` | Admin, Staff |
| GET | `/finance/reports` | Admin, Staff |

---

## 📦 Catalog & Subscriptions (Member B)

- **Products** — Full CRUD with variants (attribute + extra price). Sales price ≥ cost price enforced.
- **Plans** — Billing periods: `DAILY / WEEKLY / MONTHLY / YEARLY`. Flags: `autoClose`, `closableEarly`, `pausable`, `renewable`. Date range validation.
- **Quotation Templates** — Pre-fill subscriptions with a plan + product lines + validity days.
- **Subscriptions** — Auto-numbered (`SUB-YYYY-NNNN`). Status flow: `Draft → Quotation → Confirmed → Active → Closed`. Pause / renew / early-close only when plan flags allow.

---

## 🧾 Billing Engine (Member C)

- **Tax Rules** — Percentage-based (0–100%), per-product or global (`appliesToAll`).
- **Discount Campaigns** — `FIXED` or `PERCENTAGE`. Constraints: `minPurchase`, `minQuantity`, `usageLimit`, date windows. Atomic usage increment prevents race conditions.
- **Invoice Generation** — Cron-based scheduler + manual trigger (`POST /api/billing/invoices/generate`).
- **Idempotency** — Unique constraint on `(subscriptionId, billingPeriodStart)` — run twice, get one invoice.
- **Missed Billing Recovery** — Catches up all unpaid periods in sequence without skipping intervals.
- **Date Math** — Month-end capping and leap-year handling for `MONTHLY` and `YEARLY` intervals.
- **Invoice Status** — `DRAFT → CONFIRMED → PAID / CANCELLED`. Overdue derived when `dueDate < now`.

---

## 💳 Finance & Payments (Member D)

- **Payments** — Multi-method (Cash, Card, Bank Transfer, UPI). Partial payments supported. Invoice auto-marked `PAID` when fully covered.
- **Overdue Tracking** — Automatic flagging past due date. Staff list for follow-up.
- **Finance Dashboard** — Active subscriptions, revenue collected, outstanding balance, overdue invoices, recent payments. Date / status / customer / plan filters.
- **Customer Portal** — Customers see only their own data. Plan-permitted actions (pause, renew, close, download invoice).

---

## 📁 Project Structure

```
subscription_management_system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Full database schema
│   │   └── seed/                  # Seed scripts per module
│   ├── src/
│   │   ├── config/                # DB, env, Prisma client
│   │   ├── middleware/            # authenticate, requireRole, validate, rateLimiters
│   │   ├── modules/
│   │   │   ├── auth/              # Member A
│   │   │   ├── catalog/           # Member B
│   │   │   ├── billing/           # Member C
│   │   │   └── finance/           # Member D
│   │   └── utils/                 # response, pagination, tokens, email, AppError
│   └── .env.example
└── frontend/
    └── src/
        ├── modules/
        │   ├── auth/              # Member A pages
        │   ├── catalog/           # Member B pages
        │   ├── billing/           # Member C pages
        │   └── finance/           # Member D pages
        ├── components/ui/         # Shared design system
        ├── layouts/               # AdminLayout, CustomerLayout, PublicLayout
        ├── context/               # AuthContext (JWT), ToastContext
        └── routes/                # Route definitions with PrivateRoute guards
```

---

## 🔐 Role-Based Access

| Feature | Admin | Staff | Customer |
|---|---|---|---|
| Products / Plans / Templates | ✅ Full | 🔒 Read | ❌ |
| Subscriptions | ✅ Full | ✅ Full | Own only |
| Invoices | ✅ Full | ✅ Full | Own only |
| Taxes / Discounts | ✅ Full | ❌ | ❌ |
| Payments | ✅ Full | ✅ Full | Own only |
| Finance Dashboard | ✅ | ✅ | ❌ |
| Staff Management | ✅ | ❌ | ❌ |
| Customer Portal | ❌ | ❌ | ✅ |

---

*Built for Brightloop Software Hackathon 2026.*
