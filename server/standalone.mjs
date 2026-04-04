import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { startTestbedServer } from './create-server.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const dataDirectory =
  process.env.TESTBED_DATA_DIR ?? path.join(projectRoot, '.testbed-runtime', 'standalone')
const dev = process.argv.includes('--dev')

const runtime = await startTestbedServer({
  dataDirectory,
  dev,
})

console.log(`Testbed server running at ${runtime.serverUrl}`)
console.log(`Using data directory ${dataDirectory}`)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await runtime.close()
    process.exit(0)
  })
}
