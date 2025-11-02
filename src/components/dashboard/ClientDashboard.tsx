/**
 * Client Dashboard Component
 * 
 * Secure, personalized dashboard for clients showing their SEO performance
 * Protects proprietary methodologies while displaying compelling results
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Globe, 
  Users, 
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Zap,
  Download,
  Calendar,
  Settings,
  HelpCircle
} from 'lucide-react';
import {
  MetricCard,
  InfographicHeader,
  ProgressGauge,
  ComparisonCard
} from '../ui/infographics';
import { cn } from '@/lib/utils';

interface DashboardData {
  clientId: string;
  companyName: string;
  subscriptionPlan: 'starter' | 'professional' | 'business' | 'enterprise';
  currentPeriod: {
    start: string;
    end: string;
  };
  metrics: {
    seoScore: {
      current: number;
      previous: number;
      change: number;
    };
    organicTraffic: {
      current: number;
      previous: number;
      change: number;
    };
    keywordRankings: {
      improved: number;
      declined: number;
      stable: number;
      topPositions: number; // Keywords in top 3
    };
    conversions: {
      current: number;
      previous: number;
      change: number;
      value: number;
    };
  };
  planLimits: {
    pageViews: {
      used: number;
      limit: number;
    };
    apiCalls: {
      used: number;
      limit: number;
    };
    domains: {
      used: number;
      limit: number;
    };
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

interface ClientDashboardProps {
  clientId: string;
  className?: string;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  clientId,
  className
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboardData();
  }, [clientId, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In production, this would fetch from API
      // const response = await fetch(`/api/v1/dashboard/${clientId}?period=${selectedPeriod}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData: DashboardData = {
        clientId,
        companyName: 'Tech Startup Inc',
        subscriptionPlan: 'professional',
        currentPeriod: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        metrics: {
          seoScore: {
            current: 85,
            previous: 72,
            change: 18
          },
          organicTraffic: {
            current: 45230,
            previous: 38100,
            change: 19
          },
          keywordRankings: {
            improved: 23,
            declined: 5,
            stable: 42,
            topPositions: 12
          },
          conversions: {
            current: 342,
            previous: 275,
            change: 24,
            value: 68400
          }
        },
        planLimits: {
          pageViews: {
            used: 42300,
            limit: 100000
          },
          apiCalls: {
            used: 8750,
            limit: 10000
          },
          domains: {
            used: 3,
            limit: 5
          }
        },
        recentActivity: [
          {
            type: 'optimization',
            message: 'SEO optimization applied to 12 pages',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'ranking',
            message: 'Keyword "enterprise software" reached position 3',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'traffic',
            message: 'Traffic spike detected (+45% from organic search)',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (plan: string): string => {
    const names: Record<string, string> = {
      starter: 'Starter',
      professional: 'Professional',
      business: 'Business',
      enterprise: 'Enterprise'
    };
    return names[plan] || plan;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto mb-4"></div>
          <p className="text-[#B9BBBE]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <InfographicHeader
        title={`Welcome back, ${data.companyName}`}
        subtitle={`${getPlanName(data.subscriptionPlan)} Plan`}
        dateRange={`${formatDate(data.currentPeriod.start)} - ${formatDate(data.currentPeriod.end)}`}
        actions={
          <>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-[#1E2438] border border-[#2E3349] rounded-lg text-white text-sm focus:outline-none focus:border-[#5865F2]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="px-4 py-2 bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="SEO Score"
          value={data.metrics.seoScore.current}
          change={data.metrics.seoScore.change}
          changeLabel="vs. last period"
          trend="up"
          icon={Target}
          format="custom"
          className="col-span-1"
        />
        
        <MetricCard
          title="Organic Traffic"
          value={data.metrics.organicTraffic.current}
          change={data.metrics.organicTraffic.change}
          changeLabel="vs. last period"
          trend="up"
          icon={Globe}
          format="number"
          showSparkline={true}
          sparklineData={[30000, 32000, 35000, 38000, 40000, 42000, 45230]}
        />
        
        <MetricCard
          title="Top 3 Rankings"
          value={data.metrics.keywordRankings.topPositions}
          change={25}
          changeLabel="keywords"
          trend="up"
          icon={TrendingUp}
          format="custom"
        />
        
        <MetricCard
          title="Conversions"
          value={data.metrics.conversions.current}
          change={data.metrics.conversions.change}
          changeLabel="vs. last period"
          trend="up"
          icon={Zap}
          format="number"
        />
      </div>

      {/* Performance Overview & Plan Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEO Score Gauge */}
        <div className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-lg p-6 border border-[#2E3349]">
          <h3 className="text-lg font-semibold text-white mb-6">Overall SEO Score</h3>
          <div className="flex justify-center">
            <ProgressGauge
              value={data.metrics.seoScore.current}
              max={100}
              label="SEO Score"
              size="lg"
              color="blue"
            />
          </div>
          <div className="mt-6 pt-6 border-t border-[#2E3349]">
            <p className="text-sm text-[#B9BBBE] text-center">
              Your SEO score improved by <span className="text-green-400 font-semibold">{data.metrics.seoScore.change}%</span> this period
            </p>
          </div>
        </div>

        {/* Keyword Rankings Distribution */}
        <div className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-lg p-6 border border-[#2E3349]">
          <h3 className="text-lg font-semibold text-white mb-6">Keyword Rankings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#B9BBBE]">Improved</span>
              <span className="text-2xl font-bold text-green-400">{data.metrics.keywordRankings.improved}</span>
            </div>
            <div className="w-full bg-[#0A0E27] rounded-full h-2">
              <div className="bg-gradient-to-r from-[#3BA55C] to-[#4BC46A] h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#B9BBBE]">Stable</span>
              <span className="text-2xl font-bold text-[#B9BBBE]">{data.metrics.keywordRankings.stable}</span>
            </div>
            <div className="w-full bg-[#0A0E27] rounded-full h-2">
              <div className="bg-gradient-to-r from-[#72767D] to-[#B9BBBE] h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#B9BBBE]">Declined</span>
              <span className="text-2xl font-bold text-red-400">{data.metrics.keywordRankings.declined}</span>
            </div>
            <div className="w-full bg-[#0A0E27] rounded-full h-2">
              <div className="bg-gradient-to-r from-[#ED4245] to-[#FF6B6B] h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>

        {/* Plan Usage */}
        <div className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-lg p-6 border border-[#2E3349]">
          <h3 className="text-lg font-semibold text-white mb-6">Plan Usage</h3>
          <div className="space-y-6">
            {/* Page Views */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#B9BBBE]">Page Views</span>
                <span className="text-sm text-white font-medium">
                  {data.planLimits.pageViews.used.toLocaleString()} / {data.planLimits.pageViews.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(data.planLimits.pageViews.used / data.planLimits.pageViews.limit) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* API Calls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#B9BBBE]">API Calls</span>
                <span className="text-sm text-white font-medium">
                  {data.planLimits.apiCalls.used.toLocaleString()} / {data.planLimits.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(data.planLimits.apiCalls.used / data.planLimits.apiCalls.limit) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Domains */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#B9BBBE]">Active Domains</span>
                <span className="text-sm text-white font-medium">
                  {data.planLimits.domains.used} / {data.planLimits.domains.limit}
                </span>
              </div>
              <div className="w-full bg-[#0A0E27] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(data.planLimits.domains.used / data.planLimits.domains.limit) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E3349]">
              <button className="w-full py-2 text-sm text-[#5865F2] hover:text-[#7C5CFF] font-medium transition-colors">
                Upgrade Plan →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Value Card */}
      <ComparisonCard
        beforeLabel="Previous Period"
        beforeValue={`$${data.metrics.conversions.previous * 200}`}
        afterLabel="Current Period"
        afterValue={`$${data.metrics.conversions.value.toLocaleString()}`}
        improvement={data.metrics.conversions.change}
        metric="Estimated Conversion Value"
        className="max-w-2xl mx-auto"
      />

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-lg p-6 border border-[#2E3349]">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-[#2E3349] last:border-0">
              <div className={cn(
                "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                activity.type === 'optimization' && "bg-blue-400",
                activity.type === 'ranking' && "bg-green-400",
                activity.type === 'traffic' && "bg-purple-400"
              )}></div>
              <div className="flex-1">
                <p className="text-sm text-white">{activity.message}</p>
                <p className="text-xs text-[#72767D] mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] rounded-lg p-6">
        <div className="flex items-start gap-4">
          <HelpCircle className="w-6 h-6 text-white flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-sm text-white/80 mb-4">
              Our support team is here to help you maximize your SEO performance.
            </p>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
