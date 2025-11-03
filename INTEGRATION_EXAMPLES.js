/**
 * Integration Examples for GPU and Headless Chrome Optimization
 * 
 * This file shows how to integrate the GPU detection, adaptive configuration,
 * and performance monitoring utilities into existing LightDom services.
 * 
 * Based on: GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md
 */

// ============================================================================
// EXAMPLE 1: Enhanced Web Crawler with Adaptive Configuration
// ============================================================================

/**
 * Integration with RealWebCrawlerSystem
 * Location: crawler/RealWebCrawlerSystem.js
 */

// Before: Static configuration
const oldCrawlerConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'  // Always disabled
  ]
};

// After: Adaptive configuration with performance monitoring
import { AdaptiveBrowserConfig } from '../utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';

class EnhancedRealWebCrawlerSystem {
  constructor(config = {}) {
    // Initialize adaptive configuration
    this.browserConfig = new AdaptiveBrowserConfig({
      learningRate: config.learningRate || 0.1
    });
    
    // Initialize performance monitoring
    this.perfMonitor = new PerformanceMonitor({
      learningRate: config.learningRate || 0.1
    });
    
    // Original config with adaptive concurrency
    this.config = {
      maxConcurrency: config.maxConcurrency || 5,
      requestDelay: config.requestDelay || 2000,
      ...config
    };
  }

  async initialize() {
    // Initialize adaptive browser config
    await this.browserConfig.initialize();
    
    // Get optimized configuration for web crawling
    const browserLaunchConfig = await this.browserConfig.getConfig({
      task: 'scraping',
      preset: 'scraping'  // Use predefined scraping preset
    });
    
    // Launch browser with optimized config
    this.browser = await puppeteer.launch(browserLaunchConfig.config);
    
    console.log('✅ Crawler initialized with adaptive configuration');
    console.log(`   GPU Enabled: ${browserLaunchConfig.gpuEnabled ? '✅' : '❌'}`);
    console.log(`   Configuration: ${browserLaunchConfig.recommendation}`);
  }

  async crawlPage(url) {
    const startTime = Date.now();
    let error = false;
    
    try {
      const page = await this.browser.newPage();
      
      // Your existing crawl logic here
      await page.goto(url, { waitUntil: 'networkidle0' });
      const content = await page.content();
      
      await page.close();
      
      return content;
    } catch (err) {
      error = true;
      throw err;
    } finally {
      // Record performance metrics
      const responseTime = Date.now() - startTime;
      this.perfMonitor.record('web-crawler', {
        responseTime,
        error,
        concurrency: this.config.maxConcurrency
      });
      
      // Adjust concurrency based on performance
      await this.adjustConcurrency();
    }
  }

  async adjustConcurrency() {
    // Get adaptive recommendation
    const recommendation = this.perfMonitor.getRecommendedConcurrency('web-crawler');
    
    if (recommendation !== this.config.maxConcurrency) {
      console.log(`📊 Adjusting concurrency: ${this.config.maxConcurrency} → ${recommendation}`);
      this.config.maxConcurrency = recommendation;
      
      // Record config change for monitoring
      this.browserConfig.recordPerformance('web-crawler', {
        concurrency: recommendation,
        timestamp: Date.now()
      });
    }
  }

  getPerformanceReport() {
    return this.perfMonitor.getMetricsReport('web-crawler');
  }
}

// ============================================================================
// EXAMPLE 2: Chrome Layers Service with Conditional GPU
// ============================================================================

/**
 * Integration with ChromeLayersService
 * Location: services/chrome-layers-service.js
 */

// Before: Always try to enable GPU
const oldLayersConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--enable-gpu'  // Always try to enable, may fail
  ]
};

// After: Intelligent GPU detection with fallback
import { GPUDetection } from '../utils/GPUDetection.js';

