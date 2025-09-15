import 'dotenv/config'
import { createDb } from '../src/db'

const adminId = process.argv[2]
const hash = process.argv[3]
if (!adminId || !hash) {
  console.error('Usage: tsx scripts/set-admin-password.ts <admin_id> <bcrypt_hash>')
  process.exit(1)
}

async function main() {
  const db = createDb()
  const res = await db.updateTable('admin_users').set({ password_hash: hash }).where('admin_id', '=', adminId).executeTakeFirst()
  console.log('Updated', res)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
