import React, { useEffect, useState, useCallback } from 'react';

// Edge Computing Configuration
interface EdgeConfig {
  regions: Array<{
    id: string;
    name: string;
    country: string;
    continent: string;
    latency: number;
    status: 'active' | 'inactive' | 'maintenance';
  }>;
  cdn: {
    provider: 'cloudflare' | 'fastly' | 'akamai' | 'vercel';
    regions: string[];
    cacheStrategy: 'aggressive' | 'moderate' | 'conservative';
    ttl: number;
  };
  optimization: {
    imageOptimization: boolean;
    codeSplitting: boolean;
    lazyLoading: boolean;
    compression: 'gzip' | 'brotli';
    prefetching: boolean;
  };
}

const DEFAULT_EDGE_CONFIG: EdgeConfig = {
  regions: [
    { id: 'us-east', name: 'Virginia', country: 'US', continent: 'North America', latency: 25, status: 'active' },
    { id: 'us-west', name: 'California', country: 'US', continent: 'North America', latency: 45, status: 'active' },
    { id: 'eu-west', name: 'Ireland', country: 'IE', continent: 'Europe', latency: 85, status: 'active' },
    { id: 'eu-central', name: 'Frankfurt', country: 'DE', continent: 'Europe', latency: 90, status: 'active' },
    { id: 'ap-southeast', name: 'Singapore', country: 'SG', continent: 'Asia', latency: 180, status: 'active' },
    { id: 'ap-northeast', name: 'Tokyo', country: 'JP', continent: 'Asia', latency: 200, status: 'active' }
  ],
  cdn: {
    provider: 'vercel',
    regions: ['us-east', 'eu-west', 'ap-southeast'],
    cacheStrategy: 'moderate',
    ttl: 3600
  },
  optimization: {
    imageOptimization: true,
    codeSplitting: true,
    lazyLoading: true,
    compression: 'brotli',
    prefetching: true
  }
};

// Edge Computing Service
class EdgeService {
  private config: EdgeConfig;
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(config: Partial<EdgeConfig> = {}) {
    this.config = { ...DEFAULT_EDGE_CONFIG, ...config };
  }

  // Region selection based on user location
  async getOptimalRegion(userLocation?: { lat: number; lng: number }): Promise<string> {
    if (!userLocation) {
      // Use basic geolocation or IP-based detection
      return this.config.regions.find(r => r.status === 'active')?.id || 'us-east';
    }

    // Calculate optimal region based on latency and availability
    const activeRegions = this.config.regions.filter(r => r.status === 'active');
    let optimalRegion = activeRegions[0];

    for (const region of activeRegions) {
      // Simplified distance calculation (in real implementation, use proper geo APIs)
      const regionLatLng = this.getRegionCoordinates(region.id);
      const distance = this.calculateDistance(userLocation, regionLatLng);

      if (distance < this.calculateDistance(userLocation, this.getRegionCoordinates(optimalRegion.id))) {
        optimalRegion = region;
      }
    }

    return optimalRegion.id;
  }

  private getRegionCoordinates(regionId: string): { lat: number; lng: number } {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'us-east': { lat: 37.7749, lng: -79.5 },
      'us-west': { lat: 37.7749, lng: -122.4194 },
      'eu-west': { lat: 53.3498, lng: -6.2603 },
      'eu-central': { lat: 50.1109, lng: 8.6821 },
      'ap-southeast': { lat: 1.3521, lng: 103.8198 },
      'ap-northeast': { lat: 35.6762, lng: 139.6503 }
    };
    return coordinates[regionId] || { lat: 0, lng: 0 };
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Performance monitoring
  recordMetric(regionId: string, metric: 'latency' | 'throughput' | 'errorRate', value: number): void {
    if (!this.performanceMetrics.has(`${regionId}-${metric}`)) {
      this.performanceMetrics.set(`${regionId}-${metric}`, []);
    }

    const metrics = this.performanceMetrics.get(`${regionId}-${metric}`)!;
    metrics.push(value);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.performanceMetrics.set(`${regionId}-${metric}`, metrics);
  }

  getMetrics(regionId: string, metric: 'latency' | 'throughput' | 'errorRate'): {
    average: number;
    min: number;
    max: number;
    latest: number;
  } | null {
    const metrics = this.performanceMetrics.get(`${regionId}-${metric}`);
    if (!metrics || metrics.length === 0) return null;

    return {
      average: metrics.reduce((a, b) => a + b, 0) / metrics.length,
      min: Math.min(...metrics),
      max: Math.max(...metrics),
      latest: metrics[metrics.length - 1]
    };
  }

  // Resource optimization
  async optimizeResource(url: string, type: 'image' | 'script' | 'style'): Promise<string> {
    const cdnUrl = this.getCDNUrl(url);

    switch (type) {
      case 'image':
        return this.optimizeImage(cdnUrl);
      case 'script':
        return this.optimizeScript(cdnUrl);
      case 'style':
        return this.optimizeStylesheet(cdnUrl);
      default:
        return cdnUrl;
    }
  }

