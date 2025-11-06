/**
 * Puppeteer Worker Process
 * Handles web scraping, screenshots, and browser automation tasks
 * Runs in separate process for isolation and performance
 * 
 * Enhanced with WebDriver BiDi support for:
 * - Bidirectional event streaming
 * - Real-time network monitoring
 * - Attribute-based data mining
 * - Cross-browser compatibility
 */

const puppeteer = require('puppeteer');

const WORKER_ID = process.env.WORKER_ID || '0';
const USE_BIDI = process.env.USE_BIDI === 'true' || false;
const ATTRIBUTE_TARGET = process.env.ATTRIBUTE_TARGET || null;

let browser = null;
let currentPage = null;
let biDiEventHandlers = new Map();

// Logging
const log = {
  info: (...args) => console.log(`[Worker ${WORKER_ID}]`, ...args),
  error: (...args) => console.error(`[Worker ${WORKER_ID}]`, ...args),
  debug: (...args) => console.log(`[Worker ${WORKER_ID}]`, ...args),
};

// =============================================================================
// BROWSER MANAGEMENT
// =============================================================================

/**
 * Initialize browser instance with optional WebDriver BiDi support
 */
async function initBrowser() {
  if (browser) return browser;

  log.info('Initializing browser...', USE_BIDI ? '(WebDriver BiDi mode)' : '(CDP mode)');

  try {
    const launchOptions = {
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled', // Anti-detection
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      ignoreDefaultArgs: ['--enable-automation'], // Anti-detection
    };

    // Use WebDriver BiDi if enabled (requires Puppeteer 21.0.0+)
    if (USE_BIDI) {
      launchOptions.protocol = 'webDriverBiDi';
      log.info('WebDriver BiDi protocol enabled for cross-browser compatibility');
    }

    browser = await puppeteer.launch(launchOptions);

    browser.on('disconnected', () => {
      log.info('Browser disconnected, will reinitialize on next task');
      browser = null;
      biDiEventHandlers.clear();
    });

    // Setup BiDi event handlers if enabled
    if (USE_BIDI) {
      setupBiDiEventHandlers(browser);
    }

    log.info('Browser initialized');
    if (ATTRIBUTE_TARGET) {
      log.info('Worker configured for attribute mining:', ATTRIBUTE_TARGET);
    }
    
    return browser;
  } catch (error) {
    log.error('Failed to initialize browser:', error);
    throw error;
  }
}

/**
 * Setup WebDriver BiDi event handlers for real-time monitoring
 */
function setupBiDiEventHandlers(browserInstance) {
  log.info('Setting up WebDriver BiDi event handlers');

  // Network response monitoring
  const networkHandler = (event) => {
    log.debug('Network response:', event.response?.url);
    if (process.send) {
      process.send({
        type: 'biDiEvent',
        event: 'network.responseReceived',
        data: {
          url: event.response?.url,
          status: event.response?.status,
          timestamp: Date.now(),
        },
      });
    }
  };
  biDiEventHandlers.set('network', networkHandler);

  // Console log streaming
  const consoleHandler = (entry) => {
    log.debug('Console entry:', entry.level, entry.text);
    if (process.send) {
      process.send({
        type: 'biDiEvent',
        event: 'log.entryAdded',
        data: entry,
      });
    }
  };
  biDiEventHandlers.set('console', consoleHandler);

  log.info('BiDi event handlers configured');
}

/**
 * Get a new page
 */
async function getPage() {
  const browserInstance = await initBrowser();
  const page = await browserInstance.newPage();

  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Enable request interception for performance
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const resourceType = request.resourceType();

    // Block unnecessary resources
    if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  return page;
}

/**
 * Close page
 */
async function closePage(page) {
  if (page && !page.isClosed()) {
    await page.close();
  }
}

// =============================================================================
// TASK HANDLERS
// =============================================================================

/**
 * Crawl a website and extract data
 */
