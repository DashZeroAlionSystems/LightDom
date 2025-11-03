# GPU and Headless Chrome Quick Reference

Quick reference guide for GPU acceleration and headless Chrome optimization in LightDom.

## 🎯 Quick Decision Tree

### Should I enable GPU?

```
Is your task graphics-intensive?
├─ NO → Use --disable-gpu (default) ✅
└─ YES → Do you have GPU hardware?
    ├─ NO → Use --disable-gpu ✅
    └─ YES → Is GPU verified working?
        ├─ NO → Use --disable-gpu ✅
        └─ YES → Enable GPU with fallback ⚠️
```

### Graphics-Intensive Tasks
- ✅ WebGL/WebGPU rendering
- ✅ 3D visualizations
- ✅ Chrome Layers analysis
- ✅ Video processing
- ✅ Canvas animations
- ❌ Web scraping
- ❌ SEO analysis
- ❌ Text extraction

## 🚀 Quick Start

### 1. Detect GPU Support

```javascript
import { detectGPU } from './utils/GPUDetection.js';

const gpuResult = await detectGPU();
console.log('GPU Supported:', gpuResult.supported);
```

### 2. Get Optimal Configuration

```javascript
import { getBrowserConfig } from './utils/AdaptiveBrowserConfig.js';

// For web scraping
const config = await getBrowserConfig({ task: 'scraping' });

// For visualization
const config = await getBrowserConfig({ 
  task: 'visualization', 
  enableGPU: true 
});
```

### 3. Monitor Performance

```javascript
import { recordMetric, getServiceReport } from './utils/PerformanceMonitor.js';

// Record performance
recordMetric('my-crawler', {
  responseTime: 2500,
  error: false,
  concurrency: 5
});

// Get recommendations
const report = getServiceReport('my-crawler');
console.log('Recommended concurrency:', report.recommendations.concurrency.recommended);
```

## 📋 Configuration Presets

### Scraping (Default)
```javascript
const config = await getBrowserConfig({ preset: 'scraping' });
// Fast, minimal resources, no images
```

### Screenshot
```javascript
const config = await getBrowserConfig({ preset: 'screenshot' });
// High quality, conditional GPU
```

### SEO Analysis
```javascript
const config = await getBrowserConfig({ preset: 'seo' });
// Optimized for content extraction
```

### Visualization
```javascript
const config = await getBrowserConfig({ preset: 'visualization' });
// GPU-enabled if available
```

### CI/CD
```javascript
const config = await getBrowserConfig({ preset: 'ci' });
// Minimal, stable, no GPU
```

## 🎛️ Chrome Flags Reference

### Stability Flags (Always Use)
```javascript
const args = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
];
```

### GPU Disabled (Default)
```javascript
const args = [
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-accelerated-2d-canvas'
];
```

### GPU Enabled (Conditional)
```javascript
const args = [
  '--use-gl=desktop',
  '--enable-gpu-rasterization',
  '--enable-webgl',
  '--ignore-gpu-blocklist'
];
```

### Performance Optimizations
```javascript
const args = [
  '--disable-extensions',
  '--disable-plugins',
  '--disable-background-timer-throttling',
  '--memory-pressure-off',
  '--max_old_space_size=4096'
];
```

## 📊 Learning Rate Guidelines

### Default Values by Environment

| Environment | Learning Rate | Concurrency | GPU |
|------------|---------------|-------------|-----|
| Development | 0.1 (adaptive) | 3-5 | Auto-detect |
| CI/CD | 0.05 (stable) | 1-3 | Disabled |
| Production | 0.1 (adaptive) | 5-20 | Auto-detect |
| GPU Server | 0.15 (responsive) | 3-10 | Enabled* |

*Only if verified working

### Adaptive Throttling Pattern

