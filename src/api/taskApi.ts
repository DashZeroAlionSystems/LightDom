import express from 'express';
import { TaskManager, Task } from '../services/TaskManager';
import { HeadlessChromeService } from '../services/HeadlessChromeService';
import { Logger } from '../utils/Logger';

export class TaskAPI {
  private app: express.Application;
  private taskManager: TaskManager;
  private headlessChromeService: HeadlessChromeService;
  private logger: Logger;

  constructor(
    app: express.Application,
    taskManager: TaskManager,
    headlessChromeService: HeadlessChromeService
  ) {
    this.app = app;
    this.taskManager = taskManager;
    this.headlessChromeService = headlessChromeService;
    this.logger = new Logger('TaskAPI');

    this.setupRoutes();
    this.setupWebSocketHandlers();
  }

  private setupRoutes(): void {
    // =====================================================
    // TASK MANAGEMENT ENDPOINTS
    // =====================================================

    // Create a JavaScript execution task
    this.app.post('/api/tasks/javascript', async (req, res) => {
      try {
        const { script, args, pageId, url, timeout, priority } = req.body;

        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        const taskId = this.taskManager.createJavaScriptTask(script, {
          args,
          pageId,
          url,
          timeout,
          priority,
        });

        const task = this.taskManager.getTask(taskId);
        res.status(201).json({
          success: true,
          taskId,
          task,
        });
      } catch (error) {
        this.logger.error('Failed to create JavaScript task:', error);
        res.status(500).json({
          error: 'Failed to create JavaScript task',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Create an n8n workflow task
    this.app.post('/api/tasks/n8n-workflow', async (req, res) => {
      try {
        const { workflowId, inputData, webhookUrl, timeout, priority } = req.body;

        if (!workflowId) {
          return res.status(400).json({ error: 'Workflow ID is required' });
        }

        const taskId = this.taskManager.createN8nWorkflowTask(workflowId, {
          inputData,
          webhookUrl,
          timeout,
          priority,
        });

        const task = this.taskManager.getTask(taskId);
        res.status(201).json({
          success: true,
          taskId,
          task,
        });
      } catch (error) {
        this.logger.error('Failed to create n8n workflow task:', error);
        res.status(500).json({
          error: 'Failed to create n8n workflow task',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Create a DOM analysis task
    this.app.post('/api/tasks/dom-analysis', async (req, res) => {
      try {
        const { url, pageId, analysisType, priority } = req.body;

        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        const taskId = this.taskManager.createDOMAnalysisTask(url, {
          pageId,
          analysisType,
          priority,
        });

        const task = this.taskManager.getTask(taskId);
        res.status(201).json({
          success: true,
          taskId,
          task,
        });
      } catch (error) {
        this.logger.error('Failed to create DOM analysis task:', error);
        res.status(500).json({
          error: 'Failed to create DOM analysis task',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Get task by ID
    this.app.get('/api/tasks/:taskId', async (req, res) => {
      try {
        const { taskId } = req.params;
        const task = this.taskManager.getTask(taskId);

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        res.json({
          success: true,
          task,
        });
      } catch (error) {
        this.logger.error('Failed to get task:', error);
        res.status(500).json({
          error: 'Failed to get task',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Get all tasks with optional filtering
    this.app.get('/api/tasks', async (req, res) => {
      try {
        const { status, type, limit } = req.query;

        const filter: any = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (limit) filter.limit = parseInt(limit as string);

        const tasks = this.taskManager.getTasks(filter);

        res.json({
          success: true,
          tasks,
          total: tasks.length,
        });
      } catch (error) {
        this.logger.error('Failed to get tasks:', error);
        res.status(500).json({
          error: 'Failed to get tasks',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Cancel a task
    this.app.post('/api/tasks/:taskId/cancel', async (req, res) => {
      try {
        const { taskId } = req.params;
        const success = await this.taskManager.cancelTask(taskId);

        if (!success) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const task = this.taskManager.getTask(taskId);
        res.json({
          success: true,
          message: 'Task cancelled successfully',
          task,
        });
      } catch (error) {
        this.logger.error('Failed to cancel task:', error);
        res.status(500).json({
          error: 'Failed to cancel task',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Get task statistics
    this.app.get('/api/tasks/stats', async (req, res) => {
      try {
        const stats = this.taskManager.getStats();
        res.json({
          success: true,
          stats,
        });
      } catch (error) {
        this.logger.error('Failed to get task stats:', error);
        res.status(500).json({
          error: 'Failed to get task statistics',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // =====================================================
    // JAVASCRIPT EXECUTION ENDPOINTS
    // =====================================================

    // Execute JavaScript immediately (synchronous)
    this.app.post('/api/execute/javascript', async (req, res) => {
      try {
        const { script, args, pageId, url, timeout } = req.body;

        if (!script) {
          return res.status(400).json({ error: 'Script is required' });
        }

        let targetPageId = pageId;

        // Create a new page if URL is provided but no pageId
        if (url && !pageId) {
          targetPageId = `exec_${Date.now()}`;
          await this.headlessChromeService.createPage(targetPageId);
          await this.headlessChromeService.navigateToPage(targetPageId, url);
        }

        if (!targetPageId) {
          return res.status(400).json({ error: 'Either pageId or url must be provided' });
        }

        try {
          // Execute the script with timeout
          const result = await Promise.race([
            this.headlessChromeService.executeScript(targetPageId, script, ...(args || [])),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Script execution timeout')), timeout || 30000)
            ),
          ]);

          // Clean up page if we created it
          if (url && !pageId) {
            await this.headlessChromeService.closePage(targetPageId);
          }

          res.json({
            success: true,
            result,
            executionTime: Date.now(),
          });
        } catch (executionError) {
          // Clean up page if we created it
          if (url && !pageId && targetPageId) {
            try {
              await this.headlessChromeService.closePage(targetPageId);
            } catch (cleanupError) {
              this.logger.error(`Failed to cleanup page ${targetPageId}:`, cleanupError);
            }
          }
          throw executionError;
        }
      } catch (error) {
        this.logger.error('Failed to execute JavaScript:', error);
        res.status(500).json({
          error: 'Failed to execute JavaScript',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Execute multiple JavaScript functions in batch
    this.app.post('/api/execute/javascript/batch', async (req, res) => {
      try {
        const { scripts, pageId, url, timeout } = req.body;

        if (!Array.isArray(scripts) || scripts.length === 0) {
          return res.status(400).json({ error: 'Scripts array is required' });
        }

        let targetPageId = pageId;

        // Create a new page if URL is provided but no pageId
        if (url && !pageId) {
          targetPageId = `batch_${Date.now()}`;
          await this.headlessChromeService.createPage(targetPageId);
          await this.headlessChromeService.navigateToPage(targetPageId, url);
        }

        if (!targetPageId) {
          return res.status(400).json({ error: 'Either pageId or url must be provided' });
        }

        try {
          const results = [];

          for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];

            try {
              const result = await Promise.race([
                this.headlessChromeService.executeScript(
                  targetPageId,
                  script.script,
                  ...(script.args || [])
                ),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error('Script execution timeout')),
                    script.timeout || timeout || 30000
                  )
                ),
              ]);

              results.push({
                index: i,
                success: true,
                result,
                executionTime: Date.now(),
              });
            } catch (scriptError) {
              results.push({
                index: i,
                success: false,
                error: scriptError instanceof Error ? scriptError.message : String(scriptError),
                executionTime: Date.now(),
              });
            }
          }

          // Clean up page if we created it
          if (url && !pageId) {
            await this.headlessChromeService.closePage(targetPageId);
          }

          res.json({
            success: true,
            results,
            totalExecuted: scripts.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
          });
        } catch (error) {
          // Clean up page if we created it
          if (url && !pageId && targetPageId) {
            try {
              await this.headlessChromeService.closePage(targetPageId);
            } catch (cleanupError) {
              this.logger.error(`Failed to cleanup page ${targetPageId}:`, cleanupError);
            }
          }
          throw error;
        }
      } catch (error) {
        this.logger.error('Failed to execute JavaScript batch:', error);
        res.status(500).json({
          error: 'Failed to execute JavaScript batch',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // =====================================================
    // HEADLESS CHROME MANAGEMENT ENDPOINTS
    // =====================================================

    // Create a new page
    this.app.post('/api/pages', async (req, res) => {
      try {
        const { pageId, options } = req.body;
        const id = pageId || `page_${Date.now()}`;

        await this.headlessChromeService.createPage(id, options);

        res.status(201).json({
          success: true,
          pageId: id,
          message: 'Page created successfully',
        });
      } catch (error) {
        this.logger.error('Failed to create page:', error);
        res.status(500).json({
          error: 'Failed to create page',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Navigate to URL
    this.app.post('/api/pages/:pageId/navigate', async (req, res) => {
      try {
        const { pageId } = req.params;
        const { url, options } = req.body;

        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        await this.headlessChromeService.navigateToPage(pageId, url, options);

        res.json({
          success: true,
          message: 'Navigation completed successfully',
        });
      } catch (error) {
        this.logger.error('Failed to navigate:', error);
        res.status(500).json({
          error: 'Failed to navigate',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Get page status
    this.app.get('/api/pages/:pageId/status', async (req, res) => {
      try {
        const { pageId } = req.params;
        const status = this.headlessChromeService.getStatus();

        res.json({
          success: true,
          pageId,
          status: {
            pageExists: status.activePages > 0, // Simplified check
            ...status,
          },
        });
      } catch (error) {
        this.logger.error('Failed to get page status:', error);
        res.status(500).json({
          error: 'Failed to get page status',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Close a page
    this.app.delete('/api/pages/:pageId', async (req, res) => {
      try {
        const { pageId } = req.params;

        await this.headlessChromeService.closePage(pageId);

        res.json({
          success: true,
          message: 'Page closed successfully',
        });
      } catch (error) {
        this.logger.error('Failed to close page:', error);
        res.status(500).json({
          error: 'Failed to close page',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // =====================================================
    // N8N INTEGRATION ENDPOINTS
    // =====================================================

    // Trigger n8n webhook
    this.app.post('/api/n8n/webhook/:webhookId', async (req, res) => {
      try {
        const { webhookId } = req.params;

        // In a real implementation, this would make an HTTP request to n8n
        // For now, we'll simulate the webhook call
        this.logger.info(`N8n webhook triggered: ${webhookId}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({
          success: true,
          webhookId,
          message: 'Webhook triggered successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        this.logger.error('Failed to trigger n8n webhook:', error);
        res.status(500).json({
          error: 'Failed to trigger webhook',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Get n8n workflow status
    this.app.get('/api/n8n/workflows/:workflowId/status', async (req, res) => {
      try {
        const { workflowId } = req.params;

        // In a real implementation, this would query n8n's API
        // For now, we'll return mock data
        res.json({
          success: true,
          workflowId,
          status: 'active',
          lastRun: new Date().toISOString(),
          executions: {
            total: 100,
            successful: 95,
            failed: 5,
          },
        });
      } catch (error) {
        this.logger.error('Failed to get n8n workflow status:', error);
        res.status(500).json({
          error: 'Failed to get workflow status',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // =====================================================
    // CURSOR API INTEGRATION ENDPOINTS
    // =====================================================

    // Execute Cursor API function
    this.app.post('/api/cursor/execute', async (req, res) => {
      try {
        const { functionName, parameters, pageId, url, timeout } = req.body;

        if (!functionName) {
          return res.status(400).json({ error: 'Function name is required' });
        }

        // Map Cursor API functions to JavaScript execution
        const cursorFunctions = {
          analyzeDOM: `
            const analysis = {
              totalElements: document.querySelectorAll('*').length,
              images: document.querySelectorAll('img').length,
              scripts: document.querySelectorAll('script').length,
              links: document.querySelectorAll('a').length,
              forms: document.querySelectorAll('form').length,
              performance: {
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
              }
            };
            return analysis;
          `,
          extractText: `
            return document.body.innerText;
          `,
          getTitle: `
            return document.title;
          `,
          getMetaTags: `
            const metas = {};
            document.querySelectorAll('meta').forEach(meta => {
              const name = meta.name || meta.property;
              if (name) {
                metas[name] = meta.content;
              }
            });
            return metas;
          `,
          screenshot: `
            // This would trigger a screenshot via the API
            return { message: 'Screenshot requested' };
          `,
        };

        const script = cursorFunctions[functionName as keyof typeof cursorFunctions];
        if (!script) {
          return res.status(400).json({ error: 'Unknown Cursor API function' });
        }

        // Execute the mapped function
        let targetPageId = pageId;

        if (url && !pageId) {
          targetPageId = `cursor_${Date.now()}`;
          await this.headlessChromeService.createPage(targetPageId);
          await this.headlessChromeService.navigateToPage(targetPageId, url);
        }

        if (!targetPageId) {
          return res.status(400).json({ error: 'Either pageId or url must be provided' });
        }

        try {
          const result = await Promise.race([
            this.headlessChromeService.executeScript(targetPageId, script, ...(parameters || [])),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Function execution timeout')), timeout || 30000)
            ),
          ]);

          // Clean up page if we created it
          if (url && !pageId) {
            await this.headlessChromeService.closePage(targetPageId);
          }

          res.json({
            success: true,
            functionName,
            result,
            executionTime: Date.now(),
          });
        } catch (executionError) {
          // Clean up page if we created it
          if (url && !pageId && targetPageId) {
            try {
              await this.headlessChromeService.closePage(targetPageId);
            } catch (cleanupError) {
              this.logger.error(`Failed to cleanup page ${targetPageId}:`, cleanupError);
            }
          }
          throw executionError;
        }
      } catch (error) {
        this.logger.error('Failed to execute Cursor API function:', error);
        res.status(500).json({
          error: 'Failed to execute Cursor API function',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  private setupWebSocketHandlers(): void {
    // This would be called from the main API server to set up WebSocket handlers
    // for real-time task updates
  }

  /**
   * Get WebSocket event handlers for task updates
   */
  getWebSocketHandlers(): any {
    return {
      taskCreated: () => {
        // Emit to all connected clients
      },
      taskStarted: () => {
        // Emit to all connected clients
      },
      taskCompleted: () => {
        // Emit to all connected clients
      },
      taskFailed: () => {
        // Emit to all connected clients
      },
      taskCancelled: () => {
        // Emit to all connected clients
      },
    };
  }
}

export default TaskAPI;
