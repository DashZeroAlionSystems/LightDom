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
  Globe,
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
  Brain
} from 'lucide-react';

// Background Crawler System
interface CrawlTask {
  id: string;
  type: 'dataset' | 'training' | 'domain' | 'content' | 'seo';
  name: string;
  target: string; // URL, dataset path, etc.
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  stats: {
    recordsProcessed: number;
    recordsTotal: number;
    avgScore: number;
    errors: number;
    speed: number; // records per second
  };
  results: any[];
  errors: string[];
  category?: string;
  subcategory?: string;
  trustRating?: number;
  lastActivity?: Date;
}

interface CrawlerConfig {
  maxConcurrentTasks: number;
  crawlInterval: number; // ms
  maxRetries: number;
  timeout: number; // ms
  trustThreshold: number;
  autoResume: boolean;
}

class BackgroundCrawlerManager {
  private tasks: Map<string, CrawlTask> = new Map();
  private runningTasks: Set<string> = new Set();
  private config: CrawlerConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private onUpdateCallbacks: Set<(task: CrawlTask) => void> = new Set();

  constructor() {
    this.config = {
      maxConcurrentTasks: 5,
      crawlInterval: 1000,
      maxRetries: 3,
      timeout: 30000,
      trustThreshold: 0.7,
      autoResume: true
    };
    this.initializeCrawler();
  }

  private async initializeCrawler(): Promise<void> {
    console.log('🚀 Initializing Background Crawler System...');

    // Initialize some sample tasks
    this.addTask({
      type: 'dataset',
      name: 'SEO Training Dataset Crawler',
      target: 'https://example.com/seo-data',
      category: 'SEO',
      subcategory: 'H1 Tags'
    });

    this.addTask({
      type: 'training',
      name: 'Neural Network Training Data Miner',
      target: '/api/training-data',
      category: 'ML',
      subcategory: 'Content Optimization'
    });

    this.addTask({
      type: 'domain',
      name: 'Domain Verification Crawler',
      target: 'https://api.domain-verification.com',
      category: 'Verification',
      subcategory: 'Business Hours'
    });

    // Start the crawler loop
    this.startCrawlerLoop();

    console.log('✅ Background Crawler System initialized');
  }

