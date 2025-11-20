/**
 * AI Project Management Orchestrator
 * 
 * Coordinates CodeBERT, CodeT5, and ViT to actively manage project development:
 * - Automatic error detection and repair
 * - Component quality monitoring
 * - Code pattern mining and reuse
 * - Visual quality gates
 * - Campaign orchestration
 * - Knowledge graph integration
 */

import { EventEmitter } from 'events';
import CodeBERTIntegration, { CodeAnalysis } from './CodeBERTIntegration';
import CodeT5Integration, { ErrorClassification, FixCandidate } from './CodeT5Integration';
import ViTIntegration, { VisualAnalysis, ComponentScreenshot } from './ViTIntegration';
import { getDatabase } from '../database/DatabaseAccessLayer';

export interface ProjectConfig {
  name: string;
  rootPath: string;
  filePatterns: string[];
  qualityThresholds: {
    codeQuality: number;
    visualQuality: number;
    accessibility: number;
  };
  autoFix: {
    enabled: boolean;
    minConfidence: number;
    categories: string[];
  };
}

export interface Task {
  id: string;
  type: 'analyze' | 'fix' | 'generate' | 'review' | 'test';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedModel: 'codebert' | 'codet5' | 'vit' | 'hybrid';
  data: any;
  result?: any;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  tasks: Task[];
  status: 'planning' | 'executing' | 'reviewing' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  completedAt?: number;
  metrics: {
    tasksCompleted: number;
    tasksTotal: number;
    errorsFixed: number;
    codeQualityImprovement: number;
    visualQualityImprovement: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'file-change' | 'error' | 'pr' | 'schedule' | 'manual';
  conditions: Record<string, any>;
  actions: string[];
  enabled: boolean;
}

/**
 * AI Project Management Orchestrator
 */
export class ProjectManagementOrchestrator extends EventEmitter {
  private codebert: CodeBERTIntegration;
  private codet5: CodeT5Integration;
  private vit: ViTIntegration;
  private db: any;
  
  private config: ProjectConfig;
  private tasks: Map<string, Task> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  
  private initialized = false;
  private running = false;

  constructor(config: ProjectConfig) {
    super();
    this.config = config;
    this.codebert = new CodeBERTIntegration();
    this.codet5 = new CodeT5Integration();
    this.vit = new ViTIntegration();
  }

  /**
   * Initialize all models and database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.emit('initializing');

    try {
      // Initialize database
      this.db = getDatabase();
      await this.db.initialize();

      // Initialize models in parallel
      await Promise.all([
        this.codebert.initialize(),
        this.codet5.initialize(),
        this.vit.initialize(),
      ]);

      // Load automation rules
      await this.loadAutomationRules();

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      this.emit('error', { phase: 'initialization', error });
      throw error;
    }
  }

  /**
   * Setup event listeners for all models
   */
  private setupEventListeners(): void {
    // CodeBERT events
    this.codebert.on('analyzed', (analysis: CodeAnalysis) => {
      this.emit('code:analyzed', analysis);
      this.handleCodeAnalysis(analysis);
    });

    // CodeT5 events
    this.codet5.on('classified', (classification: ErrorClassification) => {
      this.emit('error:classified', classification);
    });

    this.codet5.on('fixes-generated', ({ count }: { count: number }) => {
      this.emit('error:fixes-generated', { count });
    });

    // ViT events
    this.vit.on('analyzed', (analysis: VisualAnalysis) => {
      this.emit('visual:analyzed', analysis);
      this.handleVisualAnalysis(analysis);
    });

    // Model errors
    [this.codebert, this.codet5, this.vit].forEach(model => {
      model.on('error', (error: any) => {
        this.emit('model:error', error);
      });
    });
  }

