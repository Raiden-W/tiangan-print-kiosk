import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import electron from 'electron'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({ root })
await server.listen()
server.printUrls()

const environment = { ...process.env, KIOSK_DEV_URL: 'http://127.0.0.1:5173' }
delete environment.ELECTRON_RUN_AS_NODE
const child = spawn(electron, ['.', ...process.argv.slice(2)], {
  cwd: root, env: environment, stdio: 'inherit', windowsHide: true,
})
let stopping = false
async function stop(code = 0) {
  if (stopping) return
  stopping = true
  child.kill()
  await server.close()
  process.exitCode = code
}
child.on('error', (error) => { console.error(error); void stop(1) })
child.on('exit', (code) => { void stop(code ?? 1) })
process.on('SIGINT', () => { void stop() })
process.on('SIGTERM', () => { void stop() })
