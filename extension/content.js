/**
 * LightDom Blockchain Content Script
 * Injected into web pages to monitor DOM and submit optimizations
 */

class LightDomContentScript {
  constructor() {
    this.isActive = false;
    this.userAddress = null;
    this.optimizationQueue = [];
    this.domObserver = null;
    this.lastOptimization = 0;
    this.minOptimizationInterval = 10000; // 10 seconds between optimizations
    
    this.init();
  }

  async init() {
    // Get user data from storage
    const result = await chrome.storage.local.get(['userAddress', 'isMining']);
    this.userAddress = result.userAddress;
    this.isActive = result.isMining || false;

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    if (this.isActive) {
      this.startDOMMonitoring();
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'MINING_STARTED':
        this.isActive = true;
        this.userAddress = message.data.userAddress;
        this.startDOMMonitoring();
        break;
      
      case 'MINING_STOPPED':
        this.isActive = false;
        this.stopDOMMonitoring();
        break;
      
      case 'LIGHTDOM_NOTIFICATION':
        this.displayNotification(message.data);
        break;
      
      case 'BLOCKCHAIN_UPDATE':
        this.updateBlockchainStatus(message.data);
        break;
    }
  }

  startDOMMonitoring() {
    if (!this.isActive) return;
    
    // Start observing DOM changes
    this.domObserver = new MutationObserver((mutations) => {
      this.handleDOMChanges(mutations);
    });
    
    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });
    
    // Initial DOM analysis
    this.analyzeDOM();
    
    // Periodic analysis
    setInterval(() => {
      if (this.isActive) {
        this.analyzeDOM();
      }
    }, 30000); // Every 30 seconds
  }

  stopDOMMonitoring() {
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
    }
  }

  handleDOMChanges(mutations) {
    if (!this.isActive) return;
    
    // Analyze changes for optimization opportunities
    const hasSignificantChanges = mutations.some(mutation => {
      return mutation.type === 'childList' && mutation.addedNodes.length > 0;
    });
    
    if (hasSignificantChanges) {
      setTimeout(() => this.analyzeDOM(), 1000); // Debounce
    }
  }

  async analyzeDOM() {
    if (!this.isActive || Date.now() - this.lastOptimization < this.minOptimizationInterval) {
      return;
    }
    
    try {
      const analysis = this.performDOMAnalysis();
      
      if (analysis.spaceSaved > 0) {
        this.lastOptimization = Date.now();
        
        const optimizationData = {
          url: window.location.href,
          domain: window.location.hostname,
          domAnalysis: analysis,
          spaceSaved: analysis.spaceSaved,
          timestamp: Date.now(),
          userAddress: this.userAddress
        };
        
        // Send to background script
        chrome.runtime.sendMessage({
          type: 'DOM_OPTIMIZATION_FOUND',
          data: optimizationData
        });
        
        // Show visual feedback
        this.showOptimizationFeedback(analysis);
      }
    } catch (error) {
      console.error('DOM analysis failed:', error);
    }
  }

  performDOMAnalysis() {
    const analysis = {
      totalElements: document.querySelectorAll('*').length,
      unusedElements: 0,
      redundantStyles: 0,
      spaceSaved: 0,
      optimizations: []
    };
    
    // Find unused elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (this.isUnusedElement(element)) {
        analysis.unusedElements++;
        analysis.spaceSaved += this.estimateElementSize(element);
        analysis.optimizations.push({
          type: 'unused_element',
          element: element.tagName,
          size: this.estimateElementSize(element)
        });
      }
    });
    
    // Find redundant styles
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
      const redundancy = this.analyzeStyleRedundancy(style);
      if (redundancy > 0) {
        analysis.redundantStyles++;
        analysis.spaceSaved += redundancy;
        analysis.optimizations.push({
          type: 'redundant_style',
          size: redundancy
        });
      }
    });
    
    // Find duplicate scripts
    const scripts = document.querySelectorAll('script[src]');
    const scriptSources = new Set();
    scripts.forEach(script => {
      if (scriptSources.has(script.src)) {
        analysis.spaceSaved += this.estimateScriptSize(script);
        analysis.optimizations.push({
          type: 'duplicate_script',
          src: script.src
        });
      } else {
        scriptSources.add(script.src);
      }
    });
    
    return analysis;
  }

  isUnusedElement(element) {
    // Check if element is likely unused
    if (element.offsetWidth === 0 && element.offsetHeight === 0) {
      return true;
    }
    
    if (element.style.display === 'none' || element.style.visibility === 'hidden') {
      return true;
    }
    
    // Check for empty elements
    if (element.children.length === 0 && !element.textContent.trim()) {
      return true;
    }
    
    return false;
  }

  estimateElementSize(element) {
    // Rough estimation of element size in bytes
    const outerHTML = element.outerHTML || '';
    return outerHTML.length * 2; // Approximate bytes
  }

  analyzeStyleRedundancy(styleElement) {
    // Analyze CSS for redundancy
    let redundancy = 0;
    
    if (styleElement.textContent) {
      const css = styleElement.textContent;
      const rules = css.split('}');
      
      // Find duplicate rules
      const ruleMap = new Map();
      rules.forEach(rule => {
        const trimmed = rule.trim();
        if (trimmed && trimmed.includes('{')) {
          if (ruleMap.has(trimmed)) {
            redundancy += trimmed.length;
          } else {
            ruleMap.set(trimmed, true);
          }
        }
      });
    }
    
    return redundancy;
  }

  estimateScriptSize(script) {
    return script.src.length + 100; // Rough estimate
  }

  showOptimizationFeedback(analysis) {
    // Create floating notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">🚀 LightDom Optimization</div>
      <div style="font-size: 12px; opacity: 0.9;">
        ${analysis.spaceSaved} bytes saved<br>
        ${analysis.unusedElements} unused elements found
      </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  displayNotification(notification) {
    // Display LightDom-specific notifications
    console.log('LightDom notification:', notification);
    
    // You can customize this to show notifications in the page
    if (notification.type === 'DOM_OPTIMIZATION') {
      this.showOptimizationFeedback({
        spaceSaved: notification.data.spaceSaved,
        unusedElements: 1
      });
    }
  }

  updateBlockchainStatus(data) {
    // Update blockchain status in the page
    console.log('Blockchain status update:', data);
  }
}

// Initialize the content script
new LightDomContentScript();
