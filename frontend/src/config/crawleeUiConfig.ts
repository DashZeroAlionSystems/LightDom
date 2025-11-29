export type LucideIconName = string;

export type CrawleeTrend = 'up' | 'down' | 'steady';
export type CrawleeStatus = 'healthy' | 'warning' | 'critical' | 'paused';
export type CrawleeActionTone = 'primary' | 'success' | 'warning' | 'danger';

export interface CrawleeMetricConfig {
  id: string;
  label: string;
  value: string;
  delta?: string;
  trend?: CrawleeTrend;
  status?: CrawleeStatus;
  subtitle?: string;
}

export interface CrawleeActionConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIconName;
  tone?: CrawleeActionTone;
}

export interface CrawleeCrawlerConfig {
  id: string;
  name: string;
  status: CrawleeStatus;
  description: string;
  cadence: string;
  lastRun: string;
  successRate: number;
  coverage: string;
  activeSeeds: number;
  totalDocs: string;
  tags: string[];
  alerts?: string[];
}

export interface CrawleePipelineStep {
  id: string;
  label: string;
  duration: string;
  status: CrawleeStatus | 'completed' | 'pending';
  description?: string;
}

export interface CrawleePipelineConfig {
  id: string;
  name: string;
  owner: string;
  runtime: string;
  nextRun: string;
  steps: CrawleePipelineStep[];
}

export interface CrawleeSeedSourceConfig {
  id: string;
  label: string;
  description: string;
  type: 'sitemap' | 'rss' | 'manual' | 'api';
  count: number;
  freshness: string;
}

export interface CrawleeEventConfig {
  id: string;
  timestamp: string;
  severity: CrawleeStatus;
  message: string;
  source: string;
}

export interface CrawleeUiConfig {
  metrics: CrawleeMetricConfig[];
  actions: CrawleeActionConfig[];
  crawlers: CrawleeCrawlerConfig[];
  pipelines: CrawleePipelineConfig[];
  seeds: CrawleeSeedSourceConfig[];
  events: CrawleeEventConfig[];
}

