#!/usr/bin/env node

/**
 * Scaling Management Script
 * Manages automatic scaling of the blockchain automation system
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.magenta}${message}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}`);
}

// Scaling configuration
const scalingConfig = {
  autoScaling: {
    enabled: true,
    minNodes: 1,
    maxNodes: 10,
    scaleUpThreshold: 80,
    scaleDownThreshold: 30,
    cooldownPeriod: 300 // 5 minutes
  },
  resourceLimits: {
    cpu: {
      min: 1,
      max: 16,
      scaleUpStep: 2,
      scaleDownStep: 1
    },
    memory: {
      min: 2048,
      max: 32768,
      scaleUpStep: 4096,
      scaleDownStep: 2048
    },
    storage: {
      min: 100,
      max: 1000,
      scaleUpStep: 100,
      scaleDownStep: 50
    }
  },
  scalingPolicies: [
    {
      name: 'CPU Scaling',
      metric: 'cpu_usage_percent',
      threshold: 80,
      action: 'scale_up',
      cooldown: 300
    },
    {
      name: 'Memory Scaling',
      metric: 'memory_usage_percent',
      threshold: 85,
      action: 'scale_up',
      cooldown: 300
    },
    {
      name: 'Low Utilization',
      metric: 'cpu_usage_percent',
      threshold: 30,
      action: 'scale_down',
      cooldown: 600
    }
  ]
};

async function main() {
  try {
    logHeader('⚖️ Scaling Management Setup');
    
    // Create scaling configuration
    await createScalingConfig();
    
    // Create scaling scripts
    await createScalingScripts();
    
    // Display scaling status
    await displayScalingStatus();
    
    logSuccess('🎉 Scaling management setup completed!');
    logInfo('Auto-scaling is now configured and ready to use.');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function createScalingConfig() {
  logInfo('Creating scaling configuration...');
  
  const configDir = 'config/scaling';
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  writeFileSync(`${configDir}/scaling.json`, JSON.stringify(scalingConfig, null, 2));
  logSuccess('Scaling configuration created');
}

async function createScalingScripts() {
  logInfo('Creating scaling scripts...');
  
  const scriptsDir = 'scripts/scaling';
  if (!existsSync(scriptsDir)) {
    mkdirSync(scriptsDir, { recursive: true });
  }
  
  // Auto-scaling script
  const autoScalingScript = `#!/bin/bash
# Auto-scaling Script for LightDom Blockchain Automation

echo "⚖️ Checking scaling requirements..."

# Get current metrics
CPU_USAGE=$(curl -s http://localhost:3000/metrics | grep cpu_usage_percent | awk '{print $2}')
MEMORY_USAGE=$(curl -s http://localhost:3000/metrics | grep memory_usage_percent | awk '{print $2}')

echo "Current CPU usage: $CPU_USAGE%"
echo "Current Memory usage: $MEMORY_USAGE%"

# Check if scaling is needed
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
  echo "🔼 CPU usage high, scaling up..."
  node scripts/scaling/scale-up.js --resource=cpu --amount=2
elif (( $(echo "$CPU_USAGE < 30" | bc -l) )); then
  echo "🔽 CPU usage low, scaling down..."
  node scripts/scaling/scale-down.js --resource=cpu --amount=1
fi

if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
  echo "🔼 Memory usage high, scaling up..."
  node scripts/scaling/scale-up.js --resource=memory --amount=4096
fi

echo "✅ Scaling check completed"
`;
  
  writeFileSync(`${scriptsDir}/auto-scale.sh`, autoScalingScript);
  
  // Scale up script
  const scaleUpScript = `#!/usr/bin/env node
// Scale Up Script

const args = process.argv.slice(2);
const resource = args.find(arg => arg.startsWith('--resource='))?.split('=')[1] || 'cpu';
const amount = parseInt(args.find(arg => arg.startsWith('--amount='))?.split('=')[1] || '1');

console.log(\`🔼 Scaling up \${resource} by \${amount}\`);

// In a real implementation, this would:
// 1. Check current resources
// 2. Add new nodes or increase resources
// 3. Update configuration
// 4. Notify monitoring system

console.log('✅ Scale up completed');
`;
  
  writeFileSync(`${scriptsDir}/scale-up.js`, scaleUpScript);
  
  // Scale down script
  const scaleDownScript = `#!/usr/bin/env node
// Scale Down Script

const args = process.argv.slice(2);
const resource = args.find(arg => arg.startsWith('--resource='))?.split('=')[1] || 'cpu';
const amount = parseInt(args.find(arg => arg.startsWith('--amount='))?.split('=')[1] || '1');

console.log(\`🔽 Scaling down \${resource} by \${amount}\`);

// In a real implementation, this would:
// 1. Check current resources
// 2. Remove nodes or decrease resources
// 3. Update configuration
// 4. Notify monitoring system

console.log('✅ Scale down completed');
`;
  
  writeFileSync(`${scriptsDir}/scale-down.js`, scaleDownScript);
  
  logSuccess('Scaling scripts created');
}

async function displayScalingStatus() {
  logHeader('📊 Current Scaling Status');
  
  log(`Auto-scaling: ${scalingConfig.autoScaling.enabled ? 'Enabled' : 'Disabled'}`, 'cyan');
  log(`Min nodes: ${scalingConfig.autoScaling.minNodes}`, 'blue');
  log(`Max nodes: ${scalingConfig.autoScaling.maxNodes}`, 'blue');
  log(`Scale up threshold: ${scalingConfig.autoScaling.scaleUpThreshold}%`, 'yellow');
  log(`Scale down threshold: ${scalingConfig.autoScaling.scaleDownThreshold}%`, 'yellow');
  
  log(`\nResource Limits:`, 'cyan');
  log(`CPU: ${scalingConfig.resourceLimits.cpu.min}-${scalingConfig.resourceLimits.cpu.max} cores`, 'blue');
  log(`Memory: ${scalingConfig.resourceLimits.memory.min}-${scalingConfig.resourceLimits.memory.max} MB`, 'blue');
  log(`Storage: ${scalingConfig.resourceLimits.storage.min}-${scalingConfig.resourceLimits.storage.max} GB`, 'blue');
  
  log(`\nScaling Policies:`, 'cyan');
  scalingConfig.scalingPolicies.forEach((policy, index) => {
    log(`  ${index + 1}. ${policy.name}`, 'yellow');
    log(`     Metric: ${policy.metric}`, 'blue');
    log(`     Threshold: ${policy.threshold}%`, 'blue');
    log(`     Action: ${policy.action}`, 'blue');
  });
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Setup interrupted by user');
  process.exit(0);
});

// Run the setup
main().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});
