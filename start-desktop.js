#!/usr/bin/env node

/**
 * LightDom Desktop App Launcher
 * This script launches the LightDom desktop application with Electron
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting LightDom Desktop Application...');

// Check if build exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 Building application...');
  const buildProcess = spawn('npm', ['run', 'build'], { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completed successfully');
      startElectron();
    } else {
      console.error('❌ Build failed with code:', code);
      process.exit(1);
    }
  });
} else {
  startElectron();
}

function startElectron() {
  console.log('🖥️  Launching Electron app...');
  
  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  electronProcess.on('close', (code) => {
    console.log(`\n📱 LightDom Desktop App closed with code: ${code}`);
  });

  electronProcess.on('error', (error) => {
    console.error('❌ Failed to start Electron:', error);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down LightDom Desktop App...');
    electronProcess.kill('SIGTERM');
  });

  process.on('SIGTERM', () => {
    electronProcess.kill('SIGTERM');
  });
}