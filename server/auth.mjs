import { json } from './http-helpers.mjs'

export function getBearerToken(req) {
  const header = req.headers.authorization
  if (typeof header !== 'string') return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

export function ensureAdminAuthorization(req, res, adminApiToken) {
  if (getBearerToken(req) === adminApiToken) {
    return true
  }

  json(res, 401, {
    error: 'Admin API token is required for this route.',
  })
  return false
}
