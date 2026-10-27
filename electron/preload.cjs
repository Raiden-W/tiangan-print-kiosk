const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kiosk', {
  getRuntimeInfo: () => ipcRenderer.invoke('runtime:info'),
  analyzeBirthInfo: (payload) => ipcRenderer.invoke('analysis:run', payload),
  cancelAnalysis: (requestId) => ipcRenderer.invoke('analysis:cancel', requestId),
  clearSession: () => ipcRenderer.invoke('session:clear'),
  prepareTestTicket: (payload) => ipcRenderer.invoke('print:prepare', payload),
  printTestTicket: (key) => ipcRenderer.invoke('print:submit', key),
  clearTestTicket: (key) => ipcRenderer.invoke('print:clear', key),
})
