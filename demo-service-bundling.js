/**
 * Service Bundling Demo
 * 
 * Demonstrates the service bundling functionality:
 * 1. Registers API endpoints
 * 2. Creates a service with bundled endpoints
 * 3. Accesses endpoints through dynamic routing
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpointRegistry() {
  console.log('\n📋 Testing Endpoint Registry...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/available/endpoints`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} registered endpoints`);
      console.log('\nSample endpoints:');
      result.data.slice(0, 5).forEach(endpoint => {
        console.log(`  - ${endpoint.title} (${endpoint.method} ${endpoint.path})`);
      });
      return result.data;
    } else {
      console.error('❌ Failed to fetch endpoints:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching endpoints:', error.message);
    return [];
  }
}

async function createDemoService(endpoints) {
  console.log('\n🏗️  Creating Demo Service...\n');
  
  // Select some endpoints to bundle
  const selectedEndpoints = endpoints
    .filter(e => e.category === 'data-streams')
    .slice(0, 4)
    .map(e => ({ endpoint_id: e.endpoint_id }));
  
  if (selectedEndpoints.length === 0) {
    console.log('⚠️  No data-streams endpoints found, using first 3 available');
    selectedEndpoints.push(...endpoints.slice(0, 3).map(e => ({ endpoint_id: e.endpoint_id })));
  }
  
  const service = {
    name: 'Data Stream Management Service',
    description: 'Comprehensive data stream management with bundled endpoints',
    service_type: 'data-processor',
    bundled_endpoints: selectedEndpoints,
    supports_realtime: true,
    api_config: {
      version: '1.0.0',
      auth_required: true
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Service created successfully!');
      console.log(`   Service ID: ${result.data.service_id}`);
      console.log(`   Name: ${result.data.name}`);
      console.log(`   Bundled Endpoints: ${selectedEndpoints.length}`);
      return result.data;
    } else {
      console.error('❌ Failed to create service:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating service:', error.message);
    return null;
  }
}

async function listServices() {
  console.log('\n📊 Listing All Services...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/services`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} services:\n`);
      result.data.forEach((service, index) => {
        console.log(`${index + 1}. ${service.name}`);
        console.log(`   Type: ${service.service_type}`);
        console.log(`   Endpoints: ${service.endpoint_count || 0}`);
        console.log(`   Status: ${service.is_active ? 'Active' : 'Inactive'}`);
        console.log('');
      });
      return result.data;
    } else {
      console.error('❌ Failed to list services:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing services:', error.message);
    return [];
  }
}

async function testDynamicRouting(serviceName) {
  console.log('\n🔀 Testing Dynamic Routing...\n');
  
  try {
    // List endpoints for the service
    const encodedName = encodeURIComponent(serviceName);
    const response = await fetch(`${API_BASE_URL}/api/service/${encodedName}/endpoints`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Service "${serviceName}" has ${result.data.endpoints.length} endpoints:`);
      console.log('');
      result.data.endpoints.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.title}`);
        console.log(`   Access URL: ${endpoint.access_url}`);
        console.log(`   Method: ${endpoint.method}`);
        console.log('');
      });
      
      // Try to access first endpoint
      if (result.data.endpoints.length > 0) {
        const firstEndpoint = result.data.endpoints[0];
        console.log(`\n📡 Testing access to: ${firstEndpoint.title}`);
        
        const accessResponse = await fetch(
          `${API_BASE_URL}${firstEndpoint.access_url}`,
          { method: firstEndpoint.method }
        );
        const accessResult = await accessResponse.json();
        
        if (accessResult.success) {
          console.log('✅ Endpoint accessed successfully through service!');
          console.log('   Response:', JSON.stringify(accessResult, null, 2));
        } else {
          console.log('⚠️  Endpoint returned:', accessResult.message || accessResult.error);
        }
      }
    } else {
      console.error('❌ Failed to get service endpoints:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing dynamic routing:', error.message);
  }
}

async function getServiceDetails(serviceId) {
  console.log('\n🔍 Getting Service Details...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`);
    const result = await response.json();
    
    if (result.success) {
      const service = result.data;
      console.log('✅ Service Details:\n');
      console.log(`Name: ${service.name}`);
      console.log(`Description: ${service.description || 'N/A'}`);
      console.log(`Type: ${service.service_type}`);
      console.log(`Status: ${service.is_active ? 'Active' : 'Inactive'}`);
      console.log(`\nBundled Endpoints (${service.bundled_endpoints?.length || 0}):`);
      service.bundled_endpoints?.forEach((endpoint, index) => {
        console.log(`  ${index + 1}. ${endpoint.title} (${endpoint.method} ${endpoint.path})`);
      });
      console.log(`\nData Streams (${service.data_streams?.length || 0}):`);
      service.data_streams?.forEach((stream, index) => {
        console.log(`  ${index + 1}. ${stream.name} - ${stream.stream_type}`);
      });
      return service;
    } else {
      console.error('❌ Failed to get service details:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting service details:', error.message);
    return null;
  }
}

async function cleanupDemoService(serviceId) {
  console.log('\n🧹 Cleaning up demo service...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Demo service deleted successfully');
    } else {
      console.log('⚠️  Could not delete service:', result.error);
    }
  } catch (error) {
    console.log('⚠️  Error during cleanup:', error.message);
  }
}

async function runDemo() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       Service Bundling with Data Streams Demo         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    // Check if server is running
    console.log(`\n🔌 Connecting to API server at ${API_BASE_URL}...`);
    
    // Step 1: Test endpoint registry
    const endpoints = await testEndpointRegistry();
    if (endpoints.length === 0) {
      console.log('\n⚠️  No endpoints available. Make sure the server is running and endpoints are registered.');
      return;
    }
    
    await delay(1000);
    
    // Step 2: Create demo service
    const service = await createDemoService(endpoints);
    if (!service) {
      console.log('\n⚠️  Could not create service. Continuing with existing services...');
    }
    
    await delay(1000);
    
    // Step 3: List all services
    const services = await listServices();
    
    await delay(1000);
    
    // Step 4: Get details of created service or first available
    const targetService = service || services[0];
    if (targetService) {
      const details = await getServiceDetails(targetService.service_id);
      
      await delay(1000);
      
      // Step 5: Test dynamic routing
      if (details) {
        await testDynamicRouting(details.name);
      }
      
      // Step 6: Cleanup if we created a demo service
      if (service) {
        await delay(2000);
        await cleanupDemoService(service.service_id);
      }
    }
    
    console.log('\n✅ Demo completed successfully!\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Access the UI: http://localhost:3000');
    console.log('2. Navigate to Service Management');
    console.log('3. Create services with bundled endpoints');
    console.log('4. Use dynamic routing: /api/service/:name/data-stream/:endpoint\n');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runDemo };
