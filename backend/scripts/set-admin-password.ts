import 'dotenv/config'
import { createDb } from '../src/db'

const adminId = process.argv[2]
const bcryptHash = process.argv[3]

if (!adminId || !bcryptHash) {
  console.error(
    'Usage: tsx scripts/set-admin-password.ts <admin_id> <bcrypt_hash>'
  )
  process.exit(1)
}

async function main() {
  const db = createDb()

  try {
    const result = await db
      .updateTable('admin_users')
      .set({ password_hash: bcryptHash })
      .where('admin_id', '=', adminId)
      .executeTakeFirst()

    console.log(`Password updated for admin: ${adminId}`)
    console.log('Result:', result)
  } catch (err) {
    console.error('Failed to update password:', err)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()
