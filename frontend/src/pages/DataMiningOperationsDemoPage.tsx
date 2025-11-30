import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Badge,
  Button,
  Input,
  KpiCard,
  KpiGrid,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextArea,
  WorkflowPanel,
  WorkflowPanelFooter,
  WorkflowPanelSection,
} from '@/components/ui';
import {
  Activity,
  BarChart3,
  CloudLightning,
  Cpu,
  Database,
  Download,
  RefreshCw,
  Rocket,
  Settings,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

type OperationStatus = 'running' | 'completed' | 'pending' | 'failed';

type Operation = {
  id: string;
  name: string;
  status: OperationStatus;
  type: 'scraping' | 'training' | 'analysis';
  startedAt: string;
  owner: string;
  progress: number;
};

type DatasetSummary = {
  id: string;
  name: string;
  sourceType: 'scraped' | 'synthetic' | 'ingested';
  records: number;
  lastUpdated: string;
};

type ModelSummary = {
  id: string;
  name: string;
  status: 'deployed' | 'training' | 'archived';
  accuracy: number;
  latencyMs: number;
};

const statusBadge: Record<OperationStatus, { label: string; variant: 'primary' | 'success' | 'warning' | 'error' }> = {
  running: { label: 'Running', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  failed: { label: 'Failed', variant: 'error' },
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: <Rocket className='h-4 w-4' /> },
  { id: 'operations', label: 'Operations', icon: <Activity className='h-4 w-4' /> },
  { id: 'scraping', label: 'Scraping Config', icon: <CloudLightning className='h-4 w-4' /> },
  { id: 'datasets', label: 'Datasets', icon: <Database className='h-4 w-4' /> },
  { id: 'models', label: 'Models', icon: <Cpu className='h-4 w-4' /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className='h-4 w-4' /> },
] as const;

const pipelineHealthSnapshot = [
  { label: 'Watcher throughput', value: '44.1k events/hour' },
  { label: 'Crawler error budget', value: '2.3% burn', helper: 'Target 5%' },
  { label: 'Bridge latency', value: 'Mean 68ms', helper: 'P95 112ms' },
];

const modelStatusVariant: Record<ModelSummary['status'], 'success' | 'warning' | 'outline'> = {
  deployed: 'success',
  training: 'warning',
  archived: 'outline',
};

const formatDatasetSource = (source: DatasetSummary['sourceType']) =>
  source.charAt(0).toUpperCase() + source.slice(1);

const mockOperations: Operation[] = [
  {
    id: 'op-train-mlp',
    name: 'Train LightDom classification model',
    status: 'running',
    type: 'training',
    startedAt: '14:05 UTC',
    owner: 'Automation squad',
    progress: 68,
  },
  {
    id: 'op-scrape-crawler',
    name: 'Crawler sweep · commerce tier',
    status: 'completed',
    type: 'scraping',
    startedAt: '12:30 UTC',
    owner: 'Crawler network',
    progress: 100,
  },
  {
    id: 'op-analysis-intent',
    name: 'Intent clustering refresh',
    status: 'pending',
    type: 'analysis',
    startedAt: 'Queued',
    owner: 'Insights crew',
    progress: 0,
  },
];

const mockDatasets: DatasetSummary[] = [
  {
    id: 'dataset-scrape-aurora',
    name: 'Aurora retail crawl',
    sourceType: 'scraped',
    records: 18250,
    lastUpdated: '2h ago',
  },
  {
    id: 'dataset-synthetic-sim',
    name: 'Synthetic watcher sessions',
    sourceType: 'synthetic',
    records: 42000,
    lastUpdated: '5h ago',
  },
  {
    id: 'dataset-ingest-events',
    name: 'Bridge telemetry events',
    sourceType: 'ingested',
    records: 9800,
    lastUpdated: '15m ago',
  },
];

const mockModels: ModelSummary[] = [
  {
    id: 'model-slot-classifier',
    name: 'Slot candidate classifier',
    status: 'deployed',
    accuracy: 0.91,
    latencyMs: 42,
  },
  {
    id: 'model-bridge-scoring',
    name: 'Bridge scoring transformer',
    status: 'training',
    accuracy: 0.76,
    latencyMs: 0,
  },
  {
    id: 'model-cohort-mapper',
    name: 'Cohort mapper',
    status: 'archived',
    accuracy: 0.84,
    latencyMs: 120,
  },
];

const DataMiningOperationsDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('overview');
  const [operations, setOperations] = useState<Operation[]>(mockOperations);
  const [datasets, setDatasets] = useState<DatasetSummary[]>(mockDatasets);
  const [models, setModels] = useState<ModelSummary[]>(mockModels);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: 'Commerce trends crawler',
    description: 'Scrape regional commerce portals, rank schema coverage, and emit watcher events.',
    sourceType: 'website',
    baseUrl: 'https://commerce.example.com',
    rateLimit: 1000,
    maxDepth: 3,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOperations((current) =>
        current.map((op) =>
          op.status === 'running'
            ? { ...op, progress: Math.min(op.progress + 10, 92) }
            : op,
        ),
      );
    }, 4000);

    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Active operations',
        value: operations.filter((op) => op.status === 'running').length,
        description: 'Training & scraping in-flight',
        icon: <Activity className='h-5 w-5 text-primary' />,
      },
      {
        label: 'Datasets',
        value: datasets.length,
        description: 'Catalogued & watcher-ready',
        icon: <Database className='h-5 w-5 text-primary' />,
      },
      {
        label: 'Models deployed',
        value: models.filter((model) => model.status === 'deployed').length,
        description: 'Serving inference traffic',
        icon: <Cpu className='h-5 w-5 text-primary' />,
      },
      {
        label: 'Automation uptime',
        value: '99.2%',
        description: 'Past 24 hour window',
        icon: <Sparkles className='h-5 w-5 text-primary' />,
      },
    ],
    [operations, datasets, models],
  );

  const automationUptime = String(stats.find((stat) => stat.label === 'Automation uptime')?.value ?? '—');

  const triggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    window.setTimeout(() => {
      setOperations((current) =>
        current.map((op) =>
          op.status === 'running'
            ? {
                ...op,
                progress: Math.min(op.progress + 6, 100),
                status: op.progress + 6 >= 100 ? 'completed' : 'running',
              }
            : op,
        ),
      );
      toast.success('Graph updated with latest watcher telemetry');
      setIsRefreshing(false);
    }, 1200);
  };

  const handleConfigSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success('Crawler configuration queued');
    setNewConfig((current) => ({
      ...current,
      name: current.name.endsWith('✓') ? current.name : `${current.name} ✓`,
    }));
  };

  const addSyntheticDataset = () => {
    const dataset: DatasetSummary = {
      id: `dataset-${Date.now()}`,
      name: 'Watcher replay batch',
      sourceType: 'synthetic',
      records: 5600,
      lastUpdated: 'Just now',
    };
    setDatasets((current) => [dataset, ...current]);
    toast('Synthetic dataset staged for review');
  };

  const formatStatusBadge = (status: OperationStatus) => (
    <Badge variant={statusBadge[status].variant}>{statusBadge[status].label}</Badge>
  );

  return (
    <div className='space-y-6 p-6'>
      <WorkflowPanel
        status='info'
        emphasis='elevated'
        title='Monitor mining orchestration and analytics'
        description='Track crawler jobs, training pipelines, and watcher-sourced datasets with LightDom-aligned telemetry.'
        meta={`Automation uptime ${automationUptime}`}
      >
        <div className='inline-flex items-center gap-2 text-sm font-medium text-primary'>
          <Sparkles className='h-4 w-4' /> Data mining observatory
        </div>
        <WorkflowPanelSection className='border-none pt-2'>
          <KpiGrid columns={4}>
            {stats.map((stat) => (
              <KpiCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                delta={stat.description}
                icon={stat.icon}
              />
            ))}
          </KpiGrid>
        </WorkflowPanelSection>
      </WorkflowPanel>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList className='flex flex-wrap gap-2 rounded-full border border-outline/20 bg-surface-container-high p-1 shadow-level-1'>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className='gap-2 rounded-full px-4 py-2 text-sm'>
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <WorkflowPanel
            title='Automation control centre'
            description='Live view of orchestrated crawler and training workloads.'
            actions={
              <Button
                onClick={triggerRefresh}
                leftIcon={<RefreshCw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing…' : 'Refresh graph'}
              </Button>
            }
          >
            <WorkflowPanelSection className='grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] border-none pt-0'>
              <div className='space-y-3'>
                <h4 className='md3-title-medium text-on-surface'>Active operations</h4>
                <div className='space-y-3'>
                  {operations.map((operation) => (
                    <article
                      key={operation.id}
                      className='rounded-3xl border border-outline/20 bg-surface p-4 shadow-level-1'
                    >
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                          <p className='md3-title-small text-on-surface'>{operation.name}</p>
                          <p className='md3-body-small text-on-surface-variant/80'>Owner · {operation.owner}</p>
                        </div>
                        {formatStatusBadge(operation.status)}
                      </div>
                      <div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/70'>
                        <span>{operation.startedAt}</span>
                        <span className='hidden sm:inline'>•</span>
                        <span>{operation.progress}% completion</span>
                      </div>
                      <div className='mt-3 h-2 rounded-full bg-outline/10'>
                        <div
                          className='h-full rounded-full bg-primary transition-all'
                          style={{ width: `${operation.progress}%` }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className='space-y-3'>
                <h4 className='md3-title-medium text-on-surface'>Pipeline health</h4>
                <div className='space-y-3'>
                  {pipelineHealthSnapshot.map((metric) => (
                    <div
                      key={metric.label}
                      className='rounded-3xl border border-outline/20 bg-surface-container-low p-4'
                    >
                      <p className='md3-title-small text-on-surface'>{metric.label}</p>
                      <p className='md3-body-small text-on-surface-variant/80'>{metric.value}</p>
                      {metric.helper && (
                        <p className='md3-label-small text-on-surface-variant/70'>{metric.helper}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value='operations' className='space-y-4'>
          <WorkflowPanel
            title='Operations detail'
            description='Full workload history across scraping, training, and analytics pipelines.'
          >
            <WorkflowPanelSection className='border-none pt-0'>
              <div className='overflow-x-auto rounded-3xl border border-outline/20 bg-surface shadow-level-1'>
                <table className='w-full min-w-[640px] border-collapse text-sm text-on-surface'>
                  <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant/70'>
                    <tr>
                      <th className='px-4 py-3 text-left'>Operation</th>
                      <th className='px-4 py-3 text-left'>Type</th>
                      <th className='px-4 py-3 text-left'>Started</th>
                      <th className='px-4 py-3 text-left'>Owner</th>
                      <th className='px-4 py-3 text-left'>Progress</th>
                      <th className='px-4 py-3 text-right'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((operation) => (
                      <tr key={operation.id} className='border-t border-outline/10'>
                        <td className='px-4 py-3 font-medium text-on-surface'>{operation.name}</td>
                        <td className='px-4 py-3 capitalize text-on-surface-variant'>{operation.type}</td>
                        <td className='px-4 py-3 text-on-surface-variant/80'>{operation.startedAt}</td>
                        <td className='px-4 py-3 text-on-surface-variant/80'>{operation.owner}</td>
                        <td className='px-4 py-3 text-on-surface-variant/80'>{operation.progress}%</td>
                        <td className='px-4 py-3 text-right'>{formatStatusBadge(operation.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </WorkflowPanelSection>
            <WorkflowPanelFooter>
              <div className='flex flex-wrap gap-2'>
                <Button variant='outlined' leftIcon={<Download className='h-4 w-4' />}>Export operations CSV</Button>
                <Button variant='text' leftIcon={<ShieldAlert className='h-4 w-4' />}>View incident reports</Button>
              </div>
              <span className='md3-label-small text-on-surface-variant/70'>Exports include timestamps, owners, and throughput deltas.</span>
            </WorkflowPanelFooter>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value='scraping' className='space-y-4'>
          <WorkflowPanel
            title='Crawler configuration'
            description='Compose and queue watcher-aligned crawler workloads.'
          >
            <WorkflowPanelSection className='grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] border-none pt-0'>
              <form className='space-y-4' onSubmit={handleConfigSubmit}>
                <Input
                  label='Configuration name'
                  value={newConfig.name}
                  onChange={(event) => setNewConfig((current) => ({ ...current, name: event.target.value }))}
                />
                <TextArea
                  label='Description'
                  rows={4}
                  value={newConfig.description}
                  onChange={(event) => setNewConfig((current) => ({ ...current, description: event.target.value }))}
                />
                <Input
                  label='Base URL'
                  value={newConfig.baseUrl}
                  onChange={(event) => setNewConfig((current) => ({ ...current, baseUrl: event.target.value }))}
                />
                <div className='grid gap-4 sm:grid-cols-2'>
                  <Input
                    label='Rate limit (ms)'
                    type='number'
                    value={newConfig.rateLimit}
                    onChange={(event) => setNewConfig((current) => ({ ...current, rateLimit: Number(event.target.value) }))}
                  />
                  <Input
                    label='Max depth'
                    type='number'
                    value={newConfig.maxDepth}
                    onChange={(event) => setNewConfig((current) => ({ ...current, maxDepth: Number(event.target.value) }))}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs uppercase tracking-wide text-on-surface-variant/70'>Source type</label>
                  <select
                    className='rounded-3xl border border-outline/20 bg-surface-container-low p-3 text-sm text-on-surface'
                    value={newConfig.sourceType}
                    onChange={(event) => setNewConfig((current) => ({ ...current, sourceType: event.target.value }))}
                  >
                    <option value='website'>Website</option>
                    <option value='api'>API</option>
                    <option value='sitemap'>Sitemap</option>
                    <option value='dataset'>Dataset</option>
                  </select>
                </div>
                <Button type='submit' leftIcon={<Sparkles className='h-4 w-4' />}>Queue configuration</Button>
              </form>

              <aside className='flex flex-col gap-3 rounded-3xl border border-outline/20 bg-surface-container-low p-4 text-sm text-on-surface-variant'>
                <h4 className='md3-title-small text-on-surface'>Watcher preview</h4>
                <p>
                  Queued configs stream into the crawler orchestrator. Watcher agents validate robots.txt, respect throttling, and patch the slot registry.
                </p>
                <p>
                  Tune rate limits and depth before production rollout. Attachments appear in the datasets catalogue automatically.
                </p>
                <Button variant='text' leftIcon={<Settings className='h-4 w-4' />}>View orchestrator YAML</Button>
              </aside>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value='datasets' className='space-y-4'>
          <WorkflowPanel
            title='Datasets catalogue'
            description='Watcher-ready datasets aggregated from crawlers and synthetic replays.'
            actions={
              <Button variant='outlined' leftIcon={<Database className='h-4 w-4' />} onClick={addSyntheticDataset}>
                Add synthetic replay
              </Button>
            }
          >
            <WorkflowPanelSection className='space-y-3 border-none pt-0'>
              {datasets.map((dataset) => (
                <article
                  key={dataset.id}
                  className='flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-outline/20 bg-surface-container-low px-4 py-4'
                >
                  <div>
                    <p className='md3-title-small text-on-surface'>{dataset.name}</p>
                    <p className='md3-body-small text-on-surface-variant/70'>
                      {dataset.records.toLocaleString()} records · Updated {dataset.lastUpdated}
                    </p>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='outline'>Source · {formatDatasetSource(dataset.sourceType)}</Badge>
                    <Button variant='text' size='sm' leftIcon={<Download className='h-4 w-4' />}>Export</Button>
                  </div>
                </article>
              ))}
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value='models' className='space-y-4'>
          <WorkflowPanel
            title='Model registry'
            description='Training progress and deployment health for LightDom mining models.'
          >
            <WorkflowPanelSection className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 border-none pt-0'>
              {models.map((model) => (
                <article
                  key={model.id}
                  className='flex flex-col gap-3 rounded-3xl border border-outline/20 bg-surface-container-low p-4'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <p className='md3-title-small text-on-surface'>{model.name}</p>
                    <Badge variant={modelStatusVariant[model.status]}>{model.status}</Badge>
                  </div>
                  <div className='space-y-1 text-sm text-on-surface-variant'>
                    <p>Accuracy · {(model.accuracy * 100).toFixed(1)}%</p>
                    <p>Latency · {model.latencyMs ? `${model.latencyMs}ms` : 'Pending'}</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outlined' size='sm'>Promote</Button>
                    <Button variant='text' size='sm'>View logs</Button>
                  </div>
                </article>
              ))}
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <WorkflowPanel
            title='Watcher telemetry'
            description='Wire this panel to the analytics API for live throughput and latency charts.'
          >
            <WorkflowPanelSection className='space-y-3 border-none pt-0 text-sm text-on-surface-variant'>
              <div className='flex h-64 items-center justify-center rounded-3xl border border-outline/20 bg-surface-container-low text-on-surface-variant/60'>
                Chart placeholder — connect to Chart.js when backend metrics land.
              </div>
              <Button variant='text' leftIcon={<RefreshCw className='h-4 w-4' />}>Configure chart bindings</Button>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataMiningOperationsDemoPage;
