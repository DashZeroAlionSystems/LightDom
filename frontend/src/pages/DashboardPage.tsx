import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Database,
  Globe,
  ShieldAlert,
  Plus,
} from 'lucide-react';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import type { RecentCrawl } from '@/features/dashboard/api/dashboardApi';
import {
  KpiGrid,
  KpiCard,
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  AsyncStateLoading,
  AsyncStateError,
  AsyncStateEmpty,
  Fab,
} from '@/components/ui';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return date.toLocaleDateString();
};

interface StatRowProps {
  label: string;
  value: React.ReactNode;
}

const StatRow: React.FC<StatRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="md3-body-medium text-on-surface-variant">{label}</span>
    <span className="md3-title-small text-on-surface text-right">{value}</span>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-6">
        <AsyncStateLoading className="min-h-[40vh]">Preparing dashboard metrics…</AsyncStateLoading>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <AsyncStateError
          description={error?.message ?? 'Unexpected error fetching dashboard metrics.'}
          icon={<ShieldAlert className="h-10 w-10" />}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const { mining, crawler, recentCrawls } = data;

  return (
    <div className="relative space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface">Automation Dashboard</h1>
          <p className="md3-body-medium text-on-surface-variant">
            Track mining throughput, crawler health, and workflow efficiency in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${crawler.isRunning ? 'bg-success' : 'bg-error'}`}
          />
          <span className="md3-label-medium text-on-surface-variant">
            Crawler {crawler.isRunning ? 'operational' : 'paused'}
          </span>
        </div>
      </header>

      <KpiGrid columns={3}>
        <KpiCard
          label="Sites mined"
          value={mining.totalMined.toLocaleString()}
          delta={`${mining.minedToday} today`}
          icon={<Globe className="h-4 w-4" />}
        />
        <KpiCard
          label="LDC earned"
          value={`${mining.tokensEarned.toLocaleString()} LDC`}
          tone="primary"
          delta="From mining rewards"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="Space reclaimed"
          value={formatBytes(mining.spaceReclaimedBytes)}
          tone="success"
          delta={`Avg SEO score: ${Math.round(crawler.avgSeoScore || 0)}`}
          icon={<Database className="h-4 w-4" />}
        />
      </KpiGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkflowPanel title="Mining performance" description="Operational metrics for the last 24 hours.">
          <WorkflowPanelSection>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatRow label="Active miners" value={mining.activeMiners.toLocaleString()} />
              <StatRow label="Mining rate" value={`${mining.miningRate}/day`} />
              <StatRow label="Efficiency" value={`${mining.efficiency}%`} />
              <StatRow label="Total crawled" value={crawler.crawledCount.toLocaleString()} />
              <StatRow label="Training records" value={crawler.seoTrainingRecords.toLocaleString()} />
              <StatRow label="Discovered URLs" value={crawler.discoveredCount.toLocaleString()} />
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>

        <WorkflowPanel
          title="Weekly progress"
          description="Mining momentum compared to previous intervals."
          actions={
            <ArrowUpRight className={`h-4 w-4 ${mining.minedThisWeek >= mining.minedToday ? 'text-success' : 'text-warning'}`} />
          }
        >
          <WorkflowPanelSection>
            <div className="space-y-3">
              <StatRow label="Mined this week" value={`${mining.minedThisWeek} sites`} />
              <StatRow label="Mined today" value={`${mining.minedToday} sites`} />
              <StatRow label="Total size mined" value={formatBytes(mining.totalSizeMinedBytes)} />
              <StatRow label="Crawler status" value={crawler.isRunning ? 'Running' : 'Idle'} />
            </div>
          </WorkflowPanelSection>
          <WorkflowPanelFooter>
            <span className="md3-label-medium text-on-surface-variant">
              Last update {formatDate(mining.lastUpdate ?? new Date().toISOString())}
            </span>
          </WorkflowPanelFooter>
        </WorkflowPanel>
      </div>

      <WorkflowPanel title="Recent mining activity" description="Latest crawl events and saved optimization data.">
        {recentCrawls.length === 0 ? (
          <AsyncStateEmpty
            title="No crawl events yet"
            description="Trigger the crawler to begin harvesting and metrics will populate here."
            icon={<Globe className="h-10 w-10" />}
            actionLabel="Start crawler"
            onAction={() => console.info('Start crawler action')}
            compact
          />
        ) : (
          <div className="space-y-3">
            {recentCrawls.map((crawl: RecentCrawl, index: number) => (
              <div
                key={`${crawl.url}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="md3-title-medium text-on-surface">{crawl.domain}</div>
                    <div className="md3-body-small text-on-surface-variant">
                      {formatDate(crawl.crawledAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="md3-title-small text-on-surface">
                    SEO: {Math.round(crawl.seoScore || 0)}/100
                  </div>
                  <div className="md3-body-small text-success">
                    +{formatBytes(crawl.spaceSaved || 0)} saved
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </WorkflowPanel>

      <div className="fixed bottom-8 right-8">
        <Fab icon={<Plus className="h-5 w-5" />} aria-label="Create workflow" extended>
          New workflow
        </Fab>
      </div>
    </div>
  );
};
