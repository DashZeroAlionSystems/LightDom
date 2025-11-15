/**
 * Minimal JavaScript shim for DeepSeek MCP Tools Registry
 *
 * This file provides a lightweight runtime implementation of a tools registry so
 * the DeepSeek orchestration service can initialize MCP tools without requiring
 * TypeScript compilation. It intentionally implements a small set of safe tools
 * (ping, read_file, query_database) that are useful during development and QA.
 */

export class DeepSeekToolsRegistry {
  constructor(db) {
    this.db = db;
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerDefaultTools() {
    // Ping tool
    this.registerTool({
      name: 'ping',
      description: 'Ping tool - returns pong',
      category: 'util',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => ({ pong: true }),
      permissions: [],
    });

    // Read file (safe wrapper) - returns file content or an error
    this.registerTool({
      name: 'read_file',
      description: 'Read file contents (development helper)',
      category: 'filesystem',
      inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] },
      handler: async (args) => {
        try {
          const fs = await import('fs/promises');
          const content = await fs.readFile(args.filePath, 'utf8');
          return { content };
        } catch (err) {
          return { error: String(err?.message || err) };
        }
      },
      permissions: ['read:files'],
    });

    // Query database (read-only SELECTs only)
    this.registerTool({
      name: 'query_database',
      description: 'Execute SELECT queries against the connected database (safe)',
      category: 'database',
      inputSchema: { type: 'object', properties: { query: { type: 'string' }, params: { type: 'array' } }, required: ['query'] },
      handler: async (args, context) => {
        const q = (args.query || '').trim();
        if (!/^SELECT/i.test(q)) {
          throw new Error('Only SELECT queries are allowed');
        }
        const rows = await context.db.query(q, args.params || []);
        return rows.rows || rows;
      },
      permissions: ['read:database'],
    });
  }

  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name) {
    return this.tools.get(name);
  }

  listTools(category) {
    const all = Array.from(this.tools.values());
    if (!category) return all;
    return all.filter(t => t.category === category);
  }

  async executeTool(toolName, args = {}, context = {}) {
    const tool = this.getTool(toolName);
    if (!tool) throw new Error(`Tool not found: ${toolName}`);
    // Simple permission hook (no-op for now)
    return await tool.handler(args, context);
  }
}

export default DeepSeekToolsRegistry;
