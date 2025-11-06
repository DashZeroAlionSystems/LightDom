/**
 * Style Guide Configuration System
 * Default configurations for terminal programs, graphics rendering, and workflow orchestration
 */

export interface TerminalStyleConfig {
  theme: {
    name: string;
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      highlight: string;
      dim: string;
    };
    formatting: {
      borders: boolean;
      icons: boolean;
      timestamps: boolean;
      serviceLabels: boolean;
      progressBars: boolean;
    };
  };
  layout: {
    maxLineLength: number;
    spacing: 'compact' | 'normal' | 'spacious';
    indentation: number;
  };
  output: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    bufferSize: number;
    enableColors: boolean;
  };
}

export interface GraphicsStyleConfig {
  rendering: {
    theme: 'modern' | 'classic' | 'minimal' | 'bold';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading: string;
      small: string;
    };
    lineHeight: number;
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    unit: number; // base spacing unit in pixels
    scale: number[]; // spacing scale multipliers
    padding: 'compact' | 'normal' | 'spacious';
    margin: 'compact' | 'normal' | 'spacious';
  };
  effects: {
    borderRadius: string;
    shadows: boolean;
    animations: boolean;
    transitions: boolean;
  };
}

export interface MetricsConfig {
  dataPoints: {
    performance: {
      enabled: boolean;
      metrics: string[];
      thresholds: {
        good: number;
        warning: number;
        critical: number;
      };
    };
    analytics: {
      enabled: boolean;
      events: string[];
      sampling: number;
    };
    monitoring: {
      enabled: boolean;
      interval: number;
      retention: number;
    };
  };
  aggregation: {
    interval: number;
    methods: ('avg' | 'sum' | 'min' | 'max' | 'count')[];
  };
  visualization: {
    chartType: 'line' | 'bar' | 'gauge' | 'table';
    colors: string[];
    updateInterval: number;
  };
}

export interface WorkflowOrchestrationConfig {
  execution: {
    mode: 'sequential' | 'parallel' | 'mixed';
    concurrency: number;
    timeout: number;
    retries: number;
  };
  monitoring: {
    enableLogs: boolean;
    enableMetrics: boolean;
    enableTracing: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  dependencies: {
    resolution: 'strict' | 'loose';
    autoInstall: boolean;
    updateStrategy: 'manual' | 'auto' | 'prompt';
  };
  errorHandling: {
    strategy: 'fail-fast' | 'continue' | 'retry';
    notifications: boolean;
    rollback: boolean;
  };
}

export interface DeepSeekLearningConfig {
  skills: {
    categories: string[];
    prioritization: 'manual' | 'frequency' | 'complexity';
    retentionPeriod: number;
  };
  research: {
    sources: string[];
    depth: 'shallow' | 'medium' | 'deep';
    validation: boolean;
  };
  training: {
    mode: 'supervised' | 'unsupervised' | 'reinforcement';
    feedbackLoop: boolean;
    modelUpdate: 'continuous' | 'batched';
  };
  context: {
    maxSize: number;
    compression: boolean;
    relevanceScoring: boolean;
  };
}

export interface LinkedMapsConfig {
  structure: {
    nodes: {
      type: string;
      properties: string[];
      connections: string[];
    }[];
    edges: {
      type: string;
      weight: number;
      bidirectional: boolean;
    }[];
  };
  traversal: {
    algorithm: 'bfs' | 'dfs' | 'dijkstra' | 'astar';
    maxDepth: number;
    pruning: boolean;
  };
  visualization: {
    layout: 'hierarchical' | 'force-directed' | 'circular';
    interactive: boolean;
    realTimeUpdates: boolean;
  };
}

// Default Configurations

export const defaultTerminalStyle: TerminalStyleConfig = {
  theme: {
    name: 'Professional Dark',
    colors: {
      primary: '#3b82f6',    // Blue
      secondary: '#8b5cf6',   // Purple
      success: '#10b981',     // Green
      warning: '#f59e0b',     // Amber
      error: '#ef4444',       // Red
      info: '#06b6d4',        // Cyan
      highlight: '#ec4899',   // Pink
      dim: '#6b7280',         // Gray
    },
    formatting: {
      borders: true,
      icons: true,
      timestamps: true,
      serviceLabels: true,
      progressBars: true,
    },
  },
  layout: {
    maxLineLength: 120,
    spacing: 'normal',
    indentation: 2,
  },
  output: {
    logLevel: 'info',
    bufferSize: 1000,
    enableColors: true,
  },
};

export const defaultGraphicsStyle: GraphicsStyleConfig = {
  rendering: {
    theme: 'modern',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      base: '16px',
      heading: '24px',
      small: '14px',
    },
    lineHeight: 1.6,
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    unit: 8,
    scale: [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8],
    padding: 'normal',
    margin: 'normal',
  },
  effects: {
    borderRadius: '8px',
    shadows: true,
    animations: true,
    transitions: true,
  },
};

