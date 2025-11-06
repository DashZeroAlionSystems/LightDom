#!/usr/bin/env node

/**
 * DeepSeek MCP Tools Integration Examples
 * Demonstrates how to use the DeepSeek MCP tools system
 */

import { Pool } from 'pg';
import { DeepSeekToolsRegistry, ToolContext } from '../src/mcp/deepseek-tools-registry.js';
import { SchemaRelationshipMapper } from '../src/services/schema-relationship-mapper.js';
import { promises as fs } from 'fs';

// Initialize database connection
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lightdom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Initialize tools registry
const toolsRegistry = new DeepSeekToolsRegistry(db);

// Initialize schema mapper
const schemaMapper = new SchemaRelationshipMapper(db);

// Helper to execute tools
async function executeTool(toolName: string, args: any): Promise<any> {
  const context: ToolContext = {
    db,
    config: {},
    sessionId: `example_${Date.now()}`
  };

  try {
    const result = await toolsRegistry.executeTool(toolName, args, context);
    return result;
  } catch (error: any) {
    console.error(`Error executing tool ${toolName}:`, error.message);
    throw error;
  }
}

/**
 * Example 1: Create Sample Schemas
 */
async function example1_createSchemas() {
  console.log('\n========================================');
  console.log('Example 1: Creating Sample Schemas');
  console.log('========================================\n');

  // Create User schema
  const userSchema = await executeTool('create_schema', {
    name: 'User',
    category: 'model',
    schemaDefinition: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        username: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        createdAt: { type: 'string', format: 'date-time' }
      },
      required: ['username', 'email']
    },
    autoLinkRelations: false
  });

  console.log('✓ Created User schema:', userSchema.id);

  // Create Product schema
  const productSchema = await executeTool('create_schema', {
    name: 'Product',
    category: 'model',
    schemaDefinition: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        price: { type: 'number', minimum: 0 },
        createdAt: { type: 'string', format: 'date-time' }
      },
      required: ['name', 'price']
    },
    autoLinkRelations: false
  });

  console.log('✓ Created Product schema:', productSchema.id);

  // Create Order schema (with references)
  const orderSchema = await executeTool('create_schema', {
    name: 'Order',
    category: 'model',
    schemaDefinition: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        productId: { type: 'string', format: 'uuid' },
        quantity: { type: 'integer', minimum: 1 },
        total: { type: 'number', minimum: 0 },
        createdAt: { type: 'string', format: 'date-time' }
      },
      required: ['userId', 'productId', 'quantity', 'total']
    },
    autoLinkRelations: true  // Auto-detect relationships
  });

  console.log('✓ Created Order schema:', orderSchema.id);
  console.log('  (with auto-linked relationships)');

  return { userSchema, productSchema, orderSchema };
}

/**
 * Example 2: Query Schema with Relationships
 */
async function example2_querySchema() {
  console.log('\n========================================');
  console.log('Example 2: Querying Schema with Relationships');
  console.log('========================================\n');

  const schema = await executeTool('query_schema', {
    schemaName: 'Order',
    includeRelations: true,
    depth: 1
  });

  console.log('Schema:', schema.name);
  console.log('Category:', schema.category);
  console.log('Properties:', Object.keys(schema.schema_definition.properties || {}));
  
  if (schema.relations && schema.relations.length > 0) {
    console.log('\nRelationships:');
    schema.relations.forEach((rel: any) => {
      console.log(`  → ${rel.related_schema_name} (${rel.relationship_type}, confidence: ${rel.confidence})`);
    });
  }
}

/**
 * Example 3: Find Schema Relationships Using Algorithms
 */
