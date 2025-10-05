// Simple startup script for LightDom app
import { spawn } from 'child_process';
import http from 'http';

console.log('🚀 Starting LightDom Application...');

// Start API server
console.log('📡 Starting API server...');
const apiServer = spawn('node', ['simple-api-server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Wait for API server to start
setTimeout(() => {
  console.log('🌐 Starting frontend...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true
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
  }, 8000);
}, 3000);
