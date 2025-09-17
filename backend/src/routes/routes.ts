import { FastifyInstance } from 'fastify'
import { Kysely } from 'kysely'
import { DB } from '../db'

export async function registerRoutesCrud(app: FastifyInstance, db: Kysely<DB>) {
  app.post('/routes', async (req, reply) => {
    const body = req.body as {
      routeId: string
      start: string
      end: string
      name?: string | null
      stops?: Array<{
        stopNumber: number
        name: string
        lat: number
        long: number
      }>
    }

    if (!body?.routeId || !body?.start || !body?.end) {
      return reply.badRequest('Missing required fields: routeId, start, end')
    }

    await db.insertInto('routes').values({
      route_id: body.routeId,
      start: body.start,
      end: body.end,
      is_active: true,
      name: body.name ?? null
    }).execute()

    if (Array.isArray(body.stops) && body.stops.length > 0) {
      await db.transaction().execute(async (trx) => {
        const stops = body.stops!.map(s => ({
          route_id: body.routeId,
          stop_id: `${body.routeId}-S${s.stopNumber}`,
          name: s.name,
          latitude: s.lat,
          longitude: s.long,
          sequence: s.stopNumber
        }))
        await trx.insertInto('route_stops').values(stops).execute()
      })
    }

    return { ok: true }
  })

  app.put('/routes/:routeId', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const body = req.body as Partial<{
      start: string
      end: string
      isActive: boolean
      name: string | null
    }>

    const update: Record<string, any> = {}
    if (body.start !== undefined) update.start = body.start
    if (body.end !== undefined) update.end = body.end
    if (body.name !== undefined) update.name = body.name
    if (body.isActive !== undefined) update.is_active = body.isActive

    if (Object.keys(update).length === 0) {
      return { ok: true } // nothing to update
    }

    const result = await db
      .updateTable('routes')
      .set(update)
      .where('route_id', '=', routeId)
      .executeTakeFirst()

    if ((result as any).numUpdatedRows === 0n || (result as any).numUpdatedRows === 0) {
      return reply.notFound('Route not found')
    }

    return { ok: true }
  })

  app.delete('/routes/:routeId', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }

    const result = await db
      .deleteFrom('routes')
      .where('route_id', '=', routeId)
      .executeTakeFirst()

    if ((result as any).numDeletedRows === 0n || (result as any).numDeletedRows === 0) {
      return reply.notFound('Route not found')
    }

    return { ok: true }
  })

  app.put('/routes/:routeId/stops', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const body = req.body as {
      stops: Array<{
        stopNumber: number
        name: string
        lat: number
        long: number
      }>
    }

    if (!Array.isArray(body?.stops)) {
      return reply.badRequest('Field "stops" must be an array')
    }

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('route_stops')
        .where('route_id', '=', routeId)
        .execute()

      if (body.stops.length > 0) {
        const newStops = body.stops.map(s => ({
          route_id: routeId,
          stop_id: `${routeId}-S${s.stopNumber}`,
          name: s.name,
          latitude: s.lat,
          longitude: s.long,
          sequence: s.stopNumber
        }))
        await trx.insertInto('route_stops').values(newStops).execute()
      }
    })

    return { ok: true }
  })
}
