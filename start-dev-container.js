#!/usr/bin/env node

/**
 * Start Script for LightDom Dev Container
 * Launches the development container with live preview and schema-driven component building
 */

const path = require('path');

// Set environment to development
process.env.NODE_ENV = 'development';

async function startDevContainer() {
  console.log('🚀 Starting LightDom Dev Container...\n');

  try {
    // Dynamically import the DevContainerManager (ES module)
    const { default: DevContainerManager } = await import('./src/dev-container/DevContainerManager.js');

    // Create dev container instance
    const devContainer = new DevContainerManager({
      port: process.env.DEV_CONTAINER_PORT || 3100,
      previewPort: process.env.DEV_CONTAINER_PREVIEW_PORT || 3101,
      codeDir: process.env.DEV_CONTAINER_CODE_DIR || path.join(process.cwd(), 'src'),
      buildDir: process.env.DEV_CONTAINER_BUILD_DIR || path.join(process.cwd(), 'dist'),
      enableHotReload: process.env.DEV_CONTAINER_HOT_RELOAD !== 'false',
      enableSchemaValidation: process.env.DEV_CONTAINER_SCHEMA_VALIDATION !== 'false',
      schemaDir: process.env.DEV_CONTAINER_SCHEMA_DIR || path.join(process.cwd(), 'schemas', 'components'),
      layout: process.env.DEV_CONTAINER_LAYOUT || 'horizontal',
    });

    // Setup event handlers
    devContainer.on('started', () => {
      console.log('\n✅ Dev Container Started Successfully!\n');
      console.log('📝 Dev Container UI: http://localhost:' + (process.env.DEV_CONTAINER_PORT || 3100));
      console.log('🔍 Health Check: http://localhost:' + (process.env.DEV_CONTAINER_PORT || 3100) + '/health');
      console.log('\n💡 Features:');
      console.log('   - Split-view interface (code/preview/schema)');
      console.log('   - Hot reload enabled');
      console.log('   - Schema-driven component selection');
      console.log('   - Real-time WebSocket updates');
      console.log('\n📚 Press Ctrl+C to stop\n');
    });

    devContainer.on('fileChanged', ({ filepath }) => {
      console.log('📄 File changed:', filepath);
    });

    devContainer.on('hotReloadComplete', ({ filepath }) => {
      console.log('🔄 Hot reload complete:', filepath);
    });

    devContainer.on('validationError', ({ filepath, errors }) => {
      console.error('❌ Validation errors in', filepath, ':', errors);
    });

    devContainer.on('browserConsole', ({ type, text }) => {
      console.log(`[Browser ${type}]:`, text);
    });

    devContainer.on('browserError', (error) => {
      console.error('❌ Browser error:', error);
    });

    // Initialize and start
    await devContainer.initialize();
    await devContainer.start();

    // Handle shutdown
    let isShuttingDown = false;
    
    const shutdown = async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log('\n🛑 Shutting down Dev Container...');
      
      try {
        await devContainer.stop();
        console.log('✅ Dev Container stopped successfully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);

  } catch (error) {
    console.error('❌ Failed to start Dev Container:', error);
    
    if (error.code === 'ENOENT') {
      console.error('\n💡 Tip: Make sure to run "npm install" first');
    } else if (error.message.includes('puppeteer')) {
      console.error('\n💡 Tip: Install Puppeteer with "npm install puppeteer"');
    } else if (error.message.includes('EADDRINUSE')) {
      console.error('\n💡 Tip: Port is already in use. Try a different port or stop the other process');
    }

    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the dev container
startDevContainer();
