import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { createRuntimeStore } from './runtime-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const traceHeaderName = 'x-testbed-correlation-id'

function json(res, statusCode, payload, headers = {}) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${traceHeaderName}`)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }

  res.end(JSON.stringify(payload))
}

function sendRaw(res, statusCode, body, headers = {}) {
  res.statusCode = statusCode
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${traceHeaderName}`)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }

  res.end(body)
}

function sendFile(res, filePath) {
  const extension = path.extname(filePath)
  const contentType =
    {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.json': 'application/json',
      '.ico': 'image/x-icon',
    }[extension] ?? 'application/octet-stream'

  res.statusCode = 200
  res.setHeader('Content-Type', contentType)
  res.end(fs.readFileSync(filePath))
}

async function readRawBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}

function parseJsonBody(rawBody) {
  if (!rawBody) {
    return {}
  }

  return JSON.parse(rawBody)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createMatcher(method, pathTemplate, endpointKey, group, requestExample, responseExample) {
  const matcher =
    pathTemplate.includes(':')
      ? new RegExp(`^${pathTemplate.replace(/:[^/]+/g, '([^/]+)')}$`)
      : null

  return {
    method,
    pathTemplate,
    endpointKey,
    group,
    requestExample,
    responseExample,
    match(pathname) {
      if (!matcher) {
        return pathname === pathTemplate ? {} : null
      }

      const result = pathname.match(matcher)
      if (!result) {
        return null
      }

      const keys = [...pathTemplate.matchAll(/:([^/]+)/g)].map((match) => match[1])
      return Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(result[index + 1])]))
    },
  }
}

function createRouteRegistry() {
  return [
    createMatcher('GET', '/api/runtime/bootstrap', 'runtime.bootstrap', 'Runtime', null, {
      appName: 'Testbed',
      routes: [],
      breakModes: {},
      users: [],
    }),
    createMatcher('POST', '/api/auth/login', 'auth.login', 'Auth', {
      username: 'customer@example.com',
      password: 'password123',
    }, {
      user: {
        username: 'customer@example.com',
        role: 'customer',
        displayName: 'Casey Customer',
      },
    }),
    createMatcher('GET', '/api/shop/products', 'shop.products', 'Shop', null, { products: [] }),
    createMatcher('GET', '/api/orders', 'orders.list', 'Orders', null, { orders: [] }),
    createMatcher('POST', '/api/orders', 'orders.create', 'Orders', {
      username: 'customer@example.com',
      userRole: 'customer',
      items: [{ productId: 'wireless-headset', quantity: 1 }],
      shipping: {
        fullName: 'Casey Customer',
        email: 'customer@example.com',
        address1: '1 Example Street',
        city: 'London',
        postcode: 'E1 1AA',
        country: 'United Kingdom',
      },
      payment: {
        cardName: 'Casey Customer',
        cardNumber: '4242424242424242',
        expiry: '12/29',
        cvv: '123',
      },
    }, {
      order: {
        id: 'ORD-1',
        createdAt: new Date(0).toISOString(),
      },
    }),
    createMatcher('GET', '/api/admin/overview', 'admin.overview', 'Admin', null, {
      users: [],
      products: [],
      orders: [],
      breakModes: {},
    }),
    createMatcher('GET', '/api/admin/users', 'admin.users.list', 'Admin', null, { users: [] }),
    createMatcher('POST', '/api/admin/users', 'admin.users.create', 'Admin', {
      user: {
        username: 'new-user@example.com',
        password: 'password123',
        displayName: 'New User',
        role: 'customer',
      },
    }, {
      users: [],
    }),
    createMatcher('PUT', '/api/admin/users/:username', 'admin.users.update', 'Admin', {
      user: {
        displayName: 'Updated User',
      },
    }, {
      users: [],
    }),
    createMatcher('DELETE', '/api/admin/users/:username', 'admin.users.delete', 'Admin', null, {
      users: [],
    }),
    createMatcher('PATCH', '/api/admin/products/:id', 'admin.products.update', 'Admin', {
      product: {
        stock: 3,
      },
    }, {
      product: null,
    }),
    createMatcher('POST', '/api/admin/reset-runtime', 'admin.resetRuntime', 'Admin', null, {
      ok: true,
    }),
    createMatcher('GET', '/api/desktop/context', 'desktop.context', 'Admin', null, {
      desktop: {
        serverUrl: 'http://127.0.0.1:5175',
        port: 5175,
        usedFallbackPort: false,
        dataDirectory: '/tmp/testbed',
      },
    }),
  ]
}

function findRoute(registry, method, pathname) {
  for (const route of registry) {
    if (route.method !== method) continue
    const params = route.match(pathname)
    if (params) {
      return { route, params }
    }
  }

  return null
}

function filterHeaders(headers) {
  const allowed = ['content-type', 'accept', 'user-agent']
  const next = {}

  for (const [key, value] of Object.entries(headers)) {
    if (!allowed.includes(String(key).toLowerCase())) continue
    if (Array.isArray(value)) {
      next[key] = value.join(', ')
    } else if (typeof value === 'string') {
      next[key] = value
    }
  }

  return next
}

