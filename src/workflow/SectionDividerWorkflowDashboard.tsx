import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Network,
  ChevronRight,
  ChevronDown,
  Target,
  Brain,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  BarChart3,
  Database,
  Zap,
  Eye,
  Edit3,
  Plus,
  Minus,
  Layers,
  Lightbulb,
  ArrowRight,
  GitBranch,
  Workflow,
  Activity,
  Cpu,
  Search,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Star,
  Award
} from 'lucide-react';

// Section Divider Workflow Types
interface TrainingSection {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  expectedOutcome: string;
  trainingData: {
    type: string;
    count: number;
    quality: number;
    features: string[];
  };
  neuralNetworkConfig: {
    modelType: string;
    layers: number;
    parameters: number;
    expectedAccuracy: number;
    trainingTime: number;
  };
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  currentAccuracy: number;
  bestAccuracy: number;
  trainingHistory: {
    epoch: number;
    accuracy: number;
    loss: number;
    timestamp: Date;
  }[];
  children: TrainingSection[];
  parentId?: string;
  dependencies: string[];
  trustRating: number;
  userFeedback: {
    positive: number;
    negative: number;
    comments: string[];
  };
}

interface WorkflowDivider {
  id: string;
  name: string;
  description: string;
  rootSections: TrainingSection[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  overallProgress: number;
  startTime?: Date;
  endTime?: Date;
  stats: {
    totalSections: number;
    completedSections: number;
    averageAccuracy: number;
    totalTrainingTime: number;
  };
}

class SectionDividerWorkflow {
  private workflows: Map<string, WorkflowDivider> = new Map();
  private sections: Map<string, TrainingSection> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private onUpdateCallbacks: Set<(workflow: WorkflowDivider) => void> = new Set();

  constructor() {
    this.initializeWorkflows();
    this.startWorkflowProcessor();
  }

  private async initializeWorkflows(): Promise<void> {
    console.log('🔀 Initializing Section Divider Workflow...');

    // Create SEO training workflow with hierarchical sections
    const seoWorkflow = this.createWorkflow({
      name: 'SEO Neural Network Training Workflow',
      description: 'Hierarchical training of SEO-related neural networks with section-based organization',
      rootSections: []
    });

    // Create hierarchical sections
    const seoStatsSection = this.createSection({
      name: 'SEO Stats Analysis',
      category: 'SEO',
      subcategory: 'Statistics',
      description: 'Overall SEO performance metrics and statistical analysis',
      expectedOutcome: 'Comprehensive SEO score analysis with 85%+ accuracy prediction',
      trainingData: {
        type: 'seo_metrics',
        count: 50000,
        quality: 0.85,
        features: ['domain_authority', 'backlinks', 'page_speed', 'mobile_friendly']
      },
      neuralNetworkConfig: {
        modelType: 'transformer',
        layers: 6,
        parameters: 5000000,
        expectedAccuracy: 0.87,
        trainingTime: 1800
      }
    });

    const h1TagsSection = this.createSection({
      name: 'H1 Tags Optimization',
      category: 'SEO',
      subcategory: 'H1 Tags',
      description: 'H1 tag analysis, optimization, and neural network training',
      expectedOutcome: 'H1 tag optimization recommendations with 92% accuracy',
      trainingData: {
        type: 'h1_analysis',
        count: 25000,
        quality: 0.90,
        features: ['h1_length', 'h1_keywords', 'h1_uniqueness', 'h1_relevance']
      },
      neuralNetworkConfig: {
        modelType: 'cnn',
        layers: 4,
        parameters: 2000000,
        expectedAccuracy: 0.94,
        trainingTime: 900
      }
    });

    const contentQualitySection = this.createSection({
      name: 'Content Quality Assessment',
      category: 'SEO',
      subcategory: 'Content',
      description: 'Content quality analysis and optimization recommendations',
      expectedOutcome: 'Content quality scores with 89% prediction accuracy',
      trainingData: {
        type: 'content_analysis',
        count: 35000,
        quality: 0.88,
        features: ['word_count', 'readability', 'keyword_density', 'semantic_relevance']
      },
      neuralNetworkConfig: {
        modelType: 'lstm',
        layers: 3,
        parameters: 1500000,
        expectedAccuracy: 0.91,
        trainingTime: 1200
      }
    });

    const technicalSEOSection = this.createSection({
      name: 'Technical SEO Analysis',
      category: 'SEO',
      subcategory: 'Technical',
      description: 'Technical SEO factors and infrastructure optimization',
      expectedOutcome: 'Technical SEO audit with 86% issue detection accuracy',
      trainingData: {
        type: 'technical_seo',
        count: 30000,
        quality: 0.82,
        features: ['crawlability', 'indexability', 'site_speed', 'mobile_usability']
      },
      neuralNetworkConfig: {
        modelType: 'mlp',
        layers: 5,
        parameters: 3000000,
        expectedAccuracy: 0.88,
        trainingTime: 1500
      }
    });

    // Set up parent-child relationships
    h1TagsSection.parentId = seoStatsSection.id;
    contentQualitySection.parentId = seoStatsSection.id;
    technicalSEOSection.parentId = seoStatsSection.id;

    seoStatsSection.children = [h1TagsSection, contentQualitySection, technicalSEOSection];

    // Set dependencies
    h1TagsSection.dependencies = [];
    contentQualitySection.dependencies = [h1TagsSection.id];
    technicalSEOSection.dependencies = [h1TagsSection.id];

    // Update workflow
    seoWorkflow.rootSections = [seoStatsSection];

    console.log('✅ Section Divider Workflow initialized');
  }

