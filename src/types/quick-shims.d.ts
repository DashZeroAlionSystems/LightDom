// Quick, temporary shims to reduce TS noise while triaging

// Stripe - broad namespace with minimal shapes
declare namespace Stripe {
  type Customer = any;
  type PaymentIntent = any;
  type Invoice = any;
  type Subscription = any;
  type UsageRecord = any;
  type Event = any;
  type PaymentMethod = any;
}

declare module 'stripe' {
  const StripeAny: any;
  export default StripeAny;
}

// TFJS node - minimal type placeholders used in the repo
declare module '@tensorflow/tfjs-node' {
  const tf: any;
  export = tf;
}

declare module '@tensorflow/tfjs' {
  const tf: any;
  export = tf;
}

// Global augmentations: Stripe and tf namespaces, browser credential helpers
declare global {
  namespace Stripe {
    type Customer = any;
    type PaymentIntent = any;
    type Invoice = any;
    type Subscription = any;
    type UsageRecord = any;
    type Event = any;
    type PaymentMethod = any;
  }

  namespace tf {
    type LayersModel = any;
    type Tensor2D = any;
    type Tensor = any;
  }

  interface Window {
    performanceMetrics?: any;
  }

  interface CredentialsContainer {
    getAll?: (opts?: any) => Promise<any>;
  }

  var PasswordCredential: {
    new(init?: any): PasswordCredential;
  };

  var OTPCredential: any;
}

// Global credential shims used by browser APIs
interface PasswordCredential {
  id?: string;
  password?: string;
}

declare type OTPCredential = any;

declare global {
  interface Window {
    performanceMetrics?: any;
  }
}

// Placeholder project type modules (replace with real types later)
// Quick, temporary shims to reduce TS noise while triaging

// Stripe - broad namespace with minimal shapes
declare namespace Stripe {
  type Customer = any;
  type PaymentIntent = any;
  type Invoice = any;
  type Subscription = any;
  type UsageRecord = any;
  type Event = any;
  type PaymentMethod = any;
}

declare module 'stripe' {
  const StripeAny: any;
  export default StripeAny;
}

// TFJS node - minimal type placeholders used in the repo
declare module '@tensorflow/tfjs-node' {
  const tf: any;
  export = tf;
}

declare module '@tensorflow/tfjs' {
  const tf: any;
  export = tf;
}

// Global augmentations: Stripe and tf namespaces, browser credential helpers
declare global {
  namespace Stripe {
    type Customer = any;
    type PaymentIntent = any;
    type Invoice = any;
    type Subscription = any;
    type UsageRecord = any;
    type Event = any;
    type PaymentMethod = any;
  }

  namespace tf {
    type LayersModel = any;
    type Tensor2D = any;
    type Tensor = any;
  }

  interface Window {
    performanceMetrics?: any;
  }

  interface CredentialsContainer {
    getAll?: (opts?: any) => Promise<any>;
  }

  var PasswordCredential: {
    new(init?: any): PasswordCredential;
  };

  var OTPCredential: any;
}

// Global credential shims used by browser APIs
interface PasswordCredential {
  id?: string;
  password?: string;
}

declare type OTPCredential = any;

declare global {
  interface Window {
    performanceMetrics?: any;
  }
}

// Placeholder project type modules (replace with real types later)
declare module '../types/CrawlerTypes' {
  export const CrawlResult: any;
  export const CrawlOptions: any;
  export const WebsiteData: any;
  export const OptimizationOpportunity: any;
}

declare module '../types/HeadlessTypes' {
  export type HeadlessChromeError = any;
}

declare module '../types/OptimizationTypes' {
  export type OptimizationError = any;
}

// Broad fallback for other unknown modules
declare module '*-types' { const x: any; export = x; }

export {};
