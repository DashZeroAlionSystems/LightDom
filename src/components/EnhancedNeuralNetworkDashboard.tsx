/**
 * Enhanced Neural Network Training Dashboard
 * Modern Material Design 3 dashboard with detailed model analytics and drill-down capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Cpu,
  MemoryStick,
  HardDrive,
  Zap,
  Play,
  Pause,
  Square,
  Settings,
  Eye,
  Download,
  Upload,
  Layers,
  Timer,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  SelectOption,
  FormField,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Spacer,
  Chart,
  Progress
} from '../ui';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
  timestamp: string;
}

interface ModelArchitecture {
  layers: Array<{
    name: string;
    type: string;
    parameters: number;
    inputShape: number[];
    outputShape: number[];
    activation: string;
    details?: any;
  }>;
  totalParameters: number;
  trainableParameters: number;
  modelSize: number;
  inputShape: number[];
  outputShape: number[];
}

interface TrainingJob {
  id: string;
  modelName: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  bestLoss: number;
  bestAccuracy: number;
  startTime: string;
  estimatedTimeRemaining?: number;
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
    disk: number;
  };
  metrics: TrainingMetrics[];
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

interface ModelAnalytics {
  modelName: string;
  architecture: ModelArchitecture;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    confusionMatrix: number[][];
  };
  training: {
    totalTime: number;
    epochs: number;
    finalLoss: number;
    bestEpoch: number;
    earlyStopping: boolean;
  };
  predictions: Array<{
    input: any;
    prediction: any;
    confidence: number;
    actual?: any;
  }>;
}

const EnhancedNeuralNetworkDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'training' | 'models' | 'analytics' | 'resources'>('training');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Mock training jobs data
  const [trainingJobs] = useState<TrainingJob[]>([
    {
      id: '1',
      modelName: 'SEO Content Classifier v2.1',
      status: 'running',
      progress: 65,
      currentEpoch: 13,
      totalEpochs: 20,
      currentLoss: 0.234,
      currentAccuracy: 91.2,
      bestLoss: 0.198,
      bestAccuracy: 93.1,
      startTime: new Date(Date.now() - 7200000).toISOString(),
      estimatedTimeRemaining: 3600000,
      resources: {
        cpu: 78.5,
        memory: 65.2,
        gpu: 92.1,
        disk: 45.8
      },
      metrics: [],
      logs: [
        { timestamp: new Date().toISOString(), level: 'info', message: 'Epoch 13/20 - Loss: 0.234, Accuracy: 91.2%' },
        { timestamp: new Date(Date.now() - 300000).toISOString(), level: 'info', message: 'Model checkpoint saved' },
        { timestamp: new Date(Date.now() - 600000).toISOString(), level: 'warning', message: 'GPU memory usage high' }
      ]
    },
    {
      id: '2',
      modelName: 'Image Recognition Model',
      status: 'completed',
      progress: 100,
      currentEpoch: 50,
      totalEpochs: 50,
      currentLoss: 0.087,
      currentAccuracy: 96.8,
      bestLoss: 0.087,
      bestAccuracy: 96.8,
      startTime: new Date(Date.now() - 14400000).toISOString(),
      resources: {
        cpu: 0,
        memory: 0,
        gpu: 0,
        disk: 0
      },
      metrics: [],
      logs: [
        { timestamp: new Date(Date.now() - 14400000).toISOString(), level: 'info', message: 'Training completed successfully' }
      ]
    },
    {
      id: '3',
      modelName: 'Time Series Predictor',
      status: 'paused',
      progress: 35,
      currentEpoch: 7,
      totalEpochs: 20,
      currentLoss: 0.456,
      currentAccuracy: 78.9,
      bestLoss: 0.412,
      bestAccuracy: 82.1,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      resources: {
        cpu: 45.2,
        memory: 32.8,
        gpu: 0,
        disk: 25.1
      },
      metrics: [],
      logs: [
        { timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'warning', message: 'Training paused by user' }
      ]
    }
  ]);

  // Mock model analytics data
  const [modelAnalytics] = useState<ModelAnalytics>({
    modelName: 'SEO Content Classifier v2.1',
    architecture: {
      layers: [
        {
          name: 'input',
          type: 'Input',
          parameters: 0,
          inputShape: [512],
          outputShape: [512],
          activation: 'none'
        },
        {
          name: 'embedding',
          type: 'Embedding',
          parameters: 256000,
          inputShape: [512],
          outputShape: [512, 128],
          activation: 'none'
        },
        {
          name: 'lstm_1',
          type: 'LSTM',
          parameters: 131584,
          inputShape: [512, 128],
          outputShape: [512, 64],
          activation: 'tanh'
        },
        {
          name: 'dropout_1',
          type: 'Dropout',
          parameters: 0,
          inputShape: [512, 64],
          outputShape: [512, 64],
          activation: 'none'
        },
        {
          name: 'dense_1',
          type: 'Dense',
          parameters: 4160,
          inputShape: [64],
          outputShape: [64],
          activation: 'relu'
        },
        {
          name: 'output',
          type: 'Dense',
          parameters: 195,
          inputShape: [64],
          outputShape: [3],
          activation: 'softmax'
        }
      ],
      totalParameters: 393939,
      trainableParameters: 137939,
      modelSize: 1.5,
      inputShape: [512],
      outputShape: [3]
    },
    performance: {
      accuracy: 93.1,
      precision: 92.8,
      recall: 93.4,
      f1Score: 93.1,
      auc: 0.978,
      confusionMatrix: [
        [4500, 150, 100],
        [120, 4650, 80],
        [90, 110, 4600]
      ]
    },
    training: {
      totalTime: 7200000,
      epochs: 20,
      finalLoss: 0.198,
      bestEpoch: 18,
      earlyStopping: true
    },
    predictions: []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-success';
      case 'completed': return 'text-primary';
      case 'paused': return 'text-warning';
      case 'failed': return 'text-error';
      default: return 'text-on-surface-variant';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTraining = () => (
    <div className="space-y-6">
      {/* Training Jobs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Active Jobs</p>
                <p className="text-2xl font-bold text-on-surface">
                  {trainingJobs.filter(job => job.status === 'running').length}
                </p>
              </div>
              <div className="p-3 bg-primary-container rounded-full">
                <Play className="w-6 h-6 text-on-primary-container" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Completed Today</p>
                <p className="text-2xl font-bold text-on-surface">
                  {trainingJobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-success-container rounded-full">
                <CheckCircle className="w-6 h-6 text-on-success-container" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Avg Accuracy</p>
                <p className="text-2xl font-bold text-on-surface">
                  {Math.round(trainingJobs.reduce((sum, job) => sum + job.currentAccuracy, 0) / trainingJobs.length)}%
                </p>
              </div>
              <div className="p-3 bg-secondary-container rounded-full">
                <Target className="w-6 h-6 text-on-secondary-container" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Training Jobs
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                options={[
                  { value: 'all', label: 'All Jobs' },
                  { value: 'running', label: 'Running' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'paused', label: 'Paused' }
                ]}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-40"
              />
              <Button variant="outlined">
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingJobs
              .filter(job => filter === 'all' || job.status === filter)
              .map((job) => (
                <div
                  key={job.id}
                  className={`p-4 border border-outline rounded-lg cursor-pointer transition-colors ${
                    selectedJob === job.id ? 'bg-primary-container border-primary' : 'hover:bg-surface-container-high'
                  }`}
                  onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium text-on-surface">{job.modelName}</h3>
                        <p className="text-sm text-on-surface-variant">
                          Epoch {job.currentEpoch}/{job.totalEpochs} • {job.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-on-surface">
                        {job.currentAccuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-on-surface-variant">accuracy</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-on-surface-variant">Loss:</span>
                      <span className="ml-1 font-medium">{job.currentLoss.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Best:</span>
                      <span className="ml-1 font-medium">{job.bestAccuracy.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Time:</span>
                      <span className="ml-1 font-medium">
                        {formatDuration((Date.now() - new Date(job.startTime).getTime()) / 1000)}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">GPU:</span>
                      <span className="ml-1 font-medium">{job.resources.gpu.toFixed(1)}%</span>
                    </div>
                  </div>

                  {selectedJob === job.id && (
                    <div className="mt-4 pt-4 border-t border-outline">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Training Metrics</h4>
                          <Chart type="line" className="h-32" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Resource Usage</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">CPU</span>
                              <span className="text-sm font-medium">{job.resources.cpu}%</span>
                            </div>
                            <Progress value={job.resources.cpu} />
                            <div className="flex justify-between">
                              <span className="text-sm">Memory</span>
                              <span className="text-sm font-medium">{job.resources.memory}%</span>
                            </div>
                            <Progress value={job.resources.memory} />
                            <div className="flex justify-between">
                              <span className="text-sm">GPU</span>
                              <span className="text-sm font-medium">{job.resources.gpu}%</span>
                            </div>
                            <Progress value={job.resources.gpu} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Recent Logs</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {job.logs.slice(-5).map((log, index) => (
                            <div key={index} className="text-xs flex items-start gap-2">
                              <span className={`px-1 py-0.5 rounded text-xs ${
                                log.level === 'error' ? 'bg-error-container text-on-error-container' :
                                log.level === 'warning' ? 'bg-warning-container text-on-warning-container' :
                                'bg-surface-container text-on-surface'
                              }`}>
                                {log.level}
                              </span>
                              <span className="text-on-surface-variant">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Model Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outlined" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Model
              </Button>
              <Button variant="outlined" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-surface-container-high rounded-lg">
              <div className="text-2xl font-bold text-on-surface mb-1">
                {modelAnalytics.performance.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-on-surface-variant">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-surface-container-high rounded-lg">
              <div className="text-2xl font-bold text-on-surface mb-1">
                {modelAnalytics.performance.f1Score.toFixed(1)}%
              </div>
              <div className="text-sm text-on-surface-variant">F1 Score</div>
            </div>
            <div className="text-center p-4 bg-surface-container-high rounded-lg">
              <div className="text-2xl font-bold text-on-surface mb-1">
                {modelAnalytics.training.epochs}
              </div>
              <div className="text-sm text-on-surface-variant">Epochs</div>
            </div>
            <div className="text-center p-4 bg-surface-container-high rounded-lg">
              <div className="text-2xl font-bold text-on-surface mb-1">
                {modelAnalytics.architecture.totalParameters.toLocaleString()}
              </div>
              <div className="text-sm text-on-surface-variant">Parameters</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Precision</span>
                  <span className="font-medium">{modelAnalytics.performance.precision.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recall</span>
                  <span className="font-medium">{modelAnalytics.performance.recall.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">AUC Score</span>
                  <span className="font-medium">{modelAnalytics.performance.auc.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Training Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Time</span>
                  <span className="font-medium">{formatDuration(modelAnalytics.training.totalTime / 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Final Loss</span>
                  <span className="font-medium">{modelAnalytics.training.finalLoss.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Best Epoch</span>
                  <span className="font-medium">{modelAnalytics.training.bestEpoch}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Visualization */}
          <div className="mt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Model Architecture
            </h3>
            <div className="space-y-2">
              {modelAnalytics.architecture.layers.map((layer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-container-high rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{layer.name}</div>
                      <div className="text-sm text-on-surface-variant">{layer.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{layer.parameters.toLocaleString()}</div>
                    <div className="text-xs text-on-surface-variant">parameters</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Cpu className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">85%</span>
            </div>
            <h4 className="font-medium">CPU Usage</h4>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <MemoryStick className="w-6 h-6 text-secondary" />
              <span className="text-2xl font-bold">72%</span>
            </div>
            <h4 className="font-medium">Memory Usage</h4>
            <Progress value={72} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="w-6 h-6 text-tertiary" />
              <span className="text-2xl font-bold">91%</span>
            </div>
            <h4 className="font-medium">GPU Usage</h4>
            <Progress value={91} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="w-6 h-6 text-quaternary" />
              <span className="text-2xl font-bold">45%</span>
            </div>
            <h4 className="font-medium">Disk Usage</h4>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resource Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Chart type="area" className="h-64" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Neural Network Training</h1>
            <p className="text-on-surface-variant mt-1">
              Monitor and manage AI model training with real-time analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              onClick={() => setLoading(true)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="filled">
              <Plus className="w-4 h-4 mr-2" />
              Start Training
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 mb-6 bg-surface-container-high p-1 rounded-lg">
          {[
            { key: 'training', label: 'Training', icon: Play },
            { key: 'models', label: 'Models', icon: Brain },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            { key: 'resources', label: 'Resources', icon: Cpu }
          ].map((item) => (
            <Button
              key={item.key}
              variant={activeView === item.key ? 'filled' : 'text'}
              onClick={() => setActiveView(item.key as any)}
              className="flex items-center gap-2"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'training' && renderTraining()}
        {activeView === 'models' && renderModels()}
        {activeView === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart type="line" className="h-96" />
            </CardContent>
          </Card>
        )}
        {activeView === 'resources' && renderResources()}
      </div>
    </div>
  );
};

export default EnhancedNeuralNetworkDashboard;
