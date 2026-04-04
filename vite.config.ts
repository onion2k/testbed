import { defineConfig } from 'rolldown-vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import appConfigJson from './src/config/app-config.json'
import type { BreakModes } from './src/types'

const runtimeDir = path.resolve('.testbed-runtime')
const runtimeFile = path.join(runtimeDir, 'break-modes.json')
const defaultBreakModes = structuredClone(appConfigJson.breakModes) as BreakModes

function ensureRuntimeStateFile() {
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true })
  }

  if (!fs.existsSync(runtimeFile)) {
    fs.writeFileSync(runtimeFile, JSON.stringify(defaultBreakModes, null, 2))
  }
}

function readBreakModes() {
  ensureRuntimeStateFile()
  const raw = fs.readFileSync(runtimeFile, 'utf8')
  return JSON.parse(raw) as BreakModes
}

function writeBreakModes(nextBreakModes: BreakModes) {
  ensureRuntimeStateFile()
  fs.writeFileSync(runtimeFile, JSON.stringify(nextBreakModes, null, 2))
}

function mergeBreakModes(
  current: BreakModes,
  update: Partial<BreakModes>,
): BreakModes {
  return {
    ...current,
    ...update,
    apiFailures: {
      ...current.apiFailures,
      ...update.apiFailures,
    },
  }
}

async function parseJsonBody(req: NodeJS.ReadableStream) {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const body = Buffer.concat(chunks).toString('utf8')
  return body ? (JSON.parse(body) as unknown) : {}
}

function sendJson(
  res: {
    statusCode: number
    setHeader: (name: string, value: string) => void
    end: (body?: string) => void
  },
  statusCode: number,
  payload: unknown,
) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function testControlApiPlugin() {
  type MiddlewareRequest = {
    method?: string
    url?: string
    headers?: Record<string, string | string[] | undefined>
    [Symbol.asyncIterator]?: NodeJS.ReadableStream[typeof Symbol.asyncIterator]
  } & NodeJS.ReadableStream

  type MiddlewareResponse = {
    statusCode: number
    setHeader: (name: string, value: string) => void
    end: (body?: string) => void
  }

  type MiddlewareHandler = (
    req: MiddlewareRequest,
    res: MiddlewareResponse,
    next: () => void,
  ) => void | Promise<void>

  const handler: MiddlewareHandler = async (req, res, next) => {
    const url = req.url?.split('?')[0]

    if (!url?.startsWith('/api/test-controls')) {
      next()
      return
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET' && url === '/api/test-controls/state') {
      sendJson(res, 200, { breakModes: readBreakModes() })
      return
    }

    if (req.method === 'POST' && url === '/api/test-controls/break-modes') {
      try {
        const body = (await parseJsonBody(req)) as { breakModes?: Partial<BreakModes> }
        const merged = mergeBreakModes(readBreakModes(), body.breakModes ?? {})
        writeBreakModes(merged)
        sendJson(res, 200, { breakModes: merged })
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : 'Invalid JSON payload.',
        })
      }
      return
    }

    if (req.method === 'POST' && url === '/api/test-controls/reset') {
      writeBreakModes(defaultBreakModes)
      sendJson(res, 200, { breakModes: defaultBreakModes })
      return
    }

    sendJson(res, 404, { error: 'Not found.' })
  }

  return {
    name: 'test-control-api',
    configureServer(server: { middlewares: { use: (middleware: MiddlewareHandler) => void } }) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: { middlewares: { use: (middleware: MiddlewareHandler) => void } }) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), testControlApiPlugin()],
})
