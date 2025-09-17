/**
 * LightDom Blockchain Extension Background Script
 * Handles blockchain mining, notifications, and monitoring
 */

class LightDomBlockchainService {
  constructor() {
    this.isMining = false;
    this.blockchainUrl = 'http://localhost:3001/blockchain';
    this.userAddress = null;
    this.metrics = {
      blocksMined: 0,
      domOptimizations: 0,
      spaceHarvested: 0,
      notificationsSent: 0,
      peersConnected: 0
    };
    this.notificationQueue = [];
    this.monitoringInterval = null;
    
    this.init();
  }

  async init() {
    // Load user data from storage
    const result = await chrome.storage.local.get(['userAddress', 'isMining']);
    this.userAddress = result.userAddress;
    this.isMining = result.isMining || false;

    // Initialize enhanced storage manager
    await this.initializeStorageManager();
    
    // Initialize declarative net request manager
    await this.initializeDeclarativeNetRequest();
    
    // Setup side panel
    await this.setupSidePanel();
    
    // Setup offscreen document for heavy DOM analysis
    await this.setupOffscreenDocument();
    
    // Start blockchain monitoring
    this.startMonitoring();
    
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for tab updates to inject blockchain miner
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.injectBlockchainMiner(tabId, tab.url);
      }
    });
    
    // Setup keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });
    
    // Setup context menu
    this.setupContextMenu();
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'START_MINING':
        await this.startMining();
        sendResponse({ success: true, message: 'Mining started' });
        break;
      
      case 'STOP_MINING':
        await this.stopMining();
        sendResponse({ success: true, message: 'Mining stopped' });
        break;
      
      case 'GET_METRICS':
        sendResponse({ success: true, metrics: this.metrics });
        break;
      
      case 'DOM_OPTIMIZATION_FOUND':
        await this.handleDOMOptimization(message.data, sender.tab);
        sendResponse({ success: true });
        break;
      
      case 'BLOCKCHAIN_EVENT':
        await this.handleBlockchainEvent(message.data);
        sendResponse({ success: true });
        break;
      
      case 'REQUEST_NOTIFICATION':
        await this.sendNotification(message.data);
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async startMining() {
    if (this.isMining) return;
    
    this.isMining = true;
    await chrome.storage.local.set({ isMining: true });
    
    // Start headless Chrome blockchain process
    await this.startHeadlessBlockchain();
    
    // Notify all tabs about mining start
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'MINING_STARTED',
          data: { userAddress: this.userAddress }
        }).catch(() => {}); // Ignore errors for tabs that don't have content script
      });
    });
  }

  async stopMining() {
    this.isMining = false;
    await chrome.storage.local.set({ isMining: false });
    
    // Stop headless blockchain process
    await this.stopHeadlessBlockchain();
    
    // Notify all tabs about mining stop
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'MINING_STOPPED'
        }).catch(() => {});
      });
    });
  }

  async startHeadlessBlockchain() {
    // Create headless Chrome instance for blockchain mining
    try {
      const response = await fetch(`${this.blockchainUrl}/start-mining`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: this.userAddress,
          extensionId: chrome.runtime.id
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('Headless blockchain started:', result);
      }
    } catch (error) {
      console.error('Failed to start headless blockchain:', error);
    }
  }

  async stopHeadlessBlockchain() {
    try {
      await fetch(`${this.blockchainUrl}/stop-mining`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: this.userAddress })
      });
    } catch (error) {
      console.error('Failed to stop headless blockchain:', error);
    }
  }

  async injectBlockchainMiner(tabId, url) {
    if (!this.isMining || !this.isValidUrl(url)) return;
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['blockchain-miner.js']
      });
    } catch (error) {
      console.error('Failed to inject blockchain miner:', error);
    }
  }

  isValidUrl(url) {
    // Only inject on web pages, not chrome:// or extension pages
    return url.startsWith('http://') || url.startsWith('https://');
  }

  async handleDOMOptimization(data, tab) {
    this.metrics.domOptimizations++;
    this.metrics.spaceHarvested += data.spaceSaved || 0;
    
    // Send optimization to blockchain
    await this.submitOptimizationToBlockchain(data, tab);
    
    // Send notification to LightDom users
    await this.notifyLightDomUsers({
      type: 'DOM_OPTIMIZATION',
      data: {
        url: tab.url,
        spaceSaved: data.spaceSaved,
        userAddress: this.userAddress,
        timestamp: Date.now()
      }
    });
  }

  async submitOptimizationToBlockchain(data, tab) {
    try {
      const response = await fetch(`${this.blockchainUrl}/submit-optimization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: tab.url,
          userAddress: this.userAddress,
          domAnalysis: data.domAnalysis,
          spaceSaved: data.spaceSaved,
          timestamp: Date.now()
        })
      });
      
      const result = await response.json();
      if (result.success) {
        this.metrics.blocksMined++;
        console.log('Optimization submitted to blockchain:', result);
      }
    } catch (error) {
      console.error('Failed to submit optimization to blockchain:', error);
    }
  }

  async handleBlockchainEvent(data) {
    this.metrics.peersConnected = data.peersConnected || 0;
    
    // Process blockchain events
    switch (data.eventType) {
      case 'BLOCK_MINED':
        this.metrics.blocksMined++;
        await this.notifyLightDomUsers({
          type: 'BLOCK_MINED',
          data: {
            blockNumber: data.blockNumber,
            userAddress: this.userAddress,
            timestamp: Date.now()
          }
        });
        break;
      
      case 'PEER_CONNECTED':
        this.metrics.peersConnected++;
        break;
      
      case 'PEER_DISCONNECTED':
        this.metrics.peersConnected = Math.max(0, this.metrics.peersConnected - 1);
        break;
    }
  }

  async notifyLightDomUsers(notification) {
    // Only send notifications to LightDom blockchain users
    if (!this.isLightDomUser()) return;
    
    this.notificationQueue.push(notification);
    this.metrics.notificationsSent++;
    
    // Send browser notification
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'LightDom Blockchain',
      message: this.formatNotificationMessage(notification)
    });
    
    // Broadcast to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'LIGHTDOM_NOTIFICATION',
          data: notification
        }).catch(() => {});
      });
    });
  }

  isLightDomUser() {
    // Check if user is registered in LightDom blockchain
    return this.userAddress && this.userAddress.startsWith('0x');
  }

  formatNotificationMessage(notification) {
    switch (notification.type) {
      case 'DOM_OPTIMIZATION':
        return `DOM optimized! ${notification.data.spaceSaved} bytes saved on ${new URL(notification.data.url).hostname}`;
      case 'BLOCK_MINED':
        return `Block #${notification.data.blockNumber} mined successfully!`;
      default:
        return 'LightDom blockchain update';
    }
  }

  async sendNotification(data) {
    await this.notifyLightDomUsers(data);
  }

  startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      await this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }

  async updateMetrics() {
    try {
      const response = await fetch(`${this.blockchainUrl}/metrics`);
      const blockchainMetrics = await response.json();
      
      this.metrics = {
        ...this.metrics,
        ...blockchainMetrics
      };
      
      // Save metrics to storage
      await chrome.storage.local.set({ metrics: this.metrics });
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }
}

  // Enhanced initialization methods
  async initializeStorageManager() {
    try {
      // Import and initialize the storage manager
      await chrome.scripting.executeScript({
        target: { tabId: null },
        files: ['storage-manager.js']
      });
      console.log('Storage manager initialized');
    } catch (error) {
      console.error('Failed to initialize storage manager:', error);
    }
  }

  async initializeDeclarativeNetRequest() {
    try {
      // Import and initialize the declarative net request manager
      await chrome.scripting.executeScript({
        target: { tabId: null },
        files: ['declarative-net-request-manager.js']
      });
      console.log('Declarative net request manager initialized');
    } catch (error) {
      console.error('Failed to initialize declarative net request manager:', error);
    }
  }

  async setupSidePanel() {
    try {
      // Configure side panel behavior
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      
      // Set side panel options
      await chrome.sidePanel.setOptions({
        path: 'sidepanel.html',
        enabled: true
      });
      
      console.log('Side panel configured');
    } catch (error) {
      console.error('Failed to setup side panel:', error);
    }
  }

  async setupOffscreenDocument() {
    try {
      // Check if offscreen document already exists
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL('offscreen.html')]
      });
      
      if (existingContexts.length === 0) {
        // Create offscreen document for DOM analysis
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['DOM_ANALYSIS'],
          justification: 'LightDom DOM optimization analysis'
        });
        console.log('Offscreen document created for DOM analysis');
      }
    } catch (error) {
      console.error('Failed to setup offscreen document:', error);
    }
  }

  handleCommand(command) {
    switch (command) {
      case 'toggle-mining':
        this.toggleMining();
        break;
      case 'open-sidepanel':
        this.openSidePanel();
        break;
    }
  }

  async toggleMining() {
    if (this.isMining) {
      await this.stopMining();
    } else {
      await this.startMining();
    }
  }

  async openSidePanel() {
    try {
      await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  }

  setupContextMenu() {
    chrome.contextMenus.create({
      id: 'lightdom-optimize-page',
      title: 'Optimize with LightDom',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });

    chrome.contextMenus.create({
      id: 'lightdom-analyze-dom',
      title: 'Analyze DOM Performance',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });

    chrome.contextMenus.create({
      id: 'lightdom-mining-status',
      title: this.isMining ? 'Stop Mining' : 'Start Mining',
      contexts: ['page'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  async handleContextMenuClick(info, tab) {
    switch (info.menuItemId) {
      case 'lightdom-optimize-page':
        await this.optimizePage(tab.id);
        break;
      case 'lightdom-analyze-dom':
        await this.analyzeDOM(tab.id);
        break;
      case 'lightdom-mining-status':
        await this.toggleMining();
        break;
    }
  }

  async optimizePage(tabId) {
    try {
      // Send optimization request to content script
      await chrome.tabs.sendMessage(tabId, {
        type: 'OPTIMIZE_PAGE'
      });
    } catch (error) {
      console.error('Failed to optimize page:', error);
    }
  }

  async analyzeDOM(tabId) {
    try {
      // Send DOM analysis request to content script
      await chrome.tabs.sendMessage(tabId, {
        type: 'ANALYZE_DOM'
      });
    } catch (error) {
      console.error('Failed to analyze DOM:', error);
    }
  }

  async performOffscreenDOMAnalysis(domData) {
    try {
      // Send DOM data to offscreen document for analysis
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_DOM',
        data: domData
      });
      
      return response.result;
    } catch (error) {
      console.error('Failed to perform offscreen DOM analysis:', error);
      return null;
    }
  }

  async updateActionBadge() {
    try {
      await chrome.action.setBadgeText({
        text: this.metrics.blocksMined.toString()
      });
      
      await chrome.action.setBadgeBackgroundColor({
        color: this.isMining ? '#00ff00' : '#ff0000'
      });
    } catch (error) {
      console.error('Failed to update action badge:', error);
    }
  }
}

// Initialize the service
new LightDomBlockchainService();
