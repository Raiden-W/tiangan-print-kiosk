export function isTrustedRendererURL(candidate, expected) {
  try {
    const actualURL = new URL(candidate)
    const expectedURL = new URL(expected)
    actualURL.hash = ''
    expectedURL.hash = ''
    return actualURL.href === expectedURL.href
  } catch {
    return false
  }
}

export function assertMainSender(event, window, rendererURL) {
  if (!window || event.sender !== window.webContents ||
      event.senderFrame !== window.webContents.mainFrame ||
      !isTrustedRendererURL(event.senderFrame.url, rendererURL)) throw new Error('Untrusted IPC sender')
}
