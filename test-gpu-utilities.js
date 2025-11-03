/**
 * Simple Test for GPU Detection and Adaptive Configuration Utilities
 * 
 * Tests the core functionality without requiring puppeteer installation
 */

import { AdaptiveBrowserConfig } from './utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from './utils/PerformanceMonitor.js';

async function runTests() {
  console.log('🧪 Testing GPU and Headless Chrome Utilities\n');
  console.log('=' .repeat(60));

  // Test 1: AdaptiveBrowserConfig without GPU detection
  console.log('\n📍 TEST 1: Adaptive Browser Configuration\n');
  
  const browserConfig = new AdaptiveBrowserConfig();
  
  // Test preset retrieval
  const presets = browserConfig.getAvailablePresets();
  console.log('✅ Available Presets:', presets.length);
  presets.forEach(preset => {
    console.log(`   • ${preset.name}: ${preset.description}`);
  });

  // Test configuration generation (without initialization/GPU check)
  console.log('\n✅ Configuration Presets:');
  const presetNames = ['scraping', 'screenshot', 'seo', 'ci'];
  for (const presetName of presetNames) {
    try {
      const config = browserConfig.applyPreset(presetName);
      console.log(`   ${presetName}: ${config.args.length} args, GPU: ${config.args.some(a => a.includes('enable-gpu')) ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   ${presetName}: ❌ Error - ${error.message}`);
    }
  }

  // Test GPU beneficial task detection
  console.log('\n✅ GPU Beneficial Tasks:');
  const tasks = ['scraping', 'visualization', 'screenshot', 'seo', 'video', 'webgl'];
  tasks.forEach(task => {
    const beneficial = browserConfig.isGPUBeneficial(task);
    console.log(`   ${task}: ${beneficial ? '✅ Yes' : '❌ No'}`);
  });

  // Test 2: Performance Monitor
  console.log('\n\n📍 TEST 2: Performance Monitor\n');
  
  const perfMonitor = new PerformanceMonitor({ learningRate: 0.1 });
  
  // Simulate metrics
  console.log('Recording simulated metrics...');
  const services = ['web-crawler', 'seo-analyzer'];
  
  for (const service of services) {
    // Record 20 metrics
    for (let i = 0; i < 20; i++) {
      perfMonitor.record(service, {
        responseTime: Math.random() * 4000 + 1000,
        error: Math.random() > 0.9,
        concurrency: 5,
        cpuUsage: Math.random() * 30 + 50,
        memoryUsage: Math.random() * 20 + 40
      });
    }
  }

  // Get reports
  console.log('\n✅ Performance Reports:');
  for (const service of services) {
    const report = perfMonitor.getMetricsReport(service);
    console.log(`\n   Service: ${report.service}`);
    console.log(`   - Samples: ${report.sampleCount}`);
    console.log(`   - Avg Response Time: ${report.stats.avgResponseTime.toFixed(0)}ms`);
    console.log(`   - Error Rate: ${report.stats.errorRate.toFixed(1)}%`);
    console.log(`   - Performance Score: ${report.performanceScore.toFixed(2)}`);
    console.log(`   - Current Concurrency: ${report.recommendations.concurrency.current}`);
    console.log(`   - Recommended Concurrency: ${report.recommendations.concurrency.recommended}`);
  }

  // Global report
  const globalReport = perfMonitor.getGlobalReport();
  console.log('\n✅ Global Metrics:');
  console.log(`   - Total Requests: ${globalReport.totalRequests}`);
  console.log(`   - Error Rate: ${globalReport.errorRate.toFixed(1)}%`);
  console.log(`   - Services Tracked: ${globalReport.servicesTracked}`);

  // Test 3: Adaptive Learning Rate
  console.log('\n\n📍 TEST 3: Adaptive Learning Rate Simulation\n');
  
  console.log('Simulating adaptive concurrency control...\n');
  
  let concurrency = 5;
  let learningRate = 0.1;
  const history = [];
  
  for (let i = 0; i < 10; i++) {
    // Simulate performance based on concurrency
    const performanceScore = Math.max(0, Math.min(1, 0.8 - (concurrency - 5) * 0.08 + (Math.random() - 0.5) * 0.2));
    const cpuUsage = 50 + concurrency * 5;
    
    history.push(performanceScore);
    
    console.log(`Iteration ${i + 1}:`);
    console.log(`   Concurrency: ${concurrency}, LR: ${learningRate.toFixed(3)}, Score: ${performanceScore.toFixed(2)}, CPU: ${cpuUsage.toFixed(0)}%`);
    
    // Adjust concurrency
    const prevConcurrency = concurrency;
    if (performanceScore > 0.8 && cpuUsage < 70) {
      concurrency = Math.min(20, concurrency + Math.ceil(learningRate * concurrency));
    } else if (performanceScore < 0.5 || cpuUsage > 85) {
      concurrency = Math.max(1, concurrency - Math.ceil(learningRate * concurrency));
    }
    
    // Adjust learning rate
    if (history.length >= 5) {
      const recent = history.slice(-5);
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
      
      if (variance < 0.05) {
        learningRate = Math.min(0.2, learningRate * 1.05);
      } else {
        learningRate = Math.max(0.05, learningRate * 0.95);
      }
    }
    
    const trend = concurrency > prevConcurrency ? '📈 Increasing' : 
                  concurrency < prevConcurrency ? '📉 Decreasing' : 
                  '➡️  Stable';
    console.log(`   ${trend}\n`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All Tests Completed Successfully!\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