  /**
   * Handle code analysis results
   */
  private async handleCodeAnalysis(analysis: CodeAnalysis): Promise<void> {
    // Check if quality is below threshold
    if (analysis.quality < this.config.qualityThresholds.codeQuality) {
      await this.createTask({
        type: 'review',
        priority: 'medium',
        assignedModel: 'codebert',
        data: { analysis, suggestions: analysis.suggestions },
      });
    }

    // Save to database
    try {
      await this.db.insert('code_analyses', {
        complexity: analysis.complexity,
        quality: analysis.quality,
        maintainability: analysis.maintainability,
        documentation: analysis.documentation,
        testability: analysis.testability,
        patterns: JSON.stringify(analysis.patterns),
        suggestions: JSON.stringify(analysis.suggestions),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save code analysis:', error);
    }
  }

  /**
   * Handle visual analysis results
   */
  private async handleVisualAnalysis(analysis: VisualAnalysis): Promise<void> {
    // Check if visual quality is below threshold
    if (analysis.qualityScore < this.config.qualityThresholds.visualQuality) {
      await this.createTask({
        type: 'review',
        priority: 'medium',
        assignedModel: 'vit',
        data: { analysis, suggestions: analysis.suggestions },
      });
    }

    // Check accessibility
    if (analysis.accessibility.contrastRatio < this.config.qualityThresholds.accessibility) {
      await this.createTask({
        type: 'fix',
        priority: 'high',
        assignedModel: 'vit',
        data: {
          issue: 'Accessibility: Low contrast ratio',
          analysis,
        },
      });
    }

    // Save to database
    try {
      await this.db.insert('visual_analyses', {
        quality_score: analysis.qualityScore,
        color_harmony: analysis.aesthetics.colorHarmony,
        spacing: analysis.aesthetics.spacing,
        balance: analysis.aesthetics.balance,
        contrast: analysis.aesthetics.contrast,
        layout_type: analysis.layout.type,
        layout_complexity: analysis.layout.complexity,
        contrast_ratio: analysis.accessibility.contrastRatio,
        patterns: JSON.stringify(analysis.patterns),
        suggestions: JSON.stringify(analysis.suggestions),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save visual analysis:', error);
    }
  }

  /**
   * Create a new task
   */
  private async createTask(taskData: Partial<Task>): Promise<Task> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: taskData.type || 'analyze',
      priority: taskData.priority || 'medium',
      status: 'pending',
      assignedModel: taskData.assignedModel || 'codebert',
      data: taskData.data || {},
      createdAt: Date.now(),
    };

    this.tasks.set(task.id, task);
    this.emit('task:created', task);

    // Save to database
    try {
      await this.db.insert('tasks', {
        task_id: task.id,
        type: task.type,
        priority: task.priority,
        status: task.status,
        assigned_model: task.assignedModel,
        data: JSON.stringify(task.data),
        created_at: task.createdAt,
      });
    } catch (error) {
      console.error('Failed to save task:', error);
    }

    return task;
  }

  /**
   * Analyze code file
   */
  async analyzeCode(filePath: string, code: string): Promise<CodeAnalysis> {
    this.emit('analyzing:code', { filePath });

    try {
      const analysis = await this.codebert.analyzeCode(code);
      
      // Create task for low quality code
      if (analysis.quality < this.config.qualityThresholds.codeQuality) {
        await this.createTask({
          type: 'review',
          priority: this.calculatePriority(analysis.quality),
          assignedModel: 'codebert',
          data: { filePath, analysis },
        });
      }

      return analysis;
    } catch (error) {
      this.emit('error', { phase: 'code-analysis', error });
      throw error;
    }
  }

  /**
   * Analyze component screenshot
   */
  async analyzeComponent(screenshot: ComponentScreenshot): Promise<VisualAnalysis> {
    this.emit('analyzing:visual', { type: screenshot.type });

    try {
      const analysis = await this.vit.analyzeScreenshot(screenshot);
      
      // Create tasks for quality issues
      if (analysis.qualityScore < this.config.qualityThresholds.visualQuality) {
        await this.createTask({
          type: 'review',
          priority: this.calculatePriority(analysis.qualityScore),
          assignedModel: 'vit',
          data: { screenshot: screenshot.type, analysis },
        });
      }

      return analysis;
    } catch (error) {
      this.emit('error', { phase: 'visual-analysis', error });
      throw error;
    }
  }

  /**
   * Detect and fix errors
   */
  async handleError(errorRequest: any): Promise<FixCandidate[]> {
    this.emit('handling:error', { errorMessage: errorRequest.errorMessage });

    try {
      // Classify error
      const classification = await this.codet5.classifyError(errorRequest);
      
      // Generate fixes
      const fixes = await this.codet5.generateFixes(errorRequest);

      // Auto-apply if enabled and confidence is high
      if (
        this.config.autoFix.enabled &&
        fixes.length > 0 &&
        fixes[0].confidence >= this.config.autoFix.minConfidence &&
        this.config.autoFix.categories.includes(classification.category)
      ) {
        await this.createTask({
          type: 'fix',
          priority: this.getSeverityPriority(classification.severity),
          assignedModel: 'codet5',
          data: {
            error: errorRequest,
            classification,
            fix: fixes[0],
            autoApply: true,
          },
        });
      } else {
        // Create review task
        await this.createTask({
          type: 'review',
          priority: this.getSeverityPriority(classification.severity),
          assignedModel: 'codet5',
          data: {
            error: errorRequest,
            classification,
            fixes,
          },
        });
      }

      return fixes;
    } catch (error) {
      this.emit('error', { phase: 'error-handling', error });
      throw error;
    }
  }

  /**
   * Create and execute campaign
   */
  async createCampaign(objective: string): Promise<Campaign> {
    this.emit('campaign:creating', { objective });

    const campaign: Campaign = {
      id: `campaign_${Date.now()}`,
      name: `Campaign: ${objective}`,
      objective,
      tasks: [],
      status: 'planning',
      progress: 0,
      createdAt: Date.now(),
      metrics: {
        tasksCompleted: 0,
        tasksTotal: 0,
        errorsFixed: 0,
        codeQualityImprovement: 0,
        visualQualityImprovement: 0,
      },
    };

    // Break down objective into tasks
    const tasks = await this.breakdownObjective(objective);
    campaign.tasks = tasks;
    campaign.metrics.tasksTotal = tasks.length;

    this.campaigns.set(campaign.id, campaign);
    this.emit('campaign:created', campaign);

    // Save to database
    try {
      await this.db.insert('campaigns', {
        campaign_id: campaign.id,
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status,
        progress: campaign.progress,
        created_at: campaign.createdAt,
      });
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }

    return campaign;
  }

  /**
   * Execute campaign
   */
  async executeCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    this.emit('campaign:executing', { campaignId, name: campaign.name });

    campaign.status = 'executing';

    try {
      // Execute tasks in order of priority
      const sortedTasks = campaign.tasks.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      for (const task of sortedTasks) {
        await this.executeTask(task);
        campaign.metrics.tasksCompleted++;
        campaign.progress = campaign.metrics.tasksCompleted / campaign.metrics.tasksTotal;
        
        this.emit('campaign:progress', {
          campaignId,
          progress: campaign.progress,
          task: task.id,
        });
      }

      campaign.status = 'completed';
      campaign.completedAt = Date.now();
      
      this.emit('campaign:completed', campaign);

      // Update database
      await this.db.update('campaigns', 
        { campaign_id: campaignId },
        {
          status: campaign.status,
          progress: campaign.progress,
          completed_at: campaign.completedAt,
        }
      );
    } catch (error) {
      campaign.status = 'failed';
      this.emit('campaign:failed', { campaignId, error });
      throw error;
    }
  }

  /**
   * Execute individual task
   */
  private async executeTask(task: Task): Promise<void> {
    this.emit('task:executing', { taskId: task.id, type: task.type });

    task.status = 'in-progress';

    try {
      let result: any;

      switch (task.assignedModel) {
        case 'codebert':
          result = await this.executeCodeBERTTask(task);
          break;
        case 'codet5':
          result = await this.executeCodeT5Task(task);
          break;
        case 'vit':
          result = await this.executeViTTask(task);
          break;
        case 'hybrid':
          result = await this.executeHybridTask(task);
          break;
      }

      task.result = result;
      task.status = 'completed';
      task.completedAt = Date.now();

      this.emit('task:completed', task);

      // Update database
      await this.db.update('tasks',
        { task_id: task.id },
        {
          status: task.status,
          result: JSON.stringify(task.result),
          completed_at: task.completedAt,
        }
      );
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      
      this.emit('task:failed', { taskId: task.id, error });
      
      // Update database
      await this.db.update('tasks',
        { task_id: task.id },
        {
          status: task.status,
          error: task.error,
        }
      );
    }
  }

  /**
   * Execute CodeBERT task
   */
  private async executeCodeBERTTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'analyze':
        return await this.codebert.analyzeCode(task.data.code);
      case 'generate':
        return await this.codebert.generateCode(task.data.request);
      case 'review':
        // Already analyzed, just return suggestions
        return { suggestions: task.data.analysis.suggestions };
      default:
        throw new Error(`Unknown task type for CodeBERT: ${task.type}`);
    }
  }

