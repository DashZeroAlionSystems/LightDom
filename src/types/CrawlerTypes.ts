// Web Crawler Types

export interface CrawlOptions {
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  waitForSelector?: string;
  generatePDF?: boolean;
  takeScreenshot?: boolean;
  priority?: number;
  delay?: number;
  attempts?: number;
  followRedirects?: boolean;
  maxRedirects?: number;
  headers?: Record<string, string>;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
  javascript?: boolean;
  css?: boolean;
  images?: boolean;
  fonts?: boolean;
  media?: boolean;
  other?: boolean;
}

export interface WebsiteData {
  url: string;
  title: string;
  description: string;
  keywords: string;
  language: string;
  charset: string;
  viewport: string;
  robots: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData: any[];
  links: {
    internal: LinkInfo[];
    external: LinkInfo[];
    broken: LinkInfo[];
  };
  images: ImageInfo[];
  scripts: ScriptInfo[];
  stylesheets: StylesheetInfo[];
  fonts: FontInfo[];
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
}

export interface LinkInfo {
  url: string;
  text: string;
  title: string;
  rel?: string;
  target?: string;
  status?: number;
  responseTime?: number;
}

export interface ImageInfo {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  loading: 'eager' | 'lazy';
  sizes?: string;
  srcset?: string;
  type?: string;
  fileSize?: number;
}

export interface ScriptInfo {
  src: string;
  async: boolean;
  defer: boolean;
  type: string;
  integrity?: string;
  crossorigin?: string;
  fileSize?: number;
}

export interface StylesheetInfo {
  href: string;
  media: string;
  type: string;
  integrity?: string;
  crossorigin?: string;
  fileSize?: number;
}

export interface FontInfo {
  href: string;
  type: string;
  family?: string;
  weight?: string;
  style?: string;
  fileSize?: number;
}

export interface OptimizationOpportunity {
  type: 'image' | 'script' | 'css' | 'html' | 'performance' | 'seo' | 'accessibility';
  category: 'performance' | 'seo' | 'accessibility' | 'security' | 'best-practices';
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
    maintainability?: number;
    userExperience?: number;
  };
  elements?: string[];
  selectors?: string[];
  code?: string;
  before?: any;
  after?: any;
}

export interface CrawlResult {
  crawlId: string;
  url: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'partial';
  websiteData: WebsiteData;
  domAnalysis: any; // From HeadlessTypes
  opportunities: OptimizationOpportunity[];
  screenshot?: Buffer;
  pdf?: Buffer;
  performance: {
    totalTime: number;
    pagesAnalyzed: number;
    errors: string[];
    warnings: string[];
  };
  metadata: {
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    cookies: any[];
    headers: Record<string, string>;
    redirects: string[];
  };
}

export interface CrawlStatus {
  crawlId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  url: string;
  options: CrawlOptions;
}

export interface CrawlJob {
  id: string;
  url: string;
  options: CrawlOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: CrawlResult;
}

export interface CrawlQueue {
  waiting: CrawlJob[];
  active: CrawlJob[];
  completed: CrawlJob[];
  failed: CrawlJob[];
  total: number;
}

export interface CrawlMetrics {
  totalCrawls: number;
  successfulCrawls: number;
  failedCrawls: number;
  averageCrawlTime: number;
  averagePageSize: number;
  averageImages: number;
  averageLinks: number;
  averageScripts: number;
  averageStylesheets: number;
  topOpportunities: OptimizationOpportunity[];
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
}

export interface CrawlConfig {
  maxConcurrentCrawls: number;
  defaultTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  blockedDomains: string[];
  allowedDomains: string[];
  maxDepth: number;
  maxPages: number;
  respectRobots: boolean;
  followRedirects: boolean;
  maxRedirects: number;
  delayBetweenRequests: number;
  enableJavaScript: boolean;
  enableImages: boolean;
  enableCSS: boolean;
  enableFonts: boolean;
  enableMedia: boolean;
}

export interface CrawlError {
  code: string;
  message: string;
  url: string;
  timestamp: string;
  retryable: boolean;
  context?: Record<string, any>;
}

export interface CrawlReport {
  crawlId: string;
  url: string;
  timestamp: string;
  summary: {
    totalPages: number;
    totalImages: number;
    totalLinks: number;
    totalScripts: number;
    totalStylesheets: number;
    totalSize: number;
    loadTime: number;
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
  };
  issues: {
    performance: OptimizationOpportunity[];
    seo: OptimizationOpportunity[];
    accessibility: OptimizationOpportunity[];
    security: OptimizationOpportunity[];
  };
  recommendations: string[];
  screenshots: string[];
  pdfs: string[];
}

export interface CrawlServiceStatus {
  isRunning: boolean;
  activeCrawls: number;
  queueStatus: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  config: CrawlConfig;
  metrics: CrawlMetrics;
}

// Event types
export interface CrawlEvents {
  crawlStarted: (crawlId: string, url: string) => void;
  crawlCompleted: (crawlId: string, result: CrawlResult) => void;
  crawlFailed: (crawlId: string, error: CrawlError) => void;
  crawlProgress: (crawlId: string, progress: number) => void;
  opportunityFound: (crawlId: string, opportunity: OptimizationOpportunity) => void;
  error: (error: CrawlError) => void;
}

// Utility types
export type CrawlEventType = keyof CrawlEvents;
export type CrawlStatusType = 'queued' | 'processing' | 'completed' | 'failed';
export type PriorityType = 'low' | 'normal' | 'high' | 'critical';
export type OpportunityType =
  | 'image'
  | 'script'
  | 'css'
  | 'html'
  | 'performance'
  | 'seo'
  | 'accessibility';
export type CategoryType = 'performance' | 'seo' | 'accessibility' | 'security' | 'best-practices';
