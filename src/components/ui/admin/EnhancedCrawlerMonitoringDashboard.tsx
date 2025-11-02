/**
 * EnhancedCrawlerMonitoringDashboard
 * 
 * Real-time crawler monitoring with parallel crawler visibility,
 * workload tracking, and live status indicators.
 * Uses design system atomic components and follows IDE-styled UX patterns.
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge
} from '@/components/ui';
import {
  LiveStatusIndicator,
  LiveMetricCard,
  ActivityPulse
} from '@/components/ui/atoms/LiveStatusIndicator';
import {
  LiveCounter,
  LiveProgressBar,
  LiveBadge,
  LiveTimestamp
} from '@/components/ui/atoms/LiveDataDisplay';
import { Activity, Cpu, HardDrive, Zap, Globe, RefreshCw } from 'lucide-react';

interface CrawlerInstance {
  id: string;
  status: 'active' | 'idle' | 'error';
  currentUrl: string;
  queueSize: number;
  pagesProcessed: number;
  pagesPerSecond: number;
  efficiency: number;
  startedAt: string;
  lastActivity: string;
  workload: {
    domain: string;
    priority: 'high' | 'medium' | 'low';
    progress: number;
    totalPages: number;
  };
}

interface CrawlerStats {
  totalCrawlers: number;
  activeCrawlers: number;
  totalPages: number;
  pagesPerSecond: number;
  totalSpace: number;
  averageEfficiency: number;
}

export const EnhancedCrawlerMonitoringDashboard: React.FC = () => {
  const [crawlers, setCrawlers] = useState<CrawlerInstance[]>([]);
  const [stats, setStats] = useState<CrawlerStats>({
    totalCrawlers: 0,
    activeCrawlers: 0,
    totalPages: 0,
    pagesPerSecond: 0,
    totalSpace: 0,
    averageEfficiency: 0,
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchCrawlerData = async () => {
    try {
      setLoading(true);
      
      // Fetch active crawlers
      const crawlersRes = await fetch('/api/crawler/active');
      if (!crawlersRes.ok) {
        throw new Error(`Failed to fetch crawlers: ${crawlersRes.statusText}`);
      }
      const crawlersData = await crawlersRes.json();
      
      // Fetch stats
      const statsRes = await fetch('/api/crawler/stats');
      if (!statsRes.ok) {
        throw new Error(`Failed to fetch stats: ${statsRes.statusText}`);
      }
      const statsData = await statsRes.json();
      
      // Transform data for display
      const transformedCrawlers: CrawlerInstance[] = crawlersData.map((c: any) => ({
        id: c.crawler_id || c.id,
        status: c.status === 'active' ? 'active' : 'idle',
        currentUrl: c.current_url || '',
        queueSize: c.queue_size || 0,
        pagesProcessed: c.total_pages_processed || 0,
        pagesPerSecond: c.pages_per_second || 0,
        efficiency: c.efficiency_percent || 0,
        startedAt: c.started_at || new Date().toISOString(),
        lastActivity: c.last_activity || new Date().toISOString(),
        workload: {
          domain: extractDomain(c.current_url || ''),
          priority: determinePriority(c.priority || 5),
          progress: c.progress_percent || 0,
          totalPages: c.total_target_pages || 100,
        },
      }));
      
      setCrawlers(transformedCrawlers);
      setStats({
        totalCrawlers: transformedCrawlers.length,
        activeCrawlers: transformedCrawlers.filter(c => c.status === 'active').length,
        totalPages: statsData.total_urls_crawled || 0,
        pagesPerSecond: transformedCrawlers.reduce((sum, c) => sum + c.pagesPerSecond, 0),
        totalSpace: statsData.total_space_saved || 0,
        averageEfficiency: transformedCrawlers.length > 0
          ? transformedCrawlers.reduce((sum, c) => sum + c.efficiency, 0) / transformedCrawlers.length
          : 0,
      });
    } catch (error) {
      console.error('Failed to fetch crawler data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlerData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchCrawlerData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'N/A';
    }
  };

  const determinePriority = (priority: number): 'high' | 'medium' | 'low' => {
    if (priority >= 7) return 'high';
    if (priority >= 4) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crawler Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time parallel crawler workload tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveStatusIndicator
            status={stats.activeCrawlers > 0 ? 'active' : 'idle'}
            label="System"
            count={stats.activeCrawlers}
            pulse={stats.activeCrawlers > 0}
          />
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="filled" size="sm" onClick={fetchCrawlerData} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiveMetricCard
          label="Active Crawlers"
          value={stats.activeCrawlers}
          unit={`/ ${stats.totalCrawlers}`}
          status={stats.activeCrawlers > 0 ? 'active' : 'idle'}
          icon={<Activity className="w-5 h-5" />}
          trend={stats.activeCrawlers > 0 ? 'up' : 'neutral'}
        />
        <LiveMetricCard
          label="Pages/Second"
          value={<LiveCounter value={stats.pagesPerSecond} decimals={2} />}
          status="active"
          icon={<Zap className="w-5 h-5" />}
        />
        <LiveMetricCard
          label="Total Pages"
          value={<LiveCounter value={stats.totalPages} format="compact" />}
          icon={<Globe className="w-5 h-5" />}
        />
        <LiveMetricCard
          label="Average Efficiency"
          value={<LiveCounter value={stats.averageEfficiency} decimals={1} suffix="%" />}
          icon={<Cpu className="w-5 h-5" />}
          status={stats.averageEfficiency > 80 ? 'active' : stats.averageEfficiency > 50 ? 'warning' : 'error'}
        />
      </div>

      {/* Parallel Crawlers Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Parallel Crawlers ({crawlers.length})</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Live View</span>
              <ActivityPulse active={stats.activeCrawlers > 0} color="green" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {crawlers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active crawlers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {crawlers.map((crawler) => (
                <CrawlerCard key={crawler.id} crawler={crawler} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Individual Crawler Card Component
const CrawlerCard: React.FC<{ crawler: CrawlerInstance }> = ({ crawler }) => {
  return (
    <div className={`
      p-4 rounded-lg border-2 transition-all duration-200
      ${crawler.status === 'active' 
        ? 'border-green-300 bg-green-50/50 shadow-sm' 
        : 'border-gray-200 bg-gray-50/50'
      }
    `}>
      {/* Crawler Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ActivityPulse 
            active={crawler.status === 'active'} 
            color={crawler.status === 'active' ? 'green' : 'blue'} 
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{crawler.id}</h3>
            <p className="text-xs text-gray-600">
              <LiveTimestamp timestamp={crawler.lastActivity} />
            </p>
          </div>
        </div>
        <LiveBadge 
          variant={crawler.status === 'active' ? 'success' : 'default'}
          pulse={crawler.status === 'active'}
        >
          {crawler.status}
        </LiveBadge>
      </div>

      {/* Workload Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Domain:</span>
          <span className="font-medium text-gray-900 truncate max-w-[200px]">
            {crawler.workload.domain}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Priority:</span>
          <LiveBadge variant={getPriorityVariant(crawler.workload.priority)}>
            {crawler.workload.priority.toUpperCase()}
          </LiveBadge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Queue:</span>
          <span className="font-medium">{crawler.queueSize} pages</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{crawler.workload.progress.toFixed(0)}%</span>
        </div>
        <LiveProgressBar
          value={crawler.workload.progress}
          max={100}
          status={crawler.status === 'active' ? 'success' : 'default'}
          animated={crawler.status === 'active'}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-600">Processed</div>
          <div className="text-sm font-semibold text-gray-900">
            <LiveCounter value={crawler.pagesProcessed} format="compact" />
          </div>
        </div>
        <div className="text-center border-l border-r border-gray-200">
          <div className="text-xs text-gray-600">Speed</div>
          <div className="text-sm font-semibold text-gray-900">
            <LiveCounter value={crawler.pagesPerSecond} decimals={1} suffix="/s" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Efficiency</div>
          <div className="text-sm font-semibold text-gray-900">
            <LiveCounter value={crawler.efficiency} decimals={0} suffix="%" />
          </div>
        </div>
      </div>

      {/* Current URL */}
      {crawler.currentUrl && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Current Page:</div>
          <div className="text-xs font-mono bg-white p-2 rounded border border-gray-200 truncate">
            {crawler.currentUrl}
          </div>
        </div>
      )}
    </div>
  );
};

const getPriorityVariant = (priority: 'high' | 'medium' | 'low'): 'error' | 'warning' | 'success' => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
  }
};

export default EnhancedCrawlerMonitoringDashboard;
