// Dev-time module shims to quiet frequent missing-module errors during triage
declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(opts?: any);
  }
  export function useQuery(...args: any[]): any;
  export function useMutation(...args: any[]): any;
  export const QueryClientProvider: any;
  const _default: any;
  export default _default;
}

declare module 'react-error-boundary' {
  export const ErrorBoundary: any;
  export default ErrorBoundary;
}

declare module 'recharts' {
  export const Line: any;
  export const LineChart: any;
  export const BarChart: any;
  export const PieChart: any;
  export const ResponsiveContainer: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  const _default: any;
  export default _default;
}

// Common globals used across the repo (triage-only)
declare global {
  var axios: any;
  var WalletService: any;
  var setError: any;
  var spaceOptimizationEngine: any;
  var blockchainModelStorage: any;
}

export {};
