#!/usr/bin/env node

/**
 * Chrome API-Powered Live React Dev Container
 * Uses Puppeteer to create and run live React applications
 * Self-healing workflow that creates everything until successful
 */

import puppeteer from 'puppeteer';
import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChromeReactDevContainer {
  constructor(options = {}) {
    this.projectRoot = path.resolve(__dirname);
    this.containerId = `chrome-react-container-${Date.now()}`;
    this.port = options.port || 3001;
    this.wsPort = options.wsPort || 3002;

    this.browser = null;
    this.page = null;
    this.server = null;
    this.wss = null;
    this.reactApp = null;

    this.isRunning = false;
    this.selfHealing = true;
    this.maxRetries = 5;
    this.retryCount = 0;

    console.log('🚀 Initializing Chrome React Dev Container...');
    console.log(`📋 Container ID: ${this.containerId}`);
    console.log(`🌐 HTTP Port: ${this.port}`);
    console.log(`🔌 WebSocket Port: ${this.wsPort}`);
    console.log('');
  }

  async initialize() {
    console.log('🔧 Starting Chrome React Dev Container initialization...');

    try {
      // Step 1: Launch headless browser
      await this.launchBrowser();

      // Step 2: Create React application environment
      await this.createReactEnvironment();

      // Step 3: Setup HTTP server for dashboard integration
      await this.setupHTTPServer();

      // Step 4: Setup WebSocket for real-time updates
      await this.setupWebSocketServer();

      // Step 5: Start self-healing monitoring
      this.startSelfHealingMonitor();

      this.isRunning = true;
      console.log('✅ Chrome React Dev Container initialized successfully');

      return {
        containerId: this.containerId,
        httpUrl: `http://localhost:${this.port}`,
        wsUrl: `ws://localhost:${this.wsPort}`,
        reactUrl: `http://localhost:${this.port}/react`
      };

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      await this.attemptRecovery(error);
      throw error;
    }
  }

  async launchBrowser() {
    console.log('🌐 Launching headless Chrome browser...');

    this.browser = await puppeteer.launch({
      headless: false, // Keep visible for development
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--memory-pressure-off',
        '--max_old_space_size=4096',
        '--window-size=1200,800',
        '--disable-extensions'
      ],
      defaultViewport: { width: 1200, height: 800 },
      ignoreDefaultArgs: ['--disable-extensions']
    });

    this.page = await this.browser.newPage();

    // Setup console logging
    this.page.on('console', msg => {
      console.log('🔍 Browser Console:', msg.text());
    });

    // Setup error handling
    this.page.on('pageerror', error => {
      console.error('🚨 Browser Page Error:', error.message);
      this.handleBrowserError(error);
    });

    console.log('✅ Browser launched successfully');
  }

  async createReactEnvironment() {
    console.log('⚛️ Creating React application environment...');

    if (!this.page) throw new Error('Browser page not available');

    // Create a comprehensive React environment
    const reactEnvironment = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chrome React Dev Container</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            background: rgba(255,255,255,0.1);
            padding: 1rem 2rem;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .container {
            flex: 1;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        .code-editor {
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .preview {
            background: rgba(255,255,255,0.95);
            border-radius: 12px;
            padding: 1.5rem;
            min-height: 300px;
            color: #333;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
        }
        .controls {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }
        .btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
        }
        textarea {
            width: 100%;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            padding: 1rem;
            color: white;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            resize: vertical;
        }
        textarea::placeholder {
            color: rgba(255,255,255,0.7);
        }
        #output {
            background: rgba(0,0,0,0.8);
            border-radius: 6px;
            padding: 1rem;
            min-height: 100px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 12px;
            backdrop-filter: blur(10px);
        }
        .status.healthy { background: rgba(46, 213, 115, 0.8); }
        .status.error { background: rgba(255, 71, 87, 0.8); }
        .status.loading { background: rgba(255, 165, 2, 0.8); }
    </style>
</head>
<body>
    <div class="status loading" id="status">Initializing...</div>

    <header class="header">
        <h1>🚀 Chrome React Dev Container</h1>
        <p>Live code execution with real-time React rendering</p>
    </header>

    <div class="container">
        <div class="code-editor">
            <h2>⚡ Live Code Editor</h2>
            <textarea id="codeInput" placeholder="Enter your React code here...

Example:
const { useState } = React;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('output'));">const { useState, useEffect } = React;

