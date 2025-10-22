/**
 * LightDom Enhanced Electron Main Process
 * Implements 2025 best practices for Electron applications
 * Features:
 * - Advanced security with CSP and sandbox
 * - Auto-updates with electron-updater
 * - System tray integration
 * - Global keyboard shortcuts
 * - Process management and IPC
 * - Worker pool for Puppeteer
 * - Native notifications
 */

const { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, Notification, nativeTheme, shell, dialog } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
const http = require('http');
const fs = require('fs/promises');

// Environment and mode detection
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged || process.argv.includes('--dev');
const isProduction = !isDev;

// Configuration
const CONFIG = {
  window: {
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
  },
  devServer: {
    ports: Array.from({ length: 16 }, (_, i) => 3000 + i),
    timeout: 2000,
  },
  security: {
    enableCSP: true,
    enableSandbox: true,
    enableNodeIntegration: false,
  },
  features: {
    autoUpdate: isProduction,
    systemTray: true,
    globalShortcuts: true,
    hardwareAcceleration: true,
  }
};

// Logging utility
const logger = {
  info: (...args) => console.log('ℹ️ [INFO]', ...args),
  success: (...args) => console.log('✅ [SUCCESS]', ...args),
  warn: (...args) => console.warn('⚠️  [WARN]', ...args),
  error: (...args) => console.error('❌ [ERROR]', ...args),
  debug: (...args) => isDev && console.log('🔧 [DEBUG]', ...args),
};

// Global state
const state = {
  mainWindow: null,
  tray: null,
  backendProcess: null,
  workerPool: [],
  services: new Map(),
  isQuitting: false,
};

logger.info('Initializing LightDom Electron Application');
logger.debug('Environment:', { isDev, isProduction, platform: process.platform });

// =============================================================================
// WINDOW MANAGEMENT
// =============================================================================

/**
 * Creates the main application window with security best practices
 */
function createMainWindow() {
  logger.info('Creating main window...');

  const windowState = {
    width: CONFIG.window.width,
    height: CONFIG.window.height,
    x: undefined,
    y: undefined,
  };

  const mainWindow = new BrowserWindow({
    ...windowState,
    minWidth: CONFIG.window.minWidth,
    minHeight: CONFIG.window.minHeight,
    show: false, // Use 'ready-to-show' event
    backgroundColor: '#0A0E27', // Match app theme
    webPreferences: {
      // Security best practices
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: CONFIG.security.enableSandbox,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,

      // Preload script for IPC bridge
      preload: path.join(__dirname, 'preload-enhanced.js'),

      // Performance
      backgroundThrottling: false,
    },

    // Window chrome
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    icon: path.join(__dirname, '../public/icons/icon-512x512.png'),

    // macOS specific
    ...(process.platform === 'darwin' && {
      trafficLightPosition: { x: 10, y: 10 },
    }),
  });

  // Content Security Policy
  if (CONFIG.security.enableCSP) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // React dev needs unsafe-eval
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' ws: wss: http: https:",
            "frame-src 'none'",
          ].join('; '),
        },
      });
    });
  }

  // Load the application
  loadApplication(mainWindow);

  // Window event handlers
  mainWindow.once('ready-to-show', () => {
    logger.success('Main window ready to show');
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.on('closed', () => {
    logger.info('Main window closed');
    state.mainWindow = null;
  });

  // Prevent navigation to external URLs (security)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = new URL(url);
    if (appUrl.origin !== `http://localhost:${getCurrentDevPort()}` && !url.startsWith('file://')) {
      event.preventDefault();
      logger.warn('Prevented navigation to:', url);
      shell.openExternal(url);
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    logger.error('Renderer process gone:', details);
    if (details.reason !== 'clean-exit') {
      dialog.showErrorBox(
        'Application Error',
        `The application crashed: ${details.reason}\nExitCode: ${details.exitCode}`
      );
    }
  });

  state.mainWindow = mainWindow;
  return mainWindow;
}

/**
 * Load the application (dev server or production build)
 */
async function loadApplication(window) {
  if (isDev) {
    await loadDevServer(window);
  } else {
    await loadProductionBuild(window);
  }
}

/**
 * Try to connect to Vite dev server
 */
