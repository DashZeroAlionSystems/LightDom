/**
 * LangChain + Ollama DeepSeek Examples
 * 
 * Practical examples showing how to use the LangChain integration
 */

import { getLangChainOllamaService, initializeLangChainOllamaService } from './services/langchain-ollama-service.js';

console.log('🎯 LangChain + Ollama DeepSeek Examples\n');

/**
 * Example 1: Simple Chat
 */
async function example1_SimpleChat() {
  console.log('📝 Example 1: Simple Chat');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  const result = await service.chat(
    'Explain what LightDom does in 2 sentences.'
  );
  
  console.log('Q: Explain what LightDom does in 2 sentences.');
  console.log(`A: ${result.response}\n`);
  console.log(`⏱️  Response time: ${result.metadata.duration}ms\n`);
}

/**
 * Example 2: Conversational Chat with Context
 */
async function example2_ConversationalChat() {
  console.log('📝 Example 2: Conversational Chat with Context');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  const sessionId = 'example-session';
  
  // First message
  const msg1 = await service.conversationalChat(
    'My name is Alex and I am learning web development.',
    sessionId,
    'You are a friendly mentor for web developers.'
  );
  console.log('User: My name is Alex and I am learning web development.');
  console.log(`AI: ${msg1.response}\n`);
  
  // Second message - AI should remember the name
  const msg2 = await service.conversationalChat(
    'What should I learn first?',
    sessionId
  );
  console.log('User: What should I learn first?');
  console.log(`AI: ${msg2.response}\n`);
  
  // Third message - AI should remember previous context
  const msg3 = await service.conversationalChat(
    'Can you remind me what my name is?',
    sessionId
  );
  console.log('User: Can you remind me what my name is?');
  console.log(`AI: ${msg3.response}\n`);
  
  // Clean up
  service.clearConversationHistory(sessionId);
}

/**
 * Example 3: Code Generation
 */
async function example3_CodeGeneration() {
  console.log('📝 Example 3: Code Generation');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  const result = await service.generateCode(
    'Create a function that debounces another function',
    'javascript',
    'Use modern ES6+ syntax with arrow functions'
  );
  
  console.log('Request: Create a debounce function');
  console.log('Language: JavaScript');
  console.log('\nGenerated Code:');
  console.log('─────────────────────────────────────');
  console.log(result.response);
  console.log('─────────────────────────────────────\n');
}

/**
 * Example 4: Workflow Generation
 */
async function example4_WorkflowGeneration() {
  console.log('📝 Example 4: Workflow Generation');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  const result = await service.generateWorkflow(
    'User onboarding workflow for a web application',
    [
      'User signs up with email',
      'Send verification email',
      'User verifies email',
      'Show onboarding tutorial',
      'Create user profile',
      'Send welcome email'
    ]
  );
  
  console.log('Request: User onboarding workflow');
  console.log('\nGenerated Workflow:');
  console.log('─────────────────────────────────────');
  console.log(result.response);
  console.log('─────────────────────────────────────\n');
}

/**
 * Example 5: DOM Optimization Analysis
 */
async function example5_DOMOptimization() {
  console.log('📝 Example 5: DOM Optimization Analysis');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  const domStructure = {
    totalNodes: 2500,
    depth: 18,
    scripts: 35,
    styles: 12,
    images: 150,
    iframes: 3,
  };
  
  const metrics = {
    loadTime: 4500,
    renderTime: 1800,
    memoryUsage: '85MB',
    fps: 45,
    interactions: 250,
  };
  
  const result = await service.analyzeDOMOptimization(domStructure, metrics);
  
  console.log('DOM Structure:', JSON.stringify(domStructure, null, 2));
  console.log('\nPerformance Metrics:', JSON.stringify(metrics, null, 2));
  console.log('\nOptimization Analysis:');
  console.log('─────────────────────────────────────');
  console.log(result.response);
  console.log('─────────────────────────────────────\n');
}

/**
 * Example 6: Custom Chain Processing
 */
async function example6_CustomChain() {
  console.log('📝 Example 6: Custom Chain Processing');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  const template = `You are a {role} with expertise in {domain}.

Task: {task}

Provide your professional opinion with specific recommendations.`;
  
  const result = await service.processWithChain(
    'How can we improve system performance?',
    template,
    {
      role: 'Senior Software Architect',
      domain: 'distributed systems and scalability',
      task: 'Analyze system performance bottlenecks and provide optimization strategies',
    }
  );
  
  console.log('Custom Chain Template Used');
  console.log('\nResponse:');
  console.log('─────────────────────────────────────');
  console.log(result.response);
  console.log('─────────────────────────────────────\n');
}

/**
 * Example 7: Building a Code Assistant
 */
async function example7_CodeAssistant() {
  console.log('📝 Example 7: Building a Code Assistant');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  const sessionId = 'code-assistant';
  
  // Generate initial code
  const codeResult = await service.generateCode(
    'Create a React hook for fetching data with loading and error states',
    'typescript'
  );
  
  console.log('Generated Code:');
  console.log(codeResult.response.substring(0, 300) + '...\n');
  
  // Start code review conversation
  const review = await service.conversationalChat(
    'Can you review this code and suggest improvements for error handling?',
    sessionId,
    'You are an expert code reviewer specializing in React and TypeScript'
  );
  
  console.log('Code Review:');
  console.log(review.response.substring(0, 300) + '...\n');
  
  // Ask follow-up question
  const followup = await service.conversationalChat(
    'How would you add caching to this hook?',
    sessionId
  );
  
  console.log('Follow-up Answer:');
  console.log(followup.response.substring(0, 300) + '...\n');
  
  // Clean up
  service.clearConversationHistory(sessionId);
}