  /**
   * Execute CodeT5 task
   */
  private async executeCodeT5Task(task: Task): Promise<any> {
    switch (task.type) {
      case 'analyze':
        return await this.codet5.classifyError(task.data.error);
      case 'fix':
        if (task.data.autoApply) {
          return await this.codet5.applyFix(task.data.error.sourceCode, task.data.fix);
        } else {
          return await this.codet5.generateFixes(task.data.error);
        }
      case 'review':
        return { fixes: task.data.fixes, classification: task.data.classification };
      default:
        throw new Error(`Unknown task type for CodeT5: ${task.type}`);
    }
  }

  /**
   * Execute ViT task
   */
  private async executeViTTask(task: Task): Promise<any> {
    switch (task.type) {
      case 'analyze':
        return await this.vit.analyzeScreenshot(task.data.screenshot);
      case 'review':
        return { suggestions: task.data.analysis.suggestions };
      default:
        throw new Error(`Unknown task type for ViT: ${task.type}`);
    }
  }

  /**
   * Execute hybrid task (using multiple models)
   */
  private async executeHybridTask(task: Task): Promise<any> {
    // Use all three models for comprehensive analysis
    const results: any = {};

    if (task.data.code) {
      results.codeAnalysis = await this.codebert.analyzeCode(task.data.code);
    }

    if (task.data.screenshot) {
      results.visualAnalysis = await this.vit.analyzeScreenshot(task.data.screenshot);
    }

    if (task.data.error) {
      results.errorAnalysis = await this.codet5.classifyError(task.data.error);
      results.fixes = await this.codet5.generateFixes(task.data.error);
    }

    return results;
  }

