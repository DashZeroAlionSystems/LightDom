import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Database,
  Globe,
  TrendingUp,
  Wallet,
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
  Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import axios from 'axios';

import { ServiceActionBar, ServiceActionButton, Divider } from '@/components/ui';

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

type ServiceKey = 'crawler' | 'mining' | 'blockchain' | 'spaceMining' | 'metaverse' | 'seo';

interface ServiceTab {
  id: ServiceKey;
  label: string;
  Icon: LucideIcon;
  description: string;
}

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
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard/complete`);
      setDashboardData(response.data);
      setLoading(false);
      setErrorMessage(null);
      hasWarnedRef.current = false;
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

  return (
    <div className="p-6 space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Complete System Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <div
              className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm font-medium">
              {headerStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {SERVICE_TABS.map(({ id, label, Icon, description }) => (
          <ServiceStatusCard
            key={id}
            name={label}
            icon={<Icon className="w-5 h-5" />}
            status={services[id] && !services[id]?.error}
            data={services[id]}
            isActive={activeService === id}
            onSelect={() => handleSelectService(id)}
            description={description}
          />
        ))}
      </div>

      {/* Action Toolbar */}
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

      {/* Metrics for Selected Service */}
      <ServiceMetricsGrid serviceKey={activeService} data={selectedServiceData} />

      {/* Detailed panel for active service */}
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

      {/* Raw Data Viewer (for debugging) */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Raw Service Data
        </h2>
        <pre className="bg-background p-4 rounded-lg overflow-auto max-h-96 text-xs">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </div>
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