function truncateBody(rawBody) {
  if (!rawBody) return null
  return rawBody.length > 1500 ? `${rawBody.slice(0, 1500)}…` : rawBody
}

function createPostmanCollection(serverUrl, registry) {
  const folders = new Map()

  for (const route of registry) {
    if (!folders.has(route.group)) {
      folders.set(route.group, [])
    }

    folders.get(route.group).push({
      name: `${route.method} ${route.pathTemplate}`,
      request: {
        method: route.method,
        header: [],
        url: {
          raw: `{{baseUrl}}${route.pathTemplate}`,
          host: ['{{baseUrl}}'],
          path: route.pathTemplate.replace(/^\//, '').split('/'),
        },
        body:
          route.requestExample === null
            ? undefined
            : {
                mode: 'raw',
                raw: JSON.stringify(route.requestExample, null, 2),
                options: {
                  raw: {
                    language: 'json',
                  },
                },
              },
      },
      response: route.responseExample
        ? [
            {
              name: 'Example response',
              status: 'OK',
              code: 200,
              body: JSON.stringify(route.responseExample, null, 2),
            },
          ]
        : [],
    })
  }

  folders.set('Test Controls', [
    {
      name: 'GET /api/test-controls/config',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/test-controls/config',
          host: ['{{baseUrl}}'],
          path: ['api', 'test-controls', 'config'],
        },
      },
      response: [],
    },
    {
      name: 'POST /api/test-controls/presets/baseline/apply',
      request: {
        method: 'POST',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/test-controls/presets/baseline/apply',
          host: ['{{baseUrl}}'],
          path: ['api', 'test-controls', 'presets', 'baseline', 'apply'],
        },
      },
      response: [],
    },
  ])

  folders.set('Postman', [
    {
      name: 'GET /api/postman/collection',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/postman/collection',
          host: ['{{baseUrl}}'],
          path: ['api', 'postman', 'collection'],
        },
      },
      response: [],
    },
    {
      name: 'GET /api/postman/environment',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/postman/environment',
          host: ['{{baseUrl}}'],
          path: ['api', 'postman', 'environment'],
        },
      },
      response: [],
    },
  ])

  return {
    info: {
      name: 'Testbed Local API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description: `Generated from the live Testbed server at ${serverUrl}. Observe ${traceHeaderName} in responses for correlation.`,
    },
    variable: [
      {
        key: 'baseUrl',
        value: serverUrl,
      },
    ],
    item: [...folders.entries()].map(([name, item]) => ({ name, item })),
  }
}

function createPostmanEnvironment(serverUrl, store) {
  const users = store.readUsers()
  const userByRole = Object.fromEntries(users.map((user) => [user.role, user]))

  return {
    name: 'Testbed Local Environment',
    values: [
      { key: 'baseUrl', value: serverUrl, enabled: true },
      { key: 'customerUsername', value: userByRole.customer?.username ?? '', enabled: true },
      { key: 'customerPassword', value: userByRole.customer?.password ?? '', enabled: true },
      { key: 'vipUsername', value: userByRole.vip?.username ?? '', enabled: true },
      { key: 'vipPassword', value: userByRole.vip?.password ?? '', enabled: true },
      { key: 'adminUsername', value: userByRole.admin?.username ?? '', enabled: true },
      { key: 'adminPassword', value: userByRole.admin?.password ?? '', enabled: true },
    ],
  }
}

function buildBackwardCompatibleFault(endpointKey, breakModes) {
  if (breakModes.apiFailures.products && endpointKey === 'shop.products') {
    return { enabled: true, status: 503, mode: 'http-error', latencyMs: null, message: 'Product service did not return data.' }
  }

  if (breakModes.apiFailures.orders && ['orders.list', 'orders.create'].includes(endpointKey)) {
    return { enabled: true, status: 503, mode: 'http-error', latencyMs: null, message: 'Order service request failed.' }
  }

  return null
}

function mutatePayloadForFault(endpointKey, payload, mode) {
  if (mode === 'missing-fields') {
    const next = structuredClone(payload)

    if (endpointKey === 'shop.products') delete next.products
    if (endpointKey === 'orders.list') delete next.orders
    if (endpointKey === 'orders.create') delete next.order
    if (endpointKey === 'auth.login') delete next.user
    if (endpointKey === 'admin.overview') delete next.users
    if (endpointKey === 'runtime.bootstrap') delete next.routes
    if (endpointKey === 'desktop.context') delete next.desktop

    return next
  }

  if (mode === 'wrong-types') {
    const next = structuredClone(payload)

    if (endpointKey === 'shop.products') next.products = 'not-an-array'
    if (endpointKey === 'orders.list') next.orders = 'broken'
    if (endpointKey === 'orders.create') next.order = 123
    if (endpointKey === 'auth.login') next.user = 'invalid-user'
    if (endpointKey === 'admin.overview') next.users = true
    if (endpointKey === 'runtime.bootstrap') next.routes = 'broken'
    if (endpointKey === 'desktop.context') next.desktop = 'invalid'

    return next
  }

  return payload
}

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
        json(res, 200, createPostmanEnvironment(`http://127.0.0.1:${currentPort}`, store))
        return
      }

      const routeMatch = findRoute(registry, req.method ?? 'GET', pathname)
      if (routeMatch) {
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
