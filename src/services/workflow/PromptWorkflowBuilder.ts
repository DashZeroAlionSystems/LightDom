export interface AtomBlueprint {
  key: string;
  name: string;
  category: string;
  description: string;
  schema: Record<string, unknown>;
  extractionRules: Record<string, unknown>;
  weight?: number;
}

export interface ComponentBlueprint {
  key: string;
  name: string;
  variant?: string;
  description: string;
  category: string;
  schema: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  atomKeys: string[];
}

export interface DashboardComponentPlacement {
  componentKey: string;
  position?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface DashboardBlueprint {
  key: string;
  name: string;
  description: string;
  domain: string;
  layout: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  components: DashboardComponentPlacement[];
}

export interface WorkflowBlueprint {
  schemaKey: string;
  datasetName: string;
  datasetDescription: string;
  atoms: AtomBlueprint[];
  components: ComponentBlueprint[];
  dashboards: DashboardBlueprint[];
  defaultSeedUrls: string[];
  categories: string[];
  hyperparameters: Record<string, unknown>;
}

const SEO_BLUEPRINT: WorkflowBlueprint = {
  schemaKey: 'seo-content',
  datasetName: 'SEO Intent Dataset',
  datasetDescription: 'Labeled SEO intent dataset generated from mined pages and keyword signals.',
  atoms: [
    {
      key: 'metaTags',
      name: 'Meta Tag Extractor',
      category: 'seo',
      description: 'Parses title, description, canonical links and social tags.',
      schema: { fields: ['title', 'description', 'canonical', 'og'] },
      extractionRules: { selectors: ['title', 'meta[name="description"]', 'link[rel="canonical"]', 'meta[property^="og:"]'] },
      weight: 1,
    },
    {
      key: 'keywords',
      name: 'Keyword Density Analyzer',
      category: 'seo',
      description: 'Calculates tf-idf keyword density and search intent classification.',
      schema: { fields: ['keyword', 'density', 'intent'] },
      extractionRules: { tokenizer: 'english', minFrequency: 2 },
      weight: 0.9,
    },
    {
      key: 'coreVitals',
      name: 'Core Web Vitals Collector',
      category: 'performance',
      description: 'Captures LCP, CLS, FID measurements from Lighthouse snapshots.',
      schema: { fields: ['lcp', 'cls', 'fid'] },
      extractionRules: { source: 'lighthouse', throttle: 'mobileDense4G' },
      weight: 0.85,
    },
    {
      key: 'backlinks',
      name: 'Backlink Profile Miner',
      category: 'seo',
      description: 'Maps backlink sources, anchor text, and trust scores.',
      schema: { fields: ['source', 'domainAuthority', 'anchorText'] },
      extractionRules: { api: 'ahrefs', includeNofollow: false },
      weight: 0.8,
    },
  ],
  components: [
    {
      key: 'seoScoreCard',
      name: 'SEO Score Card',
      category: 'seo',
      description: 'Displays blended SEO score and vitals summary.',
      schema: { widget: 'card', metrics: ['seoScore', 'coreVitalsScore'] },
      metadata: { size: 'md' },
      atomKeys: ['metaTags', 'keywords', 'coreVitals'],
    },
    {
      key: 'keywordOpportunities',
      name: 'Keyword Opportunities Table',
      category: 'seo',
      description: 'Lists opportunity keywords with volume and SERP difficulty.',
      schema: { widget: 'table', columns: ['keyword', 'volume', 'difficulty', 'intent'] },
      atomKeys: ['keywords'],
    },
    {
      key: 'backlinkMap',
      name: 'Backlink Opportunity Map',
      category: 'seo',
      description: 'Shows backlink sources and trust signals.',
      schema: { widget: 'graph', edges: ['source', 'target', 'trust'] },
      atomKeys: ['backlinks'],
    },
  ],
  dashboards: [
    {
      key: 'seoDashboard',
      name: 'SEO Management Dashboard',
      description: 'Single pane of glass to monitor SEO health and opportunities.',
      domain: 'seo',
      layout: { type: 'grid', columns: 12 },
      components: [
        { componentKey: 'seoScoreCard', position: { x: 0, y: 0, w: 4, h: 4 } },
        { componentKey: 'keywordOpportunities', position: { x: 4, y: 0, w: 8, h: 6 } },
        { componentKey: 'backlinkMap', position: { x: 0, y: 6, w: 12, h: 6 } },
      ],
    },
  ],
  defaultSeedUrls: ['https://lightdom.com', 'https://developers.google.com/search'],
  categories: ['SEO', 'Performance'],
  hyperparameters: { autoTrain: true, crawlerInstances: 3 },
};

const ANALYTICS_BLUEPRINT: WorkflowBlueprint = {
  schemaKey: 'analytics-insights',
  datasetName: 'Analytics Insight Dataset',
  datasetDescription: 'Aggregated analytics metrics for behavioral clustering and forecasting.',
  atoms: [
    {
      key: 'trafficMetrics',
      name: 'Traffic Metrics Collector',
      category: 'analytics',
      description: 'Collects sessions, bounce rate, and conversion funnels.',
      schema: { fields: ['sessions', 'bounceRate', 'conversionRate'] },
      extractionRules: { api: 'google-analytics', dimensions: ['date', 'channel'] },
      weight: 1,
    },
    {
      key: 'engagementSignals',
      name: 'Engagement Signal Analyzer',
      category: 'analytics',
      description: 'Captures time on page, scroll depth, and micro conversions.',
      schema: { fields: ['avgTimeOnPage', 'scrollDepth', 'microConversions'] },
      extractionRules: { events: ['scroll', 'cta_click'], minSessions: 100 },
      weight: 0.85,
    },
  ],
  components: [
    {
      key: 'trafficOverview',
      name: 'Traffic Overview',
      category: 'analytics',
      description: 'Card showing key traffic metrics with delta indicators.',
      schema: { widget: 'card', metrics: ['sessions', 'conversionRate'] },
      atomKeys: ['trafficMetrics'],
    },
    {
      key: 'engagementTable',
      name: 'Engagement Table',
      category: 'analytics',
      description: 'Table showing engagement signals per channel.',
      schema: { widget: 'table', columns: ['channel', 'avgTimeOnPage', 'scrollDepth'] },
      atomKeys: ['engagementSignals'],
    },
  ],
  dashboards: [
    {
      key: 'analyticsDashboard',
      name: 'Analytics Performance Dashboard',
      description: 'Tracks acquisition and engagement metrics for growth teams.',
      domain: 'analytics',
      layout: { type: 'grid', columns: 12 },
      components: [
        { componentKey: 'trafficOverview', position: { x: 0, y: 0, w: 4, h: 4 } },
        { componentKey: 'engagementTable', position: { x: 4, y: 0, w: 8, h: 8 } },
      ],
    },
  ],
  defaultSeedUrls: ['https://analytics.google.com', 'https://mixpanel.com'],
  categories: ['Analytics', 'Behavior'],
  hyperparameters: { autoTrain: true, crawlerInstances: 2 },
};

const DEFAULT_BLUEPRINT: WorkflowBlueprint = {
  schemaKey: 'generic-insight',
  datasetName: 'Insight Dataset',
  datasetDescription: 'General purpose dataset for insight mining and workflow automation.',
  atoms: [
    {
      key: 'contentBlocks',
      name: 'Content Block Parser',
      category: 'content',
      description: 'Extracts headings, paragraphs, and actionable summaries.',
      schema: { fields: ['heading', 'body', 'cta'] },
      extractionRules: { selectors: ['h1', 'h2', 'p', 'button'], limit: 20 },
      weight: 0.8,
    },
  ],
  components: [
    {
      key: 'insightCard',
      name: 'Insight Card',
      category: 'insight',
      description: 'Card that surfaces insights and recommendations.',
      schema: { widget: 'card', fields: ['insight', 'recommendation'] },
      atomKeys: ['contentBlocks'],
    },
  ],
  dashboards: [
    {
      key: 'insightDashboard',
      name: 'Insight Dashboard',
      description: 'Default dashboard showcasing surfaced insights.',
      domain: 'insight',
      layout: { type: 'grid', columns: 12 },
      components: [
        { componentKey: 'insightCard', position: { x: 0, y: 0, w: 6, h: 4 } },
      ],
    },
  ],
  defaultSeedUrls: ['https://lightdom.com'],
  categories: ['Insight'],
  hyperparameters: { autoTrain: false, crawlerInstances: 1 },
};

const chooseBlueprint = (prompt: string): WorkflowBlueprint => {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('seo')) return SEO_BLUEPRINT;
  if (normalized.includes('analytics') || normalized.includes('engagement') || normalized.includes('traffic')) {
    return ANALYTICS_BLUEPRINT;
  }
  return DEFAULT_BLUEPRINT;
};

export const PromptWorkflowBuilder = {
  build(prompt: string): WorkflowBlueprint {
    const blueprint = chooseBlueprint(prompt);
    return {
      ...blueprint,
      // clone arrays to avoid mutation leaks
      atoms: blueprint.atoms.map((atom) => ({ ...atom, schema: { ...atom.schema }, extractionRules: { ...atom.extractionRules } })),
      components: blueprint.components.map((component) => ({
        ...component,
        schema: { ...component.schema },
        metadata: component.metadata ? { ...component.metadata } : undefined,
        atomKeys: [...component.atomKeys],
      })),
      dashboards: blueprint.dashboards.map((dashboard) => ({
        ...dashboard,
        layout: { ...dashboard.layout },
        metadata: dashboard.metadata ? { ...dashboard.metadata } : undefined,
        components: dashboard.components.map((placement) => ({
          ...placement,
          position: placement.position ? { ...placement.position } : undefined,
          settings: placement.settings ? { ...placement.settings } : undefined,
        })),
      })),
      defaultSeedUrls: [...blueprint.defaultSeedUrls],
      categories: [...blueprint.categories],
      hyperparameters: { ...blueprint.hyperparameters },
    };
  },
};