async function example3_findRelationships() {
  console.log('\n========================================');
  console.log('Example 3: Finding Schema Relationships');
  console.log('========================================\n');

  // Get Order schema ID
  const orderResult = await db.query('SELECT id FROM schemas WHERE name = $1', ['Order']);
  if (orderResult.rows.length === 0) {
    console.log('⚠ Order schema not found. Run Example 1 first.');
    return;
  }

  const orderId = orderResult.rows[0].id;

  // Find relationships using all algorithms
  const relationships = await executeTool('find_schema_relationships', {
    schemaId: orderId,
    algorithm: 'all'
  });

  console.log('Property Matches:', relationships.propertyMatches.length);
  relationships.propertyMatches.forEach((rel: any) => {
    console.log(`  → ${rel.targetSchemaName}: ${rel.type} (${Math.round(rel.confidence * 100)}%)`);
    if (rel.metadata?.matches) {
      console.log(`    Common properties: ${rel.metadata.matches.join(', ')}`);
    }
  });

  console.log('\nTotal combined relationships:', relationships.combined.length);
}

/**
 * Example 4: Generate Complete Schema Map
 */
async function example4_generateSchemaMap() {
  console.log('\n========================================');
  console.log('Example 4: Generating Complete Schema Map');
  console.log('========================================\n');

  // Generate schema map using all algorithms
  const schemaGraph = await schemaMapper.generateCompleteSchemaMap({
    minConfidence: 0.3,
    includeInferred: true,
    algorithms: [
      'property-match',
      'naming-convention',
      'type-compatibility',
      'structural-similarity'
    ]
  });

  console.log(`✓ Generated schema graph:`);
  console.log(`  Nodes (schemas): ${schemaGraph.nodes.length}`);
  console.log(`  Edges (relationships): ${schemaGraph.edges.length}`);

  // Group by algorithm
  const byAlgorithm = schemaGraph.edges.reduce((acc: any, edge) => {
    acc[edge.algorithm] = (acc[edge.algorithm] || 0) + 1;
    return acc;
  }, {});

  console.log('\n  Relationships by algorithm:');
  Object.entries(byAlgorithm).forEach(([algo, count]) => {
    console.log(`    ${algo}: ${count}`);
  });

  // Export to Mermaid
  const mermaidDiagram = await schemaMapper.exportSchemaGraph(schemaGraph, 'mermaid');
  
  // Save to file
  await fs.writeFile('./schema-map-example.mmd', mermaidDiagram);
  console.log('\n✓ Saved Mermaid diagram to: schema-map-example.mmd');

  // Show preview
  console.log('\nMermaid Diagram Preview:');
  console.log('─'.repeat(60));
  console.log(mermaidDiagram.split('\n').slice(0, 15).join('\n'));
  if (mermaidDiagram.split('\n').length > 15) {
    console.log('... (truncated)');
  }
  console.log('─'.repeat(60));

  // Save relationships to database
  await schemaMapper.saveSchemaMap(schemaGraph);
  console.log('\n✓ Saved relationships to database');
}

/**
 * Example 5: Create and Execute Workflow
 */
async function example5_workflowAutomation() {
  console.log('\n========================================');
  console.log('Example 5: Workflow Automation');
  console.log('========================================\n');

  // Create a simple data processing workflow
  const workflow = await executeTool('create_workflow', {
    name: 'User Registration Workflow',
    workflowType: 'sequential',
    tasks: [
      {
        name: 'Validate Email',
        type: 'validation',
        config: { 
          field: 'email',
          validator: 'email'
        }
      },
      {
        name: 'Check Duplicate',
        type: 'database',
        config: {
          query: 'SELECT COUNT(*) FROM users WHERE email = $1'
        }
      },
      {
        name: 'Create User Record',
        type: 'database',
        config: {
          operation: 'insert',
          table: 'users'
        }
      }
    ]
  });

  console.log('✓ Created workflow:', workflow.workflow_id);
  console.log('  Name:', workflow.name);
  console.log('  Type:', workflow.workflow_type);
  console.log('  Status:', workflow.status);

  // Execute workflow (simulated)
  const run = await executeTool('execute_workflow', {
    workflowId: workflow.workflow_id,
    inputData: {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'hashed_password'
    },
    validateAgainstSchema: false
  });

  console.log('\n✓ Started workflow execution:', run.run_id);
  console.log('  Status:', run.status);
}

