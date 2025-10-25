// LightDom Extension Popup Script v2.0
class LightDomPopup {
  constructor() {
    this.isMining = false;
    this.miningStats = {
      totalMined: 0,
      spaceSaved: 0,
      sessions: 0
    };
    
    this.init();
  }

  async init() {
    console.log('LightDom Popup v2.0 loaded');

    // Load initial state
    await this.loadMiningStatus();
    await this.loadStats();
    await this.loadWalletInfo();

    // Setup event listeners
    this.setupEventListeners();

    // Update UI
    this.updateUI();
  }

  setupEventListeners() {
    const toggleBtn = document.getElementById('toggleMining');
    const openSidePanelBtn = document.getElementById('openSidePanel');
    const openWalletBtn = document.getElementById('openWallet');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleMining());
    }

    if (openSidePanelBtn) {
      openSidePanelBtn.addEventListener('click', () => this.openSidePanel());
    }

    if (openWalletBtn) {
      openWalletBtn.addEventListener('click', () => this.openWallet());
    }

    // Listen for mining status changes
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  async loadMiningStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_MINING_STATUS' });
      if (response.success) {
        this.isMining = response.data.isMining;
        this.miningStats = response.data.stats || this.miningStats;
      }
    } catch (error) {
      console.error('Failed to load mining status:', error);
    }
  }

  async loadStats() {
    try {
      const result = await chrome.storage.local.get([
        'totalMined', 
        'spaceSaved', 
        'sessions',
        'miningStats'
      ]);
      
      this.miningStats = {
        totalMined: result.totalMined || result.miningStats?.totalSpaceSaved || 0,
        spaceSaved: result.spaceSaved || result.miningStats?.totalSpaceSaved || 0,
        sessions: result.sessions || result.miningStats?.optimizationsSubmitted || 0
      };
      
      this.updateStatsDisplay();
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  updateStatsDisplay() {
    const totalMinedEl = document.getElementById('totalMined');
    const spaceSavedEl = document.getElementById('spaceSaved');
    const sessionsEl = document.getElementById('sessions');
    
    if (totalMinedEl) {
      totalMinedEl.textContent = `${Math.floor(this.miningStats.totalMined / 100)} DSH`;
    }
    
    if (spaceSavedEl) {
      spaceSavedEl.textContent = this.formatBytes(this.miningStats.spaceSaved);
    }
    
    if (sessionsEl) {
      sessionsEl.textContent = this.miningStats.sessions;
    }
  }

  async toggleMining() {
    const toggleBtn = document.getElementById('toggleMining');
    
    // Disable button during operation
    toggleBtn.disabled = true;
    toggleBtn.textContent = this.isMining ? 'Stopping...' : 'Starting...';
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: this.isMining ? 'STOP_MINING' : 'START_MINING'
      });
      
      if (response.success) {
        this.isMining = !this.isMining;
        this.updateUI();
        
        // Show success feedback
        this.showNotification(
          this.isMining ? 'Mining Started' : 'Mining Stopped',
          this.isMining ? 'DOM optimization is now active' : 'Mining has been stopped'
        );
      } else {
        throw new Error(response.error || 'Failed to toggle mining');
      }
    } catch (error) {
      console.error('Failed to toggle mining:', error);
      this.showNotification('Error', 'Failed to toggle mining status');
    } finally {
      toggleBtn.disabled = false;
      toggleBtn.textContent = this.isMining ? 'Stop Mining' : 'Start Mining';
    }
  }

  async openSidePanel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        window.close(); // Close popup after opening side panel
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
      this.showNotification('Error', 'Failed to open side panel');
    }
  }

  async openWallet() {
    try {
      await chrome.tabs.create({ url: 'wallet.html' });
      window.close();
    } catch (error) {
      console.error('Failed to open wallet:', error);
      this.showNotification('Error', 'Failed to open wallet');
    }
  }

  async loadWalletInfo() {
    try {
      const result = await chrome.storage.local.get(['walletAddress', 'hasWallet']);

      if (result.hasWallet && result.walletAddress) {
        const walletInfoEl = document.getElementById('walletInfo');
        const walletAddressEl = document.getElementById('walletAddress');

        if (walletInfoEl && walletAddressEl) {
          walletInfoEl.style.display = 'block';
          walletAddressEl.textContent = result.walletAddress;
        }
      }
    } catch (error) {
      console.error('Failed to load wallet info:', error);
    }
  }

  updateUI() {
    const toggleBtn = document.getElementById('toggleMining');
    const statusDiv = document.getElementById('status');
    
    if (toggleBtn) {
      toggleBtn.textContent = this.isMining ? 'Stop Mining' : 'Start Mining';
      toggleBtn.className = `button ${this.isMining ? 'stop-btn' : 'start-btn'}`;
    }
    
    if (statusDiv) {
      statusDiv.textContent = this.isMining ? '⚡ Mining Active' : '⏹️ Mining Stopped';
      statusDiv.className = `status ${this.isMining ? 'mining' : 'stopped'}`;
    }
    
    // Update stats
    this.updateStatsDisplay();
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'MINING_STATUS_CHANGE':
        this.isMining = message.data.isMining;
        this.updateUI();
        sendResponse({ success: true });
        break;
        
      case 'METRICS_UPDATE':
        this.miningStats = { ...this.miningStats, ...message.data };
        this.updateStatsDisplay();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  showNotification(title, message) {
    // Create a temporary notification in the popup
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      z-index: 1000;
      font-size: 12px;
      animation: slideDown 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 2px;">${title}</div>
      <div style="font-size: 11px; opacity: 0.9;">${message}</div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LightDomPopup();
});
