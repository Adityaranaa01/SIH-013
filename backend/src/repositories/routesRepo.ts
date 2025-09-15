import { Kysely } from 'kysely'
import { DB } from '../db'

export async function listRoutes(db: Kysely<DB>) {
  const rows = await db.selectFrom('routes')
    .select(['route_id as routeId', 'start', 'end', 'name'])
    .orderBy('route_id')
    .execute()

  const counts = await db.selectFrom('route_stops')
    .select(['route_id'])
    .select(({ fn }) => fn.countAll().as('cnt'))
    .groupBy('route_id')
    .execute()
  const byRoute = new Map(counts.map((c: any) => [c.route_id, Number(c.cnt)]))

  return rows.map((r: any) => ({ ...r, stopsCount: byRoute.get(r.routeId) ?? 0 }))
}

export async function getRouteDetail(db: Kysely<DB>, routeId: string) {
  const route = await db.selectFrom('routes')
    .select(['route_id as routeId', 'start', 'end', 'name'])
    .where('route_id', '=', routeId)
    .executeTakeFirst()
  if (!route) return null

  const stops = await db.selectFrom('route_stops')
    .select(['sequence as stopNumber', 'name', 'latitude as lat', 'longitude as long'])
    .where('route_id', '=', routeId)
    .orderBy('sequence')
    .execute()

  return { ...route, stops }
}
