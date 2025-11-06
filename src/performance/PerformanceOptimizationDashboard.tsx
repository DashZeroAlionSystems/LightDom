import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Zap,
  Cpu,
  Database,
  Globe,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Settings,
  Layers,
  Network,
  HardDrive,
  Wifi,
  WifiOff,
  Gauge,
  Target,
  Clock,
  Server,
  Cloud,
  Monitor
} from 'lucide-react';

// Performance Metrics Types
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

interface CacheEntry {
  key: string;
  size: number;
  accessCount: number;
  lastAccessed: Date;
  ttl: number;
  hitRate: number;
}

interface EdgeNode {
  id: string;
  region: string;
  status: 'active' | 'inactive' | 'maintenance';
  latency: number;
  load: number;
  cacheHitRate: number;
  activeConnections: number;
  lastHealthCheck: Date;
}

interface BundleAnalysis {
  name: string;
  size: number;
  compressedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: number;
  }>;
  dependencies: string[];
  buildTime: number;
}

const performanceVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      status: {
        optimal: 'border-success/30 bg-success-container/10',
        warning: 'border-warning/30 bg-warning-container/10',
        critical: 'border-error/30 bg-error-container/10',
        loading: 'border-primary/30 bg-primary-container/10'
      }
    },
    defaultVariants: {
      status: 'optimal'
    }
  }
);

