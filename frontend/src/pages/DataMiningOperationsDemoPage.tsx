import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextArea,
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

const statusBadge: Record<OperationStatus, { label: string; variant: 'primary' | 'success' | 'warning' | 'destructive' }> = {
  running: { label: 'Running', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  failed: { label: 'Failed', variant: 'destructive' },
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: <Rocket className='h-4 w-4' /> },
  { id: 'operations', label: 'Operations', icon: <Activity className='h-4 w-4' /> },
  { id: 'scraping', label: 'Scraping Config', icon: <CloudLightning className='h-4 w-4' /> },
  { id: 'datasets', label: 'Datasets', icon: <Database className='h-4 w-4' /> },
  { id: 'models', label: 'Models', icon: <Cpu className='h-4 w-4' /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className='h-4 w-4' /> },
] as const;

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
      },
      {
        label: 'Datasets',
        value: datasets.length,
        description: 'Catalogued & ready for watchers',
      },
      {
        label: 'Models deployed',
        value: models.filter((model) => model.status === 'deployed').length,
        description: 'Serving inference traffic',
      },
      {
        label: 'Automation uptime',
        value: '99.2%',
        description: 'Past 24 hour window',
      },
    ],
    [operations, datasets, models],
  );

  const triggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    window.setTimeout(() => {
      setOperations((current) =>
        current.map((op) =>
          op.status === 'running'
            ? { ...op, progress: Math.min(op.progress + 6, 100), status: op.progress + 6 >= 100 ? 'completed' : 'running' }
            : op,
        ),
      );
      toast.success('Graph updated with latest watcher telemetry');
      setIsRefreshing(false);
    }, 1200);
  };

  const handleConfigSubmit = () => {
    toast.success('Crawler configuration queued');
    setNewConfig((current) => ({ ...current, name: `${current.name} ✓` }));
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
      <header className='rounded-3xl border border-outline/10 bg-gradient-to-br from-primary/25 via-surface-container-high to-surface p-6 shadow-level-2 text-on-surface'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Sparkles className='h-4 w-4' />
              Data mining observatory
            </div>
            <div>
              <h1 className='text-3xl font-semibold md:text-4xl'>Monitor mining orchestration and analytics</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Track crawler jobs, training pipelines, and watcher-sourced datasets with LightDom-aligned telemetry.
              </p>
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            {stats.map((stat) => (
              <Card key={stat.label} className='border-outline/20 bg-surface-container-low min-w-[160px]'>
                <CardContent className='space-y-1 py-4'>
                  <span className='text-xs uppercase tracking-wide text-on-surface-variant/70'>{stat.label}</span>
                  <p className='text-2xl font-semibold text-on-surface'>{stat.value}</p>
                  <p className='text-xs text-on-surface-variant/60'>{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList className='flex flex-wrap gap-2 rounded-full border border-outline/15 bg-surface-container-high p-1 shadow-level-1'>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className='gap-2'>
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-on-surface'>Automation control centre</CardTitle>
              <Button onClick={triggerRefresh} leftIcon={<RefreshCw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing…' : 'Refresh graph'}
              </Button>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <Card className='border-outline/10 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <Activity className='h-5 w-5 text-primary' /> Active operations
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-on-surface-variant'>
                  {operations.map((operation) => (
                    <div key={operation.id} className='rounded-2xl border border-outline/10 bg-surface px-4 py-3'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <p className='font-semibold text-on-surface'>{operation.name}</p>
                        {formatStatusBadge(operation.status)}
                      </div>
                      <p className='text-xs text-on-surface-variant/70'>Owner · {operation.owner}</p>
                      <div className='mt-2 h-2 overflow-hidden rounded-full bg-outline/10'>
                        <div
                          className='h-full rounded-full bg-primary transition-all'
                          style={{ width: `${operation.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className='border-outline/10 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-on-surface'>
                    <Settings className='h-5 w-5 text-primary' /> Pipeline health
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-on-surface-variant'>
                  <div className='rounded-2xl border border-outline/10 bg-surface px-4 py-3'>
                    <p className='font-semibold text-on-surface'>Watcher throughput</p>
                    <p className='text-xs text-on-surface-variant/70'>44.1k events / hour</p>
                  </div>
                  <div className='rounded-2xl border border-outline/10 bg-surface px-4 py-3'>
                    <p className='font-semibold text-on-surface'>Crawler error budget</p>
                    <p className='text-xs text-on-surface-variant/70'>2.3% burn (target 5%)</p>
                  </div>
                  <div className='rounded-2xl border border-outline/10 bg-surface px-4 py-3'>
                    <p className='font-semibold text-on-surface'>Bridge latency</p>
                    <p className='text-xs text-on-surface-variant/70'>Mean 68ms • P95 112ms</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='operations' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Operations detail</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='overflow-x-auto rounded-2xl border border-outline/10'>
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
              <div className='flex flex-wrap gap-2'>
                <Button variant='outlined' leftIcon={<Download className='h-4 w-4' />}>
                  Export operations CSV
                </Button>
                <Button variant='text' leftIcon={<ShieldAlert className='h-4 w-4' />}>
                  View incident reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='scraping' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Crawler configuration</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-4'>
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
                <label className='text-xs uppercase tracking-wide text-on-surface-variant/70'>Source type</label>
                <select
                  className='rounded-2xl border border-outline/20 bg-surface-container-low p-3 text-sm text-on-surface'
                  value={newConfig.sourceType}
                  onChange={(event) => setNewConfig((current) => ({ ...current, sourceType: event.target.value }))}
                >
                  <option value='website'>Website</option>
                  <option value='api'>API</option>
                  <option value='sitemap'>Sitemap</option>
                  <option value='dataset'>Dataset</option>
                </select>
                <Button leftIcon={<Sparkles className='h-4 w-4' />} onClick={handleConfigSubmit}>
                  Queue configuration
                </Button>
              </div>
              <Card className='border-outline/10 bg-surface-container-low'>
                <CardHeader>
                  <CardTitle className='text-on-surface'>Watcher preview</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm text-on-surface-variant'>
                  <p>Queued configs stream into the crawler orchestrator. Watcher agents validate robots.txt, throttle respect, and patch the slot registry.</p>
                  <p>Use rate limit and max depth to tune load profiles before production rollout. Attachments show up under the datasets tab.</p>
                  <Button variant='text' leftIcon={<Settings className='h-4 w-4' />}>
                    View orchestrator YAML
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='datasets' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-on-surface'>Datasets catalogue</CardTitle>
              <Button variant='outlined' leftIcon={<Database className='h-4 w-4' />} onClick={addSyntheticDataset}>
                Add synthetic replay
              </Button>
            </CardHeader>
            <CardContent className='space-y-3'>
              {datasets.map((dataset) => (
                <Card key={dataset.id} className='border-outline/10 bg-surface-container-low'>
                  <CardContent className='flex flex-wrap items-center justify-between gap-3 py-4'>
                    <div>
                      <p className='text-sm font-semibold text-on-surface'>{dataset.name}</p>
                      <p className='text-xs text-on-surface-variant/70'>Records · {dataset.records.toLocaleString()} • Updated {dataset.lastUpdated}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>Source · {dataset.sourceType}</Badge>
                      <Button variant='text' size='sm' leftIcon={<Download className='h-4 w-4' />}>
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='models' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Model registry</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-3'>
              {models.map((model) => (
                <Card key={model.id} className='border-outline/10 bg-surface-container-low'>
                  <CardContent className='space-y-3 py-5'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-sm font-semibold text-on-surface'>{model.name}</p>
                      <Badge variant='outline'>{model.status}</Badge>
                    </div>
                    <div className='text-sm text-on-surface-variant space-y-1'>
                      <p>Accuracy · {(model.accuracy * 100).toFixed(1)}%</p>
                      <p>Latency · {model.latencyMs ? `${model.latencyMs}ms` : 'Pending'}</p>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant='outlined' size='sm'>Promote</Button>
                      <Button variant='text' size='sm'>View logs</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <BarChart3 className='h-5 w-5 text-primary' /> Watcher telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-on-surface-variant'>
              <div className='h-64 rounded-3xl border border-outline/10 bg-surface-container-low p-4 text-center text-on-surface-variant/60'>
                Chart placeholder – wire to Chart.js instance when backend metrics endpoint is ready.
              </div>
              <p>Hook this panel up to the analytics API for live throughput and latency charts. The original HTML demo used Chart.js; this MD3 variant keeps the placeholder ready for hydration.</p>
              <Button variant='text' leftIcon={<RefreshCw className='h-4 w-4' />}>
                Configure chart bindings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataMiningOperationsDemoPage;
