export interface PerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
}

export interface ImageAnalysis {
  total: number;
  withoutAlt: number;
  oversized: number;
  lazyLoaded: number;
  webpSupported: number;
}

export interface ScriptAnalysis {
  total: number;
  inline: number;
  external: number;
  async: number;
  defer: number;
}

export interface CSSAnalysis {
  stylesheets: number;
  inlineStyles: number;
  unusedRules: number;
  criticalCSS: number;
}

export interface ResourceAnalysis {
  total: number;
  images: number;
  scripts: number;
  stylesheets: number;
  fonts: number;
  totalSize: number;
}

export interface DOMAnalysis {
  totalElements: number;
  imageAnalysis: ImageAnalysis;
  scriptAnalysis: ScriptAnalysis;
  cssAnalysis: CSSAnalysis;
  performanceMetrics: PerformanceMetrics;
  resourceAnalysis: ResourceAnalysis;
  analysisTime: number;
  timestamp: string;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  omitBackground?: boolean;
  encoding?: 'base64' | 'binary';
}

export interface PDFOptions {
  format?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Letter' | 'Legal' | 'Tabloid';
  printBackground?: boolean;
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  scale?: number;
  width?: string | number;
  height?: string | number;
  preferCSSPageSize?: boolean;
  tagged?: boolean;
}

export interface LaunchOptions {
  headless?: boolean | 'new';
  args?: string[];
  ignoreDefaultArgs?: boolean | string[];
  handleSIGINT?: boolean;
  handleSIGTERM?: boolean;
  handleSIGHUP?: boolean;
  timeout?: number;
  protocolTimeout?: number;
  slowMo?: number;
  devtools?: boolean;
  ignoreHTTPSErrors?: boolean;
  defaultViewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  executablePath?: string;
  pipe?: boolean;
  env?: Record<string, string | undefined>;
  dumpio?: boolean;
  userDataDir?: string;
  product?: 'chrome' | 'firefox';
  extraPrefsFirefox?: Record<string, any>;
}

export interface PageOptions {
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
  };
}

export interface NavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  waitForSelector?: string;
}

export interface ServiceStatus {
  isInitialized: boolean;
  activePages: number;
  maxPages: number;
  browserConnected: boolean;
  memoryUsage?: NodeJS.MemoryUsage;
  uptime?: number;
}

export interface HeadlessChromeConfig {
  maxPages: number;
  launchOptions: LaunchOptions;
  pageOptions: PageOptions;
  navigationOptions: NavigationOptions;
  screenshotOptions: ScreenshotOptions;
  pdfOptions: PDFOptions;
}

export interface ErrorInfo {
  code: string;
  message: string;
  stack?: string;
  timestamp: string;
  context?: Record<string, any>;
}

export class HeadlessChromeError extends Error {
  code: string;
  context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'HeadlessChromeError';
    this.code = code;
    this.context = context;
  }
}

// Event types
export interface HeadlessChromeEvents {
  'browserDisconnected': () => void;
  'pageCreated': (pageId: string) => void;
  'pageClosed': (pageId: string) => void;
  'navigationStarted': (pageId: string, url: string) => void;
  'navigationCompleted': (pageId: string, url: string) => void;
  'error': (error: HeadlessChromeError) => void;
}

// API Response types
export interface HeadlessChromeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PageInfo {
  id: string;
  url?: string;
  title?: string;
  status: 'created' | 'navigating' | 'loaded' | 'closed';
  createdAt: string;
  lastActivity: string;
}

export interface BrowserInfo {
  version: string;
  userAgent: string;
  platform: string;
  isConnected: boolean;
  pages: PageInfo[];
}

export interface PerformanceReport {
  url: string;
  timestamp: string;
  metrics: PerformanceMetrics;
  recommendations: string[];
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface AccessibilityReport {
  url: string;
  timestamp: string;
  score: number;
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  selector?: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
}

export interface SEOReport {
  url: string;
  timestamp: string;
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface SecurityReport {
  url: string;
  timestamp: string;
  score: number;
  issues: SecurityIssue[];
  recommendations: string[];
}

export interface SecurityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cwe?: string;
  owasp?: string;
}

export interface ComprehensiveReport {
  url: string;
  timestamp: string;
  performance: PerformanceReport;
  accessibility: AccessibilityReport;
  seo: SEOReport;
  security: SecurityReport;
  overallScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Utility types
export type HeadlessChromeEventType = keyof HeadlessChromeEvents;
export type PageStatus = 'created' | 'navigating' | 'loaded' | 'closed';
export type BrowserStatus = 'initializing' | 'ready' | 'error' | 'closed';
export type ReportType = 'performance' | 'accessibility' | 'seo' | 'security' | 'comprehensive';