#!/usr/bin/env node

/**
 * Simplified LightDom Setup Script
 * Sets up the core system without complex dependencies
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

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

function logStep(step, message) {
  log(`\n${colors.cyan}🚀 Step ${step}: ${message}${colors.reset}`);
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

async function createDirectories() {
  const directories = [
    'logs',
    'data',
    'config',
    'artifacts'
  ];

  directories.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      logSuccess(`Created directory: ${dir}`);
    } else {
      logInfo(`Directory already exists: ${dir}`);
    }
  });
}

async function createMinimalAPI() {
  const apiContent = `// Minimal API Server for LightDom
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'running',
      database: 'pending',
      blockchain: 'pending'
    }
  });
});

// Basic blockchain endpoint
app.get('/api/blockchain/status', (req, res) => {
  res.json({
    network: 'local',
    status: 'running',
    blockHeight: 1,
    miners: 0,
    hashRate: '0 H/s'
  });
});

// DOM optimization endpoint
app.post('/api/optimization/submit', (req, res) => {
  const { url, spaceSaved, optimizations } = req.body;
  
  logInfo(\`Optimization submitted for \${url}: \${spaceSaved} bytes saved\`);
  
  res.json({
    success: true,
    transactionId: \`tx_\${Date.now()}\`,
    reward: spaceSaved * 0.001, // DSH tokens
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    totalOptimizations: 0,
    spaceSaved: 0,
    activeMiners: 0,
    blocksMined: 0,
    dshTokens: 0
  });
});

function logInfo(message) {
  console.log(\`ℹ️  \${message}\`);
}

app.listen(port, () => {
  console.log(\`🚀 LightDom API Server running at http://localhost:\${port}\`);
  console.log(\`📊 Health check: http://localhost:\${port}/api/health\`);
  console.log(\`⛓️  Blockchain status: http://localhost:\${port}/api/blockchain/status\`);
});

export default app;
`;

  writeFileSync('simple-api-server.js', apiContent);
  logSuccess('Created minimal API server: simple-api-server.js');
}

async function createSimpleExtension() {
  const manifestContent = {
    "manifest_version": 3,
    "name": "LightDom DOM Space Miner",
    "version": "1.0.0",
    "description": "Mine DOM space optimizations and earn DSH tokens",
    "permissions": [
      "activeTab",
      "storage",
      "notifications"
    ],
    "host_permissions": [
      "http://localhost:3001/*",
      "<all_urls>"
    ],
    "background": {
      "service_worker": "background.js",
      "type": "module"
    },
    "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": ["content.js"],
        "run_at": "document_idle"
      }
    ],
    "action": {
      "default_popup": "popup.html",
      "default_title": "LightDom Miner"
    },
    "icons": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  };

  if (!existsSync('extension')) {
    mkdirSync('extension');
  }

  writeFileSync('extension/manifest.json', JSON.stringify(manifestContent, null, 2));

  // Create basic background script
  const backgroundScript = `// LightDom Extension Background Script
console.log('LightDom Extension loaded');

let isMining = false;
let userAddress = null;

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('LightDom Extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOM_OPTIMIZATION') {
    handleDOMOptimization(message.data);
  } else if (message.type === 'START_MINING') {
    startMining();
  } else if (message.type === 'STOP_MINING') {
    stopMining();
  }
  
  sendResponse({ success: true });
});

async function handleDOMOptimization(data) {
  try {
    const response = await fetch('http://localhost:3001/api/optimization/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show notification for successful optimization
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'LightDom Mining Success!',
        message: \`Earned \${result.reward} DSH tokens for \${data.spaceSaved} bytes saved\`
      });
    }
  } catch (error) {
    console.error('Failed to submit optimization:', error);
  }
}

function startMining() {
  isMining = true;
  console.log('Mining started');
}

function stopMining() {
  isMining = false;
  console.log('Mining stopped');
}
`;

  writeFileSync('extension/background.js', backgroundScript);

  // Create content script
  const contentScript = `// LightDom Content Script
(function() {
  'use strict';
  
  let hasAnalyzed = false;
  
  function analyzeDOM() {
    if (hasAnalyzed) return;
    hasAnalyzed = true;
    
    console.log('LightDom: Analyzing DOM for optimization opportunities...');
    
    // Basic DOM analysis
    const elements = document.querySelectorAll('*');
    let hiddenElements = 0;
    let emptyElements = 0;
    let unusedClasses = 0;
    let spaceSaved = 0;
    
    elements.forEach(el => {
      // Check for hidden elements
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        hiddenElements++;
        spaceSaved += el.outerHTML?.length || 0;
      }
      
      // Check for empty elements
      if (!el.textContent?.trim() && !el.children.length) {
        emptyElements++;
        spaceSaved += el.outerHTML?.length || 0;
      }
    });
    
    // Estimate space saved (simplified calculation)
    spaceSaved = Math.floor(spaceSaved * 0.1); // Conservative estimate
    
    if (spaceSaved > 0) {
      // Send optimization data to background script
      chrome.runtime.sendMessage({
        type: 'DOM_OPTIMIZATION',
        data: {
          url: window.location.href,
          spaceSaved: spaceSaved,
          optimizations: {
            hiddenElements,
            emptyElements,
            unusedClasses
          },
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(\`LightDom: Found \${spaceSaved} bytes of potential savings\`);
    }
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzeDOM);
  } else {
    setTimeout(analyzeDOM, 1000);
  }
})();
`;

  writeFileSync('extension/content.js', contentScript);

  // Create popup HTML
  const popupHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 300px;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .status {
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      text-align: center;
    }
    .mining { background-color: #e8f5e8; color: #2d5a2d; }
    .stopped { background-color: #f5e8e8; color: #5a2d2d; }
    .button {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .start-btn { background-color: #4CAF50; color: white; }
    .stop-btn { background-color: #f44336; color: white; }
    .stats {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 5px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>🌟 LightDom Miner</h2>
  </div>
  
  <div id="status" class="status stopped">
    ⏹️ Mining Stopped
  </div>
  
  <button id="toggleMining" class="button start-btn">
    Start Mining
  </button>
  
  <div class="stats">
    <div><strong>Total Mined:</strong> <span id="totalMined">0 DSH</span></div>
    <div><strong>Space Saved:</strong> <span id="spaceSaved">0 bytes</span></div>
    <div><strong>Sessions:</strong> <span id="sessions">0</span></div>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
`;

  writeFileSync('extension/popup.html', popupHTML);

  // Create popup script
  const popupScript = `// LightDom Extension Popup Script
let ismining = false;

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleMining');
  const statusDiv = document.getElementById('status');
  
  toggleBtn.addEventListener('click', function() {
    if (ismining) {
      stopMining();
    } else {
      startMining();
    }
  });
  
  // Load initial state
  loadStats();
});

function startMining() {
  ismining = true;
  updateUI();
  
  chrome.runtime.sendMessage({ type: 'START_MINING' });
  
  // Simulate mining activity
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}

function stopMining() {
  isMining = false;
  updateUI();
  
  chrome.runtime.sendMessage({ type: 'STOP_MINING' });
}

function updateUI() {
  const toggleBtn = document.getElementById('toggleMining');
  const statusDiv = document.getElementById('status');
  
  if (isMinning) {
    toggleBtn.textContent = 'Stop Mining';
    toggleBtn.className = 'button stop-btn';
    statusDiv.textContent = '⚡ Mining Active';
    statusDiv.className = 'status mining';
  } else {
    toggleBtn.textContent = 'Start Mining';
    toggleBtn.className = 'button start-btn';
    statusDiv.textContent = '⏹️ Mining Stopped';
    statusDiv.className = 'status stopped';
  }
}

function loadStats() {
  // Load stats from storage
  chrome.storage.local.get(['totalMined', 'spaceSaved', 'sessions'], function(result) {
    document.getElementById('totalMined').textContent = \`\${result.totalMined || 0} DSH\`;
    document.getElementById('spaceSaved').textContent = \`\${result.spaceSaved || 0} bytes\`;
    document.getElementById('sessions').textContent = result.sessions || 0;
  });
}
`;

  writeFileSync('extension/popup.js', popupScript);

  logSuccess('Created Chrome extension in extension/ directory');
  logInfo('To install: Chrome → Extensions → Developer mode → Load unpacked → Select extension folder');
}

async function createSimpleFrontend() {
  const frontendHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LightDom Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
    }
    
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      margin-bottom: 15px;
      color: #333;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .metric:last-child {
      border-bottom: none;
    }
    
    .metric-value {
      font-weight: bold;
      color: #667eea;
    }
    
    .status-indicator {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .status-healthy { background-color: #e8f5e8; color: #2d5a2d; }
    .status-pending { background-color: #fff3cd; color: #856404; }
    
    .button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin: 5px;
    }
    
    .button:hover {
      background: #5a67d8;
    }
    
    #log {
      background: #1a1a1a;
      color: #00ff00;
      padding: 15px;
      border-radius: 5px;
      height: 200px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌟 LightDom Blockchain Dashboard</h1>
      <p>DOM Space Optimization & Mining Platform</p>
    </div>
    
    <div class="dashboard">
      <div class="card">
        <h3>🏥 System Health</h3>
        <div class="metric">
          <span>API Server</span>
          <span class="status-indicator status-healthy" id="api-status">Healthy</span>
        </div>
        <div class="metric">
          <span>Database</span>
          <span class="status-indicator status-pending" id="db-status">Pending</span>
        </div>
        <div class="metric">
          <span>Blockchain</span>
          <span class="status-indicator status-pending" id="blockchain-status">Pending</span>
        </div>
        <div class="metric">
          <span>Uptime</span>
          <span class="metric-value" id="uptime">0 seconds</span>
        </div>
      </div>
      
      <div class="card">
        <h3>⛏️ Mining Statistics</h3>
        <div class="metric">
          <span>Active Miners</span>
          <span class="metric-value" id="active-miners">0</span>
        </div>
        <div class="metric">
          <span>Total Optimizations</span>
          <span class="metric-value" id="total-optimizations">0</span>
        </div>
        <div class="metric">
          <span>Space Saved</span>
          <span class="metric-value" id="space-saved">0 bytes</span>
        </div>
        <div class="metric">
          <span>DSH Tokens Mined</span>
          <span class="metric-value" id="dsh-tokens">0 DSH</span>
        </div>
      </div>
      
      <div class="card">
        <h3>⛓️ Blockchain Status</h3>
        <div class="metric">
          <span>Network</span>
          <span class="metric-value" id="network">Local</span>
        </div>
        <div class="metric">
          <span>Block Height</span>
          <span class="metric-value" id="block-height">1</span>
        </div>
        <div class="metric">
          <span>Hash Rate</span>
          <span class="metric-value" id="hash-rate">0 H/s</span>
        </div>
        <div class="metric">
          <span>Last Block</span>
          <span class="metric-value" id="last-block">Just now</span>
        </div>
      </div>
      
      <div class="card">
        <h3>🎮 Control Panel</h3>
        <button class="button" onclick="startMining()">Start Mining</button>
        <button class="button" onclick="stopMining()">Stop Mining</button>
        <button class="button" onclick="refreshData()">Refresh Data</button>
        <button class="button" onclick="clearLog()">Clear Log</button>
        
        <h4 style="margin-top: 20px;">System Log</h4>
        <div id="log"></div>
      </div>
    </div>
  </div>

  <script>
    let startTime = Date.now();
    
    function log(message) {
      const logElement = document.getElementById('log');
      const timestamp = new Date().toISOString().substr(11, 8);
      logElement.innerHTML += \`[\${timestamp}] \${message}\\n\`;
      logElement.scrollTop = logElement.scrollHeight;
    }
    
    function updateUptime() {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById('uptime').textContent = \`\${uptime} seconds\`;
    }
    
    async function refreshData() {
      try {
        log('Fetching system metrics...');
        
        // Fetch health status
        const healthResponse = await fetch('http://localhost:3001/api/health');
        const health = await healthResponse.json();
        
        // Fetch metrics
        const metricsResponse = await fetch('http://localhost:3001/api/metrics');
        const metrics = await metricsResponse.json();
        
        // Fetch blockchain status
        const blockchainResponse = await fetch('http://localhost:3001/api/blockchain/status');
        const blockchain = await blockchainResponse.json();
        
        // Update UI
        document.getElementById('active-miners').textContent = metrics.activeMiners;
        document.getElementById('total-optimizations').textContent = metrics.totalOptimizations;
        document.getElementById('space-saved').textContent = \`\${metrics.spaceSaved} bytes\`;
        document.getElementById('dsh-tokens').textContent = \`\${metrics.dshTokens} DSH\`;
        
        document.getElementById('network').textContent = blockchain.network;
        document.getElementById('block-height').textContent = blockchain.blockHeight;
        document.getElementById('hash-rate').textContent = blockchain.hashRate;
        
        log('✅ Data refreshed successfully');
      } catch (error) {
        log(\`❌ Failed to fetch data: \${error.message}\`);
      }
    }
    
    function startMining() {
      log('🚀 Starting mining process...');
      // In a real implementation, this would call the API
      log('✅ Mining started successfully');
    }
    
    function stopMining() {
      log('⏹️ Stopping mining process...');
      log('✅ Mining stopped');
    }
    
    function clearLog() {
      document.getElementById('log').innerHTML = '';
    }
    
    // Initialize dashboard
    log('🌟 LightDom Dashboard initialized');
    log('🔗 Connecting to API server...');
    
    // Update uptime every second
    setInterval(updateUptime, 1000);
    
    // Refresh data every 30 seconds
    setInterval(refreshData, 30000);
    
    // Initial data load
    refreshData();
  </script>
</body>
</html>
`;

  writeFileSync('dashboard.html', frontendHTML);
  logSuccess('Created simple dashboard: dashboard.html');
}

async function main() {
  try {
    log(`\n${colors.bright}${colors.magenta}🚀 LightDom Simplified Setup${colors.reset}`);
    log(`${colors.cyan}========================================${colors.reset}`);
    
    logStep(1, 'Creating Required Directories');
    await createDirectories();
    
    logStep(2, 'Creating Minimal API Server');
    await createMinimalAPI();
    
    logStep(3, 'Creating Chrome Extension');
    await createSimpleExtension();
    
    logStep(4, 'Creating Simple Frontend Dashboard');
    await createSimpleFrontend();
    
    logSuccess('🎉 Setup completed successfully!');
    logInfo('To start the system:');
    logInfo('1. Run: node simple-api-server.js');
    logInfo('2. Open dashboard.html in your browser');
    logInfo('3. Install Chrome extension from extension/ folder');
    logInfo('4. Visit any website to start mining!');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
main();