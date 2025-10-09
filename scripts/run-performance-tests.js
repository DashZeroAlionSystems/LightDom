#!/usr/bin/env node

/**
 * LightDom Performance Testing Suite
 * Comprehensive performance testing with k6
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomPerformanceTestSuite {
  constructor() {
    this.testResults = [];
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001';
    this.testConfig = {
      load: {
        stages: [
          { duration: '2m', target: 10 },
          { duration: '5m', target: 10 },
          { duration: '2m', target: 0 }
        ],
        thresholds: {
          http_req_duration: ['p(95)<500'],
          http_req_failed: ['rate<0.1']
        }
      },
      stress: {
        stages: [
          { duration: '2m', target: 20 },
          { duration: '5m', target: 50 },
          { duration: '2m', target: 100 },
          { duration: '5m', target: 100 },
          { duration: '2m', target: 0 }
        ],
        thresholds: {
          http_req_duration: ['p(95)<1000'],
          http_req_failed: ['rate<0.2']
        }
      },
      spike: {
        stages: [
          { duration: '1m', target: 10 },
          { duration: '1m', target: 100 },
          { duration: '1m', target: 10 },
          { duration: '1m', target: 100 },
          { duration: '1m', target: 10 }
        ],
        thresholds: {
          http_req_duration: ['p(95)<2000'],
          http_req_failed: ['rate<0.3']
        }
      }
    };
  }

  async runAllTests() {
    console.log('⚡ Starting LightDom Performance Test Suite...');
    console.log('============================================');

    try {
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Run different test types
      await this.runLoadTest();
      await this.runStressTest();
      await this.runSpikeTest();
      await this.runAPITest();
      await this.runDatabaseTest();
      
      // Generate report
      await this.generateReport();
      
      console.log('✅ Performance test suite completed');
      
    } catch (error) {
      console.error('❌ Performance test suite failed:', error);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    try {
      // Check if k6 is installed
      const { execSync } = await import('child_process');
      execSync('k6 version', { stdio: 'pipe' });
      console.log('✅ k6 is installed');
    } catch (error) {
      console.log('📦 Installing k6...');
      const { execSync } = await import('child_process');
      execSync('sudo apt-get update && sudo apt-get install -y k6', { stdio: 'inherit' });
    }
    
    // Check if API server is running
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error('API server is not responding');
      }
      console.log('✅ API server is running');
    } catch (error) {
      throw new Error('API server is not accessible. Please start the server first.');
    }
  }

  async runLoadTest() {
    console.log('\n📊 Running Load Test...');
    
    const loadTestScript = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1']
  }
};

export default function() {
  const endpoints = [
    '/api/health',
    '/api/blockchain/stats',
    '/api/crawler/stats',
    '/api/wallet/balance',
    '/api/metaverse/stats'
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get('${this.baseUrl}' + endpoint);
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has data': (r) => r.json().success === true
  });
  
  errorRate.add(!result);
  sleep(1);
}
    `.trim();
    
    await this.runK6Test('load', loadTestScript);
  }

  async runStressTest() {
    console.log('\n💪 Running Stress Test...');
    
    const stressTestScript = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.2'],
    errors: ['rate<0.2']
  }
};

export default function() {
  const endpoints = [
    '/api/health',
    '/api/blockchain/stats',
    '/api/crawler/stats',
    '/api/wallet/balance',
    '/api/metaverse/stats',
    '/api/integrated/dashboard'
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get('${this.baseUrl}' + endpoint);
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'response has data': (r) => r.json().success === true
  });
  
  errorRate.add(!result);
  sleep(0.5);
}
    `.trim();
    
    await this.runK6Test('stress', stressTestScript);
  }

  async runSpikeTest() {
    console.log('\n⚡ Running Spike Test...');
    
    const spikeTestScript = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 10 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.3'],
    errors: ['rate<0.3']
  }
};

export default function() {
  const endpoints = [
    '/api/health',
    '/api/blockchain/stats',
    '/api/crawler/stats',
    '/api/wallet/balance',
    '/api/metaverse/stats'
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get('${this.baseUrl}' + endpoint);
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'response has data': (r) => r.json().success === true
  });
  
  errorRate.add(!result);
  sleep(0.1);
}
    `.trim();
    
    await this.runK6Test('spike', spikeTestScript);
  }

  async runAPITest() {
    console.log('\n🔌 Running API Endpoint Test...');
    
    const apiTestScript = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05']
  }
};

export default function() {
  // Test health endpoint
  let response = http.get('${this.baseUrl}/api/health');
  check(response, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 300ms': (r) => r.timings.duration < 300
  });
  
  // Test blockchain stats
  response = http.get('${this.baseUrl}/api/blockchain/stats');
  check(response, {
    'blockchain status is 200': (r) => r.status === 200,
    'blockchain response time < 300ms': (r) => r.timings.duration < 300
  });
  
  // Test crawler stats
  response = http.get('${this.baseUrl}/api/crawler/stats');
  check(response, {
    'crawler status is 200': (r) => r.status === 200,
    'crawler response time < 300ms': (r) => r.timings.duration < 300
  });
  
  // Test wallet balance
  response = http.get('${this.baseUrl}/api/wallet/balance', {
    headers: { 'x-user-id': 'test-user' }
  });
  check(response, {
    'wallet status is 200': (r) => r.status === 200,
    'wallet response time < 300ms': (r) => r.timings.duration < 300
  });
  
  // Test metaverse stats
  response = http.get('${this.baseUrl}/api/metaverse/stats');
  check(response, {
    'metaverse status is 200': (r) => r.status === 200,
    'metaverse response time < 300ms': (r) => r.timings.duration < 300
  });
  
  sleep(1);
}
    `.trim();
    
    await this.runK6Test('api', apiTestScript);
  }

  async runDatabaseTest() {
    console.log('\n🗄️ Running Database Performance Test...');
    
    const dbTestScript = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  vus: 10,
  duration: '3m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1']
  }
};

export default function() {
  // Test database-heavy endpoints
  const endpoints = [
    '/api/wallet/transactions',
    '/api/metaverse/bridges',
    '/api/metaverse/chatrooms',
    '/api/metaverse/messages',
    '/api/integrated/dashboard'
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get('${this.baseUrl}' + endpoint, {
    headers: { 'x-user-id': 'test-user' }
  });
  
  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has data': (r) => r.json().success === true
  });
  
  errorRate.add(!result);
  sleep(0.5);
}
    `.trim();
    
    await this.runK6Test('database', dbTestScript);
  }

  async runK6Test(testName, script) {
    const testFile = join(projectRoot, 'tests', 'performance', `${testName}-test.js`);
    
    // Ensure tests directory exists
    await fs.mkdir(join(projectRoot, 'tests', 'performance'), { recursive: true });
    
    // Write test script
    await fs.writeFile(testFile, script);
    
    console.log(`Running ${testName} test...`);
    
    try {
      const { execSync } = await import('child_process');
      const output = execSync(`k6 run --out json=${testName}-results.json ${testFile}`, { 
        cwd: projectRoot,
        encoding: 'utf8'
      });
      
      console.log(`✅ ${testName} test completed`);
      console.log(output);
      
      // Parse results
      try {
        const resultsFile = join(projectRoot, `${testName}-results.json`);
        const results = await fs.readFile(resultsFile, 'utf8');
        const lines = results.trim().split('\n');
        const parsedResults = lines.map(line => JSON.parse(line));
        
        this.testResults.push({
          testName,
          results: parsedResults,
          summary: this.parseK6Results(parsedResults)
        });
        
        // Clean up results file
        await fs.unlink(resultsFile);
      } catch (error) {
        console.warn(`⚠️ Could not parse ${testName} results:`, error.message);
      }
      
    } catch (error) {
      console.error(`❌ ${testName} test failed:`, error.message);
    }
  }

  parseK6Results(results) {
    const summary = {
      totalRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerSecond: 0
    };
    
    if (results.length === 0) return summary;
    
    // Find summary metrics
    const summaryData = results.find(r => r.type === 'Summary');
    if (summaryData) {
      summary.totalRequests = summaryData.metrics.http_reqs?.count || 0;
      summary.failedRequests = summaryData.metrics.http_req_failed?.count || 0;
      summary.avgResponseTime = summaryData.metrics.http_req_duration?.avg || 0;
      summary.p95ResponseTime = summaryData.metrics.http_req_duration?.p95 || 0;
      summary.p99ResponseTime = summaryData.metrics.http_req_duration?.p99 || 0;
      summary.requestsPerSecond = summaryData.metrics.http_reqs?.rate || 0;
    }
    
    return summary;
  }

  async generateReport() {
    console.log('\n📊 Generating Performance Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      testResults: this.testResults,
      summary: this.generateSummary()
    };
    
    // Save report to file
    const reportFile = join(projectRoot, 'performance-test-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHTMLReport(report);
    
    // Display summary
    this.displaySummary(report.summary);
    
    console.log(`\n📄 Report saved to: ${reportFile}`);
    console.log(`🌐 HTML report: ${join(projectRoot, 'performance-test-report.html')}`);
  }

  generateSummary() {
    const summary = {
      totalTests: this.testResults.length,
      overallPerformance: 'good',
      recommendations: []
    };
    
    let totalRequests = 0;
    let totalFailedRequests = 0;
    let avgResponseTime = 0;
    let maxResponseTime = 0;
    
    for (const test of this.testResults) {
      totalRequests += test.summary.totalRequests;
      totalFailedRequests += test.summary.failedRequests;
      avgResponseTime += test.summary.avgResponseTime;
      maxResponseTime = Math.max(maxResponseTime, test.summary.p95ResponseTime);
    }
    
    summary.totalRequests = totalRequests;
    summary.totalFailedRequests = totalFailedRequests;
    summary.failureRate = totalRequests > 0 ? (totalFailedRequests / totalRequests) * 100 : 0;
    summary.avgResponseTime = avgResponseTime / this.testResults.length;
    summary.maxResponseTime = maxResponseTime;
    
    // Determine overall performance
    if (summary.failureRate > 10 || summary.maxResponseTime > 2000) {
      summary.overallPerformance = 'poor';
      summary.recommendations.push('High failure rate or slow response times detected');
    } else if (summary.failureRate > 5 || summary.maxResponseTime > 1000) {
      summary.overallPerformance = 'fair';
      summary.recommendations.push('Moderate performance issues detected');
    }
    
    // Add specific recommendations
    if (summary.avgResponseTime > 500) {
      summary.recommendations.push('Consider optimizing database queries');
    }
    
    if (summary.maxResponseTime > 1000) {
      summary.recommendations.push('Consider implementing caching');
    }
    
    if (summary.failureRate > 5) {
      summary.recommendations.push('Investigate error handling and retry mechanisms');
    }
    
    return summary;
  }

  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightDom Performance Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f7fafc;
            color: #2d3748;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .summary {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .test-result {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: #f7fafc;
            border-radius: 4px;
        }
        .status-good { color: #38a169; }
        .status-fair { color: #d69e2e; }
        .status-poor { color: #e53e3e; }
        .recommendations {
            background: #edf2f7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ LightDom Performance Test Report</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Base URL: ${report.baseUrl}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="metric">
                <span>Total Tests:</span>
                <span>${report.summary.totalTests}</span>
            </div>
            <div class="metric">
                <span>Total Requests:</span>
                <span>${report.summary.totalRequests.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span>Failed Requests:</span>
                <span>${report.summary.totalFailedRequests.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span>Failure Rate:</span>
                <span>${report.summary.failureRate.toFixed(2)}%</span>
            </div>
            <div class="metric">
                <span>Average Response Time:</span>
                <span>${report.summary.avgResponseTime.toFixed(2)}ms</span>
            </div>
            <div class="metric">
                <span>Max Response Time (P95):</span>
                <span>${report.summary.maxResponseTime.toFixed(2)}ms</span>
            </div>
            <div class="metric">
                <span>Overall Performance:</span>
                <span class="status-${report.summary.overallPerformance}">${report.summary.overallPerformance.toUpperCase()}</span>
            </div>
            
            ${report.summary.recommendations.length > 0 ? `
            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        
        ${report.testResults.map(test => `
        <div class="test-result">
            <h2>🧪 ${test.testName.charAt(0).toUpperCase() + test.testName.slice(1)} Test</h2>
            <div class="metric">
                <span>Total Requests:</span>
                <span>${test.summary.totalRequests.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span>Failed Requests:</span>
                <span>${test.summary.failedRequests.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span>Average Response Time:</span>
                <span>${test.summary.avgResponseTime.toFixed(2)}ms</span>
            </div>
            <div class="metric">
                <span>P95 Response Time:</span>
                <span>${test.summary.p95ResponseTime.toFixed(2)}ms</span>
            </div>
            <div class="metric">
                <span>P99 Response Time:</span>
                <span>${test.summary.p99ResponseTime.toFixed(2)}ms</span>
            </div>
            <div class="metric">
                <span>Requests Per Second:</span>
                <span>${test.summary.requestsPerSecond.toFixed(2)}</span>
            </div>
        </div>
        `).join('')}
    </div>
</body>
</html>
    `.trim();
    
    const htmlFile = join(projectRoot, 'performance-test-report.html');
    await fs.writeFile(htmlFile, html);
  }

  displaySummary(summary) {
    console.log('\n📊 Performance Test Summary');
    console.log('==========================');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Total Requests: ${summary.totalRequests.toLocaleString()}`);
    console.log(`Failed Requests: ${summary.totalFailedRequests.toLocaleString()}`);
    console.log(`Failure Rate: ${summary.failureRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time (P95): ${summary.maxResponseTime.toFixed(2)}ms`);
    console.log(`Overall Performance: ${summary.overallPerformance.toUpperCase()}`);
    
    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      summary.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }
}

// Run performance test suite
const testSuite = new LightDomPerformanceTestSuite();
testSuite.runAllTests().catch(console.error);

export { LightDomPerformanceTestSuite };
