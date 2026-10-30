import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, readdirSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { registerPrinter } from '../electron/printer.js'

test('print snapshot is shared, duplicate submissions are locked before printer lookup, no personal records', async () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'tiangan-print-test-'))
  const handlers = new Map()
  const resultId = randomUUID()
  const snapshot = {
    participant: { nickname: '🪨'.repeat(50) }, promptVersion: 'test-1',
    result: { nameZh: '辛金', nameEn: 'YIN METAL', element: '金', meaning: '测试说明', placeholder: true, contentVersion: 'test-1' },
  }
  let resolvePrinters
  let printCallback
  let submits = 0
  const webContents = { mainFrame: { url: 'http://127.0.0.1:5173/' }, getPrintersAsync: () => new Promise((resolve) => { resolvePrinters = resolve }) }
  const event = { sender: webContents, senderFrame: webContents.mainFrame }
  const controller = registerPrinter({
    app: { getPath: () => folder }, directory: folder,
    ipcMain: { handle: (name, handler) => handlers.set(name, handler) },
    getMainWindow: () => ({ webContents }), getRendererURL: () => 'http://127.0.0.1:5173/',
    getSnapshot: (id) => { assert.equal(id, resultId); return structuredClone(snapshot) },
    BrowserWindow: class {
      constructor() {
        this.webContents = {
          mainFrame: {}, setWindowOpenHandler() {}, on() {},
          executeJavaScript: async (script) => script.includes('ticketHeight') || script.includes('getBoundingClientRect') ? 600 : true,
          print: (settings, callback) => {
            assert.equal(settings.pageSize.height, Math.ceil(600 * 25_400 / 96) + 3_000)
            submits++
            printCallback = callback
          },
        }
      }
      async loadURL() {}
      destroy() {}
    },
  })
  try {
    await assert.rejects(handlers.get('print:prepare')({ ...event, sender: {} }, { resultId }))
    const first = await handlers.get('print:prepare')(event, { resultId })
    const second = await handlers.get('print:prepare')(event, { resultId })
    assert.deepEqual(first, second)
    assert.equal(first.ticket.nameZh, '辛金')
    assert.equal(first.ticket.name.length, 100, '50 non-BMP code points are accepted')
    const normalLookup = webContents.getPrintersAsync
    webContents.getPrintersAsync = async () => { throw new Error('Spooler unavailable') }
    assert.deepEqual(await handlers.get('print:submit')(event, resultId), { state: 'printer-unavailable' })
    webContents.getPrintersAsync = async () => []
    assert.deepEqual(await handlers.get('print:submit')(event, resultId), { state: 'printer-missing' })
    assert.equal(submits, 0, 'enumeration failures must not submit or consume the prepared job')
    webContents.getPrintersAsync = normalLookup
    const submission = handlers.get('print:submit')(event, resultId)
    assert.deepEqual(await handlers.get('print:submit')(event, resultId), { state: 'submitting' })
    resolvePrinters([{ name: 'POS58 Printer' }])
    while (!printCallback) await new Promise((resolve) => setImmediate(resolve))
    printCallback(true)
    assert.deepEqual(await submission, { state: 'submitted' })
    assert.deepEqual(await handlers.get('print:submit')(event, resultId), { state: 'submitted' })
    assert.equal(submits, 1)
    const records = readdirSync(path.join(folder, 'print-jobs'))
    assert.equal(records.length, 1)
    const raw = readFileSync(path.join(folder, 'print-jobs', records[0]), 'utf8')
    const record = JSON.parse(raw)
    assert.equal(record.attempts, 1)
    assert.equal(record.state, 'submitted')
    for (const secret of ['nickname', 'birthDate', '辛金', '🪨', 'meaning']) assert.equal(raw.includes(secret), false)
    controller.clearOnReload()
    await assert.rejects(handlers.get('print:submit')(event, resultId))
    await handlers.get('print:prepare')(event, { resultId })
    const interrupted = handlers.get('print:submit')(event, resultId)
    printCallback = null
    controller.clearOnReload()
    resolvePrinters([{ name: 'POS58 Printer' }])
    while (!printCallback) await new Promise((resolve) => setImmediate(resolve))
    printCallback(true)
    await interrupted
    await assert.rejects(handlers.get('print:submit')(event, resultId), undefined, 'reload must discard the old ticket after active printing completes')
  } finally {
    const jobs = path.join(folder, 'print-jobs')
    for (const file of readdirSync(jobs)) unlinkSync(path.join(jobs, file))
    rmdirSync(jobs)
    rmdirSync(folder)
  }
})
