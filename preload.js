const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDefaultPath: () => ipcRenderer.invoke('get-default-path'),
  getScanners: () => ipcRenderer.invoke('get-scanners'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  loadHistory: () => ipcRenderer.invoke('load-history'),
  startScan: (data) => ipcRenderer.invoke('start-scan', data),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  deleteHistoryItem: (filePath) => ipcRenderer.invoke('delete-history-item', filePath)
});