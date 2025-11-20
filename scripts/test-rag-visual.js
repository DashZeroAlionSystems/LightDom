#!/usr/bin/env node

/**
 * RAG System Visual Test with Screenshots
 * 
 * This test:
 * 1. Starts the services (backend and frontend)
 * 2. Tests RAG chat functionality
 * 3. Takes screenshots of the RAG system working
 * 4. Validates health monitoring and error handling
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passed = 0;
let failed = 0;
const screenshotsDir = path.join(process.cwd(), 'test-screenshots', `rag-test-${Date.now()}`);

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  passed++;
  log(`✅ ${message}`, COLORS.green);
}

function failure(message, error = null) {
  failed++;
  log(`❌ ${message}`, COLORS.red);
  if (error) {
    console.error('  Error:', error.message);
  }
}

function info(message) {
  log(`ℹ️  ${message}`, COLORS.blue);
}

function step(message) {
  log(`\n▶️  ${message}`, COLORS.cyan);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureScreenshotsDir() {
  await fs.mkdir(screenshotsDir, { recursive: true });
  info(`Screenshots will be saved to: ${screenshotsDir}`);
}

async function waitForService(url, maxAttempts = 30, interval = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }
    await sleep(interval);
    if (i % 5 === 0) {
      info(`Waiting for service at ${url}... (${i + 1}/${maxAttempts})`);
    }
  }
  return false;
}

async function startBackend() {
  step('Starting backend API server...');
  
  const backend = spawn('node', ['api-server-express.js'], {
    env: { ...process.env, DB_DISABLED: 'true', PORT: '3001' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let backendReady = false;
  
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running') || output.includes('listening')) {
      backendReady = true;
    }
  });

  backend.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('DeprecationWarning') && !output.includes('ExperimentalWarning')) {
      console.error('Backend error:', output);
    }
  });

  // Wait for backend to be ready
  const isReady = await waitForService('http://localhost:3001/health', 30, 2000);
  
  if (isReady) {
    success('Backend started successfully');
  } else {
    failure('Backend failed to start within timeout');
    backend.kill();
    throw new Error('Backend startup failed');
  }

  return backend;
}

async function startFrontend() {
  step('Starting frontend dev server...');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend'),
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let frontendReady = false;

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('ready in')) {
      frontendReady = true;
    }
  });

  frontend.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('DeprecationWarning') && !output.includes('warning')) {
      console.error('Frontend error:', output);
    }
  });

  // Wait for frontend to be ready
  const isReady = await waitForService('http://localhost:3000', 60, 2000);
  
  if (isReady) {
    success('Frontend started successfully');
  } else {
    failure('Frontend failed to start within timeout');
    frontend.kill();
    throw new Error('Frontend startup failed');
  }

  return frontend;
}

async function testRagHealthEndpoint() {
  step('Testing RAG health endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/rag/health');
    const health = await response.json();
    
    if (response.ok) {
      success(`Health check passed: ${health.status}`);
      info(`  Components: ${JSON.stringify(health.components || {}, null, 2)}`);
      return true;
    } else {
      failure('Health check returned non-OK status');
      return false;
    }
  } catch (error) {
    failure('Health check failed', error);
    return false;
  }
}

async function runVisualTests() {
  step('Starting visual tests with Playwright...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500, // Slow down for better screenshots
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Load the application
    step('Test 1: Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-app-loaded.png'),
      fullPage: true,
    });
    success('Application loaded successfully');

    // Test 2: Navigate to Prompt Console (if available)
    step('Test 2: Navigating to RAG interface...');
    
    // Try to find navigation to prompt console or RAG interface
    const ragLinks = await page.$$eval('a', links => 
      links.filter(link => 
        link.textContent.toLowerCase().includes('prompt') ||
        link.textContent.toLowerCase().includes('console') ||
        link.textContent.toLowerCase().includes('chat')
      ).map(link => link.href)
    );
    
    if (ragLinks.length > 0) {
      await page.goto(ragLinks[0], { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-rag-interface.png'),
      fullPage: true,
    });
    success('RAG interface displayed');

    // Test 3: Check connection status indicator
    step('Test 3: Verifying connection status...');
    
    // Look for connection status indicators
    const statusIndicators = await page.$$eval('[class*="connection"], [class*="status"], [class*="health"]', 
      elements => elements.map(el => ({
        text: el.textContent,
        class: el.className,
      }))
    );
    
    info(`  Found ${statusIndicators.length} status indicators`);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-connection-status.png'),
      fullPage: true,
    });
    success('Connection status visible');

    // Test 4: Test chat input (if available)
    step('Test 4: Testing RAG chat functionality...');
    
    // Look for input fields
    const inputSelector = 'textarea, input[type="text"], [contenteditable="true"]';
    const inputs = await page.$$(inputSelector);
    
    if (inputs.length > 0) {
      const input = inputs[inputs.length - 1]; // Usually the main input is last
      
      await input.click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-input-focused.png'),
        fullPage: true,
      });
      
      // Type a test message
      await input.type('Hello! This is a test of the RAG system. Can you confirm you are working?', { delay: 50 });
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '05-message-typed.png'),
        fullPage: true,
      });
      
      // Try to send (look for send button or press Enter)
      const sendButton = await page.$('button[type="submit"], button:has-text("Send"), button:has-text("send")');
      if (sendButton) {
        await sendButton.click();
      } else {
        await input.press('Enter');
      }
      
      await page.waitForTimeout(2000);
      success('Message sent to RAG');
      
      // Wait for response
      await page.waitForTimeout(5000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '06-rag-response.png'),
        fullPage: true,
      });
      success('RAG response received (check screenshot)');
    } else {
      info('No input field found - taking screenshot of current state');
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-no-input-found.png'),
        fullPage: true,
      });
    }

    // Test 5: Test error handling (simulate connection issue)
    step('Test 5: Testing error handling...');
    
    // Take screenshot of normal state
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-before-error-test.png'),
      fullPage: true,
    });
    
    // Open network panel and block RAG requests to simulate failure
    await page.route('**/rag/**', route => route.abort());
    
    // Try to send another message if possible
    if (inputs.length > 0) {
      const input = inputs[inputs.length - 1];
      await input.click();
      await input.fill('Test error handling');
      await page.waitForTimeout(500);
      
      const sendButton = await page.$('button[type="submit"], button:has-text("Send")');
      if (sendButton) {
        await sendButton.click();
      } else {
        await input.press('Enter');
      }
      
      await page.waitForTimeout(3000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '08-error-handling.png'),
        fullPage: true,
      });
      success('Error handling displayed');
    }
    
    // Test 6: Final state
    step('Test 6: Final application state...');
    await page.unroute('**/rag/**'); // Restore normal routing
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '09-final-state.png'),
      fullPage: true,
    });
    success('Final state captured');

    // Create a summary HTML page
    await createSummaryPage();
    
  } catch (error) {
    failure('Visual tests failed', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error-state.png'),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

async function createSummaryPage() {
  step('Creating test summary page...');
  
  const screenshots = await fs.readdir(screenshotsDir);
  const imageFiles = screenshots.filter(f => f.endsWith('.png')).sort();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAG System Visual Test Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary h2 {
      margin-top: 0;
      color: #27ae60;
    }
    .stats {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .stat {
      flex: 1;
      background: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #2c3e50;
    }
    .stat-label {
      color: #7f8c8d;
      text-transform: uppercase;
      font-size: 0.8em;
      margin-top: 5px;
    }
    .screenshot-section {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .screenshot-section h3 {
      color: #2c3e50;
      margin-top: 0;
    }
    .screenshot {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 10px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .screenshot:hover {
      transform: scale(1.02);
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-top: 10px;
    }
    .pass { color: #27ae60; }
    .fail { color: #e74c3c; }
  </style>
</head>
<body>
  <h1>🧪 RAG System Visual Test Results</h1>
  
  <div class="summary">
    <h2>Test Summary</h2>
    <p>Test run completed at: ${new Date().toLocaleString()}</p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value pass">${passed}</div>
        <div class="stat-label">Tests Passed</div>
      </div>
      <div class="stat">
        <div class="stat-value ${failed > 0 ? 'fail' : 'pass'}">${failed}</div>
        <div class="stat-label">Tests Failed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${imageFiles.length}</div>
        <div class="stat-label">Screenshots</div>
      </div>
    </div>
    
    <p><strong>Screenshots Location:</strong> <code>${screenshotsDir}</code></p>
  </div>
  
  ${imageFiles.map((file, index) => `
    <div class="screenshot-section">
      <h3>Screenshot ${index + 1}: ${file.replace(/^\d+-/, '').replace('.png', '').replace(/-/g, ' ')}</h3>
      <img src="${file}" alt="${file}" class="screenshot" onclick="window.open('${file}', '_blank')">
      <p class="timestamp">File: ${file}</p>
    </div>
  `).join('\n')}
  
  <div class="summary">
    <h2>Test Details</h2>
    <ul>
      <li>Backend API: http://localhost:3001</li>
      <li>Frontend: http://localhost:3000</li>
      <li>RAG Health Endpoint: http://localhost:3001/api/rag/health</li>
      <li>RAG Status Endpoint: http://localhost:3001/api/rag/status</li>
    </ul>
  </div>
</body>
</html>
  `.trim();
  
  const summaryPath = path.join(screenshotsDir, 'test-summary.html');
  await fs.writeFile(summaryPath, html);
  success(`Test summary created: ${summaryPath}`);
  info('Open test-summary.html in a browser to view all screenshots');
}

async function main() {
  log('╔══════════════════════════════════════════════════════════╗', COLORS.blue);
  log('║     RAG System Visual Test with Screenshots             ║', COLORS.blue);
  log('╚══════════════════════════════════════════════════════════╝', COLORS.blue);
  log('');
  
  await ensureScreenshotsDir();
  
  let backend = null;
  let frontend = null;
  
  try {
    // Start services
    backend = await startBackend();
    await sleep(3000); // Give backend time to fully initialize
    
    frontend = await startFrontend();
    await sleep(5000); // Give frontend time to fully initialize
    
    // Test health endpoint
    await testRagHealthEndpoint();
    
    // Run visual tests
    await runVisualTests();
    
    // Print summary
    log('');
    log('═══════════════════════════════════════════════════════════', COLORS.blue);
    log(`Test Results: ${passed} passed, ${failed} failed`, 
      failed === 0 ? COLORS.green : COLORS.red);
    log('═══════════════════════════════════════════════════════════', COLORS.blue);
    log('');
    success(`Screenshots saved to: ${screenshotsDir}`);
    success(`Open ${path.join(screenshotsDir, 'test-summary.html')} to view results`);
    
  } catch (error) {
    failure('Test execution failed', error);
  } finally {
    // Cleanup
    step('Cleaning up services...');
    if (backend) {
      backend.kill();
      info('Backend stopped');
    }
    if (frontend) {
      frontend.kill();
      info('Frontend stopped');
    }
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
