/**
 * Basic Tests for Agent Mode Orchestration System
 * 
 * Run with: node test-agent-orchestration.js
 */

// Mock database for testing without actual PostgreSQL
class MockDatabase {
  async query(sql, params) {
    // Return mock data based on query
    if (sql.includes('error_reports')) {
      return {
        rows: [{
          id: '123e4567-e89b-12d3-a456-426614174000',
          error_hash: 'abc123def456',
          error_type: 'TypeError',
          severity: 'error',
          component: 'api-server',
          service: 'auth',
          message: 'Cannot read property of undefined',
          stack_trace: 'at /app/api-server.js:123',
          context: {},
          occurrence_count: 5,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }]
      };
    }
    
    if (sql.includes('INSERT INTO')) {
      return { rows: [{ id: '123e4567-e89b-12d3-a456-426614174000' }] };
    }
    
    return { rows: [] };
  }
}

async function testHealthCheckService() {
  console.log('\n🧪 Testing Health Check Service...');
  
  try {
    const { BidirectionalHealthCheckService } = await import('./services/bidirectional-health-check.service.js');
    
    const healthCheck = new BidirectionalHealthCheckService({
      enableBidirectionalStream: false, // Disable WebSocket for test
      checkInterval: 60000,
    });
    
    // Load configuration
    await healthCheck.loadServiceConfig();
    
    console.log('✅ Health check service configuration loaded');
    console.log(`   Services: ${Object.keys(healthCheck.serviceConfig.services).length}`);
    
    // Initialize health status
    healthCheck.initializeHealthStatus();
    
    console.log('✅ Health status initialized');
    console.log(`   Tracking: ${healthCheck.healthStatus.size} services`);
    
    // Get status
    const status = healthCheck.getHealthStatus();
    
    console.log('✅ Health status retrieved');
    console.log(`   Summary: ${status.summary.total} total, ${status.summary.unknown} unknown`);
    
    return true;
  } catch (error) {
    console.error('❌ Health check test failed:', error.message);
    return false;
  }
}

async function testAgentInvestigationService() {
  console.log('\n🧪 Testing Agent Investigation Service...');
  
  try {
    const { AgentModeInvestigationService } = await import('./services/agent-mode-investigation.service.js');
    
    const db = new MockDatabase();
    const investigation = new AgentModeInvestigationService({ db });
    
    console.log('✅ Investigation service created');
    
    // Test error report retrieval
    const error = await investigation.getErrorReport('123e4567-e89b-12d3-a456-426614174000');
    
    if (error) {
      console.log('✅ Error report retrieved');
      console.log(`   Type: ${error.error_type}, Component: ${error.component}`);
    } else {
      console.log('ℹ️  No error report found (expected with mock DB)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Investigation test failed:', error.message);
    return false;
  }
}

async function testAgentSpawner() {
  console.log('\n🧪 Testing Agent Spawner Service...');
  
  try {
    const { DeepSeekAgentSpawner } = await import('./services/deepseek-agent-spawner.service.js');
    
    const db = new MockDatabase();
    const spawner = new DeepSeekAgentSpawner({
      db,
      maxConcurrentAgents: 3,
    });
    
    console.log('✅ Agent spawner created');
    console.log(`   Max concurrent agents: ${spawner.config.maxConcurrentAgents}`);
    
    // Get queue status
    const queueStatus = spawner.getQueueStatus();
    
    console.log('✅ Queue status retrieved');
    console.log(`   Queued: ${queueStatus.queued}, Active: ${queueStatus.active}`);
    
    return true;
  } catch (error) {
    console.error('❌ Agent spawner test failed:', error.message);
    return false;
  }
}

async function testGitHubAutomation() {
  console.log('\n🧪 Testing GitHub Automation Service...');
  
  try {
    const { GitHubAutomationService } = await import('./services/github-automation.service.js');
    
    const db = new MockDatabase();
    const github = new GitHubAutomationService({
      db,
      autoAssign: true,
    });
    
    console.log('✅ GitHub automation service created');
    
    if (!github.octokit) {
      console.log('ℹ️  GitHub token not configured (expected)');
    }
    
    // Test title generation
    const mockError = {
      severity: 'error',
      error_type: 'TypeError',
      component: 'api-server',
    };
    
    const title = github.generateIssueTitle(mockError);
    console.log('✅ Issue title generated');
    console.log(`   Title: ${title}`);
    
    return true;
  } catch (error) {
    console.error('❌ GitHub automation test failed:', error.message);
    return false;
  }
}

async function testGitMcpBridge() {
  console.log('\n🧪 Testing Git MCP Bridge...');
  
  try {
    const { GitMcpOllamaBridge } = await import('./services/git-mcp-ollama-bridge.service.js');
    
    const bridge = new GitMcpOllamaBridge({
      autoSync: false, // Disable auto-sync for test
    });
    
    console.log('✅ Git MCP bridge created');
    
    // Check sync status
    const status = await bridge.getSyncStatus();
    
    console.log('✅ Sync status retrieved');
    console.log(`   Branch: ${status.branch}`);
    console.log(`   Modified: ${status.modified}, Untracked: ${status.untracked}`);
    
    return true;
  } catch (error) {
    console.error('❌ Git MCP bridge test failed:', error.message);
    return false;
  }
}

async function testServiceDependencies() {
  console.log('\n🧪 Testing Service Dependencies Configuration...');
  
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), 'config', 'service-dependencies.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    console.log('✅ Configuration loaded');
    console.log(`   Services: ${Object.keys(config.services).length}`);
    console.log(`   Service relationships: ${Object.keys(config.serviceRelationships).length}`);
    
    // Validate structure
    for (const [serviceId, serviceInfo] of Object.entries(config.services)) {
      if (!serviceInfo.name) {
        throw new Error(`Service ${serviceId} missing name`);
      }
      
      if (!serviceInfo.healthCheck) {
        console.log(`   ⚠️  Service ${serviceId} has no health check defined`);
      }
    }
    
    console.log('✅ Configuration structure validated');
    
    return true;
  } catch (error) {
    console.error('❌ Service dependencies test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running Agent Mode Orchestration Tests\n');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Service Dependencies', fn: testServiceDependencies },
    { name: 'Health Check Service', fn: testHealthCheckService },
    { name: 'Agent Investigation', fn: testAgentInvestigationService },
    { name: 'Agent Spawner', fn: testAgentSpawner },
    { name: 'GitHub Automation', fn: testGitHubAutomation },
    { name: 'Git MCP Bridge', fn: testGitMcpBridge },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`\n❌ Test '${test.name}' threw error:`, error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
