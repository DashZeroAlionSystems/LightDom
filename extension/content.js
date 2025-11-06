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
        
      case 'ITEM_PURCHASED':
        console.log('Item purchased notification received:', message.data);
        showItemPurchaseNotification(message.data);
        sendResponse({ success: true });
        break;
        
      case 'CHAT_ROOM_ITEM_ADDED':
        console.log('Chat room item added:', message.data);
        renderChatRoomItem(message.data);
        sendResponse({ success: true });
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
  
  // Show item purchase notification in the page
  function showItemPurchaseNotification(data) {
    const { item } = data;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div style="font-size: 24px;">🎉</div>
        <div>
          <div style="font-weight: bold; font-size: 16px;">Item Purchased!</div>
          <div style="font-size: 14px; opacity: 0.9;">${item.name}</div>
        </div>
      </div>
      <div style="font-size: 13px; opacity: 0.8; margin-bottom: 12px;">
        ${item.description}
      </div>
      <button id="lightdom-add-to-chat" style="
        width: 100%;
        padding: 8px 16px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">
        Add to Current Page
      </button>
    `;
    
    document.body.appendChild(notification);
    
    // Add click handler for adding to chat
    const addButton = notification.querySelector('#lightdom-add-to-chat');
    if (addButton) {
      addButton.addEventListener('click', () => {
        const chatRoomId = window.location.href;
        chrome.runtime.sendMessage({
          type: 'ADD_ITEM_TO_CHAT',
          data: { itemId: item.id, chatRoomId }
        }).then(() => {
          addButton.textContent = '✓ Added!';
          addButton.style.background = '#10B981';
          addButton.style.color = 'white';
          setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
          }, 2000);
        });
      });
    }
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }
  
  // Render metaverse item in the chat room
  function renderChatRoomItem(data) {
    const { chatRoomId, item } = data;
    
    // Only render if this is the correct chat room
    if (window.location.href !== chatRoomId) return;
    
    console.log('Rendering item in chat room:', item.name);
    
    // Create item container
    const itemContainer = document.createElement('div');
    itemContainer.className = 'lightdom-metaverse-item';
    itemContainer.style.cssText = `
      position: fixed;
      z-index: 999998;
      pointer-events: auto;
      animation: fadeIn 0.5s ease-out;
    `;
    
    // Position based on item category
    const positions = {
      furniture: { bottom: '20px', left: '20px' },
      decoration: { top: '20px', right: '20px' },
      effect: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      avatar: { bottom: '20px', right: '20px' },
      background: { top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none' }
    };
    
    const position = positions[item.category] || positions.decoration;
    Object.assign(itemContainer.style, position);
    
    // Render based on item type
    if (item.category === 'background') {
      itemContainer.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
      itemContainer.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: backgroundMove 20s linear infinite;
        "></div>
      `;
    } else {
      itemContainer.innerHTML = `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 150px;
        ">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${item.name}
          </div>
          <div style="font-size: 11px; color: #6B7280;">
            ${item.category}
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(itemContainer);
    
    // Add styles for animations if not already added
    if (!document.getElementById('lightdom-item-styles')) {
      const style = document.createElement('style');
      style.id = 'lightdom-item-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes backgroundMove {
          from { background-position: 0 0; }
          to { background-position: 50px 50px; }
        }
      `;
      document.head.appendChild(style);
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
