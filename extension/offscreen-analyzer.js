/**
 * LightDom Offscreen DOM Analyzer
 * Heavy DOM analysis performed in offscreen document to avoid blocking main thread
 */

class LightDomOffscreenAnalyzer {
  constructor() {
    this.isAnalyzing = false;
    this.currentAnalysis = null;
    this.analysisQueue = [];
    this.performanceMetrics = {
      totalAnalyses: 0,
      averageAnalysisTime: 0,
      totalSpaceSaved: 0
    };
    
    this.init();
  }

  async init() {
    // Listen for messages from the main extension
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Load performance metrics
    await this.loadPerformanceMetrics();
    
    console.log('LightDom Offscreen Analyzer initialized');
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'ANALYZE_DOM':
        const result = await this.analyzeDOM(message.data);
        sendResponse({ success: true, result });
        break;
        
      case 'BATCH_ANALYZE':
        const batchResult = await this.batchAnalyze(message.data);
        sendResponse({ success: true, result: batchResult });
        break;
        
      case 'GET_PERFORMANCE_METRICS':
        sendResponse({ success: true, metrics: this.performanceMetrics });
        break;
        
      case 'CLEAR_ANALYSIS_CACHE':
        this.clearAnalysisCache();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async analyzeDOM(domData) {
    if (this.isAnalyzing) {
      // Queue the analysis if one is already running
      return new Promise((resolve) => {
        this.analysisQueue.push({ domData, resolve });
      });
    }

    this.isAnalyzing = true;
    const startTime = performance.now();
    
    try {
      this.updateStatus('Analyzing DOM structure...', 10);
      
      const analysis = await this.performComprehensiveAnalysis(domData);
      
      this.updateStatus('Processing optimization opportunities...', 50);
      const optimizations = await this.findOptimizationOpportunities(analysis);
      
      this.updateStatus('Calculating performance impact...', 80);
      const performanceImpact = await this.calculatePerformanceImpact(analysis, optimizations);
      
      this.updateStatus('Generating recommendations...', 95);
      const recommendations = await this.generateRecommendations(optimizations, performanceImpact);
      
      const result = {
        analysis,
        optimizations,
        performanceImpact,
        recommendations,
        timestamp: Date.now(),
        analysisTime: performance.now() - startTime
      };
      
      this.updateStatus('Analysis complete!', 100);
      this.updatePerformanceMetrics(result.analysisTime, result.performanceImpact.spaceSaved);
      this.displayResults(result);
      
      // Process next item in queue
      this.processQueue();
      
      return result;
      
    } catch (error) {
      console.error('DOM analysis failed:', error);
      this.updateStatus('Analysis failed: ' + error.message, 0);
      this.isAnalyzing = false;
      throw error;
    }
  }

  async performComprehensiveAnalysis(domData) {
    const analysis = {
      totalElements: 0,
      elementTypes: {},
      unusedElements: [],
      redundantStyles: [],
      duplicateScripts: [],
      performanceIssues: [],
      accessibilityIssues: [],
      seoIssues: [],
      domComplexity: 0,
      estimatedSize: 0
    };

    // Parse DOM data (this would come from the content script)
    if (domData.html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(domData.html, 'text/html');
      
      analysis.totalElements = doc.querySelectorAll('*').length;
      analysis.estimatedSize = domData.html.length;
      
      // Analyze element types
      doc.querySelectorAll('*').forEach(element => {
        const tagName = element.tagName.toLowerCase();
        analysis.elementTypes[tagName] = (analysis.elementTypes[tagName] || 0) + 1;
      });
      
      // Find unused elements
      analysis.unusedElements = this.findUnusedElements(doc);
      
      // Find redundant styles
      analysis.redundantStyles = this.findRedundantStyles(doc);
      
      // Find duplicate scripts
      analysis.duplicateScripts = this.findDuplicateScripts(doc);
      
      // Calculate DOM complexity
      analysis.domComplexity = this.calculateDOMComplexity(doc);
    }

    return analysis;
  }

  findUnusedElements(doc) {
    const unusedElements = [];
    
    doc.querySelectorAll('*').forEach(element => {
      if (this.isElementUnused(element)) {
        unusedElements.push({
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          estimatedSize: this.estimateElementSize(element),
          reason: this.getUnusedReason(element)
        });
      }
    });
    
    return unusedElements;
  }

  isElementUnused(element) {
    // Check if element is hidden
    const style = window.getComputedStyle ? window.getComputedStyle(element) : element.style;
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
    
    // Check if element has zero dimensions
    if (element.offsetWidth === 0 && element.offsetHeight === 0) {
      return true;
    }
    
    // Check if element is empty and has no meaningful content
    if (!element.textContent.trim() && element.children.length === 0) {
      return true;
    }
    
    // Check for elements that are likely decorative or unused
    if (element.tagName === 'DIV' && !element.className && !element.id && !element.textContent.trim()) {
      return true;
    }
    
    return false;
  }

  getUnusedReason(element) {
    const style = window.getComputedStyle ? window.getComputedStyle(element) : element.style;
    
    if (style.display === 'none') return 'Hidden with display:none';
    if (style.visibility === 'hidden') return 'Hidden with visibility:hidden';
    if (element.offsetWidth === 0 && element.offsetHeight === 0) return 'Zero dimensions';
    if (!element.textContent.trim() && element.children.length === 0) return 'Empty element';
    
    return 'Likely unused';
  }

  findRedundantStyles(doc) {
    const redundantStyles = [];
    const styleSheets = [];
    
    // Collect all style sheets
    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
      if (style.tagName === 'STYLE') {
        styleSheets.push({
          type: 'inline',
          content: style.textContent,
          element: style
        });
      } else if (style.href) {
        styleSheets.push({
          type: 'external',
          href: style.href,
          element: style
        });
      }
    });
    
