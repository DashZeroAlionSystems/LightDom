import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Users,
  Server,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react';

const healthDashboardVariants = cva(
  'relative min-h-screen bg-surface p-6 space-y-8',
  {
    variants: {
      theme: {
        light: 'bg-surface',
        dark: 'bg-surface-dark'
      }
    },
    defaultVariants: {
      theme: 'light'
    }
  }
);

const statusCardVariants = cva(
  'rounded-3xl border p-6 transition-all duration-medium-2',
  {
    variants: {
      status: {
        healthy: 'border-success/30 bg-success-container/10',
        warning: 'border-warning/30 bg-warning-container/10',
        error: 'border-error/30 bg-error-container/10',
        offline: 'border-outline-variant bg-surface-container/50 opacity-60'
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      status: 'healthy',
      size: 'md'
    }
  }
);

const metricGaugeVariants = cva(
  'relative flex items-center justify-center rounded-full border-4 transition-all duration-500',
  {
    variants: {
      status: {
        excellent: 'border-success text-success',
        good: 'border-primary text-primary',
        warning: 'border-warning text-warning',
        critical: 'border-error text-error'
      },
      size: {
        sm: 'h-16 w-16 text-sm',
        md: 'h-24 w-24 text-lg',
        lg: 'h-32 w-32 text-xl'
      }
    },
    defaultVariants: {
      status: 'good',
      size: 'md'
    }
  }
);

// Mock system health data
const mockSystemHealth = {
  overall: {
    status: 'healthy' as const,
    uptime: '99.98%',
    responseTime: '45ms',
    activeConnections: 1247
  },
  components: {
    research: { status: 'healthy' as const, uptime: '99.95%', lastUpdate: '2 min ago' },
    memory: { status: 'healthy' as const, uptime: '99.99%', lastUpdate: '1 min ago' },
    workflows: { status: 'warning' as const, uptime: '98.7%', lastUpdate: '5 min ago' },
    analytics: { status: 'healthy' as const, uptime: '99.91%', lastUpdate: '3 min ago' },
    testing: { status: 'healthy' as const, uptime: '99.87%', lastUpdate: '4 min ago' }
  },
  performance: {
    cpu: 67,
    memory: 82,
    network: 34,
    storage: 78
  },
  alerts: [
    {
      id: '1',
      level: 'warning' as const,
      title: 'Workflow Performance',
      message: 'Background workflow processing showing increased latency',
      timestamp: '2025-01-15T15:45:00Z'
    },
    {
      id: '2',
      level: 'info' as const,
      title: 'Research Update',
      message: 'New ML research findings integrated successfully',
      timestamp: '2025-01-15T15:30:00Z'
    }
  ],
  metrics: {
    activeUsers: 1247,
    componentUsage: 8942,
    apiCalls: 56321,
    errorRate: 0.02
  }
};

interface SystemHealthDashboardProps extends VariantProps<typeof healthDashboardVariants> {
  realtime?: boolean;
  showAlerts?: boolean;
  refreshInterval?: number;
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  realtime = true,
  showAlerts = true,
  refreshInterval = 30000,
  theme
}) => {
  const [healthData, setHealthData] = useState(mockSystemHealth);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (realtime) {
      const interval = setInterval(() => {
        // Simulate health data updates
        setHealthData(prev => ({
          ...prev,
          performance: {
            cpu: Math.max(10, Math.min(95, prev.performance.cpu + (Math.random() - 0.5) * 10)),
            memory: Math.max(20, Math.min(95, prev.performance.memory + (Math.random() - 0.5) * 8)),
            network: Math.max(5, Math.min(90, prev.performance.network + (Math.random() - 0.5) * 15)),
            storage: Math.max(30, Math.min(95, prev.performance.storage + (Math.random() - 0.5) * 5))
          }
        }));
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [realtime, refreshInterval]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHealthData(prev => ({ ...prev })); // Trigger re-render with current data
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error': return <XCircle className="h-5 w-5 text-error" />;
      case 'offline': return <WifiOff className="h-5 w-5 text-outline-variant" />;
      default: return <Wifi className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'offline': return 'text-outline-variant';
      default: return 'text-primary';
    }
  };

  const getPerformanceStatus = (value: number) => {
    if (value < 50) return 'excellent';
    if (value < 75) return 'good';
    if (value < 90) return 'warning';
    return 'critical';
  };

  return (
    <div className={cn(healthDashboardVariants({ theme }))}>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            System Health Dashboard
          </h1>
          <p className="md3-body-medium text-on-surface-variant mt-1">
            Real-time monitoring of design system health, performance, and reliability
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className={cn(
              'inline-flex h-2 w-2 rounded-full',
              healthData.overall.status === 'healthy' ? 'bg-success animate-pulse' :
              healthData.overall.status === 'warning' ? 'bg-warning animate-pulse' :
              'bg-error animate-pulse'
            )} />
            <span className="md3-label-small text-on-surface">
              System {healthData.overall.status === 'healthy' ? 'Operational' :
                     healthData.overall.status === 'warning' ? 'Degraded' : 'Critical'}
            </span>
            <span className="md3-label-small text-on-surface-variant">
              Last updated {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Overall System Status */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className={cn(statusCardVariants({ status: healthData.overall.status }))}>
          <div className="flex items-center justify-between mb-4">
            <div className="md3-title-medium text-on-surface">Overall Health</div>
            {getStatusIcon(healthData.overall.status)}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="md3-body-medium text-on-surface-variant">Uptime</span>
              <span className="md3-body-medium text-on-surface font-medium">
                {healthData.overall.uptime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="md3-body-medium text-on-surface-variant">Response</span>
              <span className="md3-body-medium text-on-surface font-medium">
                {healthData.overall.responseTime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="md3-body-medium text-on-surface-variant">Connections</span>
              <span className="md3-body-medium text-on-surface font-medium">
                {healthData.overall.activeConnections.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className={cn(statusCardVariants({ status: 'healthy' }))}>
          <div className="flex items-center justify-between mb-4">
            <div className="md3-title-medium text-on-surface">Active Users</div>
            <Users className="h-5 w-5 text-success" />
          </div>
          <div className="md3-headline-small text-on-surface font-semibold mb-2">
            {healthData.metrics.activeUsers.toLocaleString()}
          </div>
          <div className="md3-body-small text-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +12.5% from yesterday
          </div>
        </div>

        <div className={cn(statusCardVariants({ status: 'healthy' }))}>
          <div className="flex items-center justify-between mb-4">
            <div className="md3-title-medium text-on-surface">Component Usage</div>
            <BarChart3 className="h-5 w-5 text-success" />
          </div>
          <div className="md3-headline-small text-on-surface font-semibold mb-2">
            {healthData.metrics.componentUsage.toLocaleString()}
          </div>
          <div className="md3-body-small text-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +8.3% from yesterday
          </div>
        </div>

        <div className={cn(statusCardVariants({ status: healthData.metrics.errorRate > 0.05 ? 'warning' : 'healthy' }))}>
          <div className="flex items-center justify-between mb-4">
            <div className="md3-title-medium text-on-surface">Error Rate</div>
            <Shield className="h-5 w-5 text-success" />
          </div>
          <div className="md3-headline-small text-on-surface font-semibold mb-2">
            {(healthData.metrics.errorRate * 100).toFixed(2)}%
          </div>
          <div className="md3-body-small text-success">
            Within acceptable limits
          </div>
        </div>
      </div>

      {/* Component Health Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
          <h3 className="md3-title-large text-on-surface mb-6">Component Health</h3>
          <div className="space-y-4">
            {Object.entries(healthData.components).map(([name, component]) => (
              <div key={name} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-outline">
                <div className="flex items-center gap-3">
                  {getStatusIcon(component.status)}
                  <div>
                    <div className="md3-title-small text-on-surface font-medium capitalize">
                      {name.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="md3-body-small text-on-surface-variant">
                      Uptime: {component.uptime} • Updated {component.lastUpdate}
                    </div>
                  </div>
                </div>
                <div className={cn('md3-label-medium font-medium', getStatusColor(component.status))}>
                  {component.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
          <h3 className="md3-title-large text-on-surface mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className={cn(
                metricGaugeVariants({
                  status: getPerformanceStatus(healthData.performance.cpu),
                  size: 'lg'
                }),
                'mx-auto mb-3'
              )}>
                <span className="font-semibold">{Math.round(healthData.performance.cpu)}%</span>
              </div>
              <div className="md3-label-medium text-on-surface mb-1">CPU Usage</div>
              <div className="md3-body-small text-on-surface-variant">System load</div>
            </div>

            <div className="text-center">
              <div className={cn(
                metricGaugeVariants({
                  status: getPerformanceStatus(healthData.performance.memory),
                  size: 'lg'
                }),
                'mx-auto mb-3'
              )}>
                <span className="font-semibold">{Math.round(healthData.performance.memory)}%</span>
              </div>
              <div className="md3-label-medium text-on-surface mb-1">Memory</div>
              <div className="md3-body-small text-on-surface-variant">RAM usage</div>
            </div>

            <div className="text-center">
              <div className={cn(
                metricGaugeVariants({
                  status: getPerformanceStatus(healthData.performance.network),
                  size: 'lg'
                }),
                'mx-auto mb-3'
              )}>
                <span className="font-semibold">{Math.round(healthData.performance.network)}%</span>
              </div>
              <div className="md3-label-medium text-on-surface mb-1">Network</div>
              <div className="md3-body-small text-on-surface-variant">Bandwidth</div>
            </div>

            <div className="text-center">
              <div className={cn(
                metricGaugeVariants({
                  status: getPerformanceStatus(healthData.performance.storage),
                  size: 'lg'
                }),
                'mx-auto mb-3'
              )}>
                <span className="font-semibold">{Math.round(healthData.performance.storage)}%</span>
              </div>
              <div className="md3-label-medium text-on-surface mb-1">Storage</div>
              <div className="md3-body-small text-on-surface-variant">Disk usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {showAlerts && healthData.alerts.length > 0 && (
        <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
          <h3 className="md3-title-large text-on-surface mb-6 flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            System Alerts
          </h3>
          <div className="space-y-4">
            {healthData.alerts.map((alert) => (
              <div key={alert.id} className={cn(
                'flex items-start gap-4 p-4 rounded-2xl border',
                alert.level === 'warning' ? 'border-warning/30 bg-warning-container/10' :
                alert.level === 'error' ? 'border-error/30 bg-error-container/10' :
                'border-primary/30 bg-primary-container/10'
              )}>
                <div className="flex-shrink-0 mt-0.5">
                  {alert.level === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : alert.level === 'error' ? (
                    <XCircle className="h-5 w-5 text-error" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="md3-title-small text-on-surface font-medium mb-1">
                    {alert.title}
                  </div>
                  <div className="md3-body-medium text-on-surface-variant mb-2">
                    {alert.message}
                  </div>
                  <div className="md3-label-small text-on-surface-variant">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-on-primary hover:opacity-90 transition-opacity shadow-level-2">
          <Settings className="h-4 w-4" />
          System Settings
        </button>
        <button className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-on-surface hover:bg-surface-container-high/80 transition-colors border border-outline shadow-level-2">
          <Database className="h-4 w-4" />
          Export Report
        </button>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;
