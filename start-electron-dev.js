/**
 * Start Electron Development Environment
 * Properly starts Vite dev server and Electron with correct port detection
 */

import { spawn } from 'child_process';
import http from 'http';

console.log('🚀 Starting LightDom Electron Development Environment...');

// Function to check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Function to find available port
async function findAvailablePort() {
  for (let port = 3000; port <= 3020; port++) {
    const isAvailable = await checkPort(port);
    if (!isAvailable) {
      return port;
    }
  }
  return 3000; // fallback
}

// Start the development environment
async function startDev() {
  try {
    // Start Vite dev server
    console.log('🌐 Starting Vite dev server...');
    const viteProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    // Wait for Vite to start
    console.log('⏳ Waiting for Vite dev server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Find which port Vite is running on
    let vitePort = null;
    for (let port = 3000; port <= 3020; port++) {
      const isRunning = await checkPort(port);
      if (isRunning) {
        vitePort = port;
        console.log(`✅ Found Vite dev server on port ${port}`);
        break;
      }
    }

    if (!vitePort) {
      console.error('❌ Could not find Vite dev server');
      process.exit(1);
    }

    // Start Electron
    console.log('🖥️  Starting Electron...');
    const electronProcess = spawn('npm', ['run', 'electron:dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_PORT: vitePort.toString()
      }
    });

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      viteProcess.kill();
      electronProcess.kill();
      process.exit(0);
    });

    console.log('✅ Development environment started successfully!');
    console.log(`🌐 Frontend: http://localhost:${vitePort}`);
    console.log('🖥️  Electron: Desktop app launched');
    console.log('\nPress Ctrl+C to stop all services');

  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    process.exit(1);
  }
}

startDev();
