import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      { name: 'kiosk-csp', transformIndexHtml: (html) => html.replace('__KIOSK_CSP__', policy) },
    ],
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      watch: { ignored: ['**/.tools/**', '**/release/**', '**/output/**', '**/.playwright-cli/**'] },
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
    build: { outDir: 'dist', target: 'es2022' },
  }
})
