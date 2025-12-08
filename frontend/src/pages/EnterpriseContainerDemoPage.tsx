import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TextArea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Box,
  CheckCircle2,
  CircleDot,
  CloudCog,
  Code2,
  Cpu,
  Gauge,
  Layers,
  PlayCircle,
  RefreshCw,
  ScrollText,
  ServerCog,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Wrench,
} from 'lucide-react';

type ViewId =
  | 'dashboard'
  | 'analysis'
  | 'containers'
  | 'optimizations'
  | 'monitoring'
  | 'settings';

type ContainerStatus = 'initializing' | 'ready' | 'analyzing' | 'error';

type LogSeverity = 'info' | 'success' | 'warning' | 'error';

type LogEntry = {
  id: string;
  timestamp: number;
  message: string;
  severity: LogSeverity;
};

type AnalysisSnapshot = {
  qualityScore: number;
  performanceScore: number;
  issuesFound: number;
  summary: string;
  projectTree: Array<{ path: string; description: string }>;
};

type ContainerRecord = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'provisioning';
  runtime: string;
  lastSync: string;
};

type OptimizationPlan = {
  id: string;
  createdAt: string;
  impact: number;
  items: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
};

type SettingsState = {
  autoOptimization: boolean;
  realtimeMonitoring: boolean;
  selfHealing: boolean;
  deepAnalysis: boolean;
  performanceProfiling: boolean;
  securityScanning: boolean;
};

const VIEW_CONFIG: Array<{ id: ViewId; label: string; icon: React.ReactNode; helper: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <Layers className='h-4 w-4' />, helper: 'Overview metrics and quick actions' },
  { id: 'analysis', label: 'Code Analysis', icon: <BarChart3 className='h-4 w-4' />, helper: 'AI assisted quality checks' },
  { id: 'containers', label: 'Dev Containers', icon: <ServerCog className='h-4 w-4' />, helper: 'Manage enterprise containers' },
  { id: 'optimizations', label: 'Optimization Center', icon: <Sparkles className='h-4 w-4' />, helper: 'Generate automation plans' },
  { id: 'monitoring', label: 'Monitoring', icon: <Activity className='h-4 w-4' />, helper: 'Live telemetry and logs' },
  { id: 'settings', label: 'Settings', icon: <Settings className='h-4 w-4' />, helper: 'Automation preferences' },
];

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-seed-1',
    timestamp: Date.now() - 30_000,
    message: '🚀 Enterprise container demo initialised — all services booted.',
    severity: 'info',
  },
  {
    id: 'log-seed-2',
    timestamp: Date.now() - 20_000,
    message: '✅ Browser automation channel connected (headless-chrome-01).',
    severity: 'success',
  },
  {
    id: 'log-seed-3',
    timestamp: Date.now() - 10_000,
    message: 'ℹ️ Watching repository for schema and workflow updates.',
    severity: 'info',
  },
];

const INITIAL_SETTINGS: SettingsState = {
  autoOptimization: true,
  realtimeMonitoring: true,
  selfHealing: true,
  deepAnalysis: true,
  performanceProfiling: false,
  securityScanning: true,
};

const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString();

const createLog = (message: string, severity: LogSeverity = 'info'): LogEntry => ({
  id: `log-${crypto.randomUUID()}`,
  timestamp: Date.now(),
  message,
  severity,
});

const EnterpriseContainerDemoPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [containerStatus, setContainerStatus] = useState<ContainerStatus>('initializing');
  const [uptimeSeconds, setUptimeSeconds] = useState(2385);
  const [analysis, setAnalysis] = useState<AnalysisSnapshot | null>(null);
  const [containers, setContainers] = useState<ContainerRecord[]>([
    {
      id: 'ctr-main-dev',
      name: 'Headless Chrome – Production',
      status: 'active',
      runtime: 'Chrome 120',
      lastSync: '2 minutes ago',
    },
  ]);
  const [plan, setPlan] = useState<OptimizationPlan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [isProvisioningContainer, setIsProvisioningContainer] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [monitoringMetrics, setMonitoringMetrics] = useState({
    memory: 62,
    cpu: 38,
    processes: 6,
    network: 420,
  });
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const enqueueTimer = (cb: () => void, delay: number) => {
    const timer = setTimeout(() => {
      cb();
      timersRef.current = timersRef.current.filter((entry) => entry !== timer);
    }, delay);
    timersRef.current.push(timer);
  };

  useEffect(() => {
    appendLog('Environment preparing enterprise dev container…', 'info');
    enqueueTimer(() => {
      setContainerStatus('ready');
      appendLog('Container status changed to ready — monitoring engaged.', 'success');
    }, 1200);

    const uptimeInterval = setInterval(() => {
      setUptimeSeconds((value) => value + 1);
    }, 1000);

    const telemetryInterval = setInterval(() => {
      setMonitoringMetrics((current) => ({
        memory: Math.max(48, Math.min(82, current.memory + (Math.random() * 6 - 3))),
        cpu: Math.max(24, Math.min(68, current.cpu + (Math.random() * 8 - 4))),
        processes: Math.max(4, Math.min(10, current.processes + (Math.random() > 0.7 ? 1 : 0))),
        network: Math.max(180, Math.min(720, current.network + (Math.random() * 80 - 40))),
      }));

      if (Math.random() > 0.7) {
        appendLog('ℹ️ Heartbeat received from monitoring agent.', 'info');
      }
    }, 8000);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      clearInterval(uptimeInterval);
      clearInterval(telemetryInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appendLog = (message: string, severity: LogSeverity = 'info') => {
    setLogs((current) => {
      const next = [...current, createLog(message, severity)];
      return next.slice(-120);
    });
  };

  const formattedUptime = useMemo(() => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, [uptimeSeconds]);

  const dashboardMetrics = useMemo(
    () => [
      {
        title: 'Quality score',
        value: analysis ? `${analysis.qualityScore}%` : '—',
        helper: 'Latest AI audit score',
        tone: 'primary' as const,
        icon: <ShieldCheck className='h-5 w-5 text-success' />,
      },
      {
        title: 'Performance index',
        value: analysis ? `${analysis.performanceScore}%` : '—',
        helper: 'Bundle + runtime signals',
        tone: 'warning' as const,
        icon: <Gauge className='h-5 w-5 text-warning' />,
      },
      {
        title: 'Active containers',
        value: `${containers.filter((item) => item.status === 'active').length}`,
        helper: 'Currently orchestrated',
        tone: 'success' as const,
        icon: <Cpu className='h-5 w-5 text-success' />,
      },
      {
        title: 'Optimization plans',
        value: plan ? '1 active' : '0',
        helper: 'Awaiting approval',
        tone: 'info' as const,
        icon: <Sparkles className='h-5 w-5 text-primary' />,
      },
    ],
    [analysis, containers, plan],
  );

  const monitoringCards = useMemo(
    () => [
      {
        label: 'Memory usage',
        value: `${monitoringMetrics.memory.toFixed(0)} %`,
        progress: monitoringMetrics.memory,
        tone: 'warning' as const,
      },
      {
        label: 'CPU usage',
        value: `${monitoringMetrics.cpu.toFixed(0)} %`,
        progress: monitoringMetrics.cpu,
        tone: 'primary' as const,
      },
      {
        label: 'Active processes',
        value: monitoringMetrics.processes.toString(),
        progress: (monitoringMetrics.processes / 12) * 100,
        tone: 'success' as const,
      },
      {
        label: 'Network I/O',
        value: `${monitoringMetrics.network.toFixed(0)} kb/s`,
        progress: Math.min(100, (monitoringMetrics.network / 800) * 100),
        tone: 'info' as const,
      },
    ],
    [monitoringMetrics],
  );

  const handleRunAnalysis = () => {
    if (isRunningAnalysis) return;

    setIsRunningAnalysis(true);
    setContainerStatus('analyzing');
    appendLog('🔍 Starting deep code analysis workflow…', 'info');

    enqueueTimer(() => {
      setAnalysis({
        qualityScore: 92,
        performanceScore: 87,
        issuesFound: 4,
        summary:
          'Codebase healthy. AI suggested pruning unused selectors, enabling route-level code splitting, and tightening API contract schemas.',
        projectTree: [
          { path: 'src/pages/EnterpriseDashboard.tsx', description: 'High cohesion — ready for slot extraction.' },
          { path: 'src/components/containers/DevContainerPanel.tsx', description: 'Consider converting to compound component.' },
          { path: 'scripts/automation/setup.ts', description: 'Add error handling for Windows environment.' },
        ],
      });
      appendLog('✅ Analysis complete. New insights available in Code Analysis tab.', 'success');
      setIsRunningAnalysis(false);
      setContainerStatus('ready');
      toast.success('Code analysis finished');
    }, 1800);
  };

  const handleCreateContainer = () => {
    if (isProvisioningContainer) return;

    setIsProvisioningContainer(true);
    appendLog('Creating enterprise dev container (Chrome · Playwright · Node).', 'info');

    enqueueTimer(() => {
      const record: ContainerRecord = {
        id: `ctr-${crypto.randomUUID().slice(0, 6)}`,
        name: 'Automation Worker Container',
        status: 'provisioning',
        runtime: 'Node 20 · Chromium',
        lastSync: 'a moment ago',
      };
      setContainers((current) => [record, ...current]);
      appendLog('Container provisioning started — awaiting readiness signal.', 'warning');
    }, 600);

    enqueueTimer(() => {
      setContainers((current) =>
        current.map((item, index) =>
          index === 0
            ? {
                ...item,
                status: 'active',
                lastSync: 'just now',
              }
            : item,
        ),
      );
      appendLog('✅ New container online — telemetry stream enabled.', 'success');
      setIsProvisioningContainer(false);
      toast.success('Container created');
    }, 1800);
  };

  const handleGeneratePlan = () => {
    if (isGeneratingPlan) return;

    setIsGeneratingPlan(true);
    appendLog('Synthesising optimization plan using LightDom AI orchestrator…', 'info');

    enqueueTimer(() => {
      setPlan({
        id: `plan-${crypto.randomUUID().slice(0, 6)}`,
        createdAt: new Date().toLocaleString(),
        impact: 0.21,
        items: [
          {
            id: 'opt-1',
            title: 'Enable critical CSS streaming',
            description: 'Extract fold-critical styles and stream via <link rel="preload">.',
            priority: 'high',
          },
          {
            id: 'opt-2',
            title: 'Adopt server-driven slot paths',
            description: 'Leverage LightDom slot coordinator to reduce DOM churn.',
            priority: 'medium',
          },
          {
            id: 'opt-3',
            title: 'Activate automated bridge testing',
            description: 'Use automation CLI to validate container workflows nightly.',
            priority: 'low',
          },
        ],
      });
      appendLog('✅ Optimization plan ready — review recommended actions.', 'success');
      setIsGeneratingPlan(false);
      toast.success('Optimization plan generated');
    }, 1500);
  };

  const handleClearLogs = () => {
    setLogs([]);
    appendLog('Log stream cleared by operator.', 'warning');
  };

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
    appendLog(`Setting toggled → ${key}`, 'info');
  };

  const renderDashboard = () => (
    <div className='space-y-6'>
      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {dashboardMetrics.map((metric) => (
          <Card key={metric.title} className='border-outline/15 bg-surface shadow-level-1'>
            <CardHeader className='flex items-center justify-between gap-2'>
              <CardTitle className='text-on-surface'>{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-semibold text-on-surface'>{metric.value}</p>
              <p className='text-xs text-on-surface-variant/70'>{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Wrench className='h-5 w-5 text-primary' />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            <Button leftIcon={<BarChart3 className='h-4 w-4' />} onClick={handleRunAnalysis} isLoading={isRunningAnalysis}>
              Run analysis
            </Button>
            <Button
              variant='outlined'
              leftIcon={<ServerCog className='h-4 w-4' />}
              onClick={handleCreateContainer}
              isLoading={isProvisioningContainer}
            >
              Provision container
            </Button>
            <Button variant='outlined' leftIcon={<Sparkles className='h-4 w-4' />} onClick={handleGeneratePlan} isLoading={isGeneratingPlan}>
              Generate optimization plan
            </Button>
            <Button variant='text' leftIcon={<Terminal className='h-4 w-4' />} onClick={() => setActiveView('monitoring')}>
              View telemetry
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderAnalysis = () => (
    <div className='space-y-6'>
      <Card className='border-outline/15 bg-surface'>
        <CardHeader className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2 text-on-surface'>
            <ScrollText className='h-5 w-5 text-secondary' />
            Analysis summary
          </CardTitle>
          <Button variant='text' leftIcon={<RefreshCw className='h-4 w-4' />} onClick={handleRunAnalysis} isLoading={isRunningAnalysis}>
            Re-run analysis
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {analysis ? (
            <>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-2xl border border-outline/15 bg-surface-container-low p-4 text-sm text-on-surface'>
                  <p className='text-xs uppercase tracking-wide text-on-surface-variant/70'>Quality score</p>
                  <p className='mt-1 text-3xl font-semibold'>{analysis.qualityScore}%</p>
                  <p className='mt-1 text-xs text-on-surface-variant/70'>Signals compiled from lint, AI heuristic, and component audits.</p>
                </div>
                <div className='rounded-2xl border border-outline/15 bg-surface-container-low p-4 text-sm text-on-surface'>
                  <p className='text-xs uppercase tracking-wide text-on-surface-variant/70'>Performance index</p>
                  <p className='mt-1 text-3xl font-semibold'>{analysis.performanceScore}%</p>
                  <p className='mt-1 text-xs text-on-surface-variant/70'>Bundler insights, hydration footprint, and slot allocations.</p>
                </div>
              </div>
              <div>
                <p className='text-sm font-medium text-on-surface'>Summary</p>
                <p className='mt-1 text-sm text-on-surface-variant'>{analysis.summary}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-on-surface'>Focus files</p>
                <div className='mt-2 space-y-2'>
                  {analysis.projectTree.map((item) => (
                    <div key={item.path} className='rounded-xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface'>
                      <p className='font-medium'>{item.path}</p>
                      <p className='text-xs text-on-surface-variant/70'>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className='rounded-3xl border border-dashed border-outline/20 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant'>
              <CircleDot className='mx-auto h-8 w-8 text-on-surface-variant/60' />
              <p className='mt-3 font-medium text-on-surface'>No analysis yet</p>
              <p className='text-xs text-on-surface-variant/70'>Run the analysis workflow to populate code quality metrics.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='border-outline/15 bg-surface'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-on-surface'>
            <Code2 className='h-5 w-5 text-primary' />
            Analysis notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea
            rows={6}
            placeholder='Document follow-up actions, schema updates, or automation tasks…'
            className='text-sm'
            helperText='Notes are stored locally for demo purposes — wire into LightDom knowledge graph for collaboration.'
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderContainers = () => (
    <div className='space-y-6'>
      <Card className='border-outline/15 bg-surface'>
        <CardHeader className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2 text-on-surface'>
            <ServerCog className='h-5 w-5 text-primary' />
            Container fleet
          </CardTitle>
          <Button leftIcon={<PlayCircle className='h-4 w-4' />} onClick={handleCreateContainer} isLoading={isProvisioningContainer}>
            Create container
          </Button>
        </CardHeader>
        <CardContent className='space-y-3'>
          {containers.map((container) => (
            <div key={container.id} className='rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='font-medium'>{container.name}</p>
                  <p className='text-xs text-on-surface-variant/70'>Runtime: {container.runtime}</p>
                </div>
                <Badge
                  variant={
                    container.status === 'active'
                      ? 'success'
                      : container.status === 'paused'
                      ? 'outline'
                      : 'warning'
                  }
                >
                  {container.status === 'active' ? 'Active' : container.status === 'paused' ? 'Paused' : 'Provisioning'}
                </Badge>
              </div>
              <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/70'>
                <span>ID · {container.id}</span>
                <span>•</span>
                <span>Last sync {container.lastSync}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className='grid gap-4 md:grid-cols-2'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Layers className='h-5 w-5 text-secondary' />
              Container templates
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-on-surface'>
            {["Performance tuned", "Security hardened", "Analytics ready"].map((title, index) => (
              <div key={title} className='rounded-xl border border-outline/15 bg-surface-container-low px-4 py-3'>
                <p className='font-semibold'>{title}</p>
                <p className='text-xs text-on-surface-variant/70'>
                  {index === 0 && 'Optimised for render throughput with Lighthouse presets.'}
                  {index === 1 && 'Includes SOC2 control set, secret scanning, and audit hooks.'}
                  {index === 2 && 'Ships with ML toolchain, metrics exporters, and data slots.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <CloudCog className='h-5 w-5 text-primary' />
              Automated triggers
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-on-surface'>
            {[
              'Nightly bundle audits',
              'Regression lint sweeps',
              'Schema diff alerts',
              'Bridge availability checks',
            ].map((item) => (
              <div key={item} className='flex items-center justify-between rounded-xl border border-outline/15 bg-surface-container-low px-4 py-2'>
                <span>{item}</span>
                <Badge variant='outline' size='sm'>Enabled</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderOptimizations = () => (
    <div className='space-y-6'>
      <Card className='border-outline/15 bg-surface'>
        <CardHeader className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2 text-on-surface'>
            <Sparkles className='h-5 w-5 text-primary' />
            Optimization plan
          </CardTitle>
          <Button leftIcon={<RefreshCw className='h-4 w-4' />} onClick={handleGeneratePlan} isLoading={isGeneratingPlan}>
            Regenerate plan
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {plan ? (
            <>
              <div className='flex flex-wrap items-center gap-3 text-sm text-on-surface-variant/70'>
                <Badge variant='secondary' size='sm'>Plan ID · {plan.id}</Badge>
                <span>Created {plan.createdAt}</span>
                <span>•</span>
                <span className='font-medium text-success'>Estimated impact {Math.round(plan.impact * 100)}%</span>
              </div>
              <div className='space-y-3'>
                {plan.items.map((item) => (
                  <div key={item.id} className='rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div>
                        <p className='font-semibold'>{item.title}</p>
                        <p className='text-xs text-on-surface-variant/70'>{item.description}</p>
                      </div>
                      <Badge
                        variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'outline'}
                        size='sm'
                      >
                        Priority · {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='rounded-3xl border border-dashed border-outline/20 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant'>
              <Sparkles className='mx-auto h-8 w-8 text-on-surface-variant/60' />
              <p className='mt-3 font-medium text-on-surface'>No active plan</p>
              <p className='text-xs text-on-surface-variant/70'>Generate an optimization plan to view recommended actions and expected impact.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <section className='grid gap-4 md:grid-cols-2'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Box className='h-5 w-5 text-secondary' />
              Applied optimizations
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-on-surface'>
            {['Slot hydration upgrade', 'Watcher metadata sync', 'Legacy CSS pruning'].map((item) => (
              <div key={item} className='flex items-center justify-between rounded-xl border border-outline/15 bg-surface-container-low px-4 py-2'>
                <span>{item}</span>
                <Badge variant='success' size='sm'>Completed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <CloudCog className='h-5 w-5 text-primary' />
              Automation checklist
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-on-surface'>
            {[
              { label: 'Container health alerts', done: true },
              { label: 'Bridge regression suite', done: false },
              { label: 'Workflow wizard smoke tests', done: true },
              { label: 'Schema consistency scans', done: false },
            ].map((item) => (
              <div key={item.label} className='flex items-center gap-3 rounded-xl border border-outline/15 bg-surface-container-low px-4 py-2'>
                <CheckCircle2 className={cn('h-4 w-4', item.done ? 'text-success' : 'text-on-surface-variant/50')} />
                <span className={cn('text-sm', item.done ? 'text-on-surface' : 'text-on-surface-variant/70')}>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderMonitoring = () => (
    <div className='space-y-6'>
      <section className='grid gap-4 md:grid-cols-2'>
        {monitoringCards.map((card) => (
          <Card key={card.label} className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold text-on-surface'>{card.value}</p>
              <div className='mt-3 h-2 rounded-full bg-outline/10'>
                <div
                  className={cn(
                    'h-full rounded-full',
                    card.tone === 'primary' && 'bg-primary',
                    card.tone === 'warning' && 'bg-warning',
                    card.tone === 'success' && 'bg-success',
                    card.tone === 'info' && 'bg-secondary',
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className='border-outline/15 bg-surface'>
        <CardHeader className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2 text-on-surface'>
            <Terminal className='h-5 w-5 text-primary' />
            Log stream
          </CardTitle>
          <Button variant='text' leftIcon={<Trash2 className='h-4 w-4' />} onClick={handleClearLogs}>
            Clear logs
          </Button>
        </CardHeader>
        <CardContent className='max-h-[360px] space-y-2 overflow-y-auto pr-2'>
          {logs
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-sm shadow-sm',
                  entry.severity === 'info' && 'border-outline/15 bg-surface-container-low text-on-surface-variant',
                  entry.severity === 'success' && 'border-success/30 bg-success/10 text-on-surface',
                  entry.severity === 'warning' && 'border-warning/30 bg-warning/10 text-on-surface',
                  entry.severity === 'error' && 'border-error/40 bg-error/10 text-on-surface',
                )}
              >
                <div className='flex items-center justify-between gap-2 text-xs text-on-surface-variant/70'>
                  <span>{formatTime(entry.timestamp)}</span>
                  <Badge
                    variant={
                      entry.severity === 'success'
                        ? 'success'
                        : entry.severity === 'warning'
                        ? 'warning'
                        : entry.severity === 'error'
                        ? 'error'
                        : 'outline'
                    }
                    size='sm'
                  >
                    {entry.severity}
                  </Badge>
                </div>
                <p className='mt-2 text-sm leading-relaxed text-on-surface'>{entry.message}</p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => {
    const preferenceList: Array<[keyof SettingsState, string]> = [
      ['autoOptimization', 'Enable automatic optimization pipelines'],
      ['realtimeMonitoring', 'Enable real-time telemetry streaming'],
      ['selfHealing', 'Auto restart containers on failure signals'],
      ['deepAnalysis', 'Perform deep code analysis (AI + heuristics)'],
      ['performanceProfiling', 'Enable high frequency performance profiling'],
      ['securityScanning', 'Run continuous security scanning'],
    ];

    return (
      <div className='space-y-6'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-on-surface'>
              <Settings className='h-5 w-5 text-primary' />
              Automation preferences
            </CardTitle>
          </CardHeader>
          <CardContent className='grid gap-3 text-sm text-on-surface'>
            {preferenceList.map(([key, label]) => (
              <button
                key={key}
                type='button'
                onClick={() => toggleSetting(key)}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors',
                  settings[key]
                    ? 'border-primary/40 bg-primary/10 text-on-surface'
                    : 'border-outline/15 bg-surface-container-low text-on-surface-variant',
                )}
              >
                <span className='text-sm font-medium'>{label}</span>
                <Badge variant={settings[key] ? 'success' : 'outline'} size='sm'>
                  {settings[key] ? 'Enabled' : 'Disabled'}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'analysis':
        return renderAnalysis();
      case 'containers':
        return renderContainers();
      case 'optimizations':
        return renderOptimizations();
      case 'monitoring':
        return renderMonitoring();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6 px-8 py-6'>
      <header className='rounded-3xl border border-outline/10 bg-gradient-to-br from-surface via-surface-container-high to-surface-container-highest p-6 shadow-level-1 text-on-surface'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <span className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Sparkles className='h-3 w-3' /> Enterprise container orchestration
            </span>
            <div>
              <h1 className='text-3xl font-semibold md:text-4xl'>Enterprise Container Demo</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Replatformed from the legacy <code className='font-mono'>enterprise-container-frontend.html</code> demo. Explore LightDom&apos;s MD3 dashboard for provisioning dev containers, orchestrating automation workflows, and monitoring live telemetry.
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-3'>
            <div className='flex items-center gap-3 rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3'>
              <Cpu className='h-5 w-5 text-success' />
              <div className='text-right'>
                <p className='text-sm font-semibold text-on-surface'>Uptime</p>
                <p className='text-xs text-on-surface-variant/70'>{formattedUptime}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 text-xs text-on-surface-variant/70'>
              <Badge variant={containerStatus === 'ready' ? 'success' : containerStatus === 'analyzing' ? 'warning' : containerStatus === 'error' ? 'error' : 'outline'} size='sm'>
                {containerStatus === 'ready'
                  ? 'Ready'
                  : containerStatus === 'analyzing'
                  ? 'Analyzing'
                  : containerStatus === 'error'
                  ? 'Error'
                  : 'Initializing'}
              </Badge>
              <span>•</span>
              <span>Telemetry active</span>
            </div>
          </div>
        </div>
      </header>

      <div className='grid gap-6 lg:grid-cols-[260px,1fr]'>
        <aside className='space-y-4 rounded-3xl border border-outline/10 bg-surface p-4 shadow-level-1'>
          <p className='text-xs font-semibold uppercase text-on-surface-variant/60'>Navigation</p>
          <div className='flex flex-col gap-2'>
            {VIEW_CONFIG.map((view) => {
              const isActive = view.id === activeView;
              return (
                <button
                  key={view.id}
                  type='button'
                  onClick={() => setActiveView(view.id)}
                  className={cn(
                    'flex w-full flex-col gap-1 rounded-2xl border px-3 py-3 text-left transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/10 text-on-surface'
                      : 'border-outline/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  <span className='flex items-center gap-2 text-sm font-semibold'>
                    {view.icon}
                    {view.label}
                  </span>
                  <span className='text-xs text-on-surface-variant/70'>{view.helper}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className='space-y-6'>{renderView()}</main>
      </div>

      <footer className='rounded-3xl border border-outline/10 bg-surface-container-high px-4 py-3 text-xs text-on-surface-variant/70'>
        This demo mirrors the interactions from <code className='font-mono'>enterprise-container-frontend.html</code> using LightDom&apos;s reusable MD3 components. Wire the handlers into live Socket.IO streams, Electron bridges, or automation services when backend endpoints are ready.
      </footer>
    </div>
  );
};

export default EnterpriseContainerDemoPage;
