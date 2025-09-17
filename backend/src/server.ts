import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cookie from '@fastify/cookie'
import { sql } from 'kysely'
import { createDb } from './db'
import { listRoutes, getRouteDetail } from './repositories/routesRepo'
import { registerAuthRoutes } from './routes/auth'
import { registerRoutesCrud } from './routes/routes'
import { registerDevRoutes } from './routes/dev'
import { registerMetricsRoutes } from './routes/metrics'
import { registerDriversRoutes } from './routes/drivers'

const PORT = Number(process.env.PORT || 3001)
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5173,http://localhost:3000'
const ALLOWED_ORIGINS = new Set(
  WEB_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
)

export async function buildServer() {
  const app = Fastify({
    logger: { transport: { target: 'pino-pretty' } },
  })

  const db = createDb()
  await app.register(sensible)
  await app.register(cookie)
  await app.register(cors, {
    origin: (origin, cb) => {
      // In dev, reflect any origin to simplify local testing
      if (process.env.NODE_ENV !== 'production') return cb(null, true)
      if (!origin) return cb(null, false)
      return cb(null, ALLOWED_ORIGINS.has(origin))
    },
    credentials: true,
  })
  await app.register(swagger, {
    openapi: {
      info: { title: 'SmartTransit API', version: '0.1.0' },
    },
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  app.get('/healthz', async () => ({ ok: true }))
  app.get('/healthz/db', async () => {
    try {
      await sql`select 1`.execute(db)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, code: e?.code, message: e?.message }
    }
  })

  app.get('/routes', async () => listRoutes(db))

  app.get('/routes/:routeId', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const route = await getRouteDetail(db, routeId)
    if (!route) return reply.notFound('Route not found')
    return route
  })

  app.get('/buses', async () => {
    const rows = await db
      .selectFrom('buses')
      .select([
        'bus_number as id',
        'bus_number as plateNumber',
        'status',
        'assigned_route as assignedRoute',
        'current_driver as driver',
      ])
      .orderBy('bus_number')
      .execute()

    return rows.map((b) => ({
      ...b,
      model: null,
      capacity: null,
      fuelLevel: null,
      lastMaintenance: null,
      mileage: null,
    }))
  })

  app.post('/buses', async (req, reply) => {
    const body = req.body as Partial<{
      busNumber: string
      assignedRoute?: string | null
      driver?: string | null
      status?: string | null
    }>

    const busNumber = (body?.busNumber || '').trim()
    if (!busNumber) return reply.badRequest('busNumber is required')

    // Validate that assigned route exists
    if (body.assignedRoute) {
      const exists = await db
        .selectFrom('routes')
        .select('route_id')
        .where('route_id', '=', body.assignedRoute)
        .executeTakeFirst()
      if (!exists) return reply.badRequest('assignedRoute does not exist')
    }

    try {
      await db
        .insertInto('buses')
        .values({
          bus_number: busNumber,
          assigned_route: body.assignedRoute ?? null,
          current_driver: body.driver ?? null,
          status: body.status ?? null,
        })
        .execute()
    } catch (e: any) {
      if (e?.code === '23505') return reply.conflict('Bus already exists')
      throw e
    }

    return {
      id: busNumber,
      plateNumber: busNumber,
      status: body.status ?? null,
      assignedRoute: body.assignedRoute ?? null,
      driver: body.driver ?? null,
      model: null,
      capacity: null,
      fuelLevel: null,
      lastMaintenance: null,
      mileage: null,
    }
  })

  app.patch('/buses/:busNumber', async (req, reply) => {
    const { busNumber } = req.params as { busNumber: string }
    const body = req.body as Partial<{
      assignedRoute: string | null
      driver: string | null
    }>

    if (body.assignedRoute) {
      const exists = await db
        .selectFrom('routes')
        .select('route_id')
        .where('route_id', '=', body.assignedRoute)
        .executeTakeFirst()
      if (!exists) return reply.badRequest('assignedRoute does not exist')
    }

    const update: Record<string, any> = {}
    if (body.assignedRoute !== undefined)
      update.assigned_route = body.assignedRoute
    if (body.driver !== undefined) update.current_driver = body.driver

    if (Object.keys(update).length === 0) return { ok: true }

    const res = await db
      .updateTable('buses')
      .set(update)
      .where('bus_number', '=', busNumber)
      .executeTakeFirst()

    const rowsUpdated = (res as any).numUpdatedRows
    if (rowsUpdated === 0n || rowsUpdated === 0) {
      return reply.notFound('Bus not found')
    }

    return { ok: true }
  })

  app.get('/tracking/active-buses', async () => {
    return db
      .selectFrom('buses')
      .select([
        'bus_number as id',
        'bus_number as plateNumber',
        'status',
        'assigned_route as assignedRoute',
        'current_driver as driver',
      ])
      .where(sql<boolean>`lower(status) = 'running'`)
      .orderBy('bus_number')
      .execute()
  })

  app.get('/tracking/positions', async (req, reply) => {
    const { bus, since } = (req.query as any) || {}
    if (!bus) return reply.badRequest('bus is required')

    const sinceClause = since ? sql`and recorded_at > ${since}` : sql``

    const result = await sql<{
      latitude: number
      longitude: number
      recorded_at: string
    }>`
      select latitude, longitude, recorded_at
      from bus_locations
      where bus_number = ${bus}
      ${sinceClause}
      order by recorded_at asc
      limit 1000
    `.execute(db)

    return { positions: (result as any).rows || [] }
  })

  await registerAuthRoutes(app, db)
  await registerRoutesCrud(app, db)
  await registerDevRoutes(app, db)
  await registerMetricsRoutes(app, db)
  await registerDriversRoutes(app, db)

  return app
}

buildServer()
  .then(async (app) => {
    try {
      const db = createDb()
      await sql`select 1`.execute(db)
      app.log.info('Database connectivity check passed')
    } catch (e: any) {
      const cs = process.env.DATABASE_URL
      let host: string | undefined
      try {
        if (cs) host = new URL(cs).hostname
      } catch {}

      app.log.error(
        {
          code: e?.code,
          message: e?.message,
          host,
          hint: 'Check DATABASE_URL/PG* env vars and network/DNS. For Supabase, use sslmode=require.',
        },
        'Database connectivity check failed'
      )
    }

    return app.listen({ port: PORT, host: '0.0.0.0' })
  })
  .then((address) => console.log(`API listening on ${address}`))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
