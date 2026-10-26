const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kioskPrint', {
  getTicket: () => ipcRenderer.invoke('print:ticket'),
})
