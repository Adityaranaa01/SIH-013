import { FastifyInstance } from 'fastify'
import { Kysely, sql } from 'kysely'
import { DB } from '../db'

export async function registerRoutesCrud(app: FastifyInstance, db: Kysely<DB>) {
  app.post('/routes', async (req, reply) => {
    const body = req.body as { routeId: string; start: string; end: string; stops?: Array<{ stopNumber: number; name: string; lat: number; long: number }> }
    if (!body?.routeId || !body?.start || !body?.end) return reply.badRequest('Missing fields')

    await db.insertInto('routes')
      .values({ route_id: body.routeId, start: body.start, end: body.end, is_active: true, name: sql`NULL` as any })
      .execute()

    if (Array.isArray(body.stops) && body.stops.length) {
      await db.transaction().execute(async (trx) => {
        await trx.insertInto('route_stops').values(
          body.stops!.map(s => ({
            route_id: body.routeId,
            stop_id: `${body.routeId}-S${s.stopNumber}`,
            name: s.name,
            latitude: s.lat,
            longitude: s.long,
            sequence: s.stopNumber
          }))
        ).execute()
      })
    }

    return { ok: true }
  })

  app.put('/routes/:routeId', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const body = req.body as Partial<{ start: string; end: string; isActive: boolean }>
    const update: any = {}
    if (body.start !== undefined) update.start = body.start
    if (body.end !== undefined) update.end = body.end
    if (body.isActive !== undefined) update.is_active = body.isActive
    if (Object.keys(update).length === 0) return { ok: true }
    const res = await db.updateTable('routes').set(update).where('route_id', '=', routeId).executeTakeFirst()
    if ((res as any).numUpdatedRows === 0n || (res as any).numUpdatedRows === 0) return reply.notFound('Route not found')
    return { ok: true }
  })

  app.delete('/routes/:routeId', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const res = await db.deleteFrom('routes').where('route_id', '=', routeId).executeTakeFirst()
    if ((res as any).numDeletedRows === 0n || (res as any).numDeletedRows === 0) return reply.notFound('Route not found')
    return { ok: true }
  })

  // Bulk replace stops transactionally
  app.put('/routes/:routeId/stops', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const body = req.body as { stops: Array<{ stopNumber: number; name: string; lat: number; long: number }> }
    if (!Array.isArray(body?.stops)) return reply.badRequest('stops required')

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('route_stops').where('route_id', '=', routeId).execute()
      if (body.stops.length) {
        await trx.insertInto('route_stops').values(
          body.stops.map(s => ({
            route_id: routeId,
            stop_id: `${routeId}-S${s.stopNumber}`,
            name: s.name,
            latitude: s.lat,
            longitude: s.long,
            sequence: s.stopNumber
          }))
        ).execute()
      }
    })

    return { ok: true }
  })
}
