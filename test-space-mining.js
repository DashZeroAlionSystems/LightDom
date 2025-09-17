/**
 * Space Mining Integration Test
 * Tests the complete space mining workflow from URL to bridge generation
 */

// Simple Node.js test script to validate space mining functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

class SpaceMiningIntegrationTest {
  constructor() {
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Running Space Mining Integration Tests...\n');

    try {
      // Test 1: Mine space from URL
      await this.testSpaceMining();
      
      // Test 2: Get spatial structures
      await this.testGetSpatialStructures();
      
      // Test 3: Get isolated DOMs
      await this.testGetIsolatedDOMs();
      
      // Test 4: Get metaverse bridges
      await this.testGetMetaverseBridges();
      
      // Test 5: Test bridge connectivity
      await this.testBridgeConnectivity();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async testSpaceMining() {
    try {
      const testData = {
        url: 'https://example.com/test-page',
        priority: 1,
        type: 'full'
      };

      const response = await axios.post(`${API_BASE}/space-mining/mine`, testData);
      this.addResult('Space Mining', response.status === 200, 
        `Mining completed: ${response.data.data?.spatialStructures?.length || 0} structures found`);
    } catch (error) {
      this.addResult('Space Mining', false, `Space mining failed: ${error.message}`);
    }
  }

  async testGetSpatialStructures() {
    try {
      const response = await axios.get(`${API_BASE}/space-mining/spatial-structures`);
      this.addResult('Get Spatial Structures', response.status === 200, 
        `Retrieved ${response.data.data?.spatialStructures?.length || 0} spatial structures`);
    } catch (error) {
      this.addResult('Get Spatial Structures', false, `Failed: ${error.message}`);
    }
  }

  async testGetIsolatedDOMs() {
    try {
      const response = await axios.get(`${API_BASE}/space-mining/isolated-doms`);
      this.addResult('Get Isolated DOMs', response.status === 200, 
        `Retrieved ${response.data.data?.isolatedDOMs?.length || 0} isolated DOM components`);
    } catch (error) {
      this.addResult('Get Isolated DOMs', false, `Failed: ${error.message}`);
    }
  }

  async testGetMetaverseBridges() {
    try {
      const response = await axios.get(`${API_BASE}/space-mining/bridges`);
      this.addResult('Get Metaverse Bridges', response.status === 200, 
        `Retrieved ${response.data.data?.bridges?.length || 0} metaverse bridges`);
    } catch (error) {
      this.addResult('Get Metaverse Bridges', false, `Failed: ${error.message}`);
    }
  }

  async testBridgeConnectivity() {
    try {
      // First get available bridges
      const bridgesResponse = await axios.get(`${API_BASE}/space-mining/bridges`);
      const bridges = bridgesResponse.data.data?.bridges || [];
      
      if (bridges.length > 0) {
        const testBridge = bridges[0];
        const response = await axios.post(`${API_BASE}/space-mining/test-bridge/${testBridge.id}`);
        this.addResult('Bridge Connectivity Test', response.status === 200, 
          `Bridge ${testBridge.id} connectivity: ${response.data.data?.connectivity?.reachable ? 'OK' : 'Failed'}`);
      } else {
        this.addResult('Bridge Connectivity Test', false, 'No bridges available for testing');
      }
    } catch (error) {
      this.addResult('Bridge Connectivity Test', false, `Failed: ${error.message}`);
    }
  }

  addResult(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed,
      message
    });
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log('================\n');

    let passedCount = 0;
    let totalCount = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);
      console.log(`   ${result.message}\n`);
      if (result.passed) passedCount++;
    });

    console.log(`\n📈 Summary: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      console.log('🎉 All tests passed! Space mining system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

// Export for use as module
module.exports = SpaceMiningIntegrationTest;

// Run tests if called directly
if (require.main === module) {
  const tester = new SpaceMiningIntegrationTest();
  tester.runTests().catch(console.error);
}