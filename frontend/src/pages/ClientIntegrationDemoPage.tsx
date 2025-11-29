import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
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
  BarChart3,
  CloudLightning,
  FileText,
  Link as LinkIcon,
  PlugZap,
  Sparkles,
  Wifi,
} from 'lucide-react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

type LogLevel = 'info' | 'success' | 'warning' | 'error';

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
  level: LogLevel;
};

type IntegrationMetrics = {
  pageViews: number;
  optimizationsApplied: number;
  avgLoadTimeMs: number;
  optimizationScore: number;
  contentGenerated: number;
};

type OptimizationResult = {
  expectedGain: number;
  source: string;
  strategies: Array<{
    id: string;
    type: string;
    priority: 'high' | 'medium' | 'low';
    estimatedGain: number;
  }>;
};

const LOG_LEVEL_VARIANTS: Record<LogLevel, { label: string; variant: 'outline' | 'primary' | 'secondary' | 'warning' | 'error' | 'success' }> = {
  info: { label: 'Info', variant: 'secondary' },
  success: { label: 'Success', variant: 'success' },
  warning: { label: 'Warning', variant: 'warning' },
  error: { label: 'Error', variant: 'error' },
};

const DEFAULT_METRICS: IntegrationMetrics = {
  pageViews: 0,
  optimizationsApplied: 0,
  avgLoadTimeMs: 2200,
  optimizationScore: 0.68,
  contentGenerated: 0,
};

