-- Migration: 0002_buses_assigned_route_fk.sql
-- Purpose: Allow admins to assign buses to routes with referential integrity.
--  - Ensures buses.assigned_route points to routes.route_id
--  - Adds index for quick filtering by route

BEGIN;

-- Ensure column type is varchar for clean FK reference
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'buses'
      AND column_name = 'assigned_route'
      AND udt_name <> 'varchar'
  ) THEN
    ALTER TABLE public.buses
      ALTER COLUMN assigned_route TYPE varchar
      USING assigned_route::varchar;
  END IF;
END $$;

-- Add FK if missing (nullable so unassigned buses are allowed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_buses_assigned_route'
  ) THEN
    ALTER TABLE public.buses
      ADD CONSTRAINT fk_buses_assigned_route
      FOREIGN KEY (assigned_route)
      REFERENCES public.routes(route_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID;
    -- Validate separately to avoid long locks on big tables
    ALTER TABLE public.buses VALIDATE CONSTRAINT fk_buses_assigned_route;
  END IF;
END $$;

-- Helpful index for lookups by route
CREATE INDEX IF NOT EXISTS idx_buses_assigned_route
  ON public.buses (assigned_route);

COMMIT;
