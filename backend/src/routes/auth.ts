import { FastifyInstance } from 'fastify'
import { Kysely } from 'kysely'
import { DB } from '../db'
import { COOKIE_NAME, COOKIE_OPTIONS, signSession, verifySession } from '../auth/jwt'
import bcrypt from 'bcryptjs'

interface LoginBody {
  adminId: string
  password: string
}

interface AdminUserRow {
  id: string
  name: string
  password_hash: string
}

export async function registerAuthRoutes(app: FastifyInstance, db: Kysely<DB>) {
  app.post<{ Body: LoginBody }>('/auth/login', async (req, reply) => {
    const { adminId, password } = req.body

    if (!adminId || !password) {
      return reply.badRequest('Missing credentials')
    }

    const admin = (await db
      .selectFrom('admin_users')
      .select(['admin_id as id', 'name', 'password_hash'])
      .where('admin_id', '=', adminId)
      .executeTakeFirst()) as AdminUserRow | undefined

    // Use a dummy hash to mitigate timing attacks even if user doesn't exist
    const dummyHash =
      '$2a$12$C6UzMDM.H6dfI/f/IKcEeO.ZYZqHI1jB6g7pIcj0/pQ1P0P6/9rGa'

    const valid = admin
      ? await bcrypt.compare(password, admin.password_hash)
      : await bcrypt.compare(password, dummyHash)

    if (!valid || !admin) {
      return reply.unauthorized('Invalid credentials')
    }

    // Sign session token and set cookie
    const token = signSession({ id: admin.id, name: admin.name })
    reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS)

    return { id: admin.id, name: admin.name }
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
