const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // You can add an icon later
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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

// Start backend services
function startBackendServices() {
  console.log('Starting LightDom backend services...');
  
  try {
    // Start the main API server
    backendProcess = spawn('node', ['api-server-express.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
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