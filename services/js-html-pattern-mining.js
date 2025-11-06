/**
 * JS/HTML Pattern Mining Service
 * 
 * Detects and mines:
 * - Function triggers and event handlers
 * - Observer patterns (MutationObserver, IntersectionObserver, etc.)
 * - 3D DOM layer analysis
 * - Background layer activity
 * - Event delegation patterns
 * - Component lifecycle hooks
 */

import puppeteer from 'puppeteer';
import { EventEmitter } from 'events';

class JSHTMLPatternMiningService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      headless: config.headless !== false,
      timeout: config.timeout || 30000,
      waitForNetworkIdle: config.waitForNetworkIdle !== false,
      enableJavaScript: config.enableJavaScript !== false,
      captureConsole: config.captureConsole !== false,
      ...config
    };

    this.browser = null;
    this.patterns = {
      functionTriggers: [],
      observers: [],
      eventDelegation: [],
      lifecycleHooks: [],
      backgroundLayers: []
    };
  }

  /**
   * Initialize browser
   */
  async initialize() {
    console.log('🚀 Initializing JS/HTML Pattern Mining Service...');
    
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-features=NetworkService',
        '--enable-gpu'
      ]
    });
    
    console.log('✅ Browser initialized');
  }

  /**
   * Mine patterns from URL
   */
  async minePatterns(url, options = {}) {
    console.log(`🔍 Mining patterns from: ${url}`);

    const page = await this.browser.newPage();
    
    try {
      // Enable console capture
      if (this.config.captureConsole) {
        page.on('console', msg => {
          console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`);
        });
      }

      // Navigate to page
      await page.goto(url, {
        waitUntil: this.config.waitForNetworkIdle ? 'networkidle2' : 'domcontentloaded',
        timeout: this.config.timeout
      });

      // Wait for page to settle
      await page.waitForTimeout(2000);

      // Inject pattern detection script
      const patterns = await page.evaluate(() => {
        const detectedPatterns = {
          functionTriggers: [],
          observers: [],
          eventDelegation: [],
          lifecycleHooks: [],
          backgroundLayers: [],
          dom3DInfo: {
            compositedLayers: [],
            paintLayers: [],
            transformLayers: []
          }
        };

        // 1. Detect function triggers and event handlers
        const detectFunctionTriggers = () => {
          const triggers = [];
          const elements = document.querySelectorAll('*');
          
          elements.forEach((el, index) => {
            // Check for inline event handlers
            const attributes = el.attributes;
            for (let i = 0; i < attributes.length; i++) {
              const attr = attributes[i];
              if (attr.name.startsWith('on')) {
                triggers.push({
                  type: 'inline-handler',
                  event: attr.name.substring(2),
                  element: el.tagName,
                  selector: el.id ? `#${el.id}` : `.${el.className}`,
                  code: attr.value.substring(0, 100)
                });
              }
            }
            
            // Check for event listeners (approximation via getEventListeners if available)
            try {
              if (window.getEventListeners) {
                const listeners = window.getEventListeners(el);
                Object.keys(listeners).forEach(eventType => {
                  listeners[eventType].forEach(listener => {
                    triggers.push({
                      type: 'event-listener',
                      event: eventType,
                      element: el.tagName,
                      selector: el.id ? `#${el.id}` : `.${el.className}`,
                      useCapture: listener.useCapture,
                      passive: listener.passive
                    });
                  });
                });
              }
            } catch (e) {
              // getEventListeners not available
            }
          });
          
          return triggers;
        };

        // 2. Detect Observer patterns
        const detectObservers = () => {
          const observers = [];
          
          // Look for MutationObserver usage in scripts
          const scripts = Array.from(document.scripts);
          scripts.forEach((script, index) => {
            const content = script.textContent || script.innerHTML;
            
            // MutationObserver
            if (content.includes('MutationObserver')) {
              const matches = content.match(/new\s+MutationObserver\s*\(/g);
              if (matches) {
                observers.push({
                  type: 'MutationObserver',
                  count: matches.length,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            }
            
            // IntersectionObserver
            if (content.includes('IntersectionObserver')) {
              const matches = content.match(/new\s+IntersectionObserver\s*\(/g);
              if (matches) {
                observers.push({
                  type: 'IntersectionObserver',
                  count: matches.length,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            }
            
            // ResizeObserver
            if (content.includes('ResizeObserver')) {
              const matches = content.match(/new\s+ResizeObserver\s*\(/g);
              if (matches) {
                observers.push({
                  type: 'ResizeObserver',
                  count: matches.length,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            }
            
            // PerformanceObserver
            if (content.includes('PerformanceObserver')) {
              const matches = content.match(/new\s+PerformanceObserver\s*\(/g);
              if (matches) {
                observers.push({
                  type: 'PerformanceObserver',
                  count: matches.length,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            }
          });
          
          return observers;
        };

        // 3. Detect event delegation patterns
        const detectEventDelegation = () => {
          const delegation = [];
          const scripts = Array.from(document.scripts);
          
          scripts.forEach((script, index) => {
            const content = script.textContent || script.innerHTML;
            
            // Common delegation patterns
            const patterns = [
              /addEventListener\s*\(['"](.*?)['"]\s*,\s*function.*?event\.target/g,
              /on\s*\(\s*['"](.*?)['"]\s*,\s*['"](.*?)['"]/g, // jQuery-style
              /delegate\s*\(/g
            ];
            
            patterns.forEach(pattern => {
              const matches = content.match(pattern);
              if (matches) {
                delegation.push({
                  pattern: pattern.source,
                  count: matches.length,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            });
          });
          
          return delegation;
        };

        // 4. Detect lifecycle hooks (React, Vue, Angular)
        const detectLifecycleHooks = () => {
          const hooks = [];
          const scripts = Array.from(document.scripts);
          
          scripts.forEach((script, index) => {
            const content = script.textContent || script.innerHTML;
            
            // React hooks
            const reactHooks = [
              'useState', 'useEffect', 'useContext', 'useReducer',
              'useCallback', 'useMemo', 'useRef', 'useLayoutEffect',
              'componentDidMount', 'componentWillUnmount', 'componentDidUpdate'
            ];
            
            reactHooks.forEach(hook => {
              if (content.includes(hook)) {
                hooks.push({
                  framework: 'React',
                  hook,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            });
            
            // Vue lifecycle
            const vueHooks = [
              'created', 'mounted', 'updated', 'destroyed',
              'beforeCreate', 'beforeMount', 'beforeUpdate', 'beforeDestroy'
            ];
            
            vueHooks.forEach(hook => {
              const regex = new RegExp(`${hook}\\s*:\\s*function|${hook}\\s*\\(`, 'g');
              if (regex.test(content)) {
                hooks.push({
                  framework: 'Vue',
                  hook,
                  scriptIndex: index,
                  scriptSrc: script.src || 'inline'
                });
              }
            });
            
            // Angular lifecycle
            if (content.includes('ngOnInit') || content.includes('ngOnDestroy')) {
              hooks.push({
                framework: 'Angular',
                hook: 'lifecycle-detected',
                scriptIndex: index,
                scriptSrc: script.src || 'inline'
              });
            }
          });
          
          return hooks;
        };

        // 5. Detect background layers and 3D transforms
        const detect3DLayers = () => {
          const layerInfo = {
            compositedLayers: [],
            paintLayers: [],
            transformLayers: []
          };
          
          const elements = document.querySelectorAll('*');
          
          elements.forEach((el, index) => {
            const styles = window.getComputedStyle(el);
            
            // Check for 3D transforms
            if (styles.transform && styles.transform !== 'none') {
              const hasTransform3d = styles.transform.includes('matrix3d') || 
                                    styles.transform.includes('translate3d') ||
                                    styles.transform.includes('rotate3d');
              
              if (hasTransform3d) {
                layerInfo.transformLayers.push({
                  element: el.tagName,
                  selector: el.id ? `#${el.id}` : `.${el.className}`,
                  transform: styles.transform.substring(0, 100),
                  willChange: styles.willChange
                });
              }
            }
            
            // Check for compositing triggers
            const compositingTriggers = [
              styles.transform !== 'none',
              styles.opacity !== '1',
              styles.willChange !== 'auto',
              styles.position === 'fixed',
              styles.position === 'sticky',
              styles.filter !== 'none'
            ];
            
            if (compositingTriggers.some(trigger => trigger)) {
              layerInfo.compositedLayers.push({
                element: el.tagName,
                selector: el.id ? `#${el.id}` : `.${el.className}`,
                triggers: {
                  transform: styles.transform !== 'none',
                  opacity: styles.opacity !== '1',
                  willChange: styles.willChange !== 'auto',
                  fixedPosition: styles.position === 'fixed',
                  filter: styles.filter !== 'none'
                }
              });
            }
            
            // Check for paint layers (elements with background, borders, etc.)
            if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                styles.backgroundImage !== 'none' ||
                styles.borderWidth !== '0px') {
              layerInfo.paintLayers.push({
                element: el.tagName,
                selector: el.id ? `#${el.id}` : `.${el.className}`,
                hasBg: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
                hasBgImage: styles.backgroundImage !== 'none',
                hasBorder: styles.borderWidth !== '0px'
              });
            }
          });
          
          return layerInfo;
        };

        // Execute all detections
        detectedPatterns.functionTriggers = detectFunctionTriggers();
        detectedPatterns.observers = detectObservers();
        detectedPatterns.eventDelegation = detectEventDelegation();
        detectedPatterns.lifecycleHooks = detectLifecycleHooks();
        detectedPatterns.dom3DInfo = detect3DLayers();

        return detectedPatterns;
      });

      // Enhance with Chrome DevTools Protocol data
      const cdpSession = await page.target().createCDPSession();
      
      // Get layer tree information
      try {
        await cdpSession.send('LayerTree.enable');
        const layerTree = await cdpSession.send('LayerTree.snapshotLayerTree');
        patterns.backgroundLayers = this.parseLayerTree(layerTree);
      } catch (error) {
        console.warn('Could not get layer tree:', error.message);
      }

      console.log(`✅ Pattern mining complete`);
      console.log(`   Function Triggers: ${patterns.functionTriggers.length}`);
      console.log(`   Observers: ${patterns.observers.length}`);
      console.log(`   Event Delegation: ${patterns.eventDelegation.length}`);
      console.log(`   Lifecycle Hooks: ${patterns.lifecycleHooks.length}`);
      console.log(`   3D Layers: ${patterns.dom3DInfo.compositedLayers.length}`);

      this.patterns = patterns;
      this.emit('patternsDetected', { url, patterns });

      return {
        url,
        timestamp: new Date().toISOString(),
        patterns
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Parse layer tree from CDP
   */
  parseLayerTree(layerTree) {
    // This would parse the actual layer tree structure
    // For now, return a simplified version
    return layerTree || [];
  }

  /**
   * Generate Puppeteer workflow for pattern detection
   */
  generatePuppeteerWorkflow(url, options = {}) {
    return {
      id: `pattern-workflow-${Date.now()}`,
      name: 'Pattern Detection Workflow',
      description: `Detect JS/HTML patterns for ${url}`,
      steps: [
        {
          action: 'navigate',
          url: url,
          waitUntil: 'networkidle2'
        },
        {
          action: 'inject-script',
          script: 'pattern-detector.js'
        },
        {
          action: 'evaluate',
          function: 'detectAllPatterns'
        },
        {
          action: 'screenshot',
          fullPage: true,
          path: `patterns-${Date.now()}.png`
        },
        {
          action: 'extract-data',
          selectors: options.selectors || []
        }
      ],
      output: {
        patterns: true,
        screenshot: true,
        data: true
      }
    };
  }

  /**
   * Create headless API worker workflow
   */
  createHeadlessWorkerWorkflow(tasks) {
    return {
      id: `headless-worker-${Date.now()}`,
      name: 'Headless Browser Worker',
      description: 'Parallel headless browser task execution',
      workers: tasks.map((task, index) => ({
        id: `worker-${index}`,
        task: task,
        browser: {
          headless: true,
          args: ['--no-sandbox', '--disable-gpu']
        }
      })),
      coordination: {
        type: 'parallel',
        maxConcurrency: 5,
        shareContext: false
      }
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }

  /**
   * Get pattern summary
   */
  getPatternSummary() {
    return {
      totalFunctionTriggers: this.patterns.functionTriggers.length,
      totalObservers: this.patterns.observers.length,
      totalEventDelegation: this.patterns.eventDelegation.length,
      totalLifecycleHooks: this.patterns.lifecycleHooks.length,
      total3DLayers: this.patterns.dom3DInfo?.compositedLayers?.length || 0,
      frameworks: [...new Set(this.patterns.lifecycleHooks.map(h => h.framework))]
    };
  }
}

export default JSHTMLPatternMiningService;
export { JSHTMLPatternMiningService };
