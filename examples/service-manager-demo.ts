#!/usr/bin/env node

/**
 * Service Manager Demo
 *
 * Demonstrates how the ServiceManager pattern works:
 * - Registering services with dependencies
 * - Initializing in correct order
 * - Health checks
 * - Graceful shutdown
 *
 * Run with: npx tsx examples/service-manager-demo.ts
 */

import {
  getServiceManager,
  ServiceConfig,
  HealthCheckResult,
} from '../src/services/ServiceManager.js';

// Define some example services
const exampleServices: ServiceConfig[] = [
  {
    name: 'config',
    description: 'Configuration service',
    dependencies: [],
    tags: ['core'],
    required: true,
    factory: () => {
      console.log('   📋 Creating config service...');
      return {
        appName: 'LightDom',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    },
    healthCheck: async () => ({ healthy: true, message: 'Config loaded' }),
  },
  {
    name: 'logger',
    description: 'Logging service',
    dependencies: ['config'],
    tags: ['core'],
    required: true,
    factory: () => {
      console.log('   📝 Creating logger service...');
      return {
        log: (msg: string) => console.log(`[LOG] ${msg}`),
        error: (msg: string) => console.error(`[ERROR] ${msg}`),
        info: (msg: string) => console.info(`[INFO] ${msg}`),
      };
    },
    healthCheck: async () => ({ healthy: true }),
  },
  {
    name: 'cache',
    description: 'In-memory cache service',
    dependencies: ['logger'],
    tags: ['utility'],
    required: false,
    factory: () => {
      console.log('   💾 Creating cache service...');
      const store = new Map();
      return {
        get: (key: string) => store.get(key),
        set: (key: string, value: any) => store.set(key, value),
        clear: () => store.clear(),
        size: () => store.size,
      };
    },
    healthCheck: async (cache: any): Promise<HealthCheckResult> => ({
      healthy: true,
      message: `Cache has ${cache.size()} entries`,
      details: { entries: cache.size() },
    }),
    shutdown: async (cache: any) => {
      console.log('   🧹 Clearing cache...');
      cache.clear();
    },
  },
  {
    name: 'api',
    description: 'API service',
    dependencies: ['config', 'logger', 'cache'],
    tags: ['api'],
    required: false,
    factory: () => {
      console.log('   🌐 Creating API service...');
      return {
        endpoints: ['/health', '/status', '/metrics'],
        isRunning: true,
      };
    },
    healthCheck: async (api: any) => ({
      healthy: api.isRunning,
      message: `${api.endpoints.length} endpoints registered`,
      details: { endpoints: api.endpoints },
    }),
    shutdown: async (api: any) => {
      console.log('   🔌 Stopping API...');
      api.isRunning = false;
    },
  },
];

async function main() {
  console.log('\n🚀 ServiceManager Demo\n');
  console.log('='.repeat(60));

  const manager = getServiceManager();

  // Setup shutdown handler
  const shutdown = async () => {
    console.log('\n⚠️  Shutdown requested...');
    await manager.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    // Step 1: Register services
    console.log('\n📦 Step 1: Registering Services\n');
    manager.registerAll(exampleServices);

    // Step 2: Initialize services
    console.log('\n📦 Step 2: Initializing Services\n');
    await manager.initialize();

    // Step 3: Access services
    console.log('\n📦 Step 3: Using Services\n');

    const config = manager.getService('config');
    const logger = manager.getService<{ log: (msg: string) => void }>('logger');
    const cache = manager.getService<{
      get: (key: string) => any;
      set: (key: string, value: any) => void;
    }>('cache');

    if (config && logger && cache) {
      logger.log(`App: ${config.appName} v${config.version}`);
      cache.set('demo', { timestamp: new Date().toISOString() });
      logger.log(`Cached demo data: ${JSON.stringify(cache.get('demo'))}`);
    }

    // Step 4: Health check
    console.log('\n📦 Step 4: Health Check\n');
    const health = await manager.getSystemHealth();
    console.log(`System Status: ${health.status.toUpperCase()}`);
    for (const [name, serviceHealth] of Object.entries(health.services)) {
      const icon = serviceHealth.healthy ? '✅' : '❌';
      console.log(
        `   ${icon} ${name}: ${serviceHealth.message || serviceHealth.status}`
      );
    }

    // Step 5: Print status
    manager.printStatus();

    // Demonstrate graceful shutdown
    console.log('\n⏳ Waiting 3 seconds before shutdown demo...\n');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 6: Shutdown
    console.log('📦 Step 5: Graceful Shutdown\n');
    await manager.shutdown();

    console.log('\n✅ Demo complete!\n');
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    await manager.shutdown();
    process.exit(1);
  }
}

main().catch(console.error);
