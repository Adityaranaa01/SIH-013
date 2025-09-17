# SmartTransit Backend (Fastify + TypeScript)

This is a minimal backend scaffold aligned with the existing frontend and SQL migrations.

## Features
- Fastify + TypeScript
- PostgreSQL via Kysely
- CORS configured for the Vite dev server
- Endpoints:
  - GET /healthz
  - GET /routes
  - GET /routes/:routeId
  - GET /buses
  - PATCH /buses/:busNumber
- Swagger UI at /docs

## Setup
1. Copy env
   cp .env.example .env
   # Edit values if needed

2. Install deps
   npm install

3. Run in dev
   npm run dev

The API will listen on PORT (default 3001).

## Notes
- The DB schema is expected to match the SQL files under ../../db/migrations.
- The buses endpoint projects DB fields to the UI shape; optional bus fields are returned as null for now.
- Extend Kysely typings in src/db.ts when you add more tables/columns.