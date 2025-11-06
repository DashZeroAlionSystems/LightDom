import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Database,
  Globe,
  TrendingUp,
  Cpu,
  Code,
  Zap,
  Users,
  BarChart3,
  Shield,
  Target,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Settings2,
  Wrench,
  Sparkles,
  Cpu as CpuIcon,
  MessageCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import axios from 'axios';

import { ServiceActionBar, ServiceActionButton, Divider } from '@/components/ui';
import PromptConversationPanel, { PromptWorkflowListItem } from '@/components/dashboard/PromptConversationPanel';
import type { PromptToken, PromptAction } from '@/components/ui/PromptInput';

interface ServiceStatus {
  [key: string]: any;
  error?: string;
}

interface CompleteDashboard {
  timestamp: string;
  services: {
    crawler?: ServiceStatus;
    mining?: ServiceStatus;
    blockchain?: ServiceStatus;
    spaceMining?: ServiceStatus;
    metaverse?: ServiceStatus;
    seo?: ServiceStatus;
  };
}

const API_BASE = 'http://localhost:3001';

type PromptChatEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type ServiceKey = 'crawler' | 'mining' | 'blockchain' | 'spaceMining' | 'metaverse' | 'seo';

interface ServiceTab {
  id: ServiceKey;
  label: string;
  Icon: LucideIcon;
  description: string;
}

type SurfaceTab = 'operations' | 'prompts' | 'workflows' | 'automation';

interface TabMetadata {
  label: string;
  Icon: LucideIcon;
  description: string;
}

const TAB_METADATA: Record<SurfaceTab, TabMetadata> = {
  operations: {
    label: 'Operations',
    Icon: Settings2,
    description: 'Manage dashboard operations.',
  },
  prompts: {
    label: 'Prompts',
    Icon: MessageCircle,
    description: 'View and manage prompts.',
  },
  workflows: {
    label: 'Workflows',
    Icon: Code,
    description: 'Manage workflows.',
  },
  automation: {
    label: 'Automation',
    Icon: Wrench,
    description: 'Configure automation settings.',
  },
};

const SERVICE_TABS: ServiceTab[] = [
  {
    id: 'crawler',
    label: 'Crawler',
    Icon: Globe,
    description: 'Monitor crawl jobs, discovered domains, and SEO scoring.',
  },
  {
    id: 'mining',
    label: 'Mining',
    Icon: Cpu,
    description: 'Track data mining sessions and compute utilisation.',
  },
  {
    id: 'blockchain',
    label: 'Blockchain',
    Icon: Shield,
    description: 'Review on-chain activity and smart contract health.',
  },
  {
    id: 'spaceMining',
    label: 'Space Mining',
    Icon: Zap,
    description: 'Inspect spatial mining bridges and throughput.',
  },
  {
    id: 'metaverse',
    label: 'Metaverse',
    Icon: Users,
    description: 'Engagement metrics across immersive experiences.',
  },
  {
    id: 'seo',
    label: 'SEO',
    Icon: Target,
    description: 'Campaign performance, ranking deltas, and opportunities.',
  },
];

