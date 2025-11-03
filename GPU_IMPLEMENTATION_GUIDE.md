# GPU and Headless Chrome Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions for implementing GPU detection, adaptive configuration, and performance monitoring in LightDom services based on the comprehensive research in [GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md](./GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md).

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Migration Guide](#migration-guide)
3. [Integration Examples](#integration-examples)
4. [Testing & Validation](#testing--validation)
5. [Monitoring & Debugging](#monitoring--debugging)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For New Services

```javascript
import { AdaptiveBrowserConfig } from './utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';
import puppeteer from 'puppeteer';

class MyNewService {
  constructor() {
    this.browserConfig = new AdaptiveBrowserConfig();
    this.perfMonitor = new PerformanceMonitor({ learningRate: 0.1 });
  }

  async initialize() {
    await this.browserConfig.initialize();
    const config = await this.browserConfig.getConfig({ 
      task: 'scraping' 
    });
    this.browser = await puppeteer.launch(config.config);
  }

  async doWork(url) {
    const startTime = Date.now();
    try {
      const page = await this.browser.newPage();
      await page.goto(url);
      const content = await page.content();
      await page.close();
      return content;
    } finally {
      this.perfMonitor.record('my-service', {
        responseTime: Date.now() - startTime,
        error: false
      });
    }
  }
}
```

### For Existing Services

See the detailed [Migration Guide](#migration-guide) below.

---

## 🔄 Migration Guide

### Step 1: Assess Your Service

**Identify your service type:**

| Service Type | GPU Needed? | Best Preset | Example |
|-------------|-------------|-------------|---------|
| Web Scraping | ❌ No | `scraping` | RealWebCrawlerSystem |
| SEO Analysis | ❌ No | `seo` | SEOCrawlerIntegration |
| Screenshots | ⚠️ Maybe | `screenshot` | Screenshot services |
| Visualization | ✅ Yes | `visualization` | ChromeLayersService |
| Video Processing | ✅ Yes | Custom | Video generators |

### Step 2: Add Dependencies

**Add imports to your service file:**

```javascript
// At the top of your file
import { AdaptiveBrowserConfig } from '../utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';

// Only if your service is GPU-intensive
import { GPUDetection } from '../utils/GPUDetection.js';
```

### Step 3: Update Constructor

**Before:**
```javascript
class MyService {
  constructor(config = {}) {
    this.config = config;
    this.browser = null;
  }
}
```

**After:**
```javascript
class MyService {
  constructor(config = {}) {
    this.config = config;
    this.browser = null;
    
    // Add adaptive configuration
    this.browserConfig = new AdaptiveBrowserConfig({
      learningRate: config.learningRate || 0.1
    });
    
    // Add performance monitoring
    this.perfMonitor = new PerformanceMonitor({
      learningRate: config.learningRate || 0.1
    });
    
    // Track concurrency
    this.currentConcurrency = config.maxConcurrency || 5;
  }
}
```

### Step 4: Update Browser Launch

**Before:**
```javascript
async initialize() {
  this.browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });
}
```

**After:**
```javascript
async initialize() {
  // Initialize adaptive config
  await this.browserConfig.initialize();
  
  // Get optimal configuration for your task
  const configResult = await this.browserConfig.getConfig({
    task: 'scraping',  // or 'visualization', 'screenshot', etc.
    preset: 'scraping'  // optional: use predefined preset
  });
  
  // Launch browser
  this.browser = await puppeteer.launch(configResult.config);
  
  // Log configuration used
  console.log(`✅ Browser launched with: ${configResult.recommendation}`);
  console.log(`   GPU: ${configResult.gpuEnabled ? 'Enabled' : 'Disabled'}`);
}
```

### Step 5: Add Performance Tracking

**Wrap your methods with performance tracking:**

```javascript
async crawlPage(url) {
  const startTime = Date.now();
  let error = false;
  
  try {
    // Your existing logic
    const page = await this.browser.newPage();
    await page.goto(url);
    const content = await page.content();
    await page.close();
    return content;
    
  } catch (err) {
    error = true;
    throw err;
    
  } finally {
    // Record performance metrics
    this.perfMonitor.record('my-service', {
      responseTime: Date.now() - startTime,
      error,
      concurrency: this.currentConcurrency,
      url  // Optional metadata
    });
  }
}
```

### Step 6: Implement Adaptive Concurrency

**Add adaptive concurrency adjustment:**

```javascript
async startAdaptiveControl() {
  // Adjust concurrency every 10 seconds
  this.adaptiveInterval = setInterval(() => {
    this.adjustConcurrency();
  }, 10000);
}

async adjustConcurrency() {
  const recommended = this.perfMonitor.getRecommendedConcurrency('my-service');
  
  if (recommended !== this.currentConcurrency) {
    const old = this.currentConcurrency;
    this.currentConcurrency = recommended;
    
    console.log(`📊 Concurrency adjusted: ${old} → ${recommended}`);
    
    // Get performance report
    const report = this.perfMonitor.getMetricsReport('my-service');
    console.log(`   Performance Score: ${report.performanceScore.toFixed(2)}`);
    console.log(`   Error Rate: ${report.stats.errorRate.toFixed(1)}%`);
  }
}

// Call in initialize()
async initialize() {
  // ... existing code ...
  this.startAdaptiveControl();
}

// Clean up on shutdown
async shutdown() {
  if (this.adaptiveInterval) {
    clearInterval(this.adaptiveInterval);
  }
  if (this.browser) {
    await this.browser.close();
  }
}
```

### Step 7: Add Monitoring Endpoints

**Expose performance metrics via API:**

```javascript
getPerformanceMetrics() {
  const serviceReport = this.perfMonitor.getMetricsReport('my-service');
  const globalReport = this.perfMonitor.getGlobalReport();
  const configStatus = this.browserConfig.getStatus();
  
  return {
    service: {
      name: 'my-service',
      ...serviceReport
    },
    global: globalReport,
    configuration: configStatus,
    currentConcurrency: this.currentConcurrency
  };
}

// In your Express app
app.get('/api/performance/my-service', (req, res) => {
  const metrics = myService.getPerformanceMetrics();
  res.json(metrics);
});
```

---

## 💡 Integration Examples

### Example 1: Web Crawler Service

**File:** `crawler/RealWebCrawlerSystem.js`

**Changes:**
1. ✅ Uses `scraping` preset (GPU disabled)
2. ✅ Tracks response times and errors
3. ✅ Adaptive concurrency based on performance
4. ✅ Monitors error rates

**See:** [INTEGRATION_EXAMPLES.js](./INTEGRATION_EXAMPLES.js#L15-L100)

### Example 2: Chrome Layers Service

**File:** `services/chrome-layers-service.js`

**Changes:**
1. ✅ Detects GPU support before launch
2. ✅ Falls back to software rendering if GPU fails
3. ✅ Uses `visualization` preset
4. ✅ Verifies GPU is actually working

**See:** [INTEGRATION_EXAMPLES.js](./INTEGRATION_EXAMPLES.js#L102-L200)

### Example 3: Generic Service Wrapper

**Any service can use the adaptive wrapper:**

```javascript
import { AdaptiveServiceWrapper } from './INTEGRATION_EXAMPLES.js';

// Wrap your existing service
const wrapper = new AdaptiveServiceWrapper('my-service', {
  initialConcurrency: 5,
  learningRate: 0.1,
  minConcurrency: 1,
  maxConcurrency: 20
});

// Execute tasks with automatic performance tracking
await wrapper.executeTask(async () => {
  return await myExistingService.doWork();
});

// Get adaptive recommendations
const concurrency = wrapper.getConcurrency();
const report = wrapper.getReport();
```

---

## 🧪 Testing & Validation

### Unit Tests

**Test configuration generation:**

```javascript
import { AdaptiveBrowserConfig } from './utils/AdaptiveBrowserConfig.js';

describe('AdaptiveBrowserConfig', () => {
  it('should provide scraping preset', () => {
    const config = new AdaptiveBrowserConfig();
    const preset = config.applyPreset('scraping');
    
    expect(preset.args).toContain('--disable-gpu');
    expect(preset.args).toContain('--disable-images');
  });

  it('should detect GPU beneficial tasks', () => {
    const config = new AdaptiveBrowserConfig();
    
    expect(config.isGPUBeneficial('visualization')).toBe(true);
    expect(config.isGPUBeneficial('scraping')).toBe(false);
  });
});
```

### Integration Tests

**Test adaptive behavior:**

```javascript
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';

describe('Adaptive Concurrency', () => {
  it('should increase concurrency when performance is good', () => {
    const monitor = new PerformanceMonitor({ learningRate: 0.1 });
    
    // Record good performance
    for (let i = 0; i < 20; i++) {
      monitor.record('test-service', {
        responseTime: 1000,
        error: false,
        concurrency: 5
      });
    }
    
    const recommended = monitor.getRecommendedConcurrency('test-service');
    expect(recommended).toBeGreaterThan(5);
  });

  it('should decrease concurrency when errors occur', () => {
    const monitor = new PerformanceMonitor({ learningRate: 0.1 });
    
    // Record poor performance
    for (let i = 0; i < 20; i++) {
      monitor.record('test-service', {
        responseTime: 8000,
        error: i % 3 === 0,  // 33% error rate
        concurrency: 10
      });
    }
    
    const recommended = monitor.getRecommendedConcurrency('test-service');
    expect(recommended).toBeLessThan(10);
  });
});
```

### Manual Validation

**Run the simple test:**

```bash
node test-gpu-utilities.js
```

**Expected output:**
- ✅ Configuration presets loaded
- ✅ GPU beneficial tasks identified correctly
- ✅ Performance monitoring records metrics
- ✅ Adaptive concurrency adjusts based on performance

---

## 📊 Monitoring & Debugging

### Performance Dashboard

**Create a simple monitoring endpoint:**

```javascript
app.get('/api/system/performance', (req, res) => {
  const services = ['web-crawler', 'seo-analyzer', 'chrome-layers'];
  
  const metrics = {
    timestamp: Date.now(),
    services: {},
    global: performanceMonitor.getGlobalReport()
  };
  
  for (const service of services) {
    const report = performanceMonitor.getMetricsReport(service);
    if (report) {
      metrics.services[service] = {
        performanceScore: report.performanceScore,
        avgResponseTime: report.stats.avgResponseTime,
        errorRate: report.stats.errorRate,
        concurrency: report.recommendations.concurrency
      };
    }
  }
  
  res.json(metrics);
});
```

### Logging Best Practices

**Add structured logging:**

```javascript
console.log('📊 Performance Update:', {
  service: 'my-service',
  performanceScore: report.performanceScore.toFixed(2),
  avgResponseTime: `${report.stats.avgResponseTime.toFixed(0)}ms`,
  errorRate: `${report.stats.errorRate.toFixed(1)}%`,
  concurrency: {
    current: report.recommendations.concurrency.current,
    recommended: report.recommendations.concurrency.recommended,
    adjustment: report.recommendations.concurrency.adjustment
  },
  learningRate: report.recommendations.learningRate.recommended.toFixed(3)
});
```

### Metrics to Monitor

**Key Performance Indicators:**

| Metric | Target | Action if Outside Range |
|--------|--------|------------------------|
| Performance Score | > 0.7 | Investigate if < 0.5 |
| Avg Response Time | < 3000ms | Reduce concurrency |
| P95 Response Time | < 5000ms | Optimize slow requests |
| Error Rate | < 5% | Reduce concurrency, check logs |
| Success Rate | > 95% | Investigate failures |
| CPU Usage | < 80% | Reduce concurrency |
| Memory Usage | < 85% | Check for leaks |

---

## 🔧 Troubleshooting

### Problem: GPU Not Detected

**Symptoms:**
- GPU detection returns `supported: false`
- Services always use software rendering

**Solutions:**

1. **Check GPU drivers:**
   ```bash
   # Linux
   lspci | grep VGA
   nvidia-smi  # For NVIDIA GPUs
   
   # Check if X11 is running
   echo $DISPLAY
   ```

2. **Verify Chrome can see GPU:**
   ```javascript
   const browser = await puppeteer.launch({ headless: false });
   const page = await browser.newPage();
   await page.goto('chrome://gpu');
   const content = await page.content();
   console.log(content);
   ```

3. **Force software rendering (if GPU problematic):**
   ```javascript
   const config = await browserConfig.getConfig({
     task: 'visualization',
     enableGPU: false  // Force disable
   });
   ```

### Problem: Performance Not Improving

**Symptoms:**
- Concurrency doesn't adjust
- Metrics not changing

**Solutions:**

1. **Check if metrics are being recorded:**
   ```javascript
   const report = perfMonitor.getMetricsReport('my-service');
   console.log('Sample count:', report?.sampleCount || 0);
   ```

2. **Verify adaptive control is running:**
   ```javascript
   // Make sure this is called
   this.startAdaptiveControl();
   ```

3. **Check learning rate:**
   ```javascript
   // May be too low
   const monitor = new PerformanceMonitor({ learningRate: 0.15 });
   ```

### Problem: Too Many Oscillations

**Symptoms:**
- Concurrency keeps changing
- Unstable performance

**Solutions:**

1. **Reduce learning rate:**
   ```javascript
   const monitor = new PerformanceMonitor({ learningRate: 0.05 });
   ```

2. **Increase adjustment interval:**
   ```javascript
   setInterval(() => this.adjustConcurrency(), 30000);  // 30 seconds instead of 10
   ```

3. **Check for external factors:**
   - Network instability
   - Target server rate limiting
   - System resource contention

### Problem: Memory Leaks

**Symptoms:**
- Memory usage grows over time
- Browser instances accumulate

**Solutions:**

1. **Ensure pages are closed:**
   ```javascript
   try {
     const page = await browser.newPage();
     // ... work ...
   } finally {
     await page.close();  // Always close
   }
   ```

2. **Limit browser reuse:**
   ```javascript
   // Restart browser periodically
   if (this.requestCount % 1000 === 0) {
     await this.browser.close();
     await this.initialize();
   }
   ```

3. **Monitor with Node.js profiler:**
   ```bash
   node --inspect gpu-headless-chrome-demo.js
   # Open chrome://inspect in Chrome
   ```

---

## 📚 Additional Resources

- **Research Document:** [GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md](./GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md)
- **Quick Reference:** [GPU_HEADLESS_CHROME_QUICK_REFERENCE.md](./GPU_HEADLESS_CHROME_QUICK_REFERENCE.md)
- **Integration Examples:** [INTEGRATION_EXAMPLES.js](./INTEGRATION_EXAMPLES.js)
- **Utilities:**
  - [GPUDetection.js](./utils/GPUDetection.js)
  - [AdaptiveBrowserConfig.js](./utils/AdaptiveBrowserConfig.js)
  - [PerformanceMonitor.js](./utils/PerformanceMonitor.js)

---

## ✅ Checklist for Implementation

- [ ] Choose appropriate preset for your service
- [ ] Add utility imports
- [ ] Update constructor with adaptive components
- [ ] Replace static browser config
- [ ] Add performance tracking to methods
- [ ] Implement adaptive concurrency
- [ ] Add monitoring endpoints
- [ ] Write tests
- [ ] Validate in staging environment
- [ ] Monitor in production
- [ ] Document service-specific tuning

---

**Last Updated:** November 3, 2025
