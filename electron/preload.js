const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Crawler controls
  startCrawling: (options) => ipcRenderer.invoke('start-crawling', options),
  stopCrawling: () => ipcRenderer.invoke('stop-crawling'),
  getCrawlerStats: () => ipcRenderer.invoke('get-crawler-stats'),
  
  // Service status
  onServiceStatus: (callback) => {
    ipcRenderer.on('service-status', (event, status) => callback(status));
  },
  
  // Backend logs
  onBackendLog: (callback) => {
    ipcRenderer.on('backend-log', (event, log) => callback(log));
  },
  
  onBackendError: (callback) => {
    ipcRenderer.on('backend-error', (event, error) => callback(error));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Version info
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});