export const CompleteDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<CompleteDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<ServiceKey>('crawler');
  const [surfaceTab, setSurfaceTab] = useState<SurfaceTab>('operations');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [promptConversation, setPromptConversation] = useState<PromptChatEntry[]>([]);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [promptWorkflowSummaries, setPromptWorkflowSummaries] = useState<PromptWorkflowListItem[]>([]);
  const [promptWorkflowLoading, setPromptWorkflowLoading] = useState(false);
  const [databaseActivity, setDatabaseActivity] = useState({
    isActive: false,
    lastActivity: new Date(),
    activeTables: [] as string[],
    totalRows: 0
  });
  const hasWarnedRef = useRef(false);

  const fetchPromptWorkflows = useCallback(async () => {
    setPromptWorkflowLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/workflow-generator/config/summary`);
      const setups = response.data?.setups ?? [];
      const mapped: PromptWorkflowListItem[] = setups.map((setup: any) => ({
        id: setup.id ?? setup.name ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        name: setup.name ?? 'Untitled workflow',
        description: setup.description,
        schema: setup.schema ?? setup.schemaName,
        status: setup.status ?? (setup.enabled === false ? 'disabled' : undefined),
        configCount: Array.isArray(setup.configs) ? setup.configs.length : setup.configCount,
        lastRun: setup.lastRun ? new Date(setup.lastRun).toLocaleString() : undefined,
      }));
      setPromptWorkflowSummaries(mapped);
    } catch (error) {
      console.warn('Failed to load workflow summaries for prompt panel:', error);
    } finally {
      setPromptWorkflowLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPromptWorkflows();
  }, [fetchPromptWorkflows]);

  const checkDatabaseActivity = async () => {
    try {
      // Use MCP server to check database activity
      const response = await axios.get(`${API_BASE}/api/dashboard/database-activity`);
      if (response.data) {
        setDatabaseActivity({
          isActive: response.data.isActive,
          lastActivity: new Date(response.data.lastActivity),
          activeTables: response.data.activeTables || [],
          totalRows: response.data.totalRows || 0
        });
      }
    } catch (error) {
      console.error('Failed to check database activity:', error);
    }
  };

  const handlePromptSend = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    const userMessage: PromptChatEntry = {
      role: 'user',
      content: trimmedPrompt,
      timestamp: new Date().toISOString()
    };

    const updatedConversation: PromptChatEntry[] = [...promptConversation, userMessage];
    setPromptConversation(updatedConversation);
    setGeneratingPrompt(true);

    try {
      const chatResponse = await axios.post(`${API_BASE}/api/deepseek/chat`, {
        prompt: trimmedPrompt,
        conversation: updatedConversation.map(({ role, content }) => ({ role, content }))
      });

      const reply = chatResponse.data?.response || chatResponse.data?.content;
      if (reply) {
        setPromptConversation((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply,
            timestamp: new Date().toISOString()
          }
        ]);
        setPromptError(null);
      } else {
        setPromptError('DeepSeek responded without content.');
      }
    } catch (error) {
      console.error('DeepSeek chat failed:', error);
      setPromptError('Unable to reach the DeepSeek chat service right now.');
    }

    try {
      await axios.post(`${API_BASE}/api/deepseek/workflows/generate`, {
        prompt: trimmedPrompt,
        context: 'dashboard-optimization'
      });
      fetchAllData();
      fetchPromptWorkflows();
    } catch (error) {
      console.warn('Workflow generator unavailable:', error);
      setPromptError((prev) => prev ?? 'Workflow generator API is currently unavailable.');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard/complete`);
      setDashboardData(response.data);
      setLoading(false);
      setErrorMessage(null);
      hasWarnedRef.current = false;

      // Check database activity
      await checkDatabaseActivity();
    } catch (error) {
      const message =
        axios.isAxiosError?.(error) && error.response
          ? `API responded with ${error.response.status}`
          : 'Unable to reach the dashboard backend service.';
      if (!hasWarnedRef.current) {
        console.warn('Complete dashboard request failed. Showing fallback data.', error);
        hasWarnedRef.current = true;
      }
      setDashboardData((previous) =>
        previous ?? {
          timestamp: new Date().toISOString(),
          services: {},
        }
      );
      setErrorMessage(message);
      setLoading(false);
    }
  };

  const services = dashboardData?.services || {};

  // Ensure the active tab always reflects an available service once data loads.
  useEffect(() => {
    if (!services) return;
    if (!services[activeService]) {
      const firstAvailable = SERVICE_TABS.find((tab) => services[tab.id]);
      if (firstAvailable) {
        setActiveService(firstAvailable.id);
      }
    }
  }, [services, activeService]);

  const handleSelectService = useCallback((serviceId: ServiceKey) => {
    setActiveService(serviceId);
  }, []);

  const selectedTab = useMemo(
    () => SERVICE_TABS.find((tab) => tab.id === activeService) ?? SERVICE_TABS[0],
    [activeService],
  );

  const selectedServiceData = services[activeService];

  const performAction = useCallback(async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request to ${endpoint} failed`);
    }
  }, []);

  interface ActionDefinition {
    id: string;
    label: string;
    description: string;
    variant?: 'primary' | 'secondary' | 'danger';
    icon: React.ReactNode;
    onAction: () => Promise<void> | void;
  }

  const serviceActions = useMemo((): (ActionDefinition | 'divider')[] => {
    switch (activeService) {
      case 'crawler':
        return [
          {
            id: 'crawler-start',
            label: 'Start Crawler',
            description: 'Resume scanning queued domains.',
            variant: 'primary',
            icon: <Play className="h-4 w-4" />,
            onAction: () => performAction('/api/crawler/start'),
          },
          {
            id: 'crawler-stop',
            label: 'Stop Crawler',
            description: 'Pause crawling activity safely.',
            variant: 'secondary',
            icon: <Square className="h-4 w-4" />,
            onAction: () => performAction('/api/crawler/stop'),
          },
          'divider',
          {
            id: 'crawler-refresh',
            label: 'Refresh Stats',
            description: 'Pull latest crawler performance snapshot.',
            icon: <RefreshCw className="h-4 w-4" />,
            onAction: () => fetchAllData(),
          },
        ];
      case 'mining':
        return [
          {
            id: 'mining-start',
            label: 'Start Mining',
            description: 'Kick off a new mining session with defaults.',
            variant: 'primary',
            icon: <Play className="h-4 w-4" />,
            onAction: () => performAction('/api/mining/start', { body: JSON.stringify({}) }),
          },
          {
            id: 'mining-stop',
            label: 'Stop Mining',
            description: 'Gracefully shut down active miners.',
            variant: 'secondary',
            icon: <Square className="h-4 w-4" />,
            onAction: () => performAction('/api/mining/stop'),
          },
          'divider',
          {
            id: 'mining-calibrate',
            label: 'Calibrate Engine',
            description: 'Adjust mining heuristics before next run.',
            icon: <Settings2 className="h-4 w-4" />,
            onAction: () => Promise.resolve(),
          },
        ];
      default:
        return [
          {
            id: 'service-refresh',
            label: 'Refresh Data',
            description: 'Update metrics for the selected service.',
            icon: <RefreshCw className="h-4 w-4" />,
            onAction: () => fetchAllData(),
          },
          'divider',
          {
            id: 'service-configure',
            label: 'Configure Service',
            description: 'Open configuration workflow (coming soon).',
            icon: <Wrench className="h-4 w-4" />,
            onAction: () => Promise.resolve(),
          },
        ];
    }
  }, [activeService, performAction]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading complete system data...</p>
        </div>
      </div>
    );
  }

  const systemHealthy = !errorMessage;
  const headerStatus = systemHealthy
    ? `${selectedTab.label} Service Online`
    : 'Awaiting backend response';

  const databaseStatus = databaseActivity.isActive
    ? `DB Active (${databaseActivity.totalRows} rows, ${databaseActivity.activeTables.length} tables)`
    : 'DB Idle';

  const promptTokens = useMemo<PromptToken[]>(() => (
    [
      {
        id: 'service',
        label: selectedTab.label,
        tone: 'accent' as PromptToken['tone'],
        icon: <Sparkles className="h-3.5 w-3.5" />,
      },
      {
        id: 'database',
        label: databaseActivity.isActive ? 'DB Active' : 'DB Idle',
        tone: (databaseActivity.isActive ? 'accent' : 'default') as PromptToken['tone'],
        icon: <Database className="h-3.5 w-3.5" />,
      },
      {
        id: 'tables',
        label: `${databaseActivity.activeTables.length} tables`,
        icon: <CpuIcon className="h-3.5 w-3.5" />,
      },
    ]
  ), [selectedTab.label, databaseActivity.isActive, databaseActivity.activeTables.length]);

  const promptActions = useMemo<PromptAction[]>(() => (
    [
      {
        id: 'refresh',
        icon: <RefreshCw className="h-4 w-4" />,
        label: 'Sync services',
        onClick: () => fetchAllData(),
      },
      {
        id: 'settings',
        icon: <Settings2 className="h-4 w-4" />,
        label: 'Service settings',
      },
    ]
  ), [fetchAllData]);

  const promptHeader = useMemo(() => ({
    title: selectedTab.label,
    subtitle: selectedTab.description,
    leading: (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{selectedTab.label} Agent</span>
          <span className="text-xs text-on-surface-variant">Workflow composer</span>
        </div>
      </div>
    ),
    trailing: (
      <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
        <MessageCircle className="h-3.5 w-3.5" />
        Live DeepSeek session
      </div>
    ),
  }), [selectedTab.label, selectedTab.description]);

  const surfaceTabs = useMemo(
    () => [
      {
        id: 'operations' as SurfaceTab,
        label: 'Operations overview',
        description: 'Service health, metrics, and drill-down panels',
      },
      {
        id: 'prompts' as SurfaceTab,
        label: 'Prompts & feedback',
        description: 'DeepSeek conversation, schemas, and live guidance',
      },
      {
        id: 'workflows' as SurfaceTab,
        label: 'Workflows & schemas',
        description: 'Complex workflow lists with schema coverage',
      },
      {
        id: 'automation' as SurfaceTab,
        label: 'Automation studio',
        description: 'Component generation and CRUD orchestration',
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 p-6">
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-1 h-5 w-5 text-destructive" />
          <div className="space-y-1">
            <h2 className="font-semibold text-destructive">Dashboard data unavailable</h2>
            <p className="text-sm text-on-surface-variant">
              {errorMessage}. Please ensure the API at {`${API_BASE}/api/dashboard/complete`} is running or retry once the
              backend is healthy.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Complete System Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <span className={`h-2 w-2 rounded-full ${databaseActivity.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm font-medium">{databaseStatus}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <span className={`h-2 w-2 rounded-full ${systemHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">{headerStatus}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {surfaceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSurfaceTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                surfaceTab === tab.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-on-surface-variant">
          {surfaceTabs.find((tab) => tab.id === surfaceTab)?.description}
        </p>
      </div>

      {surfaceTab === 'prompts' && (
        <PromptConversationPanel
          conversation={promptConversation}
          loading={generatingPrompt}
          promptError={promptError}
          onSend={handlePromptSend}
          onReset={() => {
            setPromptConversation([]);
            setPromptError(null);
          }}
          tokens={promptTokens}
          header={promptHeader}
          helperText="Use @ to reference data streams, # for campaigns, and /run to trigger workflows."
          usage={`Shift + Enter for newline · Enter to send · ${databaseActivity.totalRows.toLocaleString()} rows indexed`}
          actions={promptActions}
          workflowItems={promptWorkflowSummaries}
          workflowsLoading={promptWorkflowLoading}
          onRefreshWorkflows={fetchPromptWorkflows}
        />
      )}

      {surfaceTab === 'operations' && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {SERVICE_TABS.map(({ id, label, Icon, description }) => (
              <ServiceStatusCard
                key={id}
                name={label}
                icon={<Icon className="h-5 w-5" />}
                status={!!(services[id] && !services[id]?.error)}
                data={services[id]}
                isActive={activeService === id}
                onSelect={() => handleSelectService(id)}
                description={description}
              />
            ))}
          </div>

          <ServiceActionBar
            title={`${selectedTab.label} Actions`}
            description={selectedTab.description}
            trailing={
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => fetchAllData()}
              >
                Sync Data
              </button>
            }
          >
            {serviceActions.map((action) =>
              action === 'divider' ? (
                <Divider key={`divider-${selectedTab.id}`} orientation="horizontal" className="col-span-full" />
              ) : (
                <ServiceActionButton
                  key={action.id}
                  label={action.label}
                  description={action.description}
                  icon={action.icon}
                  variant={action.variant}
                  onAction={action.onAction}
                />
              ),
            )}
          </ServiceActionBar>

          <ServiceMetricsGrid serviceKey={activeService} data={selectedServiceData} />

          {selectedServiceData ? (
            <ServicePanel
              title={`${selectedTab.label} Service`}
              icon={<selectedTab.Icon className="w-5 h-5" />}
              data={selectedServiceData}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Data for the {selectedTab.label} service is not available yet. Trigger an action to populate metrics.
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Raw Service Data
            </h2>
            <pre className="bg-background p-4 rounded-lg overflow-auto max-h-96 text-xs">
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </div>
        </>
      )}

      {surfaceTab === 'workflows' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">Workflow inventory</h3>
                <p className="text-sm text-on-surface-variant">
                  Review generated workflows, schema links, and last-run metadata.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchPromptWorkflows}
                className="inline-flex items-center gap-2 rounded-full border border-outline/30 px-3 py-1 text-xs font-medium text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            {promptWorkflowLoading ? (
              <div className="flex items-center gap-2 py-10 text-sm text-on-surface-variant">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading workflow registry…
              </div>
            ) : promptWorkflowSummaries.length ? (
              <div className="mt-4 space-y-3">
                {promptWorkflowSummaries.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-outline/20 bg-surface p-4 transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-on-surface">{item.name}</h4>
                          {item.status && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {item.status}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-on-surface-variant/90">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-on-surface-variant/70">
                        {item.lastRun && <span>Last run: {item.lastRun}</span>}
                        {typeof item.configCount === 'number' && <span>{item.configCount} schema configs</span>}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/70">
                      {item.schema ? (
                        <span className="rounded-full bg-surface-container-low px-3 py-1 font-medium text-primary">
                          Schema: {item.schema}
                        </span>
                      ) : (
                        <span className="rounded-full bg-surface-container-low px-3 py-1">Schema pending configuration</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-outline/20 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                No workflows are registered yet. Use the automation studio to generate new configurations.
              </div>
            )}
          </div>
        </div>
      )}

      {surfaceTab === 'automation' && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Automation studio</h3>
            <p className="text-sm text-on-surface-variant">
              Trigger component generation, workflow CRUD operations, and DeepSeek-guided setup routines.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-outline/20 bg-surface p-4 space-y-2">
              <h4 className="text-sm font-semibold text-on-surface">Generate design-system component</h4>
              <p className="text-xs text-on-surface-variant">
                Feed DeepSeek a description and optional schema references to generate new MD3 components automatically.
              </p>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setSurfaceTab('prompts')}
              >
                Open prompt composer
              </button>
            </div>
            <div className="rounded-2xl border border-outline/20 bg-surface p-4 space-y-2">
              <h4 className="text-sm font-semibold text-on-surface">Review CRUD schemas</h4>
              <p className="text-xs text-on-surface-variant">
                Upcoming surface: bind schema defaults for workflows, services, and pipelines for DeepSeek to execute.
              </p>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setSurfaceTab('workflows')}
              >
                View workflow registry
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-outline/20 bg-surface-container-low p-4 text-xs text-on-surface-variant">
            Component generation and CRUD orchestration will be wired to admin APIs in the next iteration. Ensure DeepSeek tools are permitted to call the relevant endpoints.
          </div>
        </div>
      )}
    </div>
  );
};

