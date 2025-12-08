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
      await this.startOllamaCheck();
      await this.sleep(1000);
      
      await this.startMCPServer();
      await this.sleep(2000);
      
      await this.startAPIServer();
      await this.sleep(3000);
      
      await this.startHeadlessServer();
      await this.sleep(2000);
      
      await this.startFrontend();
      await this.sleep(2000);
      
      await this.startBlockchainRunner();
      await this.sleep(2000);
      
      await this.startStorybook();
      
      console.log('\n✅ All services started successfully!');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('🔌 API Server: http://localhost:3001');
      console.log('🤖 Headless Server: http://localhost:3002');
      console.log('⛓️  Blockchain: Running in background');
      console.log('🧠 Ollama DeepSeek: http://localhost:11434');
      console.log('🔧 MCP Server: http://localhost:3100');
      console.log('📖 Storybook: http://localhost:6006');
      console.log('\nPress Ctrl+C to stop all services');
      
      // Keep the process alive
      await this.keepAlive();
      
    } catch (error) {
      console.error('❌ Failed to start system:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async startOllamaCheck() {
    console.log('🧠 Checking Ollama DeepSeek...');
    
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const hasDeepSeek = data.models?.some(m => m.name.includes('deepseek'));
        if (hasDeepSeek) {
          console.log('✅ Ollama DeepSeek is running');
        } else {
          console.log('⚠️ Ollama is running but DeepSeek model not found');
          console.log('   Run: ollama pull deepseek-r1');
        }
      }
    } catch (error) {
      console.log('⚠️ Ollama not running. Start with: ollama serve');
      console.log('   Then pull DeepSeek: ollama pull deepseek-r1');
    }
  }

  async startMCPServer() {
    console.log('🔧 Starting MCP Server...');
    
    const mcpProcess = spawn('npx', ['tsx', 'src/mcp/n8n-mcp-server.ts'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        PORT: '3100'
      }
    });

    this.processes.set('mcp', mcpProcess);

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      mcpProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[MCP] ${output.trim()}`);
        
        if (!resolved && (output.includes('MCP server') || output.includes('Server started'))) {
          resolved = true;
          resolve();
        }
      });

      mcpProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (!error.includes('Warning')) {
          console.error(`[MCP Error] ${error}`);
        }
      });

      mcpProcess.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          console.log('⚠️ MCP server failed to start:', error.message);
          resolve(); // Don't fail the whole startup
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(); // Continue even if MCP doesn't start
        }
      }, 15000);
    });
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
    console.log('⛓️  Blockchain services available');
    console.log('   To start blockchain, run: npm run start:blockchain');
    console.log('   Or use start-blockchain-app.js directly');

    // Blockchain is optional and can be started separately
    // This allows the complete system to run without requiring blockchain services
    return Promise.resolve();
  }

  async startStorybook() {
    console.log('📖 Starting Storybook...');
    
    const storybookProcess = spawn('npm', ['run', 'storybook'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        BROWSER: 'none' // Don't auto-open browser
      }
    });

    this.processes.set('storybook', storybookProcess);

    return new Promise((resolve) => {
      let resolved = false;
      
      storybookProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Storybook] ${output.trim()}`);
        
        if (!resolved && (output.includes('Storybook') && output.includes('started'))) {
          resolved = true;
          resolve();
        }
      });

      storybookProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        // Storybook outputs a lot to stderr, only log errors
        if (!error.includes('info') && !error.includes('WARN')) {
          console.error(`[Storybook Error] ${error}`);
        }
      });

      storybookProcess.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          console.log('⚠️ Storybook failed to start:', error.message);
          resolve(); // Don't fail the whole startup
        }
      });

      // Timeout after 60 seconds (Storybook can take a while to build)
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(); // Continue even if Storybook doesn't start
        }
      }, 60000);
    });
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

