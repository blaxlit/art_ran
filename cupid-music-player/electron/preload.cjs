const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cupid', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  resize: (args) => ipcRenderer.send('window-resize', args),
  getPoolData: () => ipcRenderer.invoke('get-pool-data')
});