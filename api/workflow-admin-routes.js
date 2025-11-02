/**
 * Workflow Admin API Routes
 * 
 * Provides endpoints for:
 * - Listing workflows with summary data
 * - Creating and executing datamining workflows
 * - Managing workflow runs and status
 */

import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const router = express.Router();

// Database connection (for future use when migrating to persistent storage)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// TODO: Replace in-memory storage with database persistence
// In-memory workflow storage (temporary solution for MVP - not production-ready)
// This should be migrated to database tables for production use
let workflows = [];
let workflowRuns = [];
let workflowIdCounter = 1;
let runIdCounter = 1;

/**
 * GET /api/workflow-admin/workflows/summary
 * Get summary of all workflows
 */
router.get('/workflows/summary', async (req, res) => {
  try {
    // Return workflows with enhanced data structure
    const workflowSummaries = workflows.map(workflow => ({
      id: workflow.id,
      workflowId: workflow.id,
      campaignName: workflow.name,
      datasetName: workflow.name,
      ownerName: workflow.ownerName || 'Admin User',
      ownerEmail: workflow.ownerEmail || 'admin@lightdom.io',
      scriptInjected: workflow.scriptInjected || false,
      status: workflow.status || 'draft',
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt || workflow.createdAt,
      n8nWorkflowId: workflow.n8nWorkflowId,
      tensorflowInstanceId: workflow.tensorflowInstanceId,
      seoScore: workflow.seoScore,
      tasks: workflow.tasks || [],
      activeTasks: workflow.tasks || [],
      attributes: workflow.attributes || [],
      automationThreshold: workflow.automationThreshold || 120,
      pendingAutomation: workflow.pendingAutomation !== false,
    }));

    res.json({
      success: true,
      workflows: workflowSummaries,
      total: workflowSummaries.length
    });
  } catch (error) {
    console.error('Error fetching workflow summaries:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch workflow summaries', 
      details: error.message 
    });
  }
});

/**
 * POST /api/workflow-admin/workflows
 * Create a new workflow
 */
