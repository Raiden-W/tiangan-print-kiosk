const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('kiosk', {
  getRuntimeInfo: () => ipcRenderer.invoke('runtime:info'),
})
