import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Database,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Layers,
  Cpu,
  Network,
  Timer,
  RefreshCw,
  Maximize2,
  Minimize2,
  Monitor,
  Eye,
  FileText,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit3,
  Save,
  X,
  Sliders,
  Brain,
  Globe,
  Lightbulb,
  Search,
  Filter,
  Calendar,
  Users,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Info,
  Check,
  XCircle
} from 'lucide-react';

// Workflow and Stats Types
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number; // 0-100
  recordsProcessed: number;
  recordsTotal: number;
  avgScore: number;
  expectedOutcome: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  dependencies: string[]; // IDs of steps that must complete first
  outputs: any[];
  errors: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  steps: WorkflowStep[];
  currentStepId?: string;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  stats: {
    totalRecords: number;
    processedRecords: number;
    avgScore: number;
    errors: number;
    successRate: number;
  };
  config: {
    autoAdvance: boolean;
    maxRetries: number;
    parallelExecution: boolean;
    timeout: number;
  };
}

interface StatsDashboard {
  overview: {
    totalWorkflows: number;
    activeWorkflows: number;
    completedWorkflows: number;
    totalRecords: number;
    avgScore: number;
    systemHealth: number;
  };
  categoryStats: {
    [category: string]: {
      workflows: number;
      records: number;
      avgScore: number;
      successRate: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  performance: {
    avgProcessingTime: number;
    throughput: number; // records per minute
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  recentActivity: {
    timestamp: Date;
    type: 'workflow_started' | 'workflow_completed' | 'step_completed' | 'error' | 'milestone';
    message: string;
    workflowId: string;
    stepId?: string;
    data?: any;
  }[];
}

class WorkflowStatsManager {
  private workflows: Map<string, Workflow> = new Map();
  private stats: StatsDashboard;
  private intervalId: NodeJS.Timeout | null = null;
  private onUpdateCallbacks: Set<(stats: StatsDashboard) => void> = new Set();
  private activityLog: StatsDashboard['recentActivity'] = [];

  constructor() {
    this.stats = {
      overview: {
        totalWorkflows: 0,
        activeWorkflows: 0,
        completedWorkflows: 0,
        totalRecords: 0,
        avgScore: 0,
        systemHealth: 100
      },
      categoryStats: {},
      performance: {
        avgProcessingTime: 0,
        throughput: 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      recentActivity: []
    };
    this.initializeWorkflows();
    this.startStatsUpdates();
  }

  private async initializeWorkflows(): Promise<void> {
    console.log('📊 Initializing Workflow Stats Manager...');

    // Initialize sample workflows
    this.createWorkflow({
      name: 'SEO Content Optimization Workflow',
      description: 'Complete SEO analysis and content optimization pipeline',
      category: 'SEO',
      steps: [
        {
          id: 'crawl-seo-data',
          name: 'Crawl SEO Data',
          description: 'Collect SEO metrics from target websites',
          category: 'SEO',
          subcategory: 'Data Collection',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          recordsTotal: 1000,
          avgScore: 0,
          expectedOutcome: 'Collected 1000 SEO records with average score > 70',
          dependencies: [],
          outputs: [],
          errors: []
        },
        {
          id: 'analyze-h1-tags',
          name: 'Analyze H1 Tags',
          description: 'Analyze H1 tag optimization and issues',
          category: 'SEO',
          subcategory: 'H1 Tags',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          recordsTotal: 1000,
          avgScore: 0,
          expectedOutcome: 'Identified H1 issues and optimization opportunities',
          dependencies: ['crawl-seo-data'],
          outputs: [],
          errors: []
        },
        {
          id: 'train-seo-model',
          name: 'Train SEO Prediction Model',
          description: 'Train neural network for SEO score prediction',
          category: 'SEO',
          subcategory: 'Model Training',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          recordsTotal: 800,
          avgScore: 0,
          expectedOutcome: 'Trained model with >85% accuracy',
          dependencies: ['analyze-h1-tags'],
          outputs: [],
          errors: []
        },
        {
          id: 'generate-recommendations',
          name: 'Generate Recommendations',
          description: 'Generate personalized SEO improvement recommendations',
          category: 'SEO',
          subcategory: 'Recommendations',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          recordsTotal: 1000,
          avgScore: 0,
          expectedOutcome: 'Generated actionable SEO recommendations',
          dependencies: ['train-seo-model'],
          outputs: [],
          errors: []
        }
      ],
      config: {
        autoAdvance: true,
        maxRetries: 3,
        parallelExecution: false,
        timeout: 3600000 // 1 hour
      }
    });

    this.createWorkflow({
      name: 'UX Design Analysis Workflow',
      description: 'Analyze visual design elements and user experience patterns',
      category: 'UX',
      steps: [
        {
          id: 'collect-ux-data',
          name: 'Collect UX Data',
          description: 'Gather UX metrics and user interaction data',
          category: 'UX',
          subcategory: 'Data Collection',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          recordsTotal: 500,
          avgScore: 0,
          expectedOutcome: 'Collected 500 UX interaction records',
          dependencies: [],
          outputs: [],
          errors: []
        },
        {
          id: 'analyze-visual-elements',
          name: 'Analyze Visual Elements',
          description: 'Analyze color schemes, typography, and layout',
          category: 'UX',
          subcategory: 'Visual Design',
          status: 'pending',
          progress: 0,
          recordsProcessed: 0,
          recordsTotal: 500,
          avgScore: 0,
          expectedOutcome: 'Identified visual design patterns and trends',
          dependencies: ['collect-ux-data'],
          outputs: [],
          errors: []
        }
      ],
      config: {
        autoAdvance: true,
        maxRetries: 3,
        parallelExecution: true,
        timeout: 1800000 // 30 minutes
      }
    });

    this.updateStats();
    console.log('✅ Workflow Stats Manager initialized');
  }

  private startStatsUpdates(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.processWorkflows();
      this.updateStats();
    }, 2000); // Update every 2 seconds
  }

  private async processWorkflows(): Promise<void> {
    for (const [workflowId, workflow] of this.workflows) {
      if (workflow.status === 'running') {
        await this.processWorkflowSteps(workflow);
      }
    }
  }

  private async processWorkflowSteps(workflow: Workflow): Promise<void> {
    // Find current step or next pending step
    let currentStep: WorkflowStep | undefined;

    if (workflow.currentStepId) {
      currentStep = workflow.steps.find(s => s.id === workflow.currentStepId);
    } else {
      // Find first pending step with satisfied dependencies
      currentStep = workflow.steps.find(step => {
        if (step.status !== 'pending') return false;
        return step.dependencies.every(depId => {
          const depStep = workflow.steps.find(s => s.id === depId);
          return depStep?.status === 'completed';
        });
      });
    }

    if (!currentStep) return;

    workflow.currentStepId = currentStep.id;

    // Process the current step
    if (currentStep.status === 'pending') {
      await this.startWorkflowStep(workflow, currentStep);
    } else if (currentStep.status === 'running') {
      await this.updateWorkflowStepProgress(workflow, currentStep);
    }
  }

  private async startWorkflowStep(workflow: Workflow, step: WorkflowStep): Promise<void> {
    step.status = 'running';
    step.startTime = new Date();
    step.progress = 0;

    this.logActivity({
      timestamp: new Date(),
      type: 'step_started',
      message: `Started step: ${step.name}`,
      workflowId: workflow.id,
      stepId: step.id
    });

    console.log(`▶️ Started workflow step: ${workflow.name} -> ${step.name}`);
  }

  private async updateWorkflowStepProgress(workflow: Workflow, step: WorkflowStep): Promise<void> {
    const now = new Date();
    const elapsed = step.startTime ? (now.getTime() - step.startTime.getTime()) / 1000 : 0;

    // Simulate progress based on step type
    const progressIncrement = this.getProgressIncrement(step);
    step.progress = Math.min(100, step.progress + progressIncrement);

    // Simulate records processing
    const recordsIncrement = Math.floor(Math.random() * 50) + 10;
    step.recordsProcessed = Math.min(step.recordsTotal, step.recordsProcessed + recordsIncrement);

    // Update average score
    step.avgScore = this.calculateStepScore(step);

    // Simulate occasional errors
    if (Math.random() < 0.02) {
      step.errors.push(`Error processing record ${step.recordsProcessed}`);
    }

    // Check if step is completed
    if (step.progress >= 100) {
      await this.completeWorkflowStep(workflow, step);
    }
  }

  private getProgressIncrement(step: WorkflowStep): number {
    // Different step types have different processing speeds
    switch (step.category) {
      case 'SEO':
        return Math.random() * 8 + 2; // 2-10% per update
      case 'UX':
        return Math.random() * 6 + 1; // 1-7% per update
      case 'Content':
        return Math.random() * 4 + 1; // 1-5% per update
      default:
        return Math.random() * 5 + 1; // 1-6% per update
    }
  }

  private calculateStepScore(step: WorkflowStep): number {
    // Simulate realistic scores based on category
    const baseScore = step.category === 'SEO' ? 70 : step.category === 'UX' ? 75 : 65;
    const progressBonus = (step.progress / 100) * 15;
    const noise = (Math.random() - 0.5) * 10;

    return Math.max(0, Math.min(100, baseScore + progressBonus + noise));
  }

  private async completeWorkflowStep(workflow: Workflow, step: WorkflowStep): Promise<void> {
    step.status = 'completed';
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - (step.startTime?.getTime() || 0);

    this.logActivity({
      timestamp: new Date(),
      type: 'step_completed',
      message: `Completed step: ${step.name} (${step.avgScore.toFixed(1)} avg score)`,
      workflowId: workflow.id,
      stepId: step.id,
      data: { score: step.avgScore, records: step.recordsProcessed }
    });

    console.log(`✅ Completed workflow step: ${workflow.name} -> ${step.name}`);

    // Check if workflow is complete
    const allStepsComplete = workflow.steps.every(s => s.status === 'completed');
    if (allStepsComplete) {
      workflow.status = 'completed';
      workflow.endTime = new Date();
      workflow.duration = workflow.endTime.getTime() - (workflow.startTime?.getTime() || 0);

      this.logActivity({
        timestamp: new Date(),
        type: 'workflow_completed',
        message: `Workflow completed: ${workflow.name}`,
        workflowId: workflow.id,
        data: workflow.stats
      });

      console.log(`🎉 Completed workflow: ${workflow.name}`);
    } else if (workflow.config.autoAdvance) {
      // Clear current step to allow next step to start
      workflow.currentStepId = undefined;
    }
  }

  private logActivity(activity: StatsDashboard['recentActivity'][0]): void {
    this.activityLog.unshift(activity);
    // Keep only last 100 activities
    this.activityLog = this.activityLog.slice(0, 100);
  }

  createWorkflow(workflowData: Omit<Workflow, 'id' | 'status' | 'progress' | 'stats'>): string {
    const workflow: Workflow = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'idle',
      progress: 0,
      stats: {
        totalRecords: workflowData.steps.reduce((sum, step) => sum + step.recordsTotal, 0),
        processedRecords: 0,
        avgScore: 0,
        errors: 0,
        successRate: 0
      },
      ...workflowData
    };

    this.workflows.set(workflow.id, workflow);
    this.updateStats();

    console.log(`📝 Created workflow: ${workflow.name}`);
    return workflow.id;
  }

  startWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'idle') return false;

