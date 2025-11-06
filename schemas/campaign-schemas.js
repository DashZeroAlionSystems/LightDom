/**
 * SEO Campaign Configuration Schemas
 * 
 * Default schemas for all campaign entities:
 * - Services
 * - Attributes
 * - Seeds
 * - Crawler
 * - Data Streams
 * - Workflows
 * - SEO Campaigns
 */

export const campaignSchemas = {
  /**
   * Service Configuration Schema
   */
  service: {
    id: null,
    name: '',
    type: 'crawler', // crawler, analyzer, miner, neural-network, competitor-analysis
    status: 'inactive', // inactive, active, paused, error
    config: {
      enabled: true,
      autoStart: false,
      maxConcurrency: 5,
      requestDelay: 2000,
      timeout: 30000,
      retryAttempts: 3,
      userAgent: 'LightDom SEO Bot/1.0',
      headers: {},
      proxy: null
    },
    resources: {
      cpuLimit: 1.0,
      memoryLimit: '512MB',
      storageLimit: '10GB'
    },
    monitoring: {
      enabled: true,
      healthCheckInterval: 60000,
      metricsRetention: 86400000 // 24 hours
    },
    createdAt: null,
    updatedAt: null
  },

  /**
   * Attribute Configuration Schema
   */
  attribute: {
    id: null,
    name: '',
    category: 'seo_core', // seo_core, performance, structured_data, etc.
    description: '',
    dataType: 'string', // string, number, boolean, array, object
    extractionMethod: 'dom', // dom, api, computed, puppeteer
    selector: '',
    algorithm: null,
    validation: {
      required: false,
      minLength: null,
      maxLength: null,
      pattern: null,
      enum: null
    },
    priority: 5, // 0-10
    enabled: true,
    componentSchema: null,
    createdAt: null,
    updatedAt: null
  },

  /**
   * Seed URL Configuration Schema
   */
  seed: {
    id: null,
    url: '',
    type: 'sitemap', // sitemap, manual, generated, discovered
    priority: 5, // 0-10
    depth: 0, // crawl depth from this seed
    maxPages: 100,
    includePatterns: ['*'],
    excludePatterns: [],
    metadata: {
      tags: [],
      category: '',
      notes: ''
    },
    schedule: {
      frequency: 'daily', // once, hourly, daily, weekly, monthly
      time: '00:00',
      enabled: false
    },
    status: 'pending', // pending, active, completed, failed
    createdAt: null,
    updatedAt: null
  },

  /**
   * Crawler Configuration Schema
   */
  crawler: {
    id: null,
    name: '',
    description: '',
    targetUrl: '',
    seedUrls: [],
    config: {
      maxDepth: 3,
      maxPages: 1000,
      parallelRequests: 5,
      requestDelay: 2000,
      timeout: 30000,
      respectRobotsTxt: true,
      followRedirects: true,
      maxRedirects: 5,
      javascript: true,
      waitForSelector: null,
      screenshot: false,
      pdf: false
    },
    filters: {
      includePatterns: ['*'],
      excludePatterns: [],
      allowedDomains: [],
      blockedDomains: []
    },
    extraction: {
      attributes: [], // attribute IDs to extract
      customSelectors: {},
      dataTransforms: []
    },
    storage: {
      saveHTML: false,
      saveScreenshots: false,
      savePDF: false,
      database: true,
      fileSystem: false
    },
    status: 'idle', // idle, running, paused, completed, failed
    progress: {
      pagesProcessed: 0,
      pagesTotal: 0,
      errorCount: 0,
      startedAt: null,
      estimatedCompletion: null
    },
    createdAt: null,
    updatedAt: null
  },

  /**
   * Data Stream Configuration Schema
   */
  dataStream: {
    id: null,
    name: '',
    type: 'realtime', // realtime, batch, scheduled
    source: {
      type: 'crawler', // crawler, api, webhook, database
      id: null,
      config: {}
    },
    destination: {
      type: 'database', // database, api, webhook, file, stream
      config: {
        table: '',
        schema: 'public',
        batchSize: 100,
        flushInterval: 5000
      }
    },
    transformation: {
      enabled: false,
      pipeline: []
    },
    filtering: {
      enabled: false,
      conditions: []
    },
    status: 'inactive', // inactive, active, paused, error
    metrics: {
      recordsProcessed: 0,
      recordsFailed: 0,
      avgProcessingTime: 0,
      lastProcessedAt: null
    },
    createdAt: null,
    updatedAt: null
  },

  /**
   * Workflow Configuration Schema
   */
  workflow: {
    id: null,
    name: '',
    description: '',
    type: 'seo_campaign', // seo_campaign, crawler, analysis, training
    steps: [],
    dependencies: [],
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '00:00',
      timezone: 'UTC'
    },
    triggers: {
      manual: true,
      webhook: false,
      schedule: false,
      event: false
    },
    config: {
      timeout: 3600000, // 1 hour
      retryAttempts: 3,
      retryDelay: 5000,
      continueOnError: false
    },
    n8nWorkflowId: null,
    status: 'draft', // draft, active, paused, completed, failed
    execution: {
      count: 0,
      lastRun: null,
      lastStatus: null,
      avgDuration: 0
    },
    createdAt: null,
    updatedAt: null
  },

  /**
   * SEO Campaign Configuration Schema
   */
  campaign: {
    id: null,
    name: '',
    description: '',
    targetUrl: '',
    clientId: null,
    objectives: [],
    keywords: [],
    competitors: [],
    
    // Services configuration
    services: {
      crawler: null, // crawler ID
      analyzer: null,
      miner: null,
      neuralNetwork: null,
      competitorAnalysis: null
    },
    
    // Attributes to extract (IDs from attribute schema)
    attributes: [],
    
    // Seed URLs for crawling
    seeds: [],
    
    // Data streams configuration
    dataStreams: [],
    
    // Workflow configuration
    workflows: {
      mining: null, // workflow ID
      analysis: null,
      optimization: null,
      reporting: null
    },
    
    // Schedule
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '00:00',
      timezone: 'UTC'
    },
    
    // Notifications
    notifications: {
      email: [],
      webhook: [],
      slack: null,
      discord: null
    },
    
    // Budget and limits
    budget: {
      maxPages: 10000,
      maxCost: 0,
      costPerPage: 0
    },
    
    // Analytics
    analytics: {
      totalPages: 0,
      pagesProcessed: 0,
      attributesExtracted: 0,
      errorCount: 0,
      successRate: 100,
      avgScore: 0,
      improvements: []
    },
    
    status: 'draft', // draft, active, paused, completed, cancelled
    progress: {
      current: 0,
      total: 0,
      percentage: 0
    },
    
    createdAt: null,
    updatedAt: null,
    lastRunAt: null
  }
};

