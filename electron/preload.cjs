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
  },
  
  // New integrated services
  
  // Gamification
  getGamificationStats: () => ipcRenderer.invoke('get-gamification-stats'),
  unlockAchievement: (achievementId) => ipcRenderer.invoke('unlock-achievement', achievementId),
  
  // Mining
  startMining: (config) => ipcRenderer.invoke('start-mining', config),
  stopMining: () => ipcRenderer.invoke('stop-mining'),
  getMiningStats: () => ipcRenderer.invoke('get-mining-stats'),
  
  // Optimization
  optimizeDOM: (url, html) => ipcRenderer.invoke('optimize-dom', { url, html }),
  getOptimizationHistory: () => ipcRenderer.invoke('get-optimization-history'),
  
  // Extension Bridge
  connectExtension: () => ipcRenderer.invoke('connect-extension'),
  sendToExtension: (data) => ipcRenderer.invoke('send-to-extension', data),
  onExtensionMessage: (callback) => {
    ipcRenderer.on('extension-message', (event, data) => callback(data));
  },
  
  // Utils Integration
  storeArtifact: (artifact) => ipcRenderer.invoke('store-artifact', artifact),
  batchProofs: (proofs) => ipcRenderer.invoke('batch-proofs', proofs),
  
  // Authentication
  authenticateWebAuthn: () => ipcRenderer.invoke('authenticate-webauthn'),
  enable2FA: () => ipcRenderer.invoke('enable-2fa'),
  
  // Analytics
  getAnalytics: () => ipcRenderer.invoke('get-analytics'),
  trackEvent: (event, data) => ipcRenderer.invoke('track-event', { event, data })
  ,
  // App control
  restartApp: () => ipcRenderer.invoke('app-restart')
});

// Version info
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});