export const defaultMetricsConfig: MetricsConfig = {
  dataPoints: {
    performance: {
      enabled: true,
      metrics: [
        'responseTime',
        'throughput',
        'errorRate',
        'cpuUsage',
        'memoryUsage',
        'activeConnections',
      ],
      thresholds: {
        good: 0.8,
        warning: 0.9,
        critical: 0.95,
      },
    },
    analytics: {
      enabled: true,
      events: [
        'pageView',
        'userAction',
        'conversion',
        'error',
        'performance',
      ],
      sampling: 1.0,
    },
    monitoring: {
      enabled: true,
      interval: 30000, // 30 seconds
      retention: 86400000, // 24 hours
    },
  },
  aggregation: {
    interval: 60000, // 1 minute
    methods: ['avg', 'min', 'max', 'count'],
  },
  visualization: {
    chartType: 'line',
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    updateInterval: 5000,
  },
};

export const defaultWorkflowOrchestration: WorkflowOrchestrationConfig = {
  execution: {
    mode: 'mixed',
    concurrency: 5,
    timeout: 300000, // 5 minutes
    retries: 3,
  },
  monitoring: {
    enableLogs: true,
    enableMetrics: true,
    enableTracing: true,
    logLevel: 'info',
  },
  dependencies: {
    resolution: 'strict',
    autoInstall: false,
    updateStrategy: 'manual',
  },
  errorHandling: {
    strategy: 'retry',
    notifications: true,
    rollback: true,
  },
};

export const defaultDeepSeekLearning: DeepSeekLearningConfig = {
  skills: {
    categories: [
      'code-generation',
      'data-analysis',
      'web-scraping',
      'seo-optimization',
      'testing',
      'debugging',
      'documentation',
      'design-patterns',
    ],
    prioritization: 'frequency',
    retentionPeriod: 2592000000, // 30 days
  },
  research: {
    sources: [
      'documentation',
      'code-repositories',
      'technical-blogs',
      'stack-overflow',
      'research-papers',
    ],
    depth: 'medium',
    validation: true,
  },
  training: {
    mode: 'reinforcement',
    feedbackLoop: true,
    modelUpdate: 'batched',
  },
  context: {
    maxSize: 10000,
    compression: true,
    relevanceScoring: true,
  },
};

export const defaultLinkedMaps: LinkedMapsConfig = {
  structure: {
    nodes: [
      {
        type: 'service',
        properties: ['name', 'version', 'status', 'health'],
        connections: ['dependencies', 'consumers'],
      },
      {
        type: 'data',
        properties: ['schema', 'format', 'size', 'lastUpdate'],
        connections: ['sources', 'destinations'],
      },
      {
        type: 'workflow',
        properties: ['steps', 'status', 'progress'],
        connections: ['prerequisites', 'outputs'],
      },
    ],
    edges: [
      {
        type: 'dependency',
        weight: 1.0,
        bidirectional: false,
      },
      {
        type: 'dataflow',
        weight: 0.8,
        bidirectional: true,
      },
    ],
  },
  traversal: {
    algorithm: 'bfs',
    maxDepth: 10,
    pruning: true,
  },
  visualization: {
    layout: 'force-directed',
    interactive: true,
    realTimeUpdates: true,
  },
};

// Scenario-specific configurations