export const crawleeUiConfig: CrawleeUiConfig = {
  metrics: [
    {
      id: 'coverage',
      label: 'Coverage',
      value: '182k pages',
      delta: '+12.4% vs last week',
      trend: 'up',
      status: 'healthy',
      subtitle: 'Active across 42 domains',
    },
    {
      id: 'freshness',
      label: 'Freshness',
      value: '97.2%',
      delta: '+2.1% vs target',
      trend: 'up',
      status: 'healthy',
      subtitle: 'Content updated in < 4h',
    },
    {
      id: 'latency',
      label: 'Pipeline Latency',
      value: '38m avg',
      delta: '-9m improvement',
      trend: 'down',
      status: 'warning',
      subtitle: 'Deep enrichment path still catching up',
    },
    {
      id: 'alerts',
      label: 'Open Alerts',
      value: '5',
      delta: '2 critical',
      trend: 'steady',
      status: 'critical',
      subtitle: 'Sitemaps require authentication refresh',
    },
  ],
  actions: [
    {
      id: 'new-crawler',
      label: 'Create Crawler',
      description: 'Launch a new focused crawler with enrichment hooks.',
      icon: 'Rocket',
      tone: 'primary',
    },
    {
      id: 'sync-seeds',
      label: 'Refresh Seeds',
      description: 'Pull new seed URLs from data partnerships.',
      icon: 'RefreshCw',
      tone: 'success',
    },
    {
      id: 'throttle-pools',
      label: 'Adjust Throttling',
      description: 'Balance concurrency across network pools.',
      icon: 'SlidersHorizontal',
      tone: 'warning',
    },
    {
      id: 'export-report',
      label: 'Export Coverage Report',
      description: 'Send the latest crawl telemetry to stakeholders.',
      icon: 'Download',
      tone: 'primary',
    },
  ],
  crawlers: [
    {
      id: 'commerce-intel',
      name: 'Commerce Intelligence',
      status: 'healthy',
      description: 'Tracks high velocity pricing and inventory signals.',
      cadence: 'Every 15 minutes',
      lastRun: '8 minutes ago',
      successRate: 0.986,
      coverage: '12.8k URLs',
      activeSeeds: 215,
      totalDocs: '2.1M',
      tags: ['priority', 'pricing', 'global'],
    },
    {
      id: 'technical-seo',
      name: 'Technical SEO Watch',
      status: 'warning',
      description: 'Audits structured data and schema drift nightly.',
      cadence: 'Nightly · 01:00 UTC',
      lastRun: '3 hours ago',
      successRate: 0.932,
      coverage: '7.4k URLs',
      activeSeeds: 128,
      totalDocs: '820k',
      tags: ['seo', 'quality'],
      alerts: ['2 sitemap fetch failures', 'Redirect chains detected'],
    },
    {
      id: 'news-acceleration',
      name: 'News Acceleration',
      status: 'paused',
      description: 'High-frequency ingestion for newsroom syndication.',
      cadence: 'Every 5 minutes',
      lastRun: 'Paused · 41 minutes ago',
      successRate: 0.0,
      coverage: '—',
      activeSeeds: 64,
      totalDocs: '560k',
      tags: ['amp', 'breaking-news'],
      alerts: ['Awaiting new API key rotation'],
    },
  ],
  pipelines: [
    {
      id: 'seo-enrichment',
      name: 'SEO Enrichment Pipeline',
      owner: 'Automation Ops',
      runtime: '21m avg',
      nextRun: 'Schedules in 39 minutes',
      steps: [
        { id: 'fetch', label: 'Fetch', duration: '6m', status: 'completed' },
        { id: 'render', label: 'Render', duration: '4m', status: 'completed' },
        { id: 'extract', label: 'Schema Extraction', duration: '7m', status: 'warning', description: 'Structured data warnings on 12% of pages.' },
        { id: 'publish', label: 'Publish to Lake', duration: '4m', status: 'pending' },
      ],
    },
    {
      id: 'pricing-alerts',
      name: 'Pricing Alert Generation',
      owner: 'Revenue Intelligence',
      runtime: '14m avg',
      nextRun: 'Running now',
      steps: [
        { id: 'ingest', label: 'Ingest', duration: '5m', status: 'completed' },
        { id: 'compare', label: 'Differential Analysis', duration: '6m', status: 'healthy', description: 'Comparing 184k SKUs vs baseline.' },
        { id: 'notify', label: 'Notify Stakeholders', duration: '3m', status: 'pending' },
      ],
    },
  ],
  seeds: [
    {
      id: 'sitemaps',
      label: 'Sitemaps',
      description: 'XML sitemaps harvested nightly across commerce partners.',
      type: 'sitemap',
      count: 42,
      freshness: 'Updated 1h ago',
    },
    {
      id: 'rss-feeds',
      label: 'Editorial RSS',
      description: 'High velocity feeds for newsroom ingestion.',
      type: 'rss',
      count: 58,
      freshness: 'Updated 7m ago',
    },
    {
      id: 'manual-buckets',
      label: 'Manual Buckets',
      description: 'Curated collections for QA sweeps and experiments.',
      type: 'manual',
      count: 19,
      freshness: 'Updated yesterday',
    },
    {
      id: 'partner-api',
      label: 'Partner APIs',
      description: 'Authenticated sources with delta-based updates.',
      type: 'api',
      count: 7,
      freshness: 'Updated 12m ago',
    },
  ],
  events: [
    {
      id: 'evt-301',
      timestamp: '2025-11-25T14:02:00Z',
      severity: 'warning',
      message: 'Schema extractor reported JSON-LD mismatch on 312 URLs.',
      source: 'SEO Enrichment Pipeline',
    },
    {
      id: 'evt-302',
      timestamp: '2025-11-25T13:48:00Z',
      severity: 'critical',
      message: 'News Acceleration crawler paused due to auth failure.',
      source: 'News Acceleration',
    },
    {
      id: 'evt-303',
      timestamp: '2025-11-25T13:31:00Z',
      severity: 'healthy',
      message: 'Partner API rate limit increased automatically.',
      source: 'Automation Ops',
    },
    {
      id: 'evt-304',
      timestamp: '2025-11-25T13:05:00Z',
      severity: 'warning',
      message: 'Coverage dipped below SLA for 3 AMP partners.',
      source: 'Coverage Monitor',
    },
  ],
};

export type CrawleeIcon = LucideIconName;

export const crawleeStatusColors: Record<CrawleeStatus, string> = {
  healthy: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-rose-400',
  paused: 'text-slate-400',
};

export const crawleeStatusBackgrounds: Record<CrawleeStatus, string> = {
  healthy: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
  critical: 'bg-rose-500/10',
  paused: 'bg-slate-500/10',
};
```}