interface MetricDefinition {
  title: string;
  icon: React.ReactNode;
  subtitle?: (data: any) => string | undefined;
  value: (data: any) => number | string;
}

const METRIC_DEFINITIONS: Partial<Record<ServiceKey, MetricDefinition[]>> = {
  crawler: [
    {
      title: 'Sites Crawled',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      value: (data) => data?.crawledCount ?? 0,
      subtitle: (data) => `${data?.discoveredCount ?? 0} discovered`,
    },
    {
      title: 'SEO Score',
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      value: (data) => data?.avgSeoScore ?? '–',
      subtitle: () => 'Rolling average score',
    },
  ],
  mining: [
    {
      title: 'Active Miners',
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
      value: (data) => data?.activeWorkers ?? 0,
      subtitle: () => 'Concurrent workers',
    },
    {
      title: 'Hash Rate',
      icon: <Database className="w-6 h-6 text-indigo-500" />,
      value: (data) => `${data?.hashRate ?? 0} H/s`,
      subtitle: () => 'Current throughput',
    },
  ],
  blockchain: [
    {
      title: 'Total Nodes',
      icon: <Shield className="w-6 h-6 text-green-500" />,
      value: (data) => data?.totalNodes ?? 0,
      subtitle: () => 'Active validator nodes',
    },
    {
      title: 'Transactions',
      icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
      value: (data) => data?.totalTransactions ?? 0,
      subtitle: () => 'Network volume',
    },
  ],
  spaceMining: [
    {
      title: 'Structures Analyzed',
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      value: (data) => data?.totalSpaceMined ?? 0,
      subtitle: () => 'Spatial analysis count',
    },
    {
      title: 'Efficiency',
      icon: <TrendingUp className="w-6 h-6 text-cyan-500" />,
      value: (data) => `${data?.efficiency ?? 0}%`,
      subtitle: () => 'Current optimisation rate',
    },
  ],
  metaverse: [
    {
      title: 'Active Sessions',
      icon: <Users className="w-6 h-6 text-pink-500" />,
      value: (data) => data?.activeSessions ?? 0,
      subtitle: () => 'Today',
    },
    {
      title: 'Engagement Score',
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      value: (data) => data?.engagementScore ?? '–',
      subtitle: () => 'Weighted average',
    },
  ],
  seo: [
    {
      title: 'Average Rank',
      icon: <Target className="w-6 h-6 text-red-500" />,
      value: (data) => data?.averageRank ?? '–',
      subtitle: () => 'Top keywords',
    },
    {
      title: 'Traffic Score',
      icon: <TrendingUp className="w-6 h-6 text-lime-500" />,
      value: (data) => data?.trafficScore ?? '–',
      subtitle: () => 'Forecasted uplift',
    },
  ],
};

