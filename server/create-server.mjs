import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { ensureAdminAuthorization } from './auth.mjs'
import { buildBackwardCompatibleFault, mutatePayloadForFault } from './faults.mjs'
import { filterHeaders, json, parseJsonBody, readRawBody, sendFile, sendRaw, sleep, traceHeaderName, truncateBody } from './http-helpers.mjs'
import { createPostmanCollection, createPostmanEnvironment } from './postman.mjs'
import { createRouteRegistry, findRoute } from './route-registry.mjs'
import { createRuntimeStore } from './runtime-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')

export async function startTestbedServer({
  dataDirectory,
  preferredPort = 5175,
  dev = false,
  desktopContextProvider = () => null,
} = {}) {
  const store = createRuntimeStore(dataDirectory)
  const registry = createRouteRegistry()
  const lastKnownGood = new Map()
  let traces = []
  const adminApiToken = `testbed-admin-${randomUUID()}`

  const vite = dev
    ? await createViteServer({
        configFile: path.join(projectRoot, 'vite.config.ts'),
        root: projectRoot,
        server: {
          middlewareMode: true,
          host: '127.0.0.1',
        },
        appType: 'spa',
      })
    : null

  const defaultRoutes = store.defaults.appConfig.routes
  const appName = store.defaults.appConfig.appName

  function recordTrace(entry) {
    const tracing = store.readTestControls().tracing
    if (!tracing.enabled) {
      return
    }

    traces = [entry, ...traces].slice(0, tracing.maxEntries)
  }

  function buildResponseHelpers(res, correlationId) {
    return {
      json(statusCode, payload) {
        json(res, statusCode, payload, { [traceHeaderName]: correlationId })
      },
      raw(statusCode, body, headers = {}) {
        sendRaw(res, statusCode, body, {
          ...headers,
          [traceHeaderName]: correlationId,
        })
      },
    }
  }

  async function handleRegisteredRoute(req, res, pathname, routeMatch, rawBody) {
    const correlationId = randomUUID()
    const { route, params } = routeMatch
    const testControls = store.readTestControls()
    const baseLatency = testControls.breakModes.highLatency ? 1800 : 180
    const directFault = testControls.faults[route.endpointKey]
    const compatFault = buildBackwardCompatibleFault(route.endpointKey, testControls.breakModes)
    const activeFault = directFault?.enabled ? directFault : compatFault
    const latencyMs = activeFault?.latencyMs ?? baseLatency
    const requestHeaders = filterHeaders(req.headers)
    const requestBody = truncateBody(rawBody)
    const helpers = buildResponseHelpers(res, correlationId)
    let payload
    let statusCode = 200
    let responseMode = 'normal'
    let matchedFault = null
    let fallbackUsed = false

    if (latencyMs > 0) {
      await sleep(latencyMs)
    }

    const parsedBody = rawBody ? parseJsonBody(rawBody) : {}

    try {
      switch (route.endpointKey) {
        case 'runtime.bootstrap':
          payload = {
            appName,
            routes: defaultRoutes,
            breakModes: testControls.breakModes,
            users: store.readUsers(),
          }
          break
        case 'auth.login': {
          const match = store.readUsers().find(
            (user) =>
              user.username === String(parsedBody.username ?? '').trim().toLowerCase() &&
              user.password === String(parsedBody.password ?? '').trim(),
          )

          if (!match) {
            payload = { error: 'Invalid username or password.', correlationId }
            statusCode = 401
            break
          }

          payload = {
            user: {
              username: match.username,
              role: match.role,
              displayName: match.displayName,
            },
          }
          break
        }
        case 'shop.products': {
          const products = testControls.breakModes.emptyProductList
            ? []
            : store.readProducts().filter((product) => !product.hidden)
          payload = { products }
          break
        }
        case 'orders.list':
          payload = { orders: store.readOrders() }
          break
        case 'orders.create': {
          const products = store.readProducts()
          const rawSubtotal = (parsedBody.items ?? []).reduce((total, item) => {
            const product = products.find((candidate) => candidate.id === item.productId)
            return total + (product?.price ?? 0) * item.quantity
          }, 0)
          const subtotal = testControls.breakModes.brokenCheckoutTotal ? Math.max(rawSubtotal - 7, 0) : rawSubtotal
          const total = subtotal + 12
          const order = {
            id: `ORD-${Date.now()}`,
            createdAt: new Date().toISOString(),
            userRole: parsedBody.userRole,
            username: parsedBody.username,
            items: parsedBody.items,
            shipping: parsedBody.shipping,
            payment: {
              cardName: parsedBody.payment?.cardName,
              cardLast4: String(parsedBody.payment?.cardNumber ?? '').slice(-4),
            },
            subtotal,
            total,
          }

          store.addOrder(order)
          payload = { order }
          break
        }
        case 'admin.overview':
          payload = {
            users: store.readUsers(),
            products: store.readProducts(),
            orders: store.readOrders(),
            breakModes: testControls.breakModes,
          }
          break
        case 'admin.users.list':
          payload = { users: store.readUsers() }
          break
        case 'admin.users.create':
          payload = { users: store.createUser(parsedBody.user ?? {}) }
          break
        case 'admin.users.update':
          payload = { users: store.updateUser(params.username, parsedBody.user ?? {}) }
          break
        case 'admin.users.delete':
          payload = { users: store.deleteUser(params.username) }
          break
        case 'admin.products.update':
          payload = { product: store.updateProduct(params.id, parsedBody.product ?? {}) }
          break
        case 'admin.resetRuntime':
          store.resetRuntimeData()
          payload = { ok: true }
          break
        case 'desktop.context':
          payload = { desktop: desktopContextProvider() }
          break
        default:
          payload = { error: 'Not found.', correlationId }
          statusCode = 404
      }
    } catch (error) {
      payload = {
        error: error instanceof Error ? error.message : 'Unexpected server error.',
        correlationId,
      }
      statusCode = 500
    }

    const canInjectFault =
      activeFault?.enabled &&
      statusCode < 400 &&
      !(activeFault.mode === 'http-error' && activeFault.status < 400)
    if (canInjectFault) {
      responseMode = activeFault.mode
      matchedFault = {
        enabled: true,
        mode: activeFault.mode,
        status: activeFault.status,
        message: activeFault.message ?? null,
      }

      if (activeFault.mode === 'stale-success') {
        if (lastKnownGood.has(route.endpointKey)) {
          payload = lastKnownGood.get(route.endpointKey)
          statusCode = activeFault.status
        } else {
          fallbackUsed = true
          matchedFault.fallbackUsed = true
          responseMode = 'normal'
        }
      } else if (activeFault.mode === 'http-error') {
        payload = { error: activeFault.message ?? 'Injected test fault.', correlationId }
        statusCode = activeFault.status
      } else if (activeFault.mode === 'malformed-json') {
        helpers.raw(activeFault.status, '{"broken": true', {
          'Content-Type': 'application/json',
        })
      } else if (activeFault.mode === 'empty-body') {
        helpers.raw(activeFault.status, '', {
          'Content-Type': 'application/json',
        })
      } else {
        payload = mutatePayloadForFault(route.endpointKey, payload, activeFault.mode)
        statusCode = activeFault.status
      }
    }

    if (!['malformed-json', 'empty-body'].includes(activeFault?.mode ?? '') || fallbackUsed) {
      if (statusCode < 400 && responseMode === 'normal') {
        lastKnownGood.set(route.endpointKey, structuredClone(payload))
      }

      if (!res.writableEnded) {
        helpers.json(statusCode, payload)
      }
    }

    recordTrace({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      method: req.method ?? 'GET',
      pathname,
      endpointKey: route.endpointKey,
      requestHeaders,
      requestBody,
      responseStatus: res.statusCode,
      responseMode,
      latencyMs,
      presetId: testControls.activePresetId,
      matchedFault,
      correlationId,
    })
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const pathname = url.pathname

    if (req.method === 'OPTIONS') {
      json(res, 204, {})
      return
    }

    try {
      if (pathname === '/api/health' && req.method === 'GET') {
        json(res, 200, {
          ok: true,
          appName,
          port: currentPort,
          dataDirectory: store.dataDirectory,
          desktop: Boolean(desktopContextProvider()),
        })
        return
      }

      if (pathname === '/api/test-controls/state' && req.method === 'GET') {
        json(res, 200, { breakModes: store.readTestControls().breakModes })
        return
      }

      if (pathname === '/api/test-controls/break-modes' && req.method === 'POST') {
        const body = parseJsonBody(await readRawBody(req))
        json(res, 200, { breakModes: store.mergeBreakModes(body.breakModes ?? {}) })
        return
      }

      if (pathname === '/api/test-controls/reset' && req.method === 'POST') {
        json(res, 200, { breakModes: store.resetBreakModes() })
        return
      }

      if (pathname === '/api/admin/break-modes' && req.method === 'POST') {
        if (!ensureAdminAuthorization(req, res, adminApiToken)) {
          return
        }
        const body = parseJsonBody(await readRawBody(req))
        json(res, 200, { breakModes: store.writeBreakModes(body.breakModes ?? store.readBreakModes()) })
        return
      }

      if (pathname === '/api/test-controls/config' && req.method === 'GET') {
        json(res, 200, store.readTestControls())
        return
      }

      if (pathname === '/api/test-controls/config' && req.method === 'POST') {
        const body = parseJsonBody(await readRawBody(req))
        json(res, 200, store.updateTestControls(body ?? {}))
        return
      }

      if (pathname === '/api/test-controls/presets' && req.method === 'GET') {
        json(res, 200, { presets: store.listScenarioPresets() })
        return
      }

      if (pathname.startsWith('/api/test-controls/presets/') && pathname.endsWith('/apply') && req.method === 'POST') {
        const presetId = decodeURIComponent(pathname.replace('/api/test-controls/presets/', '').replace('/apply', ''))
        json(res, 200, store.applyScenarioPreset(presetId))
        return
      }

      if (pathname === '/api/test-controls/tracing' && req.method === 'POST') {
        const body = parseJsonBody(await readRawBody(req))
        json(res, 200, store.updateTestControls({ tracing: body.tracing ?? {} }))
        return
      }

      if (pathname === '/api/test-controls/traces' && req.method === 'GET') {
        json(res, 200, { traces })
        return
      }

      if (pathname === '/api/test-controls/traces' && req.method === 'DELETE') {
        traces = []
        json(res, 200, { ok: true })
        return
      }

      if (pathname === '/api/postman/collection' && req.method === 'GET') {
        json(res, 200, createPostmanCollection(`http://127.0.0.1:${currentPort}`, registry))
        return
      }

      if (pathname === '/api/postman/environment' && req.method === 'GET') {
        json(res, 200, createPostmanEnvironment(`http://127.0.0.1:${currentPort}`, store, adminApiToken))
        return
      }

      const routeMatch = findRoute(registry, req.method ?? 'GET', pathname)
      if (routeMatch) {
        if (pathname.startsWith('/api/admin/') && !ensureAdminAuthorization(req, res, adminApiToken)) {
          return
        }
        const rawBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method ?? '') ? await readRawBody(req) : ''
        await handleRegisteredRoute(req, res, pathname, routeMatch, rawBody)
        return
      }

      if (dev && vite) {
        vite.middlewares(req, res, () => {
          if (!res.writableEnded) {
            json(res, 404, { error: 'Not found.' })
          }
        })
        return
      }

      const assetPath =
        pathname === '/' || !path.extname(pathname)
          ? path.join(distDir, 'index.html')
          : path.join(distDir, pathname.replace(/^\//, ''))

      if (fs.existsSync(assetPath)) {
        sendFile(res, assetPath)
        return
      }

      if (!path.extname(pathname)) {
        sendFile(res, path.join(distDir, 'index.html'))
        return
      }

      json(res, 404, { error: 'Not found.' })
    } catch (error) {
      json(res, 500, {
        error: error instanceof Error ? error.message : 'Unexpected server error.',
      })
    }
  })

  let currentPort = preferredPort
  let usedFallbackPort = false

  await new Promise((resolve, reject) => {
    const tryListen = () => {
      server.once('error', (error) => {
        if (error?.code === 'EADDRINUSE') {
          usedFallbackPort = true
          currentPort += 1
          tryListen()
          return
        }

        reject(error)
      })

      server.once('listening', resolve)
      server.listen(currentPort, '127.0.0.1')
    }

    tryListen()
  })

  return {
    server,
    store,
    port: currentPort,
    serverUrl: `http://127.0.0.1:${currentPort}`,
    usedFallbackPort,
    adminApiToken,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })

      if (vite) {
        await vite.close()
      }
    },
  }
}
