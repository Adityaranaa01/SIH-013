import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { error } from 'console'

async function main() {
  const adminId = process.argv[2]
  const plainPassword = process.argv[3]

  if (!adminId || !plainPassword) {
    console.error('Usage: tsx scripts/set-admin.ts <admin_id> <password>')
    process.exit(1)
  }

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

  // Create DB pool
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
    const passwordHash = await bcrypt.hash(plainPassword, 12)

    await client.query(
      `
      INSERT INTO admin_users (admin_id, name, password_hash)
      VALUES ($1, $1, $2)
      ON CONFLICT (admin_id)
      DO UPDATE
      SET name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash
    `,
      [adminId, passwordHash]
    )

    console.log(`Admin "${adminId}" password set successfully`)
  } catch (err) {
    console.error('Failed to set admin password:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
