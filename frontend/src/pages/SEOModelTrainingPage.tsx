import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Brain,
  Database,
  Play,
  TrendingUp,
  CheckCircle,
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
import {
  KpiGrid,
  KpiCard,
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  AsyncStateLoading,
  AsyncStateError,
  AsyncStateEmpty,
  Fab,
} from '@/components/ui';

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
  const {
    data: models,
    isLoading: modelsLoading,
    error: modelsError,
  } = useQuery<SEOModel[]>({
    queryKey: ['seoModels'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/seo/models`);
      return response.data.models || [];
    },
    refetchInterval: 10000,
  });

  // Fetch training stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<TrainingStats>({
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

  const initialLoading = modelsLoading && statsLoading;
  const fetchError = (modelsError || statsError) as Error | undefined;
  const hasModels = models && models.length > 0;

  if (initialLoading) {
    return (
      <div className="p-6">
        <AsyncStateLoading className="min-h-[40vh]">Preparing SEO model training data…</AsyncStateLoading>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6">
        <AsyncStateError
          description={fetchError.message}
          icon={<AlertCircle className="h-10 w-10" />}
          actionLabel="Retry"
          onAction={() => {
            queryClient.invalidateQueries({ queryKey: ['seoModels'] });
            queryClient.invalidateQueries({ queryKey: ['trainingStats'] });
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            SEO Model Training
          </h1>
          <p className="md3-body-medium text-on-surface-variant">
            Train, evaluate, and deploy optimization models for search rankings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="md3-label-medium text-on-surface-variant">
            {trainModelMutation.isPending ? 'Training in progress…' : 'Ready for new training jobs'}
          </span>
        </div>
      </header>

      <KpiGrid columns={4}>
        <KpiCard
          label="Training records"
          value={stats?.total_training_records?.toLocaleString() ?? '—'}
          delta={`${stats?.verified_records?.toLocaleString() ?? '0'} verified`}
          icon={<Database className="h-4 w-4" />}
        />
        <KpiCard
          label="Average SEO score"
          value={stats ? `${(stats.avg_seo_score || 0).toFixed(1)}` : '—'}
          tone="primary"
          delta="Out of 100"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="Active models"
          value={models ? models.filter((m) => m.status === 'active').length : '—'}
          tone="success"
          delta={`${models?.length ?? 0} total models`}
          icon={<Zap className="h-4 w-4" />}
        />
        <KpiCard
          label="Effectiveness"
          value={stats ? `${(stats.avg_effectiveness || 0).toFixed(1)}%` : '—'}
          tone="warning"
          delta="Avg optimization score"
          icon={<Target className="h-4 w-4" />}
        />
      </KpiGrid>

      <WorkflowPanel title="Training configuration" description="Adjust hyperparameters and targets before launching a new training job.">
        <WorkflowPanelSection>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field
              label="Model name"
              value={trainingConfig.modelName}
              onChange={(value) => setTrainingConfig({ ...trainingConfig, modelName: value })}
            />
            <Field
              label="Model version"
              value={trainingConfig.modelVersion}
              onChange={(value) => setTrainingConfig({ ...trainingConfig, modelVersion: value })}
            />

            <SelectField
              label="Algorithm"
              value={trainingConfig.algorithm}
              onChange={(value) =>
                setTrainingConfig({ ...trainingConfig, algorithm: value as TrainingConfig['algorithm'] })
              }
              options={[
                { value: 'gradient_boosting', label: 'Gradient Boosting' },
                { value: 'neural_network', label: 'Neural Network' },
                { value: 'random_forest', label: 'Random Forest' },
                { value: 'ensemble', label: 'Ensemble' },
              ]}
            />

            <SelectField
              label="Target metric"
              value={trainingConfig.targetMetric}
              onChange={(value) =>
                setTrainingConfig({ ...trainingConfig, targetMetric: value as TrainingConfig['targetMetric'] })
              }
              options={[
                { value: 'ndcg', label: 'NDCG (Normalized Discounted Cumulative Gain)' },
                { value: 'map', label: 'MAP (Mean Average Precision)' },
                { value: 'precision', label: 'Precision' },
                { value: 'recall', label: 'Recall' },
              ]}
            />

            <NumberField
              label="Learning rate"
              value={trainingConfig.hyperparameters.learningRate}
              step="0.01"
              onChange={(value) =>
                setTrainingConfig({
                  ...trainingConfig,
                  hyperparameters: {
                    ...trainingConfig.hyperparameters,
                    learningRate: parseFloat(value),
                  },
                })
              }
            />
            <NumberField
              label="Number of estimators"
              value={trainingConfig.hyperparameters.nEstimators}
              onChange={(value) =>
                setTrainingConfig({
                  ...trainingConfig,
                  hyperparameters: {
                    ...trainingConfig.hyperparameters,
                    nEstimators: parseInt(value, 10),
                  },
                })
              }
            />
            <NumberField
              label="Max depth"
              value={trainingConfig.hyperparameters.maxDepth}
              onChange={(value) =>
                setTrainingConfig({
                  ...trainingConfig,
                  hyperparameters: {
                    ...trainingConfig.hyperparameters,
                    maxDepth: parseInt(value, 10),
                  },
                })
              }
            />
            <NumberField
              label="Min samples leaf"
              value={trainingConfig.hyperparameters.minSamplesLeaf}
              onChange={(value) =>
                setTrainingConfig({
                  ...trainingConfig,
                  hyperparameters: {
                    ...trainingConfig.hyperparameters,
                    minSamplesLeaf: parseInt(value, 10),
                  },
                })
              }
            />
          </div>
        </WorkflowPanelSection>
        <WorkflowPanelFooter>
          <span className="md3-label-medium text-on-surface-variant">
            Configure hyperparameters before starting a new training run.
          </span>
          <Fab
            extended
            icon={trainModelMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            aria-label="Start training"
            onClick={handleStartTraining}
            disabled={trainModelMutation.isPending}
          >
            {trainModelMutation.isPending ? 'Starting…' : 'Start training'}
          </Fab>
        </WorkflowPanelFooter>
      </WorkflowPanel>

      <WorkflowPanel title="Trained models" description="Monitor versioned models, deployment status, and evaluation metrics.">
        {modelsLoading ? (
          <AsyncStateLoading className="min-h-[20vh]">Refreshing trained models…</AsyncStateLoading>
        ) : !hasModels ? (
          <AsyncStateEmpty
            title="No models trained yet"
            description="Launch a training job to populate your model registry."
            icon={<Brain className="h-10 w-10" />}
            compact
          />
        ) : (
          <div className="space-y-4">
            {models?.map((model) => (
              <div
                key={model.id}
                className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-high p-4 transition-colors hover:border-primary"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="md3-title-medium text-on-surface">{model.model_name}</h3>
                      <p className="md3-body-small text-on-surface-variant">
                        v{model.model_version} • {model.model_type}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(model.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatBlock label="Accuracy" value={`${((model.accuracy || 0) * 100).toFixed(1)}%`} />
                  <StatBlock label="F1 score" value={`${((model.f1_score || 0) * 100).toFixed(1)}%`} />
                  <StatBlock label="Training samples" value={(model.training_samples || 0).toLocaleString()} />
                  <StatBlock
                    label="Deployed"
                    value={model.deployed_at ? new Date(model.deployed_at).toLocaleDateString() : 'Not deployed'}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleDeployModel(model.id)}
                    disabled={model.status === 'active' || deployModelMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" /> Deploy
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-outline px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:border-primary">
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </WorkflowPanel>
    </div>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-2">
    <span className="md3-label-medium text-on-surface-variant">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-outline bg-surface-container-high px-4 py-3 text-on-surface shadow-level-1 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </label>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-2">
    <span className="md3-label-medium text-on-surface-variant">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-outline bg-surface-container-high px-4 py-3 text-on-surface shadow-level-1 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

interface NumberFieldProps {
  label: string;
  value: number;
  step?: string;
  onChange: (value: string) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, value, step = '1', onChange }) => (
  <label className="flex flex-col gap-2">
    <span className="md3-label-medium text-on-surface-variant">{label}</span>
    <input
      type="number"
      step={step}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-outline bg-surface-container-high px-4 py-3 text-on-surface shadow-level-1 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </label>
);

interface StatBlockProps {
  label: string;
  value: React.ReactNode;
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value }) => (
  <div className="rounded-2xl border border-outline bg-surface px-4 py-3 text-left">
    <div className="md3-label-small text-on-surface-variant">{label}</div>
    <div className="md3-title-medium text-on-surface">{value}</div>
  </div>
);
