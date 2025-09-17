import { Kysely } from 'kysely'
import { DB } from '../db'

export async function listRoutes(db: Kysely<DB>) {
  const routes = await db
    .selectFrom('routes')
    .select(['route_id as routeId', 'start', 'end', 'name'])
    .orderBy('route_id')
    .execute()

  // Count how many stops belong to each route
  const stopCounts = await db
    .selectFrom('route_stops')
    .select(['route_id'])
    .select(({ fn }) => fn.countAll().as('cnt'))
    .groupBy('route_id')
    .execute()

  const stopsByRoute = new Map(
    stopCounts.map((c: any) => [c.route_id, Number(c.cnt)])
  )
  return routes.map((route: any) => ({
    ...route,
    stopsCount: stopsByRoute.get(route.routeId) ?? 0,
  }))
}

export async function getRouteDetail(db: Kysely<DB>, routeId: string) {
  // Fetch route info
  const route = await db
    .selectFrom('routes')
    .select(['route_id as routeId', 'start', 'end', 'name'])
    .where('route_id', '=', routeId)
    .executeTakeFirst()

  if (!route) return null

  // Fetch stops for this route
  const stops = await db
    .selectFrom('route_stops')
    .select([
      'sequence as stopNumber',
      'name',
      'latitude as lat',
      'longitude as long',
    ])
    .where('route_id', '=', routeId)
    .orderBy('sequence')
    .execute()

  return { ...route, stops }
}