    workflow.status = 'running';
    workflow.startTime = new Date();
    workflow.progress = 0;

    this.logActivity({
      timestamp: new Date(),
      type: 'workflow_started',
      message: `Started workflow: ${workflow.name}`,
      workflowId: workflow.id
    });

    console.log(`▶️ Started workflow: ${workflow.name}`);
    return true;
  }

  pauseWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'running') return false;

    workflow.status = 'paused';
    console.log(`⏸️ Paused workflow: ${workflow.name}`);
    return true;
  }

  resumeWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'paused') return false;

    workflow.status = 'running';
    console.log(`▶️ Resumed workflow: ${workflow.name}`);
    return true;
  }

  stopWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !['running', 'paused'].includes(workflow.status)) return false;

    workflow.status = 'failed';
    workflow.endTime = new Date();
    workflow.duration = workflow.endTime.getTime() - (workflow.startTime?.getTime() || 0);

    console.log(`⏹️ Stopped workflow: ${workflow.name}`);
    return true;
  }

  restartWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Reset workflow state
    workflow.status = 'idle';
    workflow.progress = 0;
    workflow.currentStepId = undefined;
    workflow.startTime = undefined;
    workflow.endTime = undefined;
    workflow.duration = undefined;

    // Reset all steps
    workflow.steps.forEach(step => {
      step.status = 'pending';
      step.progress = 0;
      step.recordsProcessed = 0;
      step.avgScore = 0;
      step.startTime = undefined;
      step.endTime = undefined;
      step.duration = undefined;
      step.outputs = [];
      step.errors = [];
    });

    workflow.stats = {
      totalRecords: workflow.steps.reduce((sum, step) => sum + step.recordsTotal, 0),
      processedRecords: 0,
      avgScore: 0,
      errors: 0,
      successRate: 0
    };

    console.log(`🔄 Restarted workflow: ${workflow.name}`);
    return true;
  }

  private updateStats(): void {
    const workflows = Array.from(this.workflows.values());

    // Overview stats
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'running').length;
    const completedWorkflows = workflows.filter(w => w.status === 'completed').length;

    const totalRecords = workflows.reduce((sum, w) => sum + w.stats.totalRecords, 0);
    const processedRecords = workflows.reduce((sum, w) => sum + w.stats.processedRecords, 0);
    const avgScore = workflows.length > 0 ? workflows.reduce((sum, w) => sum + w.stats.avgScore, 0) / workflows.length : 0;

    // Calculate system health (percentage of workflows running smoothly)
    const healthyWorkflows = workflows.filter(w => w.status === 'completed' || (w.status === 'running' && w.stats.errors === 0)).length;
    const systemHealth = totalWorkflows > 0 ? (healthyWorkflows / totalWorkflows) * 100 : 100;

    // Category stats
    const categoryStats: StatsDashboard['categoryStats'] = {};
    workflows.forEach(workflow => {
      if (!categoryStats[workflow.category]) {
        categoryStats[workflow.category] = {
          workflows: 0,
          records: 0,
          avgScore: 0,
          successRate: 0,
          trend: 'stable'
        };
      }

      categoryStats[workflow.category].workflows++;
      categoryStats[workflow.category].records += workflow.stats.totalRecords;
      categoryStats[workflow.category].avgScore += workflow.stats.avgScore;
      if (workflow.status === 'completed') {
        categoryStats[workflow.category].successRate += 100;
      } else if (workflow.status === 'running') {
        categoryStats[workflow.category].successRate += 50;
      }
    });

    // Normalize category stats
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.avgScore /= stats.workflows;
      stats.successRate /= stats.workflows;
      stats.trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
    });

    // Performance stats
    const completedSteps = workflows.flatMap(w => w.steps).filter(s => s.status === 'completed');
    const avgProcessingTime = completedSteps.length > 0
      ? completedSteps.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSteps.length
      : 0;

    const throughput = processedRecords / Math.max(1, (Date.now() / 1000) / 60); // records per minute
    const totalErrors = workflows.reduce((sum, w) => sum + w.stats.errors, 0);
    const errorRate = processedRecords > 0 ? (totalErrors / processedRecords) * 100 : 0;

    const performance = {
      avgProcessingTime,
      throughput,
      errorRate,
      memoryUsage: 512 + Math.random() * 512, // 512-1024 MB
      cpuUsage: 15 + Math.random() * 35 // 15-50%
    };

    this.stats = {
      overview: {
        totalWorkflows,
        activeWorkflows,
        completedWorkflows,
        totalRecords,
        avgScore,
        systemHealth
      },
      categoryStats,
      performance,
      recentActivity: this.activityLog.slice(0, 20) // Last 20 activities
    };

    // Update workflow-level stats
    workflows.forEach(workflow => {
      const completedSteps = workflow.steps.filter(s => s.status === 'completed');
      workflow.stats.processedRecords = completedSteps.reduce((sum, s) => sum + s.recordsProcessed, 0);
      workflow.stats.avgScore = completedSteps.length > 0
        ? completedSteps.reduce((sum, s) => sum + s.avgScore, 0) / completedSteps.length
        : 0;
      workflow.stats.errors = workflow.steps.reduce((sum, s) => sum + s.errors.length, 0);
      workflow.stats.successRate = (completedSteps.length / workflow.steps.length) * 100;
      workflow.progress = (completedSteps.length / workflow.steps.length) * 100;
    });

    this.notifyUpdate(this.stats);
  }

  onStatsUpdate(callback: (stats: StatsDashboard) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(stats: StatsDashboard): void {
    this.onUpdateCallbacks.forEach(callback => callback(stats));
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getStats(): StatsDashboard {
    return { ...this.stats };
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.workflows.clear();
    this.onUpdateCallbacks.clear();
    console.log('🗑️ Workflow Stats Manager destroyed');
  }
}

// Global stats manager instance
const workflowStatsManager = new WorkflowStatsManager();

// React hooks
export const useWorkflowStats = () => {
  const [stats, setStats] = useState<StatsDashboard>(workflowStatsManager.getStats());
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    // Initial load
    setWorkflows(workflowStatsManager.getAllWorkflows());

    // Subscribe to updates
    const unsubscribe = workflowStatsManager.onStatsUpdate((updatedStats) => {
      setStats(updatedStats);
      setWorkflows(workflowStatsManager.getAllWorkflows());
    });

    return unsubscribe;
  }, []);

  const startWorkflow = useCallback((workflowId: string) => workflowStatsManager.startWorkflow(workflowId), []);
  const pauseWorkflow = useCallback((workflowId: string) => workflowStatsManager.pauseWorkflow(workflowId), []);
  const resumeWorkflow = useCallback((workflowId: string) => workflowStatsManager.resumeWorkflow(workflowId), []);
  const stopWorkflow = useCallback((workflowId: string) => workflowStatsManager.stopWorkflow(workflowId), []);
  const restartWorkflow = useCallback((workflowId: string) => workflowStatsManager.restartWorkflow(workflowId), []);

  return {
    stats,
    workflows,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    stopWorkflow,
    restartWorkflow
  };
};

