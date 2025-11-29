#!/usr/bin/env node

/**
 * RAG Chat Test Script
 * 
 * Tests the RAG system by making a simple chat request and displaying the response.
 * This script validates that:
 * 1. Ollama is running and accessible
 * 2. The RAG service is properly configured
 * 3. The enhanced RAG endpoints work
 * 4. Chat responses are being generated
 * 
 * Usage:
 *   node scripts/test-rag-chat.js [message]
 * 
 * Example:
 *   node scripts/test-rag-chat.js "hi"
 *   node scripts/test-rag-chat.js "What is the RAG system?"
 */

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60) + '\n');
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

/**
 * Check if Ollama is running
 */
async function checkOllama() {
  logHeader('Step 1: Checking Ollama Connection');
  
  try {
    const response = await fetch(`${OLLAMA_ENDPOINT}/api/tags`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (!response.ok) {
      logError(`Ollama responded with status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    logSuccess(`Ollama is running at ${OLLAMA_ENDPOINT}`);
    
    if (data.models && data.models.length > 0) {
      logSuccess(`Found ${data.models.length} model(s)`);
      data.models.forEach(model => {
        log(`  • ${model.name}`, 'green');
      });
      
      const hasDeepSeek = data.models.some(m => m.name.includes('deepseek'));
      if (hasDeepSeek) {
        logSuccess('DeepSeek model is available');
      } else {
        logWarning('DeepSeek model not found. Consider running: ollama pull deepseek-r1:latest');
      }
    } else {
      logWarning('No models found. Run: ollama pull deepseek-r1:latest');
    }
    
    return true;
  } catch (error) {
    logError(`Cannot connect to Ollama: ${error.message}`);
    logInfo('Make sure Ollama is running: ollama serve');
    return false;
  }
}

/**
 * Check if API server is running
 */
async function checkAPI() {
  logHeader('Step 2: Checking API Server');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (!response.ok) {
      logError(`API server responded with status ${response.status}`);
      return false;
    }
    
    logSuccess(`API server is running at ${API_BASE}`);
    return true;
  } catch (error) {
    logError(`Cannot connect to API server: ${error.message}`);
    logInfo('Make sure API server is running: npm run start:dev');
    return false;
  }
}

/**
 * Check RAG health
 */
async function checkRAGHealth() {
  logHeader('Step 3: Checking RAG System Health');
  
  try {
    const response = await fetch(`${API_BASE}/api/enhanced-rag/health`, {
      method: 'GET',
      timeout: 10000
    });
    
    if (!response.ok) {
      logError(`RAG health check failed with status ${response.status}`);
      return false;
    }
    
    const health = await response.json();
    logSuccess('RAG system health check passed');
    
    // Display health details
    log('\nRAG System Status:', 'cyan');
    log(`  Overall Status: ${health.status}`, health.status === 'ok' ? 'green' : 'yellow');
    
    if (health.vectorStore) {
      log(`  Vector Store: ${health.vectorStore.status}`, health.vectorStore.status === 'ok' ? 'green' : 'red');
    }
    
    if (health.embeddings) {
      log(`  Embeddings: ${health.embeddings.status}`, health.embeddings.status === 'ok' ? 'green' : 'red');
      log(`    Provider: ${health.embeddings.provider || 'unknown'}`, 'blue');
    }
    
    if (health.llm) {
      log(`  LLM: ${health.llm.status}`, health.llm.status === 'ok' ? 'green' : 'red');
      log(`    Provider: ${health.llm.provider || 'unknown'}`, 'blue');
      log(`    Is Ollama: ${health.llm.isOllama ? 'Yes' : 'No'}`, 'blue');
    }
    
    if (health.tools) {
      log(`  Tools: ${health.tools.status}`, health.tools.status === 'ok' ? 'green' : 'red');
      log(`    Available: ${health.tools.available || 0}`, 'blue');
    }
    
    return health.status === 'ok' || health.status === 'warn';
  } catch (error) {
    logError(`RAG health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test chat with a simple message
 */
async function testChat(message = 'hi') {
  logHeader('Step 4: Testing Chat');
  
  logInfo(`Sending message: "${message}"`);
  console.log('');
  
  try {
    const response = await fetch(`${API_BASE}/api/enhanced-rag/chat/tools/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: message }
        ],
        mode: 'assistant',
        enableTools: false  // Disable tools for simple test
      }),
      timeout: 30000
    });
    
    if (!response.ok) {
      logError(`Chat request failed with status ${response.status}`);
      const text = await response.text();
      log(`Response: ${text}`, 'red');
      return false;
    }
    
    logSuccess('Chat request successful. Streaming response:');
    console.log('');
    log('━'.repeat(60), 'cyan');
    log('DeepSeek Response:', 'bright');
    log('━'.repeat(60), 'cyan');
    console.log('');
    
    // Process streaming response
    const reader = response.body;
    let buffer = '';
    let hasResponse = false;
    
    for await (const chunk of reader) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }
          
          try {
            const event = JSON.parse(data);
            
            if (event.type === 'chunk' && event.content) {
              process.stdout.write(event.content);
              hasResponse = true;
            }
          } catch (error) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    console.log('\n');
    log('━'.repeat(60), 'cyan');
    console.log('');
    
    if (hasResponse) {
      logSuccess('✨ Chat test completed successfully!');
      return true;
    } else {
      logWarning('No response received from the model');
      return false;
    }
    
  } catch (error) {
    logError(`Chat test failed: ${error.message}`);
    return false;
  }
}

/**
 * Display test summary
 */
function displaySummary(results) {
  logHeader('Test Summary');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED`);
    }
  });
  
  console.log('');
  if (passed === total) {
    logSuccess(`🎉 All tests passed! (${passed}/${total})`);
    return 0;
  } else {
    logWarning(`⚠️  Some tests failed (${passed}/${total} passed)`);
    return 1;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                            ║', 'cyan');
  log('║              RAG System Chat Test                         ║', 'cyan');
  log('║                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');
  
  const message = process.argv[2] || 'hi';
  
  const results = [];
  
  // Run tests
  const ollamaOk = await checkOllama();
  results.push({ name: 'Ollama Connection', passed: ollamaOk });
  
  if (!ollamaOk) {
    logError('\n❌ Ollama is not running. Cannot proceed with tests.');
    logInfo('Start Ollama with: ollama serve');
    process.exit(1);
  }
  
  const apiOk = await checkAPI();
  results.push({ name: 'API Server', passed: apiOk });
  
  if (!apiOk) {
    logError('\n❌ API server is not running. Cannot proceed with tests.');
    logInfo('Start API server with: npm run start:dev');
    process.exit(1);
  }
  
  const ragOk = await checkRAGHealth();
  results.push({ name: 'RAG Health', passed: ragOk });
  
  if (!ragOk) {
    logWarning('\n⚠️  RAG system health check failed, but attempting chat test anyway...');
  }
  
  const chatOk = await testChat(message);
  results.push({ name: 'Chat Test', passed: chatOk });
  
  // Display summary
  const exitCode = displaySummary(results);
  
  if (exitCode === 0) {
    console.log('\n');
    log('📸 To take a screenshot:', 'cyan');
    log('   1. Run this script in your terminal', 'blue');
    log('   2. Take a screenshot of the output', 'blue');
    log('   3. The response shown above is from the RAG system', 'blue');
    console.log('');
  }
  
  process.exit(exitCode);
}

// Run tests
runTests().catch(error => {
  logError(`\nTest runner failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
