import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp, Users, Activity, Zap, Eye, MousePointer } from 'lucide-react';

const analyticsPanelVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

const metricCardVariants = cva(
  'rounded-2xl border border-outline bg-surface p-4 transition-all hover:border-primary/50',
  {
    variants: {
      trend: {
        up: 'border-success/30 bg-success-container/10',
        down: 'border-error/30 bg-error-container/10',
        neutral: 'border-outline'
      }
    },
    defaultVariants: {
      trend: 'neutral'
    }
  }
);

export interface DesignSystemAnalyticsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof analyticsPanelVariants> {
  realtime?: boolean;
  showCharts?: boolean;
  componentMetrics?: {
    name: string;
    usage: number;
    trend: 'up' | 'down' | 'neutral';
    change: number;
    performance: number;
  }[];
}

// Mock analytics data
const mockComponentMetrics = [
  { name: 'Button', usage: 1247, trend: 'up' as const, change: 12.5, performance: 98.2 },
  { name: 'Input', usage: 892, trend: 'up' as const, change: 8.3, performance: 97.8 },
  { name: 'KpiCard', usage: 456, trend: 'neutral' as const, change: 2.1, performance: 99.1 },
  { name: 'WorkflowPanel', usage: 723, trend: 'up' as const, change: 15.7, performance: 96.5 },
  { name: 'AsyncStateLoading', usage: 234, trend: 'down' as const, change: -5.2, performance: 98.9 },
  { name: 'Fab', usage: 189, trend: 'up' as const, change: 22.1, performance: 97.2 }
];

const DesignSystemAnalytics: React.FC<DesignSystemAnalyticsProps> = ({
  realtime = true,
  showCharts = true,
  componentMetrics = mockComponentMetrics,
  size,
  className,
  ...props
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeUsers, setActiveUsers] = useState(1247);
  const [pageViews, setPageViews] = useState(8942);
  const [interactions, setInteractions] = useState(5632);

  useEffect(() => {
    if (realtime) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
        // Simulate fluctuating metrics
        setActiveUsers(prev => prev + Math.floor(Math.random() * 20 - 10));
        setPageViews(prev => prev + Math.floor(Math.random() * 50 - 25));
        setInteractions(prev => prev + Math.floor(Math.random() * 30 - 15));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realtime]);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-error rotate-180" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-outline" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <div className={cn(analyticsPanelVariants({ size }), className)} {...props}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="md3-title-large text-on-surface">Design System Analytics</h3>
            <p className="md3-body-medium text-on-surface-variant">
              Real-time usage metrics and performance monitoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {realtime && (
            <div className="flex items-center gap-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="md3-label-small text-success">Live</span>
            </div>
          )}
          <span className="md3-label-small text-on-surface-variant">
            Updated {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-outline bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="md3-label-medium text-on-surface-variant">Active Users</div>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="md3-title-large text-on-surface font-semibold">{activeUsers.toLocaleString()}</div>
          <div className="md3-body-small text-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +12.5% from yesterday
          </div>
        </div>

        <div className="rounded-2xl border border-outline bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="md3-label-medium text-on-surface-variant">Page Views</div>
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div className="md3-title-large text-on-surface font-semibold">{pageViews.toLocaleString()}</div>
          <div className="md3-body-small text-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +8.3% from yesterday
          </div>
        </div>

        <div className="rounded-2xl border border-outline bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="md3-label-medium text-on-surface-variant">Interactions</div>
            <MousePointer className="h-4 w-4 text-primary" />
          </div>
          <div className="md3-title-large text-on-surface font-semibold">{interactions.toLocaleString()}</div>
          <div className="md3-body-small text-success flex items-center gap-1">
            <Activity className="h-3 w-3" />
            +15.2% from yesterday
          </div>
        </div>
      </div>

      {/* Component Usage Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="md3-title-small text-on-surface">Component Usage</h4>
          <div className="flex items-center gap-2">
            <span className="md3-label-small text-on-surface-variant">Sorted by usage</span>
            <select className="md3-label-small bg-surface border border-outline rounded-lg px-2 py-1">
              <option>Usage</option>
              <option>Performance</option>
              <option>Trend</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {componentMetrics.map((metric, index) => (
            <div key={metric.name} className={cn(metricCardVariants({ trend: metric.trend }))}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="md3-title-small text-on-surface font-medium">{metric.name}</div>
                    <div className="md3-body-small text-on-surface-variant">
                      {metric.usage.toLocaleString()} uses
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn('md3-label-medium flex items-center gap-1', getTrendColor(metric.trend))}>
                      {getTrendIcon(metric.trend)}
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </div>
                    <div className="md3-body-small text-on-surface-variant">vs last week</div>
                  </div>

                  <div className="text-right">
                    <div className="md3-label-medium text-on-surface font-medium">
                      {metric.performance}%
                    </div>
                    <div className="md3-body-small text-on-surface-variant">performance</div>
                  </div>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="md3-label-small text-on-surface-variant">Usage distribution</span>
                  <span className="md3-label-small text-on-surface-variant">
                    {((metric.usage / componentMetrics.reduce((sum, m) => sum + m.usage, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(metric.usage / Math.max(...componentMetrics.map(m => m.usage))) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 pt-6 border-t border-outline">
        <h4 className="md3-title-small text-on-surface mb-4">Performance Insights</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-success/30 bg-success-container/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-success" />
              <span className="md3-label-medium text-on-success-container font-medium">Optimization Opportunity</span>
            </div>
            <p className="md3-body-medium text-on-success-container/90">
              Button component shows 98.2% performance score. Consider implementing lazy loading for better initial page load.
            </p>
          </div>

          <div className="rounded-2xl border border-warning/30 bg-warning-container/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-warning" />
              <span className="md3-label-medium text-on-warning-container font-medium">Usage Trend</span>
            </div>
            <p className="md3-body-medium text-on-warning-container/90">
              WorkflowPanel usage increased 15.7% this week. Consider optimizing render performance for complex layouts.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
            View detailed reports
          </button>
          <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
            Export analytics
          </button>
          <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
            Configure monitoring
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="md3-label-small text-on-surface-variant">Auto-refresh:</span>
          <span className="md3-label-small text-on-surface">
            {realtime ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemAnalytics;
