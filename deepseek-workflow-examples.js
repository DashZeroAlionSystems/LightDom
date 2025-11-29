/**
 * DeepSeek Workflow System - Usage Examples
 * Demonstrates how to use the various components of the system
 */

import { DeepSeekConfigLoader } from './src/config/deepseek-config.js';
import { DeepSeekPromptEngine } from './src/services/deepseek-prompt-engine.js';
import { SchemaGeneratorService } from './src/services/schema-generator.js';
import { WorkflowOrchestrator } from './src/services/workflow-orchestrator.js';
import { GitStateManager } from './src/services/git-state-manager.js';
import { N8NIntegrationService } from './src/services/n8n-integration.js';

/**
 * Example 1: Basic Configuration
 */
async function example1_BasicConfiguration() {
  console.log('=== Example 1: Basic Configuration ===\n');

  // Load default configuration
  const configLoader = new DeepSeekConfigLoader();
  const config = configLoader.getConfig();

  console.log('Default Configuration:');
  console.log('- API Model:', config.api.model);
  console.log('- Reasoning Pattern:', config.reasoning.defaultPattern);
  console.log('- Naming Style:', config.naming.variableNamingStyle);
  console.log('- Safety Mode:', config.behavior.safetyMode);

  // Update configuration
  configLoader.updateConfig({
    reasoning: {
      defaultPattern: 'tree-of-thought',
      enableSelfReflection: true,
      enableCriticalAnalysis: true,
      maxReasoningSteps: 15,
    },
  });

  console.log('\nUpdated Reasoning Pattern:', configLoader.getConfig().reasoning.defaultPattern);

  // Save configuration
  await configLoader.saveToFile('./.deepseek-config.json');
  console.log('\n✓ Configuration saved to .deepseek-config.json\n');
}

/**
 * Example 2: Prompt Template Usage
 */
async function example2_PromptTemplates() {
  console.log('=== Example 2: Prompt Template Usage ===\n');

  const configLoader = new DeepSeekConfigLoader();
  const promptEngine = new DeepSeekPromptEngine(configLoader.getConfig());

  // List available templates
  const templates = promptEngine.listTemplates();
  console.log('Available Templates:');
  templates.forEach((t) => {
    console.log(`- ${t.name} (${t.category})`);
  });

  // Generate a workflow generation prompt
  const workflowPrompt = promptEngine.generatePrompt('workflow-generation', {
    userRequest: 'Create a complete SEO campaign for an e-commerce website selling outdoor gear',
    domainContext: 'E-commerce, outdoor equipment, target audience: outdoor enthusiasts',
  });

  console.log('\n--- Generated Workflow Prompt ---');
  console.log(workflowPrompt.substring(0, 500) + '...\n');

  // Generate a schema generation prompt
  const schemaPrompt = promptEngine.generatePrompt('schema-generation', {
    userDescription: 'Product catalog with categories, products, variants, and pricing',
    existingSchemas: 'User schema, Order schema',
  });

  console.log('--- Generated Schema Prompt ---');
  console.log(schemaPrompt.substring(0, 300) + '...\n');
}

/**
 * Example 3: Schema Generation
 */
async function example3_SchemaGeneration() {
  console.log('=== Example 3: Schema Generation ===\n');

  const schemaGenerator = new SchemaGeneratorService();

  // Note: This example shows the interface. Actual generation requires DeepSeek API key
  console.log('Schema Generation Example:');
  console.log('This would generate a schema from natural language description.\n');

  // Example schema generation request
  const request = {
    description: 'User profile with personal information, preferences, and activity history',
    context: {
      domain: 'social-media',
      purpose: 'user-management',
    },
    options: {
      includeValidation: true,
      generateRelationships: true,
      schemaType: 'json-schema',
    },
  };

  console.log('Generation Request:');
  console.log(JSON.stringify(request, null, 2));
  console.log('\n// Uncomment to execute (requires API key):');
  console.log('// const schema = await schemaGenerator.generateSchema(request);');
  console.log('// console.log(schema);\n');
}

/**
 * Example 4: Schema Map Generation
 */
