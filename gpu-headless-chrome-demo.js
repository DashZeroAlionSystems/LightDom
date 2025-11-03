/**
 * GPU and Headless Chrome Learning Rate Demo
 * 
 * This demo showcases how to use the GPU detection, adaptive configuration,
 * and performance monitoring utilities for optimal headless Chrome performance.
 * 
 * Based on research from GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md
 */

import puppeteer from 'puppeteer';
import { GPUDetection } from './utils/GPUDetection.js';
import { AdaptiveBrowserConfig } from './utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';

class HeadlessChromeDemo {
  constructor() {
    this.gpuDetection = new GPUDetection();
    this.browserConfig = new AdaptiveBrowserConfig();
    this.perfMonitor = new PerformanceMonitor({ learningRate: 0.1 });
  }

  async run() {
    console.log('🚀 GPU and Headless Chrome Learning Rate Demo\n');
    console.log('=' .repeat(60));

    // Step 1: Detect GPU Support
    await this.demoGPUDetection();

    console.log('\n' + '='.repeat(60));

    // Step 2: Show Adaptive Configuration
    await this.demoAdaptiveConfiguration();

    console.log('\n' + '='.repeat(60));

    // Step 3: Demonstrate Performance Monitoring
    await this.demoPerformanceMonitoring();

    console.log('\n' + '='.repeat(60));

    // Step 4: Show Adaptive Throttling
    await this.demoAdaptiveThrottling();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Demo Complete!\n');
  }

  /**
   * Demo 1: GPU Detection
   */
  async demoGPUDetection() {
    console.log('\n📍 DEMO 1: GPU Detection\n');

    console.log('Detecting GPU support in headless Chrome...');
    const gpuResult = await this.gpuDetection.detectGPUSupport();

    console.log('\nGPU Detection Results:');
    console.log(`  Supported: ${gpuResult.supported ? '✅ Yes' : '❌ No'}`);
    console.log(`  Hardware Acceleration: ${gpuResult.details.hardwareAcceleration ? '✅' : '❌'}`);
    console.log(`  GPU Process: ${gpuResult.details.gpuProcess ? '✅' : '❌'}`);
    console.log(`  OpenGL Enabled: ${gpuResult.details.openGLEnabled ? '✅' : '❌'}`);
    console.log(`  WebGL Enabled: ${gpuResult.details.webGLEnabled ? '✅' : '❌'}`);
    console.log(`  SwiftShader (Software): ${gpuResult.details.swiftShader ? '⚠️ Yes' : '✅ No'}`);

    // Test different task types
    console.log('\nGPU Beneficial for Tasks:');
    const tasks = ['scraping', 'visualization', 'screenshot', 'seo', 'video'];
    tasks.forEach(task => {
      const beneficial = this.gpuDetection.isGPUBeneficial(task);
      console.log(`  ${task}: ${beneficial ? '✅ Yes' : '❌ No'}`);
    });
  }

  /**
   * Demo 2: Adaptive Configuration
   */
  async demoAdaptiveConfiguration() {
    console.log('\n📍 DEMO 2: Adaptive Browser Configuration\n');

    await this.browserConfig.initialize();

    // Show different configurations
    const tasks = [
      { task: 'scraping', enableGPU: false },
      { task: 'visualization', enableGPU: true },
      { task: 'screenshot', enableGPU: false }
    ];

    for (const taskConfig of tasks) {
      console.log(`\nConfiguration for: ${taskConfig.task} (GPU: ${taskConfig.enableGPU ? 'enabled' : 'disabled'})`);
      const config = await this.browserConfig.getConfig(taskConfig);
      
      console.log(`  Headless Mode: ${config.headless}`);
      console.log(`  GPU Enabled: ${config.metadata.gpuEnabled ? '✅' : '❌'}`);
      console.log(`  Viewport: ${config.defaultViewport.width}x${config.defaultViewport.height}`);
      console.log(`  Args Count: ${config.args.length}`);
      console.log(`  Key Args: ${this.getKeyArgs(config.args).join(', ')}`);
    }

    // Show presets
    console.log('\n\nAvailable Presets:');
    const presets = this.browserConfig.getAvailablePresets();
    presets.forEach(preset => {
      console.log(`  • ${preset.name}: ${preset.description}`);
    });
  }

