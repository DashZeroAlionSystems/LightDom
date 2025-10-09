/**
 * Clean Startup Script for LightDom
 * Ensures proper port allocation and service startup
 */

import { spawn } from 'child_process';
import http from 'http';

console.log('🚀 Starting LightDom Application (Clean Mode)...');

// Kill any existing processes
console.log('🧹 Cleaning up existing processes...');
try {
  // This will be handled by the user manually stopping processes
  console.log('⚠️  Please stop any running Node.js/Electron processes manually if needed');
} catch (error) {
  console.log('ℹ️  No existing processes to clean up');
}

// Start API server first
console.log('📡 Starting API Server...');
const apiServer = spawn('node', ['simple-api-server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Wait for API server to start
setTimeout(() => {
  console.log('🌐 Starting Frontend...');
  
  // Start Vite with specific port
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true,
    env: {
      ...process.env,
      VITE_PORT: '3000'
    }
  });

  // Wait for frontend to start
  setTimeout(() => {
    console.log('🖥️  Starting Electron...');
    
    const electron = spawn('npm', ['run', 'electron:dev'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true
    });

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      apiServer.kill();
      frontend.kill();
      electron.kill();
      process.exit(0);
    });

  }, 8000); // Wait 8 seconds for frontend

}, 3000); // Wait 3 seconds for API server

console.log('✅ Startup sequence initiated');
console.log('🌐 Frontend will be available at: http://localhost:3000');
console.log('🔌 API will be available at: http://localhost:3001');
console.log('🖥️  Electron app will launch automatically');
console.log('\nPress Ctrl+C to stop all services');
