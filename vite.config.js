import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

// Keep one editable source of truth; serve it locally and emit a standalone JSON in dist.
function fortuneContentPlugin() {
  const filename = new URL('./content/fortune.json', import.meta.url)
  return {
    name: 'fortune-content',
    configureServer(server) {
      server.middlewares.use('/content/fortune.json', (_request, response) => {
        try {
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(readFileSync(filename))
        } catch { response.statusCode = 500; response.end('Content unavailable') }
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'content/fortune.json', source: readFileSync(filename) })
    },
  }
}

export default defineConfig(({ command }) => {
  const development = command === 'serve'
  const policy = [
    "default-src 'self'",
    `script-src 'self'${development ? " 'unsafe-inline'" : ''}`,
    `style-src 'self'${development ? " 'unsafe-inline'" : ''}`,
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws://127.0.0.1:5173 ws://localhost:5173' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-src 'none'",
  ].join('; ')

  return {
    base: './',
    plugins: [
      react(),
      fortuneContentPlugin(),
      { name: 'kiosk-csp', transformIndexHtml: (html) => html.replace('__KIOSK_CSP__', policy) },
    ],
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      watch: { ignored: ['**/.tools/**', '**/release/**', '**/output/**', '**/.playwright-cli/**'] },
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
    build: {
      outDir: 'dist', target: 'es2022',
      rollupOptions: { input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        print: fileURLToPath(new URL('./print.html', import.meta.url)),
      } },
    },
  }
})
