import { Kysely, PostgresDialect, Selectable, ColumnType } from 'kysely'
import pg from 'pg'

// Minimal DB interface aligned to existing schema; extend as needed.
interface RoutesTable {
  route_id: string
  name: ColumnType<string | null, string | null | undefined, string | null>
  start: string
  end: string
  is_active: ColumnType<boolean, boolean | undefined, boolean | undefined>
  created_at: ColumnType<string, string | undefined, string | undefined>
  updated_at: ColumnType<string, string | undefined, string | undefined>
}

interface RouteStopsTable {
  route_id: string
  stop_id: string
  name: string
  latitude: number
  longitude: number
  sequence: number
  created_at: ColumnType<string, string | undefined, string | undefined>
  updated_at: ColumnType<string, string | undefined, string | undefined>
}

interface BusesTable {
  bus_number: string
  status: string | null
  current_driver: string | null
  assigned_route: string | null
  created_at: ColumnType<string | null, string | null | undefined, string | null | undefined>
  updated_at: ColumnType<string | null, string | null | undefined, string | null | undefined>
}

interface DriversTable {
  driver_id: string
  name: string
  phone: string | null
  created_at: ColumnType<string, string | undefined, string | undefined>
  updated_at: ColumnType<string, string | undefined, string | undefined>
}

interface AdminUsersTable {
  admin_id: string
  name: string
  password_hash: string
  created_at: ColumnType<string, string | undefined, string | undefined>
  updated_at: ColumnType<string, string | undefined, string | undefined>
}

export interface DB {
  routes: RoutesTable
  route_stops: RouteStopsTable
  buses: BusesTable
  drivers: DriversTable
  admin_users: AdminUsersTable
}

export type RouteRow = Selectable<RoutesTable>
export type RouteStopRow = Selectable<RouteStopsTable>
export type BusRow = Selectable<BusesTable>

export function createDb() {
  // Prefer a single connection string (e.g., Supabase) when provided
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  const ssl = process.env.PGSSLMODE === 'require' || process.env.SSL === 'true' || (connectionString?.includes('sslmode=require'))

  // For hosted providers like Supabase, cert chains may be self-signed. In that case,
  // explicitly disable certificate verification to avoid SELF_SIGNED_CERT_IN_CHAIN.
  // This still uses TLS, just without CA validation.
  if (ssl) {
    try {
      ;(pg as any).defaults.ssl = { rejectUnauthorized: false }
    } catch {}
  }

  // Normalize connection string: remove sslmode from URL and rely on explicit ssl options to avoid conflicting settings
  let normalized = connectionString
  try {
    if (connectionString) {
      const url = new URL(connectionString)
      url.searchParams.delete('sslmode')
      normalized = url.toString()
    }
  } catch {}

  const pool = connectionString
    ? new pg.Pool({ connectionString: normalized, ssl: ssl ? { rejectUnauthorized: false } : undefined, max: envInt('PGPOOL_MAX', 10) })
    : new pg.Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: ssl ? { rejectUnauthorized: false } : undefined,
        max: envInt('PGPOOL_MAX', 10)
      })

  return new Kysely<DB>({
    dialect: new PostgresDialect({ pool })
  })
}

function envInt(key: string, def: number) {
  const v = process.env[key]
  if (!v) return def
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}