  private getCDNUrl(originalUrl: string): string {
    // In a real implementation, this would generate CDN URLs
    switch (this.config.cdn.provider) {
      case 'vercel':
        return `https://cdn.vercel.app${originalUrl}`;
      case 'cloudflare':
        return `https://cdn.cloudflare.com${originalUrl}`;
      case 'fastly':
        return `https://cdn.fastly.com${originalUrl}`;
      case 'akamai':
        return `https://cdn.akamai.com${originalUrl}`;
      default:
        return originalUrl;
    }
  }

  private async optimizeImage(url: string): Promise<string> {
    if (!this.config.optimization.imageOptimization) return url;

    // Add image optimization parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=auto&h=auto&fit=crop&auto=format,compress`;
  }

  private async optimizeScript(url: string): Promise<string> {
    // Scripts are typically handled by build tools
    return url;
  }

  private async optimizeStylesheet(url: string): Promise<string> {
    // Stylesheets are typically handled by build tools
    return url;
  }

  // Cache management
  async prefetchResource(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (!this.config.optimization.prefetching) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;

    if (priority === 'high') {
      link.rel = 'preload';
    }

    document.head.appendChild(link);
  }

  // Real-time optimization
  async getOptimizationRecommendations(): Promise<Array<{
    type: 'performance' | 'reliability' | 'cost';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
  }>> {
    const recommendations = [];

    // Performance recommendations
    const avgLatency = this.config.regions
      .filter(r => r.status === 'active')
      .reduce((sum, r) => sum + r.latency, 0) / this.config.regions.length;

    if (avgLatency > 100) {
      recommendations.push({
        type: 'performance',
        title: 'High Latency Detected',
        description: `Average latency of ${avgLatency}ms exceeds optimal threshold`,
        impact: 'high',
        action: 'Consider adding more edge locations or optimizing content delivery'
      });
    }

    // Reliability recommendations
    const activeRegions = this.config.regions.filter(r => r.status === 'active').length;
    if (activeRegions < 3) {
      recommendations.push({
        type: 'reliability',
        title: 'Limited Geographic Coverage',
        description: `Only ${activeRegions} regions active - consider expanding coverage`,
        impact: 'medium',
        action: 'Add more edge locations for better fault tolerance'
      });
    }

    // Cost optimization
    if (this.config.cdn.cacheStrategy === 'conservative') {
      recommendations.push({
        type: 'cost',
        title: 'Cache Strategy Optimization',
        description: 'Conservative caching may increase bandwidth costs',
        impact: 'low',
        action: 'Consider more aggressive caching strategy'
      });
    }

    return recommendations;
  }
}

// React hooks for edge computing
export const useEdgeOptimization = () => {
  const [optimalRegion, setOptimalRegion] = useState<string>('us-east');
  const [isLoading, setIsLoading] = useState(false);

  const service = new EdgeService();

  const getOptimalRegion = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to get user location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const region = await service.getOptimalRegion({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setOptimalRegion(region);
            setIsLoading(false);
          },
          async () => {
            // Fallback to default region
            const region = await service.getOptimalRegion();
            setOptimalRegion(region);
            setIsLoading(false);
          }
        );
      } else {
        const region = await service.getOptimalRegion();
        setOptimalRegion(region);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to determine optimal region:', error);
      setIsLoading(false);
    }
  }, []);

  const optimizeResource = useCallback(async (url: string, type: 'image' | 'script' | 'style') => {
    return service.optimizeResource(url, type);
  }, []);

  const prefetchResource = useCallback(async (url: string, priority: 'high' | 'low' = 'low') => {
    return service.prefetchResource(url, priority);
  }, []);

  const getOptimizationRecommendations = useCallback(async () => {
    return service.getOptimizationRecommendations();
  }, []);

  useEffect(() => {
    getOptimalRegion();
  }, [getOptimalRegion]);

  return {
    optimalRegion,
    isLoading,
    optimizeResource,
    prefetchResource,
    getOptimizationRecommendations,
    recordMetric: service.recordMetric.bind(service),
    getMetrics: service.getMetrics.bind(service)
  };
};

// Edge-optimized image component
interface EdgeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export const EdgeImage: React.FC<EdgeImageProps> = ({
  src,
  alt,
  priority = false,
  quality = 75,
  sizes,
  ...props
}) => {
  const { optimizeResource, prefetchResource } = useEdgeOptimization();
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  useEffect(() => {
    const optimizeImage = async () => {
      try {
        const optimized = await optimizeResource(src, 'image');
        setOptimizedSrc(optimized);
      } catch (error) {
        console.warn('Failed to optimize image:', error);
      }
    };

    optimizeImage();

    if (priority) {
      prefetchResource(src, 'high').catch(console.warn);
    }
  }, [src, optimizeResource, prefetchResource, priority]);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
};

