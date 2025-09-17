/**
 * LightDom Side Panel Dashboard
 * Enhanced interface for monitoring DOM optimization and blockchain mining
 */

class LightDomSidePanel {
  constructor() {
    this.isMining = false;
    this.metrics = {
      optimizations: 0,
      spaceSaved: 0,
      blocksMined: 0,
      peers: 0
    };
    this.recentOptimizations = [];
    this.updateInterval = null;
    
    this.init();
  }

  async init() {
    // Load initial data
    await this.loadData();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start real-time updates
    this.startRealTimeUpdates();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  async loadData() {
    try {
      // Get user data and metrics from storage
      const result = await chrome.storage.local.get([
        'userAddress', 
        'isMining', 
        'metrics', 
        'recentOptimizations'
      ]);
      
      this.isMining = result.isMining || false;
      this.metrics = result.metrics || this.metrics;
      this.recentOptimizations = result.recentOptimizations || [];
      
      // Update UI
      this.updateStatus();
      this.updateMetrics();
      this.updateOptimizationsList();
      
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  setupEventListeners() {
    // Toggle mining button
    document.getElementById('toggleMining').addEventListener('click', () => {
      this.toggleMining();
    });
    
    // Open full dashboard
    document.getElementById('openDashboard').addEventListener('click', () => {
      this.openFullDashboard();
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        this.toggleMining();
      }
    });
  }

  async toggleMining() {
    const button = document.getElementById('toggleMining');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    // Update UI immediately for better UX
    button.disabled = true;
    button.textContent = this.isMining ? 'Stopping...' : 'Starting...';
    
    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: this.isMining ? 'STOP_MINING' : 'START_MINING'
      });
      
      if (response.success) {
        this.isMining = !this.isMining;
        this.updateStatus();
        
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
      button.disabled = false;
      button.textContent = this.isMining ? 'Stop Mining' : 'Start Mining';
    }
  }

  openFullDashboard() {
    // Open the main LightDom dashboard in a new tab
    chrome.tabs.create({
      url: 'http://localhost:3000/dashboard'
    });
  }

  updateStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const userAddress = document.getElementById('userAddress');
    
    // Update status indicator
    statusDot.className = `status-dot ${this.isMining ? 'active' : ''}`;
    statusText.textContent = this.isMining ? 'Mining Active' : 'Mining Inactive';
    
    // Update user address
    const result = chrome.storage.local.get(['userAddress']);
    result.then(data => {
      if (data.userAddress) {
        userAddress.textContent = `${data.userAddress.substring(0, 6)}...${data.userAddress.substring(data.userAddress.length - 4)}`;
      } else {
        userAddress.textContent = 'Not Connected';
      }
    });
  }

  updateMetrics() {
    // Update metric values
    document.getElementById('optimizations').textContent = this.metrics.optimizations || 0;
    document.getElementById('spaceSaved').textContent = this.formatBytes(this.metrics.spaceSaved || 0);
    document.getElementById('blocksMined').textContent = this.metrics.blocksMined || 0;
    document.getElementById('peers').textContent = this.metrics.peers || 0;
    
    // Update performance chart placeholder
    this.updatePerformanceChart();
  }

  updateOptimizationsList() {
    const container = document.getElementById('optimizationsList');
    
    if (this.recentOptimizations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div>No optimizations yet</div>
          <div style="font-size: 11px; margin-top: 8px;">Start mining to see DOM optimizations</div>
        </div>
      `;
      return;
    }
    
    // Show recent optimizations (last 5)
    const recentItems = this.recentOptimizations.slice(-5).reverse();
    
    container.innerHTML = recentItems.map(opt => `
      <div class="optimization-item">
        <div class="optimization-info">
          <div class="optimization-domain">${this.extractDomain(opt.url)}</div>
          <div class="optimization-details">
            ${opt.optimizations || 0} optimizations • ${this.formatTime(opt.timestamp)}
          </div>
        </div>
        <div class="optimization-value">+${this.formatBytes(opt.spaceSaved)}</div>
      </div>
    `).join('');
  }

  updatePerformanceChart() {
    const chartContainer = document.getElementById('performanceChart');
    
    if (this.recentOptimizations.length === 0) {
      chartContainer.innerHTML = '📈 Performance metrics will appear here';
      return;
    }
    
    // Simple text-based chart for space saved over time
    const last24Hours = this.recentOptimizations.filter(opt => 
      Date.now() - opt.timestamp < 24 * 60 * 60 * 1000
    );
    
    const totalSaved = last24Hours.reduce((sum, opt) => sum + (opt.spaceSaved || 0), 0);
    const avgPerHour = last24Hours.length > 0 ? totalSaved / 24 : 0;
    
    chartContainer.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          ${this.formatBytes(totalSaved)}
        </div>
        <div style="font-size: 12px; opacity: 0.8;">
          Saved in last 24 hours
        </div>
        <div style="font-size: 11px; opacity: 0.6; margin-top: 4px;">
          Avg: ${this.formatBytes(avgPerHour)}/hour
        </div>
      </div>
    `;
  }

  startRealTimeUpdates() {
    // Update metrics every 5 seconds
    this.updateInterval = setInterval(async () => {
      await this.loadData();
    }, 5000);
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'METRICS_UPDATE':
        this.metrics = { ...this.metrics, ...message.data };
        this.updateMetrics();
        break;
        
      case 'OPTIMIZATION_COMPLETE':
        this.recentOptimizations.push(message.data);
        // Keep only last 50 optimizations
        if (this.recentOptimizations.length > 50) {
          this.recentOptimizations = this.recentOptimizations.slice(-50);
        }
        this.updateOptimizationsList();
        this.updatePerformanceChart();
        
        // Save to storage
        chrome.storage.local.set({ recentOptimizations: this.recentOptimizations });
        break;
        
      case 'MINING_STATUS_CHANGE':
        this.isMining = message.data.isMining;
        this.updateStatus();
        break;
    }
  }

  showNotification(title, message) {
    // Create a temporary notification in the side panel
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
      animation: slideDown 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 12px; opacity: 0.9;">${message}</div>
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

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url.substring(0, 30) + '...';
    }
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Initialize the side panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LightDomSidePanel();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.lightDomSidePanel) {
    window.lightDomSidePanel.destroy();
  }
});