    // Find duplicate CSS rules
    const cssRules = new Map();
    styleSheets.forEach(styleSheet => {
      if (styleSheet.type === 'inline' && styleSheet.content) {
        const rules = this.parseCSSRules(styleSheet.content);
        rules.forEach(rule => {
          const normalizedRule = this.normalizeCSSRule(rule);
          if (cssRules.has(normalizedRule)) {
            redundantStyles.push({
              type: 'duplicate_rule',
              rule: rule,
              occurrences: cssRules.get(normalizedRule) + 1,
              estimatedSize: rule.length
            });
            cssRules.set(normalizedRule, cssRules.get(normalizedRule) + 1);
          } else {
            cssRules.set(normalizedRule, 1);
          }
        });
      }
    });
    
    return redundantStyles;
  }

  findDuplicateScripts(doc) {
    const duplicateScripts = [];
    const scriptSources = new Map();
    
    doc.querySelectorAll('script[src]').forEach(script => {
      if (scriptSources.has(script.src)) {
        duplicateScripts.push({
          src: script.src,
          occurrences: scriptSources.get(script.src) + 1,
          estimatedSize: this.estimateScriptSize(script)
        });
        scriptSources.set(script.src, scriptSources.get(script.src) + 1);
      } else {
        scriptSources.set(script.src, 1);
      }
    });
    
    return duplicateScripts;
  }

  calculateDOMComplexity(doc) {
    let complexity = 0;
    
    // Base complexity from total elements
    complexity += doc.querySelectorAll('*').length * 1;
    
    // Add complexity for nested structures
    const maxDepth = this.getMaxDepth(doc.body);
    complexity += maxDepth * 10;
    
    // Add complexity for inline styles
    const inlineStyles = doc.querySelectorAll('[style]').length;
    complexity += inlineStyles * 2;
    
    // Add complexity for event handlers
    const elementsWithEvents = doc.querySelectorAll('[onclick], [onload], [onchange]').length;
    complexity += elementsWithEvents * 3;
    
    return complexity;
  }

  getMaxDepth(element, currentDepth = 0) {
    if (!element.children || element.children.length === 0) {
      return currentDepth;
    }
    
    let maxDepth = currentDepth;
    for (const child of element.children) {
      const childDepth = this.getMaxDepth(child, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    
    return maxDepth;
  }

  async findOptimizationOpportunities(analysis) {
    const opportunities = [];
    
    // Unused element removal opportunities
    analysis.unusedElements.forEach(element => {
      opportunities.push({
        type: 'remove_unused_element',
        priority: 'high',
        estimatedSpaceSaved: element.estimatedSize,
        description: `Remove unused ${element.tagName} element`,
        details: element
      });
    });
    
    // Redundant style removal opportunities
    analysis.redundantStyles.forEach(style => {
      opportunities.push({
        type: 'remove_redundant_style',
        priority: 'medium',
        estimatedSpaceSaved: style.estimatedSize,
        description: 'Remove duplicate CSS rule',
        details: style
      });
    });
    
    // Duplicate script removal opportunities
    analysis.duplicateScripts.forEach(script => {
      opportunities.push({
        type: 'remove_duplicate_script',
        priority: 'high',
        estimatedSpaceSaved: script.estimatedSize,
        description: `Remove duplicate script: ${script.src}`,
        details: script
      });
    });
    
    return opportunities;
  }

  async calculatePerformanceImpact(analysis, optimizations) {
    const totalSpaceSaved = optimizations.reduce((sum, opt) => sum + opt.estimatedSpaceSaved, 0);
    const loadTimeImprovement = this.calculateLoadTimeImprovement(analysis, totalSpaceSaved);
    const renderTimeImprovement = this.calculateRenderTimeImprovement(analysis, optimizations);
    
    return {
      totalSpaceSaved,
      loadTimeImprovement,
      renderTimeImprovement,
      domComplexityReduction: this.calculateComplexityReduction(optimizations),
      estimatedPerformanceGain: loadTimeImprovement + renderTimeImprovement
    };
  }

  calculateLoadTimeImprovement(analysis, spaceSaved) {
    // Estimate load time improvement based on space saved
    const currentSize = analysis.estimatedSize;
    const sizeReduction = (spaceSaved / currentSize) * 100;
    
    // Assume 10ms improvement per 1% size reduction
    return sizeReduction * 10;
  }

  calculateRenderTimeImprovement(analysis, optimizations) {
    // Estimate render time improvement based on DOM complexity reduction
    const complexityReduction = this.calculateComplexityReduction(optimizations);
    
    // Assume 5ms improvement per 100 complexity points reduced
    return (complexityReduction / 100) * 5;
  }

  calculateComplexityReduction(optimizations) {
    let reduction = 0;
    
    optimizations.forEach(opt => {
      if (opt.type === 'remove_unused_element') {
        reduction += 10; // Base reduction for removing element
      } else if (opt.type === 'remove_redundant_style') {
        reduction += 5; // Smaller reduction for style optimization
      } else if (opt.type === 'remove_duplicate_script') {
        reduction += 15; // Higher reduction for script removal
      }
    });
    
    return reduction;
  }

  async generateRecommendations(optimizations, performanceImpact) {
    const recommendations = [];
    
    // High priority recommendations
    const highPriorityOpts = optimizations.filter(opt => opt.priority === 'high');
    if (highPriorityOpts.length > 0) {
      recommendations.push({
        type: 'high_priority',
        title: 'High Priority Optimizations',
        description: `Remove ${highPriorityOpts.length} high-impact elements to save ${this.formatBytes(highPriorityOpts.reduce((sum, opt) => sum + opt.estimatedSpaceSaved, 0))}`,
        optimizations: highPriorityOpts
      });
    }
    
    // Performance recommendations
    if (performanceImpact.estimatedPerformanceGain > 50) {
      recommendations.push({
        type: 'performance',
        title: 'Significant Performance Gains Available',
        description: `Optimizations could improve load time by ${performanceImpact.loadTimeImprovement.toFixed(1)}ms and render time by ${performanceImpact.renderTimeImprovement.toFixed(1)}ms`,
        impact: performanceImpact
      });
    }
    
    // General recommendations
    if (optimizations.length > 10) {
      recommendations.push({
        type: 'general',
        title: 'Multiple Optimization Opportunities',
        description: `Found ${optimizations.length} optimization opportunities. Consider implementing automated optimization rules.`,
        count: optimizations.length
      });
    }
    
    return recommendations;
  }

  updateStatus(message, progress) {
    document.getElementById('statusText').textContent = message;
    document.getElementById('progressFill').style.width = progress + '%';
  }

  displayResults(result) {
    const resultsContainer = document.getElementById('analysisResults');
    const resultsContent = document.getElementById('resultsContent');
    
    resultsContent.innerHTML = `
      <div class="metric">
        <span class="metric-label">Total Elements</span>
        <span class="metric-value">${result.analysis.totalElements}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Unused Elements</span>
        <span class="metric-value">${result.analysis.unusedElements.length}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Redundant Styles</span>
        <span class="metric-value">${result.analysis.redundantStyles.length}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Duplicate Scripts</span>
        <span class="metric-value">${result.analysis.duplicateScripts.length}</span>
      </div>
      <div class="metric">
        <span class="metric-label">DOM Complexity</span>
        <span class="metric-value">${result.analysis.domComplexity}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Space Saved</span>
        <span class="metric-value">${this.formatBytes(result.performanceImpact.totalSpaceSaved)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Analysis Time</span>
        <span class="metric-value">${result.analysisTime.toFixed(1)}ms</span>
      </div>
      
      <h4>Top Optimizations</h4>
      ${result.optimizations.slice(0, 5).map(opt => `
        <div class="optimization-item">
          <div class="optimization-type">${opt.description}</div>
          <div class="optimization-details">
            Priority: ${opt.priority} • Space saved: ${this.formatBytes(opt.estimatedSpaceSaved)}
          </div>
        </div>
      `).join('')}
    `;
    
    resultsContainer.style.display = 'block';
  }

  updatePerformanceMetrics(analysisTime, spaceSaved) {
    this.performanceMetrics.totalAnalyses++;
    this.performanceMetrics.totalSpaceSaved += spaceSaved;
    
    // Update average analysis time
    this.performanceMetrics.averageAnalysisTime = 
      (this.performanceMetrics.averageAnalysisTime * (this.performanceMetrics.totalAnalyses - 1) + analysisTime) / 
      this.performanceMetrics.totalAnalyses;
  }

  async loadPerformanceMetrics() {
    try {
      const result = await chrome.storage.session.get(['performanceMetrics']);
      if (result.performanceMetrics) {
        this.performanceMetrics = { ...this.performanceMetrics, ...result.performanceMetrics };
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  async savePerformanceMetrics() {
    try {
      await chrome.storage.session.set({ performanceMetrics: this.performanceMetrics });
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  processQueue() {
    if (this.analysisQueue.length > 0 && !this.isAnalyzing) {
      const { domData, resolve } = this.analysisQueue.shift();
      this.analyzeDOM(domData).then(resolve);
    } else {
      this.isAnalyzing = false;
    }
  }

  clearAnalysisCache() {
    // Clear any cached analysis data
    this.analysisQueue = [];
    this.currentAnalysis = null;
  }

  // Utility methods
  parseCSSRules(css) {
    // Simple CSS rule parser
    const rules = [];
    const ruleRegex = /([^{}]+)\s*\{([^{}]+)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(css)) !== null) {
      rules.push({
        selector: match[1].trim(),
        properties: match[2].trim(),
        full: match[0]
      });
    }
    
    return rules;
  }

  normalizeCSSRule(rule) {
    // Normalize CSS rule for comparison
    return rule.selector.toLowerCase().replace(/\s+/g, ' ').trim() + '|' + 
           rule.properties.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  estimateElementSize(element) {
    // Rough estimation of element size
    if (element.outerHTML) {
      return element.outerHTML.length * 2; // Approximate bytes
    }
    return 100; // Default estimate
  }

  estimateScriptSize(script) {
    // Estimate script size
    return script.src.length + 200; // Rough estimate
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// Initialize the analyzer
new LightDomOffscreenAnalyzer();
