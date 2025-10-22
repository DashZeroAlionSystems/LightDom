/**
 * Agent Evaluator Service
 * Evaluates tasks, prioritizes them, and determines the best approach for agent automation
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id?: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  estimatedEffort?: number;
  dependencies?: string[];
  tags?: string[];
}

export interface EvaluatedTask extends Task {
  id: string;
  evaluatedPriority: number;
  automatable: boolean;
  recommendedAgent?: string;
  estimatedCompletionTime?: number;
  riskLevel: 'low' | 'medium' | 'high';
  complexity: number;
  confidence: number;
}

export interface TaskEvaluation {
  evaluationId: string;
  timestamp: Date;
  tasks: EvaluatedTask[];
  summary: {
    totalTasks: number;
    automatableTasks: number;
    highPriorityTasks: number;
    estimatedTotalTime: number;
    riskDistribution: Record<string, number>;
  };
  recommendations: string[];
  executionPlan: ExecutionPlan;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalEstimatedTime: number;
  parallelizable: boolean;
}

export interface ExecutionPhase {
  phaseId: string;
  name: string;
  tasks: string[];
  estimatedTime: number;
  dependencies: string[];
  agentType?: string;
}

export interface EvaluationContext {
  currentSystemState?: any;
  availableResources?: string[];
  constraints?: Record<string, any>;
  goals?: string[];
}

export class AgentEvaluator extends EventEmitter {
  private evaluations: Map<string, TaskEvaluation> = new Map();
  private evaluationDir: string = './automation-evaluations';
  private initialized: boolean = false;

  // Agent capabilities mapping
  private agentCapabilities = {
    'cursor-agent': {
      capabilities: ['code-generation', 'refactoring', 'bug-fixing', 'documentation'],
      strength: 0.9,
      parallel: false
    },
    'automation-agent': {
      capabilities: ['workflow-execution', 'testing', 'deployment', 'monitoring'],
      strength: 0.85,
      parallel: true
    },
    'compliance-agent': {
      capabilities: ['testing', 'validation', 'quality-checks', 'security-scanning'],
      strength: 0.8,
      parallel: true
    },
    'git-agent': {
      capabilities: ['version-control', 'merge-conflicts', 'branching', 'commits'],
      strength: 0.75,
      parallel: false
    }
  };

  constructor() {
    super();
  }

  /**
   * Initialize the evaluator
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create evaluation directory
    await fs.mkdir(this.evaluationDir, { recursive: true });

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Evaluate a list of tasks
   */
  async evaluateTasks(
    tasks: Task[],
    context?: EvaluationContext
  ): Promise<TaskEvaluation> {
    const evaluationId = uuidv4();
    const timestamp = new Date();

    // Evaluate each task
    const evaluatedTasks = await Promise.all(
      tasks.map(task => this.evaluateTask(task, context))
    );

    // Sort by priority
    evaluatedTasks.sort((a, b) => b.evaluatedPriority - a.evaluatedPriority);

    // Create execution plan
    const executionPlan = this.createExecutionPlan(evaluatedTasks);

    // Calculate summary
    const summary = this.calculateSummary(evaluatedTasks);

    // Generate recommendations
    const recommendations = this.generateRecommendations(evaluatedTasks, context);

    const evaluation: TaskEvaluation = {
      evaluationId,
      timestamp,
      tasks: evaluatedTasks,
      summary,
      recommendations,
      executionPlan
    };

    // Store evaluation
    this.evaluations.set(evaluationId, evaluation);

    // Save to file
    await this.saveEvaluation(evaluation);

    this.emit('evaluation:created', evaluation);

    return evaluation;
  }

  /**
   * Evaluate a single task
   */
  private async evaluateTask(
    task: Task,
    context?: EvaluationContext
  ): Promise<EvaluatedTask> {
    const taskId = task.id || uuidv4();

    // Determine if task is automatable
    const automatable = this.isTaskAutomatable(task);

    // Calculate priority score
    const evaluatedPriority = this.calculatePriority(task);

    // Determine recommended agent
    const recommendedAgent = automatable
      ? this.determineAgent(task)
      : undefined;

    // Estimate completion time (in minutes)
    const estimatedCompletionTime = this.estimateCompletionTime(task);

    // Assess risk level
    const riskLevel = this.assessRiskLevel(task);

    // Calculate complexity (0-1 scale)
    const complexity = this.calculateComplexity(task);

    // Calculate confidence in evaluation (0-1 scale)
    const confidence = this.calculateConfidence(task, context);

    return {
      ...task,
      id: taskId,
      evaluatedPriority,
      automatable,
      recommendedAgent,
      estimatedCompletionTime,
      riskLevel,
      complexity,
      confidence
    };
  }

  /**
   * Determine if a task can be automated
   */
  private isTaskAutomatable(task: Task): boolean {
    const automatableKeywords = [
      'test', 'build', 'deploy', 'fix', 'update', 'refactor',
      'generate', 'validate', 'check', 'scan', 'format', 'lint'
    ];

    const taskText = `${task.title} ${task.description}`.toLowerCase();

    return automatableKeywords.some(keyword => taskText.includes(keyword));
  }

  /**
   * Calculate task priority score (0-100)
   */
  private calculatePriority(task: Task): number {
    let score = 50; // Base score

    // Adjust by priority level
    const priorityScores = {
      critical: 100,
      high: 80,
      medium: 50,
      low: 20
    };
    if (task.priority) {
      score = priorityScores[task.priority];
    }

    // Adjust by effort (lower effort = slightly higher priority)
    if (task.estimatedEffort) {
      score -= Math.min(task.estimatedEffort, 20);
    }

    // Adjust by dependencies (fewer dependencies = higher priority)
    if (task.dependencies) {
      score -= task.dependencies.length * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine the best agent for a task
   */
  private determineAgent(task: Task): string {
    const taskText = `${task.title} ${task.description}`.toLowerCase();

    let bestAgent = 'automation-agent';
    let bestScore = 0;

    for (const [agentType, agentInfo] of Object.entries(this.agentCapabilities)) {
      let score = 0;

      for (const capability of agentInfo.capabilities) {
        if (taskText.includes(capability.replace('-', ' '))) {
          score += agentInfo.strength;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentType;
      }
    }

    return bestAgent;
  }

  /**
   * Estimate task completion time in minutes
   */
  private estimateCompletionTime(task: Task): number {
    const baseTime = 15; // 15 minutes base
    let multiplier = 1;

    // Adjust by priority
    if (task.priority === 'critical') multiplier *= 0.8;
    if (task.priority === 'low') multiplier *= 1.5;

    // Adjust by estimated effort
    if (task.estimatedEffort) {
      multiplier *= task.estimatedEffort;
    }

    // Adjust by dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      multiplier *= 1 + (task.dependencies.length * 0.2);
    }

    return Math.round(baseTime * multiplier);
  }

  /**
   * Assess risk level of a task
   */
  private assessRiskLevel(task: Task): 'low' | 'medium' | 'high' {
    const taskText = `${task.title} ${task.description}`.toLowerCase();

    const highRiskKeywords = [
      'production', 'deploy', 'delete', 'remove', 'drop',
      'database', 'security', 'authentication', 'payment'
    ];

    const mediumRiskKeywords = [
      'update', 'modify', 'change', 'refactor', 'migration'
    ];

    if (highRiskKeywords.some(keyword => taskText.includes(keyword))) {
      return 'high';
    }

    if (mediumRiskKeywords.some(keyword => taskText.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Calculate task complexity (0-1 scale)
   */
  private calculateComplexity(task: Task): number {
    let complexity = 0.5; // Base complexity

    // Adjust by description length (longer = more complex)
    if (task.description) {
      complexity += Math.min(task.description.length / 1000, 0.2);
    }

    // Adjust by dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      complexity += task.dependencies.length * 0.1;
    }

    // Adjust by priority (critical tasks often more complex)
    if (task.priority === 'critical') complexity += 0.15;

    return Math.min(complexity, 1);
  }

  /**
   * Calculate confidence in evaluation (0-1 scale)
   */
  private calculateConfidence(
    task: Task,
    context?: EvaluationContext
  ): number {
    let confidence = 0.7; // Base confidence

    // Higher confidence with more task information
    if (task.description && task.description.length > 50) confidence += 0.1;
    if (task.priority) confidence += 0.05;
    if (task.category) confidence += 0.05;
    if (task.estimatedEffort) confidence += 0.05;

    // Higher confidence with context
    if (context?.currentSystemState) confidence += 0.05;

    return Math.min(confidence, 1);
  }

  /**
   * Create an execution plan from evaluated tasks
   */
  private createExecutionPlan(tasks: EvaluatedTask[]): ExecutionPlan {
    const phases: ExecutionPhase[] = [];

    // Group tasks by agent and dependencies
    const tasksByAgent = new Map<string, EvaluatedTask[]>();

    for (const task of tasks) {
      if (!task.automatable) continue;

      const agent = task.recommendedAgent || 'automation-agent';
      if (!tasksByAgent.has(agent)) {
        tasksByAgent.set(agent, []);
      }
      tasksByAgent.get(agent)!.push(task);
    }

    // Create phases
    let phaseNumber = 1;
    for (const [agent, agentTasks] of tasksByAgent) {
      const phase: ExecutionPhase = {
        phaseId: `phase-${phaseNumber}`,
        name: `${agent} tasks`,
        tasks: agentTasks.map(t => t.id),
        estimatedTime: agentTasks.reduce(
          (sum, t) => sum + (t.estimatedCompletionTime || 0),
          0
        ),
        dependencies: [],
        agentType: agent
      };

      phases.push(phase);
      phaseNumber++;
    }

    // Calculate total time
    const parallelizable = phases.every(p => {
      const agent = this.agentCapabilities[p.agentType as keyof typeof this.agentCapabilities];
      return agent?.parallel;
    });

    const totalEstimatedTime = parallelizable
      ? Math.max(...phases.map(p => p.estimatedTime))
      : phases.reduce((sum, p) => sum + p.estimatedTime, 0);

    return {
      phases,
      totalEstimatedTime,
      parallelizable
    };
  }

  /**
   * Calculate evaluation summary
   */
  private calculateSummary(tasks: EvaluatedTask[]): TaskEvaluation['summary'] {
    const totalTasks = tasks.length;
    const automatableTasks = tasks.filter(t => t.automatable).length;
    const highPriorityTasks = tasks.filter(
      t => t.evaluatedPriority >= 70
    ).length;
    const estimatedTotalTime = tasks.reduce(
      (sum, t) => sum + (t.estimatedCompletionTime || 0),
      0
    );

    const riskDistribution: Record<string, number> = {
      low: tasks.filter(t => t.riskLevel === 'low').length,
      medium: tasks.filter(t => t.riskLevel === 'medium').length,
      high: tasks.filter(t => t.riskLevel === 'high').length
    };

    return {
      totalTasks,
      automatableTasks,
      highPriorityTasks,
      estimatedTotalTime,
      riskDistribution
    };
  }

  /**
   * Generate recommendations based on evaluation
   */
  private generateRecommendations(
    tasks: EvaluatedTask[],
    context?: EvaluationContext
  ): string[] {
    const recommendations: string[] = [];

    const automatableTasks = tasks.filter(t => t.automatable);
    const highRiskTasks = tasks.filter(t => t.riskLevel === 'high');
    const highPriorityTasks = tasks.filter(t => t.evaluatedPriority >= 70);

    if (automatableTasks.length > 0) {
      recommendations.push(
        `${automatableTasks.length} tasks can be automated. Consider using agents for faster execution.`
      );
    }

    if (highRiskTasks.length > 0) {
      recommendations.push(
        `${highRiskTasks.length} high-risk tasks detected. Review carefully before automation.`
      );
    }

    if (highPriorityTasks.length > 0) {
      recommendations.push(
        `${highPriorityTasks.length} high-priority tasks should be addressed first.`
      );
    }

    const tasksByAgent = new Map<string, number>();
    for (const task of automatableTasks) {
      const agent = task.recommendedAgent || 'automation-agent';
      tasksByAgent.set(agent, (tasksByAgent.get(agent) || 0) + 1);
    }

    for (const [agent, count] of tasksByAgent) {
      recommendations.push(
        `Use ${agent} for ${count} task${count > 1 ? 's' : ''}.`
      );
    }

    return recommendations;
  }

  /**
   * Get evaluation by ID
   */
  async getEvaluation(evaluationId: string): Promise<TaskEvaluation | null> {
    return this.evaluations.get(evaluationId) || null;
  }

  /**
   * Get evaluation history
   */
  async getEvaluationHistory(options?: {
    limit?: number;
    offset?: number;
  }): Promise<TaskEvaluation[]> {
    const evaluations = Array.from(this.evaluations.values());
    const sorted = evaluations.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    return sorted.slice(offset, offset + limit);
  }

  /**
   * Save evaluation to file
   */
  private async saveEvaluation(evaluation: TaskEvaluation): Promise<void> {
    const filename = `evaluation-${evaluation.evaluationId}.json`;
    const filepath = path.join(this.evaluationDir, filename);

    await fs.writeFile(
      filepath,
      JSON.stringify(evaluation, null, 2),
      'utf-8'
    );
  }

  /**
   * Load evaluations from disk
   */
  async loadEvaluations(): Promise<void> {
    try {
      const files = await fs.readdir(this.evaluationDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const filepath = path.join(this.evaluationDir, file);
        const content = await fs.readFile(filepath, 'utf-8');
        const evaluation: TaskEvaluation = JSON.parse(content);

        // Convert timestamp string back to Date
        evaluation.timestamp = new Date(evaluation.timestamp);

        this.evaluations.set(evaluation.evaluationId, evaluation);
      }
    } catch (error) {
      // Ignore if directory doesn't exist yet
    }
  }
}
