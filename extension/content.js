// LightDom Content Script v2.0
(function() {
  'use strict';
  
  let hasAnalyzed = false;
  let isMining = false;
  let miningObserver = null;
  let analysisInterval = null;
  
  // Initialize content script
  async function init() {
    console.log('LightDom Content Script v2.0 loaded');
    
    // Check mining status from background script
    await checkMiningStatus();
    
    // Setup message listener for mining status changes
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message, sender, sendResponse);
    });
    
    // Initial DOM analysis
    if (!hasAnalyzed) {
      await analyzeDOM();
    }
  }
  
  async function checkMiningStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_MINING_STATUS' });
      if (response.success) {
        isMining = response.data.isMining;
        console.log('LightDom mining status:', isMining);
        
        if (isMining) {
          startAdvancedMining();
        }
      }
    } catch (error) {
      console.error('Failed to check mining status:', error);
    }
  }
  
  function handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'MINING_STATUS_CHANGE':
        isMining = message.data.isMining;
        if (isMining) {
          startAdvancedMining();
        } else {
          stopAdvancedMining();
        }
        sendResponse({ success: true });
        break;
        
      case 'ANALYZE_DOM_REQUEST':
        analyzeDOM().then(result => {
          sendResponse({ success: true, data: result });
        });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }
  
  function startAdvancedMining() {
    if (!isMining) return;
    
    console.log('LightDom: Starting advanced mining mode');
    
    // Start DOM mutation observer for real-time analysis
    startDOMMutationObserver();
    
    // Start periodic analysis
    startPeriodicAnalysis();
    
    // Inject mining UI
    injectMiningUI();
  }
  
  function stopAdvancedMining() {
    console.log('LightDom: Stopping advanced mining mode');
    
    // Stop DOM mutation observer
    stopDOMMutationObserver();
    
    // Stop periodic analysis
    stopPeriodicAnalysis();
    
    // Remove mining UI
    removeMiningUI();
  }
  
  function startDOMMutationObserver() {
    if (miningObserver) return;
    
    miningObserver = new MutationObserver((mutations) => {
      if (!isMining) return;
      
      // Analyze significant mutations
      const significantMutations = mutations.filter(mutation => {
        return isSignificantMutation(mutation);
      });
      
      if (significantMutations.length > 0) {
        // Debounce analysis to avoid excessive processing
        clearTimeout(analysisTimeout);
        analysisTimeout = setTimeout(() => {
          if (isMining) {
            analyzeDOM();
          }
        }, 1000);
      }
    });
    
    miningObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true
    });
  }
  
  function stopDOMMutationObserver() {
    if (miningObserver) {
      miningObserver.disconnect();
      miningObserver = null;
    }
  }
  
  function isSignificantMutation(mutation) {
    // Check if mutation represents significant DOM change
    if (mutation.type === 'childList') {
      return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
    }
    
    if (mutation.type === 'attributes') {
      return ['class', 'style', 'id'].includes(mutation.attributeName);
    }
    
    return false;
  }
  
  function startPeriodicAnalysis() {
    if (analysisInterval) return;
    
    // Analyze DOM every 30 seconds when mining
    analysisInterval = setInterval(() => {
      if (isMining) {
        analyzeDOM();
      }
    }, 30000);
  }
  
  function stopPeriodicAnalysis() {
    if (analysisInterval) {
      clearInterval(analysisInterval);
      analysisInterval = null;
    }
  }
  
  async function analyzeDOM() {
    if (hasAnalyzed && !isMining) return;
    
    console.log('LightDom: Analyzing DOM for optimization opportunities...');
    
    try {
      // Get DOM metrics
      const domMetrics = getDOMMetrics();
      
      // Find optimization opportunities
      const opportunities = await findOptimizationOpportunities();
      
      // Calculate potential savings
      const potentialSavings = opportunities.reduce((total, opt) => total + opt.savings, 0);
      
      if (potentialSavings > 0 || hasAnalyzed) {
        const analysisData = {
          url: window.location.href,
          timestamp: Date.now(),
          potentialSavings: potentialSavings,
          optimizations: opportunities,
          domMetrics: domMetrics
        };
        
        // Send to background script
        chrome.runtime.sendMessage({
          type: 'DOM_OPTIMIZATION',
          data: analysisData
        });
        
        console.log(`LightDom: Found ${potentialSavings} bytes of potential savings`);
        hasAnalyzed = true;
      }
      
      return analysisData;
    } catch (error) {
      console.error('DOM analysis failed:', error);
      return null;
    }
  }
  
  function getDOMMetrics() {
    const elements = document.querySelectorAll('*');
    const textNodes = countTextNodes();
    const attributes = countAttributes();
    const styles = countStyles();
    
    return {
      totalElements: elements.length,
      totalTextNodes: textNodes,
      totalAttributes: attributes,
      totalStyles: styles,
      domDepth: calculateDOMDepth(),
      scriptCount: document.querySelectorAll('script').length,
      styleCount: document.querySelectorAll('style, link[rel="stylesheet"]').length,
      imageCount: document.querySelectorAll('img').length,
      linkCount: document.querySelectorAll('a').length
    };
  }
  
  function countTextNodes() {
    let count = 0;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) {
        count++;
      }
    }
    
    return count;
  }
  
  function countAttributes() {
    let count = 0;
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      count += element.attributes.length;
    });
    return count;
  }
  
  function countStyles() {
    let count = 0;
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
      if (style.textContent) {
        count += style.textContent.length;
      }
    });
    return count;
  }
  
  function calculateDOMDepth() {
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
  
  async function findOptimizationOpportunities() {
    const opportunities = [];
    
    // Find hidden elements
    const hiddenElements = findHiddenElements();
    if (hiddenElements.length > 0) {
      opportunities.push({
        type: 'hidden_elements',
        description: 'Hidden elements found',
        savings: hiddenElements.reduce((total, el) => total + (el.outerHTML?.length || 0), 0),
        count: hiddenElements.length,
        details: hiddenElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        }))
      });
    }
    
    // Find empty elements
    const emptyElements = findEmptyElements();
    if (emptyElements.length > 0) {
      opportunities.push({
        type: 'empty_elements',
        description: 'Empty elements found',
        savings: emptyElements.reduce((total, el) => total + (el.outerHTML?.length || 0), 0),
        count: emptyElements.length,
        details: emptyElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        }))
      });
    }
    
    // Find duplicate elements
    const duplicates = findDuplicateElements();
    if (duplicates.length > 0) {
      opportunities.push({
        type: 'duplicate_elements',
        description: 'Duplicate elements found',
        savings: duplicates.reduce((total, dup) => total + dup.savings, 0),
        count: duplicates.length,
        details: duplicates
      });
    }
    
    // Find unused CSS
    const unusedCSS = await findUnusedCSS();
    if (unusedCSS.length > 0) {
      opportunities.push({
        type: 'unused_css',
        description: 'Unused CSS rules found',
        savings: unusedCSS.reduce((total, rule) => total + rule.length, 0),
        count: unusedCSS.length,
        details: unusedCSS
      });
    }
    
    return opportunities;
  }
  
  function findHiddenElements() {
    const hidden = [];
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        hidden.push(el);
      }
    });
    
    return hidden;
  }
  
  function findEmptyElements() {
    const empty = [];
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      if (!el.textContent?.trim() && !el.children.length && !el.querySelector('img, video, canvas')) {
        empty.push(el);
      }
    });
    
    return empty;
  }
  
  function findDuplicateElements() {
    const elementMap = new Map();
    const duplicates = [];
    
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const key = getElementKey(element);
      if (elementMap.has(key)) {
        const existing = duplicates.find(d => d.key === key);
        if (existing) {
          existing.count++;
          existing.savings += estimateElementSize(element);
        } else {
          duplicates.push({
            key: key,
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            count: 2,
            savings: estimateElementSize(element) * 2
          });
        }
      } else {
        elementMap.set(key, 1);
      }
    });
    
    return duplicates;
  }
  
  function getElementKey(element) {
    return `${element.tagName}-${element.className}-${element.id}`;
  }
  
  function estimateElementSize(element) {
    return (element.outerHTML || '').length;
  }
  
  async function findUnusedCSS() {
    const unusedRules = [];
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    
    for (let style of styles) {
      if (style.textContent) {
        const rules = parseCSSRules(style.textContent);
        for (let rule of rules) {
          if (!isCSSRuleUsed(rule)) {
            unusedRules.push(rule);
          }
        }
      }
    }
    
    return unusedRules;
  }
  
  function parseCSSRules(css) {
    const rules = [];
    const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(css)) !== null) {
      rules.push({
        selector: match[1].trim(),
        declarations: match[2].trim(),
        full: match[0],
        length: match[0].length
      });
    }
    
    return rules;
  }
  
  function isCSSRuleUsed(rule) {
    try {
      const elements = document.querySelectorAll(rule.selector);
      return elements.length > 0;
    } catch (error) {
      return false; // Invalid selector
    }
  }
  
  function injectMiningUI() {
    // Remove existing UI if any
    removeMiningUI();
    
    // Create mining status indicator
    const ui = document.createElement('div');
    ui.id = 'lightdom-mining-ui';
    ui.style.cssText = `
      position: fixed;
      top: 20px;
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
      animation: slideInRight 0.3s ease-out;
    `;
    
    ui.innerHTML = `
      <div style="color: #00ff88; font-weight: bold; margin-bottom: 8px;">⚡ LightDom Mining</div>
      <div id="lightdom-mining-stats">
        <div>Status: Active</div>
        <div>URL: ${window.location.hostname}</div>
      </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(ui);
  }
  
  function removeMiningUI() {
    const ui = document.getElementById('lightdom-mining-ui');
    if (ui) {
      ui.remove();
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopAdvancedMining();
  });
  
})();
