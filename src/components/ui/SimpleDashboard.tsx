/**
 * Simplified Dashboard for LightDom
 * Updated with Exodus-inspired design system
 */

import React, { useState } from 'react';
import { 
  Activity, 
  HardDrive, 
  Coins, 
  Award, 
  Play, 
  Pause,
  TrendingUp,
  Zap,
  Settings
} from 'lucide-react';
import { Card, Button } from './design-system';

interface SimpleDashboardProps {
  className?: string;
}

interface RealStats {
  optimizations: number;
  spaceSaved: number;
  tokensEarned: number;
  rank: number;
  crawledUrls: number;
  activeBridges: number;
  totalSpace: number;
  usedSpace: number;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ className = '' }) => {
  const [isCrawling, setIsCrawling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [stats, setStats] = useState<RealStats>({
    optimizations: 0,
    spaceSaved: 0,
    tokensEarned: 0,
    rank: 0,
    crawledUrls: 0,
    activeBridges: 0,
    totalSpace: 0,
    usedSpace: 0
  });

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRealData = async () => {
    setIsLoading(true);
    try {
      // Check API health
      const healthResponse = await axios.get('http://localhost:3001/api/health');
      setApiStatus(healthResponse.data.status === 'ok' ? 'online' : 'offline');

      // Fetch real stats
      const [statsResponse, bridgeResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/stats').catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:3001/api/bridge/analytics').catch(() => ({ data: { data: {} } }))
      ]);

      const apiStats = statsResponse.data.data || {};
      const bridgeStats = bridgeResponse.data.data || {};

      setStats({
        optimizations: apiStats.totalOptimizations || 0,
        spaceSaved: apiStats.totalSpace || 0,
        tokensEarned: apiStats.totalTokens || 0,
        rank: apiStats.userRank || 0,
        crawledUrls: apiStats.crawledUrls || 0,
        activeBridges: bridgeStats.operationalBridges || 0,
        totalSpace: bridgeStats.totalSpace || 0,
        usedSpace: bridgeStats.usedSpace || 0
      });
    } catch (error) {
      console.error('Failed to fetch real data:', error);
      setApiStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen bg-background-primary ${className}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-secondary border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-heading font-bold text-text-primary">
                LightDom Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
                <span className="text-sm text-text-secondary">Online</span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-blue bg-opacity-20">
                <Activity className="w-5 h-5 text-accent-blue" />
              </div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">
                Active Optimizations
              </span>
            </div>
            <div className="text-3xl font-bold text-accent-blue">
              {stats.optimizations}
            </div>
          </Card>

          <Card variant="gradient" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-semantic-success bg-opacity-20">
                <HardDrive className="w-5 h-5 text-semantic-success" />
              </div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">
                Space Saved
              </span>
            </div>
            <div className="text-3xl font-bold text-semantic-success">
              {formatBytes(stats.spaceSaved)}
            </div>
          </Card>

          <Card variant="gradient" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-semantic-warning bg-opacity-20">
                <Coins className="w-5 h-5 text-semantic-warning" />
              </div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">
                Tokens Earned
              </span>
            </div>
            <div className="text-3xl font-bold text-semantic-warning">
              {stats.tokensEarned.toLocaleString()}
            </div>
          </Card>

          <Card variant="gradient" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-purple bg-opacity-20">
                <Award className="w-5 h-5 text-accent-purple" />
              </div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">
                Rank
              </span>
            </div>
            <div className="text-3xl font-bold text-accent-purple">
              #{stats.rank}
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <Card variant="default" padding="lg" className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Crawler Control
          </h3>
          <div className="flex gap-3">
            <Button
              variant={isCrawling ? 'outline' : 'primary'}
              size="md"
              icon={isCrawling ? Pause : Play}
              iconPosition="left"
              onClick={() => setIsCrawling(!isCrawling)}
            >
              {isCrawling ? 'Stop' : 'Start'} Crawling
            </Button>
            <Button variant="secondary" size="md">
              View History
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              icon={TrendingUp}
              iconPosition="left"
              onClick={() => window.location.href = '/space-mining'}
            >
              Space Mining
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              icon={Zap}
              iconPosition="left"
              onClick={() => window.location.href = '/metaverse-mining'}
            >
              Metaverse Mining
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              icon={TrendingUp}
              iconPosition="left"
              onClick={() => window.location.href = '/optimization'}
            >
              Space Optimization
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SimpleDashboard;
