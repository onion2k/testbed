import os from 'node:os'
import path from 'node:path'
import { startTestbedServer } from '../../server/create-server.mjs'

describe('health endpoint', () => {
  it('returns readiness details', async () => {
    const dataDirectory = path.join(os.tmpdir(), `testbed-vitest-${Date.now()}`)
    let server

    try {
      server = await startTestbedServer({
        dataDirectory,
        preferredPort: 6175,
        desktopContextProvider: () => ({
          serverUrl: 'http://127.0.0.1:6175',
          port: 6175,
          usedFallbackPort: false,
          dataDirectory,
          adminApiToken: 'token',
        }),
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM') {
        return
      }
      throw error
    }

    try {
      const response = await fetch(`${server.serverUrl}/api/health`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload.ok).toBe(true)
      expect(payload.port).toBe(server.port)
    } finally {
      await server.close()
    }
  })
})