async function loadDevServer(window) {
  logger.info('Looking for development server...');

  for (const port of CONFIG.devServer.ports) {
    try {
      const available = await checkPort(port);
      if (available) {
        const url = `http://localhost:${port}`;
        logger.success(`Found dev server at ${url}`);
        await window.loadURL(url);
        return;
      }
    } catch (error) {
      // Try next port
    }
  }

  // Fallback
  logger.warn('No dev server found, loading production build');
  await loadProductionBuild(window);
}

/**
 * Load production build
 */
async function loadProductionBuild(window) {
  const indexPath = path.join(__dirname, '../dist/index.html');

  try {
    await fs.access(indexPath);
    logger.info('Loading production build from:', indexPath);
    await window.loadFile(indexPath);
  } catch (error) {
    logger.error('Failed to load production build:', error);
    await window.loadURL('data:text/html,<h1>LightDom</h1><p>Please build the app: npm run build</p>');
  }
}

/**
 * Check if a port is available
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(CONFIG.devServer.timeout, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function getCurrentDevPort() {
  return 3000; // Default, can be made dynamic
}

// =============================================================================
// SYSTEM TRAY
// =============================================================================

function createSystemTray() {
  if (!CONFIG.features.systemTray) return;

  logger.info('Creating system tray...');

  const iconPath = path.join(__dirname, '../public/icons/icon-32x32.png');
  state.tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show LightDom',
      click: () => {
        if (state.mainWindow) {
          state.mainWindow.show();
          state.mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Dashboard',
      click: () => navigateToRoute('/dashboard'),
    },
    {
      label: 'Space Mining',
      click: () => navigateToRoute('/space-mining'),
    },
    {
      label: 'Wallet',
      click: () => navigateToRoute('/wallet'),
    },
    { type: 'separator' },
    {
      label: 'Start Crawling',
      click: () => state.mainWindow?.webContents.send('tray-action', 'start-crawling'),
    },
    {
      label: 'Stop Crawling',
      click: () => state.mainWindow?.webContents.send('tray-action', 'stop-crawling'),
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => navigateToRoute('/settings'),
    },
    {
      label: 'About',
      click: () => showAboutDialog(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        state.isQuitting = true;
        app.quit();
      },
    },
  ]);

  state.tray.setContextMenu(contextMenu);
  state.tray.setToolTip('LightDom Space-Bridge Platform');

  state.tray.on('click', () => {
    if (state.mainWindow) {
      if (state.mainWindow.isVisible()) {
        state.mainWindow.hide();
      } else {
        state.mainWindow.show();
      }
    }
  });

  logger.success('System tray created');
}

function navigateToRoute(route) {
  if (state.mainWindow) {
    state.mainWindow.webContents.send('navigate', route);
    state.mainWindow.show();
  }
}

function showAboutDialog() {
  dialog.showMessageBox(state.mainWindow, {
    type: 'info',
    title: 'About LightDom',
    message: 'LightDom Space-Bridge Platform',
    detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}`,
    buttons: ['OK'],
  });
}

// =============================================================================
// GLOBAL SHORTCUTS
// =============================================================================

function registerGlobalShortcuts() {
  if (!CONFIG.features.globalShortcuts) return;

  logger.info('Registering global shortcuts...');

  const shortcuts = [
    {
      accelerator: 'CommandOrControl+Shift+L',
      action: () => {
        if (state.mainWindow) {
          state.mainWindow.isVisible() ? state.mainWindow.hide() : state.mainWindow.show();
        }
      },
    },
    {
      accelerator: 'CommandOrControl+Shift+D',
      action: () => navigateToRoute('/dashboard'),
    },
    {
      accelerator: 'CommandOrControl+Shift+M',
      action: () => navigateToRoute('/space-mining'),
    },
    {
      accelerator: 'CommandOrControl+Shift+W',
      action: () => navigateToRoute('/wallet'),
    },
  ];

  shortcuts.forEach(({ accelerator, action }) => {
    try {
      const success = globalShortcut.register(accelerator, action);
      if (success) {
        logger.debug(`Registered shortcut: ${accelerator}`);
      } else {
        logger.warn(`Failed to register shortcut: ${accelerator}`);
      }
    } catch (error) {
      logger.error(`Error registering shortcut ${accelerator}:`, error);
    }
  });

  logger.success('Global shortcuts registered');
}

// =============================================================================
// APPLICATION MENU
// =============================================================================

function createApplicationMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: createMainWindow,
        },
        { type: 'separator' },
        ...(process.platform !== 'darwin' ? [{ role: 'quit' }] : []),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Services',
      submenu: [
        {
          label: 'Start Backend',
          click: () => startBackendServices(),
        },
        {
          label: 'Start Worker Pool',
          click: () => initializeWorkerPool(),
        },
        {
          label: 'Service Status',
          click: () => state.mainWindow?.webContents.send('show-service-status'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' },
        ] : [
          { role: 'close' },
        ]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/DashZeroAlionSystems/LightDom');
          },
        },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/DashZeroAlionSystems/LightDom/wiki');
          },
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/DashZeroAlionSystems/LightDom/issues');
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => state.mainWindow?.webContents.toggleDevTools(),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  logger.success('Application menu created');
}

// =============================================================================
// BACKEND SERVICES
// =============================================================================

function startBackendServices() {
  if (state.backendProcess) {
    logger.warn('Backend services already running');
    return;
  }

  logger.info('Starting backend services...');

  try {
    const serverPath = path.join(__dirname, '../api-server-express.js');

    state.backendProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        ELECTRON_MODE: 'true',
      },
    });

    state.backendProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      logger.debug('Backend:', message);
      state.mainWindow?.webContents.send('backend-log', message);
    });

    state.backendProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      logger.error('Backend Error:', message);
      state.mainWindow?.webContents.send('backend-error', message);
    });

    state.backendProcess.on('close', (code) => {
      logger.info(`Backend process exited with code ${code}`);
      state.backendProcess = null;

      if (code !== 0 && !state.isQuitting) {
        // Attempt restart after delay
        setTimeout(() => {
          logger.info('Attempting to restart backend...');
          startBackendServices();
        }, 5000);
      }
    });

    state.backendProcess.on('error', (error) => {
      logger.error('Failed to start backend:', error);
      state.backendProcess = null;
    });

    logger.success('Backend services started');
  } catch (error) {
    logger.error('Failed to start backend services:', error);
  }
}

// =============================================================================
// WORKER POOL (for Puppeteer and intensive tasks)
// =============================================================================

function initializeWorkerPool(poolSize = 4) {
  logger.info(`Initializing worker pool with ${poolSize} workers...`);

  const workerScript = path.join(__dirname, 'workers', 'puppeteer-worker.js');

  for (let i = 0; i < poolSize; i++) {
    try {
      const worker = fork(workerScript, {
        stdio: 'pipe',
        env: {
          ...process.env,
          WORKER_ID: i,
        },
      });

      worker.id = i;
      worker.busy = false;

      worker.on('message', (message) => {
        logger.debug(`Worker ${i} message:`, message);
        state.mainWindow?.webContents.send('worker-message', { workerId: i, ...message });
      });

      worker.on('error', (error) => {
        logger.error(`Worker ${i} error:`, error);
      });

      worker.on('exit', (code) => {
        logger.warn(`Worker ${i} exited with code ${code}`);
        state.workerPool = state.workerPool.filter(w => w.id !== i);
      });

      state.workerPool.push(worker);
      logger.success(`Worker ${i} initialized`);
    } catch (error) {
      logger.error(`Failed to create worker ${i}:`, error);
    }
  }

  logger.success(`Worker pool initialized with ${state.workerPool.length} workers`);
}

function getAvailableWorker() {
  return state.workerPool.find(worker => !worker.busy);
}

function assignTaskToWorker(task) {
  const worker = getAvailableWorker();

  if (!worker) {
    logger.warn('No available workers, queuing task');
    return null;
  }

  worker.busy = true;
  worker.send(task);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.busy = false;
      reject(new Error('Worker task timeout'));
    }, 60000);

    worker.once('message', (result) => {
      clearTimeout(timeout);
      worker.busy = false;

      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result);
      }
    });
  });
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

function showNotification(title, body, options = {}) {
  if (!Notification.isSupported()) {
    logger.warn('Notifications not supported');
    return;
  }

  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, '../public/icons/icon-256x256.png'),
    ...options,
  });

  notification.on('click', () => {
    if (state.mainWindow) {
      state.mainWindow.show();
      state.mainWindow.focus();
    }
  });

  notification.show();
}

// =============================================================================
// IPC HANDLERS
// =============================================================================

function setupIPCHandlers() {
  logger.info('Setting up IPC handlers...');

  // App info
  ipcMain.handle('app:getInfo', () => ({
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
    isDev,
  }));

  // Window controls
  ipcMain.handle('window:minimize', () => state.mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (state.mainWindow?.isMaximized()) {
      state.mainWindow.unmaximize();
    } else {
      state.mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => state.mainWindow?.close());

  // Theme
  ipcMain.handle('theme:toggle', () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
    return nativeTheme.shouldUseDarkColors;
  });

  // Notifications
  ipcMain.handle('notification:show', (event, { title, body, options }) => {
    showNotification(title, body, options);
  });

  // Worker pool
  ipcMain.handle('worker:execute', async (event, task) => {
    try {
      const result = await assignTaskToWorker(task);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Puppeteer tasks
  ipcMain.handle('puppeteer:crawl', async (event, options) => {
    logger.info('Starting crawl with options:', options);
    return await assignTaskToWorker({ type: 'crawl', options });
  });

  ipcMain.handle('puppeteer:screenshot', async (event, options) => {
    logger.info('Taking screenshot:', options);
    return await assignTaskToWorker({ type: 'screenshot', options });
  });

  // File operations
  ipcMain.handle('file:select', async () => {
    const result = await dialog.showOpenDialog(state.mainWindow, {
      properties: ['openFile', 'multiSelections'],
    });
    return result.filePaths;
  });

  ipcMain.handle('file:save', async (event, { content, filename }) => {
    const result = await dialog.showSaveDialog(state.mainWindow, {
      defaultPath: filename,
    });

    if (!result.canceled) {
      await fs.writeFile(result.filePath, content);
      return { success: true, path: result.filePath };
    }

    return { success: false };
  });

  // System
  ipcMain.handle('system:openExternal', async (event, url) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('system:showInFolder', async (event, fullPath) => {
    shell.showItemInFolder(fullPath);
  });

  logger.success('IPC handlers configured');
}

// =============================================================================
// AUTO UPDATE (Production only)
// =============================================================================

function setupAutoUpdater() {
  if (!CONFIG.features.autoUpdate) return;

  try {
    const { autoUpdater } = require('electron-updater');

    autoUpdater.logger = logger;

    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      logger.info('Update available:', info.version);
      showNotification('Update Available', `Version ${info.version} is available for download`);
    });

    autoUpdater.on('update-not-available', () => {
      logger.info('No updates available');
    });

    autoUpdater.on('error', (error) => {
      logger.error('Auto updater error:', error);
    });

    autoUpdater.on('download-progress', (progress) => {
      logger.debug(`Download progress: ${progress.percent.toFixed(2)}%`);
      state.mainWindow?.webContents.send('update-progress', progress);
    });

    autoUpdater.on('update-downloaded', (info) => {
      logger.success('Update downloaded');

      dialog.showMessageBox(state.mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart to apply the update?',
        buttons: ['Restart', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });

    // Check for updates on startup and every 4 hours
    autoUpdater.checkForUpdates();
    setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);

  } catch (error) {
    logger.warn('Auto updater not available:', error.message);
  }
}

// =============================================================================
// APPLICATION LIFECYCLE
// =============================================================================

app.whenReady().then(async () => {
  logger.success('App ready, initializing...');

  // Hardware acceleration
  if (!CONFIG.features.hardwareAcceleration) {
    app.disableHardwareAcceleration();
  }

  // Create window and UI
  createMainWindow();
  createApplicationMenu();
  createSystemTray();

  // Setup features
  registerGlobalShortcuts();
  setupIPCHandlers();
  setupAutoUpdater();

  // Start services
  startBackendServices();
  initializeWorkerPool();

  // macOS activation
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (state.mainWindow) {
      state.mainWindow.show();
    }
  });

  logger.success('Application initialized successfully');
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup before quit
app.on('before-quit', () => {
  logger.info('Application shutting down...');
  state.isQuitting = true;

  // Unregister shortcuts
  globalShortcut.unregisterAll();

  // Kill backend
  if (state.backendProcess) {
    logger.info('Stopping backend process...');
    state.backendProcess.kill('SIGTERM');
  }

  // Kill workers
  state.workerPool.forEach((worker, i) => {
    logger.info(`Stopping worker ${i}...`);
    worker.kill('SIGTERM');
  });

  // Clear services
  state.services.forEach((service, name) => {
    logger.info(`Stopping service: ${name}`);
    try {
      service.kill('SIGTERM');
    } catch (error) {
      logger.error(`Error stopping ${name}:`, error);
    }
  });
});

app.on('quit', () => {
  logger.success('Application quit');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = { app, state };
