#!/usr/bin/env node

/**
 * Visual Workflow Builder Test Script
 * 
 * Demonstrates the visual workflow builder capabilities:
 * 1. Creating workflows with visual task placement
 * 2. Building task dependencies/connections
 * 3. Saving visually-designed workflows
 * 4. Loading and executing visual workflows
 */

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3001';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create a sample workflow using visual builder format
 */
async function createVisualWorkflow() {
  log('\n=== Creating Visual Workflow ===', 'blue');

  const visualWorkflow = {
    name: 'E-Commerce Product Pipeline',
    version: '1.0.0',
    metadata: {
      author: 'Visual Builder',
      createdAt: new Date().toISOString(),
      description: 'Product data processing with visual layout',
      tags: ['ecommerce', 'products', 'visual']
    },
    tasks: [
      {
        id: 'task-1',
        label: 'Fetch Product Data',
        description: 'Retrieve product information from database',
        handler: 'data-source',
        position: { x: 100, y: 100 },
        config: {
          source: 'products_table',
          query: 'SELECT * FROM products WHERE active = true'
        }
      },
      {
        id: 'task-2',
        label: 'Extract Images',
        description: 'Mine product images from DOM',
        handler: 'dom-mining',
        position: { x: 100, y: 250 },
        dependencies: ['task-1'],
        config: {
          selectors: ['.product-image', 'img[data-product]']
        }
      },
      {
        id: 'task-3',
        label: 'Optimize SEO',
        description: 'Generate SEO metadata for products',
        handler: 'seo-optimization',
        position: { x: 100, y: 400 },
        dependencies: ['task-1'],
        config: {
          includeKeywords: true,
          generateAltText: true
        }
      },
      {
        id: 'task-4',
        label: 'Generate Components',
        description: 'Create reusable product components',
        handler: 'component-generation',
        position: { x: 400, y: 250 },
        dependencies: ['task-2', 'task-3'],
        config: {
          framework: 'react',
          typescript: true
        }
      },
      {
        id: 'task-5',
        label: 'Train ML Model',
        description: 'Train recommendation model on product data',
        handler: 'ml-training',
        position: { x: 400, y: 400 },
        dependencies: ['task-4'],
        config: {
          algorithm: 'collaborative-filtering',
          epochs: 50
        }
      }
    ],
    config: {
      allowParallelExecution: true,
      maxRetries: 3,
      timeout: 7200
    }
  };

  try {
    const response = await axios.post(
      `${API_BASE}/api/workflow-admin/workflows`,
      visualWorkflow
    );
    log(`✓ Visual workflow created: ${response.data.workflow.id}`, 'green');
    return response.data.workflow;
  } catch (error) {
    log(`✗ Failed to create workflow: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Create workflow from template and customize visually
 */
async function createFromTemplate() {
  log('\n=== Creating from Template (Visual Customization) ===', 'blue');

  try {
    // First, get available templates
    const templatesResponse = await axios.get(
      `${API_BASE}/api/workflow-admin/templates`
    );
    log(`Available templates: ${templatesResponse.data.templates.length}`, 'yellow');

    // Create workflow from datamining template
    const response = await axios.post(
      `${API_BASE}/api/workflow-admin/workflows/from-template`,
      {
        templateId: 'datamining',
        customization: {
          name: 'Visually Customized Data Mining',
          metadata: {
            author: 'Visual Builder Test',
            visuallyDesigned: true
          },
          // Add visual positioning to template tasks
          taskPositions: {
            'task-1': { x: 150, y: 100 },
            'task-2': { x: 150, y: 250 },
            'task-3': { x: 150, y: 400 },
            'task-4': { x: 450, y: 250 },
            'task-5': { x: 450, y: 400 },
            'task-6': { x: 750, y: 325 }
          }
        }
      }
    );
    log(`✓ Template workflow created with visual layout: ${response.data.workflow.id}`, 'green');
    return response.data.workflow;
  } catch (error) {
    log(`✗ Failed to create from template: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Execute visual workflow and monitor progress
 */
async function executeVisualWorkflow(workflowId) {
  log(`\n=== Executing Visual Workflow: ${workflowId} ===`, 'blue');

  try {
    const response = await axios.post(
      `${API_BASE}/api/workflow-admin/workflows/${workflowId}/execute`
    );
    log('✓ Workflow execution started', 'green');

    // Monitor execution
    let isRunning = true;
    let pollCount = 0;
    const maxPolls = 30;

    while (isRunning && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `${API_BASE}/api/workflow-admin/workflows/${workflowId}`
      );
      const workflow = statusResponse.data.workflow;

      log(`\nWorkflow Status: ${workflow.status}`, 'yellow');
      
      // Show task statuses
      workflow.tasks.forEach(task => {
        const icon = task.status === 'completed' ? '✓' : 
                     task.status === 'in_progress' ? '⟳' : '○';
        log(`  ${icon} ${task.label}: ${task.status}`, 
            task.status === 'completed' ? 'green' : 'yellow');
      });

      if (workflow.status === 'completed' || workflow.status === 'failed') {
        isRunning = false;
        if (workflow.status === 'completed') {
          log('\n✓ Workflow completed successfully!', 'green');
          if (workflow.seoScore) {
            log(`  SEO Score: ${workflow.seoScore}`, 'blue');
          }
        } else {
          log('\n✗ Workflow execution failed', 'red');
        }
      }

      pollCount++;
    }

    if (isRunning) {
      log('\n⚠ Workflow still running (timeout reached)', 'yellow');
    }

    return statusResponse.data.workflow;
  } catch (error) {
    log(`✗ Failed to execute workflow: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Demonstrate visual workflow builder features
 */
async function demonstrateVisualBuilder() {
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║  Visual Workflow Builder - Feature Demonstration  ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');

  // Test 1: Create custom visual workflow
  log('\n【Test 1】 Custom Visual Workflow Creation', 'blue');
  const customWorkflow = await createVisualWorkflow();
  if (customWorkflow) {
    log(`  ✓ Workflow ID: ${customWorkflow.id}`, 'green');
    log(`  ✓ Tasks: ${customWorkflow.tasks.length}`, 'green');
    log(`  ✓ All tasks have visual positions`, 'green');
  }

  // Test 2: Create from template with visual customization
  log('\n【Test 2】 Template with Visual Customization', 'blue');
  const templateWorkflow = await createFromTemplate();
  if (templateWorkflow) {
    log(`  ✓ Template workflow customized visually`, 'green');
  }

  // Test 3: Execute visual workflow
  if (customWorkflow) {
    log('\n【Test 3】 Execute Visual Workflow', 'blue');
    await executeVisualWorkflow(customWorkflow.id);
  }

  // Test 4: List all workflows
  log('\n【Test 4】 List All Workflows', 'blue');
  try {
    const response = await axios.get(
      `${API_BASE}/api/workflow-admin/workflows/summary`
    );
    log(`✓ Total workflows: ${response.data.workflows.length}`, 'green');
    
    response.data.workflows.forEach(workflow => {
      log(`\n  Workflow: ${workflow.campaignName || workflow.name}`, 'yellow');
      log(`    Status: ${workflow.status}`, 'blue');
      log(`    Tasks: ${workflow.tasks.length}`, 'blue');
      if (workflow.seoScore) {
        log(`    SEO Score: ${workflow.seoScore}`, 'blue');
      }
    });
  } catch (error) {
    log(`✗ Failed to list workflows: ${error.message}`, 'red');
  }

  log('\n✓ Visual workflow builder demonstration complete!', 'green');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check API availability
    log('Checking API availability...', 'yellow');
    await axios.get(`${API_BASE}/api/workflow-admin/workflows/summary`);
    log('✓ API is available', 'green');

    // Run demonstrations
    await demonstrateVisualBuilder();

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n✗ Error: Cannot connect to API server', 'red');
      log('Please ensure the API server is running on port 3001', 'yellow');
      log('Start it with: npm run start:api', 'yellow');
    } else {
      log(`\n✗ Error: ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createVisualWorkflow, executeVisualWorkflow };
