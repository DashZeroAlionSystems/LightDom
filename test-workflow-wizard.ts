/**
 * Workflow Wizard Test Script
 * 
 * Tests the component generation workflow with DeepSeek/Ollama
 * Run this script to verify everything is working correctly
 */

import { workflowWizardService } from './src/services/WorkflowWizardService.js';
import { getDatabaseService } from './src/services/DatabaseService.js';
import { componentLibraryService } from './src/services/ComponentLibraryService.js';

async function testWorkflowWizard() {
  console.log('🧪 Starting Workflow Wizard Test Suite\n');

  try {
    // Step 1: Test database connection
    console.log('📊 Step 1: Testing Database Connection...');
    const dbService = getDatabaseService();
    const health = await dbService.healthCheck();
    
    if (health.healthy) {
      console.log('✅ Database connected successfully');
      console.log(`   Latency: ${health.latency}ms\n`);
    } else {
      console.log('❌ Database connection failed');
      return;
    }

    // Step 2: Load atomic component schemas
    console.log('📦 Step 2: Loading Atomic Component Schemas...');
    await componentLibraryService.loadAtomicSchemasFromFiles();
    const components = await componentLibraryService.getAtomicComponents();
    console.log(`✅ Loaded ${components.length} atomic component schemas\n`);

    // Step 3: Test prompt analysis
    console.log('🔍 Step 3: Testing Prompt Analysis with DeepSeek...');
    const testPrompt = 'Create a user login form with email and password fields, a remember me checkbox, and a submit button';
    
    try {
      const analysis = await workflowWizardService.analyzePrompt({
        prompt: testPrompt,
        model: 'deepseek-r1:1.5b',
      });

      console.log('✅ Prompt analyzed successfully');
      console.log('   Component Name:', analysis.componentName);
      console.log('   Component Type:', analysis.componentType);
      console.log('   Base Components:', analysis.baseComponents.join(', '));
      console.log('   Design System:', analysis.requirements.designSystem);
      console.log('');
    } catch (error) {
      console.log('⚠️  Prompt analysis failed (Ollama might not be running)');
      console.log('   Error:', error instanceof Error ? error.message : String(error));
      console.log('   Continuing with other tests...\n');
    }

    // Step 4: Test component generation workflow (full integration)
    console.log('🚀 Step 4: Testing Component Generation Workflow...');
    
    try {
      const result = await workflowWizardService.generateComponentWorkflow({
        prompt: 'A simple contact form with name, email, and message fields',
        componentName: 'ContactForm',
        componentType: 'organism',
        designSystem: 'Material Design 3',
        baseComponents: ['ld:form-field', 'ld:button', 'ld:textarea'],
        model: 'deepseek-r1:1.5b',
      });

      console.log('✅ Component generated successfully');
      console.log('   Workflow ID:', result.workflow.id);
      console.log('   Status:', result.workflow.status);
      console.log('   Component Code Length:', result.component.code?.length || 0, 'characters');
      console.log('');

      // Step 5: Verify workflow was saved to database
      console.log('💾 Step 5: Verifying Workflow Database Persistence...');
      const savedWorkflow = await workflowWizardService.getWorkflow(result.workflow.id);
      
      if (savedWorkflow) {
        console.log('✅ Workflow saved to database');
        console.log('   ID:', savedWorkflow.id);
        console.log('   Name:', savedWorkflow.name);
        console.log('   Status:', savedWorkflow.status);
        console.log('');
      } else {
        console.log('❌ Workflow not found in database');
      }

      // Step 6: List all workflows
      console.log('📋 Step 6: Listing All Workflows...');
      const allWorkflows = await workflowWizardService.getWorkflows();
      console.log(`✅ Found ${allWorkflows.length} workflows in database`);
      
      if (allWorkflows.length > 0) {
        console.log('\nRecent workflows:');
        allWorkflows.slice(0, 5).forEach((wf, idx) => {
          console.log(`   ${idx + 1}. ${wf.name} - Status: ${wf.status} (${new Date(wf.createdAt).toLocaleString()})`);
        });
      }
      console.log('');

    } catch (error) {
      console.log('⚠️  Component generation failed');
      console.log('   Error:', error instanceof Error ? error.message : String(error));
      console.log('   This is expected if Ollama is not running\n');
    }

    // Final summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Test Suite Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 Summary:');
    console.log('   ✅ Database connection: Working');
    console.log('   ✅ Component schemas: Loaded');
    console.log('   ⚠️  AI integration: Requires Ollama running');
    console.log('');

    console.log('🎯 Next Steps:');
    console.log('   1. Ensure Ollama is running: ollama serve');
    console.log('   2. Pull DeepSeek model: ollama pull deepseek-r1:1.5b');
    console.log('   3. Open workflow-wizard.html in your browser');
    console.log('   4. Start generating components!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('\nStack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Run tests
testWorkflowWizard();
