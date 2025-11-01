// Minimal crawler-related types referenced by WebCrawlerService and consumers
export interface CrawlOptions {
  depth?: number;
  followExternal?: boolean;
  priority?: number;
  delay?: number;
  attempts?: number;
  viewport?: { width: number; height: number };
  userAgent?: string;
  waitUntil?: string;
  timeout?: number;
  waitForSelector?: string;
  generatePDF?: boolean;
}

export interface CrawlResult {
  url: string;
  status: number | string;
  html?: string;
  resources?: Array<any>;
  crawlId?: string;
  timestamp?: string;
  websiteData?: WebsiteData;
  domAnalysis?: any;
  opportunities?: any[];
  screenshot?: Buffer;
  pdf?: Buffer;
  performance?: any;
}

export interface WebsiteData {
  url: string;
  title?: string;
  metadata?: Record<string, string>;
  description?: string;
  structuredData?: any[];
  links?: { internal: any[]; external: any[]; broken?: any[] };
  images?: any[];
  scripts?: any[];
  stylesheets?: any[];
  fonts?: any[];
  socialLinks?: Record<string, string>;
}

export interface OptimizationOpportunity {
  id?: string;
  type: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  title?: string;
  description?: string;
  impact?: string;
  effort?: 'low' | 'medium' | 'high';
  savings?: {
    performance?: number;
    bandwidth?: number;
    accessibility?: number;
    seo?: number;
    userExperience?: number;
    caching?: number;
    maintainability?: number;
  };
  savingsBytes?: number;
  elements?: string[];
  selectors?: string[];
}
