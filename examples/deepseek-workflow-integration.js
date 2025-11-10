#!/usr/bin/env node

/**
 * DeepSeek Workflow Integration Example
 * 
 * Demonstrates how to use the complete DeepSeek n8n workflow system
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import { DeepSeekWorkflowCRUDService } from './src/services/deepseek-workflow-crud-service.js';
import { DeepSeekWorkflowOrchestrator } from './src/services/deepseek-workflow-orchestrator.js';
import { WorkflowTemplateService } from './src/services/workflow-template-service.js';

dotenv.config();

// Database configuration
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// DeepSeek configuration
const deepseekConfig = {
  apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
};

// n8n configuration
const n8nConfig = {
  apiUrl: process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
  apiKey: process.env.N8N_API_KEY,
  webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
};

const crudService = new DeepSeekWorkflowCRUDService(db);
const orchestrator = new DeepSeekWorkflowOrchestrator(db, deepseekConfig, n8nConfig);
const templateService = new WorkflowTemplateService(db);

// Example 1: Create a Prompt Template
async function createPromptTemplate() {
  console.log('\n=== Example 1: Creating a Prompt Template ===\n');

  const template = await crudService.createPromptTemplate({
    name: 'Website Analysis',
    category: 'analysis',
    template_content: `Analyze the website: {{url}}

Focus on:
- {{focusArea}}
- Performance
- User experience

Provide actionable recommendations in JSON format:
{
  "issues": [...],
  "recommendations": [...],
  "priority": 1-10
}`,
    variables: ['url', 'focusArea'],
    examples: [
      {
        input: { url: 'https://example.com', focusArea: 'SEO' },
        output: '{"issues": [], "recommendations": [], "priority": 8}',
      },
    ],
  });

  console.log('✓ Created prompt template:', template.template_id);
  return template.template_id;
}

// Example 2: Generate a Schema
async function generateSchema() {
  console.log('\n=== Example 2: Generating a Schema ===\n');

  const schema = await crudService.createSchema({
    name: 'User Profile',
    schema_type: 'json-schema',
    schema_content: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        username: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        created_at: { type: 'string', format: 'date-time' },
      },
      required: ['username', 'email'],
    },
    validation_rules: {
      uniqueFields: ['username', 'email'],
    },
  });

  console.log('✓ Created schema:', schema.schema_id);
  return schema.schema_id;
}

// Example 3: Create a Simple Workflow
async function createSimpleWorkflow() {
  console.log('\n=== Example 3: Creating a Simple Workflow ===\n');

  // Create workflow
  const workflow = await crudService.createWorkflow({
    name: 'Website SEO Check',
    workflow_type: 'sequential',
    description: 'Quick SEO analysis of a website',
    status: 'active',
  });

  console.log('✓ Created workflow:', workflow.workflow_id);

  // Add Task 1: Fetch website
  const task1 = await crudService.createTask({
    workflow_id: workflow.workflow_id,
    name: 'Fetch Website',
    task_type: 'api',
    ordering: 1,
    handler_config: {
      method: 'GET',
      url: '{{input.website}}',
      timeout: 30000,
    },
    dependencies: [],
  });

  console.log('  ✓ Added task:', task1.name);

  // Add Task 2: Analyze with AI
  const task2 = await crudService.createTask({
    workflow_id: workflow.workflow_id,
    name: 'AI Analysis',
    task_type: 'deepseek',
    ordering: 2,
    handler_config: {
      prompt: 'Analyze this HTML for SEO: {{task_1.output}}',
      parseJson: true,
      temperature: 0.3,
    },
    dependencies: [task1.task_id],
  });

  console.log('  ✓ Added task:', task2.name);

  return workflow.workflow_id;
}

// Example 4: Use a Template
async function useTemplate() {
  console.log('\n=== Example 4: Using a Workflow Template ===\n');

  // Load templates
  await templateService.loadTemplates();

  // List available templates
  const templates = templateService.listTemplates();
  console.log(`✓ Loaded ${templates.length} templates:`);
  templates.forEach(t => {
    console.log(`  - ${t.id}: ${t.name}`);
  });

  // Instantiate SEO template
  if (templates.find(t => t.id === 'seo-crawler-analysis')) {
    const workflowId = await templateService.instantiateTemplate('seo-crawler-analysis', {
      name: 'My SEO Analysis',
      tags: ['demo', 'seo'],
    });

    console.log('\n✓ Instantiated template as workflow:', workflowId);
    return workflowId;
  }

  return null;
}

// Example 5: Execute a Workflow
async function executeWorkflow(workflowId) {
  console.log('\n=== Example 5: Executing a Workflow ===\n');

  // Start execution
  const run = await orchestrator.executeWorkflow(workflowId, {
    website: 'https://example.com',
    crawlDepth: 2,
    maxPages: 50,
    targetKeywords: ['seo', 'optimization'],
  });

  console.log('✓ Started workflow execution:', run.run_id);
  console.log('  Status:', run.status);

  // Set up event listeners
  orchestrator.on('workflow:started', ({ runId }) => {
    console.log(`\n📍 Workflow started: ${runId}`);
  });

  orchestrator.on('task:started', ({ taskId }) => {
    console.log(`  ⏳ Task started: ${taskId}`);
  });

  orchestrator.on('task:completed', ({ taskId }) => {
    console.log(`  ✅ Task completed: ${taskId}`);
  });

  orchestrator.on('workflow:completed', ({ runId }) => {
    console.log(`\n✓ Workflow completed: ${runId}`);
  });

  orchestrator.on('workflow:failed', ({ runId, error }) => {
    console.error(`\n❌ Workflow failed: ${runId}`, error);
  });

  // Poll for status
  let completed = false;
  while (!completed) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const status = await crudService.getWorkflowRun(run.run_id);
    if (!status) break;

    console.log(`  Progress: ${status.progress_percentage}% - ${status.status}`);

    if (status.status === 'success' || status.status === 'failed') {
      completed = true;
      console.log('\n✓ Final status:', status.status);
      if (status.result_data) {
        console.log('  Result:', JSON.stringify(status.result_data, null, 2));
      }
    }
  }

  return run.run_id;
}

// Example 6: Monitor System Health
async function monitorHealth() {
  console.log('\n=== Example 6: Recording System Health ===\n');

  await crudService.recordSystemHealth({
    active_workflows: 5,
    running_tasks: 12,
    queued_tasks: 3,
    deepseek_queue_size: 2,
    avg_response_time_ms: 250,
    error_rate_percentage: 0.5,
    cpu_usage_percentage: 45.2,
    memory_usage_mb: 512,
  });

  console.log('✓ System health metrics recorded');

  // Get recent metrics
  const metrics = await crudService.getSystemHealthMetrics(5);
  console.log(`\n✓ Recent health metrics (last ${metrics.length}):`);
  metrics.forEach(m => {
    console.log(`  - ${m.metric_timestamp}: ${m.running_tasks} running, ${m.queued_tasks} queued`);
  });
}

// Main execution
async function main() {
  try {
    console.log('🚀 DeepSeek Workflow System - Integration Examples\n');
    console.log('================================================\n');

    // Run examples
    const promptTemplateId = await createPromptTemplate();
    const schemaId = await generateSchema();
    const workflowId = await createSimpleWorkflow();
    const templateWorkflowId = await useTemplate();
    
    // Execute workflow (uncomment to actually run)
    // if (workflowId) {
    //   await executeWorkflow(workflowId);
    // }

    await monitorHealth();

    console.log('\n================================================');
    console.log('✓ All examples completed successfully!\n');

    console.log('Next steps:');
    console.log('1. Start the API server: npm run start:api');
    console.log('2. Test the API: curl http://localhost:3001/api/workflows');
    console.log('3. Explore templates: curl http://localhost:3001/api/templates');
    console.log('4. View the guide: cat DEEPSEEK_N8N_COMPLETE_GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
    createPromptTemplate, createSimpleWorkflow, crudService, executeWorkflow, generateSchema, monitorHealth, orchestrator,
    templateService, useTemplate
};