  private createWorkflow(workflowData: Omit<WorkflowDivider, 'id' | 'status' | 'overallProgress' | 'stats'>): WorkflowDivider {
    const workflow: WorkflowDivider = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'idle',
      overallProgress: 0,
      stats: {
        totalSections: 0,
        completedSections: 0,
        averageAccuracy: 0,
        totalTrainingTime: 0
      },
      ...workflowData
    };

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  private createSection(sectionData: Omit<TrainingSection, 'id' | 'status' | 'progress' | 'currentAccuracy' | 'bestAccuracy' | 'trainingHistory' | 'children' | 'trustRating' | 'userFeedback'>): TrainingSection {
    const section: TrainingSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0,
      currentAccuracy: 0,
      bestAccuracy: 0,
      trainingHistory: [],
      children: [],
      dependencies: [],
      trustRating: Math.random() * 0.3 + 0.7, // 0.7-1.0
      userFeedback: {
        positive: Math.floor(Math.random() * 50),
        negative: Math.floor(Math.random() * 10),
        comments: []
      },
      ...sectionData
    };

    this.sections.set(section.id, section);
    return section;
  }

  private startWorkflowProcessor(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.processWorkflows();
    }, 1500); // Update every 1.5 seconds
  }

  private async processWorkflows(): Promise<void> {
    for (const [workflowId, workflow] of this.workflows) {
      if (workflow.status === 'running') {
        await this.processWorkflowSections(workflow);
      }
    }
  }

  private async processWorkflowSections(workflow: WorkflowDivider): Promise<void> {
    const allSections = this.getAllSections(workflow);

    // Process sections in dependency order
    for (const section of allSections) {
      if (section.status === 'pending' && this.canStartSection(section)) {
        await this.startSectionTraining(section);
      } else if (section.status === 'training') {
        await this.updateSectionProgress(section);
      }
    }

    // Update workflow stats
    this.updateWorkflowStats(workflow);
  }

  private getAllSections(workflow: WorkflowDivider): TrainingSection[] {
    const sections: TrainingSection[] = [];

    const traverse = (sectionList: TrainingSection[]) => {
      for (const section of sectionList) {
        sections.push(section);
        if (section.children.length > 0) {
          traverse(section.children);
        }
      }
    };

    traverse(workflow.rootSections);
    return sections;
  }

  private canStartSection(section: TrainingSection): boolean {
    // Check if all dependencies are completed
    return section.dependencies.every(depId => {
      const depSection = this.sections.get(depId);
      return depSection?.status === 'completed';
    });
  }

  private async startSectionTraining(section: TrainingSection): Promise<void> {
    section.status = 'training';
    section.progress = 0;
    section.currentAccuracy = 0;
    section.bestAccuracy = 0;

    console.log(`🧠 Starting section training: ${section.name}`);

    // Initialize training history
    section.trainingHistory = [];
  }

  private async updateSectionProgress(section: TrainingSection): Promise<void> {
    const progressIncrement = this.getSectionProgressIncrement(section);
    section.progress = Math.min(100, section.progress + progressIncrement);

    // Simulate accuracy improvement
    const accuracyIncrement = (Math.random() * 2 + 0.5) * (section.neuralNetworkConfig.expectedAccuracy / 100);
    section.currentAccuracy = Math.min(1, section.currentAccuracy + accuracyIncrement);
    section.bestAccuracy = Math.max(section.bestAccuracy, section.currentAccuracy);

    // Add to training history
    section.trainingHistory.push({
      epoch: Math.floor(section.progress / 10), // Simulate epochs
      accuracy: section.currentAccuracy,
      loss: 1 - section.currentAccuracy + (Math.random() * 0.2),
      timestamp: new Date()
    });

    // Keep only last 20 history entries
    if (section.trainingHistory.length > 20) {
      section.trainingHistory = section.trainingHistory.slice(-20);
    }

    // Check if training is complete
    if (section.progress >= 100) {
      await this.completeSectionTraining(section);
    }
  }

  private getSectionProgressIncrement(section: TrainingSection): number {
    // Different sections train at different speeds based on complexity
    const baseSpeed = 2;
    const complexityMultiplier = section.neuralNetworkConfig.parameters / 1000000; // Based on model size
    const speedVariation = Math.random() * 0.5 + 0.75; // 0.75-1.25

    return baseSpeed * complexityMultiplier * speedVariation;
  }

  private async completeSectionTraining(section: TrainingSection): Promise<void> {
    section.status = 'completed';

    // Final accuracy should be close to expected
    const finalAccuracy = section.neuralNetworkConfig.expectedAccuracy / 100;
    section.currentAccuracy = finalAccuracy + (Math.random() * 0.1 - 0.05); // ±5% variation
    section.bestAccuracy = Math.max(section.bestAccuracy, section.currentAccuracy);

    console.log(`✅ Completed section training: ${section.name} (${(section.currentAccuracy * 100).toFixed(1)}% accuracy)`);

    // Update trust rating based on performance
    const accuracyDiff = Math.abs(section.currentAccuracy - finalAccuracy);
    section.trustRating = Math.max(0.1, section.trustRating - (accuracyDiff * 0.5));
  }

  private updateWorkflowStats(workflow: WorkflowDivider): void {
    const allSections = this.getAllSections(workflow);
    const completedSections = allSections.filter(s => s.status === 'completed');
    const trainingSections = allSections.filter(s => s.status === 'training');

    workflow.stats.totalSections = allSections.length;
    workflow.stats.completedSections = completedSections.length;
    workflow.stats.averageAccuracy = allSections.length > 0
      ? allSections.reduce((sum, s) => sum + s.currentAccuracy, 0) / allSections.length
      : 0;
    workflow.stats.totalTrainingTime = allSections.reduce((sum, s) => sum + s.neuralNetworkConfig.trainingTime, 0);

    workflow.overallProgress = (completedSections.length / allSections.length) * 100;

    // Update workflow status
    if (completedSections.length === allSections.length && allSections.length > 0) {
      workflow.status = 'completed';
      workflow.endTime = new Date();
    } else if (trainingSections.length > 0 || completedSections.length > 0) {
      workflow.status = 'running';
    }
  }

  startWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'idle') return false;

    workflow.status = 'running';
    workflow.startTime = new Date();

    console.log(`▶️ Started workflow: ${workflow.name}`);
    return true;
  }

  pauseWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'running') return false;

    workflow.status = 'idle'; // Paused state
    console.log(`⏸️ Paused workflow: ${workflow.name}`);
    return true;
  }

  stopWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !['running', 'idle'].includes(workflow.status)) return false;

    workflow.status = 'failed';
    workflow.endTime = new Date();

    console.log(`⏹️ Stopped workflow: ${workflow.name}`);
    return true;
  }

  restartWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Reset workflow
    workflow.status = 'idle';
    workflow.overallProgress = 0;
    workflow.startTime = undefined;
    workflow.endTime = undefined;

    // Reset all sections
    const allSections = this.getAllSections(workflow);
    allSections.forEach(section => {
      section.status = 'pending';
      section.progress = 0;
      section.currentAccuracy = 0;
      section.bestAccuracy = 0;
      section.trainingHistory = [];
    });

    console.log(`🔄 Restarted workflow: ${workflow.name}`);
    return true;
  }

  onWorkflowUpdate(callback: (workflow: WorkflowDivider) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(workflow: WorkflowDivider): void {
    this.onUpdateCallbacks.forEach(callback => callback(workflow));
  }

  getAllWorkflows(): WorkflowDivider[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(workflowId: string): WorkflowDivider | undefined {
    return this.workflows.get(workflowId);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.workflows.clear();
    this.sections.clear();
    this.onUpdateCallbacks.clear();
    console.log('🗑️ Section Divider Workflow destroyed');
  }
}

// Global workflow instance
const sectionDividerWorkflow = new SectionDividerWorkflow();

// React hooks
export const useSectionDividerWorkflow = () => {
  const [workflows, setWorkflows] = useState<WorkflowDivider[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDivider | null>(null);

  useEffect(() => {
    // Initial load
    setWorkflows(sectionDividerWorkflow.getAllWorkflows());

    // Subscribe to updates
    const unsubscribe = sectionDividerWorkflow.onWorkflowUpdate((updatedWorkflow) => {
      setWorkflows(prev =>
        prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w)
      );
      if (selectedWorkflow?.id === updatedWorkflow.id) {
        setSelectedWorkflow(updatedWorkflow);
      }
    });

    return unsubscribe;
  }, [selectedWorkflow]);

  const startWorkflow = useCallback((workflowId: string) => sectionDividerWorkflow.startWorkflow(workflowId), []);
  const pauseWorkflow = useCallback((workflowId: string) => sectionDividerWorkflow.pauseWorkflow(workflowId), []);
  const stopWorkflow = useCallback((workflowId: string) => sectionDividerWorkflow.stopWorkflow(workflowId), []);
  const restartWorkflow = useCallback((workflowId: string) => sectionDividerWorkflow.restartWorkflow(workflowId), []);

  return {
    workflows,
    selectedWorkflow,
    setSelectedWorkflow,
    startWorkflow,
    pauseWorkflow,
    stopWorkflow,
    restartWorkflow
  };
};

// Section Tree Component
const SectionTreeNode: React.FC<{
  section: TrainingSection;
  level: number;
  expandedSections: Set<string>;
  onToggle: (sectionId: string) => void;
  onViewDetails: (section: TrainingSection) => void;
}> = ({ section, level, expandedSections, onToggle, onViewDetails }) => {
  const isExpanded = expandedSections.has(section.id);
  const hasChildren = section.children.length > 0;

  const statusColors = {
    pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-300',
    training: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-300',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-300'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
          statusColors[section.status as keyof typeof statusColors]
        )}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => onViewDetails(section)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(section.id);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}

        {!hasChildren && <div className="w-6" />}

        {/* Status Icon */}
        {getStatusIcon(section.status)}

        {/* Section Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white">{section.name}</h4>
            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
              {section.category} → {section.subcategory}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">{Math.round(section.trustRating * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span>{section.trainingData.count.toLocaleString()} samples</span>
            <span>{section.neuralNetworkConfig.modelType.toUpperCase()}</span>
            <span>Expected: {(section.neuralNetworkConfig.expectedAccuracy)}% accuracy</span>
            {section.status === 'training' && (
              <span className="text-blue-600">
                Current: {(section.currentAccuracy * 100).toFixed(1)}%
              </span>
            )}
            {section.status === 'completed' && (
              <span className="text-green-600">
                Final: {(section.bestAccuracy * 100).toFixed(1)}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{Math.round(section.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${section.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="text-right text-sm">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-3 w-3 text-green-600" />
            <span>{section.userFeedback.positive}</span>
            <ThumbsDown className="h-3 w-3 text-red-600" />
            <span>{section.userFeedback.negative}</span>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6">
          {section.children.map(child => (
            <SectionTreeNode
              key={child.id}
              section={child}
              level={level + 1}
              expandedSections={expandedSections}
              onToggle={onToggle}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Section Divider Workflow Dashboard
export const SectionDividerWorkflowDashboard: React.FC = () => {
  const {
    workflows,
    selectedWorkflow,
    setSelectedWorkflow,
    startWorkflow,
    pauseWorkflow,
    stopWorkflow,
    restartWorkflow
  } = useSectionDividerWorkflow();

  const [selectedSection, setSelectedSection] = useState<TrainingSection | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showSectionDetails, setShowSectionDetails] = useState(false);

  const statusColors = {
    idle: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    running: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-300'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-5 w-5 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'failed': return <AlertCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleViewSectionDetails = (section: TrainingSection) => {
    setSelectedSection(section);
    setShowSectionDetails(true);
  };

  // Get the first workflow for demo purposes
  const mainWorkflow = workflows[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Network className="h-6 w-6 text-purple-600" />
            Section Divider Workflow
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hierarchical neural network training organized by categories and expected outcomes
          </p>
        </div>

        {mainWorkflow && (
          <div className="flex items-center gap-3">
            <div className={cn(
              'px-3 py-2 rounded-lg flex items-center gap-2',
              statusColors[mainWorkflow.status as keyof typeof statusColors]
            )}>
              {getStatusIcon(mainWorkflow.status)}
              <span className="font-medium capitalize">{mainWorkflow.status}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {Math.round(mainWorkflow.overallProgress)}% Complete
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Overview */}
      {mainWorkflow && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sections</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mainWorkflow.stats.totalSections}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{mainWorkflow.stats.completedSections}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(mainWorkflow.stats.averageAccuracy * 100)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Training Time</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(mainWorkflow.stats.totalTrainingTime / 60)}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Workflow Controls */}
      {mainWorkflow && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Workflow Controls</h3>
          <div className="flex items-center gap-4">
            {mainWorkflow.status === 'idle' && (
              <Button onClick={() => startWorkflow(mainWorkflow.id)} className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Start Training
              </Button>
            )}

            {mainWorkflow.status === 'running' && (
              <Button onClick={() => pauseWorkflow(mainWorkflow.id)} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause Training
              </Button>
            )}

            {['running', 'idle'].includes(mainWorkflow.status) && (
              <Button onClick={() => stopWorkflow(mainWorkflow.id)} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop Training
              </Button>
            )}

            {['completed', 'failed'].includes(mainWorkflow.status) && (
              <Button onClick={() => restartWorkflow(mainWorkflow.id)} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart Training
              </Button>
            )}

            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              Overall Progress: {Math.round(mainWorkflow.overallProgress)}%
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${mainWorkflow.overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Section Hierarchy Tree */}
      {mainWorkflow && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Training Section Hierarchy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Neural network training organized by categories with expected outcomes
            </p>
          </div>

          <div className="p-4 space-y-2">
            {mainWorkflow.rootSections.map(section => (
              <SectionTreeNode
                key={section.id}
                section={section}
                level={0}
                expandedSections={expandedSections}
                onToggle={toggleSectionExpansion}
                onViewDetails={handleViewSectionDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section Details Modal */}
      {showSectionDetails && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedSection.name}</h3>
                <Button onClick={() => setShowSectionDetails(false)} variant="ghost">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Section Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={cn(
                  'p-3 rounded-lg',
                  statusColors[selectedSection.status as keyof typeof statusColors]
                )}>
                  <div className="text-sm font-medium">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedSection.status)}
                    <span className="capitalize">{selectedSection.status}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Progress</div>
                  <div className="text-lg font-bold text-blue-600 mt-1">{Math.round(selectedSection.progress)}%</div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Current Accuracy</div>
                  <div className="text-lg font-bold text-green-600 mt-1">
                    {(selectedSection.currentAccuracy * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Trust Rating</div>
                  <div className="text-lg font-bold text-purple-600 mt-1">
                    {Math.round(selectedSection.trustRating * 100)}%
                  </div>
                </div>
              </div>

              {/* Section Description */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedSection.description}</p>
              </div>

              {/* Expected Outcome */}
              <div>
                <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  Expected Outcome
                </h4>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200">{selectedSection.expectedOutcome}</p>
                </div>
              </div>

              {/* Training Data Info */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Training Data</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm font-medium">Type</div>
                    <div className="text-lg font-bold">{selectedSection.trainingData.type}</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm font-medium">Sample Count</div>
                    <div className="text-lg font-bold">{selectedSection.trainingData.count.toLocaleString()}</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm font-medium">Data Quality</div>
                    <div className="text-lg font-bold">{Math.round(selectedSection.trainingData.quality * 100)}%</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm font-medium">Features</div>
                    <div className="text-lg font-bold">{selectedSection.trainingData.features.length}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Feature List:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSection.trainingData.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Neural Network Configuration */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Neural Network Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Model Type</div>
                    <div className="text-lg font-bold text-purple-600">{selectedSection.neuralNetworkConfig.modelType.toUpperCase()}</div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Layers</div>
                    <div className="text-lg font-bold text-purple-600">{selectedSection.neuralNetworkConfig.layers}</div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Parameters</div>
                    <div className="text-lg font-bold text-purple-600">
                      {(selectedSection.neuralNetworkConfig.parameters / 1000000).toFixed(1)}M
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Expected Accuracy</div>
                    <div className="text-lg font-bold text-purple-600">{selectedSection.neuralNetworkConfig.expectedAccuracy}%</div>
                  </div>
                </div>
              </div>

              {/* Training History */}
              {selectedSection.trainingHistory.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Training History</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded max-h-64 overflow-y-auto">
                    <div className="space-y-2 text-sm">
                      {selectedSection.trainingHistory.slice(-10).map((entry, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Epoch {entry.epoch}:</span>
                          <span>
                            Accuracy: {(entry.accuracy * 100).toFixed(1)}% |
                            Loss: {entry.loss.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* User Feedback */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Community Feedback</h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{selectedSection.userFeedback.positive} Positive</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <span className="font-medium">{selectedSection.userFeedback.negative} Negative</span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Trust Score: {Math.round(selectedSection.trustRating * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the workflow system
export { SectionDividerWorkflow, sectionDividerWorkflow };
