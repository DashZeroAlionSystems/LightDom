/**
 * DeepSeek Finetuning Dashboard Component
 * 
 * Comprehensive UI for managing the 4-phase DeepSeek finetuning pipeline:
 * - Phase 1: Data Infrastructure
 * - Phase 2: Local Training Setup
 * - Phase 3: Integration
 * - Phase 4: Production Deployment
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Brain,
  Rocket,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  BarChart3,
  Activity,
  Layers,
  Cpu,
  Network,
  Shield,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  FileText,
  GitBranch,
  FlaskConical,
  Server,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Code,
  Wrench,
  TestTube,
  Box
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/Input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

// Types
interface DataQualityReport {
  totalExamples: number;
  passedExamples: number;
  averageScore: number;
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
}

interface TrainingConfig {
  baseModel: string;
  loraRank: number;
  loraAlpha: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  maxSeqLength: number;
}

interface ModelVersion {
  id: string;
  version: string;
  status: 'registered' | 'production' | 'archived';
  createdAt: string;
  metrics?: {
    accuracy: number;
    toolAccuracy: number;
    latency: number;
  };
}

interface ABTest {
  id: string;
  modelA: string;
  modelB: string;
  status: 'active' | 'completed';
  results: {
    modelA: { requests: number; successRate: number };
    modelB: { requests: number; successRate: number };
  };
  winner?: string;
}

interface Deployment {
  id: string;
  modelId: string;
  status: 'deploying' | 'deployed' | 'failed' | 'rolled_back';
  health: 'healthy' | 'unhealthy' | 'unknown';
  startedAt: string;
  completedAt?: string;
}

interface ContinuousTrainingStatus {
  pendingExamples: number;
  trainingThreshold: number;
  readyForTraining: boolean;
  trainingHistory: Array<{
    id: string;
    status: string;
    examples: number;
    startedAt: string;
  }>;
}

interface FinetuningDashboardProps {
  apiBaseUrl?: string;
}

export const FinetuningDashboard: React.FC<FinetuningDashboardProps> = ({
  apiBaseUrl = '/api/finetuning'
}) => {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 1: Data Infrastructure
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [toolExamplesCount, setToolExamplesCount] = useState(0);
  const [datasetStats, setDatasetStats] = useState({ trainSize: 0, validationSize: 0 });

  // Phase 2: Training Setup
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    baseModel: 'deepseek-ai/deepseek-coder-7b-instruct-v1.5',
    loraRank: 16,
    loraAlpha: 32,
    epochs: 3,
    batchSize: 4,
    learningRate: 0.0002,
    maxSeqLength: 4096
  });
  const [trainingScriptReady, setTrainingScriptReady] = useState(false);

  // Phase 3: Integration
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);

  // Phase 4: Production
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [continuousTraining, setContinuousTraining] = useState<ContinuousTrainingStatus>({
    pendingExamples: 0,
    trainingThreshold: 1000,
    readyForTraining: false,
    trainingHistory: []
  });

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setContinuousTraining(data.data.continuousTraining || continuousTraining);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch finetuning status:', err);
    }
  };

  // Phase 1 Actions
  const generateToolExamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/phase1/generate-tool-examples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setToolExamplesCount(data.data.count);
        }
      }
    } catch (err) {
      setError('Failed to generate tool examples');
    } finally {
      setLoading(false);
    }
  };

  const scoreQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      // Demo data for quality scoring
      const demoExamples = [
        {
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Extract data from example.com' },
            { role: 'assistant', content: 'I will extract the data for you.' }
          ]
        }
      ];

      const response = await fetch(`${apiBaseUrl}/phase1/score-quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examples: demoExamples })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQualityReport(data.data);
        }
      }
    } catch (err) {
      setError('Failed to score data quality');
    } finally {
      setLoading(false);
    }
  };

  // Phase 2 Actions
  const generateTrainingScripts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/phase2/generate-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: trainingConfig })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrainingScriptReady(true);
        }
      }
    } catch (err) {
      setError('Failed to generate training scripts');
    } finally {
      setLoading(false);
    }
  };

  const downloadTrainingScript = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/phase2/training-script`);
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'train.py';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to download training script');
    }
  };

  // Phase 3 Actions
  const registerModel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/phase3/register-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'lightdom-deepseek',
          version: `v1.${modelVersions.length}.0`,
          metadata: {
            trainedOn: new Date().toISOString(),
            config: trainingConfig
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setModelVersions([...modelVersions, data.data]);
        }
      }
    } catch (err) {
      setError('Failed to register model');
    } finally {
      setLoading(false);
    }
  };

  const createABTest = async () => {
    if (modelVersions.length < 2) {
      setError('Need at least 2 model versions for A/B testing');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/phase3/ab-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: `ab_test_${Date.now()}`,
          modelA: modelVersions[modelVersions.length - 2].id,
          modelB: modelVersions[modelVersions.length - 1].id,
          trafficSplit: 0.5
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAbTests([...abTests, {
            id: data.data.id,
            modelA: data.data.modelA,
            modelB: data.data.modelB,
            status: 'active',
            results: {
              modelA: { requests: 0, successRate: 0 },
              modelB: { requests: 0, successRate: 0 }
            }
          }]);
        }
      }
    } catch (err) {
      setError('Failed to create A/B test');
    } finally {
      setLoading(false);
    }
  };

  // Phase 4 Actions
  const deployModel = async (modelId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/phase4/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDeployments([...deployments, data.data]);
        }
      }
    } catch (err) {
      setError('Failed to deploy model');
    } finally {
      setLoading(false);
    }
  };

  const addTrainingExample = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/continuous/add-example`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          example: {
            messages: [
              { role: 'user', content: `Example query ${continuousTraining.pendingExamples + 1}` },
              { role: 'assistant', content: `Example response ${continuousTraining.pendingExamples + 1}` }
            ]
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContinuousTraining(data.data);
        }
      }
    } catch (err) {
      console.warn('Failed to add training example');
    }
  };

  // Phase Status Cards
  const PhaseCard = ({ phase, title, description, icon: Icon, isActive, onClick }: {
    phase: 1 | 2 | 3 | 4;
    title: string;
    description: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
          : 'hover:border-gray-400 dark:hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Phase {phase}</Badge>
              <span className="font-semibold text-sm">{title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            DeepSeek Finetuning Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            4-Phase pipeline for training, integrating, and deploying custom DeepSeek models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Pipeline Active
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Phase Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PhaseCard
          phase={1}
          title="Data Infrastructure"
          description="Collect and validate training data"
          icon={Database}
          isActive={activePhase === 1}
          onClick={() => setActivePhase(1)}
        />
        <PhaseCard
          phase={2}
          title="Training Setup"
          description="Configure QLoRA training"
          icon={Cpu}
          isActive={activePhase === 2}
          onClick={() => setActivePhase(2)}
        />
        <PhaseCard
          phase={3}
          title="Integration"
          description="A/B testing and versioning"
          icon={GitBranch}
          isActive={activePhase === 3}
          onClick={() => setActivePhase(3)}
        />
        <PhaseCard
          phase={4}
          title="Production"
          description="Deploy and monitor"
          icon={Rocket}
          isActive={activePhase === 4}
          onClick={() => setActivePhase(4)}
        />
      </div>

      {/* Phase Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Phase {activePhase}: {
              activePhase === 1 ? 'Data Infrastructure' :
              activePhase === 2 ? 'Local Training Setup' :
              activePhase === 3 ? 'Integration' :
              'Production Deployment'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Phase 1: Data Infrastructure */}
          {activePhase === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tool Examples</span>
                      <Wrench className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{toolExamplesCount}</div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full" 
                      onClick={generateToolExamples}
                      disabled={loading}
                    >
                      Generate Examples
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {qualityReport ? `${(qualityReport.averageScore * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full" 
                      onClick={scoreQuality}
                      disabled={loading}
                    >
                      Score Data
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Dataset Split</span>
                      <Layers className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-sm">
                      <div>Train: <span className="font-bold">{datasetStats.trainSize}</span></div>
                      <div>Val: <span className="font-bold">{datasetStats.validationSize}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {qualityReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quality Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{qualityReport.distribution.high}</div>
                        <div className="text-sm text-muted-foreground">High Quality</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{qualityReport.distribution.medium}</div>
                        <div className="text-sm text-muted-foreground">Medium Quality</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{qualityReport.distribution.low}</div>
                        <div className="text-sm text-muted-foreground">Low Quality</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Phase 2: Training Setup */}
          {activePhase === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      QLoRA Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="loraRank">LoRA Rank</Label>
                        <Input
                          id="loraRank"
                          type="number"
                          value={trainingConfig.loraRank}
                          onChange={(e) => setTrainingConfig({
                            ...trainingConfig,
                            loraRank: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="loraAlpha">LoRA Alpha</Label>
                        <Input
                          id="loraAlpha"
                          type="number"
                          value={trainingConfig.loraAlpha}
                          onChange={(e) => setTrainingConfig({
                            ...trainingConfig,
                            loraAlpha: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="epochs">Epochs</Label>
                        <Input
                          id="epochs"
                          type="number"
                          value={trainingConfig.epochs}
                          onChange={(e) => setTrainingConfig({
                            ...trainingConfig,
                            epochs: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="batchSize">Batch Size</Label>
                        <Input
                          id="batchSize"
                          type="number"
                          value={trainingConfig.batchSize}
                          onChange={(e) => setTrainingConfig({
                            ...trainingConfig,
                            batchSize: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="baseModel">Base Model</Label>
                      <Input
                        id="baseModel"
                        value={trainingConfig.baseModel}
                        onChange={(e) => setTrainingConfig({
                          ...trainingConfig,
                          baseModel: e.target.value
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Training Scripts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">train.py</span>
                        <Badge variant={trainingScriptReady ? 'success' : 'secondary'}>
                          {trainingScriptReady ? 'Ready' : 'Not Generated'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        QLoRA training script with 4-bit quantization
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={generateTrainingScripts} disabled={loading} className="flex-1">
                        Generate Scripts
                      </Button>
                      {trainingScriptReady && (
                        <Button variant="outline" onClick={downloadTrainingScript}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Training Parameters Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-muted-foreground">Learning Rate</div>
                      <div className="font-bold">{trainingConfig.learningRate}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-muted-foreground">Max Seq Length</div>
                      <div className="font-bold">{trainingConfig.maxSeqLength}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-muted-foreground">Quantization</div>
                      <div className="font-bold">4-bit NF4</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-muted-foreground">Optimizer</div>
                      <div className="font-bold">Paged AdamW 8bit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Phase 3: Integration */}
          {activePhase === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="h-5 w-5" />
                      Model Versions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {modelVersions.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No models registered yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {modelVersions.map((version) => (
                          <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <div className="font-medium">{version.id}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(version.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant={version.status === 'production' ? 'success' : 'secondary'}>
                              {version.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button onClick={registerModel} disabled={loading} className="w-full">
                      Register New Version
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FlaskConical className="h-5 w-5" />
                      A/B Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {abTests.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No A/B tests running
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {abTests.map((test) => (
                          <div key={test.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{test.id.slice(0, 20)}...</span>
                              <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                                {test.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                Model A: {test.results.modelA.requests} req
                              </div>
                              <div>
                                Model B: {test.results.modelB.requests} req
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button 
                      onClick={createABTest} 
                      disabled={loading || modelVersions.length < 2}
                      className="w-full"
                    >
                      Create A/B Test
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Phase 4: Production */}
          {activePhase === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Deployments</span>
                      <Server className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{deployments.length}</div>
                    <div className="text-xs text-green-600/70">
                      {deployments.filter(d => d.health === 'healthy').length} healthy
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pending Examples</span>
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {continuousTraining.pendingExamples}
                    </div>
                    <Progress 
                      value={(continuousTraining.pendingExamples / continuousTraining.trainingThreshold) * 100} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Training Ready</span>
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {continuousTraining.readyForTraining ? 'Yes' : 'No'}
                    </div>
                    <div className="text-xs text-purple-600/70">
                      Threshold: {continuousTraining.trainingThreshold}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      Active Deployments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deployments.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No active deployments
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {deployments.map((deployment) => (
                          <div key={deployment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <div className="font-medium">{deployment.modelId}</div>
                              <div className="text-xs text-muted-foreground">
                                {deployment.id.slice(0, 15)}...
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={deployment.health === 'healthy' ? 'success' : 'destructive'}>
                                {deployment.health}
                              </Badge>
                              <Badge variant="outline">{deployment.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {modelVersions.length > 0 && (
                      <Button 
                        onClick={() => deployModel(modelVersions[modelVersions.length - 1].id)} 
                        disabled={loading}
                        className="w-full"
                      >
                        Deploy Latest Model
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Continuous Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Pending Examples</span>
                        <span className="font-bold">{continuousTraining.pendingExamples}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Training Threshold</span>
                        <span>{continuousTraining.trainingThreshold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Training Jobs</span>
                        <span>{continuousTraining.trainingHistory.length}</span>
                      </div>
                    </div>
                    <Button onClick={addTrainingExample} className="w-full" variant="outline">
                      Add Sample Example
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinetuningDashboard;
