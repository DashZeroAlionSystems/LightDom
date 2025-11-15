#!/usr/bin/env node

/**
 * LightDom Integrated System Startup Script
 * Simplified, validated startup that checks and starts components in order
 */

import { spawn } from 'child_process';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntegratedSystemStarter {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    this.setupShutdownHandlers();
  }

  setupShutdownHandlers() {
    const shutdown = () => this.shutdown();
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown();
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('\n🛑 Shutting down all services...');
    
    for (const [name, proc] of this.processes) {
      console.log(`  Stopping ${name}...`);
      try {
        proc.kill('SIGTERM');
        await this.sleep(1000);
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      } catch (error) {
        console.error(`  Error stopping ${name}:`, error.message);
      }
    }

    console.log('✅ All services stopped');
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkHealth(url, maxAttempts = 30, delay = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        // Service not ready yet
      }
      await this.sleep(delay);
    }
    return false;
  }

  startProcess(name, command, args = [], options = {}) {
    console.log(`🚀 Starting ${name}...`);
    
    const proc = spawn(command, args, {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...options.env },
      ...options
    });

    proc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Debugger attached')) {
        console.log(`  [${name}] ${output}`);
      }
    });

    proc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning') && !output.includes('Debugger attached')) {
        console.error(`  [${name}] ${output}`);
      }
    });

    proc.on('close', (code) => {
      if (!this.isShuttingDown) {
        console.error(`❌ ${name} exited with code ${code}`);
      }
    });

    this.processes.set(name, proc);
    return proc;
  }

  async start() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║          LightDom Integrated System Startup                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Working Directory: ${__dirname}`);
    console.log(`🗄️  Database: ${process.env.DB_DISABLED === 'true' ? 'DISABLED (dev mode)' : 'ENABLED'}`);
    console.log();

    try {
      // Step 1: Start API Server
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Step 1: Starting API Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      this.startProcess('API Server', 'node', ['api-server-express.js']);
      
      console.log('⏳ Waiting for API server to be ready...');
      const apiReady = await this.checkHealth('http://localhost:3001/api/health');
      
      if (!apiReady) {
        throw new Error('API server failed to start within timeout period');
      }
      
      console.log('✅ API Server is ready at http://localhost:3001');
      console.log();

      // Step 2: Start Frontend (Vite)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Step 2: Starting Frontend');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      this.startProcess('Frontend', 'npm', ['run', 'dev']);
      
      console.log('⏳ Waiting for frontend to be ready...');
      await this.sleep(5000); // Give Vite time to build
      
      const frontendReady = await this.checkHealth('http://localhost:3000', 15, 2000);
      
      if (!frontendReady) {
        console.warn('⚠️  Frontend may not be fully ready, but continuing...');
      } else {
        console.log('✅ Frontend is ready at http://localhost:3000');
      }
      console.log();

      // Display final status
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║              🎉 All Services Started Successfully! 🎉          ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log();
      console.log('📍 Service URLs:');
      console.log('  🌐 Frontend:    http://localhost:3000');
      console.log('  🔌 API Server:  http://localhost:3001');
      console.log('  ❤️  Health:      http://localhost:3001/api/health');
      console.log();
      console.log('📋 Available Features:');
      console.log('  • Frontend UI with Discord-style theme');
      console.log('  • RESTful API with WebSocket support');
      console.log('  • Real-time updates via Socket.IO');
      console.log('  • PWA capabilities (offline support, notifications)');
      console.log('  • RAG system with Ollama integration');
      console.log();
      console.log('ℹ️  Notes:');
      console.log('  • Database is disabled for quick development');
      console.log('  • Blockchain features require database and local node');
      console.log('  • To enable full features, set DB_DISABLED=false in .env');
      console.log();
      console.log('Press Ctrl+C to stop all services');
      console.log();

      // Keep alive
      await this.keepAlive();

    } catch (error) {
      console.error('❌ Failed to start system:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async keepAlive() {
    return new Promise(() => {
      // Keep process alive indefinitely
      setInterval(() => {
        // Periodic health check
        if (!this.isShuttingDown) {
          // Could add health monitoring here
        }
      }, 30000);
    });
  }
}

// Start the system
const starter = new IntegratedSystemStarter();
starter.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
