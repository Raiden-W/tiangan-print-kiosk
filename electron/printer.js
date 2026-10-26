import { BrowserWindow, ipcMain } from 'electron'
import { randomInt, randomUUID } from 'node:crypto'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { getFortune } from '../shared/fortune.js'
import content from '../content/fortune.json' with { type: 'json' }
import { isTrustedRendererURL } from './security.js'
import { printDocumentURL as resolvePrintDocumentURL } from './print-url.js'

const PRINTER_NAME = 'POS58Printer'
const PRINT_TIMEOUT_MS = 60_000
const normalizeName = (name) => name.replace(/[^a-z0-9]/gi, '').toLowerCase()

export function registerPrinter({ app, getMainWindow, getRendererURL, directory }) {
  let job = null
  let printWindow = null
  let printDocumentURL = null
  let active = false

  function assertMainSender(event) {
    const window = getMainWindow()
    if (!window || event.sender !== window.webContents ||
        event.senderFrame !== window.webContents.mainFrame ||
        !isTrustedRendererURL(event.senderFrame.url, getRendererURL())) {
      throw new Error('Untrusted IPC sender')
    }
  }

  function recordPath(id) {
    return path.join(app.getPath('userData'), 'print-jobs', `${id}.json`)
  }

  function saveRecord(current, first = false) {
    const folder = path.dirname(recordPath(current.id))
    mkdirSync(folder, { recursive: true })
    const record = {
      id: current.id, barcode: current.ticket.barcode, createdAt: current.createdAt,
      updatedAt: new Date().toISOString(), contentVersion: content.version,
      state: current.state, attempts: current.attempts,
    }
    const target = recordPath(current.id)
    if (first) writeFileSync(target, JSON.stringify(record), { flag: 'wx' })
    else {
      const temp = path.join(folder, `${current.id}.${randomUUID()}.tmp`)
      writeFileSync(temp, JSON.stringify(record), { flag: 'wx' })
      renameSync(temp, target)
    }
  }

  async function findPrinter() {
    const window = getMainWindow()
    if (!window) return null
    const printers = await window.webContents.getPrintersAsync()
    return printers.find((printer) => normalizeName(printer.name) === normalizeName(PRINTER_NAME)) || null
  }

  ipcMain.handle('print:prepare', async (event, payload) => {
    assertMainSender(event)
    if (!payload || typeof payload.key !== 'string' || !/^[0-9a-f-]{36}$/i.test(payload.key) ||
        typeof payload.name !== 'string' || !payload.name.trim() || payload.name.length > 48 ||
        typeof payload.birthDate !== 'string' || payload.birthDate.length > 10) {
      throw new Error('Invalid test ticket')
    }
    if (job?.key === payload.key) return { ticket: job.ticket, state: job.state }
    if (active) throw new Error('Printing is in progress')
    const fortune = getFortune(payload.birthDate, content)
    if (!fortune.placeholder) throw new Error('Test printing requires placeholder content')
    const ticket = {
      name: payload.name.trim(), element: `${fortune.nameZh} / ${fortune.nameEn}`,
      beadName: fortune.bead.name, meaning: fortune.bead.meaning,
      barcode: `TEST-${String(randomInt(0, 100_000_000)).padStart(8, '0')}`,
    }
    const next = {
      id: randomUUID(), key: payload.key, ticket, createdAt: new Date().toISOString(),
      state: 'prepared', attempts: 0,
    }
    saveRecord(next, true)
    job = next
    return { ticket, state: next.state }
  })

  ipcMain.handle('print:clear', (event, key) => {
    assertMainSender(event)
    if (!active && (key == null || job?.key === key)) job = null
  })

  ipcMain.handle('print:ticket', (event) => {
    if (!printWindow || event.sender !== printWindow.webContents ||
        event.senderFrame !== printWindow.webContents.mainFrame ||
        !isTrustedRendererURL(event.senderFrame.url, printDocumentURL) || !job) {
      throw new Error('Untrusted print document')
    }
    return job.ticket
  })

  ipcMain.handle('print:submit', async (event, key) => {
    assertMainSender(event)
    if (!job || job.key !== key) throw new Error('Test ticket has expired')
    if (active) return { state: 'submitting', barcode: job.ticket.barcode }
    if (job.state !== 'prepared') return { state: job.state, barcode: job.ticket.barcode }
    const printer = await findPrinter()
    if (!printer) return { state: 'printer-missing', barcode: job.ticket.barcode }

    const current = job
    active = true
    try {
      printWindow = new BrowserWindow({
        show: false, width: 300, height: 800,
        webPreferences: {
          preload: path.join(directory, 'print-preload.cjs'), contextIsolation: true,
          nodeIntegration: false, sandbox: true, webviewTag: false,
        },
      })
      printWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
      const printPath = path.join(directory, '../dist/print.html')
      const printURL = resolvePrintDocumentURL(process.env.KIOSK_DEV_URL, printPath)
      printDocumentURL = printURL
      printWindow.webContents.on('will-navigate', (navigationEvent, url) => {
        if (!isTrustedRendererURL(url, printDocumentURL)) navigationEvent.preventDefault()
      })
      await printWindow.loadURL(printURL)
      const ready = await Promise.race([
        printWindow.webContents.executeJavaScript(`new Promise((resolve) => {
          const timer = setInterval(() => {
            if (window.__ticketReady || window.__ticketError) {
              clearInterval(timer); resolve(Boolean(window.__ticketReady))
            }
          }, 30)
        })`),
        new Promise((resolve) => setTimeout(() => resolve(false), 10_000)),
      ])
      if (!ready) throw new Error('Print document did not load')
      const ticketHeightPx = await printWindow.webContents.executeJavaScript(`(() => {
        const ticket = document.querySelector('.fortune-ticket')
        if (!ticket) throw new Error('Print ticket is missing')
        return Math.max(ticket.getBoundingClientRect().height, ticket.scrollHeight)
      })()`)
      if (!Number.isFinite(ticketHeightPx) || ticketHeightPx <= 0) throw new Error('Invalid print ticket height')
      const paperHeightMicrons = Math.ceil(ticketHeightPx * 25_400 / 96) + 3_000
      current.attempts += 1
      current.state = 'submitting'
      saveRecord(current)
      const result = await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve({ success: false, reason: 'timeout' }), PRINT_TIMEOUT_MS)
        printWindow.webContents.print({
          silent: true, printBackground: true, deviceName: printer.name,
          margins: { marginType: 'none' }, pageSize: { width: 48_000, height: paperHeightMicrons },
        }, (success, reason) => {
          clearTimeout(timeout)
          resolve({ success, reason })
        })
      })
      if (!result.success) console.error('Print test callback failed:', result.reason || 'unknown reason')
      current.state = result.success ? 'submitted'
        : result.reason === 'Invalid printer settings' ? 'failed' : 'unknown'
    } catch (error) {
      console.error('Print test window failed:', error)
      current.state = current.state === 'prepared' ? 'failed' : 'unknown'
    } finally {
      printWindow?.destroy()
      printWindow = null
      printDocumentURL = null
      active = false
      saveRecord(current)
    }
    return { state: current.state, barcode: current.ticket.barcode }
  })

  return {
    findPrinter,
    clearOnReload() { if (!active) job = null },
  }
}
