import 'dotenv/config'
import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('Usage: tsx scripts/generate-hash.ts <password>')
  process.exit(1)
}

async function main() {
  const hash = await bcrypt.hash(password, 12)
  console.log(hash)
}

main().catch((e) => { console.error(e); process.exit(1) })
