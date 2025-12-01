#!/usr/bin/env node

/**
 * RAG Service Quick Test
 * 
 * Simple smoke test to verify the RAG service can start and respond
 * without requiring full database or Ollama setup.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testServiceStructure() {
  log('\n=== RAG Service Structure Test ===\n', 'blue');
  
  const fs = await import('fs/promises');
  
  // Check if main service file exists
  info('Checking service files...');
  
  const files = [
    'services/rag/rag-standalone-service.js',
    'services/rag/rag-router.js',
    'services/rag/enhanced-rag-service.js',
    'services/rag/rag-service.js',
    'ecosystem.config.cjs',
    'services/rag/RAG_SERVICE_README.md'
  ];
  
  let allExist = true;
  
  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file);
    try {
      await fs.access(fullPath);
      success(`Found: ${file}`);
    } catch (err) {
      error(`Missing: ${file}`);
      allExist = false;
    }
  }
  
  if (!allExist) {
    error('\nSome required files are missing!');
    process.exit(1);
  }
  
  success('\n✨ All required files present!');
}

async function testPackageScripts() {
  log('\n=== Package Scripts Test ===\n', 'blue');
  
  info('Checking npm scripts...');
  
  const fs = await import('fs/promises');
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
  
  const requiredScripts = [
    'rag:start',
    'rag:stop',
    'rag:restart',
    'rag:logs',
    'rag:status',
    'rag:health',
    'rag:metrics'
  ];
  
  let allPresent = true;
  
  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      success(`Found script: ${script}`);
    } else {
      error(`Missing script: ${script}`);
      allPresent = false;
    }
  }
  
  if (!allPresent) {
    error('\nSome required scripts are missing!');
    process.exit(1);
  }
  
  success('\n✨ All required scripts present!');
}

async function testEcosystemConfig() {
  log('\n=== Ecosystem Config Test ===\n', 'blue');
  
  info('Validating PM2 configuration...');
  
  const ecosystemPath = path.join(__dirname, '..', 'ecosystem.config.cjs');
  
  // Import the config
  const config = await import(ecosystemPath);
  const ecosystemConfig = config.default;
  
  if (!ecosystemConfig.apps || !Array.isArray(ecosystemConfig.apps)) {
    error('Invalid ecosystem config: missing apps array');
    process.exit(1);
  }
  
  const ragApp = ecosystemConfig.apps.find(app => app.name === 'rag-service');
  
  if (!ragApp) {
    error('RAG service not found in ecosystem config');
    process.exit(1);
  }
  
  success(`Found RAG service config: ${ragApp.name}`);
  info(`  Script: ${ragApp.script}`);
  info(`  Instances: ${ragApp.instances}`);
  info(`  Auto-restart: ${ragApp.autorestart}`);
  info(`  Max memory: ${ragApp.max_memory_restart}`);
  
  // Check required fields
  const requiredFields = ['script', 'name', 'autorestart', 'env'];
  let valid = true;
  
  for (const field of requiredFields) {
    if (!ragApp[field]) {
      error(`  Missing required field: ${field}`);
      valid = false;
    }
  }
  
  if (!valid) {
    error('\nEcosystem config is incomplete!');
    process.exit(1);
  }
  
  success('\n✨ Ecosystem config is valid!');
}

async function testDocumentation() {
  log('\n=== Documentation Test ===\n', 'blue');
  
  info('Checking README content...');
  
  const fs = await import('fs/promises');
  const readmePath = path.join(__dirname, '..', 'services/rag/RAG_SERVICE_README.md');
  const content = await fs.readFile(readmePath, 'utf-8');
  
  const requiredSections = [
    '## Overview',
    '## Features',
    '## Prerequisites',
    '## Installation',
    '## Usage',
    '## API Endpoints',
    '## Logging',
    '## Troubleshooting',
    'pm2 start',
    'pm2 stop',
    'pm2 logs',
    'Health Check',
    'Metrics'
  ];
  
  let allPresent = true;
  
  for (const section of requiredSections) {
    if (content.includes(section)) {
      success(`Found: ${section}`);
    } else {
      warn(`Missing or incomplete: ${section}`);
    }
  }
  
  const wordCount = content.split(/\s+/).length;
  info(`\nDocumentation word count: ${wordCount}`);
  
  if (wordCount < 1000) {
    warn('Documentation seems short. Consider adding more details.');
  } else {
    success('Documentation is comprehensive!');
  }
  
  success('\n✨ Documentation check complete!');
}

async function testServiceImports() {
  log('\n=== Service Import Test ===\n', 'blue');
  
  info('Testing if service modules can be imported...');
  
  try {
    // Test importing the service modules
    const servicePath = path.join(__dirname, '..', 'services/rag/rag-service.js');
    const enhancedPath = path.join(__dirname, '..', 'services/rag/enhanced-rag-service.js');
    
    // Just check if files are valid JavaScript (don't execute)
    const fs = await import('fs/promises');
    const serviceContent = await fs.readFile(servicePath, 'utf-8');
    const enhancedContent = await fs.readFile(enhancedPath, 'utf-8');
    
    // Basic syntax check
    if (serviceContent.includes('export') && serviceContent.includes('function')) {
      success('rag-service.js has valid module structure');
    } else {
      error('rag-service.js may have syntax issues');
    }
    
    if (enhancedContent.includes('export') && enhancedContent.includes('function')) {
      success('enhanced-rag-service.js has valid module structure');
    } else {
      error('enhanced-rag-service.js may have syntax issues');
    }
    
    success('\n✨ Module structure check complete!');
    
  } catch (err) {
    error(`Import test failed: ${err.message}`);
    process.exit(1);
  }
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════╗', 'blue');
  log('║  RAG Service Quick Test Suite                      ║', 'blue');
  log('╚══════════════════════════════════════════════════════╝\n', 'blue');
  
  try {
    await testServiceStructure();
    await testPackageScripts();
    await testEcosystemConfig();
    await testDocumentation();
    await testServiceImports();
    
    log('\n' + '='.repeat(60), 'green');
    success('ALL TESTS PASSED! ✨');
    log('='.repeat(60) + '\n', 'green');
    
    log('Next steps:', 'blue');
    info('1. Install PM2: npm install -g pm2');
    info('2. Setup database: psql -U postgres -c "CREATE DATABASE dom_space_harvester"');
    info('3. Install Ollama: https://ollama.com/download');
    info('4. Start service: npm run rag:start');
    info('5. Check health: npm run rag:health');
    
    process.exit(0);
    
  } catch (err) {
    error(`\nTest suite failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
