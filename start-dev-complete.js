#!/usr/bin/env node

/**
 * Comprehensive Development Startup Script
 * 
 * Starts all services including Storybook for a complete development experience
 * Features:
 * - API Server
 * - Frontend (Vite)
 * - Storybook
 * - Health monitoring
 * - Graceful shutdown
 */

import { spawn } from 'child_process';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DevEnvironment {
  constructor() {
    this.processes = new Map();
    this.ports = {
      api: 3001,
      frontend: 3000,
      storybook: 6006,
    };
    this.startTime = Date.now();
    this.isShuttingDown = false;

    this.setupShutdownHandlers();
  }

  setupShutdownHandlers() {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log('\n\n📝 Shutting down development environment...');
      
      for (const [name, process] of this.processes.entries()) {
        console.log(`   Stopping ${name}...`);
        try {
          process.kill('SIGTERM');
        } catch (error) {
          console.error(`   Failed to stop ${name}:`, error.message);
        }
      }

      setTimeout(() => {
        console.log('✅ Development environment stopped');
        process.exit(0);
      }, 2000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async checkHealth(port, name) {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        resolve(res.statusCode === 200);
        req.destroy();
      });

      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async waitForService(port, name, maxAttempts = 30) {
    console.log(`   ⏳ Waiting for ${name} to be ready...`);
    
    for (let i = 1; i <= maxAttempts; i++) {
      const healthy = await this.checkHealth(port, name);
      
      if (healthy) {
        console.log(`   ✅ ${name} is ready (${i}/${maxAttempts})`);
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`   ⚠️  ${name} not ready after ${maxAttempts} attempts`);
    return false;
  }

  async startAPI() {
    console.log('\n🔌 Starting API Server...');
    
    const apiProcess = spawn('node', ['api-server-express.js'], {
      cwd: __dirname,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: this.ports.api,
        NODE_ENV: 'development',
      },
    });

    this.processes.set('api', apiProcess);

    apiProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('running') || output.includes('started')) {
        console.log('   📡 API Server output:', output.trim());
      }
    });

    apiProcess.stderr.on('data', (data) => {
      console.error('   ⚠️  API Error:', data.toString());
    });

    apiProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('   ❌ API Server crashed with code', code);
      }
    });

    await this.waitForService(this.ports.api, 'API Server');
  }

  async startFrontend() {
    console.log('\n🌐 Starting Frontend (Vite)...');
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        PORT: this.ports.frontend,
        NODE_ENV: 'development',
      },
    });

    this.processes.set('frontend', frontendProcess);

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('ready')) {
        console.log('   🎨 Frontend:', output.trim());
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (!output.includes('Warning') && !output.includes('Deprecation')) {
        console.error('   ⚠️  Frontend Error:', output);
      }
    });

    frontendProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('   ❌ Frontend crashed with code', code);
      }
    });

    await this.waitForService(this.ports.frontend, 'Frontend');
  }

  async startStorybook() {
    console.log('\n📚 Starting Storybook...');
    
    const storybookProcess = spawn('npm', ['run', 'storybook'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    this.processes.set('storybook', storybookProcess);

    let storybookReady = false;

    storybookProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Storybook') && output.includes('started') && !storybookReady) {
        storybookReady = true;
        console.log('   📖 Storybook:', output.trim());
      }
    });

    storybookProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Filter noise
      if (!output.includes('ExperimentalWarning') && 
          !output.includes('punycode') &&
          !output.includes('DEP0040') &&
          !output.includes('SourceMap')) {
        console.error('   ⚠️  Storybook:', output.trim());
      }
    });

    storybookProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('   ❌ Storybook crashed with code', code);
      }
    });

    await this.waitForService(this.ports.storybook, 'Storybook', 40);
  }

  displayWelcome() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    console.log('\n\n' + '='.repeat(80));
    console.log('🎉 LightDom Development Environment Ready!');
    console.log('='.repeat(80));
    console.log();
    console.log('📡 Services:');
    console.log(`   • API Server:  http://localhost:${this.ports.api}`);
    console.log(`   • Frontend:    http://localhost:${this.ports.frontend}`);
    console.log(`   • Storybook:   http://localhost:${this.ports.storybook}`);
    console.log();
    console.log('📚 Quick Links:');
    console.log(`   • Animation Controls:     http://localhost:${this.ports.storybook}/?path=/story/design-system-animation-controls--default`);
    console.log(`   • Product Overview:       http://localhost:${this.ports.storybook}/?path=/story/product-pages-product-overview--default`);
    console.log(`   • Theme Configurator:     http://localhost:${this.ports.storybook}/?path=/story/design-system-theme-configurator--default`);
    console.log();
    console.log('🧪 Testing:');
    console.log('   • Run tests:              npm run test:storybook');
    console.log('   • Watch tests:            npm run test:storybook:watch');
    console.log('   • Component tests:        npm test');
    console.log();
    console.log('⏰ Started in:', uptime, 'seconds');
    console.log('📝 Press Ctrl+C to stop all services');
    console.log('='.repeat(80));
    console.log();
  }

  async start() {
    console.log('🚀 Starting LightDom Development Environment...\n');
    console.log('='.repeat(80));
    console.log('🌐 LightDom - Complete Development Setup');
    console.log('='.repeat(80));
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`📁 Directory: ${__dirname}`);
    console.log('='.repeat(80));

    try {
      // Start services in parallel for faster startup
      await Promise.all([
        this.startAPI(),
        this.startFrontend(),
        this.startStorybook(),
      ]);

      this.displayWelcome();

      // Keep alive
      await new Promise(() => {});
    } catch (error) {
      console.error('\n❌ Failed to start environment:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('\n📝 Shutting down...');
    
    for (const [name, process] of this.processes.entries()) {
      console.log(`   Stopping ${name}...`);
      process.kill('SIGTERM');
    }

    setTimeout(() => {
      console.log('✅ All services stopped');
      process.exit(0);
    }, 3000);
  }
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = new DevEnvironment();
  env.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { DevEnvironment };
