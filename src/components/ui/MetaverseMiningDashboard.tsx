/**
 * Metaverse Mining Dashboard - Visual interface for the continuous mining system
 * Shows algorithm discovery, data mining, and blockchain upgrades in real-time
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Database, 
  Zap, 
  Network, 
  Search, 
  Play, 
  Pause, 
  Settings, 
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Target,
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Maximize,
  Minimize,
  RotateCcw,
  Filter,
  Search as SearchIcon,
  Cpu,
  HardDrive,
  Globe,
  Star,
  Award,
  Rocket,
  Shield,
  Gauge
} from 'lucide-react';

interface AlgorithmDiscovery {
  id: string;
  name: string;
  type: string;
  version: string;
  performance: {
    speedMultiplier: number;
    efficiency: number;
    spaceSaved: number;
    successRate: number;
  };
  source: {
    minedFrom: string;
    biomeType: string;
    authority: number;
    discoveryTime: number;
  };
  implementation: {
    code: string;
    dependencies: string[];
    complexity: number;
    gasCost: number;
  };
  rewards: {
    discoveryReward: number;
    performanceReward: number;
    upgradeReward: number;
  };
  status: string;
  validationResults: {
    testsPassed: number;
    totalTests: number;
    performanceGain: number;
    compatibilityScore: number;
  };
}

interface DataMiningResult {
  id: string;
  type: string;
  data: any;
  source: {
    url: string;
    domain: string;
    biomeType: string;
    authority: number;
  };
  value: {
    utility: number;
    rarity: number;
    upgradePotential: number;
  };
  extraction: {
    method: string;
    confidence: number;
    timestamp: number;
  };
  rewards: {
    extractionReward: number;
    utilityReward: number;
    upgradeReward: number;
  };
}

interface BlockchainUpgrade {
  id: string;
  type: string;
  version: string;
  description: string;
  source: {
    algorithms: string[];
    dataMining: string[];
    totalValue: number;
  };
  implementation: {
    smartContract: string;
    gasOptimization: number;
    performanceGain: number;
  };
  deployment: {
    status: string;
    testResults: any;
    deploymentCost: number;
    estimatedSavings: number;
  };
  rewards: {
    upgradeReward: number;
    performanceReward: number;
    adoptionReward: number;
  };
}

interface MetaverseBiome {
  id: string;
  name: string;
  type: string;
  characteristics: {
    algorithmDiscoveryRate: number;
    dataMiningEfficiency: number;
    optimizationPotential: number;
    authority: number;
  };
  resources: {
    totalSpace: number;
    usedSpace: number;
    availableSpace: number;
    miningPower: number;
  };
  discoveries: {
    algorithms: string[];
    dataMining: string[];
    upgrades: string[];
  };
}

const MetaverseMiningDashboard: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<AlgorithmDiscovery[]>([]);
  const [dataMining, setDataMining] = useState<DataMiningResult[]>([]);
  const [upgrades, setUpgrades] = useState<BlockchainUpgrade[]>([]);
  const [biomes, setBiomes] = useState<MetaverseBiome[]>([]);
  const [miningStats, setMiningStats] = useState<any>(null);
  const [isMining, setIsMining] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'algorithms' | 'data' | 'upgrades' | 'biomes'>('algorithms');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadMiningData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadMiningData();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadMiningData = async () => {
    try {
      const response = await fetch('/api/metaverse/mining-data');
      const data = await response.json();
      if (data.success) {
        setAlgorithms(data.data.algorithms);
        setDataMining(data.data.dataMining);
        setUpgrades(data.data.upgrades);
        setBiomes(data.data.biomes);
        setMiningStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading mining data:', error);
    }
  };

  const toggleMining = async () => {
    try {
      const response = await fetch('/api/metaverse/toggle-mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMining: !isMining })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsMining(!isMining);
      }
    } catch (error) {
      console.error('Error toggling mining:', error);
    }
  };

  const getAlgorithmTypeIcon = (type: string) => {
    const icons = {
      dom_optimization: <Layers className="text-blue-400" size={16} />,
      css_compression: <Zap className="text-green-400" size={16} />,
      js_minification: <Cpu className="text-purple-400" size={16} />,
      image_optimization: <HardDrive className="text-orange-400" size={16} />,
      bundle_optimization: <Network className="text-pink-400" size={16} />,
      network_optimization: <Globe className="text-cyan-400" size={16} />
    };
    return icons[type as keyof typeof icons] || <Brain size={16} />;
  };

  const getAlgorithmTypeColor = (type: string) => {
    const colors = {
      dom_optimization: 'border-blue-500/30 bg-blue-500/10',
      css_compression: 'border-green-500/30 bg-green-500/10',
      js_minification: 'border-purple-500/30 bg-purple-500/10',
      image_optimization: 'border-orange-500/30 bg-orange-500/10',
      bundle_optimization: 'border-pink-500/30 bg-pink-500/10',
      network_optimization: 'border-cyan-500/30 bg-cyan-500/10'
    };
    return colors[type as keyof typeof colors] || 'border-gray-500/30 bg-gray-500/10';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      discovered: 'text-yellow-400',
      testing: 'text-blue-400',
      validated: 'text-green-400',
      deployed: 'text-purple-400',
      upgraded: 'text-pink-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      discovered: <Star size={16} />,
      testing: <Clock size={16} />,
      validated: <CheckCircle size={16} />,
      deployed: <Rocket size={16} />,
      upgraded: <Award size={16} />
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={16} />;
  };

  const getDataMiningTypeIcon = (type: string) => {
    const icons = {
      pattern: <Layers className="text-blue-400" size={16} />,
      heuristic: <Brain className="text-green-400" size={16} />,
      rule: <Shield className="text-purple-400" size={16} />,
      template: <Database className="text-orange-400" size={16} />,
      optimization_hint: <Target className="text-pink-400" size={16} />
    };
    return icons[type as keyof typeof icons] || <Search size={16} />;
  };

  const filteredAlgorithms = algorithms.filter(algorithm => {
    const matchesType = filterType === 'all' || algorithm.type === filterType;
    const matchesStatus = filterStatus === 'all' || algorithm.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      algorithm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algorithm.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const filteredDataMining = dataMining.filter(data => {
    const matchesType = filterType === 'all' || data.type === filterType;
    const matchesSearch = searchQuery === '' || 
      data.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.source.domain.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const filteredUpgrades = upgrades.filter(upgrade => {
    const matchesType = filterType === 'all' || upgrade.type === filterType;
    const matchesStatus = filterStatus === 'all' || upgrade.deployment.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      upgrade.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upgrade.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Metaverse Mining Engine
          </h1>
          <p className="text-slate-300 text-lg">Continuous algorithm discovery and blockchain upgrade system</p>
        </div>

        {/* Mining Statistics */}
        {miningStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Brain className="text-blue-400" size={24} />
                <span className="text-2xl">🧠</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {miningStats.algorithms.total}
              </div>
              <div className="text-slate-400 text-sm">Algorithms Discovered</div>
              <div className="mt-2 text-xs text-slate-500">
                {miningStats.algorithms.validated} validated
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Database className="text-green-400" size={24} />
                <span className="text-2xl">💾</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {miningStats.dataMining.total}
              </div>
              <div className="text-slate-400 text-sm">Data Points Mined</div>
              <div className="mt-2 text-xs text-slate-500">
                {miningStats.dataMining.patterns} patterns
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Rocket className="text-purple-400" size={24} />
                <span className="text-2xl">🚀</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {miningStats.upgrades.total}
              </div>
              <div className="text-slate-400 text-sm">Blockchain Upgrades</div>
              <div className="mt-2 text-xs text-slate-500">
                {miningStats.upgrades.active} active
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Coins className="text-yellow-400" size={24} />
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {miningStats.mining.totalRewards.toFixed(0)} DSH
              </div>
              <div className="text-slate-400 text-sm">Total Rewards</div>
              <div className="mt-2 text-xs text-slate-500">
                {miningStats.mining.queueLength} in queue
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleMining}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              isMining ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isMining ? <Pause size={20} /> : <Play size={20} />}
            {isMining ? 'Stop Mining' : 'Start Mining'}
          </button>
          
          <button
            onClick={loadMiningData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'algorithms', label: 'Algorithms', icon: <Brain size={16} /> },
            { id: 'data', label: 'Data Mining', icon: <Database size={16} /> },
            { id: 'upgrades', label: 'Upgrades', icon: <Rocket size={16} /> },
            { id: 'biomes', label: 'Biomes', icon: <Globe size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                selectedTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              {selectedTab === 'algorithms' && (
                <>
                  <option value="dom_optimization">DOM Optimization</option>
                  <option value="css_compression">CSS Compression</option>
                  <option value="js_minification">JS Minification</option>
                  <option value="image_optimization">Image Optimization</option>
                  <option value="bundle_optimization">Bundle Optimization</option>
                </>
              )}
              {selectedTab === 'data' && (
                <>
                  <option value="pattern">Pattern</option>
                  <option value="heuristic">Heuristic</option>
                  <option value="rule">Rule</option>
                  <option value="template">Template</option>
                  <option value="optimization_hint">Optimization Hint</option>
                </>
              )}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="discovered">Discovered</option>
              <option value="testing">Testing</option>
              <option value="validated">Validated</option>
              <option value="deployed">Deployed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <SearchIcon size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm w-64"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          {selectedTab === 'algorithms' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="text-blue-400" />
                Discovered Algorithms ({filteredAlgorithms.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAlgorithms.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Brain size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No algorithms found</p>
                  </div>
                ) : (
                  filteredAlgorithms.map(algorithm => (
                    <div 
                      key={algorithm.id} 
                      className={`bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4 border ${getAlgorithmTypeColor(algorithm.type)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {getAlgorithmTypeIcon(algorithm.type)}
                          <div>
                            <div className="font-semibold">{algorithm.name}</div>
                            <div className="text-sm text-slate-400 capitalize">{algorithm.type.replace('_', ' ')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(algorithm.status)}
                          <span className={`text-sm ${getStatusColor(algorithm.status)}`}>
                            {algorithm.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-slate-400">Speed:</span>
                          <span className="ml-1 font-mono">{algorithm.performance.speedMultiplier.toFixed(1)}x</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Efficiency:</span>
                          <span className="ml-1 font-mono">{algorithm.performance.efficiency}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Space Saved:</span>
                          <span className="ml-1 font-mono">{algorithm.performance.spaceSaved} KB</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Success Rate:</span>
                          <span className="ml-1 font-mono">{algorithm.performance.successRate}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          {algorithm.source.biomeType} • {algorithm.source.authority}% authority
                        </span>
                        <div className="flex gap-2">
                          <span className="text-yellow-400">
                            {algorithm.rewards.discoveryReward} DSH
                          </span>
                          <button
                            onClick={() => setShowDetails(showDetails === algorithm.id ? null : algorithm.id)}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                          >
                            {showDetails === algorithm.id ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </div>
                      
                      {showDetails === algorithm.id && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-600">
                          <div className="text-sm">
                            <div className="mb-2">
                              <span className="text-slate-400">Dependencies:</span>
                              <span className="ml-2">{algorithm.implementation.dependencies.join(', ')}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-slate-400">Complexity:</span>
                              <span className="ml-2">{algorithm.implementation.complexity}/10</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-slate-400">Gas Cost:</span>
                              <span className="ml-2">{algorithm.implementation.gasCost}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-slate-400">Tests:</span>
                              <span className="ml-2">{algorithm.validationResults.testsPassed}/{algorithm.validationResults.totalTests}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === 'data' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="text-green-400" />
                Data Mining Results ({filteredDataMining.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredDataMining.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No data mining results found</p>
                  </div>
                ) : (
                  filteredDataMining.map(data => (
                    <div key={data.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          {getDataMiningTypeIcon(data.type)}
                          <div>
                            <span className="font-semibold capitalize">{data.type.replace('_', ' ')}</span>
                            <div className="text-sm text-slate-400">{data.source.domain}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(data.extraction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <span className="text-blue-400">🔧 {data.value.utility}% utility</span>
                        <span className="text-purple-400">💎 {data.value.rarity}% rarity</span>
                        <span className="text-green-400">🚀 {data.value.upgradePotential}% upgrade</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          {data.extraction.method} • {data.extraction.confidence}% confidence
                        </span>
                        <span className="text-yellow-400">
                          {data.rewards.extractionReward} DSH
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === 'upgrades' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Rocket className="text-purple-400" />
                Blockchain Upgrades ({filteredUpgrades.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUpgrades.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Rocket size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No blockchain upgrades found</p>
                  </div>
                ) : (
                  filteredUpgrades.map(upgrade => (
                    <div key={upgrade.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{upgrade.type} {upgrade.version}</div>
                          <div className="text-sm text-slate-400">{upgrade.description}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          upgrade.deployment.status === 'active' ? 'bg-green-600' :
                          upgrade.deployment.status === 'deployed' ? 'bg-blue-600' :
                          upgrade.deployment.status === 'testing' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {upgrade.deployment.status}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-slate-400">Gas Optimization:</span>
                          <span className="ml-1 font-mono">{upgrade.implementation.gasOptimization}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Performance Gain:</span>
                          <span className="ml-1 font-mono">{upgrade.implementation.performanceGain}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Algorithms:</span>
                          <span className="ml-1 font-mono">{upgrade.source.algorithms.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Deployment Cost:</span>
                          <span className="ml-1 font-mono">{upgrade.deployment.deploymentCost} DSH</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          Est. Savings: {upgrade.deployment.estimatedSavings} DSH
                        </span>
                        <span className="text-yellow-400">
                          {upgrade.rewards.upgradeReward} DSH reward
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === 'biomes' && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="text-cyan-400" />
                Metaverse Biomes ({biomes.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {biomes.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No biomes found</p>
                  </div>
                ) : (
                  biomes.map(biome => (
                    <div key={biome.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{biome.name}</div>
                          <div className="text-sm text-slate-400 capitalize">{biome.type}</div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {biome.characteristics.authority}% authority
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-slate-400">Discovery Rate:</span>
                          <span className="ml-1 font-mono">{biome.characteristics.algorithmDiscoveryRate}/hr</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Mining Efficiency:</span>
                          <span className="ml-1 font-mono">{biome.characteristics.dataMiningEfficiency}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Optimization Potential:</span>
                          <span className="ml-1 font-mono">{biome.characteristics.optimizationPotential}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Mining Power:</span>
                          <span className="ml-1 font-mono">{biome.resources.miningPower}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          {biome.resources.usedSpace}/{biome.resources.totalSpace} KB used
                        </span>
                        <span className="text-slate-500">
                          {biome.discoveries.algorithms.length} algorithms, {biome.discoveries.dataMining.length} data points
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaverseMiningDashboard;
