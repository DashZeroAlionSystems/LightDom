declare global {
  interface PerformanceObserverInit {
    // Temporary triage field used by a few PerformanceObserver.observe calls in the repo
    durationThreshold?: number;
  }
}

export {};
