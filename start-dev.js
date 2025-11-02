#!/usr/bin/env node

/**
 * LightDom Development Startup Script
 * Quick startup for development - starts essential services only
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DevStarter {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async start() {
    console.log('🚀 Starting LightDom Development Environment...\n');
    
    try {
      // Start API server
      await this.startAPIServer();
      await this.sleep(2000);
      
      // Start frontend
      await this.startFrontend();
      await this.sleep(3000);
      
      // Start Electron
      await this.startElectron();
      
      console.log('\n✅ Development environment ready!');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('🔌 API: http://localhost:3001');
      console.log('🖥️  Desktop App: Launched');
      console.log('\nPress Ctrl+C to stop');
      
      await this.keepAlive();
      
    } catch (error) {
      console.error('❌ Failed to start:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async startAPIServer() {
    console.log('🔌 Starting API Server...');
    
    const apiProcess = spawn('node', ['simple-api-server.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, PORT: '3001' }
    });

    this.processes.set('api', apiProcess);
    console.log('✅ API Server started');
  }

  async startFrontend() {
    console.log('🌐 Starting Frontend...');
    // Prefer the dedicated `frontend` directory if it exists. This allows the
    // newer React app under `./frontend` to be started instead of the root
    // vite config when present.
    const frontendDir = path.join(__dirname, 'frontend');
    const cwd = fs.existsSync(frontendDir) ? frontendDir : __dirname;

    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, VITE_PORT: '3000' }
    });

    this.processes.set('frontend', frontendProcess);
    console.log('✅ Frontend started');
  }

  async startElectron() {
    console.log('🖥️  Starting Electron...');
    
    const electronProcess = spawn('npm', ['run', 'electron:dev'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    this.processes.set('electron', electronProcess);
    console.log('✅ Electron started');
  }

  async keepAlive() {
    return new Promise(() => {
      // Keep alive
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    console.log('\n🛑 Shutting down...');
    
    for (const [name, process] of this.processes) {
      try {
        process.kill('SIGTERM');
      } catch (error) {
        // Ignore errors
      }
    }
    
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start development environment
const starter = new DevStarter();
starter.start().catch(console.error);
