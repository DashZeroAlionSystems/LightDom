/**
 * SEO Workflow API Routes
 * 
 * Handles:
 * - Interactive session management
 * - Chat-based workflow creation
 * - Workflow execution and monitoring
 * - SEO attribute configuration
 * - Real-time status updates via WebSocket
 */

import { Router } from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import EnhancedDeepSeekN8NService from '../services/enhanced-deepseek-n8n-service.js';

export function createSEOWorkflowRoutes(dbPool, io) {
  const router = Router();
  const deepseekService = new EnhancedDeepSeekN8NService();

  // WebSocket namespace for workflow status
  const workflowNamespace = io.of('/ws/workflow-status');
  
  workflowNamespace.on('connection', (socket) => {
    console.log('Client connected to workflow status namespace');
    
    socket.on('subscribe_session', (sessionId) => {
      socket.join(`session:${sessionId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from workflow status namespace');
    });
  });

  /**
   * GET /api/seo-workflow/sessions
   * Get all workflow sessions for a user
   */
  router.get('/sessions', async (req, res) => {
    try {
      const { userId = 'default' } = req.query;

      const result = await dbPool.query(
        `SELECT * FROM user_sessions 
         WHERE user_id = $1 OR user_id IS NULL
         ORDER BY last_activity_at DESC
         LIMIT 20`,
        [userId]
      );

      res.json({
        success: true,
        sessions: result.rows.map(row => ({
          id: row.session_id,
          name: row.metadata?.name || `Session ${row.session_id.slice(0, 8)}`,
          status: row.status,
          currentStep: row.current_step,
          totalSteps: row.total_steps,
          workflows: row.workflow_ids || [],
          createdAt: row.started_at,
          lastActivity: row.last_activity_at,
          metadata: row.metadata
        }))
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/seo-workflow/sessions
   * Create a new workflow session
   */
  router.post('/sessions', async (req, res) => {
    try {
      const { name, type = 'workflow_creation', userId = 'default' } = req.body;
      const sessionId = uuidv4();

      await dbPool.query(
        `INSERT INTO user_sessions (
          session_id, user_id, session_type, 
          current_step, total_steps, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionId,
          userId,
          type,
          0,
          0,
          'active',
          JSON.stringify({ name })
        ]
      );

      res.json({
        success: true,
        session: {
          id: sessionId,
          name,
          status: 'active',
          currentStep: 0,
          totalSteps: 0,
          workflows: [],
          createdAt: new Date(),
          lastActivity: new Date(),
          metadata: { name }
        }
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/seo-workflow/attributes
   * Get all SEO attributes configuration
   */
  router.get('/attributes', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT * FROM seo_attributes_config 
         ORDER BY category, priority DESC, attribute_name`
      );

      res.json({
        success: true,
        attributes: result.rows.map(row => ({
          name: row.attribute_name,
          category: row.category,
          description: row.description,
          dataType: row.data_type,
          enabled: row.is_active,
          priority: row.priority,
          algorithm: row.extraction_algorithm,
          componentSchema: row.component_schema
        })),
        total: result.rows.length,
        byCategory: result.rows.reduce((acc, row) => {
          acc[row.category] = (acc[row.category] || 0) + 1;
          return acc;
        }, {})
      });
    } catch (error) {
      console.error('Error fetching attributes:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/seo-workflow/chat
   * Process chat message and generate workflow
   */
  router.post('/chat', async (req, res) => {
    try {
      const { sessionId, message, conversationHistory = [] } = req.body;

      // Get session context
      const sessionResult = await dbPool.query(
        'SELECT * FROM user_sessions WHERE session_id = $1',
        [sessionId]
      );

      if (sessionResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }

      const session = sessionResult.rows[0];
      const sessionContext = {
        sessionId,
        campaignId: session.campaign_id,
        conversationHistory: session.conversation_history || [],
        generatedSchemas: session.generated_schemas || {},
        workflowIds: session.workflow_ids || []
      };

      // Build message history for DeepSeek
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Call DeepSeek for interactive workflow generation
      const response = await deepseekService.interactiveWorkflowGeneration(
        messages,
        sessionContext
      );

      // Update session conversation history
      const updatedHistory = [
        ...sessionContext.conversationHistory,
        { role: 'user', content: message, timestamp: new Date() },
        { 
          role: 'assistant', 
          content: response.message,
          toolCalls: response.toolCalls,
          timestamp: new Date()
        }
      ];

      await dbPool.query(
        `UPDATE user_sessions 
         SET conversation_history = $1, last_activity_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`,
        [JSON.stringify(updatedHistory), sessionId]
      );

      // If workflow was created, save it
      if (response.executedTools?.workflow) {
        const workflow = response.executedTools.workflow;
        
        const workflowResult = await dbPool.query(
          `INSERT INTO seo_campaign_workflows (
            campaign_id, name, description, status, workflow_type,
            n8n_workflow_id, n8n_workflow_url, generated_config, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id`,
          [
            session.campaign_id || sessionId,
            workflow.name,
            workflow.description || '',
            'created',
            'comprehensive_seo',
            workflow.id,
            workflow.url || null,
            JSON.stringify(workflow),
            JSON.stringify({ sessionId, createdBy: 'deepseek' })
          ]
        );

        const workflowDbId = workflowResult.rows[0].id;

        // Create tasks for each SEO attribute
        if (response.executedTools.algorithms) {
          for (const algo of response.executedTools.algorithms) {
            await dbPool.query(
              `INSERT INTO workflow_tasks (
                workflow_id, task_name, task_type, status, metadata
              ) VALUES ($1, $2, $3, $4, $5)`,
              [
                workflowDbId,
                `Extract ${algo.attributeName}`,
                'attribute_mining',
                'pending',
                JSON.stringify({ 
                  attributeName: algo.attributeName,
                  algorithm: algo.algorithm
                })
              ]
            );
          }
        }

        // Update session with workflow ID
        await dbPool.query(
          `UPDATE user_sessions 
           SET workflow_ids = array_append(workflow_ids, $1),
               total_steps = total_steps + 1,
               current_step = current_step + 1
           WHERE session_id = $2`,
          [workflowDbId, sessionId]
        );

        // Emit workflow created event
        workflowNamespace.to(`session:${sessionId}`).emit('workflow_created', {
          workflowId: workflowDbId,
          workflow: response.executedTools.workflow
        });
      }

      res.json({
        success: true,
        message: response.message,
        toolCalls: response.toolCalls,
        executedTools: response.executedTools,
        needsMoreInfo: response.needsMoreInfo
      });
    } catch (error) {
      console.error('Error processing chat:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/seo-workflow/execute/:workflowId
   * Execute a workflow
   */
  router.post('/execute/:workflowId', async (req, res) => {
    try {
      const { workflowId } = req.params;
      const { sessionId, inputData = {} } = req.body;

      // Get workflow details
      const workflowResult = await dbPool.query(
        'SELECT * FROM seo_campaign_workflows WHERE id = $1',
        [workflowId]
      );

      if (workflowResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const workflow = workflowResult.rows[0];

      // Create execution record
      const executionResult = await dbPool.query(
        `INSERT INTO workflow_executions (
          workflow_id, execution_status, trigger_type, input_data
        ) VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [workflowId, 'running', 'manual', JSON.stringify(inputData)]
      );

      const executionId = executionResult.rows[0].id;

      // Execute workflow via N8N
      const n8nWorkflowId = workflow.n8n_workflow_id;
      if (n8nWorkflowId) {
        try {
          await deepseekService.executeN8NWorkflow(n8nWorkflowId, inputData);
        } catch (n8nError) {
          console.error('N8N execution error:', n8nError);
        }
      }

      // Get all tasks for this workflow
      const tasksResult = await dbPool.query(
        'SELECT * FROM workflow_tasks WHERE workflow_id = $1 ORDER BY id',
        [workflowId]
      );

      // Start executing tasks
      executeWorkflowTasks(
        workflowId,
        executionId,
        tasksResult.rows,
        sessionId,
        workflowNamespace,
        dbPool
      ).catch(err => {
        console.error('Task execution error:', err);
      });

      res.json({
        success: true,
        executionId,
        workflowId,
        status: 'running',
        tasksCount: tasksResult.rows.length
      });
    } catch (error) {
      console.error('Error executing workflow:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/seo-workflow/status/:workflowId
   * Get workflow execution status
   */
  router.get('/status/:workflowId', async (req, res) => {
    try {
      const { workflowId } = req.params;

      // Get latest execution
      const executionResult = await dbPool.query(
        `SELECT * FROM workflow_executions 
         WHERE workflow_id = $1 
         ORDER BY started_at DESC 
         LIMIT 1`,
        [workflowId]
      );

      // Get all tasks with their status
      const tasksResult = await dbPool.query(
        `SELECT * FROM workflow_tasks 
         WHERE workflow_id = $1 
         ORDER BY id`,
        [workflowId]
      );

      const execution = executionResult.rows[0];
      const tasks = tasksResult.rows;

      res.json({
        success: true,
        workflow: {
          id: workflowId,
          status: execution?.execution_status || 'not_started'
        },
        execution: execution ? {
          id: execution.id,
          status: execution.execution_status,
          startedAt: execution.started_at,
          completedAt: execution.completed_at,
          duration: execution.duration_ms
        } : null,
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.task_name,
          type: task.task_type,
          status: task.status,
          progress: parseFloat(task.progress),
          result: task.result,
          error: task.error_message
        })),
        progress: {
          completed: tasks.filter(t => t.status === 'completed').length,
          total: tasks.length,
          percentage: tasks.length > 0 
            ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
            : 0
        }
      });
    } catch (error) {
      console.error('Error getting workflow status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * PUT /api/seo-workflow/attributes/:attributeName
   * Update SEO attribute configuration
   */
  router.put('/attributes/:attributeName', async (req, res) => {
    try {
      const { attributeName } = req.params;
      const { enabled, priority, algorithm, componentSchema } = req.body;

      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (enabled !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(enabled);
      }
      if (priority !== undefined) {
        updates.push(`priority = $${paramIndex++}`);
        values.push(priority);
      }
      if (algorithm !== undefined) {
        updates.push(`extraction_algorithm = $${paramIndex++}`);
        values.push(algorithm);
      }
      if (componentSchema !== undefined) {
        updates.push(`component_schema = $${paramIndex++}`);
        values.push(JSON.stringify(componentSchema));
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, error: 'No updates provided' });
      }

      values.push(attributeName);
      
      await dbPool.query(
        `UPDATE seo_attributes_config 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE attribute_name = $${paramIndex}`,
        values
      );

      res.json({ success: true, message: 'Attribute updated' });
    } catch (error) {
      console.error('Error updating attribute:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

/**
 * Execute workflow tasks asynchronously
 */
async function executeWorkflowTasks(
  workflowId,
  executionId,
  tasks,
  sessionId,
  workflowNamespace,
  dbPool
) {
  const startTime = Date.now();

  try {
    for (const task of tasks) {
      // Update task status to running
      await dbPool.query(
        `UPDATE workflow_tasks 
         SET status = $1, started_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        ['running', task.id]
      );

      // Emit progress update
      workflowNamespace.to(`session:${sessionId}`).emit('task_progress', {
        taskId: task.id,
        status: 'running',
        progress: 0
      });

      try {
        // Simulate task execution (replace with actual execution logic)
        const result = await executeTask(task);

        // Update task as completed
        await dbPool.query(
          `UPDATE workflow_tasks 
           SET status = $1, progress = $2, result = $3, completed_at = CURRENT_TIMESTAMP 
           WHERE id = $4`,
          ['completed', 100, JSON.stringify(result), task.id]
        );

        // Emit completion
        workflowNamespace.to(`session:${sessionId}`).emit('task_progress', {
          taskId: task.id,
          status: 'completed',
          progress: 100,
          result
        });
      } catch (taskError) {
        // Update task as failed
        await dbPool.query(
          `UPDATE workflow_tasks 
           SET status = $1, error_message = $2, completed_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          ['failed', taskError.message, task.id]
        );

        // Emit failure
        workflowNamespace.to(`session:${sessionId}`).emit('task_progress', {
          taskId: task.id,
          status: 'failed',
          error: taskError.message
        });
      }
    }

    // Update execution as completed
    const duration = Date.now() - startTime;
    await dbPool.query(
      `UPDATE workflow_executions 
       SET execution_status = $1, duration_ms = $2, completed_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      ['completed', duration, executionId]
    );

    // Emit workflow completion
    workflowNamespace.to(`session:${sessionId}`).emit('workflow_completed', {
      workflowId,
      executionId,
      duration
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    
    await dbPool.query(
      `UPDATE workflow_executions 
       SET execution_status = $1, error_details = $2, completed_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      ['failed', error.message, executionId]
    );

    workflowNamespace.to(`session:${sessionId}`).emit('workflow_failed', {
      workflowId,
      executionId,
      error: error.message
    });
  }
}

/**
 * Execute a single task (placeholder - implement actual logic)
 */
async function executeTask(task) {
  // Simulate task execution
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  return {
    taskId: task.id,
    attributeName: task.metadata?.attributeName,
    value: `Extracted value for ${task.metadata?.attributeName}`,
    timestamp: new Date()
  };
}

export default createSEOWorkflowRoutes;
