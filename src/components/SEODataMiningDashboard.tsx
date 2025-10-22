/**
 * SEO Data Mining Dashboard
 * Interface for contributing SEO training data and earning rewards
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  TrendingUp,
  Award,
  Target,
  Brain,
  Users,
  Coins,
  Upload,
  Check,
  AlertCircle,
  Info,
  BarChart3,
  Trophy,
  Zap
} from 'lucide-react';
import { useBlockchain } from '../hooks/useBlockchain';

interface TrainingStats {
  totalContributions: number;
  totalFeatures: number;
  totalRewards: string;
  uniqueContributors: number;
  avgQualityScore: number;
  datasetReadiness: {
    isReady: boolean;
    minSamplesRequired: number;
    currentSamples: number;
    missingFeatures: string[];
  };
}

interface Contribution {
  id: number;
  url: string;
  keyword: string;
  qualityScore: number;
  rewardAmount: string;
  blockchainTxHash?: string;
  timestamp: string;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  contributions: number;
  rewards: string;
  avgQualityScore: number;
}

export const SEODataMiningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contribute' | 'stats' | 'leaderboard'>('contribute');
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const { account, isConnected } = useBlockchain();

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    if (isConnected && account) {
      fetchUserContributions(account);
    }
    fetchLeaderboard();
  }, [isConnected, account]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/seo/training/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUserContributions = async (address: string) => {
    try {
      const response = await fetch(`/api/seo/training/contributions/${address}`);
      const data = await response.json();
      if (data.success) {
        setContributions(data.contributions);
      }
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/seo/training/leaderboard?limit=10');
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const handleContribute = async () => {
    if (!url || !keyword) {
      setError('Please enter both URL and keyword');
      return;
    }

    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/seo/training/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          keyword,
          contributorAddress: account
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setUrl('');
        setKeyword('');
        
        // Refresh data
        await fetchStats();
        await fetchUserContributions(account);
        
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Contribution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contribution failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTokenAmount = (amount: string) => {
    try {
      const value = parseFloat(amount) / 1e18;
      return value.toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const renderContributeTab = () => (
    <div className="space-y-6">
      {/* Contribution Form */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-400" />
          Contribute SEO Data
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., best seo tools"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          {!isConnected && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-300">
                Please connect your wallet to contribute data and earn rewards.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-start gap-2">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-300">
                Data contributed successfully! Rewards will be distributed shortly.
              </div>
            </div>
          )}

          <button
            onClick={handleContribute}
            disabled={loading || !isConnected}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing & Submitting...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Contribute Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          How Data Mining Works
        </h3>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Submit URL & Keyword</p>
              <p className="text-gray-400">We analyze 194 SEO features including Core Web Vitals, backlinks, and content quality.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Data Quality Check</p>
              <p className="text-gray-400">Your contribution is validated for completeness and accuracy (0-100 score).</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Earn Rewards</p>
              <p className="text-gray-400">Receive LDOM tokens based on quality (0.01-0.05 per feature). Higher quality = more rewards!</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium">Profit Sharing</p>
              <p className="text-gray-400">When AI models trained on your data are used, you earn a share of the revenue!</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Contributions */}
      {isConnected && contributions.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Your Contributions</h3>
          
          <div className="space-y-2">
            {contributions.slice(0, 5).map((contribution) => (
              <div key={contribution.id} className="p-3 bg-slate-700 rounded flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contribution.url}</p>
                  <p className="text-sm text-gray-400">Keyword: {contribution.keyword}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-green-400 font-mono">+{formatTokenAmount(contribution.rewardAmount)} LDOM</p>
                  <p className="text-xs text-gray-400">Score: {contribution.qualityScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold">{stats?.totalContributions || 0}</span>
          </div>
          <h4 className="font-medium">Total Contributions</h4>
          <p className="text-sm text-gray-400 mt-1">Data samples collected</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold">{stats?.uniqueContributors || 0}</span>
          </div>
          <h4 className="font-medium">Contributors</h4>
          <p className="text-sm text-gray-400 mt-1">Unique participants</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold">{formatTokenAmount(stats?.totalRewards || '0')}</span>
          </div>
          <h4 className="font-medium">Total Rewards</h4>
          <p className="text-sm text-gray-400 mt-1">LDOM distributed</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold">{stats?.avgQualityScore.toFixed(1) || '0.0'}</span>
          </div>
          <h4 className="font-medium">Avg Quality</h4>
          <p className="text-sm text-gray-400 mt-1">Data quality score</p>
        </div>
      </div>

      {/* Dataset Readiness */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          Dataset Readiness for Model Training
        </h3>
        
        {stats?.datasetReadiness && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-mono">
                  {stats.datasetReadiness.currentSamples} / {stats.datasetReadiness.minSamplesRequired}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all ${
                    stats.datasetReadiness.isReady ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min(
                      (stats.datasetReadiness.currentSamples / stats.datasetReadiness.minSamplesRequired) * 100,
                      100
                    )}%` 
                  }}
                />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              stats.datasetReadiness.isReady 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-blue-900/20 border-blue-800'
            }`}>
              {stats.datasetReadiness.isReady ? (
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium text-green-300">Dataset Ready!</p>
                    <p className="text-sm text-green-400 mt-1">
                      Sufficient data collected. Model training can begin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-300">Collecting More Data</p>
                    <p className="text-sm text-blue-400 mt-1">
                      Need {stats.datasetReadiness.minSamplesRequired - stats.datasetReadiness.currentSamples} more samples for training.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Top Contributors
        </h3>
        
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div 
              key={entry.rank}
              className={`p-4 rounded-lg flex items-center gap-4 ${
                entry.rank <= 3 
                  ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-800/50'
                  : 'bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 font-bold">
                {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                {entry.rank > 3 && <span className="text-gray-400">#{entry.rank}</span>}
              </div>
              
              <div className="flex-1">
                <p className="font-mono text-sm">{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</p>
                <p className="text-xs text-gray-400">Quality: {entry.avgQualityScore.toFixed(1)}</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold">{entry.contributions} contributions</p>
                <p className="text-sm text-green-400 font-mono">{formatTokenAmount(entry.rewards)} LDOM</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            SEO Data Mining
          </h1>
          <p className="text-gray-400">
            Contribute SEO data to train AI models and earn rewards through our collective intelligence system
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('contribute')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'contribute'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Contribute Data
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'contribute' && renderContributeTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </div>
    </div>
  );
};
