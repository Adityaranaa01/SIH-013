import { error } from 'console'
import { Kysely, PostgresDialect, Selectable, ColumnType } from 'kysely'
import pg from 'pg'

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
  const rawUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  const sslEnabled =
    process.env.PGSSLMODE === 'require' ||
    process.env.SSL === 'true' ||
    rawUrl?.includes('sslmode=require')

  // Allow self-signed certs if SSL is enabled
  if (sslEnabled) {
    try {
      (pg as any).defaults.ssl = { rejectUnauthorized: false }
    } catch {
      error('Failed to set pg ssl defaults')
    }
  }

  let normalizedUrl = rawUrl
  try {
    if (rawUrl) {
      const url = new URL(rawUrl)
      url.searchParams.delete('sslmode')
      normalizedUrl = url.toString()
    }
  } catch {
    error('Failed to clean connection string')
  }

  // Use connection string if available
  const pool = rawUrl
    ? new pg.Pool({
        connectionString: normalizedUrl,
        ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
        max: envInt('PGPOOL_MAX', 10),
      })
    : new pg.Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
        max: envInt('PGPOOL_MAX', 10),
      })

  return new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
  })
}

function envInt(key: string, fallback: number) {
  const value = process.env[key]
  if (!value) return fallback

  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}