  /**
   * Break down objective into tasks
   */
  private async breakdownObjective(objective: string): Promise<Task[]> {
    const tasks: Task[] = [];

    // Simple breakdown based on keywords
    const lowerObjective = objective.toLowerCase();

    if (lowerObjective.includes('component') || lowerObjective.includes('ui')) {
      tasks.push({
        id: `task_${Date.now()}_1`,
        type: 'analyze',
        priority: 'high',
        status: 'pending',
        assignedModel: 'vit',
        data: { objective },
        createdAt: Date.now(),
      });
    }

    if (lowerObjective.includes('code') || lowerObjective.includes('function')) {
      tasks.push({
        id: `task_${Date.now()}_2`,
        type: 'generate',
        priority: 'high',
        status: 'pending',
        assignedModel: 'codebert',
        data: { objective },
        createdAt: Date.now(),
      });
    }

    if (lowerObjective.includes('fix') || lowerObjective.includes('error')) {
      tasks.push({
        id: `task_${Date.now()}_3`,
        type: 'fix',
        priority: 'critical',
        status: 'pending',
        assignedModel: 'codet5',
        data: { objective },
        createdAt: Date.now(),
      });
    }

    // Default comprehensive analysis
    if (tasks.length === 0) {
      tasks.push({
        id: `task_${Date.now()}_default`,
        type: 'analyze',
        priority: 'medium',
        status: 'pending',
        assignedModel: 'hybrid',
        data: { objective },
        createdAt: Date.now(),
      });
    }

    return tasks;
  }

