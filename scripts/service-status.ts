#!/usr/bin/env node

/**
 * Service Status Script
 *
 * Displays the current status of all registered services
 * Can be used to check health and connectivity
 */

import {
  getServiceManager,
} from '../src/services/ServiceManager.js';
import {
  registerAllServices,
  allServiceConfigs,
} from '../src/services/ServiceRegistry.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('\n🔍 LightDom Service Status\n');
  console.log('='.repeat(60));

  const manager = getServiceManager();

  // Register services (without initializing)
  registerAllServices();

  // Show registered services
  console.log('\n📋 Registered Services:\n');

  for (const config of allServiceConfigs) {
    const deps =
      config.dependencies && config.dependencies.length > 0
        ? ` → depends on: [${config.dependencies.join(', ')}]`
        : '';
    const tags =
      config.tags && config.tags.length > 0
        ? ` (${config.tags.join(', ')})`
        : '';
    const required = config.required !== false ? '🔒' : '⚡';

    console.log(`${required} ${config.name}${tags}${deps}`);
    if (config.description) {
      console.log(`   ${config.description}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Legend: 🔒 Required | ⚡ Optional');
  console.log('\n💡 Run `npm run services:init` to initialize all services\n');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
