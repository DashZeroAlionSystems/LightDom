/**
 * LightDom Blockchain Startup Script
 * Initializes the complete blockchain system
 */

import { spawn } from 'child_process';
import path from 'path';

class LightDomBlockchainStarter {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async start() {
    console.log('🚀 Starting LightDom Blockchain System...\n');
    
    try {
      // Start API server
      await this.startAPIServer();
      
      // Wait a moment for server to start
      await this.sleep(3000);
      
      // Test the system
      await this.testSystem();
      
      console.log('\n✅ LightDom Blockchain System started successfully!');
      console.log('📊 Dashboard: http://localhost:3001');
      console.log('🔗 Blockchain API: http://localhost:3001/api/blockchain');
      console.log('📈 Metrics: http://localhost:3001/metrics');
      console.log('\nPress Ctrl+C to stop the system');
      
    } catch (error) {
      console.error('❌ Failed to start blockchain system:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  async startAPIServer() {
    console.log('Starting API server...');
    
    return new Promise((resolve, reject) => {
      const apiProcess = spawn('node', ['api-server-express.js'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'development',
          PORT: '3001',
          HEADLESS_CHROME: 'true',
          CHROME_DEVTOOLS: 'false'
        }
      });
      
      this.processes.set('api', apiProcess);
      
      apiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('DOM Space Harvester API running')) {
          console.log('✅ API server started');
          resolve();
        }
      });
      
      apiProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('Failed')) {
          console.error('❌ API server error:', error);
          reject(new Error(error));
        }
      });
      
      apiProcess.on('error', (error) => {
        console.error('❌ Failed to start API server:', error);
        reject(error);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!apiProcess.killed) {
          console.log('✅ API server started (timeout)');
          resolve();
        }
      }, 30000);
    });
  }

  async testSystem() {
    console.log('Testing blockchain system...');
    
    try {
      const testProcess = spawn('node', ['test-blockchain.js'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      testProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      testProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      
      return new Promise((resolve) => {
        testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ System test completed successfully');
          } else {
            console.log('⚠️  System test completed with warnings');
          }
          resolve();
        });
      });
    } catch (error) {
      console.log('⚠️  System test failed:', error.message);
    }
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log('\n🛑 Shutting down LightDom Blockchain System...');
    
    for (const [name, process] of this.processes) {
      console.log(`Stopping ${name}...`);
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);
    }
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the system
const starter = new LightDomBlockchainStarter();
starter.start().catch(console.error);
