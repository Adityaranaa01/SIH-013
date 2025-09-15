import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cookie from '@fastify/cookie'
import { createDb } from './db'
import { sql } from 'kysely'
import { listRoutes, getRouteDetail } from './repositories/routesRepo'
import { registerAuthRoutes } from './routes/auth'
import { registerRoutesCrud } from './routes/routes'
import { registerDevRoutes } from './routes/dev'
import { registerMetricsRoutes } from './routes/metrics'

const PORT = Number(process.env.PORT || 3001)
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5173'

export async function buildServer() {
  const app = Fastify({ logger: { transport: { target: 'pino-pretty' } } })
  const db = createDb()

  await app.register(sensible)
  await app.register(cookie)
  await app.register(cors, {
    origin: WEB_ORIGIN,
    credentials: true
  })
  await app.register(swagger, {
    openapi: {
      info: { title: 'SmartTransit API', version: '0.1.0' }
    }
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  // Health
  app.get('/healthz', async () => ({ ok: true }))
  app.get('/healthz/db', async () => {
    try {
      await sql`select 1`.execute(db)
      return { ok: true }
    } catch (e: any) {
      return {
        ok: false,
        code: e?.code,
        message: e?.message,
      }
    }
  })

  // Routes listing (minimal)
  app.get('/routes', async () => listRoutes(db))

  // Route detail with stops
  app.get('/routes/:routeId', async (req, reply) => {
    const { routeId } = req.params as { routeId: string }
    const route = await getRouteDetail(db, routeId)
    if (!route) return reply.notFound('Route not found')
    return route
  })

  // Buses (project to UI shape with nullable extras)
  app.get('/buses', async () => {
    const buses = await db.selectFrom('buses')
      .select([
        'bus_number as id',
        'bus_number as plateNumber',
        'status',
        'assigned_route as assignedRoute',
        'current_driver as driver'
      ])
      .orderBy('bus_number')
      .execute()

    return buses.map(b => ({
      ...b,
      model: null,
      capacity: null,
      fuelLevel: null,
      lastMaintenance: null,
      mileage: null
    }))
  })

  // Update bus assignment/status
  app.patch('/buses/:busNumber', async (req, reply) => {
    const { busNumber } = req.params as { busNumber: string }
    const body = req.body as Partial<{ assignedRoute: string | null; status: string; driver: string | null }>

    // Validate assignedRoute exists if provided and not null
    if (body.assignedRoute) {
      const exists = await db.selectFrom('routes').select('route_id').where('route_id', '=', body.assignedRoute).executeTakeFirst()
      if (!exists) return reply.badRequest('assignedRoute does not exist')
    }

    const update: Record<string, any> = {}
    if (body.assignedRoute !== undefined) update.assigned_route = body.assignedRoute
    if (body.status !== undefined) update.status = body.status
    if (body.driver !== undefined) update.current_driver = body.driver

    if (Object.keys(update).length === 0) return { ok: true }

    const res = await db.updateTable('buses').set(update).where('bus_number', '=', busNumber).executeTakeFirst()
    if ((res as any).numUpdatedRows === 0n || (res as any).numUpdatedRows === 0) return reply.notFound('Bus not found')
    return { ok: true }
  })

  // Auth and Routes CRUD
  await registerAuthRoutes(app, db)
  await registerRoutesCrud(app, db)
  await registerDevRoutes(app, db)
  await registerMetricsRoutes(app, db)

  return app
}

buildServer()
  .then(async app => {
    // Proactive DB connectivity check with actionable logs
    try {
      // Reuse the same DB instance used by the app
      const db = createDb()
      await sql`select 1`.execute(db)
      app.log.info('Database connectivity check passed')
    } catch (e: any) {
      const cs = process.env.DATABASE_URL
      let host: string | undefined
      try { if (cs) host = new URL(cs).hostname } catch {}
      app.log.error({ code: e?.code, message: e?.message, host, hint: 'Verify DATABASE_URL/PG* env and network/DNS. For Supabase, ensure sslmode=require and correct host.' }, 'Database connectivity check failed')
    }
    return app.listen({ port: PORT, host: '0.0.0.0' })
  })
  .then(address => console.log(`API listening on ${address}`))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
