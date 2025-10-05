/**
 * Space Optimization Dashboard - Comprehensive UI for managing space optimizations
 * Real-time tracking of 1KB optimizations and metaverse asset generation
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Globe, 
  TrendingUp, 
  Award, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Database, 
  Network, 
  Link, 
  Search, 
  Map, 
  Brain, 
  Layers,
  BarChart3,
  PieChart,
  Target,
  Coins,
  Landmark,
  Server,
  Bridge,
  Star
} from 'lucide-react';

interface OptimizationResult {
  id: string;
  url: string;
  spaceSavedKB: number;
  tokensEarned: number;
  biomeType: string;
  optimizationType: string;
  qualityScore: number;
  timestamp: number;
  harvesterAddress: string;
  metaverseAssets: number;
}

interface HarvesterStats {
  address: string;
  reputation: number;
  totalSpaceHarvested: number;
  totalTokensEarned: number;
  optimizationCount: number;
  landParcels: number;
  aiNodes: number;
  storageShards: number;
  bridges: number;
  stakingRewards: number;
}

interface MetaverseStats {
  totalLand: number;
  totalAINodes: number;
  totalStorageShards: number;
  totalBridges: number;
  totalStakingRewards: number;
  totalSpaceHarvested: number;
  totalTokensDistributed: number;
}

const SpaceOptimizationDashboard: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [harvesters, setHarvesters] = useState<HarvesterStats[]>([]);
  const [metaverseStats, setMetaverseStats] = useState<MetaverseStats>({
    totalLand: 0,
    totalAINodes: 0,
    totalStorageShards: 0,
    totalBridges: 0,
    totalStakingRewards: 0,
    totalSpaceHarvested: 0,
    totalTokensDistributed: 0
  });
  
  const [currentOptimization, setCurrentOptimization] = useState<string>('');
  const [optimizationSpeed, setOptimizationSpeed] = useState(2);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newOptimization, setNewOptimization] = useState({
    url: '',
    spaceSavedBytes: 0,
    optimizationType: 'light-dom',
    biomeType: 'digital'
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Real-time optimization simulation
  useEffect(() => {
    if (isOptimizing) {
      intervalRef.current = setInterval(() => {
        simulateOptimization();
      }, 3000 / optimizationSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOptimizing, optimizationSpeed]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const wsUrl = (location.origin || '').replace('http', 'ws') + '/ws/optimizations';
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'optimization') {
        setOptimizations(prev => [data.optimization, ...prev.slice(0, 49)]);
        updateMetaverseStats(data.optimization);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadOptimizations();
    loadHarvesters();
    loadMetaverseStats();
  }, []);

  const simulateOptimization = () => {
    const websites = [
      { url: 'github.com', biome: 'digital', authority: 'high' },
      { url: 'stackoverflow.com', biome: 'knowledge', authority: 'high' },
      { url: 'medium.com', biome: 'knowledge', authority: 'medium' },
      { url: 'dev.to', biome: 'digital', authority: 'medium' },
      { url: 'hackernews.com', biome: 'community', authority: 'high' },
      { url: 'techcrunch.com', biome: 'commercial', authority: 'high' },
      { url: 'wired.com', biome: 'knowledge', authority: 'high' },
      { url: 'reddit.com', biome: 'social', authority: 'high' }
    ];

    const target = websites[Math.floor(Math.random() * websites.length)];
    const spaceFound = (Math.random() * 20 + 5) * optimizationSpeed; // 5-25KB
    const tokensFromSpace = spaceFound * 0.15;
    const qualityScore = Math.floor(Math.random() * 30 + 70); // 70-100

    const optimization: OptimizationResult = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: target.url,
      spaceSavedKB: Math.floor(spaceFound),
      tokensEarned: tokensFromSpace,
      biomeType: target.biome,
      optimizationType: ['light-dom', 'css-optimization', 'js-optimization', 'ai-optimization'][Math.floor(Math.random() * 4)],
      qualityScore,
      timestamp: Date.now(),
      harvesterAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      metaverseAssets: Math.floor(spaceFound / 100) + Math.floor(spaceFound / 500) + Math.floor(spaceFound / 1000)
    };

    setCurrentOptimization(target.url);
    setOptimizations(prev => [optimization, ...prev.slice(0, 49)]);
    updateMetaverseStats(optimization);
  };

  const updateMetaverseStats = (optimization: OptimizationResult) => {
    setMetaverseStats(prev => ({
      ...prev,
      totalSpaceHarvested: prev.totalSpaceHarvested + optimization.spaceSavedKB,
      totalTokensDistributed: prev.totalTokensDistributed + optimization.tokensEarned,
      totalLand: prev.totalLand + Math.floor(optimization.spaceSavedKB / 100),
      totalAINodes: prev.totalAINodes + Math.floor(optimization.spaceSavedKB / 1000),
      totalStorageShards: prev.totalStorageShards + Math.floor(optimization.spaceSavedKB / 500),
      totalBridges: prev.totalBridges + Math.floor(optimization.spaceSavedKB / 2000)
    }));
  };

  const loadOptimizations = async () => {
    try {
      const response = await fetch('/api/optimization/list?limit=50');
      const data = await response.json();
      if (data.success) {
        setOptimizations(data.data.optimizations);
      }
    } catch (error) {
      console.error('Error loading optimizations:', error);
    }
  };

  const loadHarvesters = async () => {
    try {
      const response = await fetch('/api/harvester/list?limit=20');
      const data = await response.json();
      if (data.success) {
        setHarvesters(data.data.harvesters);
      }
    } catch (error) {
      console.error('Error loading harvesters:', error);
    }
  };

  const loadMetaverseStats = async () => {
    try {
      const response = await fetch('/api/metaverse/stats');
      const data = await response.json();
      if (data.success) {
        setMetaverseStats(data.data);
      }
    } catch (error) {
      console.error('Error loading metaverse stats:', error);
    }
  };

  const submitOptimization = async () => {
    if (!newOptimization.url || newOptimization.spaceSavedBytes < 1024) {
      alert('Please enter a valid URL and space saved (minimum 1KB)');
      return;
    }

    try {
      const response = await fetch('/api/optimization/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOptimization)
      });

      const data = await response.json();
      if (data.success) {
        setOptimizations(prev => [data.data, ...prev.slice(0, 49)]);
        updateMetaverseStats(data.data);
        setNewOptimization({ url: '', spaceSavedBytes: 0, optimizationType: 'light-dom', biomeType: 'digital' });
        alert(`Optimization submitted! ${data.data.spaceSavedKB}KB saved, ${data.data.tokenReward.toFixed(6)} DSH earned`);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting optimization:', error);
      alert('Error submitting optimization');
    }
  };

  const getBiomeEmoji = (biome: string) => {
    const emojis: { [key: string]: string } = {
      'digital': '💻',
      'knowledge': '📚',
      'commercial': '🏢',
      'entertainment': '🎬',
      'social': '👥',
      'community': '🌐',
      'professional': '👔',
      'production': '🏭'
    };
    return emojis[biome] || '🌍';
  };

  const getAuthorityColor = (authority: string) => {
    const colors: { [key: string]: string } = {
      'high': 'text-green-400',
      'medium': 'text-yellow-400',
      'low': 'text-orange-400'
    };
    return colors[authority] || 'text-gray-400';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Space Optimization Dashboard
          </h1>
          <p className="text-slate-300 text-lg">Track every 1KB of optimized space and its metaverse impact</p>
          <div className="mt-4 flex justify-center items-center gap-6 text-sm text-slate-400">
            <span>⚡ Real-time Optimization</span>
            <span>🏗️ Metaverse Building</span>
            <span>💰 Token Rewards</span>
            <span>📊 Analytics</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsOptimizing(!isOptimizing)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              isOptimizing 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isOptimizing ? <Pause size={20} /> : <Play size={20} />}
            {isOptimizing ? 'Stop Optimization' : 'Start Optimization'}
          </button>
          
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <BarChart3 size={20} />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          
          <button
            onClick={() => window.open('/advanced-nodes', '_blank')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Server size={20} />
            Advanced Node Management
          </button>
          
          <button
            onClick={() => window.open('/metaverse-mining', '_blank')}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Brain size={20} />
            Metaverse Mining
          </button>
          
          <button
            onClick={() => window.open('/blockchain-models', '_blank')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Database size={20} />
            Blockchain Model Storage
          </button>
          
          <button
            onClick={() => window.open('/workflow-simulation', '_blank')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Activity size={20} />
            Workflow Simulation
          </button>
          
          <button
            onClick={() => window.open('/testing', '_blank')}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Target size={20} />
            Testing Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={optimizationSpeed}
              onChange={(e) => setOptimizationSpeed(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm">{optimizationSpeed}x Speed</span>
          </div>
        </div>

        {/* Current Optimization Status */}
        {isOptimizing && currentOptimization && (
          <div className="bg-gradient-to-r from-slate-800/30 via-green-800/30 to-slate-800/30 backdrop-blur rounded-xl p-4 mb-8 border border-green-500/30">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
              <span className="text-green-400 font-semibold">Optimizing:</span>
              <span className="text-white font-mono">{currentOptimization}</span>
              <span className="text-slate-400">• Building metaverse assets</span>
            </div>
          </div>
        )}

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Database className="text-blue-400" size={24} />
              <span className="text-2xl">💾</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {metaverseStats.totalSpaceHarvested.toLocaleString()} KB
            </div>
            <div className="text-slate-400 text-sm">Total Space Optimized</div>
            <div className="mt-2 text-xs text-slate-500">
              {optimizations.length} optimizations completed
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Coins className="text-yellow-400" size={24} />
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {metaverseStats.totalTokensDistributed.toFixed(2)} DSH
            </div>
            <div className="text-slate-400 text-sm">Tokens Distributed</div>
            <div className="mt-2 text-xs text-slate-500">
              From space optimization rewards
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Landmark className="text-green-400" size={24} />
              <span className="text-2xl">🏞️</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {metaverseStats.totalLand.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">Virtual Land Parcels</div>
            <div className="mt-2 text-xs text-slate-500">
              {metaverseStats.totalLand * 100} sq meters total
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Brain className="text-purple-400" size={24} />
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {metaverseStats.totalAINodes.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">AI Consensus Nodes</div>
            <div className="mt-2 text-xs text-slate-500">
              {metaverseStats.totalStakingRewards.toFixed(2)} DSH/day rewards
            </div>
          </div>
        </div>

        {/* Manual Optimization Submission */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="text-blue-400" />
            Submit Manual Optimization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="https://example.com"
              value={newOptimization.url}
              onChange={(e) => setNewOptimization({ ...newOptimization, url: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Space saved (bytes)"
              value={newOptimization.spaceSavedBytes}
              onChange={(e) => setNewOptimization({ ...newOptimization, spaceSavedBytes: parseInt(e.target.value) || 0 })}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            />
            <select
              value={newOptimization.optimizationType}
              onChange={(e) => setNewOptimization({ ...newOptimization, optimizationType: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="light-dom">Light DOM</option>
              <option value="css-optimization">CSS Optimization</option>
              <option value="js-optimization">JS Optimization</option>
              <option value="ai-optimization">AI Optimization</option>
            </select>
            <select
              value={newOptimization.biomeType}
              onChange={(e) => setNewOptimization({ ...newOptimization, biomeType: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="digital">Digital</option>
              <option value="commercial">Commercial</option>
              <option value="knowledge">Knowledge</option>
              <option value="professional">Professional</option>
              <option value="social">Social</option>
              <option value="community">Community</option>
            </select>
          </div>
          <button
            onClick={submitOptimization}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all duration-200"
          >
            Submit Optimization
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recent Optimizations */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Recent Optimizations
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {optimizations.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No optimizations yet</p>
                </div>
              ) : (
                optimizations.map(opt => (
                  <div key={opt.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold flex items-center gap-2">
                          {getBiomeEmoji(opt.biomeType)} {opt.url}
                        </span>
                        <div className="text-sm text-slate-400">{opt.optimizationType}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-slate-600 text-green-400">
                        {opt.qualityScore}% quality
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <span className="text-blue-400">💾 {opt.spaceSavedKB} KB saved</span>
                      <span className="text-yellow-400">💰 {opt.tokensEarned.toFixed(4)} DSH</span>
                      <span className="text-purple-400">🏗️ {opt.metaverseAssets} assets</span>
                      <span className="text-orange-400">⭐ {opt.qualityScore}% quality</span>
                    </div>
                    
                    <div className="flex justify-between text-sm border-t border-slate-600 pt-2">
                      <span className="text-slate-400">{formatAddress(opt.harvesterAddress)}</span>
                      <span className="text-slate-400">{new Date(opt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Harvesters */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-yellow-400" />
              Top Harvesters
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {harvesters.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Award size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No harvesters yet</p>
                </div>
              ) : (
                harvesters.map((harvester, index) => (
                  <div key={harvester.address} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">#{index + 1} {formatAddress(harvester.address)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400" size={16} />
                        <span className="text-yellow-400 font-bold">{harvester.reputation}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <span className="text-blue-400">💾 {Math.floor(harvester.totalSpaceHarvested / 1024)} KB</span>
                      <span className="text-yellow-400">💰 {harvester.totalTokensEarned.toFixed(2)} DSH</span>
                      <span className="text-green-400">🏞️ {harvester.landParcels} land</span>
                      <span className="text-purple-400">🧠 {harvester.aiNodes} AI</span>
                    </div>
                    
                    <div className="text-xs text-slate-400">
                      {harvester.optimizationCount} optimizations • {harvester.stakingRewards.toFixed(2)} DSH staking
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Metaverse Infrastructure */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Network className="text-purple-400" />
              Metaverse Infrastructure
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-semibold flex items-center gap-2">
                    🏞️ Virtual Land
                  </span>
                  <span className="text-2xl font-bold text-green-400">
                    {metaverseStats.totalLand.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-green-300">1 parcel per 100KB optimized</div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 font-semibold flex items-center gap-2">
                    🧠 AI Nodes
                  </span>
                  <span className="text-2xl font-bold text-purple-400">
                    {metaverseStats.totalAINodes.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-purple-300">1 node per 1000KB optimized</div>
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-semibold flex items-center gap-2">
                    💾 Storage Shards
                  </span>
                  <span className="text-2xl font-bold text-blue-400">
                    {metaverseStats.totalStorageShards.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-blue-300">1 shard per 500KB optimized</div>
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-lg p-3 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 font-semibold flex items-center gap-2">
                    🌉 Bridges
                  </span>
                  <span className="text-2xl font-bold text-orange-400">
                    {metaverseStats.totalBridges.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-orange-300">1 bridge per 2000KB optimized</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-400" />
              Optimization Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{optimizations.length}</div>
                <div className="text-slate-400 text-sm">Total Optimizations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {optimizations.length > 0 ? Math.round(optimizations.reduce((sum, opt) => sum + opt.qualityScore, 0) / optimizations.length) : 0}%
                </div>
                <div className="text-slate-400 text-sm">Average Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {optimizations.length > 0 ? Math.round(optimizations.reduce((sum, opt) => sum + opt.spaceSavedKB, 0) / optimizations.length) : 0} KB
                </div>
                <div className="text-slate-400 text-sm">Average Space Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {optimizations.length > 0 ? (optimizations.reduce((sum, opt) => sum + opt.tokensEarned, 0) / optimizations.length).toFixed(4) : 0} DSH
                </div>
                <div className="text-slate-400 text-sm">Average Tokens Earned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceOptimizationDashboard;
