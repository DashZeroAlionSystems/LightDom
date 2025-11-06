import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  BarChart3,
  Database,
  Brain,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Eye,
  FileText,
  Layers,
  Cpu,
  Network,
  Timer,
  RefreshCw,
  Maximize2,
  Minimize2,
  Monitor,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit3,
  Save,
  X,
  Sliders
} from 'lucide-react';

// Neural Network Training Pipeline Types
interface TrainingRun {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100

  // Training Configuration
  config: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: 'adam' | 'sgd' | 'rmsprop';
    lossFunction: 'mse' | 'categorical_crossentropy' | 'binary_crossentropy';
    metrics: string[];
    validationSplit: number;
  };

  // Training Data
  dataset: {
    name: string;
    size: number;
    features: string[];
    labels: string[];
  };

  // Current Training State
  currentEpoch: number;
  currentBatch: number;
  currentLoss: number;
  currentAccuracy: number;
  currentValLoss: number;
  currentValAccuracy: number;

  // Training History
  history: {
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss: number;
    valAccuracy: number;
    timestamp: Date;
  }[];

  // Performance Metrics
  metrics: {
    totalTime: number;
    avgEpochTime: number;
    peakMemoryUsage: number;
    finalLoss: number;
    finalAccuracy: number;
    finalValLoss: number;
    finalValAccuracy: number;
  };

  // Simulation Data
  simulation: {
    isSimulating: boolean;
    currentTask: string;
    progressDetail: string;
    estimatedTimeRemaining: number;
  };

  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

interface TrainingPipelineConfig {
  maxConcurrentRuns: number;
  simulationSpeed: number; // 1x, 2x, 5x, 10x
  autoSaveInterval: number; // seconds
  enableRealTimeUpdates: boolean;
  gpuAcceleration: boolean;
  memoryLimit: number; // MB
}

class NeuralNetworkTrainingPipeline {
  private runs: Map<string, TrainingRun> = new Map();
  private runningRuns: Set<string> = new Set();
  private config: TrainingPipelineConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private onUpdateCallbacks: Set<(run: TrainingRun) => void> = new Set();

  constructor() {
    this.config = {
      maxConcurrentRuns: 3,
      simulationSpeed: 1,
      autoSaveInterval: 30,
      enableRealTimeUpdates: true,
      gpuAcceleration: false,
      memoryLimit: 2048
    };
    this.initializePipeline();
  }

  private async initializePipeline(): Promise<void> {
    console.log('🚀 Initializing Neural Network Training Pipeline...');

    // Initialize some sample training runs
    this.createTrainingRun({
      name: 'SEO Content Optimizer v2.0',
      description: 'Training neural network to optimize SEO content based on search rankings',
      category: 'SEO',
      tags: ['content', 'optimization', 'search'],
      config: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam',
        lossFunction: 'mse',
        metrics: ['accuracy', 'mae'],
        validationSplit: 0.2
      },
      dataset: {
        name: 'SEO Training Dataset',
        size: 50000,
        features: ['title', 'description', 'content', 'keywords'],
        labels: ['seo_score', 'click_through_rate']
      }
    });

    this.createTrainingRun({
      name: 'Visual UX Predictor',
      description: 'Predicting user experience based on visual design elements',
      category: 'UX',
      tags: ['visual', 'design', 'experience'],
      config: {
        epochs: 50,
        batchSize: 64,
        learningRate: 0.01,
        optimizer: 'rmsprop',
        lossFunction: 'categorical_crossentropy',
        metrics: ['accuracy', 'precision', 'recall'],
        validationSplit: 0.3
      },
      dataset: {
        name: 'UX Design Dataset',
        size: 25000,
        features: ['color_scheme', 'layout', 'typography', 'spacing'],
        labels: ['user_satisfaction', 'conversion_rate']
      }
    });

    // Start the training loop
    this.startTrainingLoop();

