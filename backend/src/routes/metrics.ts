import { FastifyInstance } from 'fastify'
import { Kysely } from 'kysely'
import { DB } from '../db'

export async function registerMetricsRoutes(app: FastifyInstance, db: Kysely<DB>) {
  app.get('/metrics', async () => {
    const [{ routes_count }] = await db.selectFrom('routes')
      .select(({ fn }) => fn.count<number>('route_id').as('routes_count'))
      .execute()

    const [{ buses_count }] = await db.selectFrom('buses')
      .select(({ fn }) => fn.count<number>('bus_number').as('buses_count'))
      .execute()

    const [{ active_buses_count }] = await db.selectFrom('buses')
      .select(({ fn }) => fn.count<number>('bus_number').as('active_buses_count'))
      .where('status', '=', 'active')
      .execute()

    // Recent routes by updated_at desc (fallback to created_at if needed)
    const recent = await db.selectFrom('routes')
      .select(['route_id', 'start', 'end', 'updated_at', 'created_at'])
      .orderBy('updated_at desc')
      .orderBy('created_at desc')
      .limit(5)
      .execute()

    // Get stop counts for these recent routes
    const ids = recent.map(r => r.route_id)
    let countsById = new Map<string, number>()
    if (ids.length) {
      const rows = await db.selectFrom('route_stops')
        .select(['route_id'])
        .select(({ fn }) => fn.count<number>('stop_id').as('cnt'))
        .where('route_id', 'in', ids)
        .groupBy('route_id')
        .execute()
      countsById = new Map(rows.map((r: any) => [r.route_id, Number(r.cnt)]))
    }

    const recentRoutes = recent.map(r => ({
      routeId: r.route_id,
      start: r.start,
      end: r.end,
      stops: countsById.get(r.route_id) ?? 0,
    }))

    return {
      routesCount: Number(routes_count ?? 0),
      busesCount: Number(buses_count ?? 0),
      activeBusesCount: Number(active_buses_count ?? 0),
      recentRoutes,
    }
  })
}