/**
 * Example 8: Multi-Agent Pattern
 */
async function example8_MultiAgent() {
  console.log('📝 Example 8: Multi-Agent Pattern');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  const task = 'Build a real-time chat application';
  
  // Agent 1: Strategic Planner
  console.log('🎯 Agent 1: Strategic Planner');
  const plan = await service.conversationalChat(
    `Create a high-level plan for: ${task}`,
    'planner-agent',
    'You are a strategic technical planner who creates comprehensive project plans'
  );
  console.log(plan.response.substring(0, 200) + '...\n');
  
  // Agent 2: Technical Architect
  console.log('🏗️  Agent 2: Technical Architect');
  const architecture = await service.conversationalChat(
    `Design the technical architecture for: ${task}`,
    'architect-agent',
    'You are a senior software architect who designs scalable systems'
  );
  console.log(architecture.response.substring(0, 200) + '...\n');
  
  // Agent 3: Security Expert
  console.log('🔒 Agent 3: Security Expert');
  const security = await service.conversationalChat(
    `Identify security considerations for: ${task}`,
    'security-agent',
    'You are a security expert who identifies vulnerabilities and provides solutions'
  );
  console.log(security.response.substring(0, 200) + '...\n');
  
  // Clean up
  service.clearConversationHistory('planner-agent');
  service.clearConversationHistory('architect-agent');
  service.clearConversationHistory('security-agent');
}

/**
 * Example 9: Session Management
 */
async function example9_SessionManagement() {
  console.log('📝 Example 9: Session Management');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  // Create multiple sessions
  await service.conversationalChat('Hello from session 1', 'demo-session-1');
  await service.conversationalChat('Hello from session 2', 'demo-session-2');
  await service.conversationalChat('Hello from session 3', 'demo-session-3');
  
  // List all sessions
  const sessions = service.listSessions();
  console.log('Active Sessions:');
  sessions.forEach(session => {
    console.log(`  - ${session.sessionId}: ${session.messageCount} messages`);
  });
  console.log();
  
  // Get history for one session
  const history = service.getConversationHistory('demo-session-1');
  console.log(`History for demo-session-1: ${history.length} messages`);
  
  // Clear one session
  service.clearConversationHistory('demo-session-1');
  console.log('Cleared demo-session-1');
  
  // List sessions again
  const updatedSessions = service.listSessions();
  console.log(`\nRemaining sessions: ${updatedSessions.length}`);
  
  // Clean up all
  service.clearConversationHistory();
  console.log('All sessions cleared\n');
}

/**
 * Example 10: Performance Monitoring
 */
async function example10_PerformanceMonitoring() {
  console.log('📝 Example 10: Performance Monitoring');
  console.log('─────────────────────────────────────\n');
  
  const service = getLangChainOllamaService();
  
  // Make several requests
  await service.chat('Test message 1');
  await service.chat('Test message 2');
  await service.chat('Test message 3');
  
  // Get metrics
  const metrics = service.getMetrics();
  
  console.log('Service Metrics:');
  console.log('─────────────────────────────────────');
  console.log(`Total Requests:       ${metrics.totalRequests}`);
  console.log(`Successful Requests:  ${metrics.successfulRequests}`);
  console.log(`Failed Requests:      ${metrics.failedRequests}`);
  console.log(`Success Rate:         ${metrics.successRate}`);
  console.log(`Avg Response Time:    ${Math.round(metrics.averageResponseTime)}ms`);
  console.log(`Active Sessions:      ${metrics.activeSessions}`);
  console.log('─────────────────────────────────────\n');
  
  // Check health status
  const status = await service.getStatus();
  console.log('Service Status:');
  console.log('─────────────────────────────────────');
  console.log(`Status:               ${status.status}`);
  console.log(`Model:                ${status.config?.model}`);
  console.log(`Base URL:             ${status.config?.baseUrl}`);
  console.log(`Connection Test:      ${status.connectionTest || 'N/A'}`);
  console.log('─────────────────────────────────────\n');
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   LangChain + Ollama DeepSeek Practical Examples');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    // Initialize service
    console.log('🚀 Initializing LangChain Ollama Service...\n');
    await initializeLangChainOllamaService();
    
    // Run examples
    await example1_SimpleChat();
    await example2_ConversationalChat();
    await example3_CodeGeneration();
    await example4_WorkflowGeneration();
    await example5_DOMOptimization();
    await example6_CustomChain();
    await example7_CodeAssistant();
    await example8_MultiAgent();
    await example9_SessionManagement();
    await example10_PerformanceMonitoring();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ✅ All examples completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
    console.error('\nMake sure:');
    console.error('1. Ollama is installed and running');
    console.error('2. DeepSeek model is pulled: ollama pull deepseek-r1:latest');
    console.error('3. API server is running on port 3001');
  }
}

// Run examples
runAllExamples().catch(console.error);
