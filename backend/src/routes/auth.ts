import { FastifyInstance } from 'fastify'
import { Kysely } from 'kysely'
import { DB } from '../db'
import { COOKIE_NAME, COOKIE_OPTIONS, signSession, verifySession } from '../auth/jwt'
import bcrypt from 'bcryptjs'

export async function registerAuthRoutes(app: FastifyInstance, db: Kysely<DB>) {
  app.post('/auth/login', async (req, reply) => {
    const body = req.body as { adminId: string; password: string }
    if (!body?.adminId || !body?.password) return reply.badRequest('Missing credentials')

    const admin = await db.selectFrom('admin_users')
      .select(['admin_id as id', 'name', 'password_hash'])
      .where('admin_id', '=', body.adminId)
      .executeTakeFirst()

    if (!admin) return reply.unauthorized('Invalid credentials')
    const ok = await bcrypt.compare(body.password, (admin as any).password_hash)
    if (!ok) return reply.unauthorized('Invalid credentials')

    const token = signSession({ id: (admin as any).id, name: (admin as any).name })
    reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    return { id: (admin as any).id, name: (admin as any).name }
  })

  app.get('/me', async (req, reply) => {
    const token = req.cookies[COOKIE_NAME]
    if (!token) return reply.unauthorized()
    const session = verifySession(token)
    if (!session) return reply.unauthorized()
    return { id: session.id, name: session.name }
  })

  app.post('/auth/logout', async (_req, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' })
    return { ok: true }
  })
}