/**
 * Example 6: Code Analysis and Schema Generation
 */
async function example6_codeAnalysis() {
  console.log('\n========================================');
  console.log('Example 6: Code Analysis & Schema Generation');
  console.log('========================================\n');

  // Create a sample TypeScript interface file
  const sampleCode = `
interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
  `.trim();

  const tempFilePath = './temp-user-profile.ts';
  await fs.writeFile(tempFilePath, sampleCode);

  console.log('✓ Created sample TypeScript file');

  // Generate schema from code
  const generatedSchema = await executeTool('generate_schema_from_code', {
    filePath: tempFilePath,
    schemaType: 'typescript',
    includeComments: true
  });

  console.log('\n✓ Generated schema from code:');
  console.log('  File:', generatedSchema.filePath);
  console.log('  Type:', generatedSchema.schemaType);

  // Clean up
  await fs.unlink(tempFilePath);
}

/**
 * Example 7: List All Available Tools
 */
async function example7_listTools() {
  console.log('\n========================================');
  console.log('Example 7: Available MCP Tools');
  console.log('========================================\n');

  const tools = toolsRegistry.listTools();

  console.log(`Total tools available: ${tools.length}\n`);

  // Group by category
  const byCategory = tools.reduce((acc: any, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  Object.entries(byCategory).forEach(([category, tools]: [string, any]) => {
    console.log(`${category.toUpperCase()} (${tools.length} tools):`);
    tools.forEach((tool: any) => {
      console.log(`  • ${tool.name}`);
      console.log(`    ${tool.description}`);
    });
    console.log('');
  });
}

/**
 * Example 8: Configuration Management
 */
async function example8_configuration() {
  console.log('\n========================================');
  console.log('Example 8: Configuration Management');
  console.log('========================================\n');

  // Get current configuration
  const config = await executeTool('get_deepseek_config', {
    section: 'all'
  });

  console.log('Current DeepSeek Configuration:');
  if (config.api) {
    console.log('\nAPI Settings:');
    console.log('  Model:', config.api.model || 'Not configured');
    console.log('  Temperature:', config.api.defaultTemperature || 'Default');
  }

  if (config.behavior) {
    console.log('\nBehavior Settings:');
    console.log('  Auto Generate Schemas:', config.behavior.autoGenerateSchemas);
    console.log('  Safety Mode:', config.behavior.safetyMode);
  }

  // Update configuration
  await executeTool('update_deepseek_config', {
    section: 'behavior',
    updates: {
      autoGenerateSchemas: true,
      autoLinkRelationships: true,
      safetyMode: 'strict'
    }
  });

  console.log('\n✓ Configuration updated');
}

/**
 * Main function - Run all examples
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   DeepSeek MCP Tools - Integration Examples               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('\n✓ Connected to database\n');

    // Run examples
    await example1_createSchemas();
    await example2_querySchema();
    await example3_findRelationships();
    await example4_generateSchemaMap();
    await example5_workflowAutomation();
    await example6_codeAnalysis();
    await example7_listTools();
    await example8_configuration();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✓ All examples completed successfully!                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('Next Steps:');
    console.log('1. Review the generated schema map: schema-map-example.mmd');
    console.log('2. Check the database for created schemas and relationships');
    console.log('3. Read the full guide: DEEPSEEK_MCP_TOOLS_GUIDE.md');
    console.log('4. Start the MCP server: npm run mcp:deepseek:start');
    console.log('5. Configure your MCP client with: deepseek-mcp-config.json\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  executeTool,
  example1_createSchemas,
  example2_querySchema,
  example3_findRelationships,
  example4_generateSchemaMap,
  example5_workflowAutomation,
  example6_codeAnalysis,
  example7_listTools,
  example8_configuration
};
