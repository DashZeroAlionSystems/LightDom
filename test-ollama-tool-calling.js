#!/usr/bin/env node

/**
 * LightDom Ollama Tool-Calling Test Script
 * 
 * This script tests the tool-calling capabilities of the configured Ollama model
 * with LightDom's custom Modelfile.
 * 
 * Usage:
 *   node test-ollama-tool-calling.js
 *   node test-ollama-tool-calling.js --model lightdom-deepseek
 *   node test-ollama-tool-calling.js --endpoint http://localhost:11434
 * 
 * Prerequisites:
 *   1. Ollama installed and running (ollama serve)
 *   2. Custom model created: ollama create lightdom-deepseek -f config/ollama/Modelfile.lightdom-deepseek
 */

import { spawn } from 'child_process';

// Configuration
const config = {
  endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'lightdom-deepseek',
  timeout: 60000, // 60 seconds
};

// Parse command line arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--model' && args[i + 1]) {
    config.model = args[i + 1];
    i++;
  } else if (args[i] === '--endpoint' && args[i + 1]) {
    config.endpoint = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
LightDom Ollama Tool-Calling Test Script

Usage:
  node test-ollama-tool-calling.js [options]

Options:
  --model <name>     Ollama model to test (default: lightdom-deepseek)
  --endpoint <url>   Ollama API endpoint (default: http://localhost:11434)
  --help, -h         Show this help message

Prerequisites:
  1. Ollama must be installed and running: ollama serve
  2. Create custom model: ollama create lightdom-deepseek -f config/ollama/Modelfile.lightdom-deepseek
`);
    process.exit(0);
  }
}

// LightDom Tool Definitions
const lightdomTools = [
  {
    type: 'function',
    function: {
      name: 'start_crawler',
      description: 'Start a web crawling session for a target URL. Returns the crawler session ID and status.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The target URL to crawl (must be a valid HTTP/HTTPS URL)'
          },
          depth: {
            type: 'integer',
            description: 'Maximum crawl depth (default: 2)'
          },
          maxPages: {
            type: 'integer',
            description: 'Maximum number of pages to crawl (default: 100)'
          }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_crawler_status',
      description: 'Get the current status of the web crawler, including active sessions and statistics.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_mining_session',
      description: 'Create a new blockchain mining session for DOM optimization proofs.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name for the mining session'
          },
          algorithm: {
            type: 'string',
            description: 'Mining algorithm to use',
            enum: ['poo', 'standard', 'optimized']
          },
          targetUrl: {
            type: 'string',
            description: 'Target URL for optimization mining'
          }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_mining_stats',
      description: 'Retrieve mining statistics including session counts, rewards earned, and performance metrics.',
      parameters: {
        type: 'object',
        properties: {
          sessionId: {
            type: 'string',
            description: 'Optional session ID to get stats for a specific session'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_analytics',
      description: 'Query analytics data from the LightDom dashboard.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Type of analytics to query',
            enum: ['summary', 'real-time', 'domains', 'optimizations']
          },
          timeRange: {
            type: 'string',
            description: 'Time range for analytics',
            enum: ['1h', '24h', '7d', '30d']
          }
        },
        required: ['type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'manage_bridge',
      description: 'Manage metaverse bridges - create, update, or delete bridge configurations.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action to perform',
            enum: ['create', 'update', 'delete', 'list']
          },
          bridgeId: {
            type: 'string',
            description: 'Bridge ID (required for update/delete)'
          },
          name: {
            type: 'string',
            description: 'Bridge name (required for create)'
          },
          type: {
            type: 'string',
            description: 'Bridge type',
            enum: ['portal', 'gateway', 'tunnel']
          },
          config: {
            type: 'object',
            description: 'Bridge configuration object'
          }
        },
        required: ['action']
      }
    }
  }
];

// Test cases for tool calling
const testCases = [
  {
    name: 'Simple Crawler Start',
    message: 'Start crawling the website https://example.com with a depth of 2',
    expectedTool: 'start_crawler',
    expectedArgs: { url: 'https://example.com', depth: 2 }
  },
  {
    name: 'Mining Session Creation',
    message: 'Create a new mining session called "SEO Optimization" for analyzing website performance',
    expectedTool: 'create_mining_session',
    expectedArgs: { name: 'SEO Optimization' }
  },
  {
    name: 'Analytics Query',
    message: 'Show me the real-time analytics data for the last 24 hours',
    expectedTool: 'query_analytics',
    expectedArgs: { type: 'real-time', timeRange: '24h' }
  },
  {
    name: 'Status Check',
    message: 'What is the current status of the crawler?',
    expectedTool: 'get_crawler_status'
  },
  {
    name: 'Bridge Management',
    message: 'List all the metaverse bridges currently configured',
    expectedTool: 'manage_bridge',
    expectedArgs: { action: 'list' }
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Check if Ollama is running and the model is available
 */
async function checkOllamaStatus() {
  log(colors.cyan, '\n📡 Checking Ollama status...');
  
  try {
    const response = await fetch(`${config.endpoint}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    
    log(colors.green, '✅ Ollama is running');
    log(colors.blue, `   Models available: ${data.models?.length || 0}`);
    
    // Check if our model exists
    const modelExists = data.models?.some(m => 
      m.name === config.model || m.name.startsWith(config.model + ':')
    );
    
    if (modelExists) {
      log(colors.green, `✅ Model '${config.model}' is available`);
    } else {
      log(colors.yellow, `⚠️  Model '${config.model}' not found`);
      log(colors.yellow, '   Available models:');
      data.models?.forEach(m => log(colors.yellow, `     - ${m.name}`));
      log(colors.yellow, '\n   To create the LightDom model, run:');
      log(colors.yellow, '   ollama create lightdom-deepseek -f config/ollama/Modelfile.lightdom-deepseek\n');
      return false;
    }
    
    return true;
  } catch (error) {
    log(colors.red, '❌ Failed to connect to Ollama');
    log(colors.red, `   Error: ${error.message}`);
    log(colors.yellow, '\n   Make sure Ollama is running:');
    log(colors.yellow, '   ollama serve\n');
    return false;
  }
}