// Stats and Workflow Status Dashboard Component
export const StatsWorkflowDashboard: React.FC = () => {
  const { stats, workflows, startWorkflow, pauseWorkflow, resumeWorkflow, stopWorkflow, restartWorkflow } = useWorkflowStats();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showActivityLog, setShowActivityLog] = useState(false);

  const statusColors = {
    idle: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    running: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-300',
    paused: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
  };

  const stepStatusColors = {
    pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    running: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-300',
    skipped: 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'idle': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workflow_started': return <Play className="h-4 w-4 text-blue-600" />;
      case 'workflow_completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'step_completed': return <Check className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'milestone': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredWorkflows = filterCategory === 'all'
    ? workflows
    : workflows.filter(w => w.category === filterCategory);

  const categories = ['all', ...new Set(workflows.map(w => w.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Workflow Stats & Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive workflow monitoring, statistics, and performance analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowActivityLog(!showActivityLog)}
            variant="outline"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Activity Log
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Monitor className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-sm font-medium">
              {stats.overview.activeWorkflows} Active
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalWorkflows}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.overview.activeWorkflows}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.overview.completedWorkflows}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.overview.avgScore)}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-orange-600">{stats.overview.totalRecords.toLocaleString()}</p>
            </div>
            <Database className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
              <p className="text-2xl font-bold text-green-600">{Math.round(stats.overview.systemHealth)}%</p>
            </div>
            <Monitor className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg Processing Time</span>
              <span className="font-medium">{Math.round(stats.performance.avgProcessingTime)}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Throughput</span>
              <span className="font-medium">{Math.round(stats.performance.throughput)} rec/min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
              <span className="font-medium">{stats.performance.errorRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
              <span className="font-medium">{Math.round(stats.performance.memoryUsage)}MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">CPU Usage</span>
              <span className="font-medium">{Math.round(stats.performance.cpuUsage)}%</span>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            Category Performance
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryStats).map(([category, catStats]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center gap-3">
                  {getTrendIcon(catStats.trend)}
                  <div>
                    <div className="font-medium">{category}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {catStats.workflows} workflows, {catStats.records.toLocaleString()} records
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{Math.round(catStats.avgScore)} avg</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(catStats.successRate)}% success
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workflow Management</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(workflow.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                      <span className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        statusColors[workflow.status as keyof typeof statusColors]
                      )}>
                        {workflow.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{workflow.category}</span>
                      <span>{workflow.stats.processedRecords.toLocaleString()}/{workflow.stats.totalRecords.toLocaleString()} records</span>
                      <span>Avg Score: {Math.round(workflow.stats.avgScore)}</span>
                      <span>Success: {Math.round(workflow.stats.successRate)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(workflow.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${workflow.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {workflow.status === 'idle' && (
                    <Button onClick={() => startWorkflow(workflow.id)} size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  {workflow.status === 'running' && (
                    <Button onClick={() => pauseWorkflow(workflow.id)} size="sm" variant="outline">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}

                  {workflow.status === 'paused' && (
                    <Button onClick={() => resumeWorkflow(workflow.id)} size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  {['running', 'paused'].includes(workflow.status) && (
                    <Button onClick={() => stopWorkflow(workflow.id)} size="sm" variant="outline">
                      <Square className="h-4 w-4" />
                    </Button>
                  )}

                  {['completed', 'failed'].includes(workflow.status) && (
                    <Button onClick={() => restartWorkflow(workflow.id)} size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}

                  <Button onClick={() => setSelectedWorkflow(workflow)} size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log Panel */}
      {showActivityLog && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-white">{activity.message}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedWorkflow.name}</h3>
                <Button onClick={() => setSelectedWorkflow(null)} variant="ghost">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Workflow Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className={cn(
                    'px-2 py-1 text-sm rounded-full inline-flex items-center gap-1',
                    statusColors[selectedWorkflow.status as keyof typeof statusColors]
                  )}>
                    {getStatusIcon(selectedWorkflow.status)}
                    {selectedWorkflow.status}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Progress</label>
                  <span className="text-lg font-semibold">{Math.round(selectedWorkflow.progress)}%</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                  <span>{selectedWorkflow.category}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</label>
                  <span>{Math.round(selectedWorkflow.stats.successRate)}%</span>
                </div>
              </div>

              {/* Workflow Steps */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Workflow Steps</h4>
                <div className="space-y-3">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Step {index + 1}
                          </span>
                          <h5 className="font-medium">{step.name}</h5>
                          <span className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            stepStatusColors[step.status as keyof typeof stepStatusColors]
                          )}>
                            {step.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {step.category} → {step.subcategory}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Progress:</span> {Math.round(step.progress)}%
                        </div>
                        <div>
                          <span className="font-medium">Records:</span> {step.recordsProcessed}/{step.recordsTotal}
                        </div>
                        <div>
                          <span className="font-medium">Avg Score:</span> {Math.round(step.avgScore)}
                        </div>
                        <div>
                          <span className="font-medium">Errors:</span> {step.errors.length}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Step Progress</span>
                          <span>{Math.round(step.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-sm">
                        <strong>Expected Outcome:</strong> {step.expectedOutcome}
                      </div>

                      {step.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                          <div className="text-red-800 dark:text-red-200 text-sm">
                            <strong>Errors:</strong> {step.errors.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the stats manager
export { WorkflowStatsManager, workflowStatsManager };
