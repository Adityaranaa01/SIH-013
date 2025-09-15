import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import pg from 'pg'

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  const ssl = process.env.PGSSLMODE === 'require' || (connectionString?.includes('sslmode=require'))

  // Match server behavior: for hosted providers, disable CA verification to avoid SELF_SIGNED_CERT_IN_CHAIN
  if (ssl) {
    try { (pg as any).defaults.ssl = { rejectUnauthorized: false } } catch {}
  }

  // Normalize: strip sslmode from URL and rely on explicit ssl option
  let normalized = connectionString
  try {
    if (connectionString) {
      const url = new URL(connectionString)
      url.searchParams.delete('sslmode')
      normalized = url.toString()
    }
  } catch {}

  const pool = connectionString
    ? new pg.Pool({ connectionString: normalized, ssl: ssl ? { rejectUnauthorized: false } : undefined })
    : new pg.Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: ssl ? { rejectUnauthorized: false } : undefined,
      })

  const client = await pool.connect()
  try {
    const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url))
    const migrationsDir = path.resolve(__dirnameLocal, '../../db/migrations')
    const files = (await fs.readdir(migrationsDir))
      .filter(f => f.endsWith('.sql'))
      .sort()
    console.log(`Running ${files.length} migrations from ${migrationsDir}`)
    for (const file of files) {
      const full = path.join(migrationsDir, file)
      const sql = await fs.readFile(full, 'utf8')
      console.log(`\n>>> Applying ${file}`)
      await client.query(sql)
      console.log(`<<< Done ${file}`)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