const ClientIntegrationDemoPage: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [clientInfo, setClientInfo] = useState<{ clientId: string; environment: 'staging' | 'production'; connectedAt: string } | null>(null);
  const [metrics, setMetrics] = useState<IntegrationMetrics>(DEFAULT_METRICS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [contentStream, setContentStream] = useState<string[]>([]);
  const [isSendingMetrics, setIsSendingMetrics] = useState(false);
  const [isRequestingOptimization, setIsRequestingOptimization] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const registerTimeout = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      callback();
      timersRef.current = timersRef.current.filter(activeTimer => activeTimer !== timer);
    }, delay);

    timersRef.current.push(timer);
  };

  const appendLog = (message: string, level: LogLevel = 'info') => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      level,
    };

    setLogs(current => [entry, ...current].slice(0, 60));
  };

  const handleConnect = () => {
    if (connectionState !== 'disconnected') return;

    setConnectionState('connecting');
    appendLog('Connecting to LightDom orchestration server…', 'info');

    registerTimeout(() => {
      const clientId = `demo-${Math.random().toString(36).slice(2, 8)}`;
      setConnectionState('connected');
      setClientInfo({ clientId, environment: 'staging', connectedAt: new Date().toLocaleString() });
      appendLog('Socket handshake succeeded — client registered.', 'success');
      appendLog(`Assigned Client ID: ${clientId}`, 'info');
      toast.success('Connected to LightDom');
    }, 900);
  };

  const handleDisconnect = () => {
    if (connectionState === 'disconnected') return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setConnectionState('disconnected');
    setClientInfo(null);
    setIsSendingMetrics(false);
    setIsRequestingOptimization(false);
    setIsGeneratingContent(false);
    appendLog('Disconnected from LightDom orchestration server.', 'warning');
    toast('Disconnected', { icon: '⚡' });
  };

  const handleSendMetrics = () => {
    if (connectionState !== 'connected') return;

    setIsSendingMetrics(true);
    appendLog('Dispatching telemetry payload to LightDom.', 'info');

    registerTimeout(() => {
      setMetrics(current => ({
        pageViews: current.pageViews + 1,
        optimizationsApplied: current.optimizationsApplied,
        avgLoadTimeMs: Math.round(1800 + Math.random() * 800),
        optimizationScore: Math.min(0.95, current.optimizationScore + Math.random() * 0.05),
        contentGenerated: current.contentGenerated,
      }));
      appendLog('Telemetry payload accepted (metrics: pageViews, performance).', 'success');
      toast.success('Metrics synced');
      setIsSendingMetrics(false);
    }, 700);
  };

  const handleRequestOptimization = () => {
    if (connectionState !== 'connected') return;

    setIsRequestingOptimization(true);
    appendLog('Submitting DOM optimization request…', 'info');

    registerTimeout(() => {
      const strategies = Array.from({ length: 3 }, (_, index) => ({
        id: `strat-${index + 1}`,
        type: ['bundle-splitting', 'critical-css', 'lazy-hydration'][index % 3],
        priority: (['high', 'medium', 'low'] as const)[index % 3],
        estimatedGain: 0.06 + Math.random() * 0.12,
      }));

      setOptimizationResult({
        expectedGain: 0.18 + Math.random() * 0.1,
        source: 'lightdom-ai-optimizer',
        strategies,
      });

      setMetrics(current => ({
        ...current,
        optimizationsApplied: current.optimizationsApplied + 1,
      }));

      appendLog('Optimization plan delivered. Strategies ready for review.', 'success');
      toast.success('Optimization plan ready');
      setIsRequestingOptimization(false);
    }, 1100);
  };

  const handleRequestContent = () => {
    if (connectionState !== 'connected') return;

    setIsGeneratingContent(true);
    setContentStream([]);
    appendLog('Requesting AI generated slot content stream…', 'info');

    const contentChunks = [
      'Heading: Elevate onboarding with adaptive DOM slots.',
      'Insight: Detected redundant CSS selectors in hero pipeline.',
      'Action: Propose bridge to route AI-driven personalization.',
      'CTA: Deploy optimization preset “lighthouse-alpha”.',
    ];

    contentChunks.forEach((chunk, index) => {
      registerTimeout(() => {
        setContentStream(current => [...current, chunk]);
        appendLog(`Content chunk streamed (${index + 1}/${contentChunks.length}).`, 'info');

        if (index === contentChunks.length - 1) {
          setMetrics(current => ({
            ...current,
            contentGenerated: current.contentGenerated + 1,
          }));
          appendLog('Content stream completed successfully.', 'success');
          toast.success('Content generation complete');
          setIsGeneratingContent(false);
        }
      }, 600 * (index + 1));
    });
  };

  useEffect(() => {
    appendLog('🚀 LightDom client integration demo ready. Connect to begin streaming.', 'info');

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const connectionBadge = useMemo(() => {
    if (connectionState === 'connected') {
      return <Badge variant='success' size='md'>Connected</Badge>;
    }

    if (connectionState === 'connecting') {
      return <Badge variant='warning' size='md'>Connecting…</Badge>;
    }

    return <Badge variant='outline' size='md'>Disconnected</Badge>;
  }, [connectionState]);

  return (
    <div className='px-8 py-6 space-y-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>LightDom Client Integration</h1>
            <p className='text-sm text-muted-foreground'>Simulate the full browser SDK workflow: sockets, telemetry, optimization hand-offs, and streaming content.</p>
          </div>
          <div className='flex items-center gap-2'>
            {connectionBadge}
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            variant='filled'
            size='md'
            leftIcon={<PlugZap className='h-4 w-4' />}
            onClick={handleConnect}
            disabled={connectionState !== 'disconnected'}
          >
            Connect to LightDom
          </Button>
          <Button
            variant='outlined'
            size='md'
            leftIcon={<Wifi className='h-4 w-4' />}
            onClick={handleDisconnect}
            disabled={connectionState === 'disconnected'}
          >
            Disconnect
          </Button>
          <Button
            variant='filled-tonal'
            size='md'
            leftIcon={<BarChart3 className='h-4 w-4' />}
            onClick={handleSendMetrics}
            disabled={connectionState !== 'connected'}
            isLoading={isSendingMetrics}
          >
            Send Metrics
          </Button>
          <Button
            variant='outlined'
            size='md'
            leftIcon={<CloudLightning className='h-4 w-4' />}
            onClick={handleRequestOptimization}
            disabled={connectionState !== 'connected'}
            isLoading={isRequestingOptimization}
          >
            Request Optimization
          </Button>
          <Button
            variant='text'
            size='md'
            leftIcon={<Sparkles className='h-4 w-4' />}
            onClick={handleRequestContent}
            disabled={connectionState !== 'connected'}
            isLoading={isGeneratingContent}
          >
            Generate Content
          </Button>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-3'>
        <Card className='xl:col-span-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <LinkIcon className='h-5 w-5 text-primary' />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3'>
              <span className={cn('h-3 w-3 rounded-full shadow-sm', connectionState === 'connected' ? 'bg-success' : connectionState === 'connecting' ? 'bg-warning' : 'bg-outline/40 animate-pulse')} />
              <div>
                <p className='text-sm font-medium text-foreground'>WebSocket Status</p>
                <p className='text-xs text-muted-foreground'>Real-time channel for LightDom orchestration events.</p>
              </div>
            </div>
            <dl className='grid grid-cols-2 gap-3 text-sm'>
              <div className='rounded-lg border border-border/60 bg-muted/40 p-3'>
                <dt className='text-xs text-muted-foreground'>Client ID</dt>
                <dd className='font-semibold text-foreground'>{clientInfo?.clientId ?? 'N/A'}</dd>
              </div>
              <div className='rounded-lg border border-border/60 bg-muted/40 p-3'>
                <dt className='text-xs text-muted-foreground'>Environment</dt>
                <dd className='font-semibold capitalize text-foreground'>{clientInfo?.environment ?? '—'}</dd>
              </div>
              <div className='rounded-lg border border-border/60 bg-muted/40 p-3'>
                <dt className='text-xs text-muted-foreground'>Connected At</dt>
                <dd className='font-semibold text-foreground'>{clientInfo?.connectedAt ?? '—'}</dd>
              </div>
              <div className='rounded-lg border border-border/60 bg-muted/40 p-3'>
                <dt className='text-xs text-muted-foreground'>Capabilities</dt>
                <dd className='font-semibold text-foreground'>Optimization · Content · Telemetry</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-primary' />
              Site Metrics Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='rounded-2xl border border-border bg-card/60 p-4'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>Page Views</p>
                <p className='mt-2 text-2xl font-semibold text-foreground'>{metrics.pageViews}</p>
                <Badge variant='outline' size='sm' className='mt-3 w-max'>SDK Sessions</Badge>
              </div>
              <div className='rounded-2xl border border-border bg-card/60 p-4'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>Optimizations Applied</p>
                <p className='mt-2 text-2xl font-semibold text-foreground'>{metrics.optimizationsApplied}</p>
                <Badge variant='primary' size='sm' className='mt-3 w-max'>AI Suggested</Badge>
              </div>
              <div className='rounded-2xl border border-border bg-card/60 p-4'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>Avg. Load Time</p>
                <p className='mt-2 text-2xl font-semibold text-foreground'>{metrics.avgLoadTimeMs}ms</p>
                <Badge variant='warning' size='sm' className='mt-3 w-max'>Performance</Badge>
              </div>
              <div className='rounded-2xl border border-border bg-card/60 p-4'>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>Optimization Score</p>
                <p className='mt-2 text-2xl font-semibold text-foreground'>{Math.round(metrics.optimizationScore * 100)}%</p>
                <Badge variant='success' size='sm' className='mt-3 w-max'>Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CloudLightning className='h-5 w-5 text-primary' />
              Optimization Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {optimizationResult ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div className='rounded-lg border border-border/50 bg-muted/40 p-3'>
                    <dt className='text-xs text-muted-foreground'>Expected Gain</dt>
                    <dd className='text-lg font-semibold text-foreground'>{Math.round(optimizationResult.expectedGain * 100)}%</dd>
                  </div>
                  <div className='rounded-lg border border-border/50 bg-muted/40 p-3'>
                    <dt className='text-xs text-muted-foreground'>Source</dt>
                    <dd className='text-sm font-medium text-foreground uppercase'>{optimizationResult.source}</dd>
                  </div>
                </div>
                <div className='space-y-3'>
                  {optimizationResult.strategies.map(strategy => (
                    <div key={strategy.id} className='rounded-xl border border-border/60 bg-card/60 p-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='text-sm font-semibold text-foreground capitalize'>{strategy.type.replace('-', ' ')}</p>
                          <p className='text-xs text-muted-foreground'>Expected gain: {(strategy.estimatedGain * 100).toFixed(1)}%</p>
                        </div>
                        <Badge variant={strategy.priority === 'high' ? 'error' : strategy.priority === 'medium' ? 'warning' : 'outline'} size='sm'>
                          Priority · {strategy.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center'>
                <CloudLightning className='mx-auto h-10 w-10 text-muted-foreground' />
                <p className='mt-3 text-sm font-medium text-foreground'>No optimization plan yet</p>
                <p className='text-xs text-muted-foreground'>Connect and request an optimization run to review AI generated strategies.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-primary' />
              Generated Content Stream
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-foreground'>
              {contentStream.length === 0 ? (
                <p className='text-muted-foreground'>No content streamed yet. Request generated content once connected to preview AI authored snippets.</p>
              ) : (
                contentStream.map((chunk, index) => (
                  <div key={index} className='rounded-lg border border-border/40 bg-card/70 p-3 shadow-sm'>
                    <p>{chunk}</p>
                  </div>
                ))
              )}
            </div>
            <div className='rounded-lg border border-border/60 bg-card/60 p-3 text-xs text-muted-foreground'>
              Latest stream count: <span className='font-semibold text-foreground'>{metrics.contentGenerated}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5 text-primary' />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='max-h-80 space-y-3 overflow-y-auto pr-2'>
            {logs.map(entry => (
              <div key={entry.id} className='rounded-xl border border-border/60 bg-card/50 p-3 shadow-sm'>
                <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
                  <span>{entry.timestamp}</span>
                  <Badge variant={LOG_LEVEL_VARIANTS[entry.level].variant} size='sm'>
                    {LOG_LEVEL_VARIANTS[entry.level].label}
                  </Badge>
                </div>
                <p className='mt-2 text-sm font-medium text-foreground'>{entry.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5 text-primary' />
            Client Integration Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            {
              title: 'Register Client',
              description: 'Emit `client:register` payload with site config to initialize orchestration session.',
              status: connectionState === 'connected' ? 'success' : 'pending',
            },
            {
              title: 'Sync Metrics',
              description: 'Send `metrics:send` events on heartbeat or page lifecycle checkpoints.',
              status: metrics.pageViews > 0 ? 'success' : 'pending',
            },
            {
              title: 'Apply Optimizations',
              description: 'Process `optimization:result` and update DOM slots or component bundles.',
              status: optimizationResult ? 'success' : 'pending',
            },
            {
              title: 'Stream Content',
              description: 'Handle `content:stream` responses to hydrate UI islands with generated copy.',
              status: contentStream.length > 0 ? 'success' : 'pending',
            },
          ].map(item => (
            <div key={item.title} className='rounded-2xl border border-border/60 bg-card/60 p-4'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-sm font-semibold text-foreground'>{item.title}</p>
                <Badge variant={item.status === 'success' ? 'success' : 'outline'} size='sm'>
                  {item.status === 'success' ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              <p className='mt-2 text-xs text-muted-foreground'>{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientIntegrationDemoPage;