    console.log('✅ Neural Network Training Pipeline initialized');
  }

  private startTrainingLoop(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.processTrainingRuns();
    }, 1000 / this.config.simulationSpeed); // Adjust speed based on config
  }

  private async processTrainingRuns(): Promise<void> {
    // Get pending runs that can start
    const availableSlots = this.config.maxConcurrentRuns - this.runningRuns.size;
    if (availableSlots <= 0) return;

    const pendingRuns = Array.from(this.runs.values())
      .filter(run => run.status === 'pending')
      .slice(0, availableSlots);

    for (const run of pendingRuns) {
      await this.startTrainingRun(run.id);
    }

    // Update running training runs
    for (const runId of this.runningRuns) {
      const run = this.runs.get(runId);
      if (run) {
        await this.updateTrainingProgress(run);
      }
    }
  }

  private async startTrainingRun(runId: string): Promise<void> {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'pending') return;

    console.log(`🧠 Starting neural network training: ${run.name}`);

    run.status = 'running';
    run.startTime = new Date();
    run.progress = 0;
    run.currentEpoch = 0;
    run.currentBatch = 0;
    run.currentLoss = Math.random() * 2;
    run.currentAccuracy = Math.random() * 0.3 + 0.1;
    run.currentValLoss = Math.random() * 2.5;
    run.currentValAccuracy = Math.random() * 0.25 + 0.05;

    run.history = [];
    run.metrics = {
      totalTime: 0,
      avgEpochTime: 0,
      peakMemoryUsage: 0,
      finalLoss: 0,
      finalAccuracy: 0,
      finalValLoss: 0,
      finalValAccuracy: 0
    };

    run.simulation = {
      isSimulating: true,
      currentTask: 'Initializing neural network architecture',
      progressDetail: 'Loading TensorFlow.js and model configuration',
      estimatedTimeRemaining: 30
    };

    this.runningRuns.add(runId);
    this.notifyUpdate(run);
  }

  private async updateTrainingProgress(run: TrainingRun): Promise<void> {
    if (run.status !== 'running') return;

    const now = new Date();
    const elapsed = run.startTime ? (now.getTime() - run.startTime.getTime()) / 1000 : 0;

    // Update progress
    const epochProgress = (run.currentEpoch / run.config.epochs) * 100;
    const batchProgress = run.currentBatch / Math.ceil(run.dataset.size / run.config.batchSize);
    run.progress = Math.min(100, epochProgress + (batchProgress * (100 / run.config.epochs)));

    // Update simulation details based on progress
    this.updateSimulationState(run);

    // Simulate training metrics
    this.simulateTrainingMetrics(run);

    // Record history
    if (run.currentBatch % 10 === 0) { // Record every 10 batches
      run.history.push({
        epoch: run.currentEpoch,
        loss: run.currentLoss,
        accuracy: run.currentAccuracy,
        valLoss: run.currentValLoss,
        valAccuracy: run.currentValAccuracy,
        timestamp: now
      });
    }

    // Advance batch/epoch
    run.currentBatch++;
    const batchesPerEpoch = Math.ceil(run.dataset.size / run.config.batchSize);

    if (run.currentBatch >= batchesPerEpoch) {
      run.currentBatch = 0;
      run.currentEpoch++;

      // Epoch complete
      if (run.currentEpoch >= run.config.epochs) {
        await this.completeTrainingRun(run);
        return;
      }
    }

    // Update metrics
    run.metrics.totalTime = elapsed;
    run.metrics.avgEpochTime = elapsed / Math.max(1, run.currentEpoch);
    run.metrics.peakMemoryUsage = Math.max(run.metrics.peakMemoryUsage, Math.random() * 1024 + 512);

    this.notifyUpdate(run);
  }

  private updateSimulationState(run: TrainingRun): void {
    const progress = run.progress;

    if (progress < 5) {
      run.simulation.currentTask = 'Initializing neural network architecture';
      run.simulation.progressDetail = 'Loading TensorFlow.js and configuring layers';
      run.simulation.estimatedTimeRemaining = 25;
    } else if (progress < 15) {
      run.simulation.currentTask = 'Preparing training data';
      run.simulation.progressDetail = `Preprocessing ${run.dataset.size.toLocaleString()} samples`;
      run.simulation.estimatedTimeRemaining = 20;
    } else if (progress < 25) {
      run.simulation.currentTask = 'Compiling model';
      run.simulation.progressDetail = `Setting up ${run.config.optimizer} optimizer and loss function`;
      run.simulation.estimatedTimeRemaining = 15;
    } else if (progress < 50) {
      run.simulation.currentTask = 'Training neural network';
      run.simulation.progressDetail = `Epoch ${run.currentEpoch + 1}/${run.config.epochs} - Batch ${run.currentBatch + 1}`;
      run.simulation.estimatedTimeRemaining = Math.max(1, Math.floor((100 - progress) / 2));
    } else if (progress < 75) {
      run.simulation.currentTask = 'Fine-tuning parameters';
      run.simulation.progressDetail = 'Adjusting learning rate and optimizing weights';
      run.simulation.estimatedTimeRemaining = Math.max(1, Math.floor((100 - progress) / 3));
    } else if (progress < 90) {
      run.simulation.currentTask = 'Running validation';
      run.simulation.progressDetail = 'Testing model performance on validation set';
      run.simulation.estimatedTimeRemaining = Math.max(1, Math.floor((100 - progress) / 4));
    } else {
      run.simulation.currentTask = 'Finalizing training';
      run.simulation.progressDetail = 'Saving model weights and generating reports';
      run.simulation.estimatedTimeRemaining = 1;
    }
  }

  private simulateTrainingMetrics(run: TrainingRun): void {
    // Simulate realistic training curves
    const epoch = run.currentEpoch;
    const totalEpochs = run.config.epochs;

    // Loss should generally decrease over time
    const baseLoss = 2.0;
    const lossImprovement = (epoch / totalEpochs) * 1.5;
    const noise = (Math.random() - 0.5) * 0.2;
    run.currentLoss = Math.max(0.1, baseLoss - lossImprovement + noise);

    // Accuracy should generally increase
    const baseAccuracy = 0.1;
    const accuracyImprovement = (epoch / totalEpochs) * 0.7;
    const accuracyNoise = (Math.random() - 0.5) * 0.05;
    run.currentAccuracy = Math.min(0.95, baseAccuracy + accuracyImprovement + accuracyNoise);

    // Validation metrics (slightly different from training)
    run.currentValLoss = run.currentLoss * (0.8 + Math.random() * 0.4);
    run.currentValAccuracy = run.currentAccuracy * (0.9 + Math.random() * 0.2);
  }

  private async completeTrainingRun(run: TrainingRun): Promise<void> {
    run.status = 'completed';
    run.endTime = new Date();
    run.duration = run.endTime.getTime() - (run.startTime?.getTime() || 0);
    run.progress = 100;

    // Final metrics
    run.metrics.finalLoss = run.currentLoss;
    run.metrics.finalAccuracy = run.currentAccuracy;
    run.metrics.finalValLoss = run.currentValLoss;
    run.metrics.finalValAccuracy = run.currentValAccuracy;

    run.simulation.isSimulating = false;
    run.simulation.currentTask = 'Training completed';
    run.simulation.progressDetail = 'Model saved and ready for inference';
    run.simulation.estimatedTimeRemaining = 0;

    this.runningRuns.delete(run.id);

    console.log(`✅ Completed neural network training: ${run.name} (${run.duration}ms)`);
    this.notifyUpdate(run);
  }

  createTrainingRun(runData: Omit<TrainingRun, 'id' | 'status' | 'progress' | 'currentEpoch' | 'currentBatch' | 'currentLoss' | 'currentAccuracy' | 'currentValLoss' | 'currentValAccuracy' | 'history' | 'metrics' | 'simulation'>): string {
    const run: TrainingRun = {
      id: `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0,
      currentEpoch: 0,
      currentBatch: 0,
      currentLoss: 0,
      currentAccuracy: 0,
      currentValLoss: 0,
      currentValAccuracy: 0,
      history: [],
      metrics: {
        totalTime: 0,
        avgEpochTime: 0,
        peakMemoryUsage: 0,
        finalLoss: 0,
        finalAccuracy: 0,
        finalValLoss: 0,
        finalValAccuracy: 0
      },
      simulation: {
        isSimulating: false,
        currentTask: '',
        progressDetail: '',
        estimatedTimeRemaining: 0
      },
      ...runData
    };

    this.runs.set(run.id, run);
    this.notifyUpdate(run);

    console.log(`📝 Created training run: ${run.name}`);
    return run.id;
  }

  pauseTrainingRun(runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'running') return false;

    run.status = 'paused';
    run.simulation.currentTask = 'Training paused';
    run.simulation.progressDetail = 'Resume to continue training';
    this.runningRuns.delete(runId);
    this.notifyUpdate(run);

    console.log(`⏸️ Paused training run: ${run.name}`);
    return true;
  }

  resumeTrainingRun(runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'paused') return false;

    if (this.runningRuns.size < this.config.maxConcurrentRuns) {
      run.status = 'running';
      run.simulation.currentTask = 'Resuming training';
      run.simulation.progressDetail = `Continuing from epoch ${run.currentEpoch + 1}`;
      this.runningRuns.add(runId);
      this.notifyUpdate(run);

      console.log(`▶️ Resumed training run: ${run.name}`);
      return true;
    }

    return false;
  }

  stopTrainingRun(runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run || (run.status !== 'running' && run.status !== 'paused')) return false;

    run.status = 'failed';
    run.endTime = new Date();
    run.duration = run.endTime.getTime() - (run.startTime?.getTime() || 0);
    run.error = 'Training manually stopped';

    run.simulation.isSimulating = false;
    run.simulation.currentTask = 'Training stopped';
    run.simulation.progressDetail = 'Training was manually terminated';

    this.runningRuns.delete(runId);
    this.notifyUpdate(run);

    console.log(`⏹️ Stopped training run: ${run.name}`);
    return true;
  }

  restartTrainingRun(runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run) return false;

    // Reset run state
    run.status = 'pending';
    run.progress = 0;
    run.currentEpoch = 0;
    run.currentBatch = 0;
    run.currentLoss = 0;
    run.currentAccuracy = 0;
    run.currentValLoss = 0;
    run.currentValAccuracy = 0;
    run.history = [];
    run.startTime = undefined;
    run.endTime = undefined;
    run.duration = undefined;
    run.error = undefined;

    run.simulation = {
      isSimulating: false,
      currentTask: 'Ready to restart',
      progressDetail: 'Training run reset and ready to begin',
      estimatedTimeRemaining: 0
    };

    this.notifyUpdate(run);

    console.log(`🔄 Restarted training run: ${run.name}`);
    return true;
  }

  updateTrainingConfig(runId: string, config: Partial<TrainingRun['config']>): boolean {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'pending') return false;

    run.config = { ...run.config, ...config };
    this.notifyUpdate(run);

    console.log(`⚙️ Updated training config for: ${run.name}`);
    return true;
  }

  onRunUpdate(callback: (run: TrainingRun) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(run: TrainingRun): void {
    this.onUpdateCallbacks.forEach(callback => callback(run));
  }

  getAllRuns(): TrainingRun[] {
    return Array.from(this.runs.values());
  }

  getRun(runId: string): TrainingRun | undefined {
    return this.runs.get(runId);
  }

  getStats(): {
    totalRuns: number;
    runningRuns: number;
    completedRuns: number;
    failedRuns: number;
    avgAccuracy: number;
    totalTrainingTime: number;
  } {
    const runs = Array.from(this.runs.values());

    return {
      totalRuns: runs.length,
      runningRuns: runs.filter(r => r.status === 'running').length,
      completedRuns: runs.filter(r => r.status === 'completed').length,
      failedRuns: runs.filter(r => r.status === 'failed').length,
      avgAccuracy: runs.length > 0 ? runs.reduce((sum, r) => sum + r.currentAccuracy, 0) / runs.length : 0,
      totalTrainingTime: runs.reduce((sum, r) => sum + (r.metrics.totalTime || 0), 0)
    };
  }

  updateConfig(newConfig: Partial<TrainingPipelineConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart loop if speed changed
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.startTrainingLoop();
    }

    console.log('⚙️ Updated training pipeline configuration:', this.config);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.runningRuns.clear();
    this.runs.clear();
    this.onUpdateCallbacks.clear();
    console.log('🗑️ Neural Network Training Pipeline destroyed');
  }
}

// Global training pipeline instance
const trainingPipeline = new NeuralNetworkTrainingPipeline();

// React hooks
export const useTrainingRuns = () => {
  const [runs, setRuns] = useState<TrainingRun[]>([]);
  const [stats, setStats] = useState(trainingPipeline.getStats());

  useEffect(() => {
    // Initial load
    setRuns(trainingPipeline.getAllRuns());
    setStats(trainingPipeline.getStats());

    // Subscribe to updates
    const unsubscribe = trainingPipeline.onRunUpdate((updatedRun) => {
      setRuns(prev => prev.map(r => r.id === updatedRun.id ? updatedRun : r));
      setStats(trainingPipeline.getStats());
    });

    return unsubscribe;
  }, []);

  const createRun = useCallback((runData: Omit<TrainingRun, 'id' | 'status' | 'progress' | 'currentEpoch' | 'currentBatch' | 'currentLoss' | 'currentAccuracy' | 'currentValLoss' | 'currentValAccuracy' | 'history' | 'metrics' | 'simulation'>) => {
    return trainingPipeline.createTrainingRun(runData);
  }, []);

  const pauseRun = useCallback((runId: string) => trainingPipeline.pauseTrainingRun(runId), []);
  const resumeRun = useCallback((runId: string) => trainingPipeline.resumeTrainingRun(runId), []);
  const stopRun = useCallback((runId: string) => trainingPipeline.stopTrainingRun(runId), []);
  const restartRun = useCallback((runId: string) => trainingPipeline.restartTrainingRun(runId), []);
  const updateConfig = useCallback((runId: string, config: Partial<TrainingRun['config']>) => trainingPipeline.updateTrainingConfig(runId, config), []);

  return {
    runs,
    stats,
    createRun,
    pauseRun,
    resumeRun,
    stopRun,
    restartRun,
    updateConfig
  };
};

export const useTrainingConfig = () => {
  const [config, setConfig] = useState<TrainingPipelineConfig>({
    maxConcurrentRuns: 3,
    simulationSpeed: 1,
    autoSaveInterval: 30,
    enableRealTimeUpdates: true,
    gpuAcceleration: false,
    memoryLimit: 2048
  });

  const updateConfig = useCallback((newConfig: Partial<TrainingPipelineConfig>) => {
    trainingPipeline.updateConfig(newConfig);
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return { config, updateConfig };
};

// Training Pipeline Dashboard Component
export const TrainingPipelineDashboard: React.FC = () => {
  const { runs, stats, pauseRun, resumeRun, stopRun, restartRun, updateConfig } = useTrainingRuns();
  const { config, updateConfig: updatePipelineConfig } = useTrainingConfig();
  const [selectedRun, setSelectedRun] = useState<TrainingRun | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRunData, setNewRunData] = useState({
    name: '',
    description: '',
    category: 'SEO',
    tags: '',
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam' as const,
    lossFunction: 'mse' as const,
    metrics: 'accuracy,mae',
    validationSplit: 0.2
  });

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    running: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    paused: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-300'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateRun = () => {
    const runData = {
      name: newRunData.name,
      description: newRunData.description,
      category: newRunData.category,
      tags: newRunData.tags.split(',').map(t => t.trim()),
      config: {
        epochs: newRunData.epochs,
        batchSize: newRunData.batchSize,
        learningRate: newRunData.learningRate,
        optimizer: newRunData.optimizer,
        lossFunction: newRunData.lossFunction,
        metrics: newRunData.metrics.split(',').map(m => m.trim()),
        validationSplit: newRunData.validationSplit
      },
      dataset: {
        name: `${newRunData.category} Training Dataset`,
        size: Math.floor(Math.random() * 50000) + 10000,
        features: ['feature1', 'feature2', 'feature3'],
        labels: ['label1', 'label2']
      }
    };

    trainingPipeline.createTrainingRun(runData);
    setShowCreateForm(false);
    setNewRunData({
      name: '',
      description: '',
      category: 'SEO',
      tags: '',
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'adam',
      lossFunction: 'mse',
      metrics: 'accuracy,mae',
      validationSplit: 0.2
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Neural Network Training Pipeline
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered training orchestration with real-time simulation and controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Training Run
          </Button>

          <Button
            onClick={() => setShowConfig(!showConfig)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Config
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Brain className="h-4 w-4 text-purple-600 animate-pulse" />
            <span className="text-sm font-medium">
              {stats.runningRuns} Training
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Runs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRuns}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Training</p>
              <p className="text-2xl font-bold text-purple-600">{stats.runningRuns}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedRuns}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(stats.avgAccuracy * 100)}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Training Pipeline Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Concurrent Runs</label>
              <select
                value={config.maxConcurrentRuns}
                onChange={(e) => updatePipelineConfig({ maxConcurrentRuns: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Simulation Speed</label>
              <select
                value={config.simulationSpeed}
                onChange={(e) => updatePipelineConfig({ simulationSpeed: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              >
                <option value="1">1x (Normal)</option>
                <option value="2">2x (Fast)</option>
                <option value="5">5x (Very Fast)</option>
                <option value="10">10x (Ultra Fast)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Memory Limit (MB)</label>
              <input
                type="number"
                value={config.memoryLimit}
                onChange={(e) => updatePipelineConfig({ memoryLimit: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="512"
                max="8192"
                step="512"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Auto Save Interval (s)</label>
              <input
                type="number"
                value={config.autoSaveInterval}
                onChange={(e) => updatePipelineConfig({ autoSaveInterval: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="10"
                max="300"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableRealTimeUpdates}
                  onChange={(e) => updatePipelineConfig({ enableRealTimeUpdates: e.target.checked })}
                  className="mr-2"
                />
                Real-time Updates
              </label>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.gpuAcceleration}
                  onChange={(e) => updatePipelineConfig({ gpuAcceleration: e.target.checked })}
                  className="mr-2"
                />
                GPU Acceleration
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Training Runs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Neural Network Training Runs</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {runs.map((run) => (
            <div key={run.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(run.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{run.name}</h4>
                      <span className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        statusColors[run.status as keyof typeof statusColors]
                      )}>
                        {run.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{run.category}</span>
                      <span>{run.tags.join(', ')}</span>
                      {run.simulation.isSimulating && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Activity className="h-3 w-3 animate-pulse" />
                          {run.simulation.currentTask}
                        </span>
                      )}
                    </div>

                    {/* Simulation Progress Detail */}
                    {run.simulation.isSimulating && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        {run.simulation.progressDetail}
                        {run.simulation.estimatedTimeRemaining > 0 && (
                          <span className="ml-2">
                            (~{run.simulation.estimatedTimeRemaining}s remaining)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Training Metrics */}
                  <div className="text-right text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      Epoch {run.currentEpoch}/{run.config.epochs}
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      Loss: {run.currentLoss.toFixed(3)}
                    </div>
                    <div className="text-green-600">
                      Acc: {(run.currentAccuracy * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{Math.round(run.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${run.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    {run.status === 'running' && (
                      <Button onClick={() => pauseRun(run.id)} size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}

                    {run.status === 'paused' && (
                      <Button onClick={() => resumeRun(run.id)} size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}

                    {(run.status === 'running' || run.status === 'paused') && (
                      <Button onClick={() => stopRun(run.id)} size="sm" variant="outline">
                        <Square className="h-4 w-4" />
                      </Button>
                    )}

                    {(run.status === 'completed' || run.status === 'failed') && (
                      <Button onClick={() => restartRun(run.id)} size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}

                    <Button onClick={() => setSelectedRun(run)} size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Training Run Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Create New Training Run</h3>
                <Button onClick={() => setShowCreateForm(false)} variant="ghost">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newRunData.name}
                    onChange={(e) => setNewRunData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="Training run name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newRunData.category}
                    onChange={(e) => setNewRunData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="SEO">SEO</option>
                    <option value="UX">UX</option>
                    <option value="Content">Content</option>
                    <option value="Analytics">Analytics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newRunData.description}
                  onChange={(e) => setNewRunData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Describe the training objective"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newRunData.tags}
                  onChange={(e) => setNewRunData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="content, optimization, search"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Epochs</label>
                  <input
                    type="number"
                    value={newRunData.epochs}
                    onChange={(e) => setNewRunData(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded"
                    min="10"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Batch Size</label>
                  <input
                    type="number"
                    value={newRunData.batchSize}
                    onChange={(e) => setNewRunData(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded"
                    min="8"
                    max="512"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Learning Rate</label>
                  <input
                    type="number"
                    value={newRunData.learningRate}
                    onChange={(e) => setNewRunData(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                    className="w-full p-2 border rounded"
                    min="0.0001"
                    max="1"
                    step="0.0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Optimizer</label>
                  <select
                    value={newRunData.optimizer}
                    onChange={(e) => setNewRunData(prev => ({ ...prev, optimizer: e.target.value as any }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="adam">Adam</option>
                    <option value="sgd">SGD</option>
                    <option value="rmsprop">RMSprop</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleCreateRun} className="bg-purple-600 hover:bg-purple-700">
                  Create Training Run
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Run Details Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedRun.name}</h3>
                <Button onClick={() => setSelectedRun(null)} variant="ghost">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Run Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className={cn(
                    'px-2 py-1 text-sm rounded-full inline-flex items-center gap-1',
                    statusColors[selectedRun.status as keyof typeof statusColors]
                  )}>
                    {getStatusIcon(selectedRun.status)}
                    {selectedRun.status}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Progress</label>
                  <span className="text-lg font-semibold">{Math.round(selectedRun.progress)}%</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                  <span>{selectedRun.category}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Current Epoch</label>
                  <span>{selectedRun.currentEpoch}/{selectedRun.config.epochs}</span>
                </div>
              </div>

              {/* Training Metrics */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Current Training Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-red-600">{selectedRun.currentLoss.toFixed(3)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Training Loss</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">{(selectedRun.currentAccuracy * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Training Accuracy</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-orange-600">{selectedRun.currentValLoss.toFixed(3)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Validation Loss</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">{(selectedRun.currentValAccuracy * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Validation Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Training Configuration */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Training Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Epochs:</span> {selectedRun.config.epochs}
                  </div>
                  <div>
                    <span className="font-medium">Batch Size:</span> {selectedRun.config.batchSize}
                  </div>
                  <div>
                    <span className="font-medium">Learning Rate:</span> {selectedRun.config.learningRate}
                  </div>
                  <div>
                    <span className="font-medium">Optimizer:</span> {selectedRun.config.optimizer}
                  </div>
                  <div>
                    <span className="font-medium">Loss:</span> {selectedRun.config.lossFunction}
                  </div>
                  <div>
                    <span className="font-medium">Metrics:</span> {selectedRun.config.metrics.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Validation Split:</span> {(selectedRun.config.validationSplit * 100)}%
                  </div>
                  <div>
                    <span className="font-medium">Dataset Size:</span> {selectedRun.dataset.size.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Simulation Status */}
              {selectedRun.simulation.isSimulating && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Simulation Status</h4>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
                      <span className="font-medium text-purple-800 dark:text-purple-200">
                        {selectedRun.simulation.currentTask}
                      </span>
                    </div>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      {selectedRun.simulation.progressDetail}
                    </p>
                    {selectedRun.simulation.estimatedTimeRemaining > 0 && (
                      <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">
                        Estimated time remaining: {selectedRun.simulation.estimatedTimeRemaining} seconds
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Training History Chart */}
              {selectedRun.history.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Training History</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded max-h-64 overflow-y-auto">
                    <div className="space-y-2 text-sm">
                      {selectedRun.history.slice(-10).map((entry, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Epoch {entry.epoch}:</span>
                          <span>
                            Loss: {entry.loss.toFixed(3)} |
                            Acc: {(entry.accuracy * 100).toFixed(1)}% |
                            Val Loss: {entry.valLoss.toFixed(3)} |
                            Val Acc: {(entry.valAccuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {selectedRun.status === 'completed' && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Final Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <div className="text-xl font-bold text-green-600">{selectedRun.metrics.finalAccuracy.toFixed(3)}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Final Accuracy</div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      <div className="text-xl font-bold text-red-600">{selectedRun.metrics.finalLoss.toFixed(3)}</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Final Loss</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <div className="text-xl font-bold text-blue-600">{Math.round(selectedRun.metrics.totalTime)}s</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Total Time</div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                      <div className="text-xl font-bold text-purple-600">{Math.round(selectedRun.metrics.peakMemoryUsage)}MB</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Peak Memory</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the training pipeline
export { NeuralNetworkTrainingPipeline, trainingPipeline };