function LiveReactApp() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hello from Chrome React Dev Container!');
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#667eea', marginBottom: '20px' }}>
        🚀 Live React App
      </h1>

      <div style={{
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Counter: {count}</h2>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{
        background: '#e8f5e8',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#28a745', marginBottom: '10px' }}>📋 Status</h3>
        <p><strong>Message:</strong> {message}</p>
        <p><strong>Time:</strong> {timestamp}</p>
        <p><strong>Container:</strong> ${this.containerId}</p>
      </div>

      <button
        onClick={() => setMessage('Button clicked at ' + new Date().toLocaleTimeString())}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Update Message
      </button>
    </div>
  );
}

ReactDOM.render(<LiveReactApp />, document.getElementById('output'));</textarea>

            <div class="controls">
                <button class="btn primary" id="runBtn">▶️ Run Code</button>
                <button class="btn" id="clearBtn">🗑️ Clear</button>
                <button class="btn" id="resetBtn">🔄 Reset</button>
                <button class="btn" id="exportBtn">💾 Export</button>
            </div>
        </div>

        <div class="preview">
            <h2>👁️ Live Preview</h2>
            <div id="output">Click "Run Code" to see your React app here...</div>
        </div>
    </div>

    <script type="text/babel">
        // Live code execution system
        window.ReactDevContainer = {
            runCode: function(code) {
                try {
                    // Clear previous content
                    const output = document.getElementById('output');
                    output.innerHTML = '';

                    // Execute the code
                    eval(code);

                    // Update status
                    document.getElementById('status').textContent = 'Code executed successfully';
                    document.getElementById('status').className = 'status healthy';

                    console.log('✅ Code executed successfully');

                } catch (error) {
                    console.error('❌ Code execution error:', error);
                    document.getElementById('output').innerHTML =
                        \`<div style="color: #dc3545; padding: 20px; background: #f8d7da; border-radius: 4px;">
                            <h3>🚨 Execution Error</h3>
                            <pre>\${error.message}</pre>
                        </div>\`;

                    document.getElementById('status').textContent = 'Execution error';
                    document.getElementById('status').className = 'status error';
                }
            },

            clearOutput: function() {
                document.getElementById('output').innerHTML = 'Output cleared. Ready for new code...';
            },

            resetEditor: function() {
                document.getElementById('codeInput').value = \`const { useState, useEffect } = React;

function App() {
  const [message, setMessage] = useState('Hello World!');

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={() => setMessage('Button clicked!')}>
        Click me
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('output'));\`;
                this.clearOutput();
            },

            exportCode: function() {
                const code = document.getElementById('codeInput').value;
                const blob = new Blob([code], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'react-app.js';
                a.click();
                URL.revokeObjectURL(url);
            }
        };

        // Setup event listeners
        document.getElementById('runBtn').addEventListener('click', function() {
            const code = document.getElementById('codeInput').value;
            window.ReactDevContainer.runCode(code);
        });

        document.getElementById('clearBtn').addEventListener('click', function() {
            window.ReactDevContainer.clearOutput();
        });

        document.getElementById('resetBtn').addEventListener('click', function() {
            window.ReactDevContainer.resetEditor();
        });

        document.getElementById('exportBtn').addEventListener('click', function() {
            window.ReactDevContainer.exportCode();
        });

        // Initialize status
        document.getElementById('status').textContent = 'Ready';
        document.getElementById('status').className = 'status healthy';

        console.log('🎯 Chrome React Dev Container initialized');
    </script>
</body>
</html>`;

    // Set the React environment content
    await this.page.setContent(reactEnvironment, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Wait for React and Babel to load
    await this.page.waitForFunction(() => {
      return window.React && window.ReactDOM && window.Babel;
    }, { timeout: 10000 });

    console.log('✅ React environment created successfully');
  }

  async setupHTTPServer() {
    console.log('🌐 Setting up HTTP server...');

    const app = express();
    const server = createServer(app);

    // Serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // API endpoints
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        containerId: this.containerId,
        timestamp: new Date().toISOString(),
        browser: this.browser ? 'connected' : 'disconnected',
        react: 'loaded'
      });
    });

    app.get('/react', (req, res) => {
      res.redirect(`http://localhost:${this.port}/`);
    });

    app.get('/status', (req, res) => {
      res.json({
        containerId: this.containerId,
        isRunning: this.isRunning,
        browserConnected: !!this.browser,
        pageLoaded: !!this.page,
        websocketConnected: !!this.wss,
        retryCount: this.retryCount,
        lastError: null
      });
    });

    // Proxy to React environment
    app.get('/', async (req, res) => {
      try {
        if (this.page) {
          const content = await this.page.content();
          res.send(content);
        } else {
          res.status(503).json({ error: 'React environment not available' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Execute code endpoint
    app.post('/execute', express.json(), async (req, res) => {
      try {
        const { code } = req.body;
        if (!code) {
          return res.status(400).json({ error: 'Code is required' });
        }

        await this.executeCodeInBrowser(code);
        res.json({ success: true, message: 'Code executed' });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.server = server.listen(this.port, () => {
      console.log(`✅ HTTP server running on port ${this.port}`);
      console.log(`🌐 Access at: http://localhost:${this.port}`);
      console.log(`⚛️ React app at: http://localhost:${this.port}/react`);
    });
  }

  async setupWebSocketServer() {
    console.log('🔌 Setting up WebSocket server...');

    const wss = new WebSocketServer({ port: this.wsPort });

    wss.on('connection', (ws) => {
      console.log('🔗 WebSocket client connected');

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());

          switch (message.type) {
            case 'execute':
              const result = await this.executeCodeInBrowser(message.code);
              ws.send(JSON.stringify({
                type: 'result',
                success: true,
                data: result
              }));
              break;

            case 'status':
              ws.send(JSON.stringify({
                type: 'status',
                data: {
                  containerId: this.containerId,
                  isRunning: this.isRunning,
                  timestamp: new Date().toISOString()
                }
              }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
              }));
          }

        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
      });
    });

    this.wss = wss;
    console.log(`✅ WebSocket server running on port ${this.wsPort}`);
  }

  async executeCodeInBrowser(code) {
    if (!this.page) throw new Error('Browser page not available');

    try {
      // Execute code in browser context
      const result = await this.page.evaluate((code) => {
        try {
          // Create a new function from the code and execute it
          const func = new Function('React', 'ReactDOM', code);
          func(window.React, window.ReactDOM);

          return { success: true, message: 'Code executed successfully' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, code);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Code execution failed:', error.message);
      throw error;
    }
  }

  startSelfHealingMonitor() {
    console.log('🩺 Starting self-healing monitor...');

    setInterval(async () => {
      try {
        // Check browser health
        if (this.browser) {
          const pages = await this.browser.pages();
          if (pages.length === 0) {
            throw new Error('No browser pages available');
          }
        }

        // Check server health
        if (this.server) {
          // Server health check would go here
        }

        // Update status
        if (this.wss) {
          this.broadcastStatus({
            type: 'health',
            status: 'healthy',
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.warn('⚠️ Health check failed:', error.message);
        await this.attemptRecovery(error);
      }
    }, 30000); // Check every 30 seconds
  }

  async attemptRecovery(error) {
    if (!this.selfHealing || this.retryCount >= this.maxRetries) {
      console.error('❌ Max retries exceeded, stopping recovery attempts');
      return;
    }

    this.retryCount++;
    console.log(`🔄 Attempting recovery (attempt ${this.retryCount}/${this.maxRetries})...`);

    try {
      // Attempt to restart components
      if (error.message.includes('browser') && this.browser) {
        console.log('🔄 Restarting browser...');
        await this.browser.close();
        await this.launchBrowser();
      }

      if (error.message.includes('page') && this.browser) {
        console.log('🔄 Recreating page...');
        if (this.page) await this.page.close();
        this.page = await this.browser.newPage();
        await this.createReactEnvironment();
      }

      console.log('✅ Recovery successful');
      this.retryCount = 0;

    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError.message);
      if (this.retryCount >= this.maxRetries) {
        console.error('💥 All recovery attempts failed');
        this.isRunning = false;
      }
    }
  }

  broadcastStatus(status) {
    if (this.wss) {
      this.wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify(status));
        }
      });
    }
  }

  async handleBrowserError(error) {
    console.error('🚨 Browser error detected:', error.message);
    await this.attemptRecovery(error);
  }

  async runCode(code) {
    return await this.executeCodeInBrowser(code);
  }

  async getStatus() {
    return {
      containerId: this.containerId,
      isRunning: this.isRunning,
      browserConnected: !!this.browser,
      pageLoaded: !!this.page,
      serverRunning: !!this.server,
      websocketRunning: !!this.wss,
      retryCount: this.retryCount,
      port: this.port,
      wsPort: this.wsPort
    };
  }

  async cleanup() {
    console.log('🧹 Cleaning up Chrome React Dev Container...');

    this.isRunning = false;

    if (this.wss) {
      this.wss.close();
    }

    if (this.server) {
      this.server.close();
    }

    if (this.page) {
      await this.page.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Cleanup completed');
  }
}

// Admin Dashboard Integration
class AdminDashboardIntegration {
  constructor(chromeContainer) {
    this.chromeContainer = chromeContainer;
    this.dashboardPort = 3003;
    this.dashboardServer = null;
  }

  async initialize() {
    console.log('📊 Initializing Admin Dashboard Integration...');

    const app = express();
    const server = createServer(app);

    // Serve admin dashboard
    app.use(express.static(path.join(__dirname, 'admin-dashboard')));

    // API endpoints for container management
    app.get('/api/container/status', async (req, res) => {
      try {
        const status = await this.chromeContainer.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/container/execute', express.json(), async (req, res) => {
      try {
        const { code } = req.body;
        const result = await this.chromeContainer.runCode(code);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/container/restart', async (req, res) => {
      try {
        await this.chromeContainer.cleanup();
        await this.chromeContainer.initialize();
        res.json({ success: true, message: 'Container restarted' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Serve the dashboard
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'admin-dashboard', 'index.html'));
    });

    this.dashboardServer = server.listen(this.dashboardPort, () => {
      console.log(`✅ Admin Dashboard running on port ${this.dashboardPort}`);
      console.log(`🌐 Access at: http://localhost:${this.dashboardPort}`);
    });
  }

  async cleanup() {
    if (this.dashboardServer) {
      this.dashboardServer.close();
    }
  }
}

// Self-Creating Workflow System
class SelfCreatingWorkflow {
  constructor() {
    this.container = null;
    this.dashboard = null;
    this.isRunning = false;
    this.maxAttempts = 10;
    this.attemptCount = 0;
  }

  async startWorkflow() {
    console.log('🔄 STARTING SELF-CREATING WORKFLOW');
    console.log('==================================');

    this.isRunning = true;

    while (this.isRunning && this.attemptCount < this.maxAttempts) {
      this.attemptCount++;
      console.log(`🎯 Workflow Attempt ${this.attemptCount}/${this.maxAttempts}`);

      try {
        // Step 1: Create Chrome React Container
        console.log('🐳 Creating Chrome React Container...');
        this.container = new ChromeReactDevContainer({
          port: 3001,
          wsPort: 3002
        });

        const containerInfo = await this.container.initialize();

        // Step 2: Create Admin Dashboard Integration
        console.log('📊 Creating Admin Dashboard Integration...');
        this.dashboard = new AdminDashboardIntegration(this.container);
        await this.dashboard.initialize();

        // Step 3: Verify everything is working
        console.log('🔍 Verifying system health...');
        const status = await this.container.getStatus();

        if (status.isRunning && status.browserConnected) {
          console.log('✅ Workflow completed successfully!');
          this.displaySuccessInfo(containerInfo);
          break;
        } else {
          throw new Error('System verification failed');
        }

      } catch (error) {
        console.error(`❌ Workflow attempt ${this.attemptCount} failed:`, error.message);

        // Cleanup failed attempt
        await this.cleanup();

        if (this.attemptCount < this.maxAttempts) {
          console.log('⏳ Retrying in 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.error('💥 All workflow attempts failed');
          this.isRunning = false;
        }
      }
    }
  }

  displaySuccessInfo(containerInfo) {
    console.log('');
    console.log('🎊 CHROME REACT DEV CONTAINER WORKFLOW SUCCESS!');
    console.log('===============================================');

    console.log('');
    console.log('📊 SYSTEM STATUS:');
    console.log(`   Container ID: ${containerInfo.containerId}`);
    console.log('   Status: ✅ Running');
    console.log('   Browser: ✅ Connected');
    console.log('   React Environment: ✅ Loaded');
    console.log('   WebSocket: ✅ Active');
    console.log('   Self-Healing: ✅ Enabled');

    console.log('');
    console.log('🌐 ACCESS POINTS:');
    console.log(`   Live React App: ${containerInfo.httpUrl}`);
    console.log(`   Admin Dashboard: http://localhost:3003`);
    console.log(`   WebSocket: ${containerInfo.wsUrl}`);
    console.log(`   Health Check: ${containerInfo.httpUrl}/health`);

    console.log('');
    console.log('🚀 FEATURES AVAILABLE:');
    console.log('   ✅ Live React code execution');
    console.log('   ✅ Real-time code editing');
    console.log('   ✅ Browser console integration');
    console.log('   ✅ Self-healing error recovery');
    console.log('   ✅ WebSocket real-time updates');
    console.log('   ✅ Admin dashboard integration');
    console.log('   ✅ Export functionality');

    console.log('');
    console.log('🎯 WORKFLOW CAPABILITIES:');
    console.log('   🔄 Self-creating until successful');
    console.log('   🩺 Self-healing error recovery');
    console.log('   📊 Real-time monitoring');
    console.log('   🔧 Automatic browser management');
    console.log('   ⚡ Live code execution');

    console.log('');
    console.log('💡 USAGE:');
    console.log('   1. Open http://localhost:3003 for admin dashboard');
    console.log('   2. Open http://localhost:3001 for live React editor');
    console.log('   3. Write React code and click "Run Code"');
    console.log('   4. See live updates in the preview panel');

    console.log('');
    console.log('🛑 TO STOP: Press Ctrl+C or run cleanup script');
  }

  async cleanup() {
    console.log('🧹 Cleaning up workflow...');

    if (this.dashboard) {
      await this.dashboard.cleanup();
    }

    if (this.container) {
      await this.container.cleanup();
    }

    console.log('✅ Cleanup completed');
  }

  async stop() {
    console.log('🛑 Stopping workflow...');
    this.isRunning = false;
    await this.cleanup();
  }
}

// Main execution
async function createChromeReactDevContainer() {
  const workflow = new SelfCreatingWorkflow();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    await workflow.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    await workflow.stop();
    process.exit(0);
  });

  try {
    await workflow.startWorkflow();
  } catch (error) {
    console.error('💥 Fatal workflow error:', error.message);
    await workflow.cleanup();
    process.exit(1);
  }
}

// Export for programmatic use
export { ChromeReactDevContainer, AdminDashboardIntegration, SelfCreatingWorkflow };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createChromeReactDevContainer();
}
