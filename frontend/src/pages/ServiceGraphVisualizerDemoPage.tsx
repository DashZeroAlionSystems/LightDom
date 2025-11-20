import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Activity,
  ArrowRightLeft,
  CircleDot,
  Layers,
  Play,
  RefreshCw,
  Square,
  Zap,
} from 'lucide-react';

type ServiceType = 'worker' | 'background' | 'api' | 'headless';
type ServiceState = 'running' | 'idle' | 'degraded';

type ServiceNode = {
  id: string;
  name: string;
  type: ServiceType;
  state: ServiceState;
  description: string;
  dependencies: string[];
  latencyMs: number;
};

type GraphEdge = { source: string; target: string; label: string };

const SERVICE_NODES: ServiceNode[] = [
  {
    id: 'svc-worker-orchestrator',
    name: 'Crawler Orchestrator',
    type: 'worker',
    state: 'running',
    description: 'Coordinates LightDom crawler jobs and schedules watcher hooks.',
    dependencies: ['svc-api-admin', 'svc-bg-metrics'],
    latencyMs: 42,
  },
  {
    id: 'svc-bg-metrics',
    name: 'Metrics Compiler',
    type: 'background',
    state: 'running',
    description: 'Aggregates watcher throughput metrics for dashboards.',
    dependencies: ['svc-headless-renderer'],
    latencyMs: 65,
  },
  {
    id: 'svc-api-admin',
    name: 'Admin API',
    type: 'api',
    state: 'running',
    description: 'Exposes REST endpoints for bundle + slot management.',
    dependencies: ['svc-bg-metrics'],
    latencyMs: 28,
  },
  {
    id: 'svc-headless-renderer',
    name: 'Headless Renderer',
    type: 'headless',
    state: 'degraded',
    description: 'Renders isolated LightDom experiences for preview.',
    dependencies: [],
    latencyMs: 143,
  },
];

const GRAPH_EDGES: GraphEdge[] = [
  { source: 'Crawler Orchestrator', target: 'Admin API', label: 'REST sync' },
  { source: 'Crawler Orchestrator', target: 'Metrics Compiler', label: 'Watcher metrics' },
  { source: 'Metrics Compiler', target: 'Headless Renderer', label: 'Render jobs' },
  { source: 'Admin API', target: 'Metrics Compiler', label: 'Status polling' },
];

const typeStyles: Record<ServiceType, string> = {
  worker: 'from-primary to-purple-500',
  background: 'from-pink-400 to-rose-500',
  api: 'from-sky-400 to-cyan-400',
  headless: 'from-emerald-400 to-teal-400',
};

const stateBadge: Record<ServiceState, { label: string; variant: 'success' | 'warning' | 'outline' }> = {
  running: { label: 'Running', variant: 'success' },
  idle: { label: 'Idle', variant: 'outline' },
  degraded: { label: 'Degraded', variant: 'warning' },
};

