const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kiosk', {
  getRuntimeInfo: () => ipcRenderer.invoke('runtime:info'),
  prepareTestTicket: (payload) => ipcRenderer.invoke('print:prepare', payload),
  printTestTicket: (key) => ipcRenderer.invoke('print:submit', key),
  clearTestTicket: (key) => ipcRenderer.invoke('print:clear', key),
})
