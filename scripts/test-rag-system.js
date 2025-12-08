#!/usr/bin/env node

/**
 * Test RAG System with ORC and DeepSeek Integration
 * Validates that all components are working correctly
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

async function testFileExists(filePath, description) {
  try {
    await fs.access(filePath);
    logSuccess(`${description} exists`);
    results.passed++;
    return true;
  } catch (error) {
    logError(`${description} missing: ${filePath}`);
    results.failed++;
    return false;
  }
}

async function testOllamaConnection() {
  logInfo('Testing Ollama connection...');
  const endpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${endpoint}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      logSuccess(`Ollama connected at ${endpoint}`);
      
      if (data.models && data.models.length > 0) {
        logSuccess(`Found ${data.models.length} models`);
        const hasDeepSeek = data.models.some(m => m.name.includes('deepseek'));
        if (hasDeepSeek) {
          logSuccess('DeepSeek model available');
          results.passed += 2;
        } else {
          logWarning('DeepSeek model not found. Run: ollama pull deepseek-r1:latest');
          results.warnings++;
          results.passed++;
        }
      } else {
        logWarning('No models found. Run: ollama pull deepseek-r1:latest');
        results.warnings++;
        results.passed++;
      }
      return true;
    } else {
      logError(`Ollama responded with status ${response.status}`);
      results.failed++;
      return false;
    }
  } catch (error) {
    logError(`Cannot connect to Ollama at ${endpoint}`);
    logInfo('Make sure Ollama is running: ollama serve');
    results.failed++;
    return false;
  }
}

async function testDependencies() {
  logInfo('Checking dependencies...');
  
  const requiredPackages = [
    '@langchain/core',
    '@langchain/community',
    '@langchain/ollama',
    'langchain'
  ];
  
  try {
    const packageJson = JSON.parse(
      await fs.readFile('./package.json', 'utf-8')
    );
    
    let allFound = true;
    for (const pkg of requiredPackages) {
      if (packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]) {
        logSuccess(`${pkg} listed in package.json`);
        results.passed++;
      } else {
        logError(`${pkg} missing from package.json`);
        results.failed++;
        allFound = false;
      }
    }
    
    if (allFound) {
      logInfo('All required packages are listed. Checking installation...');
      try {
        await fs.access('./node_modules/@langchain/core');
        logSuccess('LangChain packages installed');
        results.passed++;
      } catch {
        logWarning('LangChain packages not installed. Run: npm install');
        results.warnings++;
      }
    }
    
    return allFound;
  } catch (error) {
    logError('Failed to read package.json');
    results.failed++;
    return false;
  }
}

async function testEnhancedRagFiles() {
  logInfo('Checking Enhanced RAG files...');
  
  const files = [
    {
      path: './services/rag/deepseek-tools.js',
      desc: 'DeepSeek computer use tools'
    },
    {
      path: './services/rag/prompt-templates.js',
      desc: 'Prompt engineering templates'
    },
    {
      path: './services/rag/enhanced-rag-service.js',
      desc: 'Enhanced RAG service'
    },
    {
      path: './api/enhanced-rag-routes.js',
      desc: 'Enhanced RAG API routes'
    }
  ];
  
  let allExist = true;
  for (const file of files) {
    const exists = await testFileExists(file.path, file.desc);
    if (!exists) allExist = false;
  }
  
  return allExist;
}

async function testDocumentation() {
  logInfo('Checking documentation...');
  
  const docs = [
    {
      path: './RAG_ORC_DEEPSEEK_COMPLETE_GUIDE.md',
      desc: 'Complete RAG/ORC/DeepSeek guide'
    },
    {
      path: './RAG_QUICKSTART.md',
      desc: 'Quick start guide'
    }
  ];
  
  let allExist = true;
  for (const doc of docs) {
    const exists = await testFileExists(doc.path, doc.desc);
    if (!exists) allExist = false;
  }
  
  return allExist;
}

async function testApiServer() {
  logInfo('Checking API server configuration...');
  
  try {
    const apiServer = await fs.readFile('./api-server-express.js', 'utf-8');
    
    if (apiServer.includes('enhanced-rag-routes')) {
      logSuccess('Enhanced RAG routes integrated in API server');
      results.passed++;
    } else {
      logError('Enhanced RAG routes not integrated in API server');
      results.failed++;
    }
    
    if (apiServer.includes('/api/enhanced-rag')) {
      logSuccess('Enhanced RAG endpoint configured');
      results.passed++;
    } else {
      logError('Enhanced RAG endpoint not configured');
      results.failed++;
    }
    
    return true;
  } catch (error) {
    logError('Failed to read api-server-express.js');
    results.failed++;
    return false;
  }
}

async function testEnvironment() {
  logInfo('Checking environment configuration...');
  
  try {
    const envExample = await fs.readFile('./.env.example', 'utf-8');
    
    const requiredVars = [
      'OLLAMA_ENDPOINT',
      'OLLAMA_MODEL',
      'DEEPSEEK_API_KEY',
      'RAG_EMBED_PROVIDER'
    ];
    
    for (const varName of requiredVars) {
      if (envExample.includes(varName)) {
        logSuccess(`${varName} in .env.example`);
        results.passed++;
      } else {
        logWarning(`${varName} not in .env.example`);
        results.warnings++;
      }
    }
    
    try {
      const env = await fs.readFile('./.env', 'utf-8');
      logSuccess('.env file exists');
      results.passed++;
    } catch {
      logWarning('.env file not found. Copy from .env.example');
      results.warnings++;
    }
    
    return true;
  } catch (error) {
    logError('Failed to check environment files');
    results.failed++;
    return false;
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  log('Test Summary', 'cyan');
  console.log('='.repeat(60));
  
  logSuccess(`Passed: ${results.passed}`);
  if (results.warnings > 0) {
    logWarning(`Warnings: ${results.warnings}`);
  }
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }
  
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    logSuccess('\n🎉 All critical tests passed!');
    if (results.warnings > 0) {
      logWarning('⚠️  Some warnings detected. Review above for details.');
    }
    console.log('\nNext steps:');
    log('1. Make sure Ollama is running: ollama serve', 'cyan');
    log('2. Start the API server: npm run start:dev', 'cyan');
    log('3. Test the chat: curl http://localhost:3001/api/enhanced-rag/health', 'cyan');
    log('4. Read the guide: RAG_QUICKSTART.md', 'cyan');
    return 0;
  } else {
    logError('\n❌ Some tests failed. Please fix the issues above.');
    return 1;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('RAG System Test Suite', 'cyan');
  log('Testing ORC and DeepSeek Integration', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  await testDependencies();
  console.log('');
  
  await testEnhancedRagFiles();
  console.log('');
  
  await testDocumentation();
  console.log('');
  
  await testApiServer();
  console.log('');
  
  await testEnvironment();
  console.log('');
  
  await testOllamaConnection();
  
  const exitCode = await printSummary();
  process.exit(exitCode);
}

// Run tests
runTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
