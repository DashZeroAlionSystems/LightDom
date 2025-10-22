/**
 * TypeScript definitions for Electron API
 * Provides type safety for IPC communication
 */

export interface AppInfo {
  version: string;
  platform: string;
  arch: string;
  electron: string;
  chrome: string;
  node: string;
  isDev: boolean;
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  silent?: boolean;
  urgency?: 'normal' | 'critical' | 'low';
}

export interface CrawlOptions {
  url: string;
  selectors?: Record<string, string>;
  waitFor?: string;
  timeout?: number;
}

export interface CrawlResult {
  success: boolean;
  data?: {
    title?: string;
    url?: string;
    text?: string;
    links?: Array<{ text: string; href: string }>;
    meta?: Record<string, string>;
    domStats?: {
      totalElements: number;
      divs: number;
      scripts: number;
      styles: number;
    };
    [key: string]: any;
  };
  metrics?: {
    JSHeapUsedSize?: number;
    JSHeapTotalSize?: number;
    performance?: {
      loadTime: number;
      domContentLoaded: number;
      responseTime: number;
    };
  };
  timestamp?: string;
  error?: string;
}

export interface ScreenshotOptions {
  url: string;
  fullPage?: boolean;
  timeout?: number;
  path?: string;
}

export interface ScreenshotResult {
  success: boolean;
  screenshot?: string; // base64 encoded
  timestamp?: string;
  error?: string;
}

export interface WorkerTask {
  type: string;
  options: any;
}

export interface WorkerResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface WorkerMessage {
  workerId: number;
  [key: string]: any;
}

export interface ServiceStatus {
  chrome?: 'starting' | 'running' | 'stopped' | 'error';
  crawler?: 'starting' | 'running' | 'stopped' | 'error';
  optimization?: 'starting' | 'running' | 'stopped' | 'error';
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

export interface PlatformInfo {
  platform: string;
  arch: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

export interface ElectronAPI {
  // App info
  app: {
    getInfo: () => Promise<AppInfo>;
  };

  // Window controls
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };

  // Theme
  theme: {
    toggle: () => Promise<boolean>;
  };

  // Notifications
  notification: {
    show: (title: string, body: string, options?: NotificationOptions) => Promise<void>;
  };

  // Worker pool
  worker: {
    execute: (task: WorkerTask) => Promise<WorkerResult>;
  };

  // Puppeteer tasks
  puppeteer: {
    crawl: (options: CrawlOptions) => Promise<CrawlResult>;
    screenshot: (options: ScreenshotOptions) => Promise<ScreenshotResult>;
  };

  // File operations
  file: {
    select: () => Promise<string[]>;
    save: (content: string, filename: string) => Promise<{ success: boolean; path?: string }>;
  };

  // System
  system: {
    openExternal: (url: string) => Promise<void>;
    showInFolder: (path: string) => Promise<void>;
  };

  // Event listeners
  on: {
    backendLog: (callback: (message: string) => void) => () => void;
    backendError: (callback: (message: string) => void) => () => void;
    workerMessage: (callback: (data: WorkerMessage) => void) => () => void;
    serviceStatus: (callback: (status: ServiceStatus) => void) => () => void;
    navigate: (callback: (route: string) => void) => () => void;
    trayAction: (callback: (action: string) => void) => () => void;
    updateProgress: (callback: (progress: UpdateProgress) => void) => () => void;
    showServiceStatus: (callback: () => void) => () => void;
  };

  // Legacy support
  legacy: {
    getAppInfo: () => Promise<any>;
    startCrawling: (options: any) => Promise<any>;
    stopCrawling: () => Promise<any>;
    getCrawlerStats: () => Promise<any>;
  };
}

// Augment the global Window interface
declare global {
  interface Window {
    electron: ElectronAPI;
    platform: PlatformInfo;
  }
}

export {};