async function example4_SchemaMapGeneration() {
  console.log('=== Example 4: Schema Map Generation ===\n');

  const schemaGenerator = new SchemaGeneratorService();

  console.log('Schema Map Generation Example:');
  console.log('Generates multiple related schemas with relationships.\n');

  const description = 'E-commerce system with products, categories, orders, customers, and payments';

  console.log('Description:', description);
  console.log('\n// Uncomment to execute (requires API key):');
  console.log('// const schemaMap = await schemaGenerator.generateSchemaMap(description, {');
  console.log('//   maxSchemas: 10,');
  console.log('//   domain: "ecommerce"');
  console.log('// });');
  console.log('// console.log(`Generated ${schemaMap.schemas.length} schemas`);\n');
}

/**
 * Example 5: Workflow Creation and Execution
 */
async function example5_WorkflowExecution() {
  console.log('=== Example 5: Workflow Creation and Execution ===\n');

  const configLoader = new DeepSeekConfigLoader();
  const orchestrator = new WorkflowOrchestrator(configLoader.getConfig());

  // Create a simple workflow manually
  const workflow = {
    id: 'example-workflow',
    name: 'Example Data Processing Workflow',
    version: '1.0.0',
    description: 'Simple data processing workflow example',
    services: [
      {
        id: 'data-service',
        type: 'data-processor',
        config: {},
      },
    ],
    tasks: [
      {
        id: 'task-1',
        name: 'Fetch Data',
        service: 'data-service',
        action: 'fetch',
        input: { source: 'api' },
        dependencies: [],
      },
      {
        id: 'task-2',
        name: 'Process Data',
        service: 'data-service',
        action: 'process',
        input: { data: '${task:task-1.output}' },
        dependencies: ['task-1'],
      },
    ],
    schedule: {
      type: 'manual',
      enabled: false,
    },
  };

  // Register workflow
  orchestrator.registerWorkflow(workflow);
  console.log('✓ Workflow registered:', workflow.name);

  // Listen to events
  orchestrator.on('execution:started', (data) => {
    console.log('→ Execution started:', data.executionId);
  });

  orchestrator.on('task:completed', (data) => {
    console.log('→ Task completed:', data.taskId);
  });

  console.log('\n// To execute the workflow:');
  console.log('// const execution = await orchestrator.executeWorkflow("example-workflow", {});');
  console.log('// console.log(execution);\n');
}

/**
 * Example 6: Git State Management
 */
async function example6_GitStateManagement() {
  console.log('=== Example 6: Git State Management ===\n');

  const stateManager = new GitStateManager({
    repository: '',
    branch: 'state/development',
    autoCommit: true,
    commitMessage: 'Auto-commit workflow state',
    conflictResolution: 'theirs',
  });

  // Initialize
  await stateManager.initialize();
  console.log('✓ Git state manager initialized\n');

  // Save workflow state
  const workflowState = {
    status: 'running',
    currentTask: 'data-processing',
    progress: 50,
  };

  const snapshot = await stateManager.saveWorkflowState(
    'example-workflow',
    workflowState,
    'Update workflow progress to 50%'
  );

  console.log('✓ Workflow state saved');
  console.log('  Snapshot ID:', snapshot.id);
  console.log('  Commit hash:', snapshot.commitHash);

  // Get history
  const history = await stateManager.getHistory('workflows/example-workflow.json', 5);
  console.log(`\n✓ Retrieved ${history.length} historical states`);

  // Create tag
  await stateManager.createTag('v1.0-stable', 'Stable release v1.0');
  console.log('✓ Tag created: v1.0-stable');

  // List tags
  const tags = await stateManager.listTags();
  console.log('\nAvailable tags:', tags.join(', '));
  console.log();
}

/**
 * Example 7: N8N Integration
 */
async function example7_N8NIntegration() {
  console.log('=== Example 7: N8N Integration ===\n');

  const n8nService = new N8NIntegrationService({
    apiUrl: 'http://localhost:5678/api/v1',
    apiKey: 'your-api-key',
    webhookUrl: 'http://localhost:5678/webhook',
  });

  // Get workflow blocks
  const blocks = n8nService.createWorkflowBlocks();
  console.log('Available Workflow Blocks:');
  blocks.forEach((block) => {
    console.log(`- ${block.name} (${block.category})`);
    console.log(`  Inputs: ${block.inputs.join(', ')}`);
    console.log(`  Outputs: ${block.outputs.join(', ')}`);
  });

  console.log('\n// To convert a LightDom workflow to N8N:');
  console.log('// const n8nWorkflow = n8nService.convertToN8N(lightdomWorkflow);');
  console.log('// const { id, url } = await n8nService.createWorkflow(n8nWorkflow);');
  console.log('// console.log(`Workflow created: ${url}`);\n');
}