router.post('/workflows', async (req, res) => {
  try {
    const {
      name,
      description,
      type = 'datamining',
      ownerName,
      ownerEmail,
      tasks = [],
      attributes = [],
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required'
      });
    }

    const workflow = {
      id: `workflow-${workflowIdCounter++}`,
      name,
      description,
      type,
      ownerName: ownerName || 'Admin User',
      ownerEmail: ownerEmail || 'admin@lightdom.io',
      status: 'draft',
      scriptInjected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: tasks.map((task, index) => ({
        id: task.id || `task-${Date.now()}-${index}`,
        taskId: task.id || `task-${Date.now()}-${index}`,
        label: task.label || task.name || `Task ${index + 1}`,
        name: task.label || task.name || `Task ${index + 1}`,
        description: task.description,
        status: task.status || 'pending',
        ...task
      })),
      attributes: attributes.map((attr, index) => ({
        id: attr.id || `attr-${Date.now()}-${index}`,
        label: attr.label || attr.name || `Attribute ${index + 1}`,
        name: attr.label || attr.name || `Attribute ${index + 1}`,
        ...attr
      })),
      seoScore: null,
      automationThreshold: 120,
      pendingAutomation: true,
    };

    workflows.push(workflow);

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-admin/workflows/:id
 * Get a specific workflow by ID
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow-admin/workflows/:id/execute
 * Execute a workflow (start datamining)
 */
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Create a new workflow run
    const run = {
      id: `run-${runIdCounter++}`,
      workflowId: workflow.id,
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: null,
      progress: 0,
      currentTask: null,
      results: null,
      error: null
    };

    workflowRuns.push(run);

    // Update workflow status
    workflow.status = 'in_progress';
    workflow.updatedAt = new Date().toISOString();

    // Simulate workflow execution
    executeWorkflowAsync(workflow, run);

    res.json({
      success: true,
      run,
      workflow
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-admin/workflows/:id/runs
 * Get all runs for a specific workflow
 */
router.get('/workflows/:id/runs', async (req, res) => {
  try {
    const runs = workflowRuns.filter(r => r.workflowId === req.params.id);
    
    res.json({
      success: true,
      runs,
      total: runs.length
    });
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow runs',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow-admin/runs/:runId
 * Get details of a specific run
 */
router.get('/runs/:runId', async (req, res) => {
  try {
    const run = workflowRuns.find(r => r.id === req.params.runId);
    
    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found'
      });
    }

    res.json({
      success: true,
      run
    });
  } catch (error) {
    console.error('Error fetching run:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch run',
      details: error.message
    });
  }
});

/**
 * Helper: Execute workflow asynchronously
 */
async function executeWorkflowAsync(workflow, run) {
  try {
    const tasks = workflow.tasks || [];
    const totalTasks = tasks.length;

    for (let i = 0; i < totalTasks; i++) {
      const task = tasks[i];
      
      // Update run progress
      run.currentTask = task.label || task.name;
      run.progress = Math.floor(((i + 1) / totalTasks) * 100);

      // Update task status
      task.status = 'in_progress';
      task.lastRunAt = new Date().toISOString();

      // Simulate task execution (1-3 seconds per task)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mark task as completed
      task.status = 'completed';
    }

    // Complete the run
    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    run.progress = 100;
    run.currentTask = null;
    run.results = {
      tasksCompleted: totalTasks,
      dataMined: Math.floor(Math.random() * 1000) + 500,
      seoScore: Math.floor(Math.random() * 40) + 60,
    };

    // Update workflow
    workflow.status = 'completed';
    workflow.seoScore = run.results.seoScore;
    workflow.pendingAutomation = false;
    workflow.updatedAt = new Date().toISOString();

  } catch (error) {
    console.error('Workflow execution error:', error);
    run.status = 'error';
    run.error = error.message;
    run.completedAt = new Date().toISOString();
    
    workflow.status = 'error';
    workflow.updatedAt = new Date().toISOString();
  }
}

/**
 * POST /api/workflow-admin/workflows/datamining
 * Create and optionally execute a datamining workflow
 */
router.post('/workflows/datamining', async (req, res) => {
  try {
    const {
      name = 'Data Mining Workflow',
      description = 'Automated data mining and SEO optimization workflow',
      ownerName,
      ownerEmail,
      executeImmediately = false,
    } = req.body;

    // Create default datamining workflow with tasks
    const defaultTasks = [
      {
        label: 'Initialize Data Sources',
        description: 'Connect to database and identify target tables',
        handler_type: 'data-source',
        status: 'pending'
      },
      {
        label: 'Mine DOM Data',
        description: 'Extract and analyze DOM structures from target pages',
        handler_type: 'crawler',
        status: 'pending'
      },
      {
        label: 'Schema Linking',
        description: 'Link extracted data to schema.org vocabularies',
        handler_type: 'schema-linking',
        status: 'pending'
      },
      {
        label: 'Generate Components',
        description: 'Create reusable components from mined data',
        handler_type: 'component-generation',
        status: 'pending'
      },
      {
        label: 'SEO Optimization',
        description: 'Apply SEO best practices and generate recommendations',
        handler_type: 'seo-optimization',
        status: 'pending'
      },
      {
        label: 'TensorFlow Training',
        description: 'Train ML model on extracted features',
        handler_type: 'ml-training',
        status: 'pending'
      }
    ];

    const defaultAttributes = [
      {
        label: 'Page Title',
        type: 'meta',
        enrichmentPrompt: 'Optimize title for search engines',
        drilldownPrompts: ['Keyword density', 'Character length', 'Brand inclusion']
      },
      {
        label: 'Meta Description',
        type: 'meta',
        enrichmentPrompt: 'Create compelling meta description',
        drilldownPrompts: ['Call to action', 'Keyword relevance', 'Length optimization']
      },
      {
        label: 'Heading Structure',
        type: 'content',
        enrichmentPrompt: 'Analyze heading hierarchy',
        drilldownPrompts: ['H1 uniqueness', 'H2-H6 structure', 'Keyword distribution']
      },
      {
        label: 'Image Optimization',
        type: 'media',
        enrichmentPrompt: 'Optimize images for performance and SEO',
        drilldownPrompts: ['Alt text quality', 'File size', 'Format recommendations']
      }
    ];

    const workflow = {
      id: `workflow-${workflowIdCounter++}`,
      name,
      description,
      type: 'datamining',
      ownerName: ownerName || 'Admin User',
      ownerEmail: ownerEmail || 'admin@lightdom.io',
      status: 'draft',
      scriptInjected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: defaultTasks.map((task, index) => ({
        ...task,
        id: `task-${Date.now()}-${index}`,
        taskId: `task-${Date.now()}-${index}`,
      })),
      attributes: defaultAttributes.map((attr, index) => ({
        ...attr,
        id: `attr-${Date.now()}-${index}`,
      })),
      seoScore: null,
      automationThreshold: 120,
      pendingAutomation: true,
    };

    workflows.push(workflow);

    let run = null;
    if (executeImmediately) {
      run = {
        id: `run-${runIdCounter++}`,
        workflowId: workflow.id,
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: null,
        progress: 0,
        currentTask: null,
        results: null,
        error: null
      };

      workflowRuns.push(run);
      workflow.status = 'in_progress';
      
      // Execute asynchronously
      executeWorkflowAsync(workflow, run);
    }

    res.json({
      success: true,
      workflow,
      run: run || null,
      message: executeImmediately 
        ? 'Datamining workflow created and execution started' 
        : 'Datamining workflow created successfully'
    });
  } catch (error) {
    console.error('Error creating datamining workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create datamining workflow',
      details: error.message
    });
  }
});

export default router;
