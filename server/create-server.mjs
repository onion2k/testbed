import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { createRuntimeStore } from './runtime-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')

function json(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.end(JSON.stringify(payload))
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

async function parseBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const body = Buffer.concat(chunks).toString('utf8')
  return body ? JSON.parse(body) : {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function startTestbedServer({
  dataDirectory,
  preferredPort = 5175,
  dev = false,
  desktopContextProvider = () => null,
} = {}) {
  const store = createRuntimeStore(dataDirectory)
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

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const pathname = url.pathname
    const breakModes = store.readBreakModes()

    if (req.method === 'OPTIONS') {
      json(res, 204, {})
      return
    }

    const latency = breakModes.highLatency ? 1800 : 180

    try {
      if (pathname === '/api/runtime/bootstrap' && req.method === 'GET') {
        json(res, 200, {
          appName,
          routes: defaultRoutes,
          breakModes,
          users: store.readUsers(),
        })
        return
      }

      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req)
        const match = store.readUsers().find(
          (user) =>
            user.username === String(body.username ?? '').trim().toLowerCase() &&
            user.password === String(body.password ?? '').trim(),
        )

        if (!match) {
          json(res, 401, { error: 'Invalid username or password.' })
          return
        }

        json(res, 200, {
          user: {
            username: match.username,
            role: match.role,
            displayName: match.displayName,
          },
        })
        return
      }

      if (pathname === '/api/test-controls/state' && req.method === 'GET') {
        json(res, 200, { breakModes })
        return
      }

      if (pathname === '/api/test-controls/break-modes' && req.method === 'POST') {
        const body = await parseBody(req)
        json(res, 200, { breakModes: store.mergeBreakModes(body.breakModes ?? {}) })
        return
      }

      if (pathname === '/api/test-controls/reset' && req.method === 'POST') {
        json(res, 200, { breakModes: store.resetBreakModes() })
        return
      }

      if (pathname === '/api/admin/overview' && req.method === 'GET') {
        await sleep(latency)

        if (breakModes.apiFailures.admin) {
          json(res, 503, { error: 'Admin service did not return data.' })
          return
        }

        json(res, 200, {
          users: store.readUsers(),
          products: store.readProducts(),
          orders: store.readOrders(),
          breakModes,
        })
        return
      }

      if (pathname === '/api/admin/users' && req.method === 'GET') {
        json(res, 200, { users: store.readUsers() })
        return
      }

      if (pathname === '/api/admin/users' && req.method === 'POST') {
        const body = await parseBody(req)
        json(res, 200, { users: store.createUser(body.user ?? {}) })
        return
      }

      if (pathname.startsWith('/api/admin/users/') && req.method === 'PUT') {
        const username = decodeURIComponent(pathname.replace('/api/admin/users/', ''))
        const body = await parseBody(req)
        json(res, 200, { users: store.updateUser(username, body.user ?? {}) })
        return
      }

      if (pathname.startsWith('/api/admin/users/') && req.method === 'DELETE') {
        const username = decodeURIComponent(pathname.replace('/api/admin/users/', ''))
        json(res, 200, { users: store.deleteUser(username) })
        return
      }

      if (pathname === '/api/admin/break-modes' && req.method === 'POST') {
        const body = await parseBody(req)
        json(res, 200, { breakModes: store.writeBreakModes(body.breakModes ?? breakModes) })
        return
      }

      if (pathname === '/api/admin/reset-runtime' && req.method === 'POST') {
        store.resetRuntimeData()
        json(res, 200, { ok: true })
        return
      }

      if (pathname.startsWith('/api/admin/products/') && req.method === 'PATCH') {
        const productId = decodeURIComponent(pathname.replace('/api/admin/products/', ''))
        const body = await parseBody(req)
        json(res, 200, { product: store.updateProduct(productId, body.product ?? {}) })
        return
      }

      if (pathname === '/api/shop/products' && req.method === 'GET') {
        await sleep(latency)

        if (breakModes.apiFailures.products) {
          json(res, 503, { error: 'Product service did not return data.' })
          return
        }

        const products = breakModes.emptyProductList
          ? []
          : store.readProducts().filter((product) => !product.hidden)

        json(res, 200, { products })
        return
      }

      if (pathname === '/api/orders' && req.method === 'GET') {
        await sleep(latency)

        if (breakModes.apiFailures.orders) {
          json(res, 503, { error: 'Orders service did not return data.' })
          return
        }

        json(res, 200, { orders: store.readOrders() })
        return
      }

      if (pathname === '/api/orders' && req.method === 'POST') {
        await sleep(latency)

        if (breakModes.apiFailures.orders) {
          json(res, 503, { error: 'Checkout request failed before order creation.' })
          return
        }

        const body = await parseBody(req)
        const products = store.readProducts()
        const subtotal = (body.items ?? []).reduce((total, item) => {
          const product = products.find((candidate) => candidate.id === item.productId)
          return total + (product?.price ?? 0) * item.quantity
        }, 0)
        const total = breakModes.brokenCheckoutTotal ? Math.max(subtotal - 7, 0) : subtotal + 12
        const order = {
          id: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          userRole: body.userRole,
          username: body.username,
          items: body.items,
          shipping: body.shipping,
          payment: {
            cardName: body.payment.cardName,
            cardLast4: String(body.payment.cardNumber).slice(-4),
          },
          subtotal,
          total,
        }

        store.addOrder(order)
        json(res, 200, { order })
        return
      }

      if (pathname === '/api/desktop/context' && req.method === 'GET') {
        json(res, 200, { desktop: desktopContextProvider() })
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