const ServiceGraphVisualizerDemoPage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(
    () => [
      { label: 'Services', value: SERVICE_NODES.length },
      { label: 'Running', value: SERVICE_NODES.filter((node) => node.state === 'running').length },
      { label: 'Dependencies', value: GRAPH_EDGES.length },
      {
        label: 'Max latency',
        value: `${Math.max(...SERVICE_NODES.map((node) => node.latencyMs))}ms`,
      },
    ],
    [],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setConnected(true);
    }, 750);
  };

  const toggleConnection = () => setConnected((value) => !value);

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/10 bg-gradient-to-br from-primary/20 via-surface-container-high to-surface p-6 shadow-level-1'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Layers className='h-4 w-4' />
              Service graph visualizer
            </div>
            <div>
              <h1 className='text-3xl font-semibold text-on-surface md:text-4xl'>Map LightDom service dependencies</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Inspect orchestration services, evaluate latency, and simulate watcher connections across worker, background, API, and headless nodes.
              </p>
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            {stats.map((stat) => (
              <Card key={stat.label} className='border-outline/20 bg-surface-container-low min-w-[140px]'>
                <CardContent className='flex flex-col gap-1 py-4'>
                  <span className='text-xs uppercase tracking-wide text-on-surface-variant/70'>{stat.label}</span>
                  <span className='text-2xl font-semibold text-on-surface'>{stat.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <Card className='border-outline/15 bg-surface'>
        <CardHeader className='flex flex-wrap items-center gap-3'>
          <CardTitle className='text-on-surface'>Controls</CardTitle>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              leftIcon={refreshing ? <RefreshCw className='h-4 w-4 animate-spin' /> : <RefreshCw className='h-4 w-4' />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing…' : 'Refresh graph'}
            </Button>
            <Button variant='outlined' leftIcon={<Play className='h-4 w-4' />}>
              Start all
            </Button>
            <Button variant='text' leftIcon={<Square className='h-4 w-4' />}>
              Stop all
            </Button>
            <Badge variant={connected ? 'success' : 'warning'} className='ml-auto'>
              {connected ? '🟢 Connected' : '⚫ Disconnected'}
            </Badge>
            <Button variant='text' size='sm' onClick={toggleConnection}>
              Toggle connection
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <ArrowRightLeft className='h-5 w-5 text-primary' />
              Graph overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative h-[420px] rounded-3xl border border-outline/10 bg-surface-container-low p-6'>
              <div className='grid h-full grid-cols-2 gap-6'>
                {SERVICE_NODES.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      'flex flex-col gap-2 rounded-2xl bg-gradient-to-br p-4 text-on-primary shadow-level-2 transition-transform hover:-translate-y-1',
                      typeStyles[node.type],
                    )}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div>
                        <p className='text-sm font-semibold uppercase tracking-wide'>{node.type}</p>
                        <h3 className='text-lg font-semibold'>{node.name}</h3>
                      </div>
                      <Badge variant={stateBadge[node.state].variant}>{stateBadge[node.state].label}</Badge>
                    </div>
                    <p className='text-sm text-white/90'>{node.description}</p>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-white/80'>
                      <span className='flex items-center gap-1'>
                        <Activity className='h-4 w-4' /> {node.latencyMs}ms latency
                      </span>
                      {node.dependencies.length > 0 && (
                        <span className='flex items-center gap-1'>
                          <CircleDot className='h-4 w-4' /> {node.dependencies.length} deps
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className='absolute inset-x-6 bottom-6 rounded-2xl border border-white/20 bg-black/20 p-4 text-sm text-white/80 backdrop-blur'>
                <p className='font-semibold'>Edges</p>
                <div className='mt-2 flex flex-wrap gap-2 text-xs'>
                  {GRAPH_EDGES.map((edge) => (
                    <Badge key={`${edge.source}-${edge.target}`} variant='outline' className='border-white/30 text-white'>
                      {edge.source} → {edge.target} · {edge.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Service inventory</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {SERVICE_NODES.map((service) => (
                <Card key={service.id} className='border-outline/15 bg-surface-container-low'>
                  <CardContent className='flex flex-col gap-2 py-4'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div>
                        <p className='text-sm font-semibold text-on-surface'>{service.name}</p>
                        <p className='text-xs text-on-surface-variant/70'>ID · {service.id}</p>
                      </div>
                      <Badge variant={stateBadge[service.state].variant}>{stateBadge[service.state].label}</Badge>
                    </div>
                    <p className='text-sm text-on-surface-variant'>{service.description}</p>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80'>
                      <Badge variant='outline'>Type · {service.type}</Badge>
                      <Badge variant='outline'>Latency · {service.latencyMs}ms</Badge>
                      {service.dependencies.length > 0 ? (
                        <Badge variant='outline'>Deps · {service.dependencies.join(', ')}</Badge>
                      ) : (
                        <Badge variant='outline'>Deps · none</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <Zap className='h-5 w-5 text-primary' />
                Session diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-on-surface-variant'>
              <p>• Last refresh populated {SERVICE_NODES.length} services with {GRAPH_EDGES.length} dependency edges.</p>
              <p>• Headless renderer latency is being watched — follow-up with automation squad if it exceeds 200ms.</p>
              <p>• Replace the mock nodes with data from the service graph API when available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceGraphVisualizerDemoPage;
