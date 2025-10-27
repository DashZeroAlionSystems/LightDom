import React, { useEffect, useState } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Activity, Database, Globe } from 'lucide-react';
import axios from 'axios';

interface MiningData {
  totalMined: number;
  activeMiners: number;
  tokensEarned: number;
  miningRate: number;
  efficiency: number;
  minedToday: number;
  minedThisWeek: number;
  totalSizeMinedBytes: number;
  spaceReclaimedBytes: number;
  crawlerStatus: string;
  lastUpdate: string;
}

interface CrawlerStats {
  isRunning: boolean;
  crawledCount: number;
  discoveredCount: number;
  crawledToday: number;
  avgSeoScore: number;
  totalSpaceSaved: number;
  seoTrainingRecords: number;
}

interface RecentCrawl {
  url: string;
  domain: string;
  crawledAt: string;
  seoScore: number;
  sizeBytes: number;
  spaceSaved: number;
}

const API_BASE = 'http://localhost:3001';

export const DashboardPage: React.FC = () => {
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [crawlerStats, setCrawlerStats] = useState<CrawlerStats | null>(null);
  const [recentCrawls, setRecentCrawls] = useState<RecentCrawl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [miningRes, crawlerRes, recentRes] = await Promise.all([
        axios.get(`${API_BASE}/api/metaverse/mining-data`),
        axios.get(`${API_BASE}/api/crawler/stats`),
        axios.get(`${API_BASE}/api/crawler/recent?limit=5`)
      ]);

      setMiningData(miningRes.data);
      setCrawlerStats(crawlerRes.data);
      setRecentCrawls(recentRes.data.crawls || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${crawlerStats?.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-muted-foreground">
            Crawler {crawlerStats?.isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Sites Mined</span>
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">{miningData?.totalMined || 0}</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            {miningData?.minedToday || 0} today
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">LDC Earned</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">{miningData?.tokensEarned || 0} LDC</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            From mining rewards
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Space Reclaimed</span>
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatBytes(miningData?.spaceReclaimedBytes || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            Avg SEO Score: {crawlerStats?.avgSeoScore || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold mb-4">Mining Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Miners</span>
              <span className="font-semibold">{miningData?.activeMiners || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mining Rate</span>
              <span className="font-semibold">{miningData?.miningRate || 0}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Efficiency</span>
              <span className="font-semibold">{miningData?.efficiency || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Crawled</span>
              <span className="font-semibold">{crawlerStats?.crawledCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SEO Training Records</span>
              <span className="font-semibold">{crawlerStats?.seoTrainingRecords || 0}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold mb-4">Weekly Progress</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mined This Week</span>
              <span className="font-semibold">{miningData?.minedThisWeek || 0} sites</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mined Today</span>
              <span className="font-semibold">{miningData?.minedToday || 0} sites</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Size Mined</span>
              <span className="font-semibold">{formatBytes(miningData?.totalSizeMinedBytes || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discovered URLs</span>
              <span className="font-semibold">{crawlerStats?.discoveredCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Mining Activity</h2>
        {recentCrawls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No mining activity yet. The crawler is starting up...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCrawls.map((crawl, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-exodus flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{crawl.domain}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(crawl.crawledAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">SEO: {Math.round(crawl.seoScore || 0)}/100</div>
                  <div className="text-sm text-green-500">+{formatBytes(crawl.spaceSaved || 0)} saved</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
