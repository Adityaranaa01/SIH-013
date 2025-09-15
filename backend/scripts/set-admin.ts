import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcryptjs'

async function main() {
  const adminId = process.argv[2]
  const password = process.argv[3]
  if (!adminId || !password) {
    console.error('Usage: tsx scripts/set-admin.ts <admin_id> <password>')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  const ssl = process.env.PGSSLMODE === 'require' || (connectionString?.includes('sslmode=require'))

  if (ssl) {
    try { (pg as any).defaults.ssl = { rejectUnauthorized: false } } catch {}
  }

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
    const hash = await bcrypt.hash(password, 12)
    await client.query(
      `INSERT INTO admin_users (admin_id, name, password_hash) VALUES ($1, $1, $2)
       ON CONFLICT (admin_id) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
      [adminId, hash]
    )
    console.log(`Admin ${adminId} password updated`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
