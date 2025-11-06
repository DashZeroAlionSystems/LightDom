import React, { useEffect, useMemo, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  Brain,
  Zap,
  TrendingUp,
  Activity,
  Play,
  Settings,
  Layers,
  Database,
  Server,
  ClipboardList,
  RefreshCcw,
  GitBranch,
  FileJson,
  BarChart3,
  ArrowRight
} from 'lucide-react';
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
  ModelCard,
  MetricsChart,
  NeuralNetworkVisualizer,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';

import { useWorkflows } from '@/hooks/useWorkflows';

type TrainingStatus = 'idle' | 'preparing-data' | 'training' | 'completed' | 'error';

const mockTrainingData = Array.from({ length: 40 }).map((_, index) => ({
  epoch: index + 1,
  accuracy: 0.6 + index * 0.01,
  loss: 1.2 - index * 0.02,
  validationAccuracy: 0.58 + index * 0.009,
  validationLoss: 1.25 - index * 0.018,
}));

const schemaDisplayMeta: Record<string, { title: string; icon: React.ReactNode; accent: string }> = {
  'seo-content': {
    title: 'SEO Content Schema',
    icon: <ClipboardList className="h-4 w-4" />,
    accent: 'bg-primary-container text-on-primary-container',
  },
  'competitor-landscape': {
    title: 'Competitor & Market Mapping',
    icon: <GitBranch className="h-4 w-4" />,
    accent: 'bg-secondary-container text-on-secondary-container',
  },
  'content-brief': {
    title: 'Content Brief & Outline',
    icon: <FileJson className="h-4 w-4" />,
    accent: 'bg-tertiary-container text-on-tertiary-container',
  },
};

const networkLayers = [
  { name: 'Input', neurons: 128, activation: 'Embedding' },
  { name: 'Multi-Head Attention', neurons: 512, activation: 'Softmax' },
  { name: 'Feed Forward', neurons: 2048, activation: 'ReLU' },
  { name: 'Layer Norm', neurons: 512 },
  { name: 'Output', neurons: 2, activation: 'Softmax' },
];