  /**
   * Load automation rules from database
   */
  private async loadAutomationRules(): Promise<void> {
    try {
      const rules = await this.db.select('automation_rules', {});
      
      rules.forEach((rule: any) => {
        this.automationRules.set(rule.id, {
          id: rule.id,
          name: rule.name,
          trigger: rule.trigger,
          conditions: JSON.parse(rule.conditions),
          actions: JSON.parse(rule.actions),
          enabled: rule.enabled,
        });
      });

      this.emit('rules:loaded', { count: this.automationRules.size });
    } catch (error) {
      console.warn('No automation rules found, starting with defaults');
      this.createDefaultRules();
    }
  }

  /**
   * Create default automation rules
   */
  private createDefaultRules(): void {
    const defaultRules: AutomationRule[] = [
      {
        id: 'rule_auto_fix_syntax',
        name: 'Auto-fix syntax errors',
        trigger: 'error',
        conditions: { category: 'syntax', confidence: { min: 0.85 } },
        actions: ['generate-fix', 'apply-fix', 'notify'],
        enabled: true,
      },
      {
        id: 'rule_review_low_quality',
        name: 'Review low quality code',
        trigger: 'file-change',
        conditions: { quality: { max: 0.6 } },
        actions: ['create-task', 'notify'],
        enabled: true,
      },
      {
        id: 'rule_accessibility_check',
        name: 'Check accessibility on PR',
        trigger: 'pr',
        conditions: { hasVisualChanges: true },
        actions: ['analyze-visual', 'check-accessibility', 'add-comment'],
        enabled: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });
  }

  /**
   * Calculate priority from quality score
   */
  private calculatePriority(qualityScore: number): Task['priority'] {
    if (qualityScore < 0.4) return 'critical';
    if (qualityScore < 0.6) return 'high';
    if (qualityScore < 0.8) return 'medium';
    return 'low';
  }

  /**
   * Get priority from severity
   */
  private getSeverityPriority(severity: ErrorClassification['severity']): Task['priority'] {
    const map: Record<string, Task['priority']> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };
    return map[severity] || 'medium';
  }

  /**
   * Get campaign status
   */
  getCampaign(campaignId: string): Campaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Get task status
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get statistics
   */
  getStatistics(): any {
    return {
      models: {
        codebert: { initialized: this.codebert !== null },
        codet5: { initialized: this.codet5 !== null },
        vit: { initialized: this.vit !== null },
      },
      tasks: {
        total: this.tasks.size,
        byStatus: this.getTasksByStatus(),
        byModel: this.getTasksByModel(),
      },
      campaigns: {
        total: this.campaigns.size,
        byStatus: this.getCampaignsByStatus(),
      },
      automationRules: {
        total: this.automationRules.size,
        enabled: Array.from(this.automationRules.values()).filter(r => r.enabled).length,
      },
    };
  }

  /**
   * Get tasks grouped by status
   */
  private getTasksByStatus(): Record<string, number> {
    const byStatus: Record<string, number> = {};
    
    this.tasks.forEach(task => {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
    });

    return byStatus;
  }

  /**
   * Get tasks grouped by model
   */
  private getTasksByModel(): Record<string, number> {
    const byModel: Record<string, number> = {};
    
    this.tasks.forEach(task => {
      byModel[task.assignedModel] = (byModel[task.assignedModel] || 0) + 1;
    });

    return byModel;
  }

  /**
   * Get campaigns grouped by status
   */
  private getCampaignsByStatus(): Record<string, number> {
    const byStatus: Record<string, number> = {};
    
    this.campaigns.forEach(campaign => {
      byStatus[campaign.status] = (byStatus[campaign.status] || 0) + 1;
    });

    return byStatus;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.codebert.dispose();
    this.codet5.dispose();
    this.vit.dispose();
    
    this.tasks.clear();
    this.campaigns.clear();
    this.automationRules.clear();
    
    this.emit('disposed');
  }
}

export default ProjectManagementOrchestrator;
