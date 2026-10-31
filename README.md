# Brightloop Software – Subscription Management System

Enterprise-grade subscription management, billing engine, quotation builder, and financial tracking platform built for Brightloop Software.

---

## 👥 Team Ownership & Architecture

| Member | Domain & Modules | Key Responsibilities |
|---|---|---|
| **Member A** | **Auth, Foundation, Staff** | User authentication (JWT, bcrypt), Role-based access control (`ADMIN`, `STAFF`, `CUSTOMER`), Customer management, Database foundation & `Counter` sequence generator. |
| **Member B** | **Catalog & Subscriptions** | Products, variants, plans, quotation templates, and subscription lifecycle management. |
| **Member C (Me)** | **Billing Engine** | Tax management, discount campaigns, invoice lifecycle (`Draft` → `Confirmed` → `Paid` / `Cancelled`), automatic recurring billing scheduler, missed-billing recovery, and financial calculations. |
| **Member D** | **Finance & Payments** | Payment recording, finance dashboard, revenue analytics, overdue invoice tracking, and customer payment portal. |

---

## 🚀 Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v3, React Router v7, Lucide React, Recharts.
  - Custom warm palette: `cream`, `paper`, `ink`, `forest`, `marigold`, `coral`, `lilac`, `mint`, and `sky`.
- **Backend:** Node.js (ESM), Express 4, Prisma ORM 5.22.0, PostgreSQL (Neon Serverless DB).
- **Communication:** REST APIs under `/api`, JWT Bearer token authentication, camelCase fields, and ISO-8601 timestamps.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node 25)
- PostgreSQL database (configured via Neon PostgreSQL in `.env`)

### 2. Backend Setup
```bash
cd backend
npm install
npx -y prisma@5.22.0 generate
node -e "import('./prisma/seed/index.js')"
npm run dev
```
Backend will start on `http://localhost:5001`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🧾 Billing Engine (Member C Implementation Details)

### Core Capabilities
1. **Tax Management (`/api/billing/taxes`):**
   - Percentage-based rules (0%–100%) with product association (`TaxProduct`) and global coverage (`appliesToAll`).
   - Admin-only CRUD operations; Staff read access.
2. **Discount Management (`/api/billing/discounts`):**
   - Supports `FIXED` amount and `PERCENTAGE` discounts.
   - Granular constraints: `minPurchase`, `minQuantity`, `usageLimit`, validity date windows (`startDate`, `endDate`).
   - Atomic usage incrementation prevents concurrency race conditions.
3. **Invoice Lifecycle (`/api/billing/invoices`):**
   - Statuses: `DRAFT` → `CONFIRMED` → `PAID` / `CANCELLED`.
   - Derived `OVERDUE` state for invoices where `dueDate < now` and status is not paid or cancelled.
   - Historical snapshotting: Product names, unit prices, tax percentages, and discount amounts are permanently preserved on lines.
4. **Automatic Recurring Billing Engine:**
   - **Idempotency Guarantee:** Unique constraint on `(subscriptionId, billingPeriodStart)` prevents double billing under all concurrent conditions.
   - **Missed-Billing Recovery:** Sequentially calculates and catches up missed past billing periods without skipping intervals.
   - **Date Calculation Policy:**
     - Handles `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` intervals.
     - Month-end dates are capped at the last valid day of the month (e.g. Jan 31 + 1 month in 2025 → Feb 28; in leap year 2024 → Feb 29).
     - Leap day yearly billing advances Feb 29 to Feb 28 in non-leap years.
5. **Background Scheduler:**
   - Periodic recurring execution with execution locks (`isJobRunning`) to prevent overlapping executions.
   - Manual trigger endpoint (`POST /api/billing/invoices/generate`) using the identical engine logic.

---

## 🧪 Testing

To run the automated billing tests:

```bash
cd backend

# Unit & Engine tests (Date math, idempotency, catch-up, financial math)
node tests/billing.test.js

# HTTP API integration tests (RBAC, customer scoping, PDF, email)
node tests/api.integration.test.js
```
