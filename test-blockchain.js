/**
 * LightDom Blockchain Test Script
 * Tests the blockchain system functionality
 */

import { ethers } from 'ethers';
import axios from 'axios';

class BlockchainTester {
  constructor() {
    this.apiUrl = 'http://localhost:3001';
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Running LightDom Blockchain Tests...\n');

    try {
      // Test 1: API Health Check
      await this.testAPIHealth();

      // Test 2: Blockchain Status
      await this.testBlockchainStatus();

      // Test 3: Submit Test Optimization
      await this.testSubmitOptimization();

      // Test 4: Get Metrics
      await this.testGetMetrics();

      // Test 5: Test Mining Session
      await this.testMiningSession();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async testAPIHealth() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/health`);
      this.addResult('API Health Check', response.status === 200, 'API is responding');
    } catch (error) {
      this.addResult('API Health Check', false, `API not responding: ${error.message}`);
    }
  }

  async testBlockchainStatus() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/blockchain/status`);
      this.addResult(
        'Blockchain Status',
        response.status === 200,
        'Blockchain status endpoint working'
      );
    } catch (error) {
      this.addResult('Blockchain Status', false, `Blockchain status failed: ${error.message}`);
    }
  }

  async testSubmitOptimization() {
    try {
      const testData = {
        url: 'https://example.com/test',
        userAddress: '0x1234567890123456789012345678901234567890',
        domAnalysis: { unusedCSS: 100, orphanedJS: 50, unusedElements: 25 },
        spaceSaved: 175,
        timestamp: Date.now(),
      };

      const response = await axios.post(
        `${this.apiUrl}/api/blockchain/submit-optimization`,
        testData
      );
      this.addResult(
        'Submit Optimization',
        response.status === 200,
        'Optimization submitted successfully'
      );
    } catch (error) {
      this.addResult(
        'Submit Optimization',
        false,
        `Optimization submission failed: ${error.message}`
      );
    }
  }

  async testGetMetrics() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/blockchain/metrics`);
      this.addResult('Get Metrics', response.status === 200, 'Metrics endpoint working');
    } catch (error) {
      this.addResult('Get Metrics', false, `Metrics endpoint failed: ${error.message}`);
    }
  }

  async testMiningSession() {
    try {
      const testData = {
        userAddress: '0x1234567890123456789012345678901234567890',
        extensionId: 'test-extension-123',
      };

      const response = await axios.post(`${this.apiUrl}/api/blockchain/start-mining`, testData);
      this.addResult(
        'Start Mining Session',
        response.status === 200,
        'Mining session started successfully'
      );

      // Stop the session
      await axios.post(`${this.apiUrl}/api/blockchain/stop-mining`, {
        userAddress: testData.userAddress,
      });
      this.addResult('Stop Mining Session', true, 'Mining session stopped successfully');
    } catch (error) {
      this.addResult('Mining Session', false, `Mining session failed: ${error.message}`);
    }
  }

  addResult(testName, passed, message) {
    this.testResults.push({ testName, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  printResults() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;

    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
      console.log('🎉 All tests passed! Blockchain system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the output above for details.');
    }
  }
}

// Run the tests
const tester = new BlockchainTester();
tester.runTests().catch(console.error);
