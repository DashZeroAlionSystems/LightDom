/**
 * LightDom Extension Popup Script
 * Handles UI interactions and data display
 */

class LightDomPopup {
  constructor() {
    this.isMining = false;
    this.userAddress = null;
    this.metrics = {
      optimizations: 0,
      spaceSaved: 0,
      blocksMined: 0,
      peers: 0,
    };

    this.init();
  }

  async init() {
    // Load data from storage
    await this.loadData();

    // Setup event listeners
    this.setupEventListeners();

    // Update UI
    this.updateUI();

    // Start periodic updates
    this.startPeriodicUpdates();
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['isMining', 'userAddress', 'metrics']);

      this.isMining = result.isMining || false;
      this.userAddress = result.userAddress || null;
      this.metrics = result.metrics || this.metrics;
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  setupEventListeners() {
    // Toggle mining button
    document.getElementById('toggleMining').addEventListener('click', () => {
      this.toggleMining();
    });

    // Open dashboard button
    document.getElementById('openDashboard').addEventListener('click', () => {
      this.openDashboard();
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.isMining) {
        this.isMining = changes.isMining.newValue;
        this.updateUI();
      }

      if (changes.metrics) {
        this.metrics = changes.metrics.newValue;
        this.updateUI();
      }
    });
  }

  async toggleMining() {
    try {
      const newMiningState = !this.isMining;

      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: newMiningState ? 'START_MINING' : 'STOP_MINING',
      });

      if (response.success) {
        this.isMining = newMiningState;
        await chrome.storage.local.set({ isMining: this.isMining });
        this.updateUI();
      } else {
        console.error('Failed to toggle mining:', response.error);
      }
    } catch (error) {
      console.error('Error toggling mining:', error);
    }
  }

  openDashboard() {
    chrome.tabs.create({
      url: 'http://localhost:3001',
    });
  }

  updateUI() {
    // Update status indicator
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const userAddress = document.getElementById('userAddress');

    if (this.isMining) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Mining Active';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Mining Inactive';
    }

    // Update user address
    if (this.userAddress) {
      userAddress.textContent = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
    } else {
      userAddress.textContent = 'Not connected';
    }

    // Update metrics
    document.getElementById('optimizations').textContent = this.metrics.optimizations || 0;
    document.getElementById('spaceSaved').textContent = this.formatBytes(
      this.metrics.spaceSaved || 0
    );
    document.getElementById('blocksMined').textContent = this.metrics.blocksMined || 0;
    document.getElementById('peers').textContent = this.metrics.peers || 0;

    // Update button text
    const toggleButton = document.getElementById('toggleMining');
    toggleButton.textContent = this.isMining ? 'Stop Mining' : 'Start Mining';
    toggleButton.className = this.isMining ? 'btn btn-secondary' : 'btn btn-primary';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  startPeriodicUpdates() {
    // Update metrics every 5 seconds
    setInterval(async () => {
      await this.loadData();
      this.updateUI();
    }, 5000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LightDomPopup();
});
