// LightDom Extension Background Script v2.0
console.log('LightDom Extension v2.0 loaded');

class LightDomBackgroundService {
  constructor() {
    this.isMining = false;
    this.userAddress = null;
    this.miningStats = {
      optimizationsSubmitted: 0,
      totalSpaceSaved: 0,
      blocksMined: 0,
      lastOptimization: 0
    };
    this.apiBaseUrl = 'http://localhost:3001';
    this.updateInterval = null;
    
    this.init();
  }

  async init() {
    // Load initial state from storage
    await this.loadState();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup side panel
    this.setupSidePanel();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Start periodic updates
    this.startPeriodicUpdates();
  }

  async loadState() {
    try {
      const result = await chrome.storage.local.get([
        'isMining', 
        'userAddress', 
        'miningStats',
        'recentOptimizations'
      ]);
      
      this.isMining = result.isMining || false;
      this.userAddress = result.userAddress;
      this.miningStats = result.miningStats || this.miningStats;
      
      console.log('LightDom state loaded:', { 
        isMining: this.isMining, 
        hasUserAddress: !!this.userAddress 
      });
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  async saveState() {
    try {
      await chrome.storage.local.set({
        isMining: this.isMining,
        userAddress: this.userAddress,
        miningStats: this.miningStats
      });
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  setupEventListeners() {
    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // Handle extension installation
    chrome.runtime.onInstalled.addListener(() => {
      this.handleInstallation();
    });

    // Handle storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'DOM_OPTIMIZATION':
          await this.handleDOMOptimization(message.data);
          sendResponse({ success: true });
          break;
          
        case 'START_MINING':
          await this.startMining();
          sendResponse({ success: true });
          break;
          
        case 'STOP_MINING':
          await this.stopMining();
          sendResponse({ success: true });
          break;
          
        case 'GET_MINING_STATUS':
          sendResponse({ 
            success: true, 
            data: { 
              isMining: this.isMining, 
              userAddress: this.userAddress,
              stats: this.miningStats 
            } 
          });
          break;
          
        case 'SET_USER_ADDRESS':
          this.userAddress = message.address;
          await this.saveState();
          sendResponse({ success: true });
          break;
          
        case 'ANALYZE_DOM':
          const result = await this.analyzeDOM(message.data);
          sendResponse({ success: true, data: result });
          break;
          
        case 'ITEM_PURCHASED':
          await this.handleItemPurchase(message.data);
          sendResponse({ success: true });
          break;
          
        case 'GET_PURCHASED_ITEMS':
          const items = await this.getPurchasedItems();
          sendResponse({ success: true, data: items });
          break;
          
        case 'ADD_ITEM_TO_CHAT':
          await this.addItemToChatRoom(message.data);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleDOMOptimization(data) {
    if (!this.isMining) return;
    
    try {
      console.log('Submitting DOM optimization:', data);
      
      const response = await fetch(`${this.apiBaseUrl}/api/blockchain/submit-optimization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LightDom-User': this.userAddress || 'anonymous'
        },
        body: JSON.stringify({
          url: data.url,
          userAddress: this.userAddress,
          domAnalysis: data.domMetrics,
          spaceSaved: data.potentialSavings,
          timestamp: Date.now(),
          optimizations: data.optimizations
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update mining stats
        this.miningStats.optimizationsSubmitted++;
        this.miningStats.totalSpaceSaved += data.potentialSavings;
        this.miningStats.lastOptimization = Date.now();
        
        await this.saveState();
        
        // Show notification
        await this.showMiningNotification(data, result);
        
        // Broadcast to side panel
        this.broadcastToSidePanel('OPTIMIZATION_COMPLETE', {
          url: data.url,
          spaceSaved: data.potentialSavings,
          optimizations: data.optimizations?.length || 0,
          timestamp: Date.now()
        });
        
        // Update metrics
        this.broadcastToSidePanel('METRICS_UPDATE', this.miningStats);
      }
    } catch (error) {
      console.error('Failed to submit optimization:', error);
      await this.showErrorNotification('Optimization failed', error.message);
    }
  }

  async startMining() {
    if (this.isMining) return;
    
    this.isMining = true;
    await this.saveState();
    
    console.log('LightDom mining started');
    
    // Broadcast to side panel
    this.broadcastToSidePanel('MINING_STATUS_CHANGE', { isMining: true });
    
    // Show notification
    await this.showNotification(
      'Mining Started',
      'DOM optimization mining is now active'
    );
  }

  async stopMining() {
    if (!this.isMining) return;
    
    this.isMining = false;
    await this.saveState();
    
    console.log('LightDom mining stopped');
    
    // Broadcast to side panel
    this.broadcastToSidePanel('MINING_STATUS_CHANGE', { isMining: false });
    
    // Show notification
    await this.showNotification(
      'Mining Stopped',
      'DOM optimization mining has been stopped'
    );
  }

  async showMiningNotification(optimization, result) {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.svg',
        title: '⚡ LightDom Mining Success!',
        message: `Earned ${Math.floor(optimization.potentialSavings / 100)} DSH tokens for ${optimization.potentialSavings} bytes saved`
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async showErrorNotification(title, message) {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.svg',
        title: `❌ ${title}`,
        message: message
      });
    } catch (error) {
      console.error('Failed to show error notification:', error);
    }
  }

  async showNotification(title, message) {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.svg',
        title: title,
        message: message
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  setupSidePanel() {
    // Configure side panel behavior
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }

  setupKeyboardShortcuts() {
    // Handle keyboard shortcuts
    chrome.commands.onCommand.addListener((command) => {
      switch (command) {
        case 'toggle-mining':
          this.isMining ? this.stopMining() : this.startMining();
          break;
        case 'open-sidepanel':
          this.openSidePanel();
          break;
      }
    });
  }

  async openSidePanel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  }

  broadcastToSidePanel(type, data) {
    // Send message to side panel if it's open
    chrome.runtime.sendMessage({
      type: type,
      data: data
    }).catch(() => {
      // Side panel might not be open, ignore error
    });
  }

  handleInstallation() {
    console.log('LightDom Extension installed');
    
    // Set up default storage
    chrome.storage.local.set({
      isMining: false,
      miningStats: this.miningStats,
      recentOptimizations: []
    });
  }

  handleStorageChange(changes, namespace) {
    if (namespace === 'local') {
      if (changes.isMining) {
        this.isMining = changes.isMining.newValue;
      }
      if (changes.userAddress) {
        this.userAddress = changes.userAddress.newValue;
      }
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Handle tab updates for mining context
    if (changeInfo.status === 'complete' && this.isMining) {
      // Tab finished loading, could trigger DOM analysis
      console.log('Tab updated, mining context:', tab.url);
    }
  }

  startPeriodicUpdates() {
    // Update metrics every 30 seconds
    this.updateInterval = setInterval(() => {
      this.broadcastToSidePanel('METRICS_UPDATE', this.miningStats);
    }, 30000);
  }

  async analyzeDOM(domData) {
    // Heavy DOM analysis using offscreen document
    try {
      // Create offscreen document if needed
      await this.ensureOffscreenDocument();
      
      // Send analysis request to offscreen document
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_DOM_OFFSCREEN',
        data: domData
      });
      
      return response;
    } catch (error) {
      console.error('DOM analysis failed:', error);
      return { error: error.message };
    }
  }

  async ensureOffscreenDocument() {
    try {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['DOM_ANALYSIS'],
        justification: 'Heavy DOM analysis for optimization mining'
      });
    } catch (error) {
      // Document might already exist
      console.log('Offscreen document already exists or creation failed:', error);
    }
  }

  async handleItemPurchase(data) {
    try {
      const { item } = data;
      console.log('Item purchased:', item);
      
      // Store purchased item in local storage
      const result = await chrome.storage.local.get(['purchasedItems']);
      const purchasedItems = result.purchasedItems || [];
      
      const purchase = {
        id: `purchase-${Date.now()}`,
        itemId: item.id,
        item: item,
        purchasedAt: Date.now(),
        status: 'active'
      };
      
      purchasedItems.push(purchase);
      await chrome.storage.local.set({ purchasedItems });
      
      // Show notification
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.svg',
        title: 'Item Purchased!',
        message: `You purchased ${item.name}. Add it to your chat room!`,
        priority: 2
      });
      
      // Broadcast to all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ITEM_PURCHASED',
          data: { item, purchase }
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      });
    } catch (error) {
      console.error('Failed to handle item purchase:', error);
    }
  }

  async getPurchasedItems() {
    try {
      const result = await chrome.storage.local.get(['purchasedItems']);
      return result.purchasedItems || [];
    } catch (error) {
      console.error('Failed to get purchased items:', error);
      return [];
    }
  }

  async addItemToChatRoom(data) {
    try {
      const { itemId, chatRoomId } = data;
      
      // Get purchased items
      const items = await this.getPurchasedItems();
      const item = items.find(i => i.itemId === itemId);
      
      if (!item) {
        throw new Error('Item not found in inventory');
      }
      
      // Store chat room items mapping
      const result = await chrome.storage.local.get(['chatRoomItems']);
      const chatRoomItems = result.chatRoomItems || {};
      
      if (!chatRoomItems[chatRoomId]) {
        chatRoomItems[chatRoomId] = [];
      }
      
      chatRoomItems[chatRoomId].push({
        itemId: item.itemId,
        item: item.item,
        addedAt: Date.now()
      });
      
      await chrome.storage.local.set({ chatRoomItems });
      
      // Notify the chat room tab
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'CHAT_ROOM_ITEM_ADDED',
          data: { chatRoomId, item: item.item }
        }).catch(() => {
          // Ignore errors
        });
      });
      
      console.log('Item added to chat room:', { chatRoomId, item: item.item.name });
    } catch (error) {
      console.error('Failed to add item to chat room:', error);
      throw error;
    }
  }
}

// Initialize the background service
const lightDomService = new LightDomBackgroundService();