// Edge-optimized script loader
interface EdgeScriptProps {
  src: string;
  async?: boolean;
  defer?: boolean;
  priority?: 'high' | 'low';
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export const EdgeScript: React.FC<EdgeScriptProps> = ({
  src,
  async = true,
  defer = false,
  priority = 'low',
  onLoad,
  onError
}) => {
  const { optimizeResource, prefetchResource } = useEdgeOptimization();
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadScript = async () => {
      try {
        const optimized = await optimizeResource(src, 'script');
        setOptimizedSrc(optimized);

        if (priority === 'high') {
          await prefetchResource(optimized, 'high');
        }

        const script = document.createElement('script');
        script.src = optimized;
        script.async = async;
        script.defer = defer;

        script.onload = () => {
          setIsLoaded(true);
          onLoad?.();
        };

        script.onerror = (error) => {
          onError?.(error);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load optimized script:', error);
        onError?.(error as any);
      }
    };

    if (!isLoaded) {
      loadScript();
    }
  }, [src, async, defer, priority, optimizeResource, prefetchResource, onLoad, onError, isLoaded]);

  return null; // This component doesn't render anything
};

// Edge health monitoring component
interface EdgeHealthProps {
  showDetails?: boolean;
  refreshInterval?: number;
}

export const EdgeHealth: React.FC<EdgeHealthProps> = ({
  showDetails = false,
  refreshInterval = 30000
}) => {
  const { optimalRegion, getMetrics, getOptimizationRecommendations } = useEdgeOptimization();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [regionMetrics, setRegionMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    const updateHealth = async () => {
      try {
        const recs = await getOptimizationRecommendations();
        setRecommendations(recs);

        // Get metrics for all regions
        const regions = ['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-southeast', 'ap-northeast'];
        const metrics: Record<string, any> = {};

        for (const region of regions) {
          metrics[region] = {
            latency: getMetrics(region, 'latency'),
            throughput: getMetrics(region, 'throughput'),
            errorRate: getMetrics(region, 'errorRate')
          };
        }

        setRegionMetrics(metrics);
      } catch (error) {
        console.error('Failed to update edge health:', error);
      }
    };

    updateHealth();
    const interval = setInterval(updateHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [getOptimizationRecommendations, getMetrics, refreshInterval]);

  const getRegionName = (regionId: string) => {
    const names: Record<string, string> = {
      'us-east': 'US East',
      'us-west': 'US West',
      'eu-west': 'EU West',
      'eu-central': 'EU Central',
      'ap-southeast': 'Asia SE',
      'ap-northeast': 'Asia NE'
    };
    return names[regionId] || regionId;
  };

  return (
    <div className="space-y-6">
      {/* Current Region Status */}
      <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
        <h3 className="md3-title-large text-on-surface mb-4">Edge Network Status</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="md3-label-medium text-on-surface-variant mb-2">Optimal Region</div>
            <div className="md3-title-medium text-on-surface">{getRegionName(optimalRegion)}</div>
          </div>
          <div>
            <div className="md3-label-medium text-on-surface-variant mb-2">Active Recommendations</div>
            <div className="md3-title-medium text-on-surface">{recommendations.length}</div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
          <h3 className="md3-title-large text-on-surface mb-4">Optimization Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 rounded-2xl border border-outline bg-surface p-4">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.impact === 'high' ? 'bg-error-container text-on-error-container' :
                  rec.impact === 'medium' ? 'bg-warning-container text-on-warning-container' :
                  'bg-primary-container text-on-primary-container'
                }`}>
                  {rec.impact.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="md3-title-small text-on-surface font-medium">{rec.title}</h4>
                  <p className="md3-body-medium text-on-surface-variant mt-1">{rec.description}</p>
                  <div className="md3-label-medium text-primary mt-2">{rec.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      {showDetails && (
        <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
          <h3 className="md3-title-large text-on-surface mb-4">Regional Performance</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(regionMetrics).map(([regionId, metrics]) => (
              <div key={regionId} className="rounded-2xl border border-outline bg-surface p-4">
                <h4 className="md3-title-small text-on-surface mb-3">{getRegionName(regionId)}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Latency</span>
                    <span className="text-on-surface">
                      {metrics.latency?.average?.toFixed(0) || 'N/A'}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Throughput</span>
                    <span className="text-on-surface">
                      {metrics.throughput?.average?.toFixed(1) || 'N/A'}MB/s
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Error Rate</span>
                    <span className="text-on-surface">
                      {(metrics.errorRate?.average * 100)?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export the service and components
export { EdgeService, DEFAULT_EDGE_CONFIG };
export type { EdgeConfig };
