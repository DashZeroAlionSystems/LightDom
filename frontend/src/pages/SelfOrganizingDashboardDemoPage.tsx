import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  TextArea,
} from '@/components/ui';
import {
  Activity,
  Cpu,
  LayoutDashboard,
  SatelliteDish,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  timestamp: string;
  message: string;
}

interface MiningResult {
  id: string;
  source: string;
  type: string;
  insights: number;
}

interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

const workflowSteps: Record<string, string[]> = {
  DataMiningWorkflow: ['Queuing sources', 'Fetching documents', 'Extracting insights', 'Publishing results'],
  NeuralTrainingWorkflow: ['Streaming telemetry', 'Optimising weights', 'Evaluating metrics', 'Publishing model'],
  AppGenerationWorkflow: ['Creating blueprint', 'Scaffolding UI', 'Packaging artifacts', 'Deploying preview'],
};

const SelfOrganizingDashboardDemoPage: React.FC = () => {
  const [appsMetric, setAppsMetric] = useState(18);
  const [workflowsMetric, setWorkflowsMetric] = useState(5);
  const [neuralStatus, setNeuralStatus] = useState<'Active' | 'Scaling' | 'Cooling'>('Active');

  const [taskPrompt, setTaskPrompt] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [breakdownResults, setBreakdownResults] = useState<string[]>([]);

  const [miningSources, setMiningSources] = useState('docs.lightdom.ai, sitemaps/lightdom.xml');
  const [isMining, setIsMining] = useState(false);
  const [miningResults, setMiningResults] = useState<MiningResult[]>([]);

  const workflowOptions = useMemo(
    () => [
      { id: 'DataMiningWorkflow', label: 'Data Mining Workflow' },
      { id: 'NeuralTrainingWorkflow', label: 'Neural Training Workflow' },
      { id: 'AppGenerationWorkflow', label: 'App Generation Workflow' },
    ],
    []
  );
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflowOptions[0]?.id ?? 'DataMiningWorkflow');
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [workflowStep, setWorkflowStep] = useState<string>('Ready');
  const workflowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [apps] = useState<GeneratedApp[]>([
    {
      id: 'app-1',
      name: 'Schema Watcher Control Hub',
      description: 'Monitor and manage template watcher output with MD3-insights.',
      tags: ['Watcher', 'Automation'],
    },
    {
      id: 'app-2',
      name: 'Workflow Blueprint Studio',
      description: 'Design orchestrations with DeepSeek prompts and guardrails.',
      tags: ['Workflow', 'AI'],
    },
    {
      id: 'app-3',
      name: 'Neural Telemetry Radar',
      description: 'Visualise experiment throughput and drift in real-time.',
      tags: ['Telemetry'],
    },
  ]);

  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    {
      id: 'log-initial',
      timestamp: new Date().toISOString(),
      message: '🎯 Self-organizing dashboard loaded and awaiting tasks.',
    },
  ]);

  const appendActivity = (message: string) => {
    setActivityLog((prev) => [
      ...prev.slice(-49),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message,
      },
    ]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAppsMetric((value) => value + Math.floor(Math.random() * 2));
      setWorkflowsMetric((value) => value + Math.floor(Math.random() * 2));
      setNeuralStatus((state) => (state === 'Active' ? 'Scaling' : state === 'Scaling' ? 'Cooling' : 'Active'));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (workflowIntervalRef.current) {
        clearInterval(workflowIntervalRef.current);
      }
    };
  }, []);

  const handleBreakdown = () => {
    if (!taskPrompt.trim()) {
      appendActivity('⚠️ Please provide a task prompt before requesting a breakdown.');
      return;
    }

    setIsBreakingDown(true);
    appendActivity(`🧠 Analysing task: ${taskPrompt.slice(0, 64)}${taskPrompt.length > 64 ? '…' : ''}`);

    window.setTimeout(() => {
      const subtasks = [
        'Identify data sources and watcher streams',
        'Cluster insights with DeepSeek planning API',
        'Draft workflow templates for automation squads',
        'Publish findings to admin navigation dashboards',
      ];
      setBreakdownResults(subtasks);
      setIsBreakingDown(false);
      appendActivity(`✅ Breakdown complete. Generated ${subtasks.length} subtasks.`);
    }, 1100);
  };

  const handleMining = () => {
    if (!miningSources.trim()) {
      appendActivity('⚠️ Provide at least one source to begin mining.');
      return;
    }

    setIsMining(true);
    appendActivity('⛏️ Starting mining job for selected sources.');

    window.setTimeout(() => {
      const sources = miningSources.split(',').map((entry, index) => ({
        id: `source-${index}`,
        source: entry.trim(),
        type: index % 2 === 0 ? 'Sitemap' : 'Knowledge base',
        insights: Math.floor(Math.random() * 12) + 3,
      }));
      setMiningResults(sources);
      setIsMining(false);
      appendActivity(`📊 Mining complete. Collated ${sources.reduce((total, item) => total + item.insights, 0)} insights.`);
    }, 1400);
  };

  const handleRunWorkflow = () => {
    if (isRunningWorkflow) return;

    if (workflowIntervalRef.current) {
      clearInterval(workflowIntervalRef.current);
    }

    setIsRunningWorkflow(true);
    setWorkflowProgress(0);
    setWorkflowStep('Initialising');
    appendActivity(`🔄 Triggered ${selectedWorkflow} execution.`);

    const steps = workflowSteps[selectedWorkflow] ?? [];
    let stepIndex = 0;

    workflowIntervalRef.current = setInterval(() => {
      stepIndex += 1;
      setWorkflowProgress((prev) => {
        const next = Math.min(prev + 20, 100);
        return next;
      });
      setWorkflowStep(steps[stepIndex % steps.length] ?? 'Processing…');

      if (stepIndex >= 5) {
        if (workflowIntervalRef.current) {
          clearInterval(workflowIntervalRef.current);
        }
        setWorkflowProgress(100);
        setWorkflowStep('Completed');
        setIsRunningWorkflow(false);
        appendActivity('✅ Workflow completed. Metrics refreshed.');
        setWorkflowsMetric((value) => value + 1);
      }
    }, 900);
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/10 bg-gradient-to-br from-purple-500/10 via-surface-container-high to-surface p-6 shadow-level-1'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Sparkles className='h-4 w-4' />
              Self-organizing dashboard
            </div>
            <div>
              <h1 className='text-3xl font-semibold text-on-surface md:text-4xl'>Headless automation control room</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Operate neural task breakdowns, data mining jobs, and workflow orchestration using LightDom design system primitives. This refactor replaces the Tailwind HTML demo with reusable MD3 components and simulated watcher signals.
              </p>
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-3'>
            <Card className='border-outline/20 bg-surface-container-low'>
              <CardContent className='flex flex-col items-center gap-1 py-4 text-on-surface'>
                <LayoutDashboard className='h-5 w-5 text-primary' />
                <p className='text-2xl font-semibold'>{appsMetric}</p>
                <span className='text-xs text-on-surface-variant/80'>Generated apps</span>
              </CardContent>
            </Card>
            <Card className='border-outline/20 bg-surface-container-low'>
              <CardContent className='flex flex-col items-center gap-1 py-4 text-on-surface'>
                <Workflow className='h-5 w-5 text-secondary' />
                <p className='text-2xl font-semibold'>{workflowsMetric}</p>
                <span className='text-xs text-on-surface-variant/80'>Active workflows</span>
              </CardContent>
            </Card>
            <Card className='border-outline/20 bg-surface-container-low'>
              <CardContent className='flex flex-col items-center gap-1 py-4 text-on-surface'>
                <Cpu className='h-5 w-5 text-success' />
                <p className='text-lg font-semibold'>{neuralStatus}</p>
                <span className='text-xs text-on-surface-variant/80'>Neural network</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <section className='grid gap-4 lg:grid-cols-3'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Zap className='h-5 w-5 text-primary' />
              Neural task breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <TextArea
              label='Describe the automation task'
              placeholder='e.g. Build content enrichment workflow for new vertical'
              rows={4}
              value={taskPrompt}
              onChange={(event) => setTaskPrompt(event.target.value)}
            />
            <Button variant='filled' fullWidth isLoading={isBreakingDown} onClick={handleBreakdown}>
              Break down task
            </Button>
            <div className='space-y-2'>
              {breakdownResults.map((item, index) => (
                <div key={item} className='rounded-2xl border border-outline/15 bg-surface-container-low px-3 py-2 text-sm text-on-surface'>
                  {index + 1}. {item}
                </div>
              ))}
              {breakdownResults.length === 0 && (
                <p className='text-sm text-on-surface-variant/70'>Insights will appear here after analysis.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <SatelliteDish className='h-5 w-5 text-secondary' />
              Data mining control
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Input
              label='Source URLs or paths'
              placeholder='Comma-separated list of sources'
              value={miningSources}
              onChange={(event) => setMiningSources(event.target.value)}
            />
            <Button variant='filled-tonal' fullWidth isLoading={isMining} onClick={handleMining}>
              Start mining
            </Button>
            <div className='space-y-2'>
              {miningResults.map((result) => (
                <Card key={result.id} className='border-outline/15 bg-surface-container-low'>
                  <CardContent className='space-y-1 py-3 text-sm text-on-surface'>
                    <p className='font-medium'>{result.source}</p>
                    <p className='text-on-surface-variant/70'>{result.type}</p>
                    <p className='text-success'>{result.insights} insights captured</p>
                  </CardContent>
                </Card>
              ))}
              {miningResults.length === 0 && (
                <p className='text-sm text-on-surface-variant/70'>Results will be summarised here after mining completes.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Activity className='h-5 w-5 text-success' />
              Workflow control
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <label className='md3-body-small text-on-surface-variant' htmlFor='workflow-select'>Select workflow</label>
              <select
                id='workflow-select'
                value={selectedWorkflow}
                onChange={(event) => setSelectedWorkflow(event.target.value)}
                className='w-full rounded-xl border border-outline/15 bg-surface-container px-3 py-2 text-on-surface'
              >
                {workflowOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant='filled' fullWidth isLoading={isRunningWorkflow} onClick={handleRunWorkflow}>
              Run workflow
            </Button>
            <div className='space-y-2 rounded-2xl border border-outline/15 bg-surface-container-low px-3 py-2 text-sm text-on-surface'>
              <p className='font-medium'>Status · {workflowStep}</p>
              <div className='h-2 w-full rounded-full bg-outline/15'>
                <div
                  className='h-2 rounded-full bg-primary transition-all'
                  style={{ width: `${workflowProgress}%` }}
                />
              </div>
              <p className='text-xs text-on-surface-variant/80'>{workflowProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='space-y-4'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='md3-title-medium text-on-surface'>Generated applications</h2>
          <Badge variant='secondary'>{apps.length} apps</Badge>
        </div>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {apps.map((app) => (
            <Card key={app.id} className='border-outline/15 bg-surface-container-low'>
              <CardHeader>
                <CardTitle className='text-on-surface'>{app.name}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <p className='text-sm text-on-surface-variant'>{app.description}</p>
                <div className='flex flex-wrap gap-2'>
                  {app.tags.map((tag) => (
                    <Badge key={tag} variant='outline'>
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Activity log</CardTitle>
          </CardHeader>
          <CardContent className='max-h-[320px] space-y-2 overflow-y-auto pr-2'>
            {activityLog.map((entry) => (
              <div key={entry.id} className='rounded-2xl border border-outline/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface'>
                <span className='text-xs text-on-surface-variant/70'>{formatTime(entry.timestamp)}</span>
                <p className='mt-1'>{entry.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SelfOrganizingDashboardDemoPage;
