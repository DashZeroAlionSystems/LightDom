/**
 * N8N MCP Server Starter
 * Starts the MCP server for n8n workflow management
 */

import { n8nMCPServer } from './services/n8n-mcp-server.js';

async function start() {
  try {
    console.log('🚀 Starting N8N MCP Server...');
    
    await n8nMCPServer.start();
    
    console.log('✅ MCP Server is running');
    console.log('   Health: http://localhost:8090/mcp/health');
    console.log('   Tools: http://localhost:8090/mcp/tools');
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down MCP server...');
  await n8nMCPServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down MCP server...');
  await n8nMCPServer.stop();
  process.exit(0);
});

start();
