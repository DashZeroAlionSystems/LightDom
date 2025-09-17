// Optimization Engine Types

export interface OptimizationOptions {
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  waitForSelector?: string;
  timeout?: number;
  priority?: number;
  delay?: number;
  attempts?: number;
  disabledRules?: string[];
  enabledRules?: string[];
  customRules?: OptimizationRule[];
  generateReport?: boolean;
  takeScreenshots?: boolean;
  generatePDF?: boolean;
  maxOptimizations?: number;
  optimizationLevel?: 'basic' | 'standard' | 'aggressive';
  preserveOriginal?: boolean;
  backupOriginal?: boolean;
}

export interface OptimizationRule {
  id: string;
  name: string;
  category: 'performance' | 'seo' | 'accessibility' | 'security' | 'best-practices';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  conditions: {
    [key: string]: {
      min?: number;
      max?: number;
      equals?: any;
      contains?: string;
      regex?: string;
    };
  };
  actions: string[];
  enabled: boolean;
  weight: number;
  dependencies?: string[];
  conflicts?: string[];
}

export interface OptimizationResult {
  optimizationId: string;
  url: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'partial';
  beforeMetrics: any; // PerformanceMetrics from HeadlessTypes
  afterMetrics: any; // PerformanceMetrics from HeadlessTypes
  improvements: {
    loadTime: string;
    firstContentfulPaint: string;
    largestContentfulPaint: string;
    cumulativeLayoutShift: string;
    totalBlockingTime?: string;
    firstInputDelay?: string;
    timeToInteractive?: string;
  };
  appliedOptimizations: AppliedOptimization[];
  optimizedContent: string;
  beforeScreenshot?: Buffer;
  afterScreenshot?: Buffer;
  savings: {
    fileSize: number;
    loadTime: number;
    seoScore: number;
    accessibilityScore: number;
    performanceScore: number;
    bandwidth: number;
    caching: number;
  };
  recommendations: string[];
  report?: OptimizationReport;
}

export interface AppliedOptimization {
  ruleId: string;
  ruleName: string;
  category: string;
  priority: string;
  result: any;
  timestamp: string;
  impact: {
    performance?: number;
    seo?: number;
    accessibility?: number;
    bandwidth?: number;
    caching?: number;
  };
  effort: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface OptimizationReport {
  summary: {
    totalOptimizations: number;
    successfulOptimizations: number;
    failedOptimizations: number;
    totalSavings: number;
    performanceImprovement: number;
    seoImprovement: number;
    accessibilityImprovement: number;
  };
  details: {
    imageOptimizations: ImageOptimization[];
    scriptOptimizations: ScriptOptimization[];
    cssOptimizations: CSSOptimization[];
    htmlOptimizations: HTMLOptimization[];
    performanceOptimizations: PerformanceOptimization[];
    seoOptimizations: SEOOptimization[];
    accessibilityOptimizations: AccessibilityOptimization[];
  };
  metrics: {
    before: OptimizationMetrics;
    after: OptimizationMetrics;
    improvements: OptimizationMetrics;
  };
  recommendations: OptimizationRecommendation[];
  nextSteps: string[];
}

export interface ImageOptimization {
  type: 'compression' | 'format-conversion' | 'resizing' | 'lazy-loading' | 'responsive';
  imagesProcessed: number;
  totalSavings: number;
  averageSavings: number;
  formats: {
    original: string;
    optimized: string;
    count: number;
  }[];
  details: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    quality: number;
  }[];
}

export interface ScriptOptimization {
  type: 'minification' | 'bundling' | 'splitting' | 'tree-shaking' | 'lazy-loading';
  scriptsProcessed: number;
  totalSavings: number;
  averageSavings: number;
  details: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    type: string;
  }[];
}

export interface CSSOptimization {
  type: 'minification' | 'critical-css' | 'unused-css-removal' | 'bundling' | 'tree-shaking';
  stylesheetsProcessed: number;
  totalSavings: number;
  averageSavings: number;
  criticalCSS: {
    extracted: boolean;
    size: number;
    inline: boolean;
  };
  details: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
    type: string;
  }[];
}

export interface HTMLOptimization {
  type: 'minification' | 'semantic-html' | 'meta-tags' | 'structure' | 'validation';
  elementsProcessed: number;
  totalSavings: number;
  averageSavings: number;
  details: {
    type: string;
    count: number;
    impact: string;
  }[];
}