/**
 * CRUD Rules for Campaign Generation
 */
export const campaignCRUDRules = {
  /**
   * Create a complete SEO campaign by wiring up all necessary components
   */
  create: {
    required: ['name', 'targetUrl'],
    steps: [
      {
        name: 'Initialize Campaign',
        action: 'createCampaignRecord',
        schema: 'campaign'
      },
      {
        name: 'Configure Services',
        action: 'createServices',
        schemas: ['service'],
        defaults: {
          crawler: { type: 'crawler', enabled: true, autoStart: true },
          analyzer: { type: 'analyzer', enabled: true },
          miner: { type: 'miner', enabled: true }
        }
      },
      {
        name: 'Select Attributes',
        action: 'selectAttributes',
        schema: 'attribute',
        defaults: {
          // All enabled attributes from seo_attributes_config
          selectAll: true,
          filterByPriority: 5 // Only attributes with priority >= 5
        }
      },
      {
        name: 'Generate Seeds',
        action: 'generateSeeds',
        schema: 'seed',
        sources: [
          'sitemap', // Fetch from sitemap.xml
          'homepage', // Extract links from homepage
          'ai-generated' // Generate via DeepSeek
        ]
      },
      {
        name: 'Configure Crawler',
        action: 'createCrawler',
        schema: 'crawler',
        wireUp: {
          targetUrl: 'campaign.targetUrl',
          seedUrls: 'seeds[].url',
          extraction: {
            attributes: 'attributes[].id'
          }
        }
      },
      {
        name: 'Setup Data Streams',
        action: 'createDataStreams',
        schema: 'dataStream',
        defaults: [
          {
            name: 'Crawler to Database',
            type: 'realtime',
            source: { type: 'crawler', id: 'crawler.id' },
            destination: { type: 'database', config: { table: 'seo_mining_results' } }
          },
          {
            name: 'Results to Analytics',
            type: 'batch',
            source: { type: 'database', config: { table: 'seo_mining_results' } },
            destination: { type: 'api', config: { endpoint: '/api/analytics' } }
          }
        ]
      },
      {
        name: 'Generate Workflows',
        action: 'createWorkflows',
        schema: 'workflow',
        workflows: [
          {
            name: 'SEO Data Mining',
            type: 'seo_campaign',
            steps: [
              'Start Crawler',
              'Extract Attributes',
              'Store Results',
              'Analyze Data',
              'Generate Report'
            ]
          },
          {
            name: 'Competitor Analysis',
            type: 'analysis',
            steps: [
              'Fetch Competitor URLs',
              'Extract Competitor Data',
              'Compare Metrics',
              'Generate Insights'
            ]
          }
        ],
        wireUp: {
          'Start Crawler': 'crawler.id',
          'Extract Attributes': 'attributes[]',
          'Store Results': 'dataStreams[0].id'
        }
      },
      {
        name: 'Link Components',
        action: 'linkComponents',
        updates: {
          campaign: {
            services: {
              crawler: 'services.crawler.id',
              analyzer: 'services.analyzer.id',
              miner: 'services.miner.id'
            },
            attributes: 'attributes[].id',
            seeds: 'seeds[].id',
            dataStreams: 'dataStreams[].id',
            workflows: {
              mining: 'workflows[0].id',
              analysis: 'workflows[1].id'
            }
          }
        }
      },
      {
        name: 'Activate Campaign',
        action: 'activateCampaign',
        triggers: [
          'Start all enabled services',
          'Activate data streams',
          'Enable workflow triggers'
        ]
      }
    ]
  },

  /**
   * Read campaign and all related entities
   */
  read: {
    include: [
      'campaign',
      'services',
      'attributes',
      'seeds',
      'crawler',
      'dataStreams',
      'workflows'
    ],
    populate: true
  },

  /**
   * Update campaign configuration
   */
  update: {
    allowed: ['name', 'description', 'objectives', 'keywords', 'competitors', 'schedule', 'notifications', 'budget'],
    cascade: {
      schedule: ['workflows', 'dataStreams'],
      budget: ['crawler', 'services']
    }
  },

  /**
   * Delete campaign and cleanup
   */
  delete: {
    cascade: true,
    cleanup: [
      'Stop all workflows',
      'Deactivate data streams',
      'Stop crawler',
      'Stop services',
      'Archive results',
      'Delete campaign record'
    ]
  }
};

/**
 * Default configurations for quick campaign creation
 */
export const campaignDefaults = {
  basic: {
    name: 'Basic SEO Audit',
    services: ['crawler'],
    attributes: ['seo_core', 'performance'],
    seedCount: 10,
    maxPages: 100
  },

  standard: {
    name: 'Standard SEO Campaign',
    services: ['crawler', 'analyzer'],
    attributes: ['seo_core', 'performance', 'structured_data', 'content_quality'],
    seedCount: 50,
    maxPages: 500
  },

  professional: {
    name: 'Professional SEO Campaign',
    services: ['crawler', 'analyzer', 'miner', 'neuralNetwork'],
    attributes: ['all'], // All 192 attributes
    seedCount: 100,
    maxPages: 1000,
    competitors: 3
  },

  enterprise: {
    name: 'Enterprise SEO Campaign',
    services: ['crawler', 'analyzer', 'miner', 'neuralNetwork', 'competitorAnalysis'],
    attributes: ['all'],
    seedCount: 'unlimited',
    maxPages: 'unlimited',
    competitors: 10,
    realtime: true,
    schedule: { frequency: 'hourly' }
  }
};

export default campaignSchemas;
