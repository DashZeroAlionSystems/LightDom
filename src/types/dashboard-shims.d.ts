// Temporary dashboard shims to reduce TypeScript noise while triaging
// These should be replaced with precise interfaces matching real props.

declare module '*/AdvancedDashboard' {
  export interface DashboardWidget {
    id?: string;
    title?: string;
    type?: string;
    props?: any;
  }

  export interface DashboardConfig {
    widgets?: DashboardWidget[];
    layout?: any;
    theme?: any;
  }

  const config: DashboardConfig;
  export default config;
}

// A general shim consumers can import from `src/types/dashboard-shims` for quick typing
declare global {
  interface DashboardConfigShim {
    widgets?: any[];
    layout?: any;
    theme?: any;
  }
}

export {};
