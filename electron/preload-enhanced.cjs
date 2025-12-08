/**
 * LightDom Enhanced Preload Script
 * Provides secure, type-safe bridge between renderer and main process
 * Implements context isolation and minimal API surface
 */

const { contextBridge, ipcRenderer } = require('electron');

// =============================================================================
// TYPE-SAFE IPC API
// =============================================================================

/**
 * Secure API exposed to renderer process
 * All IPC communication goes through this bridge
 */
const electronAPI = {
  // =========================================================================
  // APP INFO
  // =========================================================================
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo'),
  },

  // =========================================================================
  // WINDOW CONTROLS
  // =========================================================================
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // =========================================================================
  // THEME
  // =========================================================================
  theme: {
    toggle: () => ipcRenderer.invoke('theme:toggle'),
  },

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  notification: {
    show: (title, body, options = {}) =>
      ipcRenderer.invoke('notification:show', { title, body, options }),
  },

  // =========================================================================
  // WORKER POOL
  // =========================================================================
  worker: {
    execute: (task) => ipcRenderer.invoke('worker:execute', task),
    createAttributeWorker: (attributeName, options) => 
      ipcRenderer.invoke('worker:createAttributeWorker', { attributeName, options }),
    getStatus: () => ipcRenderer.invoke('worker:getStatus'),
  },

  // =========================================================================
  // PUPPETEER TASKS
  // =========================================================================
  puppeteer: {
    crawl: (options) => ipcRenderer.invoke('puppeteer:crawl', options),
    screenshot: (options) => ipcRenderer.invoke('puppeteer:screenshot', options),
    mineAttribute: (options) => ipcRenderer.invoke('puppeteer:mineAttribute', options),
    generateOGImage: (options) => ipcRenderer.invoke('puppeteer:generateOGImage', options),
  },

  // =========================================================================
  // FILE OPERATIONS
  // =========================================================================
  file: {
    select: () => ipcRenderer.invoke('file:select'),
    save: (content, filename) => ipcRenderer.invoke('file:save', { content, filename }),
  },

  // =========================================================================
  // SYSTEM
  // =========================================================================
  system: {
    openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
    showInFolder: (path) => ipcRenderer.invoke('system:showInFolder', path),
  },

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================
  on: {
    /**
     * Listen for backend logs
     */
    backendLog: (callback) => {
      ipcRenderer.on('backend-log', (event, message) => callback(message));
      return () => ipcRenderer.removeAllListeners('backend-log');
    },

    /**
     * Listen for backend errors
     */
    backendError: (callback) => {
      ipcRenderer.on('backend-error', (event, message) => callback(message));
      return () => ipcRenderer.removeAllListeners('backend-error');
    },

    /**
     * Listen for worker messages
     */
    workerMessage: (callback) => {
      ipcRenderer.on('worker-message', (event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('worker-message');
    },

    /**
     * Listen for attribute worker messages
     */
    attributeWorkerMessage: (callback) => {
      ipcRenderer.on('attribute-worker-message', (event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('attribute-worker-message');
    },

    /**
     * Listen for service status updates
     */
    serviceStatus: (callback) => {
      ipcRenderer.on('service-status', (event, status) => callback(status));
      return () => ipcRenderer.removeAllListeners('service-status');
    },

    /**
     * Listen for navigation requests from tray/shortcuts
     */
    navigate: (callback) => {
      ipcRenderer.on('navigate', (event, route) => callback(route));
      return () => ipcRenderer.removeAllListeners('navigate');
    },

    /**
     * Listen for tray actions
     */
    trayAction: (callback) => {
      ipcRenderer.on('tray-action', (event, action) => callback(action));
      return () => ipcRenderer.removeAllListeners('tray-action');
    },

    /**
     * Listen for update progress
     */
    updateProgress: (callback) => {
      ipcRenderer.on('update-progress', (event, progress) => callback(progress));
      return () => ipcRenderer.removeAllListeners('update-progress');
    },

    /**
     * Listen for show service status
     */
    showServiceStatus: (callback) => {
      ipcRenderer.on('show-service-status', () => callback());
      return () => ipcRenderer.removeAllListeners('show-service-status');
    },
  },

  // =========================================================================
  // LEGACY SUPPORT (for backwards compatibility)
  // =========================================================================
  legacy: {
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    startCrawling: (options) => ipcRenderer.invoke('start-crawling', options),
    stopCrawling: () => ipcRenderer.invoke('stop-crawling'),
    getCrawlerStats: () => ipcRenderer.invoke('get-crawler-stats'),
  },
};

// =============================================================================
// PLATFORM INFO
// =============================================================================

const platformAPI = {
  platform: process.platform,
  arch: process.arch,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
};

// =============================================================================
// EXPOSE APIS TO RENDERER
// =============================================================================

try {
  contextBridge.exposeInMainWorld('electron', electronAPI);
  contextBridge.exposeInMainWorld('platform', platformAPI);

  console.log('✅ Electron API exposed successfully');
} catch (error) {
  console.error('❌ Failed to expose Electron API:', error);
}

// =============================================================================
// SECURITY: Disable node integration features
// =============================================================================

// Remove any node globals that might leak
delete global.require;
delete global.exports;
delete global.module;

// Log successful preload
console.log('🔒 Preload script loaded with context isolation');
