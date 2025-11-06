// Augment lib.dom types with a few optional fields used by performance traces
declare global {
  interface PerformanceEntry {
    // Some runtime instrumentation libraries expose `.value` on layout-shift
    // entries and `.transferSize` on resource timing entries. Make them
    // optional to avoid TypeScript complaints in instrumentation code.
    value?: number;
    transferSize?: number;
  }

  interface PerformanceResourceTiming {
    transferSize?: number;
  }

  // Loosen Element shape for quick incremental typing fixes. Prefer casting
  // to HTML*Element in production code instead of relying on these fields.
  interface Element {
    src?: string;
    href?: string;
    content?: string;
    async?: boolean;
    defer?: boolean;
    loading?: string;
    alt?: string;
    media?: string;
    type?: string;
  }

  interface PerformanceNavigationTiming {
    navigationStart?: number;
  }
}

export {};