/**
 * Example 8: Loading Workflow Templates
 */
async function example8_WorkflowTemplates() {
  console.log('=== Example 8: Loading Workflow Templates ===\n');

  // In a real implementation, you would load these from files
  console.log('Available Workflow Templates:');
  console.log('1. SEO Campaign Workflow');
  console.log('   - Sitemap discovery');
  console.log('   - URL prioritization');
  console.log('   - Page crawling');
  console.log('   - SEO analysis');
  console.log('   - Content analysis');
  console.log('   - Technical audit');
  console.log('   - Recommendations generation\n');

  console.log('2. Data Mining & Training Workflow');
  console.log('   - Data source discovery');
  console.log('   - Data extraction');
  console.log('   - Data cleaning');
  console.log('   - Feature engineering');
  console.log('   - Model training');
  console.log('   - Model evaluation\n');

  console.log('Templates are located in: schemas/workflow-templates/\n');
}

/**
 * Example 9: Complete End-to-End Workflow
 */
async function example9_EndToEndWorkflow() {
  console.log('=== Example 9: Complete End-to-End Workflow ===\n');

  console.log('This example demonstrates a complete workflow from generation to execution:\n');

  console.log('Step 1: Configure system');
  console.log('const config = new DeepSeekConfigLoader();\n');

  console.log('Step 2: Generate workflow from natural language');
  console.log('const orchestrator = new WorkflowOrchestrator(config.getConfig());');
  console.log('const workflow = await orchestrator.generateWorkflow(');
  console.log('  "Analyze my website for SEO and generate recommendations"');
  console.log(');\n');

  console.log('Step 3: Save initial state');
  console.log('const stateManager = new GitStateManager({...});');
  console.log('await stateManager.saveWorkflowState(workflow.id, workflow);\n');

  console.log('Step 4: Convert to N8N for visual editing');
  console.log('const n8nService = new N8NIntegrationService({...});');
  console.log('const n8nWorkflow = n8nService.convertToN8N(workflow);');
  console.log('await n8nService.createWorkflow(n8nWorkflow);\n');

  console.log('Step 5: Execute workflow');
  console.log('const execution = await orchestrator.executeWorkflow(workflow.id, {');
  console.log('  targetUrl: "https://example.com"');
  console.log('});\n');

  console.log('Step 6: Monitor execution');
  console.log('orchestrator.on("monitoring:data", (data) => {');
  console.log('  console.log("Progress:", data.metrics);');
  console.log('});\n');

  console.log('Step 7: Save final state');
  console.log('await stateManager.saveWorkflowState(');
  console.log('  execution.id,');
  console.log('  execution,');
  console.log('  "Workflow completed successfully"');
  console.log(');\n');
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  DeepSeek Workflow System - Usage Examples                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    await example1_BasicConfiguration();
    await example2_PromptTemplates();
    await example3_SchemaGeneration();
    await example4_SchemaMapGeneration();
    await example5_WorkflowExecution();
    await example6_GitStateManagement();
    await example7_N8NIntegration();
    await example8_WorkflowTemplates();
    await example9_EndToEndWorkflow();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  All examples completed successfully!                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('To run these examples with actual API integration:');
    console.log('1. Set your DEEPSEEK_API_KEY environment variable');
    console.log('2. Configure N8N connection if using N8N integration');
    console.log('3. Uncomment the API calls in the examples');
    console.log('4. Run: node deepseek-workflow-examples.js\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  example1_BasicConfiguration,
  example2_PromptTemplates,
  example3_SchemaGeneration,
  example4_SchemaMapGeneration,
  example5_WorkflowExecution,
  example6_GitStateManagement,
  example7_N8NIntegration,
  example8_WorkflowTemplates,
  example9_EndToEndWorkflow,
};
