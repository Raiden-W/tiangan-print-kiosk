import { app, BrowserWindow, ipcMain, session } from 'electron'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { isTrustedRendererURL } from './security.js'

const directory = path.dirname(fileURLToPath(import.meta.url))
let mainWindow
let rendererURL

// Keep development caches and the single-instance lock separate from an open
// packaged kiosk, so reviewing a build does not prevent local development.
if (!app.isPackaged) {
  const developmentProfile = `${app.getPath('userData')}-development`
  mkdirSync(developmentProfile, { recursive: true })
  app.setPath('userData', developmentProfile)
}

function createWindow() {
  const devURL = !app.isPackaged ? process.env.KIOSK_DEV_URL : undefined
  if (devURL && devURL !== 'http://127.0.0.1:5173') throw new Error('Untrusted development URL')
  const indexPath = path.join(directory, '../dist/index.html')
  rendererURL = devURL || pathToFileURL(indexPath).href
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 800,
    minHeight: 640,
    backgroundColor: '#f3f0e8',
    show: false,
    autoHideMenuBar: true,
    kiosk: app.isPackaged || process.argv.includes('--kiosk'),
    webPreferences: {
      preload: path.join(directory, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
    },
  })
  mainWindow.setMenu(null)
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = undefined })
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedRendererURL(url, rendererURL)) event.preventDefault()
  })
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault())
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer stopped:', details.reason)
    // A reload starts a fresh in-memory participant session.
    if (mainWindow && details.reason !== 'clean-exit') mainWindow.reload()
  })
  return devURL ? mainWindow.loadURL(devURL) : mainWindow.loadFile(indexPath)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => { mainWindow?.show(); mainWindow?.focus() })
  app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
    session.defaultSession.setPermissionCheckHandler(() => false)
    ipcMain.handle('runtime:info', (event) => {
      if (!mainWindow || event.sender !== mainWindow.webContents ||
          event.senderFrame !== mainWindow.webContents.mainFrame ||
          !isTrustedRendererURL(event.senderFrame.url, rendererURL)) {
        throw new Error('Untrusted IPC sender')
      }
      return { mode: 'desktop', version: app.getVersion(), printing: 'not-configured' }
    })
    await createWindow()
  }).catch((error) => { console.error(error); app.exit(1) })
  app.on('window-all-closed', () => app.quit())
}
