/**
 * LightDom Extension Options Page
 * Configuration interface for advanced Chrome Extensions features
 */

class LightDomOptions {
  constructor() {
    this.defaultSettings = {
      blockchainUrl: 'http://localhost:3001/blockchain',
      userAddress: '',
      autoMining: false,
      notifications: true,
      removeUnusedElements: true,
      optimizeStyles: true,
      removeDuplicateScripts: true,
      compressImages: false,
      optimizationLevel: 3,
      analysisFrequency: 30,
      batchSize: 10,
      useOffscreenAnalysis: true,
      enableDeclarativeRules: true
    };
    
    this.init();
  }

  async init() {
    // Load current settings
    await this.loadSettings();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load statistics
    await this.loadStatistics();
    
    // Load declarative rules
    await this.loadDeclarativeRules();
    
    // Setup sliders
    this.setupSliders();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(Object.keys(this.defaultSettings));
      
      // Apply settings to form
      Object.keys(this.defaultSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = result[key] !== undefined ? result[key] : this.defaultSettings[key];
          } else {
            element.value = result[key] !== undefined ? result[key] : this.defaultSettings[key];
          }
        }
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showMessage('Failed to load settings', 'error');
    }
  }

  async saveSettings() {
    try {
      const settings = {};
      
      // Collect settings from form
      Object.keys(this.defaultSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            settings[key] = element.checked;
          } else {
            settings[key] = element.value;
          }
        }
      });
      
      // Save to storage
      await chrome.storage.local.set(settings);
      
      // Send message to background script to update settings
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings
      });
      
      this.showMessage('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showMessage('Failed to save settings', 'error');
    }
  }

  setupEventListeners() {
    // Save button
    document.getElementById('saveOptions').addEventListener('click', () => {
      this.saveSettings();
    });
    
    // Export data
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });
    
    // Import data
    document.getElementById('importData').addEventListener('click', () => {
      this.importData();
    });
    
    // Reset all
    document.getElementById('resetAll').addEventListener('click', () => {
      this.resetAll();
    });
    
    // Add custom rule
    document.getElementById('addCustomRule').addEventListener('click', () => {
      this.showAddRuleDialog();
    });
    
    // Reset rules
    document.getElementById('resetRules').addEventListener('click', () => {
      this.resetDeclarativeRules();
    });
  }

  setupSliders() {
    // Optimization level slider
    const optimizationSlider = document.getElementById('optimizationLevel');
    const optimizationValue = document.getElementById('optimizationValue');
    
    optimizationSlider.addEventListener('input', (e) => {
      optimizationValue.textContent = e.target.value;
    });
    
    // Analysis frequency slider
    const frequencySlider = document.getElementById('analysisFrequency');
    const frequencyValue = document.getElementById('frequencyValue');
    
    frequencySlider.addEventListener('input', (e) => {
      frequencyValue.textContent = e.target.value;
    });
    
    // Batch size slider
    const batchSlider = document.getElementById('batchSize');
    const batchValue = document.getElementById('batchValue');
    
    batchSlider.addEventListener('input', (e) => {
      batchValue.textContent = e.target.value;
    });
  }

  async loadStatistics() {
    try {
      const result = await chrome.storage.local.get(['metrics']);
      const metrics = result.metrics || {};
      
      document.getElementById('totalOptimizations').textContent = metrics.optimizations || 0;
      document.getElementById('totalSpaceSaved').textContent = this.formatBytes(metrics.spaceSaved || 0);
      document.getElementById('blocksMined').textContent = metrics.blocksMined || 0;
      document.getElementById('networkPeers').textContent = metrics.peers || 0;
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }

  async loadDeclarativeRules() {
    try {
      // Request rule statistics from background script
      const response = await chrome.runtime.sendMessage({
        type: 'GET_DECLARATIVE_RULE_STATISTICS'
      });
      
      if (response.success) {
        const stats = response.statistics;
        
        document.getElementById('totalRules').textContent = stats.total || 0;
        document.getElementById('activeRules').textContent = stats.active || 0;
        document.getElementById('blockedRequests').textContent = stats.blockedRequests || 0;
        
        // Load rules list
        await this.loadRulesList();
      }
    } catch (error) {
      console.error('Failed to load declarative rules:', error);
    }
  }

  async loadRulesList() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_DECLARATIVE_RULES'
      });
      
      if (response.success) {
        const rulesList = document.getElementById('rulesList');
        const rules = response.rules;
        
        if (rules.length === 0) {
          rulesList.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px;">No rules configured</div>';
          return;
        }
        
        rulesList.innerHTML = rules.map(rule => `
          <div class="rule-item">
            <div class="rule-info">
              <div class="rule-name">${this.getRuleName(rule)}</div>
              <div class="rule-description">${this.getRuleDescription(rule)}</div>
            </div>
            <div class="rule-actions">
              <button class="btn btn-small ${rule.isActive ? 'btn-secondary' : 'btn-primary'}" 
                      onclick="lightDomOptions.toggleRule(${rule.id})">
                ${rule.isActive ? 'Disable' : 'Enable'}
              </button>
              <button class="btn btn-small btn-danger" 
                      onclick="lightDomOptions.deleteRule(${rule.id})">
                Delete
              </button>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Failed to load rules list:', error);
    }
  }

  getRuleName(rule) {
    const condition = rule.condition;
    if (condition.urlFilter) {
      return `Block: ${condition.urlFilter.substring(0, 30)}...`;
    }
    return `Rule ${rule.id}`;
  }

  getRuleDescription(rule) {
    const action = rule.action;
    const condition = rule.condition;
    
    if (action.type === 'block') {
      return `Blocks ${condition.resourceTypes?.join(', ') || 'all'} resources`;
    } else if (action.type === 'modifyHeaders') {
      return `Modifies ${action.requestHeaders ? 'request' : 'response'} headers`;
    }
    
    return `${action.type} action`;
  }

  async toggleRule(ruleId) {
    try {
      const rule = await this.getRuleById(ruleId);
      const newStatus = !rule.isActive;
      
      const response = await chrome.runtime.sendMessage({
        type: newStatus ? 'ENABLE_DECLARATIVE_RULE' : 'DISABLE_DECLARATIVE_RULE',
        ruleId
      });
      
      if (response.success) {
        this.showMessage(`Rule ${newStatus ? 'enabled' : 'disabled'} successfully`, 'success');
        await this.loadRulesList();
        await this.loadDeclarativeRules();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      this.showMessage('Failed to toggle rule', 'error');
    }
  }

  async deleteRule(ruleId) {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REMOVE_DECLARATIVE_RULE',
        ruleId
      });
      
      if (response.success) {
        this.showMessage('Rule deleted successfully', 'success');
        await this.loadRulesList();
        await this.loadDeclarativeRules();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      this.showMessage('Failed to delete rule', 'error');
    }
  }

  async getRuleById(ruleId) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_DECLARATIVE_RULES'
      });
      
      if (response.success) {
        return response.rules.find(rule => rule.id === ruleId);
      }
    } catch (error) {
      console.error('Failed to get rule:', error);
    }
    return null;
  }

  showAddRuleDialog() {
    // Simple prompt for now - could be enhanced with a modal dialog
    const urlPattern = prompt('Enter URL pattern to block (e.g., *ads*):');
    if (!urlPattern) return;
    
    const resourceTypes = prompt('Enter resource types (comma-separated, e.g., script,stylesheet):', 'script,stylesheet');
    if (!resourceTypes) return;
    
    this.addCustomRule(urlPattern, resourceTypes.split(',').map(t => t.trim()));
  }

  async addCustomRule(urlPattern, resourceTypes) {
    try {
      const rule = {
        priority: 2,
        action: { type: 'block' },
        condition: {
          urlFilter: urlPattern,
          resourceTypes
        },
        category: 'custom'
      };
      
      const response = await chrome.runtime.sendMessage({
        type: 'ADD_DECLARATIVE_RULE',
        rule
      });
      
      if (response.success) {
        this.showMessage('Custom rule added successfully', 'success');
        await this.loadRulesList();
        await this.loadDeclarativeRules();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to add custom rule:', error);
      this.showMessage('Failed to add custom rule', 'error');
    }
  }

  async resetDeclarativeRules() {
    if (!confirm('Are you sure you want to reset all declarative rules to default?')) {
      return;
    }
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'RESET_DECLARATIVE_RULES'
      });
      
      if (response.success) {
        this.showMessage('Rules reset to default successfully', 'success');
        await this.loadRulesList();
        await this.loadDeclarativeRules();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to reset rules:', error);
      this.showMessage('Failed to reset rules', 'error');
    }
  }

  async exportData() {
    try {
      const data = await chrome.storage.local.get();
      const exportData = {
        version: '2.0',
        timestamp: Date.now(),
        settings: data
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `lightdom-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showMessage('Data exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.showMessage('Failed to export data', 'error');
    }
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (importData.version !== '2.0') {
          throw new Error('Unsupported export format version');
        }
        
        // Import settings
        await chrome.storage.local.set(importData.settings);
        
        // Reload settings
        await this.loadSettings();
        
        this.showMessage('Data imported successfully', 'success');
      } catch (error) {
        console.error('Failed to import data:', error);
        this.showMessage('Failed to import data: ' + error.message, 'error');
      }
    };
    
    input.click();
  }

  async resetAll() {
    if (!confirm('Are you sure you want to reset all settings and data? This cannot be undone.')) {
      return;
    }
    
    try {
      // Clear all storage
      await chrome.storage.local.clear();
      await chrome.storage.session.clear();
      
      // Reset to default settings
      await chrome.storage.local.set(this.defaultSettings);
      
      // Reload settings
      await this.loadSettings();
      
      this.showMessage('All settings reset successfully', 'success');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      this.showMessage('Failed to reset settings', 'error');
    }
  }

  showMessage(message, type) {
    const messageElement = document.getElementById('statusMessage');
    messageElement.textContent = message;
    messageElement.className = `status-message status-${type}`;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
      messageElement.style.display = 'none';
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

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.lightDomOptions = new LightDomOptions();
});
