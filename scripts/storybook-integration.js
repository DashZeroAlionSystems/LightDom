/**
 * Storybook Integration with Main App Startup
 * 
 * This script integrates Storybook into the main application startup process
 * Provides seamless development experience with all services running together
 */

import { spawn } from 'child_process';
import { StorybookService } from './storybook-service.js';
import http from 'http';

class StorybookIntegration {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.autoStart = options.autoStart !== false;
    this.port = options.port || 6006;
    this.service = null;
    this.healthCheckInterval = null;
  }

  /**
   * Initialize Storybook integration
   */
  async initialize() {
    if (!this.enabled) {
      console.log('📚 Storybook integration is disabled');
      return false;
    }

    console.log('📚 Initializing Storybook integration...');
    
    this.service = new StorybookService({
      port: this.port,
      autoStart: this.autoStart,
    });

    return true;
  }

  /**
   * Start Storybook service
   */
  async start() {
    if (!this.service) {
      console.error('❌ Storybook service not initialized');
      return false;
    }

    try {
      console.log('🚀 Starting Storybook...');
      await this.service.start();
      
      const healthy = await this.service.waitForHealth(30, 2000);
      
      if (healthy) {
        console.log('✅ Storybook started successfully');
        console.log(`   📖 View stories: http://localhost:${this.port}`);
        console.log(`   🧪 Run tests: npm run test:storybook`);
        console.log();
        
        // Start health monitoring
        this.service.startHealthMonitoring(60000); // Check every minute
        
        return true;
      } else {
        console.error('❌ Storybook failed to start');
        return false;
      }
    } catch (error) {
      console.error('❌ Error starting Storybook:', error.message);
      return false;
    }
  }

  /**
   * Stop Storybook service
   */
  async stop() {
    if (!this.service) {
      return true;
    }

    console.log('🛑 Stopping Storybook...');
    
    this.service.stopHealthMonitoring();
    await this.service.stop();
    
    return true;
  }

  /**
   * Check if Storybook is running
   */
  async isRunning() {
    if (!this.service) {
      return false;
    }

    return await this.service.checkHealth();
  }

  /**
   * Get Storybook info
   */
  getInfo() {
    return {
      enabled: this.enabled,
      port: this.port,
      url: `http://localhost:${this.port}`,
      docsUrl: `http://localhost:${this.port}/?path=/docs`,
    };
  }

  /**
   * Run Storybook tests
   */
  async runTests() {
    console.log('🧪 Running Storybook tests...');
    
    return new Promise((resolve, reject) => {
      const testProcess = spawn('npm', ['run', 'test:storybook'], {
        stdio: 'inherit',
        shell: true,
      });

      testProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Storybook tests passed');
          resolve(true);
        } else {
          console.error('❌ Storybook tests failed');
          reject(new Error(`Tests failed with code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        console.error('❌ Error running tests:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Build Storybook static site
   */
  async build() {
    console.log('🏗️  Building Storybook...');
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'storybook:build'], {
        stdio: 'inherit',
        shell: true,
      });

      buildProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Storybook built successfully');
          console.log('   📦 Output: storybook-static/');
          resolve(true);
        } else {
          console.error('❌ Storybook build failed');
          reject(new Error(`Build failed with code ${code}`));
        }
      });

      buildProcess.on('error', (error) => {
        console.error('❌ Error building Storybook:', error.message);
        reject(error);
      });
    });
  }
}

// Export for use in other scripts
export { StorybookIntegration };

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'start';
  const integration = new StorybookIntegration();

  const commands = {
    init: async () => {
      await integration.initialize();
      console.log('✅ Storybook integration initialized');
    },
    
    start: async () => {
      await integration.initialize();
      await integration.start();
      
      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('\n📝 Shutting down Storybook...');
        await integration.stop();
        process.exit(0);
      });
    },
    
    stop: async () => {
      await integration.initialize();
      await integration.stop();
      process.exit(0);
    },
    
    status: async () => {
      await integration.initialize();
      const running = await integration.isRunning();
      const info = integration.getInfo();
      
      console.log('\n📚 Storybook Status');
      console.log('================');
      console.log(`Enabled: ${info.enabled ? '✅' : '❌'}`);
      console.log(`Running: ${running ? '✅' : '❌'}`);
      console.log(`Port: ${info.port}`);
      console.log(`URL: ${info.url}`);
      console.log(`Docs: ${info.docsUrl}`);
      console.log();
      
      process.exit(running ? 0 : 1);
    },
    
    test: async () => {
      try {
        await integration.runTests();
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    },
    
    build: async () => {
      try {
        await integration.build();
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    },
    
    info: async () => {
      await integration.initialize();
      const info = integration.getInfo();
      
      console.log('\n📚 Storybook Information');
      console.log('====================');
      console.log(JSON.stringify(info, null, 2));
      console.log();
      
      process.exit(0);
    },
    
    help: () => {
      console.log(`
📚 Storybook Integration CLI

Usage: node scripts/storybook-integration.js [command]

Commands:
  init       Initialize Storybook integration
  start      Start Storybook with the app
  stop       Stop Storybook
  status     Check Storybook status
  test       Run Storybook tests
  build      Build static Storybook site
  info       Display Storybook information
  help       Show this help message

Examples:
  # Start with the app
  node scripts/storybook-integration.js start
  
  # Run tests
  node scripts/storybook-integration.js test
  
  # Build for deployment
  node scripts/storybook-integration.js build
  
  # Check status
  node scripts/storybook-integration.js status

Environment Variables:
  STORYBOOK_PORT     Port for Storybook (default: 6006)
  STORYBOOK_ENABLED  Enable/disable Storybook (default: true)
  STORYBOOK_AUTO     Auto-start with app (default: true)
      `);
      process.exit(0);
    }
  };

  const handler = commands[command] || commands.help;
  handler().catch((error) => {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  });
}
