import { FastifyInstance } from 'fastify'
import { Kysely } from 'kysely'
import { DB } from '../db'
import bcrypt from 'bcryptjs'

export async function registerDevRoutes(app: FastifyInstance, db: Kysely<DB>) {
  if (process.env.NODE_ENV === 'production') return

  app.post('/dev/seed-admin', async (req, reply) => {
    const body = req.body as { adminId: string; name?: string; password: string }
    if (!body?.adminId || !body?.password) return reply.badRequest('adminId and password required')
    const hash = await bcrypt.hash(body.password, 12)

    const existing = await db.selectFrom('admin_users').selectAll().where('admin_id', '=', body.adminId).executeTakeFirst()
    if (existing) {
      await db.updateTable('admin_users').set({ name: body.name ?? existing.name, password_hash: hash }).where('admin_id', '=', body.adminId).execute()
      return { updated: true }
    } else {
      await db.insertInto('admin_users').values({ admin_id: body.adminId, name: body.name ?? body.adminId, password_hash: hash }).execute()
      return { created: true }
    }
  })
}