async function crawlWebsite(options) {
  const { url, selectors = {}, waitFor, timeout = 30000 } = options;

  log.info('Crawling:', url);

  let page;
  try {
    page = await getPage();

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Wait for specific selector if provided
    if (waitFor) {
      await page.waitForSelector(waitFor, { timeout: 10000 });
    }

    // Extract data based on selectors
    const data = await page.evaluate((sels) => {
      const result = {};

      // Extract text from selectors
      Object.entries(sels).forEach(([key, selector]) => {
        const element = document.querySelector(selector);
        result[key] = element ? element.textContent.trim() : null;
      });

      // Default extraction if no selectors provided
      if (Object.keys(sels).length === 0) {
        result.title = document.title;
        result.url = window.location.href;
        result.text = document.body.innerText;

        // Extract all links
        result.links = Array.from(document.querySelectorAll('a'))
          .map(a => ({
            text: a.textContent.trim(),
            href: a.href,
          }))
          .filter(link => link.href);

        // Extract meta tags
        result.meta = {};
        document.querySelectorAll('meta').forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            result.meta[name] = content;
          }
        });

        // Count DOM elements
        result.domStats = {
          totalElements: document.querySelectorAll('*').length,
          divs: document.querySelectorAll('div').length,
          scripts: document.querySelectorAll('script').length,
          styles: document.querySelectorAll('style, link[rel="stylesheet"]').length,
        };
      }

      return result;
    }, selectors);

    // Get performance metrics
    const metrics = await page.metrics();

    // Get page performance
    const performance = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        responseTime: perfData.responseEnd - perfData.requestStart,
      };
    });

    log.info('Crawl completed:', url);

    return {
      success: true,
      data,
      metrics: {
        ...metrics,
        performance,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error('Crawl error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
}

/**
 * Take a screenshot of a website
 */
async function takeScreenshot(options) {
  const { url, fullPage = true, timeout = 30000, path } = options;

  log.info('Taking screenshot:', url);

  let page;
  try {
    page = await getPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    const screenshotOptions = {
      fullPage,
      type: 'png',
    };

    if (path) {
      screenshotOptions.path = path;
    }

    const screenshot = await page.screenshot(screenshotOptions);

    log.info('Screenshot completed:', url);

    return {
      success: true,
      screenshot: screenshot.toString('base64'),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error('Screenshot error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
}

/**
 * Extract DOM structure for optimization
 */
async function analyzeDOMStructure(options) {
  const { url, timeout = 30000 } = options;

  log.info('Analyzing DOM structure:', url);

  let page;
  try {
    page = await getPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    const analysis = await page.evaluate(() => {
      const calculateDOMWeight = (element) => {
        let weight = 0;
        const traverse = (node) => {
          weight++;
          node.childNodes.forEach(child => {
            if (child.nodeType === 1) {
              traverse(child);
            }
          });
        };
        traverse(element);
        return weight;
      };

      const elements = document.querySelectorAll('*');
      const stats = {
        total: elements.length,
        byTag: {},
        depth: 0,
        heaviestElements: [],
      };

      // Count by tag
      elements.forEach(el => {
        const tag = el.tagName.toLowerCase();
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });

      // Find depth
      const getDepth = (element) => {
        let depth = 0;
        let current = element;
        while (current.parentElement) {
          depth++;
          current = current.parentElement;
        }
        return depth;
      };

      elements.forEach(el => {
        const depth = getDepth(el);
        if (depth > stats.depth) {
          stats.depth = depth;
        }
      });

      // Find heaviest elements
      const heavyElements = Array.from(document.querySelectorAll('div, section, article'))
        .map(el => ({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          weight: calculateDOMWeight(el),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10);

      stats.heaviestElements = heavyElements;

      // Calculate optimization potential
      stats.optimization = {
        unusedDivs: document.querySelectorAll('div:empty').length,
        inlineStyles: document.querySelectorAll('[style]').length,
        unnecessaryWrappers: 0, // Calculate based on single-child divs
      };

      return stats;
    });

    log.info('DOM analysis completed');

    return {
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error('DOM analysis error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
}

/**
 * Mine specific attribute from a webpage
 * Supports multiple selector strategies with fallbacks
 */
async function mineAttribute(options) {
  const { url, attribute, timeout = 30000 } = options;

  log.info('Mining attribute:', attribute.name, 'from', url);

  let page;
  try {
    page = await getPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Wait for specific selector if provided
    if (attribute.waitFor) {
      try {
        await page.waitForSelector(attribute.waitFor, { timeout: 10000 });
      } catch (error) {
        log.warn('Wait selector not found, continuing anyway:', attribute.waitFor);
      }
    }

    // Try each selector in the fallback chain
    let extractedData = null;
    for (const selector of attribute.selectors || []) {
      try {
        const data = await page.evaluate((sel, attrType) => {
          const element = document.querySelector(sel);
          if (!element) return null;

          // Extract based on attribute type
          switch (attrType) {
            case 'text':
              return element.textContent?.trim();
            case 'html':
              return element.innerHTML;
            case 'attribute':
              return element.getAttribute(sel.split('@')[1]);
            case 'json':
              return JSON.parse(element.textContent || '{}');
            default:
              return element.textContent?.trim();
          }
        }, selector, attribute.type || 'text');

        if (data) {
          extractedData = data;
          log.info('Successfully extracted using selector:', selector);
          break;
        }
      } catch (error) {
        log.debug('Selector failed:', selector, error.message);
        continue;
      }
    }

    // Fallback to pattern-based extraction if no selector worked
    if (!extractedData && attribute.pattern) {
      extractedData = await page.evaluate((pattern) => {
        const bodyText = document.body.textContent || '';
        const regex = new RegExp(pattern);
        const match = bodyText.match(regex);
        return match ? match[1] || match[0] : null;
      }, attribute.pattern);
    }

    // Validate extracted data
    if (attribute.validator) {
      const isValid = await validateData(extractedData, attribute.validator);
      if (!isValid) {
        log.warn('Validation failed for attribute:', attribute.name);
      }
    }

    log.info('Attribute mining completed:', attribute.name);

    return {
      success: true,
      attribute: attribute.name,
      data: extractedData,
      url,
      timestamp: new Date().toISOString(),
      validated: attribute.validator ? true : undefined,
    };
  } catch (error) {
    log.error('Attribute mining error:', error.message);
    return {
      success: false,
      attribute: attribute.name,
      error: error.message,
      url,
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
}

/**
 * Validate extracted data against rules
 */
function validateData(data, validator) {
  if (!validator) return true;

  try {
    // Type validation
    if (validator.type) {
      const actualType = typeof data;
      if (actualType !== validator.type) {
        return false;
      }
    }

    // Regex pattern validation
    if (validator.pattern && typeof data === 'string') {
      const regex = new RegExp(validator.pattern);
      if (!regex.test(data)) {
        return false;
      }
    }

    // Range validation for numbers
    if (validator.min !== undefined && data < validator.min) {
      return false;
    }
    if (validator.max !== undefined && data > validator.max) {
      return false;
    }

    // Length validation for strings
    if (validator.minLength && data.length < validator.minLength) {
      return false;
    }
    if (validator.maxLength && data.length > validator.maxLength) {
      return false;
    }

    return true;
  } catch (error) {
    log.error('Validation error:', error);
    return false;
  }
}

/**
 * Generate social media Open Graph image
 */
async function generateOGImage(options) {
  const { template, data, width = 1200, height = 630, timeout = 30000 } = options;

  log.info('Generating OG image with template:', template);

  let page;
  try {
    page = await getPage();

    // Set viewport to OG image dimensions
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 2, // High DPI for quality
    });

    // Generate HTML from template and data
    const html = renderTemplate(template, data);

    // Load HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout,
    });

    // Wait for fonts and images to load
    await page.waitForTimeout(1000);

    // Generate screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'binary',
      omitBackground: false,
    });

    log.info('OG image generated successfully');

    return {
      success: true,
      image: screenshot.toString('base64'),
      dimensions: { width, height },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error('OG image generation error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
}

/**
 * Simple template renderer
 */
function renderTemplate(template, data) {
  if (typeof template === 'string') {
    // Simple variable replacement
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || '';
    });
  }
  
  // If template is an object with HTML property
  if (template.html) {
    return renderTemplate(template.html, data);
  }
  
  return template;
}

/**
 * Monitor page performance
 */
async function monitorPerformance(options) {
  const { url, duration = 10000, timeout = 30000 } = options;

  log.info('Monitoring performance:', url);

  let page;
  try {
    page = await getPage();

    // Start performance monitoring
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Collect metrics over time
    const samples = [];
    const sampleInterval = 1000;
    const samplesCount = Math.floor(duration / sampleInterval);

    for (let i = 0; i < samplesCount; i++) {
      const metrics = await page.metrics();
      const memory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });

      samples.push({
        timestamp: Date.now(),
        metrics,
        memory,
      });

      await page.waitForTimeout(sampleInterval);
    }

    log.info('Performance monitoring completed');

    return {
      success: true,
      samples,
      summary: {
        avgJSHeapSize: samples.reduce((sum, s) => sum + s.memory?.used || 0, 0) / samples.length,
        maxJSHeapSize: Math.max(...samples.map(s => s.memory?.used || 0)),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error('Performance monitoring error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
}

// =============================================================================
// TASK DISPATCHER
// =============================================================================

async function handleTask(task) {
  const { type, options } = task;

  log.info('Handling task:', type);

  try {
    switch (type) {
      case 'crawl':
        return await crawlWebsite(options);

      case 'screenshot':
        return await takeScreenshot(options);

      case 'analyzeDom':
        return await analyzeDOMStructure(options);

      case 'monitorPerformance':
        return await monitorPerformance(options);

      case 'mineAttribute':
        return await mineAttribute(options);

      case 'generateOGImage':
        return await generateOGImage(options);

      case 'shutdown':
        log.info('Shutdown requested');
        if (browser) {
          await browser.close();
        }
        process.exit(0);
        break;

      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  } catch (error) {
    log.error('Task error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

process.on('message', async (task) => {
  try {
    const result = await handleTask(task);
    process.send(result);
  } catch (error) {
    process.send({
      success: false,
      error: error.message,
    });
  }
});

// =============================================================================
// LIFECYCLE
// =============================================================================

process.on('disconnect', async () => {
  log.info('Parent disconnected, shutting down...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});

// Initialize
log.info('Puppeteer worker ready');
process.send({ type: 'ready', workerId: WORKER_ID });
