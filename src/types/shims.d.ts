// Lightweight developer shims to reduce TypeScript noise for missing types.
// Keep these minimal and stable — they intentionally use `any` to unblock
// incremental type improvements across the codebase.

// Wildcard type modules used by internal code generators / imports
declare module '*CrawlerTypes' {
  export type CrawlResult = any;
  export type CrawlOptions = any;
  export type WebsiteData = any;
  export type OptimizationOpportunity = any;
  export type CrawlError = Error & { code?: string; url?: string; retryable?: boolean };
}

declare module '*OptimizationTypes' {
  export type OptimizationResult = any;
  export type OptimizationOptions = any;
  export type OptimizationRule = any;
  export type OptimizationError = Error & { code?: string; url?: string; ruleId?: string };
}

declare module '*SSOTypes' {
  export type SSOConfiguration = any;
  export type SSOUser = any;
  export type SSOResult = any;
}

declare module '*HeadlessTypes' {
  export type HeadlessChromeError = Error & { code?: string; context?: any };
}

// Common external modules without bundled types in the repo
declare module 'stripe' {
  const Stripe: any;
  export default Stripe;
}

declare module 'redis' {
  const Redis: any;
  export = Redis;
}

declare module 'ioredis' {
  const IORedis: any;
  export default IORedis;
}

declare module 'puppeteer' {
  const puppeteer: any;
  export default puppeteer;
}

declare module 'electron' {
  // Provide a minimal Electron namespace to satisfy type references in the codebase
  export as namespace Electron;
  export default any;
}

declare module 'queue' {
  const Queue: any;
  export default Queue;
}

// Wildcard fallback for any unresolved *Types imports
declare module '*Types' {
  const _: any;
  export default _;
}

// Platform/global augmentations (keep minimal)
declare global {
  interface ServiceWorkerRegistration {
    sync?: { register(tag: string): Promise<void> };
  }

  interface NotificationOptions {
    vibrate?: number[] | number;
    actions?: Array<any>;
    requireInteraction?: boolean;
  }

  interface PasswordCredential {
    id?: string;
    password?: string;
  }

  interface PWAInstallPrompt {
    prompt: () => void;
    userChoice: Promise<{ outcome: string }>;
  }

  interface PublicKeyCredentialUserEntity {
    icon?: string;
  }

  interface Window {
    process?: any;
  }

  type OTPCredential = any;
}

export {};
