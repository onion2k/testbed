import fs from 'node:fs'
import path from 'node:path'

export const traceHeaderName = 'x-testbed-correlation-id'

export function json(res, statusCode, payload, headers = {}) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${traceHeaderName}, Authorization`)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }

  res.end(JSON.stringify(payload))
}

export function sendRaw(res, statusCode, body, headers = {}) {
  res.statusCode = statusCode
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', `Content-Type, ${traceHeaderName}, Authorization`)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }

  res.end(body)
}

export function sendFile(res, filePath) {
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

export async function readRawBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}

export function parseJsonBody(rawBody) {
  if (!rawBody) {
    return {}
  }

  return JSON.parse(rawBody)
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function filterHeaders(headers) {
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

export function truncateBody(rawBody) {
  if (!rawBody) return null
  return rawBody.length > 1500 ? `${rawBody.slice(0, 1500)}…` : rawBody
}
