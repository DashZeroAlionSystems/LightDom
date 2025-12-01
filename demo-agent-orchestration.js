#!/usr/bin/env node

/**
 * Agent Orchestration Demo
 *
 * Demonstrates the agent-driven component generation workflow:
 * 1. Natural language prompt → Intent analysis
 * 2. Config generation from intent
 * 3. Component/dashboard/service creation
 * 4. Files written to disk
 */

import { AgentWorkflowOrchestrator } from './services/agent-workflow-orchestrator.js';
import { AtomicComponentGenerator } from './services/atomic-component-generator.js';

console.log('🚀 Agent Orchestration Demo\n');
console.log('This demo shows how to use AI agents to generate components from prompts\n');

async function runDemo() {
  // Initialize orchestrator
  const orchestrator = new AgentWorkflowOrchestrator({
    deepseekModel: 'deepseek-reasoner',
    temperature: 0.7,
  });

  await orchestrator.initialize();

  // Demo prompts
  const prompts = [
    'Create a search bar component with an input field and search button',
    'Generate a user profile card with avatar, name, email, and bio',
    'Build a data table component with sorting and pagination',
  ];

  console.log('📝 Demo Prompts:');
  prompts.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  console.log('');

  // Run the first prompt as an example
  const selectedPrompt = prompts[0];
  console.log(`\n🎯 Executing: "${selectedPrompt}"\n`);

  try {
    const result = await orchestrator.executeFromPrompt(selectedPrompt, {
      useAI: process.env.DEEPSEEK_API_KEY ? true : false,
    });

    console.log('\n✅ Workflow Result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nNote: Make sure DEEPSEEK_API_KEY is set in your .env file for AI features');
  }

  await orchestrator.cleanup();
}

// Component generation demo
async function componentDemo() {
  console.log('\n\n📦 Component Generation Demo\n');

  const generator = new AtomicComponentGenerator({
    useAI: process.env.DEEPSEEK_API_KEY ? true : false,
  });

  await generator.initialize();

  // List available schemas
  console.log('Available component schemas:');
  const registry = generator.getRegistry();
  registry.forEach(comp => {
    const status = comp.generated ? '✓' : '○';
    console.log(`  ${status} ${comp.name} (${comp.schema['lightdom:componentType']})`);
  });

  // Generate a single component
  console.log('\n🔨 Generating Button component...\n');

  try {
    const result = await generator.generateComponent('Button', {
      useAI: false, // Use template-based generation for demo
    });

    console.log('✅ Component generated:');
    console.log(`   Types: ${Object.keys(result.files).join(', ')}`);
    console.log(`   Files written to: ${generator.config.outputDir}/Button/`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await generator.cleanup();
}

// Run demos
if (process.argv.includes('--component-only')) {
  await componentDemo();
} else if (process.argv.includes('--orchestrator-only')) {
  await runDemo();
} else {
  await componentDemo();
  await runDemo();
}

console.log('\n✨ Demo complete!\n');
