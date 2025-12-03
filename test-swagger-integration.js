#!/usr/bin/env node

/**
 * Integration test demonstrating Swagger API with SEO header script injection
 * 
 * This script shows how to:
 * 1. Access Swagger documentation
 * 2. Inject SEO scripts for clients
 * 3. Retrieve and update strategies
 * 4. Use per-client Swagger instances
 */

import http from 'http';

const API_BASE = 'http://localhost:3001';

// Example client IDs from config/client-configurations.js
const CLIENTS = {
  premium: 'premium-client-123',
  standard: 'standard-client-456',
  basic: 'basic-client-789'
};

console.log('🚀 LightDom Swagger API Integration Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('json') ? JSON.parse(body) : body
          };
          resolve(response);
        } catch (error) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Test 1: Access main Swagger documentation
 */
async function testSwaggerDocs() {
  console.log('📚 Test 1: Accessing Swagger Documentation\n');
  
  const response = await makeRequest('GET', '/api/openapi.json');
  
  if (response.statusCode === 200) {
    const spec = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    console.log(`✅ Swagger spec retrieved`);
    console.log(`   Title: ${spec.info?.title || 'N/A'}`);
    console.log(`   Version: ${spec.info?.version || 'N/A'}`);
    console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);
    console.log(`   Tags: ${spec.tags?.length || 0}`);
  } else {
    console.log(`❌ Failed to retrieve Swagger spec (${response.statusCode})`);
  }
  
  console.log();
}

/**
 * Test 2: Inject SEO script for premium client
 */
async function testSeoInjection() {
  console.log('🎯 Test 2: SEO Header Script Injection\n');
  
  const strategy = {
    domain: 'example-premium.com',
    strategy: {
      keywords: ['premium', 'enterprise', 'optimized', 'high-performance'],
      metadata: {
        title: 'Premium Example Site - Powered by LightDom',
        description: 'Enterprise-grade web optimization and performance',
        ogTitle: 'Premium Example Site',
        ogDescription: 'Experience the best in web optimization',
        ogImage: 'https://example-premium.com/og-image.jpg'
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Premium Example Inc',
        url: 'https://example-premium.com',
        description: 'Leading provider of web optimization solutions'
      }
    },
    options: {
      async: true,
      defer: false,
      position: 'head'
    }
  };
  
  console.log(`Client: ${CLIENTS.premium}`);
  console.log(`Domain: ${strategy.domain}\n`);
  
  const response = await makeRequest(
    'POST',
    '/api/seo/header-script/inject',
    strategy,
    {
      'X-Client-Id': CLIENTS.premium,
      'X-API-Key': 'premium-api-key-12345678'
    }
  );
  
  if (response.statusCode === 200 && response.body.success) {
    console.log(`✅ SEO script injected successfully`);
    console.log(`   Strategy ID: ${response.body.strategyId}`);
    console.log(`   Script URL: ${response.body.scriptUrl}`);
    console.log(`\n   Script Tag:`);
    console.log(`   ${response.body.scriptTag}\n`);
    
    return response.body.strategyId;
  } else {
    console.log(`❌ Failed to inject SEO script (${response.statusCode})`);
    console.log(`   ${JSON.stringify(response.body, null, 2)}\n`);
    return null;
  }
}

/**
 * Test 3: Retrieve strategy for client
 */
async function testGetStrategy(clientId) {
  console.log('📖 Test 3: Retrieve SEO Strategy\n');
  
  const response = await makeRequest(
    'GET',
    `/api/seo/header-script/strategy/${clientId}`,
    null,
    {
      'X-API-Key': 'premium-api-key-12345678'
    }
  );
  
  if (response.statusCode === 200 && response.body.success) {
    const strategy = response.body.strategy;
    console.log(`✅ Strategy retrieved`);
    console.log(`   ID: ${strategy.id}`);
    console.log(`   Client: ${strategy.clientId}`);
    console.log(`   Domain: ${strategy.domain}`);
    console.log(`   Keywords: ${strategy.keywords.join(', ')}`);
    console.log(`   Created: ${strategy.createdAt}\n`);
  } else if (response.statusCode === 404) {
    console.log(`ℹ️  No strategy found for client ${clientId}\n`);
  } else {
    console.log(`❌ Failed to retrieve strategy (${response.statusCode})\n`);
  }
}

