import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Zap, 
  Globe, 
  Activity,
  Download,
  RefreshCw,
  Award,
  Target,
  Clock
} from 'lucide-react';
import BridgeAnalyticsService from '../../services/api/BridgeAnalyticsService';
import type { 
  BridgeAnalytics, 
  SpaceMiningAnalytics, 
  UserEngagementAnalytics, 
  BridgeComparison 
} from '../services/BridgeAnalyticsService';

const BridgeAnalyticsDashboard: React.FC = () => {
  const [analyticsService] = useState(() => new BridgeAnalyticsService());
  const [bridgeAnalytics, setBridgeAnalytics] = useState<BridgeAnalytics[]>([]);
  const [spaceMiningAnalytics, setSpaceMiningAnalytics] = useState<SpaceMiningAnalytics | null>(null);
  const [userEngagementAnalytics, setUserEngagementAnalytics] = useState<UserEngagementAnalytics | null>(null);
  const [bridgeComparison, setBridgeComparison] = useState<BridgeComparison[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'space' | 'messages' | 'participants' | 'efficiency'>('space');

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
        const [
          bridgeData,
          spaceData,
          userData,
          comparisonData,
          summaryData
        ] = await Promise.all([
          analyticsService.getBridgeAnalytics(),
          analyticsService.getSpaceMiningAnalytics(),
          analyticsService.getUserEngagementAnalytics(),
          analyticsService.getBridgeComparison(),
          analyticsService.getAnalyticsSummary()
        ]);

        setBridgeAnalytics(bridgeData);
        setSpaceMiningAnalytics(spaceData);
        setUserEngagementAnalytics(userData);
        setBridgeComparison(comparisonData);
        setSummary(summaryData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [analyticsService, selectedTimeRange]);

  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      const [
        bridgeData,
        spaceData,
        userData,
        comparisonData,
        summaryData
      ] = await Promise.all([
        analyticsService.getBridgeAnalytics(),
        analyticsService.getSpaceMiningAnalytics(),
        analyticsService.getUserEngagementAnalytics(),
        analyticsService.getBridgeComparison(),
        analyticsService.getAnalyticsSummary()
      ]);

      setBridgeAnalytics(bridgeData);
      setSpaceMiningAnalytics(spaceData);
      setUserEngagementAnalytics(userData);
      setBridgeComparison(comparisonData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (type: 'bridges' | 'space-mining' | 'user-engagement' | 'all') => {
    try {
      const blob = await analyticsService.exportAnalytics(type, 'json');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bridge-analytics-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const getMetricValue = (bridge: BridgeComparison) => {
    switch (selectedMetric) {
      case 'space':
        return bridge.total_space;
      case 'messages':
        return bridge.message_count;
      case 'participants':
        return bridge.participant_count;
      case 'efficiency':
        return bridge.efficiency_score;
      default:
        return bridge.total_space;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'space':
        return 'Space Connected (KB)';
      case 'messages':
        return 'Messages';
      case 'participants':
        return 'Participants';
      case 'efficiency':
        return 'Efficiency Score';
      default:
        return 'Space Connected (KB)';
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'space':
        return <Globe size={16} className="text-green-400" />;
      case 'messages':
        return <MessageSquare size={16} className="text-blue-400" />;
      case 'participants':
        return <Users size={16} className="text-purple-400" />;
      case 'efficiency':
        return <Target size={16} className="text-yellow-400" />;
      default:
        return <Globe size={16} className="text-green-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="animate-spin text-blue-400" size={24} />
              <span className="text-lg">Loading analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Bridge Analytics Dashboard
              </h1>
              <p className="text-slate-300 text-lg">Comprehensive analytics for space-bridge connections</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshAnalytics}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => exportAnalytics('all')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Globe className="text-blue-400" size={24} />
                <span className="text-2xl">🌐</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {summary.total_bridges}
              </div>
              <div className="text-slate-400 text-sm">Active Bridges</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Zap className="text-green-400" size={24} />
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {summary.total_space_connected.toFixed(1)} KB
              </div>
              <div className="text-slate-400 text-sm">Space Connected</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-purple-400" size={24} />
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {summary.total_participants}
              </div>
              <div className="text-slate-400 text-sm">Active Participants</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Target className="text-yellow-400" size={24} />
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {summary.avg_efficiency.toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">Avg Efficiency</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Time Range:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Metric:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            >
              <option value="space">Space Connected</option>
              <option value="messages">Messages</option>
              <option value="participants">Participants</option>
              <option value="efficiency">Efficiency</option>
            </select>
          </div>
        </div>

        {/* Bridge Comparison Chart */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="text-blue-400" size={24} />
              Bridge Performance Comparison
            </h3>
            <div className="flex items-center gap-2">
              {getMetricIcon()}
              <span className="text-sm text-slate-400">{getMetricLabel()}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {bridgeComparison.map((bridge, index) => {
              const value = getMetricValue(bridge);
              const maxValue = Math.max(...bridgeComparison.map(b => getMetricValue(b)));
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={bridge.bridge_id} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-slate-300 truncate">
                    {bridge.source_chain} → {bridge.target_chain}
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-full h-6 relative">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {selectedMetric === 'efficiency' ? `${value}%` : value.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-slate-400 text-right">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Space Mining Analytics */}
          {spaceMiningAnalytics && (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-400" size={24} />
                Space Mining Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {spaceMiningAnalytics.total_space_mined.toFixed(1)} KB
                    </div>
                    <div className="text-slate-400 text-sm">Total Space Mined</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {spaceMiningAnalytics.total_optimizations}
                    </div>
                    <div className="text-slate-400 text-sm">Total Optimizations</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {spaceMiningAnalytics.avg_space_per_optimization.toFixed(1)} KB
                  </div>
                  <div className="text-slate-400 text-sm">Avg Space per Optimization</div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Top Biomes:</h4>
                  <div className="space-y-1">
                    {spaceMiningAnalytics.top_biomes.slice(0, 3).map((biome, index) => (
                      <div key={biome.biome} className="flex justify-between text-sm">
                        <span className="text-slate-400">{biome.biome}</span>
                        <span className="text-green-400">{biome.total_space.toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Engagement Analytics */}
          {userEngagementAnalytics && (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-purple-400" size={24} />
                User Engagement Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {userEngagementAnalytics.active_users}
                    </div>
                    <div className="text-slate-400 text-sm">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {userEngagementAnalytics.new_users_today}
                    </div>
                    <div className="text-slate-400 text-sm">New Users Today</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {(userEngagementAnalytics.user_retention_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-slate-400 text-sm">User Retention Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round(userEngagementAnalytics.avg_session_duration / 60)} min
                  </div>
                  <div className="text-slate-400 text-sm">Avg Session Duration</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Performing Bridges */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="text-yellow-400" size={24} />
            Top Performing Bridges
          </h3>
          
          <div className="space-y-3">
            {bridgeComparison.slice(0, 5).map((bridge, index) => (
              <div key={bridge.bridge_id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-blue-300">
                        {bridge.source_chain} → {bridge.target_chain}
                      </div>
                      <div className="text-sm text-slate-400">Bridge ID: {bridge.bridge_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {bridge.efficiency_score}%
                    </div>
                    <div className="text-sm text-slate-400">Efficiency</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-blue-400 font-semibold">{bridge.total_space.toFixed(1)} KB</div>
                    <div className="text-slate-500">Space</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-semibold">{bridge.participant_count}</div>
                    <div className="text-slate-500">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">{bridge.message_count}</div>
                    <div className="text-slate-500">Messages</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {summary && summary.top_insights && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-pink-400" size={24} />
              Key Insights
            </h3>
            
            <div className="space-y-3">
              {summary.top_insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-slate-300">{insight}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BridgeAnalyticsDashboard;