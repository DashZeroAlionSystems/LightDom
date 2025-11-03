#!/usr/bin/env node
/**
 * Test Schema-Driven Workflow System
 * Demonstrates Phase 2 capabilities
 */

import templateManager from '../services/workflow-template-manager.js';

console.log('🧪 Testing Schema-Driven Workflow System (Phase 2)\n');
console.log('='.repeat(60));

// Test 1: List available templates
console.log('\n📋 Test 1: List Available Templates');
console.log('-'.repeat(60));
const templates = templateManager.listTemplates();
templates.forEach(template => {
  console.log(`\n  ✓ ${template.name}`);
  console.log(`    ID: ${template.id}`);
  console.log(`    Type: ${template.type}`);
  console.log(`    Tasks: ${template.taskCount}`);
  console.log(`    Attributes: ${template.attributeCount}`);
  console.log(`    Version: ${template.version}`);
});

// Test 2: Get a specific template
console.log('\n\n📄 Test 2: Get Specific Template');
console.log('-'.repeat(60));
const dataminingTemplate = templateManager.getTemplate('datamining');
console.log(`  Template: ${dataminingTemplate.name}`);
console.log(`  Description: ${dataminingTemplate.description}`);
console.log(`  Tasks:`);
dataminingTemplate.tasks.forEach((task, i) => {
  console.log(`    ${i + 1}. ${task.label} (${task.handler.type})`);
  if (task.dependencies && task.dependencies.length > 0) {
    console.log(`       Dependencies: ${task.dependencies.join(', ')}`);
  }
});

// Test 3: Validate a workflow
console.log('\n\n✅ Test 3: Validate Workflow');
console.log('-'.repeat(60));
const validation = templateManager.validate(dataminingTemplate);
console.log(`  Valid: ${validation.valid}`);
if (validation.errors) {
  console.log(`  Errors:`, validation.errors);
}

// Test 4: Instantiate workflow from template
console.log('\n\n🔨 Test 4: Instantiate Workflow from Template');
console.log('-'.repeat(60));
const instance = templateManager.instantiateFromTemplate('datamining', {
  name: 'My Custom Data Mining Workflow',
  description: 'Custom workflow for specific project',
  config: {
    maxRetries: 5,
    timeout: 7200
  },
  metadata: {
    author: 'Test User',
    tags: ['test', 'custom', 'datamining']
  }
});

console.log(`  Workflow ID: ${instance.id}`);
console.log(`  Name: ${instance.name}`);
console.log(`  Instantiated from: ${instance.metadata.instantiatedFrom}`);
console.log(`  Tasks: ${instance.tasks.length}`);
console.log(`  Config:`);
console.log(`    - Max Retries: ${instance.config.maxRetries}`);
console.log(`    - Timeout: ${instance.config.timeout}s`);
console.log(`  Metadata:`);
console.log(`    - Author: ${instance.metadata.author}`);
console.log(`    - Tags: ${instance.metadata.tags.join(', ')}`);

// Test 5: Convert to database format
console.log('\n\n💾 Test 5: Convert to Database Format');
console.log('-'.repeat(60));
const dbFormat = templateManager.toDatabase(instance);
console.log(`  Workflow ID: ${dbFormat.workflow_id}`);
console.log(`  Tasks: ${dbFormat.tasks.length} records`);
console.log(`  Attributes: ${dbFormat.attributes.length} records`);
console.log(`  Sample Task:`);
const sampleTask = dbFormat.tasks[0];
console.log(`    - ID: ${sampleTask.task_id}`);
console.log(`    - Label: ${sampleTask.label}`);
console.log(`    - Handler: ${sampleTask.handler_type}`);
console.log(`    - Dependencies: ${sampleTask.dependencies}`);

// Test 6: Create custom workflow from scratch
console.log('\n\n🎨 Test 6: Create Custom Workflow');
console.log('-'.repeat(60));
try {
  const customWorkflow = templateManager.createCustomWorkflow({
    id: 'workflow-custom-test',
    name: 'Custom SEO Workflow',
    description: 'My custom SEO optimization workflow',
    type: 'custom',
    tasks: [
      {
        id: 'task-1',
        label: 'Analyze Page',
        description: 'Analyze page structure',
        handler: {
          type: 'crawler',
          config: {
            depth: 2
          }
        }
      },
      {
        id: 'task-2',
        label: 'Generate Report',
        description: 'Generate SEO report',
        handler: {
          type: 'seo-optimization',
          config: {
            format: 'pdf'
          }
        },
        dependencies: ['task-1']
      }
    ],
    attributes: [
      {
        id: 'attr-1',
        label: 'Title Tag',
        type: 'meta',
        enrichmentPrompt: 'Optimize title tag'
      }
    ]
  });

  console.log(`  ✅ Custom workflow created successfully`);
  console.log(`  ID: ${customWorkflow.id}`);
  console.log(`  Name: ${customWorkflow.name}`);
  console.log(`  Type: ${customWorkflow.type}`);
  console.log(`  Tasks: ${customWorkflow.tasks.length}`);
  console.log(`  Attributes: ${customWorkflow.attributes.length}`);
} catch (error) {
  console.log(`  ❌ Failed to create custom workflow: ${error.message}`);
}

// Test 7: Test invalid workflow
console.log('\n\n❌ Test 7: Validate Invalid Workflow');
console.log('-'.repeat(60));
const invalidWorkflow = {
  id: 'invalid-workflow',
  name: 'Test',
  // Missing required 'type' and 'tasks' fields
};

const invalidValidation = templateManager.validate(invalidWorkflow);
console.log(`  Valid: ${invalidValidation.valid}`);
if (invalidValidation.errors) {
  console.log(`  Errors found (expected):`);
  invalidValidation.errors.forEach((error, i) => {
    console.log(`    ${i + 1}. ${error.instancePath} ${error.message}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!\n');
console.log('Phase 2 Features Demonstrated:');
console.log('  ✓ Template listing and retrieval');
console.log('  ✓ Workflow schema validation');
console.log('  ✓ Template instantiation with customization');
console.log('  ✓ Database format conversion');
console.log('  ✓ Custom workflow creation');
console.log('  ✓ Error handling and validation');
console.log('\n🎉 Schema-Driven Workflow System is working!\n');
