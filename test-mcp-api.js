/**
 * Test MCP Server Management API
 * Validates CRUD operations and schema linking
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';

async function testMCPServerAPI() {
  console.log('🧪 Testing MCP Server Management API\n');
  
  let createdServerId = null;
  
  try {
    // Test 1: List servers
    console.log('1️⃣ Testing GET /api/mcp/servers...');
    const listResponse = await fetch(`${API_BASE}/api/mcp/servers`);
    const listData = await listResponse.json();
    console.log(`✅ Listed ${listData.servers?.length || 0} servers`);
    console.log(`   Response:`, JSON.stringify(listData, null, 2));
    
    // Test 2: List schemas
    console.log('\n2️⃣ Testing GET /api/mcp/schemas...');
    const schemasResponse = await fetch(`${API_BASE}/api/mcp/schemas`);
    const schemasData = await schemasResponse.json();
    console.log(`✅ Listed ${schemasData.schemas?.length || 0} schemas`);
    
    // Test 3: Create a new MCP server
    console.log('\n3️⃣ Testing POST /api/mcp/servers...');
    const createPayload = {
      name: 'Test SEO Agent',
      description: 'Test DeepSeek agent for SEO optimization',
      agent_type: 'deepseek',
      model_name: 'deepseek-r1',
      topic: 'seo-testing',
      schema_ids: schemasData.schemas?.slice(0, 2).map(s => s.id) || [],
      config: {
        temperature: 0.7,
        max_tokens: 2000
      },
      active: true
    };
    
    const createResponse = await fetch(`${API_BASE}/api/mcp/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload)
    });
    const createData = await createResponse.json();
    
    if (createData.success) {
      createdServerId = createData.server.id;
      console.log(`✅ Created server with ID: ${createdServerId}`);
      console.log(`   Server:`, JSON.stringify(createData.server, null, 2));
    } else {
      console.log(`❌ Failed to create server:`, createData.error);
    }
    
    // Test 4: Get server details
    if (createdServerId) {
      console.log(`\n4️⃣ Testing GET /api/mcp/servers/${createdServerId}...`);
      const detailsResponse = await fetch(`${API_BASE}/api/mcp/servers/${createdServerId}`);
      const detailsData = await detailsResponse.json();
      console.log(`✅ Retrieved server details`);
      console.log(`   Linked Schemas: ${detailsData.server?.linked_schemas?.length || 0}`);
    }
    
    // Test 5: Update server
    if (createdServerId) {
      console.log(`\n5️⃣ Testing PUT /api/mcp/servers/${createdServerId}...`);
      const updatePayload = {
        description: 'Updated test description',
        active: false
      };
      
      const updateResponse = await fetch(`${API_BASE}/api/mcp/servers/${createdServerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        console.log(`✅ Updated server`);
        console.log(`   Active: ${updateData.server.active}`);
      } else {
        console.log(`❌ Failed to update server:`, updateData.error);
      }
    }
    
    // Test 6: Execute tool
    if (createdServerId) {
      console.log(`\n6️⃣ Testing POST /api/mcp/servers/${createdServerId}/execute...`);
      const executePayload = {
        tool_name: 'analyze_seo',
        args: {
          url: 'https://example.com',
          metrics: ['speed', 'seo', 'accessibility']
        },
        context: {
          campaign: 'test-campaign'
        }
      };
      
      const executeResponse = await fetch(`${API_BASE}/api/mcp/servers/${createdServerId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executePayload)
      });
      const executeData = await executeResponse.json();
      
      if (executeData.success) {
        console.log(`✅ Tool executed successfully`);
        console.log(`   Execution ID: ${executeData.result.executionId}`);
      } else {
        console.log(`❌ Failed to execute tool:`, executeData.error);
      }
    }
    
    // Test 7: Get executions
    if (createdServerId) {
      console.log(`\n7️⃣ Testing GET /api/mcp/servers/${createdServerId}/executions...`);
      const executionsResponse = await fetch(`${API_BASE}/api/mcp/servers/${createdServerId}/executions`);
      const executionsData = await executionsResponse.json();
      
      if (executionsData.success) {
        console.log(`✅ Retrieved ${executionsData.executions?.length || 0} executions`);
      }
    }
    
    // Test 8: Health check
    console.log('\n8️⃣ Testing GET /api/mcp/health...');
    const healthResponse = await fetch(`${API_BASE}/api/mcp/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log(`✅ Health check passed`);
      console.log(`   Stats:`, JSON.stringify(healthData.health.stats, null, 2));
    }
    
    // Test 9: Delete server (cleanup)
    if (createdServerId) {
      console.log(`\n9️⃣ Testing DELETE /api/mcp/servers/${createdServerId}...`);
      const deleteResponse = await fetch(`${API_BASE}/api/mcp/servers/${createdServerId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      
      if (deleteData.success) {
        console.log(`✅ Deleted server`);
      } else {
        console.log(`❌ Failed to delete server:`, deleteData.error);
      }
    }
    
    console.log('\n✅ All API tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
  }
}

// Run tests
testMCPServerAPI().catch(console.error);
