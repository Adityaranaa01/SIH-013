# SmartTransit Admin Panel

This repo contains a minimal backend (Fastify + TypeScript + PostgreSQL via Kysely) and a Vite/React frontend.

## Prerequisites
- Node.js 18+
- A PostgreSQL database
- Configure DB connection using one of:
  - `DATABASE_URL` (preferred, e.g. for Supabase; `?sslmode=require` supported)
  - or the standard `PG*` envs: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- Optional: `PGSSLMODE=require` to enable TLS (the code will accept self-signed chains, suitable for many hosted DBs)

## Backend: common commands
All commands are run from `backend/`.

- Install deps
```sh
npm install
```

- Run dev server (http://localhost:3001, Swagger at /docs)
```sh
npm run dev
```

- Build and start
```sh
npm run build && npm start
```

- Run SQL migrations (applies all files under `db/migrations/` in order)
```sh
npm run migrate
```

## Create or update an admin user
Admins are stored in table `admin_users (admin_id, name, password_hash, ...)`.
Use the provided script to create or update an admin and set their password in one step.

From `backend/` run:

- Using npm script
```sh
npm run set-admin -- <admin_id> <password>
```

- Direct with tsx
```sh
npx tsx scripts/set-admin.ts <admin_id> <password>
```

Notes
- This will upsert the row by `admin_id`, set `name` = `admin_id` (you can change later), and hash the password using bcrypt.
- Make sure your database env vars are set in your shell or `.env`.

Optional: generate a bcrypt hash manually
- If you need a hash (e.g., to seed data), you can use:
```sh
npx tsx scripts/generate-hash.ts <password>
```

## Frontend: common commands
All commands are run from `frontend/`.

- Install deps
```sh
npm install
```

- Dev server
```sh
npm run batman
```

- Build
```sh
npm run build
```

## Auth overview
- Login endpoint: `POST /auth/login` with JSON `{ "adminId": string, "password": string }`
- On success, the API sets an HTTP-only session cookie `st_admin` valid for 8h
- Current user endpoint: `GET /me`
- Logout: `POST /auth/logout`

Configure `WEB_ORIGIN` (default `http://localhost:5173`) to enable CORS and credentials.

## Health checks
- API: `GET /healthz`
- DB: `GET /healthz/db`

## Environment variables (summary)
- Backend
  - `PORT` (default 3001)
  - `WEB_ORIGIN` (default `http://localhost:5173`)
  - `JWT_SECRET` (default dev secret; set a strong value in production)
  - `DATABASE_URL` or `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD`
  - `PGSSLMODE=require` (optional; enables TLS and accepts self-signed chains)
