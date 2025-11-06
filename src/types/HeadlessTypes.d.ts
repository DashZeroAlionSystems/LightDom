// Minimal headless/puppeteer related type shims for local usage
export interface HeadlessConfig {
  executablePath?: string;
  headless?: boolean;
}

export interface PerformanceEntryWithExtras extends PerformanceEntry {
  // some code reads .value and .transferSize on entries
  value?: number;
  transferSize?: number;
}

export interface DOMAnalysis {
  title?: string;
  metaTags?: Array<{ name?: string; content?: string; property?: string }>;
  headings?: Array<{ level: number; text: string; id?: string }>;
  images?: Array<{ src: string; alt?: string; width?: number; height?: number }>;
  links?: Array<{ href: string; text: string; rel?: string }>;
  scripts?: Array<{ src?: string; content?: string; async?: boolean; defer?: boolean }>;
  styles?: Array<{ href?: string; content?: string; media?: string }>;
  forms?: Array<{ action?: string; method?: string; inputs: Array<any> }>;
  performanceMetrics?: PerformanceMetrics;
  resourceAnalysis?: ResourceAnalysis;
  totalElements?: number;
  imageAnalysis?: ImageAnalysis;
  scriptAnalysis?: ScriptAnalysis;
  cssAnalysis?: CSSAnalysis;
  analysisTime?: number;
  timestamp?: string;
}

export interface PerformanceMetrics {
  loadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
  speedIndex?: number;
  loadComplete?: number;
}

export interface ImageAnalysis {
  total: number;
  withoutAlt: number;
  oversized: number;
  unoptimized: number;
  lazyLoaded: number;
  webpSupported?: number;
}

export interface ScriptAnalysis {
  total: number;
  external: number;
  inline: number;
  async: number;
  defer: number;
  blocking: number;
}

export interface CSSAnalysis {
  total: number;
  external: number;
  inline: number;
  unused: number;
  renderBlocking: number;
  // criticalCSS may be represented as the number of critical bytes or as a
  // serialized string in different implementations. Accept both during triage.
  criticalCSS?: number | string;
  unusedRules?: number;
}

export interface ResourceAnalysis {
  total: number;
  images: number;
  scripts: number;
  styles: number;
  fonts: number;
  other: number;
  uncompressed: number;
  totalSize?: number;
}

export interface HeadlessChromeError {
  message: string;
  stack?: string;
  code?: string;
  // Allow attaching additional runtime metadata when creating synthetic
  // HeadlessChromeError objects in the ErrorHandler utilities.
  context?: any;
  name?: string;
}

export type HeadlessPage = any;
export type HeadlessBrowser = any;
