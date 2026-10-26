export function getRuntimeInfo() {
  if (window.kiosk) return window.kiosk.getRuntimeInfo()
  return Promise.resolve({ mode: 'browser', version: '0.1.0', printing: 'not-configured' })
}

export function prepareTestTicket(payload) {
  if (!window.kiosk) return Promise.resolve(null)
  return window.kiosk.prepareTestTicket(payload)
}

export function printTestTicket(key) {
  if (!window.kiosk) return Promise.reject(new Error('浏览器预览不能连接打印机'))
  return window.kiosk.printTestTicket(key)
}

export function clearTestTicket(key) {
  if (window.kiosk) return window.kiosk.clearTestTicket(key)
  return Promise.resolve()
}
