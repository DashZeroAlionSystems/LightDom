/**
 * LightDom Blockchain Miner
 * Advanced DOM optimization and blockchain integration
 */

class LightDomBlockchainMiner {
  constructor() {
    this.isMining = false;
    this.userAddress = null;
    this.miningStats = {
      optimizationsSubmitted: 0,
      totalSpaceSaved: 0,
      blocksMined: 0,
      lastOptimization: 0,
    };

    this.init();
  }

  async init() {
    // Get mining status from extension storage
    const result = await chrome.storage.local.get(['isMining', 'userAddress']);
    this.isMining = result.isMining || false;
    this.userAddress = result.userAddress;

    if (this.isMining) {
      this.startMining();
    }

    // Listen for mining status changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.isMining) {
        this.isMining = changes.isMining.newValue;
        if (this.isMining) {
          this.startMining();
        } else {
          this.stopMining();
        }
      }
    });
  }

  startMining() {
    if (this.isMining) return;

    this.isMining = true;
    console.log('LightDom blockchain mining started');

    // Start advanced DOM monitoring
    this.startAdvancedDOMMonitoring();

    // Start periodic optimization
    this.startPeriodicOptimization();

    // Inject blockchain UI
    this.injectBlockchainUI();
  }

  stopMining() {
    this.isMining = false;
    console.log('LightDom blockchain mining stopped');

    // Clean up monitoring
    this.stopAdvancedDOMMonitoring();
    this.stopPeriodicOptimization();
    this.removeBlockchainUI();
  }

  startAdvancedDOMMonitoring() {
    // Monitor for specific optimization opportunities
    this.observer = new MutationObserver(mutations => {
      this.handleAdvancedDOMChanges(mutations);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
    });
  }

  stopAdvancedDOMMonitoring() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  handleAdvancedDOMChanges(mutations) {
    if (!this.isMining) return;

    // Analyze mutations for optimization opportunities
    const significantChanges = mutations.filter(mutation => {
      return this.isSignificantChange(mutation);
    });

    if (significantChanges.length > 0) {
      setTimeout(() => this.performAdvancedOptimization(), 500);
    }
  }

  isSignificantChange(mutation) {
    // Check if mutation represents significant DOM change
    if (mutation.type === 'childList') {
      return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
    }

    if (mutation.type === 'attributes') {
      return ['class', 'style', 'id'].includes(mutation.attributeName);
    }

    return false;
  }

  async performAdvancedOptimization() {
    if (!this.isMining) return;

    try {
      const optimization = await this.analyzeAdvancedDOM();

      if (optimization.potentialSavings > 0) {
        await this.submitOptimization(optimization);
        this.miningStats.optimizationsSubmitted++;
        this.miningStats.totalSpaceSaved += optimization.potentialSavings;
        this.miningStats.lastOptimization = Date.now();
      }
    } catch (error) {
      console.error('Advanced optimization failed:', error);
    }
  }

  async analyzeAdvancedDOM() {
    const analysis = {
      url: window.location.href,
      timestamp: Date.now(),
      potentialSavings: 0,
      optimizations: [],
      domMetrics: {},
    };

    // Analyze DOM structure
    analysis.domMetrics = this.getDOMMetrics();

    // Find optimization opportunities
    const opportunities = await this.findOptimizationOpportunities();
    analysis.optimizations = opportunities;
    analysis.potentialSavings = opportunities.reduce((total, opt) => total + opt.savings, 0);

    return analysis;
  }

  getDOMMetrics() {
    return {
      totalElements: document.querySelectorAll('*').length,
      totalTextNodes: this.countTextNodes(),
      totalAttributes: this.countAttributes(),
      totalStyles: this.countStyles(),
      domDepth: this.calculateDOMDepth(),
      scriptCount: document.querySelectorAll('script').length,
      styleCount: document.querySelectorAll('style, link[rel="stylesheet"]').length,
    };
  }

  countTextNodes() {
    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) {
        count++;
      }
    }

    return count;
  }

  countAttributes() {
    let count = 0;
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      count += element.attributes.length;
    });
    return count;
  }

  countStyles() {
    let count = 0;
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
      if (style.textContent) {
        count += style.textContent.length;
      }
    });
    return count;
  }

  calculateDOMDepth() {
    let maxDepth = 0;

    function getDepth(node, currentDepth = 0) {
      maxDepth = Math.max(maxDepth, currentDepth);
      for (let child of node.children) {
        getDepth(child, currentDepth + 1);
      }
    }

    getDepth(document.body);
    return maxDepth;
  }

  async findOptimizationOpportunities() {
    const opportunities = [];

    // Find unused CSS
    const unusedCSS = await this.findUnusedCSS();
    if (unusedCSS.length > 0) {
      opportunities.push({
        type: 'unused_css',
        description: 'Unused CSS rules found',
        savings: unusedCSS.reduce((total, rule) => total + rule.length, 0),
        details: unusedCSS,
      });
    }

    // Find duplicate elements
    const duplicates = this.findDuplicateElements();
    if (duplicates.length > 0) {
      opportunities.push({
        type: 'duplicate_elements',
        description: 'Duplicate elements found',
        savings: duplicates.reduce((total, dup) => total + dup.size, 0),
        details: duplicates,
      });
    }

    // Find redundant attributes
    const redundantAttrs = this.findRedundantAttributes();
    if (redundantAttrs.length > 0) {
      opportunities.push({
        type: 'redundant_attributes',
        description: 'Redundant attributes found',
        savings: redundantAttrs.length * 10, // Estimate
        details: redundantAttrs,
      });
    }

    // Find large images that could be optimized
    const largeImages = this.findLargeImages();
    if (largeImages.length > 0) {
      opportunities.push({
        type: 'large_images',
        description: 'Large images that could be optimized',
        savings: largeImages.reduce((total, img) => total + img.estimatedSavings, 0),
        details: largeImages,
      });
    }

    return opportunities;
  }

  async findUnusedCSS() {
    const unusedRules = [];
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');

    for (let style of styles) {
      if (style.textContent) {
        const rules = this.parseCSSRules(style.textContent);
        for (let rule of rules) {
          if (!this.isCSSRuleUsed(rule)) {
            unusedRules.push(rule);
          }
        }
      }
    }

    return unusedRules;
  }

  parseCSSRules(css) {
    // Simple CSS rule parser
    const rules = [];
    const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      rules.push({
        selector: match[1].trim(),
        declarations: match[2].trim(),
        full: match[0],
        length: match[0].length,
      });
    }

    return rules;
  }

  isCSSRuleUsed(rule) {
    try {
      const elements = document.querySelectorAll(rule.selector);
      return elements.length > 0;
    } catch (error) {
      return false; // Invalid selector
    }
  }

  findDuplicateElements() {
    const elementMap = new Map();
    const duplicates = [];

    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const key = this.getElementKey(element);
      if (elementMap.has(key)) {
        duplicates.push({
          tagName: element.tagName,
          className: element.className,
          size: this.estimateElementSize(element),
          count: elementMap.get(key) + 1,
        });
        elementMap.set(key, elementMap.get(key) + 1);
      } else {
        elementMap.set(key, 1);
      }
    });

    return duplicates;
  }

  getElementKey(element) {
    return `${element.tagName}-${element.className}-${element.id}`;
  }

  estimateElementSize(element) {
    return (element.outerHTML || '').length;
  }

  findRedundantAttributes() {
    const redundant = [];
    const elements = document.querySelectorAll('*');

    elements.forEach(element => {
      const attrs = Array.from(element.attributes);
      attrs.forEach(attr => {
        if (this.isRedundantAttribute(attr, element)) {
          redundant.push({
            element: element.tagName,
            attribute: attr.name,
            value: attr.value,
          });
        }
      });
    });

    return redundant;
  }

  isRedundantAttribute(attr, element) {
    // Check for redundant attributes
    if (attr.name === 'class' && !attr.value.trim()) return true;
    if (attr.name === 'id' && !attr.value.trim()) return true;
    if (attr.name === 'style' && !attr.value.trim()) return true;

    // Check for default values
    if (attr.name === 'type' && attr.value === 'text') return true;
    if (attr.name === 'method' && attr.value === 'get') return true;

    return false;
  }

  findLargeImages() {
    const largeImages = [];
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      const area = rect.width * rect.height;

      if (area > 100000) {
        // Large image threshold
        largeImages.push({
          src: img.src,
          width: rect.width,
          height: rect.height,
          area: area,
          estimatedSavings: Math.floor(area / 1000), // Rough estimate
        });
      }
    });

    return largeImages;
  }

  async submitOptimization(optimization) {
    try {
      const response = await fetch('http://localhost:3001/api/blockchain/submit-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LightDom-User': this.userAddress,
        },
        body: JSON.stringify(optimization),
      });

      const result = await response.json();

      if (result.success) {
        this.showMiningNotification(optimization);
        this.updateMiningStats();
      }
    } catch (error) {
      console.error('Failed to submit optimization:', error);
    }
  }

  showMiningNotification(optimization) {
    // Create mining notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
      animation: slideInLeft 0.4s ease-out;
      border: 1px solid rgba(255,255,255,0.1);
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 8px; height: 8px; background: #00ff88; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite;"></div>
        <div style="font-weight: 600;">⚡ LightDom Mining Active</div>
      </div>
      <div style="font-size: 12px; opacity: 0.9; line-height: 1.4;">
        ${optimization.potentialSavings} bytes optimized<br>
        ${optimization.optimizations.length} opportunities found<br>
        <span style="color: #00ff88;">Mining reward: +${Math.floor(optimization.potentialSavings / 100)} DSH</span>
      </div>
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInLeft 0.4s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, 4000);
  }

  updateMiningStats() {
    // Update mining statistics display
    const statsElement = document.getElementById('lightdom-mining-stats');
    if (statsElement) {
      statsElement.innerHTML = `
        <div>Optimizations: ${this.miningStats.optimizationsSubmitted}</div>
        <div>Space Saved: ${(this.miningStats.totalSpaceSaved / 1024).toFixed(1)} KB</div>
        <div>Blocks Mined: ${this.miningStats.blocksMined}</div>
      `;
    }
  }

  startPeriodicOptimization() {
    this.optimizationInterval = setInterval(() => {
      if (this.isMining) {
        this.performAdvancedOptimization();
      }
    }, 60000); // Every minute
  }

  stopPeriodicOptimization() {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }

  injectBlockchainUI() {
    // Inject blockchain mining UI
    const ui = document.createElement('div');
    ui.id = 'lightdom-blockchain-ui';
    ui.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      border: 1px solid #333;
      backdrop-filter: blur(10px);
    `;

    ui.innerHTML = `
      <div style="color: #00ff88; font-weight: bold; margin-bottom: 8px;">LightDom Mining</div>
      <div id="lightdom-mining-stats">
        <div>Optimizations: ${this.miningStats.optimizationsSubmitted}</div>
        <div>Space Saved: ${(this.miningStats.totalSpaceSaved / 1024).toFixed(1)} KB</div>
        <div>Blocks Mined: ${this.miningStats.blocksMined}</div>
      </div>
    `;

    document.body.appendChild(ui);
  }

  removeBlockchainUI() {
    const ui = document.getElementById('lightdom-blockchain-ui');
    if (ui) {
      ui.remove();
    }
  }
}

// Initialize the blockchain miner
new LightDomBlockchainMiner();
