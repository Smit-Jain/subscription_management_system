# Brightloop Software — Subscription Management System (Frontend)

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
npm run preview
```

---

## Folder Structure

```
frontend/src/
  app/               App.jsx, router setup, providers wrapper
  routes/index.jsx   Combines all module route arrays (one import per module)
  layouts/           PublicLayout, AdminLayout (sidebar), CustomerLayout (top navbar)
  components/ui/     Shared UI components (Button, Card, DataTable, Modal, etc.)
  context/           RoleContext (demo role switcher), ToastContext
  utils/             formatCurrency (rupee symbol), formatDate helpers
  mock/              Realistic mock data: users, products, plans, subscriptions,
                     invoices, payments, taxes, discounts (20+ rows each)
  modules/
    auth/            Member A
    catalog/         Member B
    billing/         Member C
    finance/         Member D
```

## Module Ownership

| Member | Module folder | Pages |
|--------|--------------|-------|
| A | `src/modules/auth/` | Login, Signup, Forgot/Reset Password, Staff Management |
| B | `src/modules/catalog/` | Products, Plans, Quotation Templates, Subscriptions |
| C | `src/modules/billing/` | Taxes, Discounts, Invoices |
| D | `src/modules/finance/` | Dashboard, Payments, Overdue, Reports, Customer Portal |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| cream | #FBF6EC | Page background |
| paper | #FFFDF8 | Cards, panels |
| ink | #1E1B2E | Dark text, sidebar |
| ink-soft | #6B667A | Secondary text |
| forest | #0E5A55 | Primary brand |
| forest-light | #DDF0EA | Soft brand tint |
| marigold | #F6B73C | Accent / CTA |
| coral | #FF6A4D | Alerts / danger |
| lilac | #DCD3F7 | Soft accent |
| mint | #3FBF8F | Success |
| sky | #7CC4F0 | Info |
| border | #EADFCB | Borders |

## Adding a New Page / Route

1. Create page in correct module: `src/modules/<module>/pages/NewPage.jsx`
2. Add mock service in `services/` folder
3. Add route in `<module>.routes.jsx`
4. Add sidebar link in `src/layouts/AdminSidebar.jsx`

## Demo Role Switcher

Floating widget bottom-right — switch Admin / Staff / Customer. Stored in RoleContext + localStorage.
TODO(A): Replace with real auth when implemented.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:5000/api`
