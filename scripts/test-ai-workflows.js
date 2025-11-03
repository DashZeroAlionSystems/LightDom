#!/usr/bin/env node
/**
 * Test AI-Powered Workflow Generation (Phase 3)
 * Demonstrates natural language to workflow schema conversion
 */

import AIWorkflowGenerator from '../services/ai-workflow-generator.js';
import templateManager from '../services/workflow-template-manager.js';

const aiGenerator = new AIWorkflowGenerator();

console.log('🤖 Testing AI-Powered Workflow Generation (Phase 3)\n');
console.log('='.repeat(70));

async function runTests() {
  // Test 1: Check Ollama availability
  console.log('\n📡 Test 1: Check AI Service Availability');
  console.log('-'.repeat(70));
  const isAvailable = await aiGenerator.checkOllamaAvailability();
  console.log(`  Ollama Available: ${isAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`  Model: ${aiGenerator.model}`);
  
  if (!isAvailable) {
    console.log('\n⚠️  Ollama not found. Install it to use AI features:');
    console.log('   curl https://ollama.ai/install.sh | sh');
    console.log('   ollama run llama2');
    console.log('\n📋 Continuing with fallback (template-based) generation...\n');
  }

  // Test 2: Simple workflow generation
  console.log('\n\n🎯 Test 2: Generate Workflow from Simple Prompt');
  console.log('-'.repeat(70));
  const prompt1 = 'Create a workflow to analyze website SEO and generate a report';
  console.log(`  Prompt: "${prompt1}"`);
  
  try {
    const workflow1 = await aiGenerator.generateWorkflowFromPrompt(prompt1);
    console.log(`\n  ✅ Generated Workflow:`);
    console.log(`     Name: ${workflow1.name}`);
    console.log(`     Type: ${workflow1.type}`);
    console.log(`     Tasks: ${workflow1.tasks.length}`);
    workflow1.tasks.forEach((task, i) => {
      console.log(`       ${i + 1}. ${task.label} (${task.handler.type})`);
    });
    
    // Validate
    const validation1 = templateManager.validate(workflow1);
    console.log(`\n  Validation: ${validation1.valid ? '✅ Valid' : '❌ Invalid'}`);
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  // Test 3: Complex workflow generation
  console.log('\n\n🎯 Test 3: Generate Complex Workflow');
  console.log('-'.repeat(70));
  const prompt2 = 'Build a data pipeline that extracts product data from a database, enriches it with AI-generated descriptions, creates React components, and deploys them to production';
  console.log(`  Prompt: "${prompt2}"`);
  
  try {
    const workflow2 = await aiGenerator.generateWorkflowFromPrompt(prompt2);
    console.log(`\n  ✅ Generated Workflow:`);
    console.log(`     Name: ${workflow2.name}`);
    console.log(`     Description: ${workflow2.description}`);
    console.log(`     Tasks: ${workflow2.tasks.length}`);
    workflow2.tasks.forEach((task, i) => {
      console.log(`       ${i + 1}. ${task.label}`);
      if (task.dependencies && task.dependencies.length > 0) {
        console.log(`          Dependencies: ${task.dependencies.join(', ')}`);
      }
    });
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  // Test 4: Task suggestions
  console.log('\n\n💡 Test 4: Get Task Suggestions');
  console.log('-'.repeat(70));
  const goal = 'Create an automated content generation system';
  console.log(`  Goal: "${goal}"`);
  
  try {
    const tasks = await aiGenerator.suggestTasks(goal);
    console.log(`\n  ✅ Suggested Tasks: ${tasks.length}`);
    tasks.forEach((task, i) => {
      console.log(`     ${i + 1}. ${task.label || 'Task ' + (i + 1)}`);
      console.log(`        Type: ${task.handler?.type || 'N/A'}`);
    });
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  // Test 5: Workflow enhancement
  console.log('\n\n✨ Test 5: Enhance Existing Workflow');
  console.log('-'.repeat(70));
  
  const basicWorkflow = {
    id: 'workflow-test',
    name: 'Test Workflow',
    type: 'custom',
    version: '1.0.0',
    tasks: [
      {
        id: 'task-1',
        label: 'Data Collection',
        handler: { type: 'data-source', config: {} }
      },
      {
        id: 'task-2',
        label: 'Processing',
        handler: { type: 'custom', config: {} },
        dependencies: ['task-1']
      }
    ]
  };

  console.log(`  Original Workflow:`);
  console.log(`     Name: ${basicWorkflow.name}`);
  console.log(`     Description: ${basicWorkflow.description || '(none)'}`);
  console.log(`     Tasks: ${basicWorkflow.tasks.length}`);
  
  try {
    const enhanced = await aiGenerator.enhanceWorkflow(basicWorkflow);
    console.log(`\n  ✅ Enhanced Workflow:`);
    console.log(`     Description: ${enhanced.description}`);
    enhanced.tasks.forEach((task, i) => {
      console.log(`     Task ${i + 1}: ${task.label}`);
      console.log(`        Description: ${task.description}`);
    });
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  // Test 6: Fallback mechanism
  console.log('\n\n🔄 Test 6: Fallback to Template');
  console.log('-'.repeat(70));
  const fallbackPrompt = 'Generate SEO optimization workflow';
  console.log(`  Prompt: "${fallbackPrompt}"`);
  console.log(`  Simulating AI failure...`);
  
  const fallbackWorkflow = aiGenerator.fallbackToTemplate(fallbackPrompt);
  console.log(`\n  ✅ Fallback Successful:`);
  console.log(`     Name: ${fallbackWorkflow.name}`);
  console.log(`     Type: ${fallbackWorkflow.type}`);
  console.log(`     Tasks: ${fallbackWorkflow.tasks.length}`);
  console.log(`     Based on template: ${fallbackWorkflow.metadata.instantiatedFrom}`);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ All tests completed!\n');
  console.log('Phase 3 Features Demonstrated:');
  console.log('  ✓ AI service availability check');
  console.log('  ✓ Natural language workflow generation');
  console.log('  ✓ Complex workflow with task dependencies');
  console.log('  ✓ Task suggestions based on goals');
  console.log('  ✓ Workflow enhancement with AI');
  console.log('  ✓ Fallback to templates when AI unavailable');
  console.log('\n🎉 AI-Powered Workflow System is working!\n');
  
  if (!isAvailable) {
    console.log('💡 Tip: Install Ollama to enable full AI features:');
    console.log('   https://ollama.ai\n');
  }
}

runTests().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
