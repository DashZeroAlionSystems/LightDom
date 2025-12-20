#!/usr/bin/env node

/**
 * Test script for Swagger API Documentation
 * 
 * This script starts the API server and tests the Swagger endpoints
 */

import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables for testing
process.env.DB_DISABLED = 'true';
process.env.BLOCKCHAIN_ENABLED = 'false';
process.env.ENABLE_RATE_LIMITER = 'false';

console.log('🧪 Starting Swagger API test...\n');

// Start API server
const startServer = async () => {
  console.log('📦 Importing API server...');
  const apiModule = await import('./api-server-express.js');
  const DOMSpaceHarvesterAPI = apiModule.DOMSpaceHarvesterAPI;
  
  console.log('🚀 Creating API server instance...');
  const apiServer = new DOMSpaceHarvesterAPI();
  
  console.log('⏳ Starting server on port 3001...\n');
  await apiServer.start(3001);
  
  return apiServer;
};

// Test HTTP endpoint
const testEndpoint = (path, description) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 400;
        console.log(`${success ? '✅' : '❌'} ${description}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${data.length} bytes`);
        
        if (!success && data.length < 500) {
          console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        }
        
        console.log();
        resolve({ success, statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ ${description}`);
      console.log(`   Error: Request timeout\n`);
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
};

// Main test function
const runTests = async () => {
  let apiServer;
  
  try {
    // Start server
    apiServer = await startServer();
    
    // Wait a bit for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🧪 Testing Swagger Endpoints\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test endpoints
    const tests = [
      { path: '/api/health', description: 'Health Check Endpoint' },
      { path: '/api-docs/swagger.json', description: 'Swagger JSON Specification' },
      { path: '/api/openapi.json', description: 'OpenAPI JSON Specification' },
      { path: '/api-docs', description: 'Main Swagger UI' },
      { path: '/api-docs/client/test-client-123', description: 'Client-Specific Swagger UI' },
      { path: '/api-docs/service/seo', description: 'SEO Service Documentation' },
      { path: '/api/seo/header-script/health', description: 'SEO Header Script Service Health' }
    ];
    
    const results = [];
    for (const test of tests) {
      const result = await testEndpoint(test.path, test.description);
      results.push({ ...test, ...result });
    }
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Test Summary\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log();
    
    if (passed === results.length) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log('⚠️  Some tests failed. Review the output above.\n');
    }
    
    // Display URLs for manual testing
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Access Points\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Main Swagger UI:');
    console.log('  http://localhost:3001/api-docs\n');
    console.log('Client-Specific Swagger (example):');
    console.log('  http://localhost:3001/api-docs/client/test-client-123\n');
    console.log('Service Documentation:');
    console.log('  SEO:        http://localhost:3001/api-docs/service/seo');
    console.log('  Crawler:    http://localhost:3001/api-docs/service/crawler');
    console.log('  Blockchain: http://localhost:3001/api-docs/service/blockchain');
    console.log('  Analytics:  http://localhost:3001/api-docs/service/analytics');
    console.log('  RAG:        http://localhost:3001/api-docs/service/rag\n');
    console.log('OpenAPI JSON:');
    console.log('  http://localhost:3001/api-docs/swagger.json\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Server is running. Press Ctrl+C to stop.\n');
    
    // Keep server running
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down server...');
      if (apiServer && apiServer.shutdown) {
        await apiServer.shutdown();
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error(error.stack);
    
    if (apiServer && apiServer.shutdown) {
      await apiServer.shutdown();
    }
    
    process.exit(1);
  }
};

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