/**
 * Send a chat message with tools to Ollama
 */
async function sendToolCall(message, tools) {
  const response = await fetch(`${config.endpoint}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'user', content: message }
      ],
      tools: tools,
      stream: false
    }),
    signal: AbortSignal.timeout(config.timeout)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * Extract tool calls from the response
 */
function extractToolCalls(response) {
  const toolCalls = [];
  
  // Check for native tool_calls in response
  if (response.message?.tool_calls) {
    toolCalls.push(...response.message.tool_calls);
  }
  
  // Also try to parse tool calls from the content
  if (response.message?.content) {
    const content = response.message.content;
    
    // Look for JSON tool call patterns
    const jsonPatterns = [
      /\{"tool_call":\s*\{[^}]+\}\}/g,
      /\{"name":\s*"[^"]+",\s*"arguments":\s*\{[^}]*\}\}/g
    ];
    
    for (const pattern of jsonPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          try {
            const parsed = JSON.parse(match);
            if (parsed.tool_call) {
              toolCalls.push({
                function: {
                  name: parsed.tool_call.name,
                  arguments: parsed.tool_call.arguments
                }
              });
            } else if (parsed.name) {
              toolCalls.push({
                function: {
                  name: parsed.name,
                  arguments: parsed.arguments
                }
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }
  
  return toolCalls;
}

/**
 * Run a single test case
 */
async function runTestCase(testCase, index) {
  log(colors.cyan, `\n📋 Test ${index + 1}: ${testCase.name}`);
  log(colors.blue, `   Message: "${testCase.message}"`);
  log(colors.blue, `   Expected tool: ${testCase.expectedTool}`);
  
  try {
    const response = await sendToolCall(testCase.message, lightdomTools);
    
    // Extract tool calls
    const toolCalls = extractToolCalls(response);
    
    if (toolCalls.length > 0) {
      log(colors.green, '   ✅ Tool call detected!');
      
      for (const call of toolCalls) {
        const funcName = call.function?.name || 'unknown';
        const funcArgs = call.function?.arguments || {};
        
        log(colors.magenta, `   📞 Tool: ${funcName}`);
        log(colors.magenta, `   📦 Arguments: ${JSON.stringify(funcArgs, null, 2).replace(/\n/g, '\n   ')}`);
        
        // Check if it matches expected
        if (funcName === testCase.expectedTool) {
          log(colors.green, '   ✅ Correct tool selected!');
          return { success: true, toolCall: call };
        }
      }
      
      log(colors.yellow, `   ⚠️  Expected '${testCase.expectedTool}', got different tool`);
      return { success: false, toolCalls };
    }
    
    // If no tool calls, show the response
    log(colors.yellow, '   ⚠️  No tool call in response');
    log(colors.yellow, `   Response: ${response.message?.content?.substring(0, 200)}...`);
    
    return { success: false, response: response.message?.content };
    
  } catch (error) {
    log(colors.red, `   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test basic model response without tools
 */
async function testBasicResponse() {
  log(colors.cyan, '\n🔧 Testing basic model response...');
  
  try {
    const response = await fetch(`${config.endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: 'What is LightDom and what can you help me with? Keep your response brief.' }
        ],
        stream: false
      }),
      signal: AbortSignal.timeout(config.timeout)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    log(colors.green, '✅ Basic response test passed');
    log(colors.blue, `   Response preview: ${data.message?.content?.substring(0, 200)}...`);
    return true;
    
  } catch (error) {
    log(colors.red, `❌ Basic response test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     LightDom Ollama Tool-Calling Test Suite                    ║
╠════════════════════════════════════════════════════════════════╣
║  Endpoint: ${config.endpoint.padEnd(50)}║
║  Model:    ${config.model.padEnd(50)}║
╚════════════════════════════════════════════════════════════════╝
`);

  // Check Ollama status
  const ollamaReady = await checkOllamaStatus();
  if (!ollamaReady) {
    log(colors.red, '\n❌ Cannot proceed - Ollama not ready');
    process.exit(1);
  }
  
  // Run basic response test
  const basicTestPassed = await testBasicResponse();
  if (!basicTestPassed) {
    log(colors.yellow, '\n⚠️  Basic response test failed, tool tests may not work correctly');
  }
  
  // Run tool calling tests
  log(colors.cyan, '\n' + '═'.repeat(60));
  log(colors.cyan, '🔧 Running Tool Calling Tests');
  log(colors.cyan, '═'.repeat(60));
  
  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const result = await runTestCase(testCases[i], i);
    results.push({
      ...testCases[i],
      ...result
    });
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  log(colors.cyan, '\n' + '═'.repeat(60));
  log(colors.cyan, '📊 Test Summary');
  log(colors.cyan, '═'.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach((r, i) => {
    const status = r.success ? colors.green + '✅ PASS' : colors.red + '❌ FAIL';
    console.log(`${status}${colors.reset} - Test ${i + 1}: ${r.name}`);
  });
  
  console.log();
  log(colors.cyan, `Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (passed === results.length) {
    log(colors.green, '\n🎉 All tests passed! Tool calling is working correctly.');
  } else if (passed > 0) {
    log(colors.yellow, '\n⚠️  Some tests passed. Tool calling is partially working.');
    log(colors.yellow, '   Note: DeepSeek R1 tool calling support may vary by model version.');
    log(colors.yellow, '   Try using deepseek-r1:0528 or later for better tool support.');
  } else {
    log(colors.red, '\n❌ All tests failed. Tool calling may not be supported by this model.');
    log(colors.yellow, '\nSuggestions:');
    log(colors.yellow, '1. Ensure you are using a tool-enabled DeepSeek model (v0528 or later)');
    log(colors.yellow, '2. Try: ollama pull deepseek-r1:14b');
    log(colors.yellow, '3. Recreate the custom model with the updated Modelfile');
    log(colors.yellow, '4. Check Ollama logs for errors');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run main
main().catch(error => {
  log(colors.red, `\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