/**
 * Test 4: Access client-specific Swagger
 */
async function testClientSwagger() {
  console.log('👥 Test 4: Client-Specific Swagger Documentation\n');
  
  for (const [name, clientId] of Object.entries(CLIENTS)) {
    const response = await makeRequest('GET', `/api-docs/client/${clientId}/swagger.json`);
    
    if (response.statusCode === 200) {
      try {
        const spec = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        console.log(`✅ ${name.toUpperCase()} Client (${clientId})`);
        console.log(`   Swagger: Enabled`);
        console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);
        console.log(`   Services: ${spec.info?.description?.match(/Enabled Services: (.*)/)?.[1] || 'N/A'}`);
      } catch (parseError) {
        // Response is HTML, check if it's a valid Swagger UI page
        const isSwaggerUI = typeof response.body === 'string' && response.body.includes('swagger-ui');
        if (isSwaggerUI) {
          console.log(`✅ ${name.toUpperCase()} Client (${clientId})`);
          console.log(`   Swagger: Enabled (UI available)`);
          console.log(`   UI URL: ${API_BASE}/api-docs/client/${clientId}`);
        } else {
          console.log(`⚠️  ${name.toUpperCase()} Client (${clientId})`);
          console.log(`   Unexpected response format`);
        }
      }
    } else if (response.statusCode === 403) {
      console.log(`⛔ ${name.toUpperCase()} Client (${clientId})`);
      console.log(`   Swagger: Disabled`);
    } else {
      console.log(`❌ ${name.toUpperCase()} Client (${clientId})`);
      console.log(`   Error: ${response.statusCode}`);
    }
    console.log();
  }
}

/**
 * Test 5: Service-specific documentation
 */
async function testServiceDocs() {
  console.log('🔧 Test 5: Service-Specific Documentation\n');
  
  const services = ['seo', 'crawler', 'analytics'];
  
  for (const service of services) {
    const response = await makeRequest('GET', `/api-docs/service/${service}`);
    
    if (response.statusCode === 200) {
      console.log(`✅ ${service.toUpperCase()} Service Documentation`);
      console.log(`   URL: ${API_BASE}/api-docs/service/${service}`);
    } else {
      console.log(`❌ ${service.toUpperCase()} Service Documentation (${response.statusCode})`);
    }
  }
  
  console.log();
}

/**
 * Test 6: Health checks
 */
async function testHealthChecks() {
  console.log('💚 Test 6: Health Checks\n');
  
  const endpoints = [
    { path: '/api/health', name: 'Main API' },
    { path: '/api/seo/header-script/health', name: 'SEO Service' }
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest('GET', endpoint.path);
    
    if (response.statusCode === 200) {
      console.log(`✅ ${endpoint.name}: Healthy`);
      if (response.body.status) {
        console.log(`   Status: ${response.body.status}`);
      }
    } else {
      console.log(`❌ ${endpoint.name}: Unhealthy (${response.statusCode})`);
    }
  }
  
  console.log();
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting integration tests...\n');
  console.log(`API Base URL: ${API_BASE}\n`);
  
  try {
    await testSwaggerDocs();
    const strategyId = await testSeoInjection();
    if (strategyId) {
      await testGetStrategy(CLIENTS.premium);
    }
    await testClientSwagger();
    await testServiceDocs();
    await testHealthChecks();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All integration tests completed!\n');
    console.log('📖 Documentation:');
    console.log(`   Main Swagger UI: ${API_BASE}/api-docs`);
    console.log(`   Client Swagger: ${API_BASE}/api-docs/client/{clientId}`);
    console.log(`   Service Docs: ${API_BASE}/api-docs/service/{serviceName}`);
    console.log(`\n📚 See SWAGGER_API_DOCUMENTATION.md for more details\n`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Check if server is running
console.log('Checking if server is running...');
makeRequest('GET', '/api/health')
  .then(response => {
    if (response.statusCode === 200) {
      console.log('✅ Server is running\n');
      return runTests();
    } else {
      console.log('❌ Server is not responding');
      console.log('Please start the server with: node api-server-express.js\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('❌ Cannot connect to server');
    console.log('Please start the server with: node api-server-express.js\n');
    console.error('Error:', error.message);
    process.exit(1);
  });
