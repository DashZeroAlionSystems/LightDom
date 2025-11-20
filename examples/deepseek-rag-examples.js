/**
 * Example: Using DeepSeek RAG System with Computer Use
 * Demonstrates various capabilities including code understanding, Git operations, and task automation
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE = 'http://localhost:3001/api/enhanced-rag';

// Helper to make streaming requests
async function chatWithDeepSeek(message, mode = 'assistant', enableTools = true) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🤖 DeepSeek (${mode} mode)`);
  console.log(`${'='.repeat(60)}`);
  console.log(`👤 User: ${message}\n`);
  console.log(`💭 DeepSeek:`);
  
  const response = await fetch(`${API_BASE}/chat/tools/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      mode,
      enableTools
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const reader = response.body;
  let buffer = '';

  for await (const chunk of reader) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          console.log('\n');
          return;
        }
        
        try {
          const event = JSON.parse(data);
          
          switch (event.type) {
            case 'chunk':
              process.stdout.write(event.content);
              break;
            
            case 'tool_call':
              console.log(`\n🔧 Executing: ${event.tool}(${JSON.stringify(event.params)})`);
              break;
            
            case 'tool_result':
              if (event.result.success) {
                console.log(`✅ Success`);
              } else {
                console.log(`❌ Failed: ${event.result.error}`);
              }
              break;
            
            case 'warning':
              console.log(`\n⚠️  ${event.content}`);
              break;
          }
        } catch (error) {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Helper for direct tool execution
async function executeTool(tool, params = {}) {
  console.log(`\n🔧 Executing tool: ${tool}`);
  console.log(`📝 Parameters:`, params);
  
  const response = await fetch(`${API_BASE}/tool/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, params })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`✅ Success:`, result.result);
  } else {
    console.log(`❌ Failed:`, result.error);
  }
  
  return result;
}

// Example scenarios
async function runExamples() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     DeepSeek RAG System with Computer Use Examples        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

  try {
    // Example 1: System Information
    console.log('\n📊 Example 1: Get System Information\n');
    await chatWithDeepSeek(
      'What system am I running on? Show me the environment.',
      'assistant',
      true
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 2: Project Information
    console.log('\n📦 Example 2: Get Project Information\n');
    await chatWithDeepSeek(
      'Tell me about this project. What is it and what scripts are available?',
      'developer',
      true
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 3: Git Status
    console.log('\n🔀 Example 3: Check Git Status\n');
    await chatWithDeepSeek(
      'Show me the current Git status of this repository.',
      'gitWorkflow',
      true
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 4: Code Understanding
    console.log('\n🧠 Example 4: Code Understanding\n');
    await chatWithDeepSeek(
      'Explain how the enhanced RAG service works in this codebase.',
      'codebaseExpert',
      false
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 5: Direct Tool Call - List Files
    console.log('\n📂 Example 5: List Files in Services Directory\n');
    await executeTool('file.list', { dirPath: './services/rag' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 6: Architecture Question
    console.log('\n🏗️  Example 6: Architecture Discussion\n');
    await chatWithDeepSeek(
      'What is the architecture of the RAG system? How does it integrate with Ollama?',
      'architecture',
      false
    );
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                     Examples Complete!                     ║
║                                                            ║
║  Try creating your own conversations with DeepSeek:        ║
║                                                            ║
║  • Ask about code: "How does X work?"                     ║
║  • Execute tasks: "Start the project"                     ║
║  • Git operations: "Create a feature branch"              ║
║  • Debug: "Help me fix this error"                        ║
║  • Review: "Review this code"                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

  } catch (error) {
    console.error('\n❌ Error running examples:', error.message);
    console.error('\nMake sure:');
    console.error('1. Ollama is running: ollama serve');
    console.error('2. API server is running: npm run start:dev');
    console.error('3. DeepSeek model is pulled: ollama pull deepseek-r1:latest');
  }
}

// Run examples
runExamples().catch(console.error);