export const scenarioConfigs = {
  // Terminal program for data mining research
  dataMiningResearch: {
    terminal: {
      ...defaultTerminalStyle,
      layout: {
        maxLineLength: 150,
        spacing: 'spacious',
        indentation: 4,
      },
      output: {
        logLevel: 'debug',
        bufferSize: 5000,
        enableColors: true,
      },
    },
    metrics: {
      ...defaultMetricsConfig,
      dataPoints: {
        ...defaultMetricsConfig.dataPoints,
        performance: {
          enabled: true,
          metrics: [
            'extractionRate',
            'dataQuality',
            'processingSpeed',
            'storageUsage',
          ],
          thresholds: {
            good: 0.9,
            warning: 0.7,
            critical: 0.5,
          },
        },
      },
    },
  },

  // DeepSeek skill learning
  deepSeekSkillLearning: {
    terminal: defaultTerminalStyle,
    learning: {
      ...defaultDeepSeekLearning,
      skills: {
        categories: [
          'nodejs-development',
          'web-automation',
          'data-extraction',
          'api-integration',
          'workflow-orchestration',
          'business-logic',
          'error-handling',
          'performance-optimization',
        ],
        prioritization: 'complexity',
        retentionPeriod: 7776000000, // 90 days
      },
      research: {
        sources: [
          'github-repositories',
          'npm-packages',
          'technical-documentation',
          'code-examples',
          'best-practices',
        ],
        depth: 'deep',
        validation: true,
      },
    },
  },

  // Digital business management
  digitalBusinessManagement: {
    terminal: defaultTerminalStyle,
    workflow: {
      ...defaultWorkflowOrchestration,
      execution: {
        mode: 'parallel',
        concurrency: 10,
        timeout: 600000, // 10 minutes
        retries: 5,
      },
    },
    metrics: {
      ...defaultMetricsConfig,
      dataPoints: {
        performance: {
          enabled: true,
          metrics: [
            'revenue',
            'conversions',
            'customerSatisfaction',
            'operationalEfficiency',
            'systemUptime',
          ],
          thresholds: {
            good: 0.95,
            warning: 0.85,
            critical: 0.75,
          },
        },
        analytics: {
          enabled: true,
          events: [
            'transaction',
            'customerInteraction',
            'systemEvent',
            'businessMetric',
          ],
          sampling: 1.0,
        },
        monitoring: {
          enabled: true,
          interval: 10000, // 10 seconds
          retention: 604800000, // 7 days
        },
      },
    },
    linkedMaps: {
      ...defaultLinkedMaps,
      structure: {
        nodes: [
          {
            type: 'business-unit',
            properties: ['name', 'revenue', 'costs', 'performance'],
            connections: ['dependencies', 'partners', 'services'],
          },
          {
            type: 'customer',
            properties: ['segment', 'lifetime-value', 'satisfaction'],
            connections: ['touchpoints', 'transactions'],
          },
          {
            type: 'process',
            properties: ['efficiency', 'automation-level', 'bottlenecks'],
            connections: ['inputs', 'outputs', 'optimizations'],
          },
        ],
        edges: [
          {
            type: 'business-relationship',
            weight: 1.0,
            bidirectional: true,
          },
        ],
      },
    },
  },

  // Workflow orchestration
  workflowOrchestration: {
    terminal: {
      ...defaultTerminalStyle,
      theme: {
        ...defaultTerminalStyle.theme,
        formatting: {
          borders: true,
          icons: true,
          timestamps: true,
          serviceLabels: true,
          progressBars: true,
        },
      },
    },
    workflow: {
      ...defaultWorkflowOrchestration,
      monitoring: {
        enableLogs: true,
        enableMetrics: true,
        enableTracing: true,
        logLevel: 'debug',
      },
    },
    linkedMaps: {
      ...defaultLinkedMaps,
      visualization: {
        layout: 'hierarchical',
        interactive: true,
        realTimeUpdates: true,
      },
    },
  },
};

// Configuration loader
export class StyleGuideManager {
  private configs: Map<string, any> = new Map();

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
    this.configs.set('terminal', defaultTerminalStyle);
    this.configs.set('graphics', defaultGraphicsStyle);
    this.configs.set('metrics', defaultMetricsConfig);
    this.configs.set('workflow', defaultWorkflowOrchestration);
    this.configs.set('learning', defaultDeepSeekLearning);
    this.configs.set('linkedMaps', defaultLinkedMaps);
  }

  public getConfig<T>(key: string): T {
    return this.configs.get(key) as T;
  }

  public setConfig(key: string, config: any): void {
    this.configs.set(key, config);
  }

  public getScenarioConfig(scenario: keyof typeof scenarioConfigs): any {
    return scenarioConfigs[scenario];
  }

  public mergeConfig<T>(base: T, override: Partial<T>): T {
    return { ...base, ...override };
  }

  public exportConfig(key: string): string {
    return JSON.stringify(this.configs.get(key), null, 2);
  }

  public importConfig(key: string, json: string): void {
    try {
      const config = JSON.parse(json);
      this.configs.set(key, config);
    } catch (error) {
      throw new Error(`Failed to import config: ${error}`);
    }
  }
}

export const styleGuideManager = new StyleGuideManager();
