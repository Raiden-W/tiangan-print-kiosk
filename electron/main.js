import { app, BrowserWindow, dialog, ipcMain, session } from 'electron'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { isTrustedRendererURL, assertMainSender } from './security.js'
import { registerPrinter } from './printer.js'
import { createAnalysisController, AnalysisError, ANALYSIS_MESSAGES } from './analysis.js'
import { loadFortuneContent } from './content.js'

const directory = path.dirname(fileURLToPath(import.meta.url))
// The kiosk uses one physical 1080 x 1920 canvas, regardless of Windows DPI scaling.
app.commandLine.appendSwitch('force-device-scale-factor', '1')
// Only local development reads .env; packaged kiosks use their launch environment.
if (!app.isPackaged && existsSync(path.join(directory, '../.env'))) process.loadEnvFile(path.join(directory, '../.env'))
let mainWindow
let rendererURL
let printerController
let analysisController
let rendererMounted = false

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
    width: 1080,
    height: 1920,
    useContentSize: true,
    backgroundColor: '#202122',
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
  mainWindow.once('ready-to-show', () => {
    if (!app.isPackaged) console.info('[dev] Electron 窗口已就绪。')
    mainWindow.show()
  })
  mainWindow.on('closed', () => { analysisController?.clear(); printerController?.clearOnReload(); mainWindow = undefined })
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  if (!app.isPackaged) {
    mainWindow.webContents.on('did-finish-load', () => console.info('[dev] 页面已加载，正在启动界面。'))
    mainWindow.webContents.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
      if (isMainFrame && code !== -3) console.error(`[dev] 页面加载失败：${code} ${description}`)
    })
    mainWindow.webContents.on('console-message', (details) => {
      // Only report startup errors, before participant data can be entered.
      if (!rendererMounted && details.level === 'error') {
        console.error(`[dev] 界面启动错误：${details.message.slice(0, 1000)}`)
      }
    })
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && (input.key === 'F12' ||
          (input.control && input.shift && input.key.toLowerCase() === 'i'))) {
        mainWindow.webContents.toggleDevTools()
        event.preventDefault()
      }
    })
  }
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedRendererURL(url, rendererURL)) event.preventDefault()
  })
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault())
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    analysisController?.clear()
    printerController?.clearOnReload()
    console.error('Renderer stopped:', details.reason)
    // A reload starts a fresh in-memory participant session.
    if (mainWindow && details.reason !== 'clean-exit') mainWindow.reload()
  })
  mainWindow.webContents.on('did-start-navigation', (_event, _url, _inPlace, isMainFrame) => {
    if (isMainFrame) { rendererMounted = false; analysisController?.clear(); printerController?.clearOnReload() }
  })
  return devURL ? mainWindow.loadURL(devURL) : mainWindow.loadFile(indexPath)
}

if (!app.requestSingleInstanceLock()) {
  if (!app.isPackaged) console.warn('[dev] 已有桌面实例运行，请关闭旧窗口后重新启动。')
  app.quit()
} else {
  app.on('second-instance', () => { mainWindow?.show(); mainWindow?.focus() })
  app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
    session.defaultSession.setPermissionCheckHandler(() => false)
    const content = loadFortuneContent(app.isPackaged
      ? path.join(process.resourcesPath, 'content/fortune.json')
      : path.join(directory, '../content/fortune.json'))
    analysisController = createAnalysisController({ content })
    printerController = registerPrinter({
      app, BrowserWindow, ipcMain, getMainWindow: () => mainWindow, getRendererURL: () => rendererURL, directory,
      getSnapshot: (id) => analysisController.getSnapshot(id),
    })
    ipcMain.handle('analysis:run', async (event, payload) => {
      assertMainSender(event, mainWindow, rendererURL)
      try {
        const snapshot = await analysisController.analyze(payload?.requestId, payload?.participant)
        return { ok: true, resultId: snapshot.id, result: snapshot.result }
      } catch (error) {
        const code = error instanceof AnalysisError ? error.code : 'response'
        return { ok: false, code, message: ANALYSIS_MESSAGES[code] }
      }
    })
    ipcMain.handle('analysis:cancel', (event, requestId) => {
      assertMainSender(event, mainWindow, rendererURL)
      analysisController.cancel(requestId)
    })
    ipcMain.handle('session:clear', (event) => {
      assertMainSender(event, mainWindow, rendererURL)
      analysisController.clear()
      printerController.clearOnReload()
    })
    ipcMain.handle('runtime:info', async (event) => {
      assertMainSender(event, mainWindow, rendererURL)
      if (!rendererMounted && !app.isPackaged) console.info('[dev] React 界面已启动。')
      rendererMounted = true
      let printer
      try {
        const device = await printerController.findPrinter()
        printer = { state: device ? 'found' : 'missing', name: device?.name }
      } catch { printer = { state: 'unavailable' } }
      return { mode: 'desktop', version: app.getVersion(), printing: 'test', printer, aiConfigured: Boolean(process.env.DEEPSEEK_API_KEY?.trim()) }
    })
    await createWindow()
  }).catch((error) => { dialog.showErrorBox('应用启动失败', error.message); app.exit(1) })
  app.on('window-all-closed', () => app.quit())
}
