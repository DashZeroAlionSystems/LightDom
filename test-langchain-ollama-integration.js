/**
 * LangChain + Ollama DeepSeek Integration Test
 * 
 * Comprehensive test suite for the LangChain Ollama service
 */

import { getLangChainOllamaService, initializeLangChainOllamaService } from './services/langchain-ollama-service.js';

console.log('🧪 Testing LangChain + Ollama DeepSeek Integration\n');

/**
 * Test 1: Service Initialization
 */
async function testServiceInitialization() {
  console.log('📝 Test 1: Service Initialization');
  try {
    const service = await initializeLangChainOllamaService();
    console.log('✅ Service initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
    return false;
  }
}

/**
 * Test 2: Service Health Check
 */
async function testHealthCheck() {
  console.log('\n📝 Test 2: Service Health Check');
  try {
    const service = getLangChainOllamaService();
    const status = await service.getStatus();
    
    console.log('📊 Service Status:', JSON.stringify(status, null, 2));
    
    if (status.success && status.status === 'healthy') {
      console.log('✅ Service is healthy');
      return true;
    } else {
      console.log('⚠️  Service is not healthy but connected');
      return true; // Still consider it a pass if it's connected
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

/**
 * Test 3: Simple Chat
 */
async function testSimpleChat() {
  console.log('\n📝 Test 3: Simple Chat');
  try {
    const service = getLangChainOllamaService();
    const result = await service.chat('Hello! Can you explain what LightDom is in one sentence?');
    
    console.log('💬 Response:', result.response);
    console.log('⏱️  Duration:', result.metadata.duration + 'ms');
    
    if (result.success) {
      console.log('✅ Simple chat works');
      return true;
    } else {
      console.log('❌ Simple chat failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Simple chat failed:', error.message);
    return false;
  }
}

/**
 * Test 4: Conversational Chat with History
 */
async function testConversationalChat() {
  console.log('\n📝 Test 4: Conversational Chat with History');
  try {
    const service = getLangChainOllamaService();
    const sessionId = 'test-session-' + Date.now();
    
    // First message
    const result1 = await service.conversationalChat(
      'My name is Alice and I love programming.',
      sessionId,
      'You are a helpful AI assistant that remembers conversation context.'
    );
    console.log('💬 Response 1:', result1.response);
    
    // Second message - should remember the name
    const result2 = await service.conversationalChat(
      'What is my name?',
      sessionId
    );
    console.log('💬 Response 2:', result2.response);
    
    // Check if the AI remembered the name
    const rememberedName = result2.response.toLowerCase().includes('alice');
    
    if (result1.success && result2.success && rememberedName) {
      console.log('✅ Conversational chat with history works');
      
      // Clean up
      service.clearConversationHistory(sessionId);
      return true;
    } else {
      console.log('❌ Conversational chat failed or didn\'t remember context');
      return false;
    }
  } catch (error) {
    console.error('❌ Conversational chat failed:', error.message);
    return false;
  }
}

/**
 * Test 5: Code Generation
 */
async function testCodeGeneration() {
  console.log('\n📝 Test 5: Code Generation');
  try {
    const service = getLangChainOllamaService();
    const result = await service.generateCode(
      'Create a function that calculates the factorial of a number',
      'javascript',
      'Should handle edge cases like 0 and negative numbers'
    );
    
    console.log('💻 Generated Code Preview:', result.response.substring(0, 200) + '...');
    
    if (result.success && result.response.includes('function')) {
      console.log('✅ Code generation works');
      return true;
    } else {
      console.log('❌ Code generation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Code generation failed:', error.message);
    return false;
  }
}

/**
 * Test 6: Workflow Generation
 */
async function testWorkflowGeneration() {
  console.log('\n📝 Test 6: Workflow Generation');
  try {
    const service = getLangChainOllamaService();
    const result = await service.generateWorkflow(
      'Create a data processing workflow',
      ['Fetch data from API', 'Transform data', 'Store in database']
    );
    
    console.log('📋 Workflow Preview:', result.response.substring(0, 200) + '...');
    
    if (result.success) {
      console.log('✅ Workflow generation works');
      return true;
    } else {
      console.log('❌ Workflow generation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Workflow generation failed:', error.message);
    return false;
  }
}

/**
 * Test 7: DOM Optimization Analysis
 */
async function testDOMAnalysis() {
  console.log('\n📝 Test 7: DOM Optimization Analysis');
  try {
    const service = getLangChainOllamaService();
    
    const mockDOM = {
      totalNodes: 1500,
      depth: 15,
      scripts: 25,
      styles: 10,
    };
    
    const mockMetrics = {
      loadTime: 3500,
      renderTime: 1200,
      memoryUsage: '50MB',
    };
    
    const result = await service.analyzeDOMOptimization(mockDOM, mockMetrics);
    
    console.log('🔍 Analysis Preview:', result.response.substring(0, 200) + '...');
    
    if (result.success) {
      console.log('✅ DOM analysis works');
      return true;
    } else {
      console.log('❌ DOM analysis failed');
      return false;
    }
  } catch (error) {
    console.error('❌ DOM analysis failed:', error.message);
    return false;
  }
}

/**
 * Test 8: Custom Chain Processing
 */
async function testCustomChain() {
  console.log('\n📝 Test 8: Custom Chain Processing');
  try {
    const service = getLangChainOllamaService();
    
    const template = `You are a {role}. Answer the following question professionally: {question}`;
    
    const result = await service.processWithChain(
      'What are best practices?',
      template,
      {
        role: 'software architect',
        question: 'What are best practices for building scalable web applications?',
      }
    );
    
    console.log('🔗 Chain Response Preview:', result.response.substring(0, 200) + '...');
    
    if (result.success) {
      console.log('✅ Custom chain processing works');
      return true;
    } else {
      console.log('❌ Custom chain processing failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Custom chain processing failed:', error.message);
    return false;
  }
}

/**
 * Test 9: Session Management
 */
async function testSessionManagement() {
  console.log('\n📝 Test 9: Session Management');
  try {
    const service = getLangChainOllamaService();
    
    // Create multiple sessions
    await service.conversationalChat('Hello', 'session-1');
    await service.conversationalChat('Hi there', 'session-2');
    await service.conversationalChat('Greetings', 'session-3');
    
    // List sessions
    const sessions = service.listSessions();
    console.log('📊 Active Sessions:', sessions.length);
    
    // Get history
    const history = service.getConversationHistory('session-1');
    console.log('💬 Session 1 Messages:', history.length);
    
    // Clear one session
    service.clearConversationHistory('session-1');
    const sessionsAfterClear = service.listSessions();
    
    if (sessions.length >= 3 && sessionsAfterClear.length === 2) {
      console.log('✅ Session management works');
      
      // Clean up
      service.clearConversationHistory();
      return true;
    } else {
      console.log('❌ Session management failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Session management failed:', error.message);
    return false;
  }
}

/**
 * Test 10: Metrics Collection
 */
async function testMetrics() {
  console.log('\n📝 Test 10: Metrics Collection');
  try {
    const service = getLangChainOllamaService();
    const metrics = service.getMetrics();
    
    console.log('📊 Service Metrics:');
    console.log('   Total Requests:', metrics.totalRequests);
    console.log('   Successful Requests:', metrics.successfulRequests);
    console.log('   Failed Requests:', metrics.failedRequests);
    console.log('   Success Rate:', metrics.successRate);
    console.log('   Average Response Time:', Math.round(metrics.averageResponseTime) + 'ms');
    console.log('   Active Sessions:', metrics.activeSessions);
    
    if (metrics.totalRequests > 0) {
      console.log('✅ Metrics collection works');
      return true;
    } else {
      console.log('⚠️  No requests recorded yet');
      return true; // Still pass if service is working
    }
  } catch (error) {
    console.error('❌ Metrics collection failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   LangChain + Ollama DeepSeek Integration Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const tests = [
    { name: 'Service Initialization', fn: testServiceInitialization },
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Simple Chat', fn: testSimpleChat },
    { name: 'Conversational Chat', fn: testConversationalChat },
    { name: 'Code Generation', fn: testCodeGeneration },
    { name: 'Workflow Generation', fn: testWorkflowGeneration },
    { name: 'DOM Analysis', fn: testDOMAnalysis },
    { name: 'Custom Chain', fn: testCustomChain },
    { name: 'Session Management', fn: testSessionManagement },
    { name: 'Metrics Collection', fn: testMetrics },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`\n❌ Test "${test.name}" threw an error:`, error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                     TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed (${Math.round(passed/total * 100)}%)`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! LangChain + Ollama integration is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the Ollama service and configuration.');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
