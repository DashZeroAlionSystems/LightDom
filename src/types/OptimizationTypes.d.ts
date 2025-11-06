// Minimal types used by OptimizationEngine to reduce tsc noise.
export interface OptimizationResult {
  success: boolean;
  details?: any;
  optimizationId?: string;
  url?: string;
  timestamp?: string;
  status?: string;
  beforeMetrics?: any;
  afterMetrics?: any;
  improvements?: any;
  appliedOptimizations?: any[];
  optimizedContent?: string;
  // Screenshots may be stored as base64 strings or raw binary buffers depending
  // on the runtime (server-side headless screenshots). Accept a broad set of
  // shapes to reduce type friction during triage.
  beforeScreenshot?: string | ArrayBuffer | Uint8Array | any;
  afterScreenshot?: string | ArrayBuffer | Uint8Array | any;
  recommendations?: any;
  savings?: {
    performance?: number;
    bandwidth?: number;
    accessibility?: number;
    seo?: number;
    userExperience?: number;
    caching?: number;
    maintainability?: number;
    fileSize?: number;
    loadTime?: number;
    seoScore?: number;
    accessibilityScore?: number;
  };
  opportunities?: OptimizationOpportunity[];
  duration?: number;
}

export interface OptimizationOptions {
  aggressive?: boolean;
  maxBytes?: number;
  priority?: number;
  timeout?: number;
  retries?: number;
  delay?: number;
  attempts?: number;
  waitForSelector?: string;
  viewport?: {
    width?: number;
    height?: number;
  };
  disabledRules?: string[];
}

export interface OptimizationRule {
  id: string;
  name?: string;
  description?: string;
  apply?: (html: string) => string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high';
  conditions?: {
    divCount?: { min?: number; max?: number; };
    imageCount?: { min?: number; max?: number; };
    criticalResources?: { min?: number; max?: number; };
    missingMetaTags?: { min?: number; max?: number; };
    headingIssues?: { min?: number; max?: number; };
    cssFiles?: { min?: number; max?: number; };
    jsFiles?: { min?: number; max?: number; };
    htmlSize?: { min?: number; max?: number; };
    semanticElements?: { min?: number; max?: number; };
    pageHeight?: { min?: number; max?: number; };
    imageSize?: { min?: number; max?: number; };
    imagesWithoutAlt?: { min?: number; max?: number; };
    oversizedImages?: { min?: number; max?: number; };
    pageSize?: { min?: number; max?: number; };
    bundleSize?: { min?: number; max?: number; };
  };
  actions?: string[];
}

export interface OptimizationOpportunity {
  ruleId: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  savings?: {
    performance?: number;
    bandwidth?: number;
    accessibility?: number;
    seo?: number;
    userExperience?: number;
    caching?: number;
    maintainability?: number;
  };
}

export interface Redis {
  // Redis client interface - simplified for type checking
  [key: string]: any;
}

export interface Queue<T = any> {
  add(name: string, data: T, options?: any): Promise<any>;
  getWaiting(): Promise<any[]>;
  getActive(): Promise<any[]>;
  getCompleted(): Promise<any[]>;
  getFailed(): Promise<any[]>;
  close(): Promise<void>;
  process(name: string, concurrency: number, handler: (job: any) => Promise<void>): void;
  on(event: string, handler: (...args: any[]) => void): void;
}
