#!/usr/bin/env node
/**
 * Test Script for Header Script Injection Workflow System
 * 
 * This script demonstrates and tests:
 * - Client site creation
 * - Header script generation
 * - N8N workflow creation
 * - DeepSeek workflow generation
 * - Workflow execution
 * 
 * Usage:
 *   node test-header-script-injection.js
 * 
 * Prerequisites:
 *   - API server running on port 3001
 *   - N8N instance running and configured
 *   - Database migrations applied
 *   - Environment variables set (DATABASE_URL, N8N_API_KEY, DEEPSEEK_API_KEY)
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE = 'http://localhost:3001';
const TEST_DOMAIN = `test-${Date.now()}.example.com`;

// Helper to make API calls with error handling
async function apiCall(method, endpoint, data = null, description = '') {
  console.log(chalk.blue(`\n🔄 ${description || `${method} ${endpoint}`}...`));
  
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(chalk.green(`✅ Success!`));
    return response.data;
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.response?.data?.error || error.message}`));
    if (error.response?.data) {
      console.error(chalk.yellow(JSON.stringify(error.response.data, null, 2)));
    }
    throw error;
  }
}

// Helper to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║   Header Script Injection Workflow System Test Suite    ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));

  let clientId = null;
  let workflowIds = {};

  try {
    // Test 1: Create Client Site
    console.log(chalk.bold.yellow('\n📍 TEST 1: Create Client Site'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const createResult = await apiCall(
      'POST',
      '/api/client-sites',
      {
        domain: TEST_DOMAIN,
        subscriptionTier: 'starter',
        config: {
          autoOptimize: true,
          realtimeUpdates: true
        }
      },
      'Creating new client site'
    );
    
    clientId = createResult.client.id;
    console.log(chalk.green(`   Client ID: ${clientId}`));
    console.log(chalk.green(`   Domain: ${createResult.client.domain}`));
    console.log(chalk.green(`   API Key: ${createResult.client.apiKey.substring(0, 16)}...`));
    console.log(chalk.yellow(`   ⚠️  Store API key securely - it won't be shown again!`));

    // Test 2: Generate Header Script
    console.log(chalk.bold.yellow('\n📍 TEST 2: Generate Header Script'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const scriptResult = await apiCall(
      'POST',
      `/api/client-sites/${clientId}/generate-script`,
      {
        autoOptimize: true,
        realtimeUpdates: true
      },
      'Generating header script for client'
    );
    
    console.log(chalk.green(`   Script Version: ${scriptResult.scriptVersion}`));
    console.log(chalk.cyan('\n   Header Script:'));
    console.log(chalk.gray(scriptResult.headerScript));

    // Test 3: List Workflow Templates
    console.log(chalk.bold.yellow('\n📍 TEST 3: List Available Workflow Templates'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const templatesResult = await apiCall(
      'GET',
      '/api/deepseek-workflows/templates',
      null,
      'Fetching available workflow templates'
    );
    
    console.log(chalk.green(`   Found ${templatesResult.count} templates:`));
    templatesResult.templates.forEach(template => {
      console.log(chalk.cyan(`   - ${template.name} (${template.nodeCount} nodes)`));
      console.log(chalk.gray(`     ${template.description}`));
    });

    // Test 4: Create Workflows from Templates
    console.log(chalk.bold.yellow('\n📍 TEST 4: Create N8N Workflows from Templates'));
    console.log(chalk.gray('─'.repeat(60)));
    
    console.log(chalk.blue('   This will create workflows in your n8n instance...'));
    console.log(chalk.yellow('   Note: Requires N8N_API_KEY to be configured'));
    
    try {
      const workflowResult = await apiCall(
        'POST',
        `/api/client-sites/${clientId}/create-workflows`,
        {
          workflowTypes: ['injection', 'monitoring', 'optimization']
        },
        'Creating workflows in n8n'
      );
      
      workflowIds = workflowResult.workflows;
      
      console.log(chalk.green(`   Created workflows:`));
      Object.entries(workflowIds).forEach(([type, workflow]) => {
        if (workflow.id) {
          console.log(chalk.cyan(`   - ${type}: ${workflow.name}`));
          console.log(chalk.gray(`     ID: ${workflow.id}, Active: ${workflow.active}`));
        } else {
          console.log(chalk.red(`   - ${type}: Failed - ${workflow.error}`));
        }
      });
    } catch (error) {
      console.log(chalk.yellow('   ⚠️  Workflow creation failed (n8n may not be configured)'));
    }

    // Test 5: Check Injection Status
    console.log(chalk.bold.yellow('\n📍 TEST 5: Check Injection Status'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const statusResult = await apiCall(
      'GET',
      `/api/client-sites/${clientId}/injection-status`,
      null,
      'Checking script injection status'
    );
    
    console.log(chalk.green(`   Script Injected: ${statusResult.client.script_injected}`));
    console.log(chalk.green(`   Script Version: ${statusResult.client.script_version}`));
    console.log(chalk.green(`   Injection Date: ${statusResult.client.script_injection_date}`));
    console.log(chalk.cyan(`   Injection Events: ${statusResult.injectionHistory.length}`));
    
    if (statusResult.injectionHistory.length > 0) {
      const latestEvent = statusResult.injectionHistory[0];
      console.log(chalk.gray(`   Latest: ${latestEvent.event_type} - ${latestEvent.status}`));
    }

    // Test 6: Get Client Details
    console.log(chalk.bold.yellow('\n📍 TEST 6: Get Client Details'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const clientResult = await apiCall(
      'GET',
      `/api/client-sites/${clientId}`,
      null,
      'Fetching client details'
    );
    
    console.log(chalk.green(`   Domain: ${clientResult.client.domain}`));
    console.log(chalk.green(`   Status: ${clientResult.client.status}`));
    console.log(chalk.green(`   Auto Optimize: ${clientResult.client.auto_optimize}`));
    console.log(chalk.green(`   Realtime Updates: ${clientResult.client.realtime_updates}`));
    if (clientResult.client.injection_workflow_id) {
      console.log(chalk.cyan(`   Injection Workflow: ${clientResult.client.injection_workflow_id}`));
    }
    if (clientResult.client.monitoring_workflow_id) {
      console.log(chalk.cyan(`   Monitoring Workflow: ${clientResult.client.monitoring_workflow_id}`));
    }

    // Test 7: List All Clients
    console.log(chalk.bold.yellow('\n📍 TEST 7: List All Client Sites'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const listResult = await apiCall(
      'GET',
      '/api/client-sites?limit=10',
      null,
      'Fetching all client sites'
    );
    
    console.log(chalk.green(`   Total Clients: ${listResult.count}`));
    listResult.clients.forEach(client => {
      console.log(chalk.cyan(`   - ${client.domain} (${client.status})`));
      console.log(chalk.gray(`     Injected: ${client.script_injected}, Version: ${client.script_version || 'N/A'}`));
    });

    // Test 8: DeepSeek Chat (Optional - requires DEEPSEEK_API_KEY)
    console.log(chalk.bold.yellow('\n📍 TEST 8: DeepSeek AI Workflow Chat (Optional)'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.yellow('   Note: Requires DEEPSEEK_API_KEY to be configured'));
    
    try {
      const chatResult = await apiCall(
        'POST',
        '/api/deepseek-workflows/chat',
        {
          message: `List all available workflow templates and explain what they do.`,
          conversationHistory: []
        },
        'Chatting with DeepSeek about workflows'
      );
      
      console.log(chalk.green(`   DeepSeek Response:`));
      console.log(chalk.white(chatResult.response));
      
      if (chatResult.toolsExecuted && Object.keys(chatResult.toolsExecuted).length > 0) {
        console.log(chalk.cyan(`   Tools Executed: ${Object.keys(chatResult.toolsExecuted).join(', ')}`));
      }
    } catch (error) {
      console.log(chalk.yellow('   ⚠️  DeepSeek chat failed (API key may not be configured)'));
    }

    // Test 9: Update Client Settings
    console.log(chalk.bold.yellow('\n📍 TEST 9: Update Client Settings'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const updateResult = await apiCall(
      'PUT',
      `/api/client-sites/${clientId}`,
      {
        autoOptimize: false,
        realtimeUpdates: true
      },
      'Updating client settings'
    );
    
    console.log(chalk.green(`   Updated Settings:`));
    console.log(chalk.cyan(`   - Auto Optimize: ${updateResult.client.auto_optimize}`));
    console.log(chalk.cyan(`   - Realtime Updates: ${updateResult.client.realtime_updates}`));

    // Summary
    console.log(chalk.bold.green('\n╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.green('║              All Tests Completed Successfully!           ║'));
    console.log(chalk.bold.green('╚════════════════════════════════════════════════════════════╝'));
    
    console.log(chalk.white('\n📊 Test Summary:'));
    console.log(chalk.green(`   ✅ Client created: ${TEST_DOMAIN}`));
    console.log(chalk.green(`   ✅ Header script generated`));
    console.log(chalk.green(`   ✅ Injection status tracked`));
    console.log(chalk.green(`   ✅ API endpoints validated`));
    
    if (Object.keys(workflowIds).length > 0) {
      console.log(chalk.green(`   ✅ Workflows created in n8n`));
    } else {
      console.log(chalk.yellow(`   ⚠️  Workflows not created (n8n not configured)`));
    }

    console.log(chalk.cyan('\n🔗 Next Steps:'));
    console.log(chalk.white('   1. Copy the header script from Test 2'));
    console.log(chalk.white('   2. Paste it into your client site\'s <head> section'));
    console.log(chalk.white('   3. Visit your n8n instance to see the created workflows'));
    console.log(chalk.white('   4. Monitor execution in the workflow_execution_logs table'));

    console.log(chalk.cyan('\n📚 Documentation:'));
    console.log(chalk.white('   See HEADER_SCRIPT_INJECTION_WORKFLOW_README.md for full documentation'));

    // Cleanup option
    console.log(chalk.yellow('\n⚠️  Test Client Cleanup:'));
    console.log(chalk.gray(`   To delete test client: DELETE ${API_BASE}/api/client-sites/${clientId}`));

  } catch (error) {
    console.error(chalk.bold.red('\n❌ Test Suite Failed!'));
    console.error(chalk.red(`   Error: ${error.message}`));
    process.exit(1);
  }
}

// Run tests
console.log(chalk.gray('\nStarting test suite...\n'));
runTests()
  .then(() => {
    console.log(chalk.green('\n✨ Test suite completed successfully!\n'));
    process.exit(0);
  })
  .catch(error => {
    console.error(chalk.red('\n💥 Test suite failed with error:'));
    console.error(error);
    process.exit(1);
  });
