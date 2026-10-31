# Brightloop Backend

Node.js + Express + Prisma + PostgreSQL API for the Subscription Management System.

## Prerequisites

- **Node.js 18+** (check: `node -v`)
- **PostgreSQL 16** — choose ONE option below:

### Option A: Docker (recommended)

```powershell
cd backend
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with user `brightloop`, password `brightloop_secret`, database `brightloop_dev`.

### Option B: Hosted PostgreSQL (no Docker)

Sign up for a free database at [Neon](https://neon.tech) or [Supabase](https://supabase.com):
1. Create a new project and database.
2. Copy the connection string (starts with `postgresql://...`).
3. Paste it into your `.env` file as `DATABASE_URL`.

## Setup

```powershell
# 1. Go to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file
Copy-Item .env.example .env
# Then edit .env — set DATABASE_URL (if not using Docker defaults) and JWT_SECRET

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migration
npx prisma migrate dev --name init

# 6. Seed the database
npm run db:seed

# 7. Start the dev server
npm run dev
```

## Verify

```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{ "success": true, "data": { "status": "ok", "timestamp": "..." } }
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with `--watch` (auto-restart) |
| `start` | `npm start` | Production start |
| `db:migrate` | `npm run db:migrate` | Create new migration |
| `db:deploy` | `npm run db:deploy` | Apply migrations (CI/prod) |
| `db:seed` | `npm run db:seed` | Run the seed script |
| `db:reset` | `npm run db:reset` | Reset DB + re-migrate (destructive!) |
| `db:studio` | `npm run db:studio` | Open Prisma Studio GUI |
| `db:generate` | `npm run db:generate` | Regenerate Prisma client |

## Environment Variables

See `.env.example` for all variables. Required ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs (min 16 chars) |
| `FRONTEND_URL` | Frontend URL for CORS + email links |

SMTP variables are optional — if not set, emails print to console.

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Complete database schema
│   └── seed/                  # Seed files (one per module)
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Entry point
│   ├── config/
│   │   ├── env.js             # Env var loader + validation
│   │   └── prisma.js          # PrismaClient singleton
│   ├── middleware/
│   │   ├── authenticate.js    # JWT auth + DB user lookup
│   │   ├── requireRole.js     # Role-based access
│   │   ├── validate.js        # Zod validation
│   │   ├── errorHandler.js    # Central error handler
│   │   ├── notFound.js        # 404 handler
│   │   ├── rateLimiters.js    # Rate limiting
│   │   └── ownership.js       # Customer data scoping
│   ├── utils/
│   │   ├── AppError.js        # Custom error class
│   │   ├── asyncHandler.js    # Async route wrapper
│   │   ├── response.js        # { success, data, message } helpers
│   │   ├── pagination.js      # Paginated queries
│   │   ├── sequence.js        # Counter-based sequences
│   │   ├── money.js           # Safe money arithmetic
│   │   ├── email.js           # Nodemailer + dev console fallback
│   │   └── tokens.js          # JWT + crypto token helpers
│   ├── routes/index.js        # Route aggregator
│   └── modules/
│       ├── auth/              # Member A: auth, staff, customers
│       ├── catalog/index.js   # Member B: placeholder
│       ├── billing/index.js   # Member C: placeholder
│       └── finance/index.js   # Member D: placeholder
└── docs/                      # Team documentation
```

## Troubleshooting

### "Cannot find module '@prisma/client'"
Run `npx prisma generate` after installing dependencies.

### "Connection refused" on database
Make sure PostgreSQL is running. Docker: `docker compose up -d`. Check `DATABASE_URL` in `.env`.

### "JWT_SECRET must be at least 16 characters"
Set a long, random string in your `.env` file.

### Migration fails
If you get conflicts, try `npm run db:reset` (⚠️ deletes all data).

### Port already in use
Change `PORT` in `.env` or kill the process: `npx kill-port 5000`
