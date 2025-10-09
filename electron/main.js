import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import { spawn, fork } from 'child_process';
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;
let backendProcess;
let headlessServices = {
  chrome: null,
  crawler: null,
  optimization: null
};

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(import.meta.url.replace('file://', ''), 'preload.js')
    },
    icon: path.join(path.dirname(import.meta.url.replace('file://', '')), 'assets/icon.png'), // You can add an icon later
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    const candidatePorts = [Number(process.env.FRONTEND_PORT) || 3000, 3004];
    const tryLoad = async () => {
      for (const p of candidatePorts) {
        try {
          const res = await fetch(`http://localhost:${p}/@vite/client`, { cache: 'no-store' });
          if (!res.ok) throw new Error(`not vite (${res.status})`);
          await mainWindow.loadURL(`http://localhost:${p}`);
          mainWindow.webContents.openDevTools();
          return;
        } catch (err) {
          // try next port
        }
      }
      // Fallback: show simple error page
      mainWindow.loadURL('data:text/html,<h2>Frontend dev server not found</h2><p>Start Vite with npm run dev.</p>');
    };
    tryLoad();
  } else {
    mainWindow.loadFile(path.join(path.dirname(import.meta.url.replace('file://', '')), '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
// Restart app handler
ipcMain.handle('app-restart', async () => {
  app.relaunch();
  app.exit(0);
});


// Start backend services
function startBackendServices() {
  console.log('Starting LightDom backend services with all integrated features...');
  
  try {
    // Start the main API server with all services enabled
    const env = {
      ...process.env,
      ENABLE_ALL_SERVICES: 'true',
      BLOCKCHAIN_ENABLED: 'true',
      GAMIFICATION_ENABLED: 'true',
      PWA_ENABLED: 'true',
      EXTENSION_BRIDGE_ENABLED: 'true'
    };
    
    backendProcess = spawn('node', ['api-server-express.js'], {
      cwd: path.join(path.dirname(import.meta.url.replace('file://', '')), '..'),
      stdio: 'pipe',
      env
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
      if (mainWindow) {
        mainWindow.webContents.send('backend-log', data.toString());
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
      if (mainWindow) {
        mainWindow.webContents.send('backend-error', data.toString());
      }
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

  } catch (error) {
    console.error('Failed to start backend services:', error);
  }
}

// Initialize headless Chrome services
function startHeadlessServices() {
  console.log('Initializing headless Chrome services...');
  
  // Send status to renderer
  if (mainWindow) {
    mainWindow.webContents.send('service-status', {
      chrome: 'starting',
      crawler: 'starting',
      optimization: 'starting'
    });
  }

  // Simulate service initialization (replace with actual service calls)
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.webContents.send('service-status', {
        chrome: 'running',
        crawler: 'running',
        optimization: 'running'
      });
    }
  }, 3000);
}

// IPC handlers
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch
  };
});

ipcMain.handle('start-crawling', async (event, options) => {
  console.log('Starting crawling with options:', options);
  // Add your crawling logic here
  return { success: true, message: 'Crawling started' };
});

ipcMain.handle('stop-crawling', async (event) => {
  console.log('Stopping crawling');
  // Add your stop crawling logic here
  return { success: true, message: 'Crawling stopped' };
});

ipcMain.handle('get-crawler-stats', async (event) => {
  // Return mock stats - replace with actual data
  return {
    totalSpaceHarvested: 1024000,
    tokensEarned: 250,
    sitesAnalyzed: 45,
    activeCrawlers: 3
  };
});

// Integrated service IPC handlers

// Gamification handlers
ipcMain.handle('get-gamification-stats', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/gamification/stats');
    return await response.json();
  } catch (error) {
    console.error('Failed to get gamification stats:', error);
    return { error: error.message };
  }
});

ipcMain.handle('unlock-achievement', async (event, achievementId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/gamification/achievement/${achievementId}/unlock`, {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
    return { error: error.message };
  }
});

// Mining handlers
ipcMain.handle('start-mining', async (event, config) => {
  try {
    const response = await fetch('http://localhost:3001/api/mining/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to start mining:', error);
    return { error: error.message };
  }
});

ipcMain.handle('stop-mining', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/mining/stop', {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to stop mining:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get-mining-stats', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/mining/stats');
    return await response.json();
  } catch (error) {
    console.error('Failed to get mining stats:', error);
    return { error: error.message };
  }
});

// Optimization handlers
ipcMain.handle('optimize-dom', async (event, { url, html }) => {
  try {
    const response = await fetch('http://localhost:3001/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, html })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to optimize DOM:', error);
    return { error: error.message };
  }
});

// Analytics handler
ipcMain.handle('get-analytics', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/dashboard');
    return await response.json();
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return { error: error.message };
  }
});

// Extension bridge handlers
ipcMain.handle('connect-extension', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/extension/connect', {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to connect extension:', error);
    return { error: error.message };
  }
});

// Authentication handlers
ipcMain.handle('authenticate-webauthn', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/webauthn/authenticate', {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to authenticate with WebAuthn:', error);
    return { error: error.message };
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      label: 'Services',
      submenu: [
        {
          label: 'Start Backend',
          click: startBackendServices
        },
        {
          label: 'Start Headless Services',
          click: startHeadlessServices
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // Start services
  startBackendServices();
  startHeadlessServices();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Quit when all windows are closed, except on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up services before quitting
  if (backendProcess) {
    backendProcess.kill();
  }
  
  // Clean up headless services
  Object.keys(headlessServices).forEach(service => {
    if (headlessServices[service]) {
      try {
        headlessServices[service].kill();
      } catch (error) {
        console.error(`Error stopping ${service}:`, error);
      }
    }
  });
});