export interface PerformanceOptimization {
  type: 'lazy-loading' | 'preloading' | 'prefetching' | 'caching' | 'compression';
  elementsProcessed: number;
  totalSavings: number;
  averageSavings: number;
  details: {
    type: string;
    count: number;
    impact: string;
  }[];
}

export interface SEOOptimization {
  type: 'meta-tags' | 'heading-structure' | 'alt-text' | 'structured-data' | 'sitemap';
  elementsProcessed: number;
  totalSavings: number;
  averageSavings: number;
  details: {
    type: string;
    count: number;
    impact: string;
  }[];
}

export interface AccessibilityOptimization {
  type: 'alt-text' | 'aria-labels' | 'heading-structure' | 'color-contrast' | 'keyboard-navigation';
  elementsProcessed: number;
  totalSavings: number;
  averageSavings: number;
  details: {
    type: string;
    count: number;
    impact: string;
  }[];
}

export interface OptimizationMetrics {
  performance: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
  seo: {
    score: number;
    metaTags: number;
    headingStructure: number;
    altText: number;
    structuredData: number;
  };
  accessibility: {
    score: number;
    altText: number;
    ariaLabels: number;
    headingStructure: number;
    colorContrast: number;
    keyboardNavigation: number;
  };
  fileSize: {
    total: number;
    images: number;
    scripts: number;
    stylesheets: number;
    html: number;
  };
  resources: {
    total: number;
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
  };
}

export interface OptimizationRecommendation {
  type: 'performance' | 'seo' | 'accessibility' | 'security' | 'best-practices';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  savings: {
    performance?: number;
    seo?: number;
    accessibility?: number;
    bandwidth?: number;
    caching?: number;
  };
  implementation: {
    steps: string[];
    code?: string;
    tools?: string[];
    resources?: string[];
  };
  examples?: {
    before: string;
    after: string;
  }[];
}

export interface OptimizationStatus {
  optimizationId: string;
  status: 'queued' | 'analyzing' | 'optimizing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  url: string;
  options: OptimizationOptions;
  currentStep?: string;
  stepsCompleted: string[];
  stepsRemaining: string[];
}

export interface OptimizationJob {
  id: string;
  url: string;
  options: OptimizationOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: OptimizationResult;
}

export interface OptimizationQueue {
  waiting: OptimizationJob[];
  active: OptimizationJob[];
  completed: OptimizationJob[];
  failed: OptimizationJob[];
  total: number;
}

export interface OptimizationConfig {
  maxConcurrentOptimizations: number;
  defaultTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  optimizationLevel: 'basic' | 'standard' | 'aggressive';
  enabledRules: string[];
  disabledRules: string[];
  customRules: OptimizationRule[];
  generateReport: boolean;
  takeScreenshots: boolean;
  generatePDF: boolean;
  preserveOriginal: boolean;
  backupOriginal: boolean;
}

export interface OptimizationError {
  code: string;
  message: string;
  url: string;
  timestamp: string;
  retryable: boolean;
  context?: Record<string, any>;
  ruleId?: string;
  step?: string;
}

export interface OptimizationServiceStatus {
  isRunning: boolean;
  activeOptimizations: number;
  queueStatus: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  config: OptimizationConfig;
  rules: OptimizationRule[];
  metrics: OptimizationMetrics;
}

// Event types
export interface OptimizationEvents {
  optimizationStarted: (optimizationId: string, url: string) => void;
  optimizationCompleted: (optimizationId: string, result: OptimizationResult) => void;
  optimizationFailed: (optimizationId: string, error: OptimizationError) => void;
  optimizationProgress: (optimizationId: string, progress: number, step: string) => void;
  ruleApplied: (optimizationId: string, rule: AppliedOptimization) => void;
  error: (error: OptimizationError) => void;
}

// Utility types
export type OptimizationEventType = keyof OptimizationEvents;
export type OptimizationStatusType = 'queued' | 'analyzing' | 'optimizing' | 'completed' | 'failed';
export type OptimizationLevelType = 'basic' | 'standard' | 'aggressive';
export type OptimizationCategoryType =
  | 'performance'
  | 'seo'
  | 'accessibility'
  | 'security'
  | 'best-practices';
export type OptimizationPriorityType = 'low' | 'medium' | 'high' | 'critical';
export type OptimizationEffortType = 'low' | 'medium' | 'high';