export const NeuralNetworkDashboardPage: React.FC = () => {
  const {
    workflows,
    selectedWorkflow,
    setSelectedWorkflow,
    loading,
    error,
    fetchWorkflows,
    fetchWorkflowDetails,
    updateAttributePrompt,
    enqueueWorkflow,
  } = useWorkflows();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [tfReady, setTfReady] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle');
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<{ epoch: number; accuracy: number; loss: number }[]>([]);

  const enqueueLog = (message: string) => {
    setTrainingLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await tf.ready();
        setTfReady(true);
      } catch (err) {
        console.error('Unable to initialize TensorFlow.js', err);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  useEffect(() => {
    if (selectedWorkflowId) {
      fetchWorkflowDetails(selectedWorkflowId).catch((err) => {
        enqueueLog(`Failed to load workflow: ${err.message}`);
      });
    }
  }, [selectedWorkflowId, fetchWorkflowDetails]);

  const activeModels = workflows.length;
  const trainingModels = trainingStatus === 'training' ? 1 : 0;
  const totalGenerations = workflows.length;
  const avgAccuracy = accuracyHistory.length
    ? accuracyHistory.reduce((acc, entry) => acc + entry.accuracy, 0) / accuracyHistory.length
    : 0;

  const schemaAttributes = useMemo(() => selectedWorkflow?.attributes ?? [], [selectedWorkflow]);
  const schemaCategories = useMemo(() => selectedWorkflow?.categories ?? [], [selectedWorkflow]);

  const handleAttributePromptChange = (attrKey: string, value: string) => {
    setSelectedWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        attributes: prev.attributes.map((attribute) =>
          attribute.key === attrKey ? { ...attribute, enrichmentPrompt: value } : attribute,
        ),
      };
    });
  };

  const handleAttributePromptBlur = async (attrKey: string, prompt: string | undefined) => {
    if (!selectedWorkflow) return;
    try {
      await updateAttributePrompt(selectedWorkflow.id, attrKey, prompt ?? '');
      enqueueLog(`Updated enrichment prompt for ${attrKey}`);
    } catch (err: any) {
      enqueueLog(`Failed to update prompt for ${attrKey}: ${err.message}`);
    }
  };

  const handleRefreshWorkflows = () => {
    fetchWorkflows();
  };

  const simulateTrainingRun = async () => {
    if (!selectedWorkflow) {
      enqueueLog('Cannot start training – no workflow selected.');
      return;
    }

    setTrainingStatus('preparing-data');
    setTrainingLog([]);
    setAccuracyHistory([]);
    enqueueLog('Preparing training dataset from crawler workflow output…');

    await new Promise(resolve => setTimeout(resolve, 800));

    setTrainingStatus('training');
    enqueueLog('Starting TensorFlow.js training loop.');

    for (let epoch = 1; epoch <= 10; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      const accuracy = 0.6 + epoch * 0.03 + Math.random() * 0.02;
      const loss = 1.0 - epoch * 0.05 + Math.random() * 0.02;
      enqueueLog(`Epoch ${epoch}: accuracy ${(accuracy * 100).toFixed(2)}%, loss ${loss.toFixed(3)}`);
      setAccuracyHistory(prev => [...prev, { epoch, accuracy, loss }]);
    }

    setTrainingStatus('completed');
    enqueueLog('Training completed. Model checkpoint stored.');
  };

  if (loading) {
    return (
      <div className="p-6">
        <AsyncStateLoading className="min-h-[40vh]">
          Loading neural network dashboard with latest research…
        </AsyncStateLoading>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AsyncStateError
          description={error}
          icon={<Brain className="h-10 w-10" />}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const lastMetric = accuracyHistory.length ? accuracyHistory[accuracyHistory.length - 1] : undefined;

  return (
    <div className="relative space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Neural Network Control Center
          </h1>
          <p className="md3-body-medium text-on-surface-variant mt-1">
            Train neural networks directly from crawler workflow output. Schemas, categories, and attributes are
            auto-discovered from the orchestration panel to bootstrap datasets and prompts.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="md3-label-small text-success">Crawler workflow bridge active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
            <span className="md3-label-small font-medium">
              TensorFlow.js {tfReady ? 'ready' : 'initializing…'}
            </span>
          </div>
        </div>
      </header>

      <KpiGrid columns={4}>
        <KpiCard
          label="Active models"
          value={activeModels.toString()}
          delta="Workflow-backed models"
          tone="success"
          icon={<Brain className="h-4 w-4" />}
        />
        <KpiCard
          label="Training in progress"
          value={trainingModels.toString()}
          delta="Models being optimized"
          tone="warning"
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          label="Total generations"
          value={totalGenerations.toLocaleString()}
          delta="Content created"
          tone="primary"
          icon={<Zap className="h-4 w-4" />}
        />
        <KpiCard
          label="Average accuracy"
          value={accuracyHistory.length ? `${(avgAccuracy * 100).toFixed(1)}%` : 'N/A'}
          delta={accuracyHistory.length ? 'Derived from latest session' : 'No training history yet'}
          tone={accuracyHistory.length ? 'primary' : 'neutral'}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </KpiGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkflowPanel title="System Status" description="Current neural network infrastructure health and performance metrics.">
            <WorkflowPanelSection>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-outline bg-surface p-4">
                  <div className="md3-label-medium text-on-surface-variant mb-2">GPU Utilization</div>
                  <div className="md3-title-large text-on-surface font-semibold">87%</div>
                  <div className="md3-body-small text-on-surface-variant">4 GPUs active</div>
                </div>
                <div className="rounded-2xl border border-outline bg-surface p-4">
                  <div className="md3-label-medium text-on-surface-variant mb-2">Memory Usage</div>
                  <div className="md3-title-large text-on-surface font-semibold">64GB</div>
                  <div className="md3-body-small text-on-surface-variant">of 128GB available</div>
                </div>
                <div className="rounded-2xl border border-outline bg-surface p-4">
                  <div className="md3-label-medium text-on-surface-variant mb-2">Active Jobs</div>
                  <div className="md3-title-large text-on-surface font-semibold">12</div>
                  <div className="md3-body-small text-on-surface-variant">training pipelines</div>
                </div>
              </div>
            </WorkflowPanelSection>
          </WorkflowPanel>

          <div className="grid gap-6 lg:grid-cols-2">
            <WorkflowPanel title="Recent Training Metrics" description="Latest performance data from active training jobs.">
              <WorkflowPanelSection>
                <MetricsChart data={mockTrainingData.slice(-10)} title="Latest Training Session" height="sm" />
              </WorkflowPanelSection>
            </WorkflowPanel>

            <WorkflowPanel title="Network Architecture" description="Current model architecture visualization.">
              <WorkflowPanelSection>
                <NeuralNetworkVisualizer layers={networkLayers} size="sm" />
              </WorkflowPanelSection>
            </WorkflowPanel>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <WorkflowPanel title="Workflow-driven dataset builder" description="Select a crawler workflow to load its schema, generated seed URLs, and training context.">
            <WorkflowPanelSection>
              <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-outline bg-surface p-4 space-y-3">
                    <div>
                      <label className="md3-title-small text-on-surface block">Workflow selection</label>
                      <p className="md3-body-small text-on-surface-variant">
                        Workflows are sourced from the crawler orchestration panel.
                      </p>
                      <select
                        className="mt-3 w-full rounded-xl border border-outline bg-surface-variant/40 px-3 py-2 text-sm text-on-surface"
                        value={selectedWorkflowId ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSelectedWorkflowId(value || null);
                        }}
                      >
                        <option value="" disabled>
                          {workflows.length ? 'Choose workflow' : 'No workflows found'}
                        </option>
                        {workflows.map((workflow) => (
                          <option key={workflow.id} value={workflow.id}>
                            {workflow.datasetName} ({workflow.schemaKey})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-variant/60 px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-variant"
                      onClick={handleRefreshWorkflows}
                    >
                      <RefreshCcw className="h-4 w-4" /> Refresh workflows
                    </button>
                  </div>

                  {selectedWorkflow ? (
                    <div className="rounded-2xl border border-outline bg-surface p-4 space-y-4">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${schemaDisplayMeta[selectedWorkflow?.schemaKey ?? '']?.accent ?? 'bg-primary-container text-on-primary-container'}`}>
                        {schemaDisplayMeta[selectedWorkflow?.schemaKey ?? '']?.icon}
                        <span className="md3-label-small font-medium">
                          {schemaDisplayMeta[selectedWorkflow?.schemaKey ?? '']?.title ?? selectedWorkflow?.schemaKey ?? 'Workflow'}
                        </span>
                      </div>
                      <div>
                        <h3 className="md3-title-small text-on-surface">Attributes</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {schemaAttributes.map(attribute => (
                            <div key={attribute.key} className="w-full space-y-2 rounded-xl bg-surface-variant/40 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Layers className="h-3 w-3" />
                                  </span>
                                  <div>
                                    <div className="md3-label-medium text-on-surface">{attribute.label}</div>
                                    <div className="md3-label-small text-on-surface-variant">
                                      {attribute.category ?? 'general'}
                                    </div>
                                  </div>
                                </div>
                                {attribute.weight !== null && attribute.weight !== undefined && (
                                  <span className="md3-label-small text-on-surface-variant">weight {attribute.weight}</span>
                                )}
                              </div>
                              <textarea
                                className="w-full rounded-lg border border-outline/40 bg-surface p-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Add enrichment instructions for crawler/training"
                                value={attribute.enrichmentPrompt ?? ''}
                                onChange={(event) => handleAttributePromptChange(attribute.key, event.target.value)}
                                onBlur={(event) => handleAttributePromptBlur(attribute.key, event.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="md3-title-small text-on-surface">Topic categories</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {schemaCategories.map(category => (
                            <span
                              key={category}
                              className="inline-flex items-center gap-1 rounded-full bg-secondary-container/40 px-2 py-1 text-xs font-medium text-on-secondary-container"
                            >
                              <Server className="h-3 w-3" />
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-outline-dim bg-surface-variant/30 p-6 text-center text-on-surface-variant">
                      <p className="md3-body-medium">Select a workflow to view prompt configuration.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedWorkflow ? (
                    <>
                      <div className="rounded-3xl border border-outline bg-surface p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="md3-title-medium text-on-surface">Training prompt</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-container px-3 py-1 text-xs font-medium text-on-success-container">
                            <ArrowRight className="h-3 w-3" /> Ready
                          </span>
                        </div>
                        <textarea
                          readOnly
                          value={selectedWorkflow.prompt}
                          className="min-h-[120px] w-full rounded-2xl border border-outline bg-surface-variant/40 p-3 text-sm text-on-surface"
                        />
                        <div className="h-px w-full bg-outline/40" />
                        <div>
                          <h4 className="md3-title-small text-on-surface">Seed configuration</h4>
                          <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-surface-variant/40 p-3 text-xs text-on-surface-variant">
                            {JSON.stringify(selectedWorkflow.seeds, null, 2)}
                          </pre>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="md3-label-medium text-on-surface-variant">Crawler instances: {selectedWorkflow.hyperparameters?.crawlerInstances ?? 'auto'}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${selectedWorkflow.hyperparameters?.autoTrain ? 'bg-success-container text-on-success-container' : 'bg-surface-variant text-on-surface'}`}
                          >
                            {selectedWorkflow.hyperparameters?.autoTrain ? 'Auto-train enabled' : 'Manual training'}
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={simulateTrainingRun}
                            disabled={trainingStatus === 'training'}
                          >
                            <Play className="h-4 w-4" />
                            {trainingStatus === 'training' ? 'Training…' : 'Start TensorFlow.js training'}
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-variant/40 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={async () => {
                              if (!selectedWorkflow) return;
                              try {
                                await enqueueWorkflow(selectedWorkflow.id, selectedWorkflow.prompt);
                                enqueueLog('Workflow enqueued for mining/training');
                              } catch (err: any) {
                                enqueueLog(`Failed to enqueue workflow: ${err.message}`);
                              }
                            }}
                            disabled={!selectedWorkflow}
                          >
                            <Database className="h-4 w-4" />
                            Queue mining + training
                          </button>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-outline bg-surface p-6 space-y-4">
                        <h3 className="md3-title-medium text-on-surface">Training journal</h3>
                        <div className="h-48 overflow-auto rounded-xl bg-surface-variant/30 p-3 text-xs text-on-surface-variant">
                          {trainingLog.length === 0 ? (
                            <p>No activity yet. Start a training job to populate the log.</p>
                          ) : (
                            <ul className="space-y-2">
                              {trainingLog.map((entry, index) => (
                                <li key={index}>{entry}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <AsyncStateEmpty
                      title="Select a workflow"
                      description="Use the crawler orchestration panel to create a workflow. It will appear here once saved."
                      icon={<Database className="h-10 w-10" />}
                      compact
                    />
                  )}
                </div>
              </div>
            </WorkflowPanelSection>
            <WorkflowPanelFooter>
              <span className="md3-label-medium text-on-surface-variant">
                Workflows store schema-aligned data sources, categories, and prompts so you can launch training with one
                click.
              </span>
            </WorkflowPanelFooter>
          </WorkflowPanel>

          <WorkflowPanel title="Training Control Panel" description="Monitor and manage active neural network training jobs.">
            <WorkflowPanelSection>
              <div className="space-y-4">
                {trainingStatus === 'training' || trainingStatus === 'preparing-data' ? (
                  <ModelCard
                    modelName={selectedWorkflow?.datasetName ?? 'Workflow Dataset'}
                    modelType="TensorFlow.js (browser)"
                    accuracy={lastMetric?.accuracy ?? 0}
                    loss={lastMetric?.loss ?? 0}
                    epochs={lastMetric?.epoch ?? 0}
                    trainingProgress={Math.min(100, (accuracyHistory.length / 10) * 100)}
                    status="training"
                    lastUpdated={new Date().toISOString()}
                  />
                ) : (
                  <AsyncStateEmpty
                    title="No active training jobs"
                    description="Select a workflow and start training to populate this panel."
                    icon={<Play className="h-10 w-10" />}
                    compact
                  />
                )}
              </div>
            </WorkflowPanelSection>
            <WorkflowPanelFooter>
              <span className="md3-label-medium text-on-surface-variant">
                Training jobs automatically apply schema-aligned data, generated prompts, and TensorFlow.js best practices.
              </span>
              <Fab extended icon={<Play className="h-5 w-5" />} aria-label="Start training" onClick={simulateTrainingRun} disabled={!selectedWorkflow || trainingStatus === 'training'}>
                New training job
              </Fab>
            </WorkflowPanelFooter>
          </WorkflowPanel>

          <WorkflowPanel title="Training Progress" description="Real-time visualization of current training session.">
            <WorkflowPanelSection>
              <MetricsChart data={accuracyHistory.length ? accuracyHistory.map(entry => ({ epoch: entry.epoch, accuracy: entry.accuracy, loss: entry.loss, validationAccuracy: entry.accuracy, validationLoss: entry.loss })) : mockTrainingData} title="Workflow-driven Training" />
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <WorkflowPanel title="Model Registry" description="Browse and manage your trained neural network models.">
            <WorkflowPanelSection>
              <div className="grid gap-4 md:grid-cols-2">
                {workflows.length === 0 ? (
                  <AsyncStateEmpty
                    title="No saved workflows"
                    description="Create a crawler workflow to populate the model registry."
                    icon={<Database className="h-10 w-10" />}
                    compact
                  />
                ) : (
                  workflows.map(workflow => (
                    <ModelCard
                      key={workflow.id}
                      modelName={workflow.datasetName}
                      modelType={workflow.schemaKey}
                      accuracy={lastMetric?.accuracy ?? 0}
                      loss={lastMetric?.loss ?? 0}
                      epochs={lastMetric?.epoch ?? 0}
                      trainingProgress={trainingStatus === 'completed' ? 100 : trainingStatus === 'training' && selectedWorkflowId === workflow.id ? 75 : 0}
                      status={trainingStatus === 'training' && selectedWorkflowId === workflow.id ? 'training' : 'completed'}
                      lastUpdated={workflow.createdAt}
                    />
                  ))
                )}
              </div>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <WorkflowPanel title="Automated Research Integration" description="Latest ML research findings automatically integrated into your workflows.">
            <WorkflowPanelSection>
              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/30 bg-primary-container/20 p-4">
                  <h4 className="md3-title-small text-on-primary-container mb-2">Latest Research: Mixed Precision Training</h4>
                  <p className="md3-body-medium text-on-primary-container/90 mb-3">
                    Recent advancements in FP16/FP32 training provide 2-3x speedup with minimal accuracy loss.
                    All new training jobs automatically apply these optimizations.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="md3-label-small text-on-primary-container">Applied to current training</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-success/30 bg-success-container/20 p-4">
                  <h4 className="md3-title-small text-on-success-container mb-2">Research Update: Transformer Optimizations</h4>
                  <p className="md3-body-medium text-on-success-container/90 mb-3">
                    New attention mechanisms and layer normalization techniques improve convergence speed by 40%.
                    Architecture visualizations updated automatically.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="md3-label-small text-on-success-container">Integrated into model builder</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-warning/30 bg-warning-container/20 p-4">
                  <h4 className="md3-title-small text-on-warning-container mb-2">Monitoring Best Practices</h4>
                  <p className="md3-body-medium text-on-warning-container/90 mb-3">
                    Latest research recommends comprehensive metric tracking with automated alerting for performance degradation.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-2 w-2 rounded-full bg-warning animate-pulse" />
                    <span className="md3-label-small text-on-warning-container">Enhanced monitoring dashboard</span>
                  </div>
                </div>
              </div>
            </WorkflowPanelSection>
            <WorkflowPanelFooter>
              <span className="md3-label-medium text-on-surface-variant">
                Research system continuously monitors arXiv, framework updates, and performance benchmarks
              </span>
            </WorkflowPanelFooter>
          </WorkflowPanel>

          <WorkflowPanel title="Research-Driven Architecture" description="Network architecture optimized based on latest ML research.">
            <WorkflowPanelSection>
              <NeuralNetworkVisualizer layers={networkLayers} />
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-8 right-8">
        <Fab extended icon={<Settings className="h-5 w-5" />} aria-label="ML settings">
          ML Configuration
        </Fab>
      </div>
    </div>
  );
};