class EnhancedChromeLayersService {
  constructor(options = {}) {
    this.gpuDetection = new GPUDetection();
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 30000,
      ...options
    };
  }

  async initialize() {
    // Detect GPU support first
    const gpuResult = await this.gpuDetection.detectGPUSupport();
    
    console.log('🔍 GPU Detection Results:');
    console.log(`   Supported: ${gpuResult.supported ? '✅' : '❌'}`);
    console.log(`   Hardware Acceleration: ${gpuResult.details.hardwareAcceleration ? '✅' : '❌'}`);
    
    // Get recommended configuration for visualization task
    const configResult = await this.gpuDetection.getRecommendedConfig('visualization', {
      forceGPUCheck: true
    });
    
    console.log(`   Recommendation: ${configResult.recommendation}`);
    
    // Launch with optimal config
    this.browser = await puppeteer.launch(configResult.config);
    
    // Verify GPU is actually working if enabled
    if (configResult.gpuEnabled) {
      const isWorking = await this.verifyGPU();
      if (!isWorking) {
        console.log('⚠️  GPU not working, relaunching with software rendering...');
        await this.browser.close();
        
        // Fallback to software rendering
        const fallbackConfig = await this.gpuDetection.getRecommendedConfig('general');
        this.browser = await puppeteer.launch(fallbackConfig.config);
      }
    }
  }

  async verifyGPU() {
    try {
      const page = await this.browser.newPage();
      await page.goto('chrome://gpu', { timeout: 5000 });
      const content = await page.evaluate(() => document.body.innerText);
      await page.close();
      
      return content.includes('Hardware accelerated') && !content.includes('Software only');
    } catch (error) {
      console.error('GPU verification failed:', error.message);
      return false;
    }
  }

  async analyzeLayersWithMetrics(url) {
    const startTime = Date.now();
    
    try {
      // Your existing layer analysis logic
      const page = await this.browser.newPage();
      await page.goto(url);
      
      // CDP commands for layer extraction
      const client = await page.target().createCDPSession();
      await client.send('LayerTree.enable');
      const layers = await client.send('LayerTree.snapshotCommandLog');
      
      await page.close();
      
      // Record successful metrics
      const responseTime = Date.now() - startTime;
      console.log(`✅ Layer analysis completed in ${responseTime}ms`);
      
      return layers;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Layer analysis failed after ${responseTime}ms:`, error.message);
      throw error;
    }
  }
}

// ============================================================================
// EXAMPLE 3: Adaptive Throttling for High-Volume Operations
// ============================================================================

/**
 * Advanced adaptive throttling system for any service
 */

class AdaptiveServiceWrapper {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.perfMonitor = new PerformanceMonitor({
      learningRate: options.learningRate || 0.1
    });
    this.browserConfig = new AdaptiveBrowserConfig();
    
    // Adaptive parameters
    this.concurrency = options.initialConcurrency || 5;
    this.minConcurrency = options.minConcurrency || 1;
    this.maxConcurrency = options.maxConcurrency || 20;
    this.adjustmentInterval = options.adjustmentInterval || 10000; // 10 seconds
    
    // Start adaptive control
    this.startAdaptiveControl();
  }

  startAdaptiveControl() {
    this.adjustmentTimer = setInterval(() => {
      this.adjustConfiguration();
    }, this.adjustmentInterval);
  }

  async adjustConfiguration() {
    // Get performance report
    const report = this.perfMonitor.getMetricsReport(this.serviceName);
    if (!report) return;

    // Get recommended concurrency
    const recommendedConcurrency = this.perfMonitor.getRecommendedConcurrency(this.serviceName);
    
    if (recommendedConcurrency !== this.concurrency) {
      const oldConcurrency = this.concurrency;
      this.concurrency = Math.max(
        this.minConcurrency,
        Math.min(this.maxConcurrency, recommendedConcurrency)
      );
      
      console.log(`🔧 ${this.serviceName} - Concurrency adjusted: ${oldConcurrency} → ${this.concurrency}`);
      console.log(`   Performance Score: ${report.performanceScore.toFixed(2)}`);
      console.log(`   Error Rate: ${report.stats.errorRate.toFixed(1)}%`);
      console.log(`   Avg Response Time: ${report.stats.avgResponseTime.toFixed(0)}ms`);
    }

    // Adjust learning rate adaptively
    const recommendedLR = this.perfMonitor.getAdaptiveLearningRate(this.serviceName);
    if (Math.abs(recommendedLR - this.perfMonitor.learningRate) > 0.01) {
      console.log(`📈 Learning rate adjusted: ${this.perfMonitor.learningRate.toFixed(3)} → ${recommendedLR.toFixed(3)}`);
      this.perfMonitor.learningRate = recommendedLR;
    }
  }

  async executeTask(taskFn, metadata = {}) {
    const startTime = Date.now();
    let error = false;
    
    try {
      const result = await taskFn();
      return result;
    } catch (err) {
      error = true;
      throw err;
    } finally {
      // Record metrics
      this.perfMonitor.record(this.serviceName, {
        responseTime: Date.now() - startTime,
        error,
        concurrency: this.concurrency,
        ...metadata
      });
    }
  }

  getConcurrency() {
    return this.concurrency;
  }

  getReport() {
    return this.perfMonitor.getMetricsReport(this.serviceName);
  }

  stop() {
    if (this.adjustmentTimer) {
      clearInterval(this.adjustmentTimer);
    }
  }
}

// ============================================================================
// EXAMPLE 4: Migration Guide for Existing Services
// ============================================================================

/**
 * Step-by-step migration guide
 */

const migrationSteps = {
  step1: {
    title: 'Add Utility Imports',
    code: `
// Add to top of your service file
import { AdaptiveBrowserConfig } from '../utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { GPUDetection } from '../utils/GPUDetection.js';
    `
  },

  step2: {
    title: 'Initialize in Constructor',
    code: `
constructor(options = {}) {
  // Add these to your existing constructor
  this.browserConfig = new AdaptiveBrowserConfig();
  this.perfMonitor = new PerformanceMonitor({ learningRate: 0.1 });
  
  // For GPU-intensive tasks only
  if (options.requiresGPU) {
    this.gpuDetection = new GPUDetection();
  }
  
  // Your existing constructor code...
}
    `
  },

  step3: {
    title: 'Update Browser Launch',
    code: `
async initialize() {
  // Replace static config
  // OLD: const config = { headless: true, args: [...] };
  
  // NEW: Get adaptive config
  await this.browserConfig.initialize();
  const configResult = await this.browserConfig.getConfig({
    task: 'scraping',  // or 'visualization', 'screenshot', etc.
    preset: 'scraping'  // optional preset
  });
  
  this.browser = await puppeteer.launch(configResult.config);
  console.log('Browser launched with:', configResult.recommendation);
}
    `
  },

  step4: {
    title: 'Add Performance Tracking',
    code: `
async yourMethod(url) {
  const startTime = Date.now();
  let error = false;
  
  try {
    // Your existing logic
    const result = await this.doWork(url);
    return result;
  } catch (err) {
    error = true;
    throw err;
  } finally {
    // Add performance tracking
    this.perfMonitor.record('your-service-name', {
      responseTime: Date.now() - startTime,
      error,
      concurrency: this.currentConcurrency
    });
  }
}
    `
  },

  step5: {
    title: 'Add Adaptive Concurrency',
    code: `
async adjustConcurrency() {
  const recommended = this.perfMonitor.getRecommendedConcurrency('your-service-name');
  
  if (recommended !== this.currentConcurrency) {
    console.log(\`Adjusting concurrency: \${this.currentConcurrency} → \${recommended}\`);
    this.currentConcurrency = recommended;
  }
}

// Call periodically
setInterval(() => this.adjustConcurrency(), 10000);  // Every 10 seconds
    `
  },

  step6: {
    title: 'Add Monitoring Dashboard',
    code: `
getPerformanceReport() {
  const report = this.perfMonitor.getMetricsReport('your-service-name');
  const global = this.perfMonitor.getGlobalReport();
  
  return {
    service: report,
    global,
    gpu: this.gpuDetection?.getStatus()
  };
}

// Expose via API endpoint
app.get('/api/performance/:service', (req, res) => {
  const report = this.getPerformanceReport();
  res.json(report);
});
    `
  }
};

// ============================================================================
// EXAMPLE 5: Environment-Specific Configurations
// ============================================================================

/**
 * Different configurations for different environments
 */

class EnvironmentAwareService {
  async getBrowserConfig() {
    const browserConfig = new AdaptiveBrowserConfig();
    await browserConfig.initialize();

    // Automatically adapts to environment
    const env = process.env.NODE_ENV;
    
    if (env === 'production') {
      // Production: Stable, high concurrency
      return await browserConfig.getConfig({
        task: 'scraping',
        preset: 'scraping'
      });
    } else if (env === 'development') {
      // Development: More debugging, lower concurrency
      return await browserConfig.getConfig({
        task: 'scraping',
        customArgs: ['--enable-logging', '--v=1']
      });
    } else if (process.env.CI === 'true') {
      // CI/CD: Minimal, no GPU
      return await browserConfig.getConfig({
        preset: 'ci'
      });
    }
    
    // Default
    return await browserConfig.getConfig({ task: 'general' });
  }
}

// ============================================================================
// EXPORT EXAMPLES
// ============================================================================

export {
  EnhancedRealWebCrawlerSystem,
  EnhancedChromeLayersService,
  AdaptiveServiceWrapper,
  migrationSteps,
  EnvironmentAwareService
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Enhanced Crawler
 * 
 * const crawler = new EnhancedRealWebCrawlerSystem({
 *   maxConcurrency: 5,
 *   learningRate: 0.1
 * });
 * await crawler.initialize();
 * await crawler.crawlPage('https://example.com');
 * const report = crawler.getPerformanceReport();
 * console.log(report);
 */

/**
 * Example 2: Chrome Layers with GPU Detection
 * 
 * const layers = new EnhancedChromeLayersService({
 *   headless: true
 * });
 * await layers.initialize();
 * const layerData = await layers.analyzeLayersWithMetrics('https://example.com');
 */

/**
 * Example 3: Wrap Any Existing Service
 * 
 * const wrapper = new AdaptiveServiceWrapper('my-service', {
 *   initialConcurrency: 5,
 *   learningRate: 0.1
 * });
 * 
 * await wrapper.executeTask(async () => {
 *   // Your task here
 *   return await doSomething();
 * });
 * 
 * const report = wrapper.getReport();
 * console.log('Performance:', report.performanceScore);
 * console.log('Recommended concurrency:', wrapper.getConcurrency());
 */
