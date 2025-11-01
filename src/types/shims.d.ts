// Auto-generated developer shims to reduce TypeScript noise for missing types
// These are intentionally permissive (any) to unblock incremental type fixes.

// Match imports that end with these filenames (relative or absolute)
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

// Global augmentations for DOM / platform apis used in the project
declare global {
  // Auto-generated developer shims to reduce TypeScript noise for missing types
  // These are intentionally permissive (any) to unblock incremental type fixes.

  // Match imports that end with these filenames (relative or absolute)
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
    const _default: any;
    export default _default;
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

  // Global augmentations for DOM / platform apis used in the project
  declare global {
    interface ServiceWorkerRegistration {
      // Auto-generated developer shims to reduce TypeScript noise for missing types
      // These are intentionally permissive (any) to unblock incremental type fixes.

      // Match imports that end with these filenames (relative or absolute)
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
        const _default: any;
        export default _default;
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

      // Global augmentations for DOM / platform apis used in the project
      declare global {
        interface ServiceWorkerRegistration {
          // Background sync APIs may be polyfilled in some environments
          sync?: { register(tag: string): Promise<void> };
        }

        interface NotificationOptions {
          vibrate?: number[] | number;
          actions?: Array<any>;
          requireInteraction?: boolean;
        }

        interface PublicKeyCredentialUserEntity {
          icon?: string;
        }
// Auto-generated lightweight shims for third-party modules and platform types.
// Keep this file minimal and stable — it exists to reduce noisy type errors
// while the real type definitions are added incrementally.

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
  export as namespace Electron;
  const _default: any;
  export default _default;
}

declare module 'queue' {
  const Queue: any;
  export default Queue;
}

declare module '*CrawlerTypes' {
  export type CrawlResult = any;
  export type CrawlOptions = any;
  export type WebsiteData = any;
  export type CrawlError = any;
}

declare module '*OptimizationTypes' {
  export type OptimizationResult = any;
  export type OptimizationOptions = any;
}

declare module '*SSOTypes' {
  export type SSOAny = any;
  export default SSOAny;
}

// Platform/global shims
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
// Auto-generated lightweight shims for third-party modules and platform types.
// Keep this file minimal and stable — it exists to reduce noisy type errors
// while the real type definitions are added incrementally.

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
  export as namespace Electron;
  const _default: any;
  export default _default;
}

declare module 'queue' {
  const Queue: any;
  export default Queue;
}

declare module '*CrawlerTypes' {
  export type CrawlResult = any;
  export type CrawlOptions = any;
  export type WebsiteData = any;
  export type CrawlError = any;
}

declare module '*OptimizationTypes' {
  export type OptimizationResult = any;
  export type OptimizationOptions = any;
}

declare module '*SSOTypes' {
  export type SSOAny = any;
  export default SSOAny;
}

// Platform/global shims
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
