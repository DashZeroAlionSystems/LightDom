#!/usr/bin/env node
/**
 * DeepSeek Workflow Generation Example
 * 
 * Demonstrates how DeepSeek AI can create, edit, and manage n8n workflows
 * using natural language commands.
 * 
 * Usage:
 *   node deepseek-workflow-example.js
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE = 'http://localhost:3001';

async function chat(message) {
  console.log(chalk.blue(`\n💬 You: ${message}`));
  
  try {
    const response = await axios.post(`${API_BASE}/api/deepseek-workflows/chat`, {
      message,
      conversationHistory: []
    });
    
    console.log(chalk.green(`\n🤖 DeepSeek: ${response.data.response}`));
    
    if (response.data.toolsExecuted && Object.keys(response.data.toolsExecuted).length > 0) {
      console.log(chalk.cyan(`\n🔧 Tools Used:`));
      Object.entries(response.data.toolsExecuted).forEach(([tool, result]) => {
        console.log(chalk.white(`   - ${tool}:`));
        console.log(chalk.gray(`     ${JSON.stringify(result, null, 2)}`));
      });
    }
    
    return response.data;
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.response?.data?.error || error.message}`));
    throw error;
  }
}

async function generateWorkflow(description, requirements = []) {
  console.log(chalk.blue(`\n🎯 Generating workflow...`));
  console.log(chalk.gray(`Description: ${description}`));
  
  try {
    const response = await axios.post(`${API_BASE}/api/deepseek-workflows/generate`, {
      description,
      requirements,
      context: {
        environment: 'production',
        database: 'PostgreSQL'
      }
    });
    
    console.log(chalk.green(`\n✅ Workflow generated successfully!`));
    console.log(chalk.cyan(`   Workflow ID: ${response.data.workflow.id}`));
    console.log(chalk.cyan(`   Name: ${response.data.workflow.name}`));
    console.log(chalk.cyan(`   Nodes: ${response.data.workflow.nodeCount}`));
    console.log(chalk.cyan(`   Active: ${response.data.workflow.active}`));
    
    return response.data.workflow;
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.response?.data?.error || error.message}`));
    throw error;
  }
}

async function runExamples() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     DeepSeek Workflow Generation Examples           ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════╝'));

  console.log(chalk.yellow('\nNote: Requires DEEPSEEK_API_KEY and N8N_API_KEY to be configured\n'));

  try {
    // Example 1: List available templates
    console.log(chalk.bold.white('\n┌─ Example 1: List Available Templates ─────────────────┐'));
    await chat('What workflow templates are available?');
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Example 2: Create workflow from template
    console.log(chalk.bold.white('\n┌─ Example 2: Create Workflow from Template ────────────┐'));
    await chat('Create a site monitoring workflow for example.com using the monitoring template');
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Example 3: Generate custom workflow with natural language
    console.log(chalk.bold.white('\n┌─ Example 3: Generate Custom Workflow ─────────────────┐'));
    
    const workflow = await generateWorkflow(
      'Monitor website performance and send alerts if page load time exceeds 3 seconds',
      [
        'Check the website every 30 minutes',
        'Measure page load time, first contentful paint, and largest contentful paint',
        'Send email alert if any metric is poor',
        'Store all metrics in PostgreSQL for historical analysis',
        'Include retry logic with exponential backoff'
      ]
    );
    
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Example 4: More complex workflow
    console.log(chalk.bold.white('\n┌─ Example 4: Complex SEO Workflow ─────────────────────┐'));
    await chat(`
      Create a workflow that:
      1. Crawls a website to find all pages
      2. For each page, extract SEO metadata (title, description, h1, etc.)
      3. Check for common SEO issues
      4. Generate recommendations
      5. Store results in database
      6. Send a summary email with findings
      
      The workflow should run weekly and handle errors gracefully.
    `);
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Example 5: Edit existing workflow
    console.log(chalk.bold.white('\n┌─ Example 5: Edit Workflow ────────────────────────────┐'));
    if (workflow && workflow.id) {
      await chat(`Add a Slack notification node to workflow ${workflow.id} that sends alerts to #monitoring channel`);
    } else {
      console.log(chalk.yellow('   Skipping - no workflow ID available'));
    }
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Example 6: Execute workflow
    console.log(chalk.bold.white('\n┌─ Example 6: Execute Workflow ─────────────────────────┐'));
    if (workflow && workflow.id) {
      await chat(`Execute workflow ${workflow.id} with targetUrl: https://example.com`);
    } else {
      console.log(chalk.yellow('   Skipping - no workflow ID available'));
    }
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Example 7: Get workflow status
    console.log(chalk.bold.white('\n┌─ Example 7: Check Workflow Status ────────────────────┐'));
    if (workflow && workflow.id) {
      await chat(`What's the status of workflow ${workflow.id}?`);
    } else {
      console.log(chalk.yellow('   Skipping - no workflow ID available'));
    }
    console.log(chalk.white('└───────────────────────────────────────────────────────┘'));

    // Summary
    console.log(chalk.bold.green('\n╔═══════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.green('║           Examples Completed Successfully!           ║'));
    console.log(chalk.bold.green('╚═══════════════════════════════════════════════════════╝'));

    console.log(chalk.cyan('\n🎓 Key Takeaways:'));
    console.log(chalk.white('   1. DeepSeek can list, create, and manage workflows using natural language'));
    console.log(chalk.white('   2. You can use templates or generate completely custom workflows'));
    console.log(chalk.white('   3. DeepSeek follows n8n standards automatically'));
    console.log(chalk.white('   4. Workflows are created directly in your n8n instance'));
    console.log(chalk.white('   5. All operations are tracked in the database'));

    console.log(chalk.cyan('\n💡 Use Cases:'));
    console.log(chalk.white('   - Rapid workflow prototyping'));
    console.log(chalk.white('   - Non-technical users creating workflows'));
    console.log(chalk.white('   - Automated workflow generation from requirements'));
    console.log(chalk.white('   - Conversational workflow debugging'));
    console.log(chalk.white('   - Batch workflow creation for multiple clients'));

  } catch (error) {
    console.error(chalk.bold.red('\n❌ Examples failed!'));
    console.error(chalk.red(`   Error: ${error.message}`));
    
    if (error.response?.status === 503) {
      console.log(chalk.yellow('\n⚠️  Troubleshooting:'));
      console.log(chalk.white('   1. Check that DEEPSEEK_API_KEY is set in .env'));
      console.log(chalk.white('   2. Verify N8N_API_KEY is configured'));
      console.log(chalk.white('   3. Ensure n8n instance is running'));
      console.log(chalk.white('   4. Check API server is running on port 3001'));
    }
    
    process.exit(1);
  }
}

// Additional helper examples
console.log(chalk.gray('\n📚 Additional Usage Examples:'));
console.log(chalk.white(`
// JavaScript/Node.js
import axios from 'axios';

// Simple chat
const response = await axios.post('http://localhost:3001/api/deepseek-workflows/chat', {
  message: 'Create a monitoring workflow for my site',
  conversationHistory: []
});

// Generate specific workflow
const workflow = await axios.post('http://localhost:3001/api/deepseek-workflows/generate', {
  description: 'Monitor API endpoints and alert on failures',
  requirements: ['Check every 5 minutes', 'Send Slack alerts', 'Log to database']
});

// Create from template
const templated = await axios.post('http://localhost:3001/api/deepseek-workflows/from-template', {
  templateName: 'siteMonitoring',
  customName: 'My Site Monitor',
  clientId: 'client-uuid',
  activate: true
});
`));

console.log(chalk.white(`
// cURL Examples
curl -X POST http://localhost:3001/api/deepseek-workflows/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "List all workflow templates"}'

curl -X POST http://localhost:3001/api/deepseek-workflows/generate \\
  -H "Content-Type: application/json" \\
  -d '{"description": "Monitor site uptime", "requirements": ["Check every minute"]}'
`));

// Run examples
runExamples()
  .then(() => {
    console.log(chalk.green('\n✨ All examples completed!\n'));
    process.exit(0);
  })
  .catch(error => {
    console.error(chalk.red('\n💥 Examples failed:'));
    console.error(error);
    process.exit(1);
  });
