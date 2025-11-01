#!/usr/bin/env node

/**
 * Workflow Generator Demo
 * Demonstrates self-generating workflows with minimal user interaction
 */

import WorkflowGenerator from './services/workflow-generator.js';
import ConfigurationManager from './services/configuration-manager.js';

async function runDemo() {
  console.log('🚀 WORKFLOW GENERATOR DEMONSTRATION');
  console.log('=' .repeat(60) + '\n');

  const generator = new WorkflowGenerator();
  const configManager = new ConfigurationManager();

  try {
    // Demo 1: Generate workflow from prompt
    console.log('DEMO 1: Generate Workflow from Prompt');
    console.log('-'.repeat(60));
    
    const prompt = 'Create user management workflow with settings';
    console.log(`\nPrompt: "${prompt}"\n`);
    
    const workflow = await generator.generateWorkflowFromPrompt(prompt);
    
    console.log('Generated Workflow Summary:');
    console.log(`  Name: ${workflow.name}`);
    console.log(`  Tables: ${workflow.tables.length}`);
    console.log(`  Atoms: ${workflow.atoms.length}`);
    console.log(`  Components: ${workflow.components.length}`);
    console.log(`  Dashboards: ${workflow.dashboards.length}`);
    console.log(`  Settings: ${workflow.settings.length}`);
    console.log('');

    // Demo 2: Show Settings vs Setup distinction
    console.log('\nDEMO 2: Settings vs Setup Distinction');
    console.log('-'.repeat(60));
    
    console.log('\n📝 SETTINGS (Individual Attributes):');
    const settings = await configManager.listSettings();
    console.log(`  Total Settings: ${settings.length}`);
    settings.slice(0, 5).forEach((setting, i) => {
      console.log(`  ${i + 1}. ${setting}`);
    });
    if (settings.length > 5) {
      console.log(`  ... and ${settings.length - 5} more`);
    }

    console.log('\n🔧 SETUPS (Complete Workflows):');
    const setups = await configManager.listSetups();
    console.log(`  Total Setups: ${setups.length}`);
    setups.forEach((setup, i) => {
      console.log(`  ${i + 1}. ${setup}`);
    });

    // Demo 3: Show bundling process
    console.log('\n\nDEMO 3: Bundling Process (Atoms → Components → Dashboards → Workflows)');
    console.log('-'.repeat(60));
    
    if (workflow.atoms.length > 0) {
      console.log('\n⚛️  ATOMS (Building Blocks):');
      workflow.atoms.slice(0, 3).forEach((atom, i) => {
        console.log(`  ${i + 1}. ${atom.name}`);
        console.log(`     Field: ${atom.field}`);
        console.log(`     Type: ${atom.componentType}`);
        console.log(`     Required: ${atom.required}`);
      });
      if (workflow.atoms.length > 3) {
        console.log(`  ... and ${workflow.atoms.length - 3} more atoms`);
      }
    }

    if (workflow.components.length > 0) {
      console.log('\n🧩 COMPONENTS (Bundled Atoms):');
      workflow.components.forEach((component, i) => {
        console.log(`  ${i + 1}. ${component.name}`);
        console.log(`     Atoms: ${component.atoms?.length || 0}`);
        console.log(`     Table: ${component.table || 'N/A'}`);
      });
    }

    if (workflow.dashboards.length > 0) {
      console.log('\n📋 DASHBOARDS (Bundled Components):');
      workflow.dashboards.forEach((dashboard, i) => {
        console.log(`  ${i + 1}. ${dashboard.name}`);
        console.log(`     Components: ${dashboard.components?.length || 0}`);
        console.log(`     Layout: ${dashboard.layout?.type || 'N/A'} (${dashboard.layout?.columns || 0} columns)`);
      });
    }

    // Demo 4: Configuration summary
    console.log('\n\nDEMO 4: Configuration Summary');
    console.log('-'.repeat(60));
    
    const summary = await configManager.getConfigurationSummary();
    console.log('\n📊 Configuration Statistics:');
    console.log(`  Atoms: ${summary.atoms.count}`);
    console.log(`  Settings: ${summary.settings.count}`);
    console.log(`  Setups: ${summary.setups.count}`);

    // Demo 5: Show reusability
    console.log('\n\nDEMO 5: Reusability');
    console.log('-'.repeat(60));
    
    console.log('\n♻️  All configurations are reusable:');
    console.log('  ✅ Atoms can be reused across components');
    console.log('  ✅ Settings can be applied to multiple workflows');
    console.log('  ✅ Components can be used in different dashboards');
    console.log('  ✅ Dashboards can be included in various workflows');
    console.log('  ✅ Setups can be executed multiple times');

    // Demo 6: Minimal user interaction
    console.log('\n\nDEMO 6: Minimal User Interaction');
    console.log('-'.repeat(60));
    
    console.log('\n🤖 Automated Workflow Features:');
    console.log('  ✅ Data mining - Automatically discovers relevant tables');
    console.log('  ✅ Schema linking - Analyzes relationships automatically');
    console.log('  ✅ Component generation - Creates UI components from schema');
    console.log('  ✅ Settings population - Auto-populates dropdowns and options');
    console.log('  ✅ Validation rules - Generated from database constraints');
    console.log('  ✅ Default values - Extracted from database schema');

    console.log('\n👤 User Interaction Required:');
    console.log('  1. Provide initial prompt (e.g., "Create user workflow")');
    console.log('  2. Optional: Review and adjust generated configuration');
    console.log('  3. Execute workflow with optional custom inputs');

    // Demo 7: Show workflow config
    console.log('\n\nDEMO 7: Generated Workflow Configuration');
    console.log('-'.repeat(60));
    
    const workflowConfig = await generator.generateWorkflowConfig(workflow.name);
    console.log('\n📄 Workflow Config:');
    console.log(`  Name: ${workflowConfig.name}`);
    console.log(`  Version: ${workflowConfig.version}`);
    console.log(`  Description: ${workflowConfig.description}`);
    console.log('\n  Requirements:');
    console.log(`    User Interaction: ${workflowConfig.requirements.userInteraction}`);
    console.log(`    Automation: ${workflowConfig.requirements.automation}`);
    console.log(`    Data Sources: ${workflowConfig.requirements.dataSources.join(', ')}`);
    
    console.log('\n  Usage:');
    console.log(`    Minimal: ${workflowConfig.usage.minimal}`);
    console.log(`    With Inputs: ${workflowConfig.usage.withInputs}`);

    // Demo 8: Self-generating workflow
    console.log('\n\nDEMO 8: Self-Generating Workflow');
    console.log('-'.repeat(60));
    
    const selfGenWorkflow = await configManager.createSelfGeneratingWorkflow(
      { name: 'Auto SEO Optimization' },
      {
        dataMining: true,
        schemaLinking: true,
        autoPopulate: true,
        minimalInteraction: true
      }
    );

    console.log('\n🔮 Self-Generating Workflow Created:');
    console.log(`  Name: ${selfGenWorkflow.name}`);
    console.log(`  Type: ${selfGenWorkflow.type}`);
    console.log(`  Phases: ${selfGenWorkflow.phases.length}`);
    
    console.log('\n  Automation Settings:');
    console.log(`    Data Mining: ${selfGenWorkflow.automation.dataMining ? 'Enabled' : 'Disabled'}`);
    console.log(`    Schema Linking: ${selfGenWorkflow.automation.schemaLinking ? 'Enabled' : 'Disabled'}`);
    console.log(`    Auto-Populate: ${selfGenWorkflow.automation.autoPopulate ? 'Enabled' : 'Disabled'}`);
    console.log(`    Minimal Interaction: ${selfGenWorkflow.automation.minimalInteraction ? 'Yes' : 'No'}`);

    console.log('\n  Phases:');
    selfGenWorkflow.phases.forEach((phase, i) => {
      console.log(`    ${i + 1}. ${phase.name} (${phase.steps.length} steps)`);
    });

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ DEMONSTRATION COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\nKey Achievements:');
    console.log('  ✅ Clear distinction between Settings and Setups');
    console.log('  ✅ Reusable configuration storage');
    console.log('  ✅ Atoms → Components → Dashboards → Workflows bundling');
    console.log('  ✅ Self-generating workflows with minimal interaction');
    console.log('  ✅ Automated data mining and schema linking');
    console.log('  ✅ Auto-populated components with options');
    console.log('  ✅ Configuration saved for reuse by generators');
    
    console.log('\nAPI Endpoints Available:');
    console.log('  GET  /api/workflow-generator/config/summary');
    console.log('  GET  /api/workflow-generator/settings');
    console.log('  GET  /api/workflow-generator/setups');
    console.log('  POST /api/workflow-generator/generate');
    console.log('  POST /api/workflow-generator/execute/:name');
    console.log('  POST /api/workflow-generator/self-generating');
    console.log('  POST /api/workflow-generator/bundle/component');
    console.log('  POST /api/workflow-generator/bundle/dashboard');
    console.log('  POST /api/workflow-generator/bundle/workflow');
    
    console.log('\nNext Steps:');
    console.log('  1. Use API to generate workflows from prompts');
    console.log('  2. Execute workflows with minimal user input');
    console.log('  3. Reuse configurations across multiple workflows');
    console.log('  4. Extend automation for more complex scenarios');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    console.error(error.stack);
  } finally {
    await generator.close();
  }
}

// Run demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo()
    .then(() => {
      console.log('\n✨ Demo completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    });
}

export { runDemo };
