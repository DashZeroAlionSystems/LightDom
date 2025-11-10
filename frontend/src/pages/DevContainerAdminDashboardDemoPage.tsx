import React, { useEffect, useMemo, useState } from 'react';
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
  Bug,
  Cpu,
  Code2,
  Gauge,
  Github,
  LayoutDashboard,
  MonitorSmartphone,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';

type ViewId = 'overview' | 'editor' | 'preview' | 'logs';

type LogSeverity = 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  message: string;
}

const VIEW_TABS: Array<{ id: ViewId; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className='h-4 w-4' /> },
  { id: 'editor', label: 'Code editor', icon: <Code2 className='h-4 w-4' /> },
  { id: 'preview', label: 'Live preview', icon: <MonitorSmartphone className='h-4 w-4' /> },
  { id: 'logs', label: 'Logs', icon: <Terminal className='h-4 w-4' /> },
];

const DEFAULT_CODE = `import React, { useState, useEffect } from 'react';

export function DevContainerCounter() {
  const [count, setCount] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1>🚀 Dev Container Playground</h1>
      <p>Last updated: {timestamp}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)} style={{ marginLeft: '12px' }}>
        Reset
      </button>
      <p style={{ marginTop: '12px' }}>Click count: {count}</p>
    </div>
  );
}
`;

const initialLogs: LogEntry[] = [
  {
    id: 'log-initial-1',
    timestamp: new Date().toISOString(),
    severity: 'info',
    message: '🚀 Dev container dashboard initialised.',
  },
  {
    id: 'log-initial-2',
    timestamp: new Date(Date.now() - 15_000).toISOString(),
    severity: 'success',
    message: '✅ Browser session connected (chrome-headless-01).',
  },
  {
    id: 'log-initial-3',
    timestamp: new Date(Date.now() - 40_000).toISOString(),
    severity: 'info',
    message: '📦 Installed React dev tools extension in container scope.',
  },
];

const DevContainerAdminDashboardDemoPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [uptimeSeconds, setUptimeSeconds] = useState(1860);
  const [healthScore, setHealthScore] = useState(95);
  const [performanceScore, setPerformanceScore] = useState(98);
  const [appId] = useState('chrome-dev-container-74c2');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('Click "Run code" to execute the React snippet.');
  const [previewVersion, setPreviewVersion] = useState(3);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  useEffect(() => {
    const uptimeInterval = setInterval(() => {
      setUptimeSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(uptimeInterval);
  }, []);

  useEffect(() => {
    const healthInterval = setInterval(() => {
      setHealthScore((score) => Math.min(100, Math.max(88, score + (Math.random() > 0.5 ? 1 : -1))));
      setPerformanceScore((score) => Math.min(100, Math.max(93, score + (Math.random() > 0.5 ? 1 : -1))));
    }, 8000);
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    const liveLogInterval = setInterval(() => {
      const severities: LogSeverity[] = ['info', 'success', 'warning'];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const messagePool: Record<LogSeverity, string[]> = {
        info: [
          'ℹ️ Headless chrome heartbeat received.',
          'ℹ️ Watcher synced dev-container navigation metadata.',
          'ℹ️ Socket.IO stream broadcasted workspace update.',
        ],
        success: [
          '✅ Workflow generator responded with template summary.',
          '✅ Devtools bridge acknowledged connect handshake.',
        ],
        warning: [
          '⚠️ High memory threshold detected. Monitoring intensively.',
          '⚠️ Chromium sandbox restart scheduled after workflow run.',
        ],
        error: [],
      };

      const entry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity,
        message: messagePool[severity][Math.floor(Math.random() * messagePool[severity].length)],
      };

      setLogs((current) => [...current.slice(-99), entry]);
    }, 12000);

    return () => clearInterval(liveLogInterval);
  }, []);

  const formattedUptime = useMemo(() => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, [uptimeSeconds]);

  const overviewMetrics = useMemo(
    () => [
      {
        title: 'System health',
        value: `${healthScore}%`,
        items: [
          { label: 'Browser', value: 'Connected', tone: 'success' as const },
          { label: 'React runtime', value: 'Loaded', tone: 'success' as const },
          { label: 'Socket bridge', value: 'Active', tone: 'success' as const },
        ],
        icon: <ShieldCheck className='h-5 w-5 text-success' />,
      },
      {
        title: 'Performance',
        value: `${performanceScore}%`,
        items: [
          { label: 'Latency', value: '45ms', tone: 'info' as const },
          { label: 'Memory', value: '120MB', tone: 'info' as const },
          { label: 'Sessions', value: '1', tone: 'info' as const },
        ],
        icon: <Gauge className='h-5 w-5 text-primary' />,
      },
      {
        title: 'Code metrics',
        value: '1.5k',
        items: [
          { label: 'Components', value: '42', tone: 'info' as const },
          { label: 'Functions', value: '118', tone: 'info' as const },
          { label: 'Errors', value: '0', tone: 'error' as const },
        ],
        icon: <Bug className='h-5 w-5 text-warning' />,
      },
      {
        title: 'Container info',
        value: 'Headless Chrome',
        items: [
          { label: 'ID', value: appId.split('-').pop() ?? appId, tone: 'info' as const },
          { label: 'Uptime', value: formattedUptime, tone: 'info' as const },
          { label: 'Port', value: '3001', tone: 'info' as const },
        ],
        icon: <Server className='h-5 w-5 text-secondary' />,
      },
    ],
    [appId, formattedUptime, healthScore, performanceScore],
  );

  const handleRunCode = () => {
    if (!code.trim()) {
      setExecutionOutput('⚠️ Paste or write some React code before executing.');
      return;
    }

    setIsRunningCode(true);
    setExecutionOutput('Running snippet inside simulated dev container...');

    window.setTimeout(() => {
      setExecutionOutput('✅ Execution successful. Components rendered to preview shim.');
      setPreviewVersion((version) => version + 1);
      appendLog('success', '✅ Code execution completed in sandbox iframe.');
      setIsRunningCode(false);
    }, 1200);
  };

  const handleClearCode = () => {
    setCode('');
    setExecutionOutput('Editor cleared. Paste a snippet to continue.');
  };

  const handleLoadTemplate = () => {
    setCode(DEFAULT_CODE.trim());
    setExecutionOutput('Template loaded. Update the snippet and run again.');
  };

  const handleOpenEditor = () => {
    setActiveView('editor');
    appendLog('info', 'ℹ️ Navigated to the live code editor view.');
  };

  const handleViewPreview = () => {
    setActiveView('preview');
    appendLog('info', 'ℹ️ Preview refreshed from dev container snapshot.');
  };

  const handleRefreshPreview = () => {
    setPreviewVersion((version) => version + 1);
    appendLog('info', '🔄 Requested preview refresh for React runtime.');
  };

  const handleRestart = () => {
    appendLog('warning', '⚠️ Restarting container... sockets will reconnect shortly.');
    setHealthScore((score) => Math.max(90, score - 4));
    window.setTimeout(() => {
      appendLog('success', '✅ Container restart simulated. All services online.');
      setHealthScore((score) => Math.min(100, score + 5));
    }, 1800);
  };

  const appendLog = (severity: LogSeverity, message: string) => {
    setLogs((current) => [
      ...current.slice(-99),
      { id: `log-${Date.now()}`, severity, message, timestamp: new Date().toISOString() },
    ]);
  };

  const renderLogs = () => (
    <Card className='border-outline/15 bg-surface'>
      <CardHeader>
        <CardTitle className='text-on-surface'>Container logs</CardTitle>
      </CardHeader>
      <CardContent className='max-h-[420px] space-y-2 overflow-y-auto pr-2'>
        {logs
          .slice()
          .reverse()
          .map((entry) => (
            <div
              key={entry.id}
              className={cn(
                'rounded-2xl border px-4 py-3 text-sm',
                entry.severity === 'info' && 'border-outline/15 bg-surface-container-low text-on-surface-variant',
                entry.severity === 'success' && 'border-success/30 bg-success/10 text-on-surface',
                entry.severity === 'warning' && 'border-warning/30 bg-warning/10 text-on-surface',
                entry.severity === 'error' && 'border-error/40 bg-error/10 text-on-surface',
              )}
            >
              <div className='flex items-center justify-between gap-2 text-xs text-on-surface-variant/70'>
                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
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
                >
                  {entry.severity}
                </Badge>
              </div>
              <p className='mt-2 leading-relaxed text-on-surface'>{entry.message}</p>
            </div>
          ))}
      </CardContent>
    </Card>
  );

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/15 bg-gradient-to-br from-[#141b2d] via-surface-container-high to-surface p-6 shadow-level-1 text-on-surface'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Sparkles className='h-4 w-4' />
              Chrome dev container dashboard
            </div>
            <div>
              <h1 className='text-3xl font-semibold md:text-4xl'>Admin control surface for headless workflows</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Monitor container health, execute React code snippets, preview live outputs, and inspect system logs — all replatformed with LightDom’s Material Design 3 components.
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-3'>
            <div className='flex items-center gap-3 rounded-2xl border border-outline/10 bg-surface-container-low px-4 py-3'>
              <Cpu className='h-5 w-5 text-success' />
              <div className='text-right'>
                <p className='text-sm font-semibold text-on-surface'>Browser session</p>
                <p className='text-xs text-on-surface-variant/70'>{appId}</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Badge variant='success'>Browser: Ready</Badge>
              <Badge variant='secondary'>WebSocket: Active</Badge>
            </div>
            <p className='text-xs text-on-surface-variant/70'>Container uptime: {formattedUptime}</p>
          </div>
        </div>
      </header>

      <nav className='flex flex-wrap items-center gap-2 rounded-full border border-outline/10 bg-surface-container-high px-3 py-2 shadow-level-1'>
        {VIEW_TABS.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'filled' : 'text'}
              size='sm'
              onClick={() => setActiveView(tab.id)}
            >
              <span className='flex items-center gap-2'>
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </Button>
          );
        })}
      </nav>

      {activeView === 'overview' && (
        <div className='space-y-5'>
          <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {overviewMetrics.map((metric) => (
              <Card key={metric.title} className='border-outline/15 bg-surface'>
                <CardHeader className='flex items-center justify-between gap-2'>
                  <CardTitle className='text-on-surface'>{metric.title}</CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent className='space-y-3'>
                  <p className='text-3xl font-semibold text-on-surface'>{metric.value}</p>
                  <div className='space-y-2 text-sm'>
                    {metric.items.map((item) => (
                      <div key={item.label} className='flex items-center justify-between gap-3'>
                        <span className='text-on-surface-variant/80'>{item.label}</span>
                        <span
                          className={cn(
                            'font-medium',
                            item.tone === 'success' && 'text-success',
                            item.tone === 'info' && 'text-primary',
                            item.tone === 'error' && 'text-error',
                          )}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section>
            <Card className='border-outline/15 bg-surface'>
              <CardHeader>
                <CardTitle className='text-on-surface'>Quick actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-3'>
                  <Button leftIcon={<Code2 className='h-4 w-4' />} onClick={handleOpenEditor}>
                    Open code editor
                  </Button>
                  <Button variant='outlined' leftIcon={<MonitorSmartphone className='h-4 w-4' />} onClick={handleViewPreview}>
                    View live preview
                  </Button>
                  <Button variant='outlined' leftIcon={<ShieldCheck className='h-4 w-4' />} onClick={() => appendLog('info', '💚 Health check triggered from dashboard.')}>Health check</Button>
                  <Button variant='outlined' leftIcon={<Github className='h-4 w-4' />} onClick={() => appendLog('info', '🔗 Opening repository (simulated).')}>
                    Open repository
                  </Button>
                  <Button variant='outlined' leftIcon={<RefreshCw className='h-4 w-4' />} onClick={handleRestart}>
                    Restart container
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      {activeView === 'editor' && (
        <div className='space-y-5'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader className='flex items-center justify-between gap-2'>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <Code2 className='h-5 w-5 text-primary' />
                Live code editor
              </CardTitle>
              <div className='flex flex-wrap gap-2'>
                <Button variant='filled' leftIcon={<Zap className='h-4 w-4' />} isLoading={isRunningCode} onClick={handleRunCode}>
                  Run code
                </Button>
                <Button variant='text' onClick={handleClearCode}>
                  Clear
                </Button>
                <Button variant='text' onClick={handleLoadTemplate}>
                  Load template
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <TextArea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                rows={18}
                className='font-mono text-xs'
                helperText='Use this editor to mock snippets executed inside the dev container sandbox.'
              />
              <div className='rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface'>
                {executionOutput}
              </div>
            </CardContent>
          </Card>
          {renderLogs()}
        </div>
      )}

      {activeView === 'preview' && (
        <div className='space-y-5'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader className='flex items-center justify-between gap-2'>
              <CardTitle className='flex items-center gap-2 text-on-surface'>
                <MonitorSmartphone className='h-5 w-5 text-secondary' />
                Live preview
              </CardTitle>
              <Button variant='outlined' leftIcon={<RefreshCw className='h-4 w-4' />} onClick={handleRefreshPreview}>
                Refresh preview
              </Button>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-on-surface'>
              <div className='rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-5 text-center'>
                <p className='text-lg font-medium'>React SPA preview (version {previewVersion})</p>
                <p className='mt-2 text-on-surface-variant/80'>
                  In the legacy demo this displayed an iframe pointed at the dev container output. Here we show a simulated preview card to avoid sandboxing concerns.
                </p>
              </div>
              <div className='grid gap-3 md:grid-cols-2'>
                <Card className='border-outline/15 bg-surface-container-low'>
                  <CardContent className='space-y-2 py-4'>
                    <CardTitle className='text-on-surface'>Rendered components</CardTitle>
                    <p className='text-sm text-on-surface-variant'>DevContainerCounter, PromptStatusPanel</p>
                  </CardContent>
                </Card>
                <Card className='border-outline/15 bg-surface-container-low'>
                  <CardContent className='space-y-2 py-4'>
                    <CardTitle className='text-on-surface'>Live endpoints</CardTitle>
                    <p className='text-sm text-on-surface-variant'>/api/devcontainer/status · socket://devcontainer</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          {renderLogs()}
        </div>
      )}

      {activeView === 'logs' && <div className='space-y-5'>{renderLogs()}</div>}

      <footer className='rounded-3xl border border-outline/10 bg-surface-container-high px-4 py-3 text-xs text-on-surface-variant/70'>
        Built for the refactor of legacy <code>admin-dashboard.html</code> into a reusable Material Design 3 page. Hook into Template Watcher, workflow generators, and dev container APIs when backend wiring is available.
      </footer>
    </div>
  );
};

export default DevContainerAdminDashboardDemoPage;