```javascript
class AdaptiveSystem {
  async adjust(metrics) {
    const score = this.calculateScore(metrics);
    
    if (score > 0.8 && metrics.cpuUsage < 70) {
      // Increase concurrency
      this.concurrency += Math.ceil(this.lr * this.concurrency);
    } else if (score < 0.5 || metrics.cpuUsage > 85) {
      // Decrease concurrency
      this.concurrency -= Math.ceil(this.lr * this.concurrency);
    }
    
    // Adjust learning rate based on stability
    if (this.isStable()) {
      this.lr = Math.min(0.2, this.lr * 1.05);
    } else {
      this.lr = Math.max(0.05, this.lr * 0.95);
    }
  }
}
```

## 🔍 Performance Monitoring

### Metrics to Track

```javascript
const metrics = {
  // Response metrics
  avgResponseTime: 0,    // Target: <3000ms
  p95ResponseTime: 0,    // Target: <5000ms
  p99ResponseTime: 0,    // Target: <10000ms
  
  // Quality metrics
  successRate: 0,        // Target: >95%
  errorRate: 0,          // Target: <5%
  
  // Resource metrics
  cpuUsage: 0,           // Target: <80%
  memoryUsage: 0,        // Target: <85%
  
  // Adaptive metrics
  currentConcurrency: 0,
  learningRate: 0.1
};
```

### Performance Scoring

```javascript
function calculateScore(metrics) {
  const speedScore = 1 - (metrics.avgResponseTime / 10000);
  const reliabilityScore = 1 - (metrics.errorRate / 100);
  const cpuScore = 1 - (metrics.cpuUsage / 100);
  const memoryScore = 1 - (metrics.memoryUsage / 100);
  
  return (
    speedScore * 0.35 +
    reliabilityScore * 0.35 +
    cpuScore * 0.15 +
    memoryScore * 0.15
  );
}
```

## 🛠️ Troubleshooting

### GPU Not Working?

1. **Check Detection**
   ```javascript
   const result = await detectGPU();
   console.log(result.details);
   ```

2. **Verify Environment**
   - Linux: Need X11 display server
   - Docker: Need GPU passthrough
   - Check GPU drivers installed

3. **Fallback to Software**
   ```javascript
   const config = await getBrowserConfig({
     task: 'visualization',
     enableGPU: false  // Force software rendering
   });
   ```

### Performance Issues?

1. **Check Metrics**
   ```javascript
   const report = getServiceReport('my-service');
   console.log('Performance score:', report.performanceScore);
   ```

2. **Adjust Concurrency**
   - High error rate → Decrease concurrency
   - Slow response → Check system resources
   - Low throughput → Increase concurrency

3. **Tune Learning Rate**
   - Oscillating → Decrease learning rate (0.05)
   - Slow adaptation → Increase learning rate (0.15)
   - Stable → Let it adapt automatically

### Browser Crashes?

1. **Add Memory Limits**
   ```javascript
   args: ['--max_old_space_size=4096']
   ```

2. **Disable GPU**
   ```javascript
   args: ['--disable-gpu']
   ```

3. **Reduce Concurrency**
   ```javascript
   maxConcurrency: 3  // Start small
   ```

## 📚 Resources

- **Full Research**: [GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md](./GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md)
- **Demo**: [gpu-headless-chrome-demo.js](./gpu-headless-chrome-demo.js)
- **Utilities**:
  - [GPUDetection.js](./utils/GPUDetection.js)
  - [AdaptiveBrowserConfig.js](./utils/AdaptiveBrowserConfig.js)
  - [PerformanceMonitor.js](./utils/PerformanceMonitor.js)

## 🎯 Current LightDom Usage

### Files Using --disable-gpu (19)
- Most services correctly use `--disable-gpu` for stability
- Recommended to keep this as default

### Files Using --enable-gpu (2)
- `services/chrome-layers-service.js` - Graphics visualization ✅
- `services/enhanced-data-mining-worker.js` - Data visualization ✅

Both are appropriate use cases for GPU acceleration.

## ✅ Recommendations

1. **Keep --disable-gpu as default** ✅
2. **Add GPU detection to visualization services** 🔄
3. **Implement adaptive throttling** 🔄
4. **Add performance monitoring** 🔄
5. **Create environment-specific configs** 🔄

---

**Last Updated**: November 2, 2025
