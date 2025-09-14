-- Migration: 0001_init_core_tables.sql
-- Purpose: Create minimal tables required by the frontend: admin_users, routes, route_stops
-- Notes:
--  - Column names align with the frontend models (routeId/start/end, stops with sequence/name/lat/long).
--  - "end" is quoted as it can be a keyword in some contexts.
--  - Includes a simple updated_at trigger for automatic timestamp maintenance.
--  - Email removed by request: admin login uses only (admin_id, password).
--  - Role removed by request: no roles column in admin_users.

BEGIN;

-- 1) Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  admin_id       varchar PRIMARY KEY,
  name           varchar NOT NULL,
  password_hash  text    NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 2) Routes (route header)
CREATE TABLE IF NOT EXISTS routes (
  route_id    varchar PRIMARY KEY,
  name        varchar,
  start       varchar NOT NULL,
  "end"       varchar NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3) Route stops (ordered list of stops per route)
CREATE TABLE IF NOT EXISTS route_stops (
  route_id    varchar NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
  stop_id     varchar NOT NULL,
  name        varchar NOT NULL,
  latitude    float8  NOT NULL,
  longitude   float8  NOT NULL,
  sequence    int     NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (route_id, stop_id),
  UNIQUE (route_id, sequence)
);

-- Helpful index for ordered reads in route details
CREATE INDEX IF NOT EXISTS idx_route_stops_route_sequence
  ON route_stops (route_id, sequence);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON admin_users;
CREATE TRIGGER trg_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_routes_updated_at ON routes;
CREATE TRIGGER trg_routes_updated_at
BEFORE UPDATE ON routes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_route_stops_updated_at ON route_stops;
CREATE TRIGGER trg_route_stops_updated_at
BEFORE UPDATE ON route_stops
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
