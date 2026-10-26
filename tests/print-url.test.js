import test from 'node:test'
import assert from 'node:assert/strict'
import { printDocumentURL } from '../electron/print-url.js'

test('print document follows Vite only when the Electron app uses Vite', () => {
  const filePath = 'E:\\kiosk\\dist\\print.html'
  assert.equal(printDocumentURL('http://127.0.0.1:5173', filePath), 'http://127.0.0.1:5173/print.html')
  assert.equal(printDocumentURL(undefined, filePath), 'file:///E:/kiosk/dist/print.html')
})
