import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import pg from 'pg'
import { error } from 'node:console'

async function main() {
  const rawConn = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  const sslEnabled =
    process.env.PGSSLMODE === 'require' ||
    (rawConn && rawConn.includes('sslmode=require'))

  if (sslEnabled) {
    try {
      (pg as any).defaults.ssl = { rejectUnauthorized: false }
    } catch {
      error('Failed to set pg ssl defaults')
    }
  }

  let cleanConn = rawConn
  if (rawConn) {
    try {
      const url = new URL(rawConn)
      url.searchParams.delete('sslmode')
      cleanConn = url.toString()
    } catch {
      error('Failed to clean connection string')
    }
  }

  // Create a connection pool
  const pool = rawConn
    ? new pg.Pool({
        connectionString: cleanConn,
        ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
      })
    : new pg.Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
      })

  const client = await pool.connect()

  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const migrationsDir = path.resolve(__dirname, '../../db/migrations')

    const files = (await fs.readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    console.log(`Running ${files.length} migrations from ${migrationsDir}`)

    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8')
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
