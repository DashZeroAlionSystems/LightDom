/**
 * Automation Orchestration API
 * Provides endpoints to orchestrate and manage automation workflows through the API
 */

import { Request, Response } from 'express';
import { AutomationOrchestrator } from '../services/AutomationOrchestrator';
import { AgentEvaluator } from '../services/AgentEvaluator';

export class AutomationOrchestrationAPI {
  private orchestrator: AutomationOrchestrator;
  private evaluator: AgentEvaluator;

  constructor() {
    this.orchestrator = new AutomationOrchestrator();
    this.evaluator = new AgentEvaluator();
  }

  /**
   * Initialize the orchestration system
   */
  async initialize(): Promise<void> {
    await this.orchestrator.initialize();
    await this.evaluator.initialize();
  }

  /**
   * Start an automation workflow
   * POST /api/automation/workflow/start
   */
  async startWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId, config } = req.body;

      if (!workflowId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'workflowId is required'
        });
        return;
      }

      const jobId = await this.orchestrator.startWorkflow(workflowId, config);

      res.json({
        success: true,
        data: {
          jobId,
          workflowId,
          status: 'started'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Stop a running automation workflow
   * POST /api/automation/workflow/stop
   */
  async stopWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.body;

      if (!jobId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'jobId is required'
        });
        return;
      }

      await this.orchestrator.stopWorkflow(jobId);

      res.json({
        success: true,
        data: {
          jobId,
          status: 'stopped'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get status of a workflow job
   * GET /api/automation/workflow/:jobId
   */
  async getWorkflowStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      const status = await this.orchestrator.getWorkflowStatus(jobId);

      if (!status) {
        res.status(404).json({
          error: 'Not Found',
          message: `Workflow job ${jobId} not found`
        });
        return;
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List all available workflows
   * GET /api/automation/workflows
   */
  async listWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const workflows = await this.orchestrator.listWorkflows();

      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all running jobs
   * GET /api/automation/jobs
   */
  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await this.orchestrator.listJobs();

      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Trigger autopilot mode
   * POST /api/automation/autopilot/start
   */
  async startAutopilot(req: Request, res: Response): Promise<void> {
    try {
      const { maxRounds, config } = req.body;

      const jobId = await this.orchestrator.startAutopilot({
        maxRounds: maxRounds || 5,
        ...config
      });

      res.json({
        success: true,
        data: {
          jobId,
          mode: 'autopilot',
          status: 'started',
          maxRounds: maxRounds || 5
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Evaluate tasks and create automation plan
   * POST /api/automation/evaluate
   */
  async evaluateTasks(req: Request, res: Response): Promise<void> {
    try {
      const { tasks, context } = req.body;

      if (!tasks || !Array.isArray(tasks)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'tasks array is required'
        });
        return;
      }

      const evaluation = await this.evaluator.evaluateTasks(tasks, context);

      res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute evaluated tasks with agents
   * POST /api/automation/execute
   */
  async executeTasks(req: Request, res: Response): Promise<void> {
    try {
      const { evaluationId, agentConfig } = req.body;

      if (!evaluationId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'evaluationId is required'
        });
        return;
      }

      const jobId = await this.orchestrator.executeEvaluatedTasks(
        evaluationId,
        agentConfig
      );

      res.json({
        success: true,
        data: {
          jobId,
          evaluationId,
          status: 'executing'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get orchestration metrics
   * GET /api/automation/metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.orchestrator.getMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get agent evaluation history
   * GET /api/automation/evaluations
   */
  async getEvaluations(req: Request, res: Response): Promise<void> {
    try {
      const { limit, offset } = req.query;

      const evaluations = await this.evaluator.getEvaluationHistory({
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      });

      res.json({
        success: true,
        data: evaluations
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Schedule a workflow
   * POST /api/automation/schedule
   */
  async scheduleWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId, schedule, config } = req.body;

      if (!workflowId || !schedule) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'workflowId and schedule are required'
        });
        return;
      }

      const scheduleId = await this.orchestrator.scheduleWorkflow(
        workflowId,
        schedule,
        config
      );

      res.json({
        success: true,
        data: {
          scheduleId,
          workflowId,
          schedule,
          status: 'scheduled'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get health status of automation system
   * GET /api/automation/health
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.orchestrator.getHealthStatus();

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Create and export singleton instance
export const automationOrchestrationAPI = new AutomationOrchestrationAPI();