  private startCrawlerLoop(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.processTasks();
    }, this.config.crawlInterval);
  }

  private async processTasks(): Promise<void> {
    // Get pending tasks that can run
    const availableSlots = this.config.maxConcurrentTasks - this.runningTasks.size;
    if (availableSlots <= 0) return;

    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => (b.trustRating || 0) - (a.trustRating || 0)) // Prioritize high trust
      .slice(0, availableSlots);

    for (const task of pendingTasks) {
      await this.startTask(task.id);
    }

    // Update running tasks
    for (const taskId of this.runningTasks) {
      const task = this.tasks.get(taskId);
      if (task) {
        await this.updateTaskProgress(task);
      }
    }
  }

  private async startTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') return;

    console.log(`▶️ Starting crawl task: ${task.name}`);

    task.status = 'running';
    task.startTime = new Date();
    task.progress = 0;
    task.stats = {
      recordsProcessed: 0,
      recordsTotal: Math.floor(Math.random() * 10000) + 1000,
      avgScore: 0,
      errors: 0,
      speed: 0
    };
    task.results = [];
    task.errors = [];

    this.runningTasks.add(taskId);
    this.notifyUpdate(task);
  }

  private async updateTaskProgress(task: CrawlTask): Promise<void> {
    if (task.status !== 'running') return;

    const now = new Date();
    const elapsed = task.startTime ? (now.getTime() - task.startTime.getTime()) / 1000 : 0;

    // Simulate progress
    const progressIncrement = Math.random() * 5 + 1;
    task.progress = Math.min(100, task.progress + progressIncrement);

    // Simulate data processing
    const recordsToProcess = Math.floor(Math.random() * 50 + 10);
    task.stats.recordsProcessed = Math.min(
      task.stats.recordsTotal,
      task.stats.recordsProcessed + recordsToProcess
    );

    // Update stats
    task.stats.speed = elapsed > 0 ? task.stats.recordsProcessed / elapsed : 0;
    task.stats.avgScore = this.calculateAverageScore(task);
    task.lastActivity = now;

    // Simulate occasional errors
    if (Math.random() < 0.05) {
      task.stats.errors++;
      task.errors.push(`Error processing record ${task.stats.recordsProcessed}`);
    }

    // Simulate results
    if (Math.random() < 0.3) {
      task.results.push(this.generateMockResult(task));
    }

    // Check if completed
    if (task.progress >= 100) {
      await this.completeTask(task);
    }

    this.notifyUpdate(task);
  }

  private calculateAverageScore(task: CrawlTask): number {
    // Simulate SEO scores or other metrics based on task type
    switch (task.category) {
      case 'SEO':
        return Math.floor(Math.random() * 30 + 70); // 70-100
      case 'ML':
        return Math.floor(Math.random() * 20 + 80); // 80-100
      case 'Verification':
        return Math.floor(Math.random() * 40 + 60); // 60-100
      default:
        return Math.floor(Math.random() * 50 + 50); // 50-100
    }
  }

  private generateMockResult(task: CrawlTask): any {
    switch (task.category) {
      case 'SEO':
        return {
          url: `https://example.com/page-${Math.floor(Math.random() * 1000)}`,
          h1Tags: Math.floor(Math.random() * 3) + 1,
          seoScore: this.calculateAverageScore(task),
          issues: Math.floor(Math.random() * 5),
          timestamp: new Date().toISOString()
        };
      case 'ML':
        return {
          content: `Sample content ${Math.floor(Math.random() * 1000)}`,
          features: {
            length: Math.floor(Math.random() * 2000) + 500,
            keywords: Math.floor(Math.random() * 20) + 5,
            readability: Math.floor(Math.random() * 50) + 50
          },
          label: Math.random() > 0.5 ? 'optimized' : 'needs_work',
          timestamp: new Date().toISOString()
        };
      case 'Verification':
        return {
          domain: `business${Math.floor(Math.random() * 1000)}.com`,
          yearStarted: 2010 + Math.floor(Math.random() * 14),
          businessHours: '9AM-5PM EST',
          verified: Math.random() > 0.2,
          trustScore: Math.floor(Math.random() * 40 + 60),
          timestamp: new Date().toISOString()
        };
      default:
        return {
          id: Math.floor(Math.random() * 10000),
          data: `Mock data for ${task.category}`,
          timestamp: new Date().toISOString()
        };
    }
  }

  private async completeTask(task: CrawlTask): Promise<void> {
    task.status = 'completed';
    task.endTime = new Date();
    task.duration = task.endTime.getTime() - (task.startTime?.getTime() || 0);

    this.runningTasks.delete(task.id);

    // Calculate final trust rating
    task.trustRating = this.calculateTrustRating(task);

    console.log(`✅ Completed crawl task: ${task.name} (${task.duration}ms)`);
    this.notifyUpdate(task);
  }

  private calculateTrustRating(task: CrawlTask): number {
    const accuracy = task.stats.recordsProcessed / task.stats.recordsTotal;
    const errorRate = task.stats.errors / task.stats.recordsProcessed;
    const scoreQuality = task.stats.avgScore / 100;

    // Weighted formula: 40% accuracy, 30% error rate, 30% score quality
    return (accuracy * 0.4) + ((1 - errorRate) * 0.3) + (scoreQuality * 0.3);
  }

  addTask(taskData: Omit<CrawlTask, 'id' | 'status' | 'progress' | 'stats' | 'results' | 'errors'>): string {
    const task: CrawlTask = {
      id: `crawl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0,
      stats: {
        recordsProcessed: 0,
        recordsTotal: 0,
        avgScore: 0,
        errors: 0,
        speed: 0
      },
      results: [],
      errors: [],
      ...taskData
    };

    this.tasks.set(task.id, task);
    this.notifyUpdate(task);

    console.log(`📝 Added crawl task: ${task.name}`);
    return task.id;
  }

  pauseTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'running') return false;

    task.status = 'paused';
    this.runningTasks.delete(taskId);
    this.notifyUpdate(task);

    console.log(`⏸️ Paused crawl task: ${task.name}`);
    return true;
  }

  resumeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'paused') return false;

    if (this.runningTasks.size < this.config.maxConcurrentTasks) {
      task.status = 'running';
      this.runningTasks.add(taskId);
      this.notifyUpdate(task);

      console.log(`▶️ Resumed crawl task: ${task.name}`);
      return true;
    }

    return false;
  }

  stopTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || (task.status !== 'running' && task.status !== 'paused')) return false;

    task.status = 'failed';
    task.endTime = new Date();
    task.duration = task.endTime.getTime() - (task.startTime?.getTime() || 0);

    this.runningTasks.delete(taskId);
    this.notifyUpdate(task);

    console.log(`⏹️ Stopped crawl task: ${task.name}`);
    return true;
  }

  restartTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // Reset task state
    task.status = 'pending';
    task.progress = 0;
    task.startTime = undefined;
    task.endTime = undefined;
    task.duration = undefined;
    task.stats = {
      recordsProcessed: 0,
      recordsTotal: Math.floor(Math.random() * 10000) + 1000,
      avgScore: 0,
      errors: 0,
      speed: 0
    };
    task.results = [];
    task.errors = [];
    task.lastActivity = undefined;

    this.notifyUpdate(task);

    console.log(`🔄 Restarted crawl task: ${task.name}`);
    return true;
  }

  onTaskUpdate(callback: (task: CrawlTask) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(task: CrawlTask): void {
    this.onUpdateCallbacks.forEach(callback => callback(task));
  }

  getAllTasks(): CrawlTask[] {
    return Array.from(this.tasks.values());
  }

  getTask(taskId: string): CrawlTask | undefined {
    return this.tasks.get(taskId);
  }

  getStats(): {
    totalTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalRecords: number;
    avgScore: number;
    totalErrors: number;
  } {
    const tasks = Array.from(this.tasks.values());

    return {
      totalTasks: tasks.length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      totalRecords: tasks.reduce((sum, t) => sum + t.stats.recordsProcessed, 0),
      avgScore: tasks.length > 0 ? tasks.reduce((sum, t) => sum + t.stats.avgScore, 0) / tasks.length : 0,
      totalErrors: tasks.reduce((sum, t) => sum + t.stats.errors, 0)
    };
  }

  updateConfig(newConfig: Partial<CrawlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Updated crawler configuration:', this.config);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.runningTasks.clear();
    this.tasks.clear();
    this.onUpdateCallbacks.clear();
    console.log('🗑️ Background Crawler System destroyed');
  }
}

// Global crawler instance
const crawlerManager = new BackgroundCrawlerManager();

// React hooks
export const useCrawlerTasks = () => {
  const [tasks, setTasks] = useState<CrawlTask[]>([]);
  const [stats, setStats] = useState(crawlerManager.getStats());

  useEffect(() => {
    // Initial load
    setTasks(crawlerManager.getAllTasks());
    setStats(crawlerManager.getStats());

    // Subscribe to updates
    const unsubscribe = crawlerManager.onTaskUpdate((updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      setStats(crawlerManager.getStats());
    });

    return unsubscribe;
  }, []);

  const addTask = useCallback((taskData: Omit<CrawlTask, 'id' | 'status' | 'progress' | 'stats' | 'results' | 'errors'>) => {
    return crawlerManager.addTask(taskData);
  }, []);

  const pauseTask = useCallback((taskId: string) => crawlerManager.pauseTask(taskId), []);
  const resumeTask = useCallback((taskId: string) => crawlerManager.resumeTask(taskId), []);
  const stopTask = useCallback((taskId: string) => crawlerManager.stopTask(taskId), []);
  const restartTask = useCallback((taskId: string) => crawlerManager.restartTask(taskId), []);

  return {
    tasks,
    stats,
    addTask,
    pauseTask,
    resumeTask,
    stopTask,
    restartTask
  };
};

export const useCrawlerConfig = () => {
  const [config, setConfig] = useState<CrawlerConfig>({
    maxConcurrentTasks: 5,
    crawlInterval: 1000,
    maxRetries: 3,
    timeout: 30000,
    trustThreshold: 0.7,
    autoResume: true
  });

  const updateConfig = useCallback((newConfig: Partial<CrawlerConfig>) => {
    crawlerManager.updateConfig(newConfig);
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return { config, updateConfig };
};

// Background Crawler Dashboard Component
export const BackgroundCrawlerDashboard: React.FC = () => {
  const { tasks, stats, pauseTask, resumeTask, stopTask, restartTask } = useCrawlerTasks();
  const { config, updateConfig } = useCrawlerConfig();
  const [selectedTask, setSelectedTask] = useState<CrawlTask | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    running: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-300',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-300',
    paused: 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Background Crawler System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Parallel async data mining and training data collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowConfig(!showConfig)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Config
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Activity className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-sm font-medium">
              {stats.runningTasks} Running
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Running</p>
              <p className="text-2xl font-bold text-blue-600">{stats.runningTasks}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.avgScore)}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Crawler Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Concurrent Tasks</label>
              <input
                type="number"
                value={config.maxConcurrentTasks}
                onChange={(e) => updateConfig({ maxConcurrentTasks: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Crawl Interval (ms)</label>
              <input
                type="number"
                value={config.crawlInterval}
                onChange={(e) => updateConfig({ crawlInterval: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Timeout (ms)</label>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="5000"
                max="120000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trust Threshold</label>
              <input
                type="number"
                value={config.trustThreshold}
                onChange={(e) => updateConfig({ trustThreshold: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
                max="1"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Retries</label>
              <input
                type="number"
                value={config.maxRetries}
                onChange={(e) => updateConfig({ maxRetries: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
                max="10"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoResume}
                  onChange={(e) => updateConfig({ autoResume: e.target.checked })}
                  className="mr-2"
                />
                Auto Resume
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Active Crawl Tasks</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{task.name}</h4>
                      <span className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        statusColors[task.status as keyof typeof statusColors]
                      )}>
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{task.category} → {task.subcategory}</span>
                      <span>{task.target}</span>
                      {task.trustRating && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {Math.round(task.trustRating * 100)}% trust
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress */}
                  <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{Math.round(task.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      {task.stats.recordsProcessed.toLocaleString()} / {task.stats.recordsTotal.toLocaleString()}
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      Avg: {Math.round(task.stats.avgScore)}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    {task.status === 'running' && (
                      <Button onClick={() => pauseTask(task.id)} size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}

                    {task.status === 'paused' && (
                      <Button onClick={() => resumeTask(task.id)} size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}

                    {(task.status === 'running' || task.status === 'paused') && (
                      <Button onClick={() => stopTask(task.id)} size="sm" variant="outline">
                        <Square className="h-4 w-4" />
                      </Button>
                    )}

                    {(task.status === 'completed' || task.status === 'failed') && (
                      <Button onClick={() => restartTask(task.id)} size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}

                    <Button onClick={() => setSelectedTask(task)} size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedTask.name}</h3>
                <Button onClick={() => setSelectedTask(null)} variant="ghost">
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className={cn(
                    'px-2 py-1 text-sm rounded-full inline-flex items-center gap-1',
                    statusColors[selectedTask.status as keyof typeof statusColors]
                  )}>
                    {getStatusIcon(selectedTask.status)}
                    {selectedTask.status}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Progress</label>
                  <span className="text-lg font-semibold">{Math.round(selectedTask.progress)}%</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                  <span>{selectedTask.category} → {selectedTask.subcategory}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Trust Rating</label>
                  <span>{selectedTask.trustRating ? Math.round(selectedTask.trustRating * 100) : 0}%</span>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">{selectedTask.stats.recordsProcessed.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Records Processed</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">{selectedTask.stats.recordsTotal.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Records</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(selectedTask.stats.avgScore)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-red-600">{selectedTask.stats.errors}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
                  </div>
                </div>
              </div>

              {/* Results Preview */}
              {selectedTask.results.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Recent Results</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded max-h-64 overflow-y-auto">
                    <pre className="text-sm">
                      {JSON.stringify(selectedTask.results.slice(-5), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Errors */}
              {selectedTask.errors.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-red-600">Errors</h4>
                  <div className="space-y-2">
                    {selectedTask.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                        <div className="text-red-800 dark:text-red-200 text-sm">{error}</div>
                      </div>
                    ))}
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

// Export the crawler manager
export { BackgroundCrawlerManager, crawlerManager };
