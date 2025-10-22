#!/usr/bin/env node

/**
 * Complete LightDom System Startup Script
 * Starts all components: API, Frontend, Headless Chrome, and Blockchain
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteSystemStarter {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGUSR2', () => this.shutdown()); // For nodemon
  }

  async start() {
    console.log('🚀 Starting Complete LightDom System...');
    console.log('==========================================\n');
    
    try {
      // Start services in order
      await this.startAPIServer();
      await this.sleep(3000);
      
      await this.startHeadlessServer();
      await this.sleep(2000);
      
      await this.startFrontend();
      await this.sleep(2000);
      
      await this.startBlockchainRunner();
      
      console.log('\n✅ All services started successfully!');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('🔌 API Server: http://localhost:3001');
      console.log('🤖 Headless Server: http://localhost:3002');
      console.log('⛓️  Blockchain: Running in background');
      console.log('\nPress Ctrl+C to stop all services');
      
      // Keep the process alive
      await this.keepAlive();
      
    } catch (error) {
      console.error('❌ Failed to start system:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async startAPIServer() {
    console.log('🔧 Starting API Server...');
    
    const apiProcess = spawn('node', ['api-server-express.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        PORT: '3001',
        DB_DISABLED: 'false'
      }
    });

    this.processes.set('api', apiProcess);

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      apiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[API] ${output.trim()}`);
        
        if (!resolved && output.includes('DOM Space Harvester API running')) {
          resolved = true;
          resolve();
        }
      });

      apiProcess.stderr.on('data', (data) => {
        console.error(`[API Error] ${data.toString().trim()}`);
      });

      apiProcess.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      apiProcess.on('exit', (code) => {
        if (!resolved && code !== 0) {
          resolved = true;
          reject(new Error(`API server exited with code ${code}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('API server startup timeout'));
        }
      }, 30000);
    });
  }

  async startHeadlessServer() {
    console.log('🤖 Starting Headless Chrome Server...');
    
    const headlessProcess = spawn('npx', ['tsx', 'src/server/HeadlessAPIServer.ts'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        PORT: '3002'
      }
    });

    this.processes.set('headless', headlessProcess);

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      headlessProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Headless] ${output.trim()}`);
        
        if (!resolved && (output.includes('Headless server running') || output.includes('Server started'))) {
          resolved = true;
          resolve();
        }
      });

      headlessProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.error(`[Headless Error] ${error}`);
        
        // Don't fail on dependency warnings
        if (!error.includes('Warning') && !error.includes('warn')) {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Headless server error: ${error}`));
          }
        }
      });

      headlessProcess.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      headlessProcess.on('exit', (code) => {
        if (!resolved && code !== 0) {
          resolved = true;
          reject(new Error(`Headless server exited with code ${code}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(); // Don't fail, just continue
        }
      }, 30000);
    });
  }

  async startFrontend() {
    console.log('🎨 Starting Frontend (Discord Style)...');
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        VITE_PORT: '3000'
      }
    });

    this.processes.set('frontend', frontendProcess);

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Frontend] ${output.trim()}`);
        
        if (!resolved && output.includes('Local:') && output.includes('http://localhost:3000')) {
          resolved = true;
          resolve();
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.error(`[Frontend Error] ${error}`);
        
        // Don't fail on warnings or dependency issues
        if (!error.includes('Warning') && !error.includes('warn') && !error.includes('lucide-react')) {
          if (!resolved) {
            resolved = true;
            reject(new Error(`Frontend error: ${error}`));
          }
        }
      });

      frontendProcess.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      frontendProcess.on('exit', (code) => {
        if (!resolved && code !== 0) {
          resolved = true;
          reject(new Error(`Frontend exited with code ${code}`));
        }
      });

      // Timeout after 45 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(); // Don't fail, just continue
        }
      }, 45000);
    });
  }

  async startBlockchainRunner() {
    console.log('⛓️  Starting Blockchain Runner...');
    
    const blockchainProcess = spawn('node', ['start-blockchain.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        BLOCKCHAIN_ENABLED: 'true'
      }
    });

    this.processes.set('blockchain', blockchainProcess);

    // Don't wait for blockchain to fully start, just start it
    blockchainProcess.stdout.on('data', (data) => {
      console.log(`[Blockchain] ${data.toString().trim()}`);
    });

    blockchainProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      console.error(`[Blockchain Error] ${error}`);
    });

    blockchainProcess.on('error', (error) => {
      console.error(`[Blockchain Error] ${error.message}`);
    });

    return Promise.resolve();
  }

  async keepAlive() {
    return new Promise((resolve) => {
      // Health check interval
      const healthCheck = setInterval(async () => {
        if (this.isShuttingDown) {
          clearInterval(healthCheck);
          return;
        }

        // Check if processes are still running
        for (const [name, process] of this.processes) {
          if (process.exitCode !== null && process.exitCode !== 0) {
            console.warn(`⚠️  Process ${name} has exited with code ${process.exitCode}`);
          }
        }
      }, 30000); // Check every 30 seconds

      // Keep the process running
      // This promise never resolves, keeping the process alive
    });
  }

  async shutdown() {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    console.log('\n🛑 Shutting down all services...');
    
    const shutdownPromises = [];
    
    for (const [name, process] of this.processes) {
      console.log(`🔄 Stopping ${name}...`);
      
      const promise = new Promise((resolve) => {
        if (process.exitCode !== null) {
          resolve();
          return;
        }
        
        process.on('exit', resolve);
        process.kill('SIGTERM');
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (process.exitCode === null) {
            process.kill('SIGKILL');
            resolve();
          }
        }, 5000);
      });
      
      shutdownPromises.push(promise);
    }
    
    await Promise.all(shutdownPromises);
    console.log('✅ All services stopped');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the system
const starter = new CompleteSystemStarter();
starter.start().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

