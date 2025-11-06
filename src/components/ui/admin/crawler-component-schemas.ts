/**
 * Crawler Dashboard Component Schemas
 * 
 * Schema definitions for crawler monitoring and URL seeding components.
 * These schemas define how components interact with database tables and workflows.
 */

export const crawlerComponentSchemas = {
  /**
   * Enhanced Crawler Monitoring Dashboard Schema
   */
  enhancedCrawlerMonitoring: {
    componentName: 'EnhancedCrawlerMonitoringDashboard',
    feature: 'crawler-monitoring',
    description: 'Real-time parallel crawler monitoring with live status updates',
    dataSources: [
      {
        type: 'api',
        endpoint: '/api/crawler/active',
        table: 'active_crawlers',
        refreshInterval: 2000,
        fields: [
          { name: 'crawler_id', type: 'string', display: 'Crawler ID' },
          { name: 'status', type: 'enum', values: ['active', 'idle', 'error'], display: 'Status' },
          { name: 'current_url', type: 'string', display: 'Current URL' },
          { name: 'queue_size', type: 'number', display: 'Queue Size' },
          { name: 'pages_per_second', type: 'number', format: 'decimal', display: 'Pages/Second' },
          { name: 'efficiency_percent', type: 'number', format: 'percentage', display: 'Efficiency' },
          { name: 'total_pages_processed', type: 'number', format: 'compact', display: 'Pages Processed' },
        ],
      },
      {
        type: 'api',
        endpoint: '/api/crawler/stats',
        table: 'crawler_statistics',
        refreshInterval: 2000,
        fields: [
          { name: 'total_urls_crawled', type: 'number', format: 'compact', display: 'Total URLs' },
          { name: 'total_space_saved', type: 'number', format: 'bytes', display: 'Space Saved' },
          { name: 'active_workers', type: 'number', display: 'Active Workers' },
        ],
      },
    ],
    atomicComponents: [
      'LiveStatusIndicator',
      'LiveMetricCard',
      'ActivityPulse',
      'LiveCounter',
      'LiveProgressBar',
      'LiveBadge',
      'LiveTimestamp',
    ],
    designSystemComponents: [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardContent',
      'Button',
      'Badge',
    ],
    interactions: [
      {
        type: 'refresh',
        trigger: 'auto',
        interval: 2000,
        action: 'fetchCrawlerData',
      },
      {
        type: 'refresh',
        trigger: 'button',
        action: 'fetchCrawlerData',
      },
      {
        type: 'toggle',
        field: 'autoRefresh',
        action: 'setAutoRefresh',
      },
    ],
    workflows: [
      {
        name: 'CrawlerMonitoring',
        trigger: 'componentMount',
        steps: [
          'initializeWebSocket',
          'fetchInitialData',
          'setupAutoRefresh',
          'subscribeToUpdates',
        ],
      },
      {
        name: 'CrawlerStatusUpdate',
        trigger: 'dataChange',
        steps: [
          'parseStatusUpdate',
          'updateCrawlerState',
          'animateTransition',
          'updateMetrics',
        ],
      },
    ],
  },

  /**
   * URL Seeding Service Schema
   */
  urlSeedingService: {
    componentName: 'URLSeedingService',
    feature: 'crawler-seeding',
    description: 'AI-powered URL seed generation and crawler configuration',
    dataSources: [
      {
        type: 'api',
        endpoint: '/api/crawler/generate-config',
        method: 'POST',
        table: 'crawler_configurations',
        fields: [
          { name: 'prompt', type: 'text', required: true, display: 'AI Prompt' },
          { name: 'schemaKey', type: 'string', display: 'Schema Key' },
          { name: 'seeds', type: 'array', itemType: 'url', display: 'URL Seeds' },
          { name: 'parallelCrawlers', type: 'number', min: 1, max: 20, display: 'Parallel Crawlers' },
          { name: 'attributes', type: 'array', itemType: 'string', display: 'Attributes' },
        ],
      },
      {
        type: 'api',
        endpoint: '/api/crawler/start-job',
        method: 'POST',
        table: 'crawl_jobs',
        fields: [
          { name: 'seeds', type: 'array', itemType: 'url', required: true, display: 'Seeds' },
          { name: 'config', type: 'object', display: 'Configuration' },
          { name: 'schemaKey', type: 'string', display: 'Schema Key' },
        ],
      },
    ],
    atomicComponents: [
      'LiveStatusIndicator',
      'LiveMetricCard',
      'LiveBadge',
      'LiveCounter',
    ],
    designSystemComponents: [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardContent',
      'CardFooter',
      'Button',
      'Input',
      'Badge',
    ],
    interactions: [
      {
        type: 'generate',
        trigger: 'button',
        field: 'prompt',
        action: 'generateFromPrompt',
        validation: 'promptNotEmpty',
      },
      {
        type: 'add',
        trigger: 'button',
        field: 'newSeedUrl',
        action: 'addManualSeed',
        validation: 'validUrl',
      },
      {
        type: 'submit',
        trigger: 'button',
        action: 'startCrawling',
        validation: 'hasSeeds',
      },
    ],
    workflows: [
      {
        name: 'AIConfigGeneration',
        trigger: 'generateButton',
        steps: [
          'validatePrompt',
          'callAIService',
          'parseResponse',
          'transformToConfig',
          'displayConfiguration',
        ],
      },
      {
        name: 'CrawlerJobStart',
        trigger: 'startButton',
        steps: [
          'validateSeeds',
          'prepareJobConfig',
          'submitToCrawlerService',
          'handleResponse',
          'resetForm',
        ],
      },
    ],
  },

  /**
   * Crawler Workload Dashboard Schema
   */
  crawlerWorkloadDashboard: {
    componentName: 'CrawlerWorkloadDashboard',
    feature: 'crawler-management',
    description: 'Comprehensive crawler management with monitoring, seeding, and settings',
    childComponents: [
      'EnhancedCrawlerMonitoringDashboard',
      'URLSeedingService',
      'WorkloadAnalysisTab',
      'CrawlerSettingsTab',
    ],
    navigation: {
      type: 'tabs',
      tabs: [
        {
          id: 'monitoring',
          label: 'Live Monitoring',
          icon: 'Activity',
          component: 'EnhancedCrawlerMonitoringDashboard',
        },
        {
          id: 'seeding',
          label: 'URL Seeding',
          icon: 'Plus',
          component: 'URLSeedingService',
        },
        {
          id: 'workload',
          label: 'Workload Analysis',
          icon: 'Eye',
          component: 'WorkloadAnalysisTab',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'Settings',
          component: 'CrawlerSettingsTab',
        },
      ],
    },
    designSystemComponents: [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardContent',
      'Button',
      'Badge',
    ],
    workflows: [
      {
        name: 'TabNavigation',
        trigger: 'tabClick',
        steps: [
          'updateActiveTab',
          'unmountPreviousComponent',
          'mountNewComponent',
          'updateURL',
        ],
      },
    ],
  },
};

