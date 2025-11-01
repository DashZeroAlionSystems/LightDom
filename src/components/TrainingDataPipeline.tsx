/**
 * Training Data Pipeline Component
 * Visualizes and manages the ML training data collection and validation pipeline
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Brain,
  TrendingUp,
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
  Award,
  Users,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Filter,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/Checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

interface TrainingDataPoint {
  id: string;
  url: string;
  features: Record<string, any>;
  rankingBefore: number;
  rankingAfter: number;
  seoScoreBefore: number;
  seoScoreAfter: number;
  optimizationType: string;
  effectivenessScore: number;
  verified: boolean;
  blockchainProof?: string;
  qualityScore: number;
  createdAt: string;
}

interface ModelMetrics {
  accuracy: number;
  f1Score: number;
  trainingSamples: number;
  featureImportance: Record<string, number>;
  performanceHistory: Array<{
    timestamp: string;
    accuracy: number;
    loss: number;
  }>;
}

interface PipelineStats {
  totalDataPoints: number;
  verifiedDataPoints: number;
  trainingInProgress: boolean;
  currentModelVersion: string;
  lastTrainingDate: string;
  crawlerStatus: 'running' | 'stopped' | 'error';
  blockchainValidations: number;
}

const TrainingDataPipeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pipelineStats, setPipelineStats] = useState<PipelineStats>({
    totalDataPoints: 0,
    verifiedDataPoints: 0,
    trainingInProgress: false,
    currentModelVersion: 'v2.6.9',
    lastTrainingDate: new Date().toISOString(),
    crawlerStatus: 'running',
    blockchainValidations: 0
  });

  const [trainingData, setTrainingData] = useState<TrainingDataPoint[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>({
    accuracy: 0.85,
    f1Score: 0.82,
    trainingSamples: 15420,
    featureImportance: {},
    performanceHistory: []
  });

  const [selectedDataPoint, setSelectedDataPoint] = useState<TrainingDataPoint | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStats(prev => ({
        ...prev,
        totalDataPoints: prev.totalDataPoints + Math.floor(Math.random() * 5),
        blockchainValidations: prev.blockchainValidations + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Poll backend for crawler and system status to keep the pipeline in sync
  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const [healthRes, crawlerRes, quickStatsRes] = await Promise.all([
          fetch('/api/health').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/crawler/status').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/admin/quick-stats').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (!mounted) return;

        setPipelineStats(prev => ({
          ...prev,
          crawlerStatus: crawlerRes?.isRunning ? 'running' : (crawlerRes?.isRunning === false ? 'stopped' : prev.crawlerStatus),
          totalDataPoints: quickStatsRes?.data?.totalOptimizations || prev.totalDataPoints,
          verifiedDataPoints: Math.min(prev.verifiedDataPoints, quickStatsRes?.data?.totalOptimizations || prev.verifiedDataPoints)
        }));

        if (healthRes && healthRes.status === 'ok') {
          // use health data if available
        }
      } catch (err) {
        console.warn('Failed to fetch pipeline status', err);
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Mock training data
  useEffect(() => {
    const mockData: TrainingDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
      id: `data_${i + 1}`,
      url: `https://example${i + 1}.com`,
      features: {
        titleLength: Math.floor(Math.random() * 60) + 30,
        metaDescriptionLength: Math.floor(Math.random() * 160) + 120,
        h1Count: Math.floor(Math.random() * 3) + 1,
        imageCount: Math.floor(Math.random() * 20) + 5,
        internalLinks: Math.floor(Math.random() * 50) + 10,
        externalLinks: Math.floor(Math.random() * 20) + 2,
        loadTime: Math.floor(Math.random() * 3000) + 500,
        mobileFriendly: Math.random() > 0.2,
        schemaMarkup: Math.random() > 0.5
      },
      rankingBefore: Math.floor(Math.random() * 50) + 1,
      rankingAfter: Math.floor(Math.random() * 30) + 1,
      seoScoreBefore: Math.floor(Math.random() * 40) + 40,
      seoScoreAfter: Math.floor(Math.random() * 30) + 60,
      optimizationType: ['meta_tags', 'schema', 'content', 'technical'][Math.floor(Math.random() * 4)],
      effectivenessScore: Math.floor(Math.random() * 40) + 60,
      verified: Math.random() > 0.3,
      blockchainProof: Math.random() > 0.5 ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
      qualityScore: Math.floor(Math.random() * 40) + 60,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    setTrainingData(mockData);
  }, []);

  const filteredData = trainingData.filter(data => {
    const matchesSearch = data.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.optimizationType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = !filterVerified || data.verified;
    return matchesSearch && matchesVerified;
  });

  const PipelineOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Data Points</CardTitle>
          <Database className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{pipelineStats.totalDataPoints.toLocaleString()}</div>
          <p className="text-xs text-blue-600/70">
            +{Math.floor(Math.random() * 10)} this hour
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Data</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{pipelineStats.verifiedDataPoints.toLocaleString()}</div>
          <p className="text-xs text-green-600/70">
            {((pipelineStats.verifiedDataPoints / pipelineStats.totalDataPoints) * 100).toFixed(1)}% verified
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
          <Brain className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{(modelMetrics.accuracy * 100).toFixed(1)}%</div>
          <p className="text-xs text-purple-600/70">
            F1: {(modelMetrics.f1Score * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blockchain Validations</CardTitle>
          <Shield className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{pipelineStats.blockchainValidations.toLocaleString()}</div>
          <p className="text-xs text-orange-600/70">
            Proof-of-Optimization
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const PipelineFlow = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Training Data Pipeline Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Data Collection */}
          <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg flex-1">
            <div className={`p-3 rounded-full ${pipelineStats.crawlerStatus === 'running' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              <Network className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Data Collection</h3>
            <p className="text-sm text-center text-muted-foreground">
              Web crawler collects SEO data from websites
            </p>
            <Badge variant={pipelineStats.crawlerStatus === 'running' ? 'success' : 'secondary'}>
              {pipelineStats.crawlerStatus}
            </Badge>
          </div>

          {/* Feature Extraction */}
          <div className="flex flex-col items-center space-y-2 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg flex-1">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Feature Extraction</h3>
            <p className="text-sm text-center text-muted-foreground">
              Extract 194 SEO features from crawled data
            </p>
            <Badge variant="outline">194 Features</Badge>
          </div>

          {/* Validation */}
          <div className="flex flex-col items-center space-y-2 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg flex-1">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Blockchain Validation</h3>
            <p className="text-sm text-center text-muted-foreground">
              Validate data quality and store on blockchain
            </p>
            <Badge variant="outline">{pipelineStats.blockchainValidations} validations</Badge>
          </div>

          {/* Model Training */}
          <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg flex-1">
            <div className={`p-3 rounded-full ${pipelineStats.trainingInProgress ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Model Training</h3>
            <p className="text-sm text-center text-muted-foreground">
              Train ML models on validated training data
            </p>
            <Badge variant={pipelineStats.trainingInProgress ? 'warning' : 'secondary'}>
              {pipelineStats.trainingInProgress ? 'Training...' : 'Ready'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Data Pipeline</h1>
          <p className="text-muted-foreground">
            Monitor and manage the ML training data collection, validation, and model training pipeline
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Algorithm v{pipelineStats.currentModelVersion}
          </Badge>
          <Button
            variant={pipelineStats.trainingInProgress ? 'secondary' : 'default'}
            onClick={async () => {
              try {
                if (pipelineStats.trainingInProgress) {
                  // Stop training (call shutdown endpoint if available)
                  await fetch('/api/mining/stop', { method: 'POST' }).catch(() => null);
                  setPipelineStats(prev => ({ ...prev, trainingInProgress: false }));
                } else {
                  // Start a training/mining session (demo)
                  await fetch('/api/mining/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: [] }) }).catch(() => null);
                  setPipelineStats(prev => ({ ...prev, trainingInProgress: true }));
                }
              } catch (err) {
                console.warn('Training control failed', err);
              }
            }}
          >
            {pipelineStats.trainingInProgress ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Training
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Training
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Flow</TabsTrigger>
          <TabsTrigger value="data">Training Data</TabsTrigger>
          <TabsTrigger value="metrics">Model Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PipelineOverview />
          <PipelineFlow />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <PipelineFlow />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Collection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Crawler Status</span>
                    <Badge variant={pipelineStats.crawlerStatus === 'running' ? 'success' : 'secondary'}>
                      {pipelineStats.crawlerStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Points Today</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation Rate</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Current Epoch</span>
                      <span>47/100</span>
                    </div>
                    <Progress value={47} />
                  </div>
                  <div className="flex justify-between">
                    <span>Loss</span>
                    <span className="font-medium">0.0234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ETA</span>
                    <span className="font-medium">2h 15m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blockchain Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Pending Validations</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Cost (avg)</span>
                    <span className="font-medium">0.0023 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-medium text-green-600">99.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Training Data Points
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="verified-filter"
                      checked={filterVerified}
                      onCheckedChange={setFilterVerified}
                    />
                    <Label htmlFor="verified-filter">Verified only</Label>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search URLs or optimization types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.slice(0, 10).map((data) => (
                  <div key={data.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{data.url}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{data.optimizationType}</Badge>
                        {data.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {data.blockchainProof && <Shield className="h-4 w-4 text-blue-600" />}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Before:</span>
                        <span className="ml-1 text-red-600">{data.seoScoreBefore}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">After:</span>
                        <span className="ml-1 text-green-600">{data.seoScoreAfter}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Effectiveness:</span>
                        <span className="ml-1 font-medium">{data.effectivenessScore}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quality:</span>
                        <span className="ml-1">{data.qualityScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Accuracy</span>
                    <span className="font-bold">{(modelMetrics.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={modelMetrics.accuracy * 100} />

                  <div className="flex justify-between items-center">
                    <span>F1 Score</span>
                    <span className="font-bold">{(modelMetrics.f1Score * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={modelMetrics.f1Score * 100} />

                  <div className="flex justify-between items-center">
                    <span>Training Samples</span>
                    <span className="font-bold">{modelMetrics.trainingSamples.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Feature Importance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Meta Description Length', importance: 0.85 },
                    { name: 'Title Tag Optimization', importance: 0.78 },
                    { name: 'Schema Markup Presence', importance: 0.72 },
                    { name: 'Internal Link Structure', importance: 0.69 },
                    { name: 'Mobile Friendliness', importance: 0.65 },
                    { name: 'Page Load Speed', importance: 0.58 }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{feature.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={feature.importance * 100} className="w-20" />
                        <span className="text-sm font-medium">{(feature.importance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingDataPipeline;