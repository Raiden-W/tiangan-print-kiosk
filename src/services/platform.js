export function getRuntimeInfo() {
  if (window.kiosk) return window.kiosk.getRuntimeInfo()
  return Promise.resolve({ mode: 'browser', version: '0.1.0', printing: 'not-configured' })
}
