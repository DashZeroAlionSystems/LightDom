/**
 * Puppeteer Worker Process
 * Handles web scraping, screenshots, and browser automation tasks
 * Runs in separate process for isolation and performance
 */

const puppeteer = require('puppeteer');

const WORKER_ID = process.env.WORKER_ID || '0';
let browser = null;
let currentPage = null;

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
 * Initialize browser instance
 */
async function initBrowser() {
  if (browser) return browser;

  log.info('Initializing browser...');

  try {
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    browser.on('disconnected', () => {
      log.info('Browser disconnected, will reinitialize on next task');
      browser = null;
    });

    log.info('Browser initialized');
    return browser;
  } catch (error) {
    log.error('Failed to initialize browser:', error);
    throw error;
  }
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