/**
 * Database Table Mappings
 */
export const crawlerTableMappings = {
  active_crawlers: {
    primaryKey: 'crawler_id',
    fields: [
      'crawler_id',
      'status',
      'current_url',
      'queue_size',
      'pages_per_second',
      'efficiency_percent',
      'total_pages_processed',
      'started_at',
      'last_activity',
    ],
    relationships: [
      {
        type: 'hasMany',
        table: 'crawl_targets',
        foreignKey: 'crawler_id',
      },
      {
        type: 'hasMany',
        table: 'dom_optimizations',
        foreignKey: 'worker_id',
      },
    ],
  },
  crawl_targets: {
    primaryKey: 'id',
    fields: [
      'id',
      'url',
      'domain',
      'status',
      'priority',
      'discovered_at',
      'crawler_id',
      'schema_key',
    ],
    relationships: [
      {
        type: 'belongsTo',
        table: 'active_crawlers',
        foreignKey: 'crawler_id',
      },
    ],
  },
  crawler_configurations: {
    primaryKey: 'id',
    fields: [
      'id',
      'name',
      'prompt',
      'schema_key',
      'parallel_crawlers',
      'max_depth',
      'rate_limit',
      'timeout',
      'respect_robots_txt',
      'created_at',
      'updated_at',
    ],
  },
  crawl_jobs: {
    primaryKey: 'id',
    fields: [
      'id',
      'config_id',
      'status',
      'started_at',
      'completed_at',
      'total_pages',
      'pages_crawled',
      'error_count',
    ],
    relationships: [
      {
        type: 'belongsTo',
        table: 'crawler_configurations',
        foreignKey: 'config_id',
      },
      {
        type: 'hasMany',
        table: 'crawl_targets',
        foreignKey: 'job_id',
      },
    ],
  },
};

/**
 * API Endpoint Schemas
 */
export const crawlerAPISchemas = {
  '/api/crawler/active': {
    method: 'GET',
    description: 'Get active crawler instances',
    response: {
      type: 'array',
      items: {
        crawler_id: 'string',
        status: 'string',
        current_url: 'string',
        queue_size: 'number',
        pages_per_second: 'number',
        efficiency_percent: 'number',
        total_pages_processed: 'number',
      },
    },
  },
  '/api/crawler/stats': {
    method: 'GET',
    description: 'Get crawler statistics',
    response: {
      type: 'object',
      fields: {
        total_urls_crawled: 'number',
        total_space_saved: 'number',
        total_tokens_earned: 'number',
        avg_space_per_url: 'number',
        active_workers: 'number',
      },
    },
  },
  '/api/crawler/generate-config': {
    method: 'POST',
    description: 'Generate crawler configuration from AI prompt',
    request: {
      prompt: 'string (required)',
    },
    response: {
      type: 'object',
      fields: {
        seeds: 'array',
        schemaKey: 'string',
        attributes: 'array',
        parallelCrawlers: 'number',
        estimatedPages: 'number',
        estimatedTime: 'string',
      },
    },
  },
  '/api/crawler/start-job': {
    method: 'POST',
    description: 'Start a new crawl job',
    request: {
      seeds: 'array (required)',
      config: 'object',
      schemaKey: 'string',
      attributes: 'array',
    },
    response: {
      type: 'object',
      fields: {
        jobId: 'string',
        status: 'string',
        message: 'string',
      },
    },
  },
};

export default crawlerComponentSchemas;
