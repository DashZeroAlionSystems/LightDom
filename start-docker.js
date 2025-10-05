#!/usr/bin/env node

/**
 * LightDom Docker Startup Script
 * Starts the complete system using Docker Compose
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DockerStarter {
  constructor() {
    this.isShuttingDown = false;
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async start() {
    console.log('🐳 Starting LightDom with Docker...\n');
    
    try {
      // Check if Docker is available
      await this.checkDocker();
      
      // Start Docker services
      await this.startDockerServices();
      
      // Start local development services
      await this.startLocalServices();
      
      this.displayStatus();
      await this.keepAlive();
      
    } catch (error) {
      console.error('❌ Failed to start Docker services:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async checkDocker() {
    console.log('🔍 Checking Docker...');
    
    try {
      await execAsync('docker --version');
      await execAsync('docker-compose --version');
      console.log('✅ Docker and Docker Compose are available');
    } catch (error) {
      throw new Error('Docker or Docker Compose not found. Please install Docker Desktop.');
    }
  }

  async startDockerServices() {
    console.log('🐳 Starting Docker services...');
    
    try {
      // Stop any existing services
      await execAsync('docker-compose down', { cwd: __dirname });
      
      // Start database services
      console.log('   Starting PostgreSQL and Redis...');
      await execAsync('docker-compose up -d postgres redis', { cwd: __dirname });
      
      // Wait for services to be ready
      await this.waitForDockerServices();
      
      console.log('✅ Docker services started');
      
    } catch (error) {
      throw new Error(`Failed to start Docker services: ${error.message}`);
    }
  }

  async startLocalServices() {
    console.log('🚀 Starting local services...');
    
    // Start API server
    const apiProcess = spawn('node', ['simple-api-server.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: '3001',
        DATABASE_URL: 'postgresql://lightdom_user:lightdom_password@localhost:5434/lightdom',
        REDIS_URL: 'redis://:lightdom_redis_password@localhost:6380'
      }
    });

    // Start frontend
    setTimeout(() => {
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, VITE_PORT: '3000' }
      });
    }, 3000);

    // Start Electron
    setTimeout(() => {
      const electronProcess = spawn('npm', ['run', 'electron:dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
      });
    }, 8000);
  }

  async waitForDockerServices() {
    console.log('⏳ Waiting for Docker services to be ready...');
    
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Check PostgreSQL
        await execAsync('docker-compose exec -T postgres pg_isready -U lightdom_user -d lightdom');
        
        // Check Redis
        await execAsync('docker-compose exec -T redis redis-cli ping');
        
        console.log('✅ Docker services are ready');
        return;
        
      } catch (error) {
        await this.sleep(1000);
      }
    }
    
    throw new Error('Docker services failed to start within timeout');
  }

  displayStatus() {
    console.log('\n🎉 LightDom Docker Environment Started!');
    console.log('='.repeat(60));
    console.log('🐳 Docker Services:');
    console.log('   • PostgreSQL: localhost:5434');
    console.log('   • Redis: localhost:6380');
    console.log('🚀 Local Services:');
    console.log('   • API Server: http://localhost:3001');
    console.log('   • Frontend: http://localhost:3000');
    console.log('   • Desktop App: Electron (launched)');
    console.log('='.repeat(60));
    console.log('🔄 Press Ctrl+C to stop all services');
    console.log('='.repeat(60));
  }

  async keepAlive() {
    return new Promise(() => {
      // Keep alive
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    console.log('\n🛑 Shutting down Docker services...');
    
    try {
      await execAsync('docker-compose down', { cwd: __dirname });
      console.log('✅ Docker services stopped');
    } catch (error) {
      console.log('⚠️  Error stopping Docker services:', error.message);
    }
    
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start Docker environment
const starter = new DockerStarter();
starter.start().catch(console.error);
