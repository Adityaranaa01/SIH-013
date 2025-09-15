import { FastifyInstance } from 'fastify'
import { Kysely } from 'kysely'
import { DB } from '../db'

export async function registerDriversRoutes(app: FastifyInstance, db: Kysely<DB>) {
  // List drivers (minimal fields)
  app.get('/drivers', async () => {
    const rows = await db.selectFrom('drivers')
      .select([
        'driver_id as id',
        'name',
        'phone',
      ])
      .orderBy('name')
      .execute()
    return rows
  })

  // Create driver
  app.post('/drivers', async (req, reply) => {
    const body = req.body as Partial<{ id: string; name: string; phone?: string | null }>
    const id = (body?.id || '').trim()
    const name = (body?.name || '').trim()
    if (!id || !name) return reply.badRequest('id and name are required')
    try {
      await db.insertInto('drivers').values({
        driver_id: id,
        name,
        phone: body.phone ?? null,
      }).execute()
    } catch (e: any) {
      if (e?.code === '23505') return reply.conflict('Driver already exists')
      throw e
    }
    return { id, name, phone: body.phone ?? null }
  })
}
