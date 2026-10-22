import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build as buildRenderer } from 'vite'
import { build as packageApplication, Platform, Arch } from 'electron-builder'

if (process.platform !== 'win32' || process.arch !== 'x64') {
  console.error('Windows packaging requires native Windows x64. Use npm run build for browser builds on Linux.')
  process.exit(1)
}

const root = fileURLToPath(new URL('../', import.meta.url))
process.chdir(root)
// Electron downloads its platform binary on first import. Reuse that verified
// installation instead of extracting a second copy via the packager cache.
const { default: electronPath } = await import('electron')
await buildRenderer({ root })
await packageApplication({
  targets: Platform.WINDOWS.createTarget(process.argv.includes('--dir') ? 'dir' : 'nsis', Arch.x64),
  config: { electronDist: path.dirname(electronPath) },
  publish: 'never',
})
