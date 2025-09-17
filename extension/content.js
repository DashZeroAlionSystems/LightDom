// LightDom Content Script
(function() {
  'use strict';
  
  let hasAnalyzed = false;
  
  function analyzeDOM() {
    if (hasAnalyzed) return;
    hasAnalyzed = true;
    
    console.log('LightDom: Analyzing DOM for optimization opportunities...');
    
    // Basic DOM analysis
    const elements = document.querySelectorAll('*');
    let hiddenElements = 0;
    let emptyElements = 0;
    let unusedClasses = 0;
    let spaceSaved = 0;
    
    elements.forEach(el => {
      // Check for hidden elements
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        hiddenElements++;
        spaceSaved += el.outerHTML?.length || 0;
      }
      
      // Check for empty elements
      if (!el.textContent?.trim() && !el.children.length) {
        emptyElements++;
        spaceSaved += el.outerHTML?.length || 0;
      }
    });
    
    // Estimate space saved (simplified calculation)
    spaceSaved = Math.floor(spaceSaved * 0.1); // Conservative estimate
    
    if (spaceSaved > 0) {
      // Send optimization data to background script
      chrome.runtime.sendMessage({
        type: 'DOM_OPTIMIZATION',
        data: {
          url: window.location.href,
          spaceSaved: spaceSaved,
          optimizations: {
            hiddenElements,
            emptyElements,
            unusedClasses
          },
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`LightDom: Found ${spaceSaved} bytes of potential savings`);
    }
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzeDOM);
  } else {
    setTimeout(analyzeDOM, 1000);
  }
})();
