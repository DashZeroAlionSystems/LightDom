import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Brain,
  Database,
  Play,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Settings,
  Download,
  Upload,
} from 'lucide-react';
import axios from 'axios';

interface TrainingConfig {
  modelName: string;
  modelVersion: string;
  algorithm: 'gradient_boosting' | 'neural_network' | 'random_forest' | 'ensemble';
  hyperparameters: {
    learningRate: number;
    nEstimators: number;
    maxDepth: number;
    minSamplesLeaf: number;
  };
  targetMetric: 'ndcg' | 'map' | 'precision' | 'recall';
}

interface SEOModel {
  id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  status: string;
  accuracy: number;
  f1_score: number;
  training_samples: number;
  deployed_at?: string;
  created_at: string;
}

interface TrainingStats {
  total_training_records: number;
  verified_records: number;
  avg_effectiveness: number;
  total_records: number;
  avg_seo_score: number;
  unique_urls: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const SEOModelTrainingPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    modelName: 'seo-ranking-model',
    modelVersion: '1.0.0',
    algorithm: 'gradient_boosting',
    hyperparameters: {
      learningRate: 0.1,
      nEstimators: 100,
      maxDepth: 6,
      minSamplesLeaf: 1,
    },
    targetMetric: 'ndcg',
  });

  // Fetch all models
  const { data: models, isLoading: modelsLoading } = useQuery<SEOModel[]>({
    queryKey: ['seoModels'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/seo/models`);
      return response.data.models || [];
    },
    refetchInterval: 10000,
  });

  // Fetch training stats
  const { data: stats, isLoading: statsLoading } = useQuery<TrainingStats>({
    queryKey: ['trainingStats'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/seo/training/stats`);
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Start training mutation
  const trainModelMutation = useMutation({
    mutationFn: async (config: TrainingConfig) => {
      const response = await axios.post(`${API_BASE_URL}/api/seo/models/train`, config);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Model training started successfully!');
      queryClient.invalidateQueries({ queryKey: ['seoModels'] });
    },
    onError: (error: any) => {
      toast.error(`Training failed: ${error.response?.data?.error || error.message}`);
    },
  });

  // Deploy model mutation
  const deployModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await axios.post(`${API_BASE_URL}/api/seo/models/${modelId}/deploy`, {
        contributors: [],
        shares: [],
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Model deployed successfully!');
      queryClient.invalidateQueries({ queryKey: ['seoModels'] });
    },
    onError: (error: any) => {
      toast.error(`Deployment failed: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleStartTraining = () => {
    if (!trainingConfig.modelName || !trainingConfig.modelVersion) {
      toast.error('Please provide model name and version');
      return;
    }
    trainModelMutation.mutate(trainingConfig);
  };

  const handleDeployModel = (modelId: string) => {
    deployModelMutation.mutate(modelId);
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { color: string; icon: React.ReactNode } } = {
      active: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle className="w-3 h-3" /> },
      training: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      testing: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <AlertCircle className="w-3 h-3" /> },
      archived: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: <Clock className="w-3 h-3" /> },
    };

    const badge = badges[status] || badges.testing;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${badge.color}`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            SEO Model Training
          </h1>
          <p className="text-muted-foreground">
            Train and deploy ML models for SEO ranking prediction and optimization
          </p>
        </div>
        <button
          onClick={handleStartTraining}
          disabled={trainModelMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {trainModelMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Start Training
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Training Records</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? '...' : stats?.total_training_records?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats?.verified_records || 0} verified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg SEO Score</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? '...' : (stats?.avg_seo_score || 0).toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Out of 100
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Models</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">
            {modelsLoading ? '...' : models?.filter(m => m.status === 'active').length || '0'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {models?.length || 0} total models
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Effectiveness</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? '...' : (stats?.avg_effectiveness || 0).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Average score
          </div>
        </div>
      </div>

      {/* Training Configuration */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Training Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Model Name</label>
            <input
              type="text"
              value={trainingConfig.modelName}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, modelName: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model Version</label>
            <input
              type="text"
              value={trainingConfig.modelVersion}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, modelVersion: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Algorithm</label>
            <select
              value={trainingConfig.algorithm}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, algorithm: e.target.value as any })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="gradient_boosting">Gradient Boosting</option>
              <option value="neural_network">Neural Network</option>
              <option value="random_forest">Random Forest</option>
              <option value="ensemble">Ensemble</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Metric</label>
            <select
              value={trainingConfig.targetMetric}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, targetMetric: e.target.value as any })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ndcg">NDCG (Normalized Discounted Cumulative Gain)</option>
              <option value="map">MAP (Mean Average Precision)</option>
              <option value="precision">Precision</option>
              <option value="recall">Recall</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Learning Rate</label>
            <input
              type="number"
              step="0.01"
              value={trainingConfig.hyperparameters.learningRate}
              onChange={(e) => setTrainingConfig({
                ...trainingConfig,
                hyperparameters: { ...trainingConfig.hyperparameters, learningRate: parseFloat(e.target.value) }
              })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">N Estimators</label>
            <input
              type="number"
              value={trainingConfig.hyperparameters.nEstimators}
              onChange={(e) => setTrainingConfig({
                ...trainingConfig,
                hyperparameters: { ...trainingConfig.hyperparameters, nEstimators: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Depth</label>
            <input
              type="number"
              value={trainingConfig.hyperparameters.maxDepth}
              onChange={(e) => setTrainingConfig({
                ...trainingConfig,
                hyperparameters: { ...trainingConfig.hyperparameters, maxDepth: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Min Samples Leaf</label>
            <input
              type="number"
              value={trainingConfig.hyperparameters.minSamplesLeaf}
              onChange={(e) => setTrainingConfig({
                ...trainingConfig,
                hyperparameters: { ...trainingConfig.hyperparameters, minSamplesLeaf: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Model List */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Trained Models
        </h2>

        {modelsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading models...</div>
        ) : !models || models.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No models trained yet. Start training your first model!
          </div>
        ) : (
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{model.model_name}</h3>
                      <p className="text-sm text-muted-foreground">v{model.model_version} • {model.model_type}</p>
                    </div>
                  </div>
                  {getStatusBadge(model.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                    <div className="text-lg font-semibold">{((model.accuracy || 0) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">F1 Score</div>
                    <div className="text-lg font-semibold">{((model.f1_score || 0) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Training Samples</div>
                    <div className="text-lg font-semibold">{(model.training_samples || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Deployed</div>
                    <div className="text-lg font-semibold">
                      {model.deployed_at ? new Date(model.deployed_at).toLocaleDateString() : 'Not deployed'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeployModel(model.id)}
                    disabled={model.status === 'active' || deployModelMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3" />
                    Deploy
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
