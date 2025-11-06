import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Brain,
  Sparkles,
  Play,
  Pause,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Zap,
  Target,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { aiContentService, ModelTrainingRequest } from '@/services/aiContent';

export const AIContentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [trainingConfig, setTrainingConfig] = useState<ModelTrainingRequest>({
    modelType: 'combined',
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    minDatasetSize: 100,
  });

  const [generateUrl, setGenerateUrl] = useState('');
  const [generateKeywords, setGenerateKeywords] = useState('');

  // Fetch model performance
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['aiModels'],
    queryFn: () => aiContentService.getModelPerformance(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch active content summary
  const { data: activeContent, isLoading: contentLoading } = useQuery({
    queryKey: ['activeContent'],
    queryFn: () => aiContentService.getActiveContentSummary(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Train model mutation
  const trainModelMutation = useMutation({
    mutationFn: (config: ModelTrainingRequest) => aiContentService.trainModel(config),
    onSuccess: (data) => {
      toast.success('Model training started in background!');
      queryClient.invalidateQueries({ queryKey: ['aiModels'] });
    },
    onError: (error: Error) => {
      toast.error(`Training failed: ${error.message}`);
    },
  });

  // Retrain model mutation
  const retrainModelMutation = useMutation({
    mutationFn: (modelId: string) => aiContentService.retrainModel(modelId),
    onSuccess: () => {
      toast.success('Model retraining started!');
      queryClient.invalidateQueries({ queryKey: ['aiModels'] });
    },
    onError: (error: Error) => {
      toast.error(`Retraining failed: ${error.message}`);
    },
  });

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: (url: string) =>
      aiContentService.generateContent({
        url,
        targetKeywords: generateKeywords.split(',').map((k) => k.trim()).filter(Boolean),
        contentType: 'full_page',
        includeCompetitorAnalysis: true,
      }),
    onSuccess: (data) => {
      toast.success(`Content generated! SEO Score: ${data.seoScore.toFixed(1)}`);
      queryClient.invalidateQueries({ queryKey: ['activeContent'] });
      setGenerateUrl('');
      setGenerateKeywords('');
    },
    onError: (error: Error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const handleStartTraining = () => {
    trainModelMutation.mutate(trainingConfig);
  };

  const handleRetrain = (modelId: string) => {
    retrainModelMutation.mutate(modelId);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateUrl) {
      toast.error('Please enter a URL');
      return;
    }
    generateContentMutation.mutate(generateUrl);
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { color: string; icon: React.ReactNode } } = {
      active: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle className="w-3 h-3" /> },
      training: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      testing: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <AlertCircle className="w-3 h-3" /> },
      failed: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
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
            AI Content Generation
          </h1>
          <p className="text-muted-foreground">
            Train models and generate SEO-optimized content automatically
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Models</span>
            <Sparkles className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {modelsLoading ? '...' : models?.filter((m) => m.status === 'active').length || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Content Generated</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {modelsLoading
              ? '...'
              : models?.reduce((sum, m) => sum + (m.total_generations || 0), 0).toLocaleString() || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg SEO Score</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            {modelsLoading
              ? '...'
              : (
                  models?.reduce((sum, m, _, arr) => sum + (m.avg_seo_score || 0) / arr.length, 0) || 0
                ).toFixed(1)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Gen Time</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">
            {modelsLoading
              ? '...'
              : `${(
                  models?.reduce((sum, m, _, arr) => sum + (m.avg_generation_time_ms || 0) / arr.length, 0) /
                    1000 || 0
                ).toFixed(1)}s`}
          </div>
        </div>
      </div>

      {/* Quick Generate Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick Generate
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <input
              type="url"
              value={generateUrl}
              onChange={(e) => setGenerateUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={generateContentMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
            <input
              type="text"
              value={generateKeywords}
              onChange={(e) => setGenerateKeywords(e.target.value)}
              placeholder="seo optimization, content marketing"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={generateContentMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={generateContentMutation.isPending}
            className="w-full px-6 py-3 bg-gradient-exodus text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generateContentMutation.isPending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Content
              </>
            )}
          </button>
        </form>
      </div>

      {/* Model Training Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Model Training
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Model Type</label>
            <select
              value={trainingConfig.modelType}
              onChange={(e) =>
                setTrainingConfig({
                  ...trainingConfig,
                  modelType: e.target.value as ModelTrainingRequest['modelType'],
                })
              }
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={trainModelMutation.isPending}
            >
              <option value="title">Title Generator</option>
              <option value="meta_description">Meta Description</option>
              <option value="content">Full Content</option>
              <option value="combined">Combined (All Types)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Epochs</label>
            <input
              type="number"
              value={trainingConfig.epochs}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, epochs: parseInt(e.target.value) })}
              min="10"
              max="200"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={trainModelMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Batch Size</label>
            <input
              type="number"
              value={trainingConfig.batchSize}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, batchSize: parseInt(e.target.value) })}
              min="8"
              max="128"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={trainModelMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Learning Rate</label>
            <input
              type="number"
              value={trainingConfig.learningRate}
              onChange={(e) => setTrainingConfig({ ...trainingConfig, learningRate: parseFloat(e.target.value) })}
              step="0.0001"
              min="0.00001"
              max="0.1"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={trainModelMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Validation Split</label>
            <input
              type="number"
              value={trainingConfig.validationSplit}
              onChange={(e) =>
                setTrainingConfig({ ...trainingConfig, validationSplit: parseFloat(e.target.value) })
              }
              step="0.05"
              min="0.1"
              max="0.5"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={trainModelMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Min Dataset Size</label>
            <input
              type="number"
              value={trainingConfig.minDatasetSize}
              onChange={(e) =>
                setTrainingConfig({ ...trainingConfig, minDatasetSize: parseInt(e.target.value) })
              }
              min="10"
              max="10000"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={trainModelMutation.isPending}
            />
          </div>
        </div>

        <button
          onClick={handleStartTraining}
          disabled={trainModelMutation.isPending}
          className="w-full px-6 py-3 bg-gradient-exodus text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {trainModelMutation.isPending ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Starting Training...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Training
            </>
          )}
        </button>
      </div>

      {/* Active Models */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Active Models
        </h2>

        {modelsLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading models...</p>
          </div>
        ) : models && models.length > 0 ? (
          <div className="space-y-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{model.model_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      v{model.model_version} • {model.model_type}
                    </p>
                  </div>
                  {getStatusBadge(model.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Generations</p>
                    <p className="text-lg font-semibold">{model.total_generations?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Deployed</p>
                    <p className="text-lg font-semibold">{model.deployed_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg SEO Score</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      {model.avg_seo_score?.toFixed(1) || 'N/A'}
                      {model.avg_seo_score >= 80 && <TrendingUp className="w-4 h-4 text-green-500" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg Time</p>
                    <p className="text-lg font-semibold">
                      {model.avg_generation_time_ms
                        ? `${(model.avg_generation_time_ms / 1000).toFixed(1)}s`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-exodus transition-all duration-500"
                      style={{
                        width: `${model.avg_seo_score || 0}%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleRetrain(model.id)}
                    disabled={retrainModelMutation.isPending || model.status === 'training'}
                    className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retrain
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No models trained yet</p>
            <p className="text-sm text-muted-foreground">
              Configure training parameters above and click "Start Training" to create your first model
            </p>
          </div>
        )}
      </div>

      {/* Recent Generated Content */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recent Generated Content
        </h2>

        {contentLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        ) : activeContent && activeContent.length > 0 ? (
          <div className="space-y-3">
            {activeContent.slice(0, 10).map((content: any, index: number) => (
              <div
                key={content.id || index}
                className="p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{content.generated_title || 'Untitled'}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{content.url}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        SEO: {content.seo_score?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Pos: {content.avg_search_position || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        CTR: {content.avg_ctr?.toFixed(2) || 'N/A'}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        content.seo_score >= 80
                          ? 'text-green-500'
                          : content.seo_score >= 60
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {content.seo_score?.toFixed(0) || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No content generated yet</p>
            <p className="text-sm text-muted-foreground">
              Use the Quick Generate form above to create your first AI-powered content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
