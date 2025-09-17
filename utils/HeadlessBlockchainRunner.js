/**
 * Headless Chrome Blockchain Runner
 * Runs LightDom blockchain in headless Chrome for mining and monitoring
 */

import puppeteer from 'puppeteer';
import { EventEmitter } from 'events';

class HeadlessBlockchainRunner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor'
      ],
      ...options
    };
    
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.miningSessions = new Map();
    this.metrics = {
      totalBlocksMined: 0,
      totalOptimizations: 0,
      totalSpaceSaved: 0,
      activeMiners: 0,
      averageBlockTime: 0,
      networkHashRate: 0
    };
    
    this.blockchainUrl = process.env.BLOCKCHAIN_URL || 'http://localhost:3001/blockchain';
  }

  async start() {
    try {
      console.log('Starting headless Chrome blockchain runner...');
      
      this.browser = await puppeteer.launch(this.options);
      this.page = await this.browser.newPage();
      
      // Set up page event listeners
      this.setupPageListeners();
      
      // Navigate to blockchain interface
      await this.page.goto(this.blockchainUrl, { waitUntil: 'networkidle2' });
      
      // Inject blockchain mining script
      await this.injectBlockchainScript();
      
      this.isRunning = true;
      this.emit('started');
      
      console.log('Headless blockchain runner started successfully');
    } catch (error) {
      console.error('Failed to start headless blockchain runner:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
      
      this.isRunning = false;
      this.miningSessions.clear();
      this.emit('stopped');
      
      console.log('Headless blockchain runner stopped');
    } catch (error) {
      console.error('Failed to stop headless blockchain runner:', error);
    }
  }

  setupPageListeners() {
    // Listen for console messages from the blockchain
    this.page.on('console', (msg) => {
      if (msg.type() === 'log') {
        try {
          const data = JSON.parse(msg.text());
          this.handleBlockchainEvent(data);
        } catch (error) {
          // Not JSON, handle as regular log
          console.log('Blockchain console:', msg.text());
        }
      }
    });

    // Listen for page errors
    this.page.on('pageerror', (error) => {
      console.error('Blockchain page error:', error);
      this.emit('error', error);
    });

    // Listen for request failures
    this.page.on('requestfailed', (request) => {
      console.error('Blockchain request failed:', request.url());
    });
  }

  async injectBlockchainScript() {
    // Inject the blockchain mining and monitoring script
    await this.page.evaluateOnNewDocument(() => {
      // LightDom Blockchain Mining Script
      class LightDomBlockchainMiner {
        constructor() {
          this.isMining = false;
          this.userAddress = null;
          this.miningStats = {
            blocksMined: 0,
            optimizationsSubmitted: 0,
            totalSpaceSaved: 0,
            startTime: Date.now()
          };
          
          this.init();
        }

        async init() {
          // Get user address from URL params or localStorage
          const urlParams = new URLSearchParams(window.location.search);
          this.userAddress = urlParams.get('user') || localStorage.getItem('lightdom_user_address');
          
          if (this.userAddress) {
            this.startMining();
          }
        }

        startMining() {
          if (this.isMining) return;
          
          this.isMining = true;
          console.log('LightDom blockchain mining started for user:', this.userAddress);
          
          // Start mining loop
          this.miningLoop();
          
          // Start DOM monitoring
          this.startDOMMonitoring();
        }

        stopMining() {
          this.isMining = false;
          console.log('LightDom blockchain mining stopped');
        }

        async miningLoop() {
          while (this.isMining) {
            try {
              // Simulate blockchain mining work
              await this.performMiningWork();
              
              // Wait before next mining cycle
              await this.sleep(5000 + Math.random() * 5000); // 5-10 seconds
            } catch (error) {
              console.error('Mining error:', error);
              await this.sleep(10000); // Wait longer on error
            }
          }
        }

        async performMiningWork() {
          // Simulate Proof of Optimization work
          const optimization = await this.findOptimizationOpportunity();
          
          if (optimization && optimization.spaceSaved > 0) {
            await this.submitOptimization(optimization);
            this.miningStats.optimizationsSubmitted++;
            this.miningStats.totalSpaceSaved += optimization.spaceSaved;
            
            // Emit mining event
            this.emitMiningEvent('optimization_submitted', {
              userAddress: this.userAddress,
              spaceSaved: optimization.spaceSaved,
              url: window.location.href,
              timestamp: Date.now()
            });
          }
          
          // Simulate block mining
          if (Math.random() < 0.1) { // 10% chance per cycle
            await this.mineBlock();
          }
        }

        async findOptimizationOpportunity() {
          // Analyze current page for optimization opportunities
          const analysis = {
            url: window.location.href,
            timestamp: Date.now(),
            spaceSaved: 0,
            optimizations: []
          };
          
          // Find unused elements
          const unusedElements = document.querySelectorAll('*[style*="display: none"], *[style*="visibility: hidden"]');
          analysis.spaceSaved += unusedElements.length * 50; // Estimate
          
          // Find duplicate styles
          const styles = document.querySelectorAll('style');
          let duplicateStyles = 0;
          const styleMap = new Map();
          
          styles.forEach(style => {
            const content = style.textContent;
            if (styleMap.has(content)) {
              duplicateStyles++;
            } else {
              styleMap.set(content, true);
            }
          });
          
          analysis.spaceSaved += duplicateStyles * 100;
          
          // Find large images
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.width * rect.height > 100000) {
              analysis.spaceSaved += 1000; // Large image optimization
            }
          });
          
          return analysis.spaceSaved > 0 ? analysis : null;
        }

        async submitOptimization(optimization) {
          try {
            const response = await fetch('/api/blockchain/submit-optimization', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-LightDom-User': this.userAddress
              },
              body: JSON.stringify(optimization)
            });
            
            const result = await response.json();
            return result;
          } catch (error) {
            console.error('Failed to submit optimization:', error);
            return null;
          }
        }

        async mineBlock() {
          this.miningStats.blocksMined++;
          
          // Emit block mined event
          this.emitMiningEvent('block_mined', {
            userAddress: this.userAddress,
            blockNumber: this.miningStats.blocksMined,
            timestamp: Date.now()
          });
          
          console.log('Block mined!', {
            user: this.userAddress,
            block: this.miningStats.blocksMined
          });
        }

        startDOMMonitoring() {
          // Monitor DOM changes for optimization opportunities
          const observer = new MutationObserver((mutations) => {
            if (this.isMining) {
              this.handleDOMChanges(mutations);
            }
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
          });
        }

        handleDOMChanges(mutations) {
          // Analyze mutations for optimization opportunities
          const significantChanges = mutations.filter(mutation => {
            return mutation.type === 'childList' && mutation.addedNodes.length > 0;
          });
          
          if (significantChanges.length > 0) {
            setTimeout(() => {
              this.findOptimizationOpportunity().then(optimization => {
                if (optimization && optimization.spaceSaved > 0) {
                  this.submitOptimization(optimization);
                }
              });
            }, 1000);
          }
        }

        emitMiningEvent(type, data) {
          // Emit event to parent page
          window.postMessage({
            type: 'lightdom_blockchain_event',
            eventType: type,
            data: data
          }, '*');
          
          // Also log to console for headless runner to catch
          console.log(JSON.stringify({
            type: 'blockchain_event',
            eventType: type,
            data: data,
            timestamp: Date.now()
          }));
        }

        sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
      }
      
      // Initialize the blockchain miner
      window.lightdomBlockchainMiner = new LightDomBlockchainMiner();
    });
  }

  handleBlockchainEvent(data) {
    switch (data.eventType) {
      case 'optimization_submitted':
        this.metrics.totalOptimizations++;
        this.metrics.totalSpaceSaved += data.data.spaceSaved || 0;
        this.emit('optimization', data.data);
        break;
        
      case 'block_mined':
        this.metrics.totalBlocksMined++;
        this.emit('blockMined', data.data);
        break;
        
      case 'mining_started':
        this.metrics.activeMiners++;
        this.emit('miningStarted', data.data);
        break;
        
      case 'mining_stopped':
        this.metrics.activeMiners = Math.max(0, this.metrics.activeMiners - 1);
        this.emit('miningStopped', data.data);
        break;
    }
  }

  async startMiningSession(userAddress, extensionId) {
    const sessionId = `${userAddress}_${Date.now()}`;
    
    try {
      // Navigate to blockchain with user context
      await this.page.goto(`${this.blockchainUrl}?user=${userAddress}&extension=${extensionId}`, {
        waitUntil: 'networkidle2'
      });
      
      // Start mining for this user
      await this.page.evaluate((userAddr) => {
        if (window.lightdomBlockchainMiner) {
          window.lightdomBlockchainMiner.userAddress = userAddr;
          window.lightdomBlockchainMiner.startMining();
        }
      }, userAddress);
      
      this.miningSessions.set(sessionId, {
        userAddress,
        extensionId,
        startTime: Date.now(),
        stats: {
          blocksMined: 0,
          optimizations: 0,
          spaceSaved: 0
        }
      });
      
      this.emit('sessionStarted', { sessionId, userAddress });
      return sessionId;
    } catch (error) {
      console.error('Failed to start mining session:', error);
      throw error;
    }
  }

  async stopMiningSession(sessionId) {
    const session = this.miningSessions.get(sessionId);
    if (!session) return;
    
    try {
      await this.page.evaluate(() => {
        if (window.lightdomBlockchainMiner) {
          window.lightdomBlockchainMiner.stopMining();
        }
      });
      
      this.miningSessions.delete(sessionId);
      this.emit('sessionStopped', { sessionId, userAddress: session.userAddress });
    } catch (error) {
      console.error('Failed to stop mining session:', error);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeSessions: this.miningSessions.size,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  getSessionStats(sessionId) {
    return this.miningSessions.get(sessionId);
  }

  getAllSessions() {
    return Array.from(this.miningSessions.values());
  }
}

export default HeadlessBlockchainRunner;
