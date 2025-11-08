#!/usr/bin/env node

/**
 * DeepSeek Orchestration Service
 * Lightweight Express server that exposes DeepSeek automation endpoints
 * and provides a health check for the startup script.
 * 
 * Now includes MCP Tools integration for enhanced capabilities
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { spawn } from 'child_process';
import { Pool } from 'pg';
import deepSeekService from '../services/deepseek-api-service.js';

const PORT = Number(process.env.DEEPSEEK_PORT || 4100);
const HOST = process.env.DEEPSEEK_HOST || '0.0.0.0';

// MCP Tools Integration
let mcpServerProcess = null;
let mcpToolsAvailable = false;
let toolsRegistry = null;

// Initialize database connection for MCP tools
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lightdom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

// Initialize MCP Tools
async function initializeMCPTools() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('✅ Database connected for MCP tools');

    // Dynamically import MCP tools registry
    const { DeepSeekToolsRegistry } = await import('../src/mcp/deepseek-tools-registry.js');
    toolsRegistry = new DeepSeekToolsRegistry(db);
    
    const tools = toolsRegistry.listTools();
    console.log(`📦 MCP Tools initialized: ${tools.length} tools available`);
    mcpToolsAvailable = true;
    
    return true;
  } catch (error) {
    console.warn('⚠️  MCP Tools initialization failed:', error.message);
    console.warn('   DeepSeek will run without MCP tools integration');
    mcpToolsAvailable = false;
    return false;
  }
}

app.get('/health', async (_req, res) => {
  try {
    const status = await deepSeekService.healthCheck();
    res.json({
      status: 'ok',
      service: 'DeepSeek Orchestration Service',
      timestamp: new Date().toISOString(),
      details: status,
      mcpTools: {
        available: mcpToolsAvailable,
        toolCount: toolsRegistry ? toolsRegistry.listTools().length : 0,
      },
    });
  } catch (error) {
    console.error('DeepSeek health check failed:', error.message);
    res.status(500).json({
      status: 'error',
      service: 'DeepSeek Orchestration Service',
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      mcpTools: {
        available: mcpToolsAvailable,
        toolCount: 0,
      },
    });
  }
});

app.post('/chat', async (req, res) => {
  const { prompt, conversation = [], systemPrompt, options } = req.body || {};

  const history = Array.isArray(conversation) ? conversation : [];
  const messages = [];

  if (systemPrompt && typeof systemPrompt === 'string') {
    messages.push({ role: 'system', content: systemPrompt });
  }

  for (const entry of history) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const role = entry.role === 'assistant' || entry.role === 'user' ? entry.role : 'system';
    const content = typeof entry.content === 'string' ? entry.content : '';

    if (!content) {
      continue;
    }

    messages.push({ role, content });
  }

  if (prompt && typeof prompt === 'string') {
    messages.push({ role: 'user', content: prompt });
  }

  if (messages.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one message or prompt is required',
    });
  }

  try {
    const stream = deepSeekService.createChatStream(messages, options || {});

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(': connected\n\n');

    stream.on('data', (chunk) => {
      res.write(chunk);
    });

    stream.on('end', () => {
      if (!res.writableEnded) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    });

    stream.on('error', (error) => {
      console.error('DeepSeek chat stream error:', error);
      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'DeepSeek streaming error occurred.' })}\n\n`,
        );
        res.end();
      }
    });

    req.on('close', () => {
      stream.destroy?.();
    });
  } catch (error) {
    console.error('Failed to initiate DeepSeek chat:', error);
    res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
  }
});

app.post('/workflow/generate', async (req, res) => {
  const { prompt, options } = req.body || {};

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'prompt is required',
    });
  }

  try {
    const workflow = await deepSeekService.generateWorkflowFromPrompt(prompt, options);
    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Failed to generate workflow:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/seeds/generate', async (req, res) => {
  const { campaignDescription, clientSiteUrl, options } = req.body || {};

  if (!campaignDescription || !clientSiteUrl) {
    return res.status(400).json({
      success: false,
      error: 'campaignDescription and clientSiteUrl are required',
    });
  }

  try {
    const seeds = await deepSeekService.generateURLSeeds(campaignDescription, clientSiteUrl, options);
    res.json({ success: true, seeds });
  } catch (error) {
    console.error('Failed to generate seeds:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/schema/generate', async (req, res) => {
  const { purpose, existingSchemas = [], options } = req.body || {};

  if (!purpose) {
    return res.status(400).json({
      success: false,
      error: 'purpose is required',
    });
  }

  try {
    const schema = await deepSeekService.buildCrawlerSchema(purpose, existingSchemas, options);
    res.json({ success: true, schema });
  } catch (error) {
    console.error('Failed to generate schema:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/pipeline/generate', async (req, res) => {
  const { schemas, goal, options } = req.body || {};

  if (!Array.isArray(schemas) || schemas.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'schemas array is required',
    });
  }

  try {
    const pipeline = await deepSeekService.generateWorkflowPipeline(schemas, goal, options);
    res.json({ success: true, pipeline });
  } catch (error) {
    console.error('Failed to generate pipeline:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/config/optimize', async (req, res) => {
  const { currentConfig, analyticsData, options } = req.body || {};

  if (!currentConfig || typeof currentConfig !== 'object') {
    return res.status(400).json({ success: false, error: 'currentConfig object is required' });
  }

  try {
    const optimized = await deepSeekService.optimizeCrawlerConfig(currentConfig, analyticsData, options);
    res.json({ success: true, optimized });
  } catch (error) {
    console.error('Failed to optimize config:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MCP Tools Endpoints
app.get('/mcp/tools', async (_req, res) => {
  if (!mcpToolsAvailable || !toolsRegistry) {
    return res.status(503).json({
      success: false,
      error: 'MCP tools not available',
    });
  }

  try {
    const tools = toolsRegistry.listTools();
    res.json({
      success: true,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        category: t.category,
        permissions: t.permissions,
      })),
    });
  } catch (error) {
    console.error('Failed to list MCP tools:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/mcp/tools/:category', async (req, res) => {
  if (!mcpToolsAvailable || !toolsRegistry) {
    return res.status(503).json({
      success: false,
      error: 'MCP tools not available',
    });
  }

  const { category } = req.params;

  try {
    const tools = toolsRegistry.listTools(category);
    res.json({
      success: true,
      category,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        permissions: t.permissions,
      })),
    });
  } catch (error) {
    console.error('Failed to list MCP tools:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/mcp/execute', async (req, res) => {
  if (!mcpToolsAvailable || !toolsRegistry) {
    return res.status(503).json({
      success: false,
      error: 'MCP tools not available',
    });
  }

  const { toolName, args, sessionId } = req.body || {};

  if (!toolName) {
    return res.status(400).json({
      success: false,
      error: 'toolName is required',
    });
  }

  try {
    const { DeepSeekConfigLoader } = await import('../src/config/deepseek-config.js');
    const configLoader = new DeepSeekConfigLoader();

    const context = {
      db,
      config: configLoader.getConfig(),
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };

    const result = await toolsRegistry.executeTool(toolName, args || {}, context);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to execute MCP tool:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/mcp/schema/map', async (req, res) => {
  if (!mcpToolsAvailable || !toolsRegistry) {
    return res.status(503).json({
      success: false,
      error: 'MCP tools not available',
    });
  }

  const { format = 'json', minConfidence = 0.3 } = req.body || {};

  try {
    const { SchemaRelationshipMapper } = await import('../src/services/schema-relationship-mapper.js');
    const mapper = new SchemaRelationshipMapper(db);
    
    const graph = await mapper.generateCompleteSchemaMap({
      minConfidence,
      includeInferred: true,
    });

    let output;
    if (format === 'json') {
      output = graph;
    } else {
      output = await mapper.exportSchemaGraph(graph, format);
    }

    res.json({ success: true, graph: output, format });
  } catch (error) {
    console.error('Failed to generate schema map:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize MCP tools and start server
async function startService() {
  console.log('🚀 Starting DeepSeek Orchestration Service...');
  
  // Initialize MCP tools
  await initializeMCPTools();
  
  // Start HTTP server
  const server = app.listen(PORT, HOST, () => {
    console.log(`🧠 DeepSeek Orchestration Service listening on http://${HOST}:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - Health: GET /health`);
    console.log(`   - Workflow Generation: POST /workflow/generate`);
    console.log(`   - Schema Generation: POST /schema/generate`);
    console.log(`   - Pipeline Generation: POST /pipeline/generate`);
    if (mcpToolsAvailable) {
      console.log(`   - MCP Tools: GET /mcp/tools`);
      console.log(`   - MCP Execute: POST /mcp/execute`);
      console.log(`   - MCP Schema Map: POST /mcp/schema/map`);
    }
  });

  async function shutdown() {
    console.log('\n🛑 Shutting down DeepSeek Orchestration Service...');
    
    // Close MCP server process if running
    if (mcpServerProcess) {
      mcpServerProcess.kill();
      console.log('✅ MCP server stopped');
    }
    
    // Close database connection
    if (db) {
      await db.end();
      console.log('✅ Database connection closed');
    }
    
    // Close HTTP server
    server.close(() => {
      console.log('✅ DeepSeek service stopped');
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Start the service
startService().catch((error) => {
  console.error('❌ Failed to start DeepSeek service:', error);
  process.exit(1);
});