  /**
   * Demo 3: Performance Monitoring
   */
  async demoPerformanceMonitoring() {
    console.log('\n📍 DEMO 3: Performance Monitoring with Learning Rate\n');

    // Simulate some crawling tasks
    const services = ['web-crawler', 'seo-analyzer', 'screenshot-service'];
    
    console.log('Simulating performance data collection...\n');

    for (const service of services) {
      // Simulate 50 requests
      for (let i = 0; i < 50; i++) {
        const metric = {
          responseTime: Math.random() * 5000 + 1000, // 1-6 seconds
          error: Math.random() > 0.9, // 10% error rate
          concurrency: 5
        };
        this.perfMonitor.record(service, metric);
      }

      // Get report
      const report = this.perfMonitor.getMetricsReport(service);
      console.log(`Service: ${report.service}`);
      console.log(`  Avg Response Time: ${report.stats.avgResponseTime.toFixed(2)}ms`);
      console.log(`  P95 Response Time: ${report.stats.p95ResponseTime.toFixed(2)}ms`);
      console.log(`  Error Rate: ${report.stats.errorRate.toFixed(2)}%`);
      console.log(`  Success Rate: ${report.stats.successRate.toFixed(2)}%`);
      console.log(`  Performance Score: ${report.performanceScore.toFixed(2)}`);
      console.log(`  Current Concurrency: ${report.recommendations.concurrency.current}`);
      console.log(`  Recommended Concurrency: ${report.recommendations.concurrency.recommended}`);
      console.log(`  Adjustment: ${report.recommendations.concurrency.adjustment > 0 ? '+' : ''}${report.recommendations.concurrency.adjustment}`);
      console.log('');
    }

    // Global report
    const globalReport = this.perfMonitor.getGlobalReport();
    console.log('Global Metrics:');
    console.log(`  Total Requests: ${globalReport.totalRequests}`);
    console.log(`  Total Errors: ${globalReport.totalErrors}`);
    console.log(`  Avg Response Time: ${globalReport.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Error Rate: ${globalReport.errorRate.toFixed(2)}%`);
    console.log(`  Services Tracked: ${globalReport.servicesTracked}`);
  }

  /**
   * Demo 4: Adaptive Throttling
   */
  async demoAdaptiveThrottling() {
    console.log('\n📍 DEMO 4: Adaptive Throttling in Action\n');

    console.log('Demonstrating adaptive concurrency control...\n');

    const crawler = new AdaptiveCrawler();
    
    // Simulate crawling with adaptive concurrency
    for (let i = 0; i < 10; i++) {
      const metrics = crawler.simulateCrawl();
      console.log(`Iteration ${i + 1}:`);
      console.log(`  Concurrency: ${crawler.currentConcurrency}`);
      console.log(`  Performance Score: ${metrics.performanceScore.toFixed(2)}`);
      console.log(`  Learning Rate: ${crawler.learningRate.toFixed(3)}`);
      console.log(`  CPU Usage: ${metrics.cpuUsage.toFixed(1)}%`);
      console.log(`  Memory Usage: ${metrics.memoryUsage.toFixed(1)}%`);
      
      await crawler.adjustConcurrency(metrics);
      
      const trend = crawler.currentConcurrency > crawler.previousConcurrency ? '📈' :
                    crawler.currentConcurrency < crawler.previousConcurrency ? '📉' : '➡️';
      console.log(`  ${trend} Trend\n`);
    }
  }

  /**
   * Helper: Get key Chrome args
   */
  getKeyArgs(args) {
    const keyArgs = args.filter(arg => 
      arg.includes('gpu') || 
      arg.includes('webgl') || 
      arg.includes('headless')
    );
    return keyArgs.slice(0, 3); // Show first 3
  }
}

/**
 * Adaptive Crawler Simulation
 */
class AdaptiveCrawler {
  constructor() {
    this.learningRate = 0.1;
    this.currentConcurrency = 5;
    this.previousConcurrency = 5;
    this.targetConcurrency = 5;
    this.performanceHistory = [];
  }

  simulateCrawl() {
    // Simulate variable performance based on concurrency
    const basePerformance = 0.8;
    const concurrencyPenalty = (this.currentConcurrency - 5) * 0.05;
    const randomVariation = (Math.random() - 0.5) * 0.2;
    
    const performanceScore = Math.max(0, Math.min(1, 
      basePerformance - concurrencyPenalty + randomVariation
    ));

    return {
      performanceScore,
      cpuUsage: 50 + (this.currentConcurrency * 5) + (Math.random() * 10),
      memoryUsage: 40 + (this.currentConcurrency * 3) + (Math.random() * 10),
      responseTime: 2000 + (this.currentConcurrency * 200) + (Math.random() * 1000),
      errorRate: Math.max(0, 0.05 + (this.currentConcurrency - 5) * 0.02)
    };
  }

  async adjustConcurrency(metrics) {
    this.performanceHistory.push(metrics.performanceScore);
    this.previousConcurrency = this.currentConcurrency;

    const { performanceScore, cpuUsage, memoryUsage, errorRate } = metrics;

    // Adaptive adjustment
    if (performanceScore > 0.8 && cpuUsage < 70 && errorRate < 0.1) {
      // Performing well - increase concurrency
      this.targetConcurrency = Math.min(20, 
        this.currentConcurrency + Math.ceil(this.learningRate * this.currentConcurrency)
      );
    } else if (performanceScore < 0.5 || cpuUsage > 85 || errorRate > 0.15) {
      // Struggling - decrease concurrency
      this.targetConcurrency = Math.max(1,
        this.currentConcurrency - Math.ceil(this.learningRate * this.currentConcurrency)
      );
    }

    // Gradual convergence
    this.currentConcurrency += Math.sign(this.targetConcurrency - this.currentConcurrency);

    // Adaptive learning rate
    if (this.isPerformanceStable()) {
      this.learningRate = Math.min(0.2, this.learningRate * 1.05);
    } else {
      this.learningRate = Math.max(0.05, this.learningRate * 0.95);
    }
  }

  isPerformanceStable() {
    if (this.performanceHistory.length < 5) return false;
    
    const recent = this.performanceHistory.slice(-5);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / recent.length;
    
    return variance < 0.05;
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new HeadlessChromeDemo();
  demo.run().catch(console.error);
}

export default HeadlessChromeDemo;