const ServiceMetricsGrid: React.FC<{ serviceKey: ServiceKey; data?: any }> = ({ serviceKey, data }) => {
  const metricDefinitions = METRIC_DEFINITIONS[serviceKey] ?? [];

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Metrics will appear once the service reports data.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metricDefinitions.map((definition) => (
        <MetricCard
          key={definition.title}
          title={definition.title}
          value={definition.value(data)}
          icon={definition.icon}
          subtitle={definition.subtitle?.(data)}
        />
      ))}
    </div>
  );
};

// Service Status Card Component
const ServiceStatusCard: React.FC<{
  name: string;
  icon: React.ReactNode;
  status: boolean;
  data?: any;
  isActive?: boolean;
  onSelect?: () => void;
  description?: string;
}> = ({ name, icon, status, data, isActive = false, onSelect, description }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${
        isActive ? 'border-primary bg-primary/10' : 'border-border bg-card'
      } group flex flex-col gap-2 rounded-2xl border p-4 text-left transition hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
    >
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground">{icon}</div>
        <div
          className={`w-2 h-2 rounded-full ${
            status ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
      </div>
      <div className="text-sm font-semibold tracking-wide">{name}</div>
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
      <div className="text-xs text-muted-foreground">
        {status ? 'Active' : data?.error ? 'Error' : 'Inactive'}
      </div>
    </button>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ title, value, icon, subtitle }) => {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
};

// Service Panel Component
const ServicePanel: React.FC<{
  title: string;
  icon: React.ReactNode;
  data: any;
}> = ({ title, icon, data }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'error') return null;
          return (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-semibold">
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