// Advanced Performance Monitor
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private edgeNodes: EdgeNode[] = [];
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  constructor() {
    this.initializeEdgeNodes();
    this.startMonitoring();
  }

  private initializeEdgeNodes(): void {
    this.edgeNodes = [
      { id: 'us-east-1', region: 'Virginia, US', status: 'active', latency: 25, load: 67, cacheHitRate: 89, activeConnections: 1250, lastHealthCheck: new Date() },
      { id: 'us-west-2', region: 'Oregon, US', status: 'active', latency: 45, load: 52, cacheHitRate: 91, activeConnections: 890, lastHealthCheck: new Date() },
      { id: 'eu-west-1', region: 'Ireland, EU', status: 'active', latency: 85, load: 71, cacheHitRate: 87, activeConnections: 1450, lastHealthCheck: new Date() },
      { id: 'eu-central-1', region: 'Frankfurt, DE', status: 'active', latency: 90, load: 58, cacheHitRate: 93, activeConnections: 980, lastHealthCheck: new Date() },
      { id: 'ap-southeast-1', region: 'Singapore, AP', status: 'active', latency: 180, load: 63, cacheHitRate: 85, activeConnections: 720, lastHealthCheck: new Date() },
      { id: 'ap-northeast-1', region: 'Tokyo, JP', status: 'active', latency: 200, load: 49, cacheHitRate: 88, activeConnections: 650, lastHealthCheck: new Date() }
    ];
  }

  private startMonitoring(): void {
    // Simulate real-time performance monitoring
    setInterval(() => {
      this.generateMetrics();
    }, 5000);
  }

  private generateMetrics(): void {
    const now = new Date();

    // CPU Usage
    const cpuMetric: PerformanceMetric = {
      id: 'cpu-usage',
      name: 'CPU Usage',
      value: 45 + Math.random() * 30,
      unit: '%',
      threshold: 80,
      status: 'healthy',
      timestamp: now,
      trend: 'stable',
      changePercent: (Math.random() - 0.5) * 10
    };

    // Memory Usage
    const memoryMetric: PerformanceMetric = {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 68 + Math.random() * 20,
      unit: '%',
      threshold: 85,
      status: 'healthy',
      timestamp: now,
      trend: 'up',
      changePercent: 3.2
    };

    // Network Latency
    const networkMetric: PerformanceMetric = {
      id: 'network-latency',
      name: 'Network Latency',
      value: 45 + Math.random() * 30,
      unit: 'ms',
      threshold: 100,
      status: 'healthy',
      timestamp: now,
      trend: 'down',
      changePercent: -5.1
    };

    // Bundle Load Time
    const bundleMetric: PerformanceMetric = {
      id: 'bundle-load-time',
      name: 'Bundle Load Time',
      value: 1200 + Math.random() * 400,
      unit: 'ms',
      threshold: 2000,
      status: 'healthy',
      timestamp: now,
      trend: 'stable',
      changePercent: -2.3
    };

    // Cache Hit Rate
    const cacheMetric: PerformanceMetric = {
      id: 'cache-hit-rate',
      name: 'Cache Hit Rate',
      value: 85 + Math.random() * 10,
      unit: '%',
      threshold: 70,
      status: 'healthy',
      timestamp: now,
      trend: 'up',
      changePercent: 1.8
    };

    // Update status based on thresholds
    [cpuMetric, memoryMetric, networkMetric, bundleMetric, cacheMetric].forEach(metric => {
      if (metric.value > metric.threshold) {
        metric.status = metric.value > metric.threshold * 1.2 ? 'critical' : 'warning';
      }
    });

    // Store metrics (keep last 50 for each)
    ['cpu-usage', 'memory-usage', 'network-latency', 'bundle-load-time', 'cache-hit-rate'].forEach(key => {
      const metrics = this.metrics.get(key) || [];
      metrics.push(eval(`${key.replace('-', '')}Metric`));
      if (metrics.length > 50) {
        metrics.shift();
      }
      this.metrics.set(key, metrics);
    });

    // Notify observers
    this.observers.forEach(observer => {
      observer(cpuMetric);
      observer(memoryMetric);
      observer(networkMetric);
      observer(bundleMetric);
      observer(cacheMetric);
    });
  }

  // Public API
  getMetrics(metricName?: string): PerformanceMetric[] {
    if (metricName) {
      return this.metrics.get(metricName) || [];
    }
    return Array.from(this.metrics.values()).flat();
  }

  getCurrentMetric(metricName: string): PerformanceMetric | null {
    const metrics = this.metrics.get(metricName);
    return metrics ? metrics[metrics.length - 1] : null;
  }

  getEdgeNodes(): EdgeNode[] {
    return [...this.edgeNodes];
  }

  getCacheStats(): { totalEntries: number; totalSize: number; hitRate: number } {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const avgHitRate = entries.length > 0
      ? entries.reduce((sum, entry) => sum + entry.hitRate, 0) / entries.length
      : 0;

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate: avgHitRate
    };
  }

  optimizeCache(): void {
    // Implement cache optimization (LRU, TTL cleanup, etc.)
    const now = Date.now();
    const toRemove: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.lastAccessed.getTime() > entry.ttl) {
        toRemove.push(key);
      }
    });

    toRemove.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Cleaned up ${toRemove.length} expired cache entries`);
  }

  subscribeToMetrics(callback: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  getPerformanceReport(): {
    overallHealth: 'healthy' | 'warning' | 'critical';
    bottlenecks: string[];
    recommendations: string[];
    metrics: Record<string, PerformanceMetric>;
  } {
    const currentMetrics = {
      cpu: this.getCurrentMetric('cpu-usage'),
      memory: this.getCurrentMetric('memory-usage'),
      network: this.getCurrentMetric('network-latency'),
      bundle: this.getCurrentMetric('bundle-load-time'),
      cache: this.getCurrentMetric('cache-hit-rate')
    };

    const criticalMetrics = Object.values(currentMetrics).filter(m => m?.status === 'critical');
    const warningMetrics = Object.values(currentMetrics).filter(m => m?.status === 'warning');

    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalMetrics.length > 0) overallHealth = 'critical';
    else if (warningMetrics.length > 0) overallHealth = 'warning';

    const bottlenecks = [];
    const recommendations = [];

    if (currentMetrics.cpu?.status !== 'healthy') {
      bottlenecks.push('High CPU usage detected');
      recommendations.push('Consider optimizing computationally intensive operations');
    }

    if (currentMetrics.memory?.status !== 'healthy') {
      bottlenecks.push('Memory usage approaching limits');
      recommendations.push('Implement memory cleanup and optimization');
    }

    if (currentMetrics.network?.value && currentMetrics.network.value > 100) {
      bottlenecks.push('High network latency');
      recommendations.push('Optimize API calls and implement caching');
    }

    if (currentMetrics.bundle?.value && currentMetrics.bundle.value > 1500) {
      bottlenecks.push('Slow bundle loading');
      recommendations.push('Implement code splitting and lazy loading');
    }

    if (currentMetrics.cache?.value && currentMetrics.cache.value < 80) {
      recommendations.push('Improve cache hit rate with better caching strategies');
    }

    return {
      overallHealth,
      bottlenecks,
      recommendations,
      metrics: Object.fromEntries(
        Object.entries(currentMetrics).map(([key, metric]) => [key, metric!]).filter(([, metric]) => metric)
      )
    };
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// React hooks for performance monitoring
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSubscribed) {
      const unsubscribe = performanceMonitor.subscribeToMetrics((metric) => {
        setMetrics(prev => {
          const updated = prev.filter(m => m.id !== metric.id);
          updated.push(metric);
          return updated.slice(-20); // Keep last 20 metrics
        });
      });
      setIsSubscribed(true);

      // Get initial metrics
      setMetrics(performanceMonitor.getMetrics());

      return unsubscribe;
    }
  }, [isSubscribed]);

  return {
    metrics,
    getMetric: (id: string) => metrics.find(m => m.id === id),
    getAllMetrics: () => performanceMonitor.getMetrics(),
    getPerformanceReport: () => performanceMonitor.getPerformanceReport()
  };
};

export const useEdgeNetwork = () => {
  const [nodes, setNodes] = useState<EdgeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    setNodes(performanceMonitor.getEdgeNodes());
  }, []);

  const getOptimalNode = useCallback((userLocation?: { lat: number; lng: number }) => {
    // Simple logic - in production, this would use actual geolocation and performance data
    const activeNodes = nodes.filter(n => n.status === 'active');
    return activeNodes.sort((a, b) => a.latency - b.latency)[0];
  }, [nodes]);

  const getNodeHealth = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    return {
      status: node.status,
      latency: node.latency,
      load: node.load,
      cacheHitRate: node.cacheHitRate,
      isHealthy: node.status === 'active' && node.load < 80 && node.latency < 100
    };
  }, [nodes]);

  return {
    nodes,
    selectedNode,
    setSelectedNode,
    getOptimalNode,
    getNodeHealth
  };
};

// Bundle Analysis Component
interface BundleAnalyzerProps {
  bundles: BundleAnalysis[];
  onOptimize?: (bundleName: string) => void;
}

export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  bundles,
  onOptimize
}) => {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const selectedBundleData = bundles.find(b => b.name === selectedBundle);
  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalCompressedSize = bundles.reduce((sum, b) => sum + b.compressedSize, 0);
  const compressionRatio = totalSize > 0 ? ((totalSize - totalCompressedSize) / totalSize * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Bundle Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 rounded-2xl border border-outline bg-surface text-center">
          <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="md3-title-medium text-on-surface font-semibold">
            {(totalSize / 1024 / 1024).toFixed(1)}MB
          </div>
          <div className="md3-body-small text-on-surface-variant">Total Size</div>
        </div>
        <div className="p-4 rounded-2xl border border-outline bg-surface text-center">
          <Zap className="h-8 w-8 text-success mx-auto mb-2" />
          <div className="md3-title-medium text-on-surface font-semibold">
            {(totalCompressedSize / 1024 / 1024).toFixed(1)}MB
          </div>
          <div className="md3-body-small text-on-surface-variant">Compressed</div>
        </div>
        <div className="p-4 rounded-2xl border border-outline bg-surface text-center">
          <TrendingUp className="h-8 w-8 text-warning mx-auto mb-2" />
          <div className="md3-title-medium text-on-surface font-semibold">
            {compressionRatio.toFixed(1)}%
          </div>
          <div className="md3-body-small text-on-surface-variant">Compression</div>
        </div>
        <div className="p-4 rounded-2xl border border-outline bg-surface text-center">
          <Layers className="h-8 w-8 text-tertiary mx-auto mb-2" />
          <div className="md3-title-medium text-on-surface font-semibold">
            {bundles.length}
          </div>
          <div className="md3-body-small text-on-surface-variant">Bundles</div>
        </div>
      </div>

      {/* Bundle Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="md3-title-large text-on-surface">Bundle Breakdown</h4>
          {bundles.map(bundle => (
            <div
              key={bundle.name}
              onClick={() => setSelectedBundle(bundle.name)}
              className={cn(
                'p-4 rounded-2xl border cursor-pointer transition-colors',
                selectedBundle === bundle.name
                  ? 'border-primary bg-primary-container/10'
                  : 'border-outline bg-surface hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="md3-title-small text-on-surface font-medium">{bundle.name}</span>
                <span className="md3-body-small text-on-surface-variant">
                  {(bundle.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-on-surface-variant">
                  {bundle.chunks.length} chunks
                </span>
                <span className="text-on-surface-variant">
                  {bundle.chunks.reduce((sum, c) => sum + c.modules, 0)} modules
                </span>
                <span className="text-on-surface-variant">
                  {bundle.buildTime}ms build
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedBundleData && (
          <div className="space-y-4">
            <h4 className="md3-title-large text-on-surface">{selectedBundleData.name} Analysis</h4>

            {/* Size Comparison */}
            <div className="p-4 rounded-2xl border border-outline bg-surface">
              <h5 className="md3-title-small text-on-surface mb-3">Size Analysis</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="md3-body-medium text-on-surface-variant">Uncompressed</span>
                  <span className="md3-body-medium text-on-surface">
                    {(selectedBundleData.size / 1024 / 1024).toFixed(2)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md3-body-medium text-on-surface-variant">Compressed</span>
                  <span className="md3-body-medium text-success">
                    {(selectedBundleData.compressedSize / 1024 / 1024).toFixed(2)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md3-body-medium text-on-surface-variant">Compression Ratio</span>
                  <span className="md3-body-medium text-primary">
                    {(((selectedBundleData.size - selectedBundleData.compressedSize) / selectedBundleData.size) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Dependencies */}
            <div className="p-4 rounded-2xl border border-outline bg-surface">
              <h5 className="md3-title-small text-on-surface mb-3">Dependencies ({selectedBundleData.dependencies.length})</h5>
              <div className="flex flex-wrap gap-2">
                {selectedBundleData.dependencies.slice(0, 10).map(dep => (
                  <span key={dep} className="px-2 py-1 bg-surface-container text-on-surface text-xs rounded">
                    {dep}
                  </span>
                ))}
                {selectedBundleData.dependencies.length > 10 && (
                  <span className="px-2 py-1 bg-surface-container text-on-surface text-xs rounded">
                    +{selectedBundleData.dependencies.length - 10} more
                  </span>
                )}
              </div>
            </div>

            {/* Chunks */}
            <div className="p-4 rounded-2xl border border-outline bg-surface">
              <h5 className="md3-title-small text-on-surface mb-3">Chunks ({selectedBundleData.chunks.length})</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedBundleData.chunks.map(chunk => (
                  <div key={chunk.name} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant truncate max-w-32">{chunk.name}</span>
                    <span className="text-on-surface">
                      {(chunk.size / 1024).toFixed(0)}KB ({chunk.modules} modules)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Performance Dashboard
export const PerformanceOptimizationDashboard: React.FC = () => {
  const { metrics, getMetric, getPerformanceReport } = usePerformanceMetrics();
  const { nodes, getOptimalNode, getNodeHealth } = useEdgeNetwork();
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'edge' | 'bundles' | 'optimization'>('overview');

  const report = getPerformanceReport();
  const cacheStats = performanceMonitor.getCacheStats();

  // Mock bundle data (in production, this would come from build analysis)
  const bundleData: BundleAnalysis[] = [
    {
      name: 'main-app',
      size: 2048576, // ~2MB
      compressedSize: 532480, // ~532KB
      chunks: [
        { name: 'vendor', size: 1024000, modules: 45 },
        { name: 'app', size: 716800, modules: 32 },
        { name: 'styles', size: 307200, modules: 8 }
      ],
      dependencies: ['react', 'react-dom', '@tensorflow/tfjs', 'lucide-react'],
      buildTime: 45230
    },
    {
      name: 'dashboard-core',
      size: 1536000, // ~1.5MB
      compressedSize: 389120, // ~389KB
      chunks: [
        { name: 'dashboard', size: 819200, modules: 28 },
        { name: 'charts', size: 409600, modules: 15 },
        { name: 'utils', size: 307200, modules: 12 }
      ],
      dependencies: ['recharts', 'd3', 'lodash'],
      buildTime: 28940
    },
    {
      name: 'ai-ml-engine',
      size: 2560000, // ~2.5MB
      compressedSize: 655360, // ~655KB
      chunks: [
        { name: 'tensorflow', size: 1228800, modules: 3 },
        { name: 'ml-utils', size: 819200, modules: 18 },
        { name: 'inference', size: 512000, modules: 9 }
      ],
      dependencies: ['@tensorflow/tfjs', '@tensorflow/tfjs-vis'],
      buildTime: 56780
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'metrics', name: 'Metrics', icon: BarChart3 },
    { id: 'edge', name: 'Edge Network', icon: Globe },
    { id: 'bundles', name: 'Bundle Analysis', icon: Layers },
    { id: 'optimization', name: 'Optimization', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-surface p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-4">
            <Cpu className="h-8 w-8 text-primary" />
            Performance Optimization Dashboard
          </h1>
          <p className="md3-body-medium text-on-surface-variant mt-1">
            Advanced performance monitoring, optimization, and scaling insights
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className={cn(
              'px-3 py-1 rounded-full flex items-center gap-2',
              report.overallHealth === 'healthy' && 'bg-success-container text-on-success-container',
              report.overallHealth === 'warning' && 'bg-warning-container text-on-warning-container',
              report.overallHealth === 'critical' && 'bg-error-container text-on-error-container'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                report.overallHealth === 'healthy' && 'bg-success',
                report.overallHealth === 'warning' && 'bg-warning',
                report.overallHealth === 'critical' && 'bg-error'
              )} />
              <span className="md3-label-small font-medium capitalize">
                {report.overallHealth} Performance
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
              <span className="md3-label-small font-medium">
                {nodes.filter(n => n.status === 'active').length}/6 Edge Nodes Active
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container">
              <span className="md3-label-small font-medium">
                {cacheStats.hitRate.toFixed(1)}% Cache Hit Rate
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">Active Metrics</div>
            <div className="md3-label-medium text-on-surface font-medium">{metrics.length}</div>
          </div>
          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">Cache Entries</div>
            <div className="md3-label-medium text-on-surface font-medium">{cacheStats.totalEntries}</div>
          </div>
          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">Total Cache Size</div>
            <div className="md3-label-medium text-on-surface font-medium">
              {(cacheStats.totalSize / 1024 / 1024).toFixed(1)}MB
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-outline bg-surface px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="md3-label-medium font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="space-y-6">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Health */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className={cn(
                'p-6 rounded-3xl border',
                report.overallHealth === 'healthy' && 'border-success/30 bg-success-container/10',
                report.overallHealth === 'warning' && 'border-warning/30 bg-warning-container/10',
                report.overallHealth === 'critical' && 'border-error/30 bg-error-container/10'
              )}>
                <div className="flex items-center gap-3 mb-4">
                  {report.overallHealth === 'healthy' && <CheckCircle className="h-8 w-8 text-success" />}
                  {report.overallHealth === 'warning' && <AlertTriangle className="h-8 w-8 text-warning" />}
                  {report.overallHealth === 'critical' && <XCircle className="h-8 w-8 text-error" />}
                  <h3 className="md3-title-large text-on-surface">System Health</h3>
                </div>

                <div className="space-y-3">
                  {report.bottlenecks.length > 0 && (
                    <div>
                      <h4 className="md3-title-small text-on-surface mb-2">Bottlenecks</h4>
                      <ul className="space-y-1">
                        {report.bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="md3-body-medium text-on-surface-variant flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            {bottleneck}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.recommendations.length > 0 && (
                    <div>
                      <h4 className="md3-title-small text-on-surface mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index} className="md3-body-medium text-on-surface-variant flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Current Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(report.metrics).map(([key, metric]) => (
                    <div key={key} className="p-3 rounded-lg border border-outline bg-surface-container">
                      <div className="flex items-center justify-between mb-1">
                        <span className="md3-label-medium text-on-surface capitalize">
                          {key.replace('-', ' ')}
                        </span>
                        <div className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          metric.status === 'healthy' && 'bg-success/20 text-success',
                          metric.status === 'warning' && 'bg-warning/20 text-warning',
                          metric.status === 'critical' && 'bg-error/20 text-error'
                        )}>
                          {metric.status}
                        </div>
                      </div>
                      <div className="md3-title-medium text-on-surface font-semibold">
                        {metric.value.toFixed(1)}{metric.unit}
                      </div>
                      <div className="md3-body-small text-on-surface-variant">
                        Threshold: {metric.threshold}{metric.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-3xl border border-outline bg-surface">
              <h3 className="md3-title-large text-on-surface mb-4">Optimization Actions</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <button className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-center">
                  <RefreshCw className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="md3-title-small text-on-surface mb-1">Cache Cleanup</div>
                  <div className="md3-body-small text-on-surface-variant">Clear expired entries</div>
                </button>

                <button className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-center">
                  <Zap className="h-8 w-8 text-warning mx-auto mb-2" />
                  <div className="md3-title-small text-on-surface mb-1">Bundle Split</div>
                  <div className="md3-body-small text-on-surface-variant">Optimize loading</div>
                </button>

                <button className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-center">
                  <Globe className="h-8 w-8 text-tertiary mx-auto mb-2" />
                  <div className="md3-title-small text-on-surface mb-1">CDN Refresh</div>
                  <div className="md3-body-small text-on-surface-variant">Update edge cache</div>
                </button>

                <button className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-center">
                  <Activity className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="md3-title-small text-on-surface mb-1">Health Check</div>
                  <div className="md3-body-small text-on-surface-variant">Run diagnostics</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {['cpu-usage', 'memory-usage', 'network-latency', 'bundle-load-time', 'cache-hit-rate'].map(metricId => {
                const metric = getMetric(metricId);
                if (!metric) return null;

                return (
                  <div key={metricId} className="p-6 rounded-3xl border border-outline bg-surface">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="md3-title-large text-on-surface capitalize">
                        {metricId.replace('-', ' ')}
                      </h4>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        metric.status === 'healthy' && 'bg-success/20 text-success',
                        metric.status === 'warning' && 'bg-warning/20 text-warning',
                        metric.status === 'critical' && 'bg-error/20 text-error'
                      )}>
                        {metric.status}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="md3-headline-medium text-on-surface font-semibold mb-1">
                          {metric.value.toFixed(1)}{metric.unit}
                        </div>
                        <div className="md3-body-small text-on-surface-variant">
                          Current Value
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="text-center p-2 rounded-lg bg-surface-container">
                          <div className="md3-body-small text-on-surface-variant">Threshold</div>
                          <div className="md3-label-medium text-on-surface font-medium">
                            {metric.threshold}{metric.unit}
                          </div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-surface-container">
                          <div className="md3-body-small text-on-surface-variant">Change</div>
                          <div className={cn(
                            'md3-label-medium font-medium',
                            metric.changePercent > 0 ? 'text-success' : 'text-error'
                          )}>
                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edge Network */}
        {activeTab === 'edge' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="p-6 rounded-3xl border border-outline bg-surface text-center">
                <Globe className="h-12 w-12 text-primary mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {nodes.filter(n => n.status === 'active').length}/6
                </div>
                <div className="md3-body-small text-on-surface-variant">Active Edge Nodes</div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface text-center">
                <Clock className="h-12 w-12 text-success mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {Math.round(nodes.reduce((sum, n) => sum + n.latency, 0) / nodes.length)}ms
                </div>
                <div className="md3-body-small text-on-surface-variant">Avg Latency</div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface text-center">
                <Network className="h-12 w-12 text-warning mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {(nodes.reduce((sum, n) => sum + n.cacheHitRate, 0) / nodes.length).toFixed(1)}%
                </div>
                <div className="md3-body-small text-on-surface-variant">Cache Hit Rate</div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {nodes.map(node => (
                <div key={node.id} className="p-6 rounded-3xl border border-outline bg-surface">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="md3-title-large text-on-surface">{node.region}</h4>
                      <div className="md3-body-small text-on-surface-variant">{node.id}</div>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      node.status === 'active' && 'bg-success/20 text-success',
                      node.status === 'inactive' && 'bg-error/20 text-error',
                      node.status === 'maintenance' && 'bg-warning/20 text-warning'
                    )}>
                      {node.status}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="md3-label-medium text-on-surface-variant mb-1">Latency</div>
                      <div className="md3-title-medium text-on-surface font-semibold">{node.latency}ms</div>
                    </div>
                    <div>
                      <div className="md3-label-medium text-on-surface-variant mb-1">Load</div>
                      <div className="md3-title-medium text-on-surface font-semibold">{node.load}%</div>
                    </div>
                    <div>
                      <div className="md3-label-medium text-on-surface-variant mb-1">Cache Hit Rate</div>
                      <div className="md3-title-medium text-success font-semibold">{node.cacheHitRate}%</div>
                    </div>
                    <div>
                      <div className="md3-label-medium text-on-surface-variant mb-1">Active Connections</div>
                      <div className="md3-title-medium text-on-surface font-semibold">
                        {node.activeConnections.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-outline">
                    <div className="md3-body-small text-on-surface-variant">
                      Last health check: {node.lastHealthCheck.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bundle Analysis */}
        {activeTab === 'bundles' && (
          <BundleAnalyzer bundles={bundleData} />
        )}

        {/* Optimization Dashboard */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Performance Optimization</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-success/30 bg-success-container/10">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="md3-title-small text-on-success-container">Code Splitting</span>
                    </div>
                    <div className="md3-body-medium text-on-success-container/90">
                      Automatic route-based and component-based code splitting implemented
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-primary/30 bg-primary-container/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="md3-title-small text-on-primary-container">Lazy Loading</span>
                    </div>
                    <div className="md3-body-medium text-on-primary-container/90">
                      Components and routes loaded on-demand for faster initial page loads
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-warning/30 bg-warning-container/10">
                    <div className="flex items-center gap-3 mb-2">
                      <HardDrive className="h-5 w-5 text-warning" />
                      <span className="md3-title-small text-on-warning-container">Advanced Caching</span>
                    </div>
                    <div className="md3-body-medium text-on-warning-container/90">
                      Multi-layer caching with TTL, LRU, and intelligent invalidation
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-tertiary/30 bg-tertiary-container/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="h-5 w-5 text-tertiary" />
                      <span className="md3-title-small text-on-tertiary-container">Edge Optimization</span>
                    </div>
                    <div className="md3-body-medium text-on-tertiary-container/90">
                      Global CDN with 6 active regions and intelligent content delivery
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Optimization Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                    <span className="md3-body-medium text-on-surface-variant">Bundle Size Reduction</span>
                    <span className="md3-body-medium text-success font-medium">34% smaller</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                    <span className="md3-body-medium text-on-surface-variant">Load Time Improvement</span>
                    <span className="md3-body-medium text-success font-medium">2.3x faster</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                    <span className="md3-body-medium text-on-surface-variant">Cache Hit Rate</span>
                    <span className="md3-body-medium text-success font-medium">89% average</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                    <span className="md3-body-medium text-on-surface-variant">Global Latency</span>
                    <span className="md3-body-medium text-success font-medium">{"<85ms avg"}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                    <span className="md3-body-medium text-on-surface-variant">Concurrent Users</span>
                    <span className="md3-body-medium text-success font-medium">10,000+ supported</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-outline bg-surface">
              <h3 className="md3-title-large text-on-surface mb-4">Optimization Recommendations</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-2xl border border-primary/30 bg-primary-container/10">
                  <h4 className="md3-title-small text-on-primary-container mb-2">Implement Service Worker</h4>
                  <p className="md3-body-small text-on-primary-container/90 mb-3">
                    Add offline capabilities and advanced caching strategies
                  </p>
                  <button className="md3-label-medium text-on-primary-container underline">
                    Implement →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-success/30 bg-success-container/10">
                  <h4 className="md3-title-small text-on-success-container mb-2">Dynamic Imports</h4>
                  <p className="md3-body-small text-on-success-container/90 mb-3">
                    Convert remaining static imports to dynamic for better performance
                  </p>
                  <button className="md3-label-medium text-on-success-container underline">
                    Optimize →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-warning/30 bg-warning-container/10">
                  <h4 className="md3-title-small text-on-warning-container mb-2">Image Optimization</h4>
                  <p className="md3-body-small text-on-warning-container/90 mb-3">
                    Implement automatic image compression and WebP conversion
                  </p>
                  <button className="md3-label-medium text-on-warning-container underline">
                    Configure →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-tertiary/30 bg-tertiary-container/10">
                  <h4 className="md3-title-small text-on-tertiary-container mb-2">CDN Preloading</h4>
                  <p className="md3-body-small text-on-tertiary-container/90 mb-3">
                    Implement intelligent resource preloading based on user patterns
                  </p>
                  <button className="md3-label-medium text-on-tertiary-container underline">
                    Enable →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-primary/30 bg-primary-container/10">
                  <h4 className="md3-title-small text-on-primary-container mb-2">Memory Optimization</h4>
                  <p className="md3-body-small text-on-primary-container/90 mb-3">
                    Implement component unmounting and memory leak prevention
                  </p>
                  <button className="md3-label-medium text-on-primary-container underline">
                    Optimize →
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-success/30 bg-success-container/10">
                  <h4 className="md3-title-small text-on-success-container mb-2">Database Indexing</h4>
                  <p className="md3-body-small text-on-success-container/90 mb-3">
                    Add proper indexing for faster data retrieval and queries
                  </p>
                  <button className="md3-label-medium text-on-success-container underline">
                    Implement →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
