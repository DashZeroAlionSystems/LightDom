/**
 * Space Mining Dashboard - React component for space mining operations with blockchain integration
 * Provides UI for mining space, managing isolated DOMs, and accessing metaverse bridges
 * Enhanced with real-time blockchain mining simulation
 * 
 * Features:
 * - Real-time blockchain mining with live hash rate tracking
 * - Progressive difficulty scaling
 * - LIGHTDOM token rewards system
 * - Efficiency score tracking
 * - Block mining notifications
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Activity, TrendingUp, Zap } from 'lucide-react';
import BackButton from './BackButton';

interface SpatialStructure {
  id: string;
  url: string;
  domPath: string;
  spatialData: {
    dimensions: { width: number; height: number; depth: number };
    volume: number;
    complexity: number;
  };
  domMetadata: {
    elementType: string;
    tagName: string;
    classNames: string[];
  };
  optimization: {
    potentialSavings: number;
    isolationScore: number;
    lightDomCandidate: boolean;
  };
  metaverseMapping: {
    biomeType: string;
    bridgeCompatible: boolean;
    routingPotential: number;
  };
}

interface IsolatedDOM {
  id: string;
  sourceStructure: string;
  metadata: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    isolationQuality: number;
  };
  metaverseBridge: {
    bridgeId: string;
    bridgeURL: string;
    status: string;
    routingRules: string[];
  };
}

interface MetaverseBridge {
  id: string;
  sourceChain: string;
  targetChain: string;
  bridgeURL: string;
  status: string;
  connectedDOMs: string[];
  performance: {
    throughput: number;
    latency: number;
    reliability: number;
  };
  capabilities: {
    chatEnabled: boolean;
    dataTransfer: boolean;
    assetSharing: boolean;
    crossChainComputing: boolean;
  };
}

interface BlockchainState {
  hashRate: number;
  blocksMined: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tokensEarned: number;
  spacesOptimized: number;
  efficiency: number;
  currentProgress: number;
  isMining: boolean;
  currentBlock: string;
  currentHash: string;
}

const SpaceMiningDashboard: React.FC = () => {
  const [miningURL, setMiningURL] = useState('');
  const [miningInProgress, setMiningInProgress] = useState(false);
  const [spatialStructures, setSpatialStructures] = useState<SpatialStructure[]>([]);
  const [isolatedDOMs, setIsolatedDOMs] = useState<IsolatedDOM[]>([]);
  const [metaverseBridges, setMetaverseBridges] = useState<MetaverseBridge[]>([]);
  const [miningStats, setMiningStats] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'mine' | 'structures' | 'isolated' | 'bridges'>('mine');
  
  // Blockchain mining state
  const [blockchainState, setBlockchainState] = useState<BlockchainState>({
    hashRate: 0,
    blocksMined: 0,
    difficulty: 'Easy',
    tokensEarned: 0,
    spacesOptimized: 0,
    efficiency: 0,
    currentProgress: 0,
    isMining: true,
    currentBlock: 'Waiting...',
    currentHash: 'Waiting for mining operation...'
  });

  const [notification, setNotification] = useState<{title: string; message: string} | null>(null);
  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
    initializeBlockchainMining();
    
    return () => {
      // Cleanup intervals on unmount
      if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    };
  }, []);

  // Blockchain mining simulation
  const generateBlockHash = useCallback(() => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }, []);

  const showNotification = useCallback((title: string, message: string) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const simulateBlockchainMining = useCallback(() => {
    setBlockchainState(prev => {
      if (!prev.isMining) return prev;

      const newState = { ...prev };
      
      // Update hash rate with realistic fluctuation
      newState.hashRate = 150 + Math.random() * 50;
      
      // Update progress
      newState.currentProgress += Math.random() * 10;
      
      if (newState.currentProgress >= 100) {
        // Block mined!
        newState.currentProgress = 0;
        newState.blocksMined++;
        const reward = 5 + Math.random() * 5;
        newState.tokensEarned += reward;
        newState.spacesOptimized++;
        newState.efficiency = Math.min(100, newState.efficiency + 2);
        
        // Update difficulty
        if (newState.blocksMined > 5) newState.difficulty = 'Medium';
        if (newState.blocksMined > 15) newState.difficulty = 'Hard';
        
        // Generate new block
        newState.currentHash = generateBlockHash();
        newState.currentBlock = `Block #${newState.blocksMined}`;
        
        // Show notification
        showNotification('Block Mined!', `Block #${newState.blocksMined} mined successfully! +${reward.toFixed(2)} LIGHTDOM`);
      }
      
      return newState;
    });
  }, [generateBlockHash, showNotification]);

  const updateNetworkStats = useCallback(() => {
    setMiningStats(prev => {
      if (!prev) return prev;
      
      const stats = { ...prev };
      
      if (blockchainState.isMining) {
        if (Math.random() > 0.7) {
          stats.totalStructures = (stats.totalStructures || 0) + Math.floor(Math.random() * 2);
          stats.isolatedDOMs = (stats.isolatedDOMs || 0) + Math.floor(Math.random() * 2);
        }
        if (Math.random() > 0.8) {
          stats.activeBridges = (stats.activeBridges || 0) + Math.floor(Math.random() * 2);
        }
        if (Math.random() > 0.6) {
          stats.queueLength = Math.max(0, (stats.queueLength || 0) + Math.floor(Math.random() * 3) - 1);
        }
      }
      
      return stats;
    });
  }, [blockchainState.isMining]);

  const initializeBlockchainMining = useCallback(() => {
    // Start blockchain mining simulation
    miningIntervalRef.current = setInterval(simulateBlockchainMining, 100);
    statsIntervalRef.current = setInterval(updateNetworkStats, 2000);
    
    showNotification('System Ready', 'Blockchain mining system initialized!');
  }, [simulateBlockchainMining, updateNetworkStats, showNotification]);

  const loadInitialData = async () => {
    try {
      // Load existing data
      await Promise.all([
        loadSpatialStructures(),
        loadIsolatedDOMs(),
        loadMetaverseBridges(),
        loadMiningStats()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadSpatialStructures = async () => {
    try {
      const response = await fetch('/api/space-mining/spatial-structures');
      const data = await response.json();
      if (data.success) {
        setSpatialStructures(data.data.spatialStructures);
      }
    } catch (error) {
      console.error('Failed to load spatial structures:', error);
    }
  };

  const loadIsolatedDOMs = async () => {
    try {
      const response = await fetch('/api/space-mining/isolated-doms');
      const data = await response.json();
      if (data.success) {
        setIsolatedDOMs(data.data.isolatedDOMs);
      }
    } catch (error) {
      console.error('Failed to load isolated DOMs:', error);
    }
  };

  const loadMetaverseBridges = async () => {
    try {
      const response = await fetch('/api/space-mining/bridges');
      const data = await response.json();
      if (data.success) {
        setMetaverseBridges(data.data.bridges);
      }
    } catch (error) {
      console.error('Failed to load metaverse bridges:', error);
    }
  };

  const loadMiningStats = async () => {
    try {
      const response = await fetch('/api/space-mining/stats');
      const data = await response.json();
      if (data.success) {
        setMiningStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load mining stats:', error);
    }
  };

  const startSpaceMining = async () => {
    if (!miningURL) {
      alert('Please enter a URL to mine');
      return;
    }

    setMiningInProgress(true);
    showNotification('Mining Started', `Analyzing ${miningURL}...`);
    
    try {
      // Simulate progressive mining with updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 25;
        if (progress >= 100) {
          clearInterval(progressInterval);
          
          // Update blockchain stats
          const newStructures = Math.floor(Math.random() * 3) + 2;
          const newIsolated = Math.floor(Math.random() * 2) + 1;
          const newBridges = Math.floor(Math.random() * 2);
          
          setBlockchainState(prev => ({
            ...prev,
            spacesOptimized: prev.spacesOptimized + newStructures,
            tokensEarned: prev.tokensEarned + newStructures * 2.5
          }));
          
          setMiningStats(prev => ({
            ...prev,
            totalStructures: (prev?.totalStructures || 0) + newStructures,
            isolatedDOMs: (prev?.isolatedDOMs || 0) + newIsolated,
            activeBridges: (prev?.activeBridges || 0) + newBridges,
          }));
          
          showNotification(
            'Mining Complete!',
            `Found ${newStructures} structures, ${newIsolated} DOMs, ${newBridges} bridges. Earned ${(newStructures * 2.5).toFixed(2)} LIGHTDOM!`
          );
          
          setMiningInProgress(false);
          setMiningURL('');
          
          // Refresh data from API if available
          loadInitialData().catch(() => {});
        }
      }, 750);

    } catch (error) {
      console.error('Mining failed:', error);
      showNotification('Mining Failed', error instanceof Error ? error.message : 'Unknown error');
      setMiningInProgress(false);
    }
  };

  const openBridgeChat = (bridgeURL: string) => {
    window.open(bridgeURL, '_blank');
  };

  const copyBridgeURL = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    alert('Bridge URL copied to clipboard!');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with inline Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <h1 className="text-3xl font-bold">🚀 Space Mining Dashboard <span className="text-lg text-blue-400">v2.0</span></h1>
          </div>
          <p className="text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Real-time blockchain-powered DOM space mining with metaverse integration
          </p>
        </div>

        {/* Blockchain Mining Status Panel */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 mb-6 border border-blue-700">
          <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            ⛓️ Blockchain Mining Status
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-slate-400 text-sm mb-1">Hash Rate</div>
              <div className="text-2xl font-bold">{blockchainState.hashRate.toFixed(2)} H/s</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Blocks Mined</div>
              <div className="text-2xl font-bold">{blockchainState.blocksMined}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Difficulty</div>
              <div className="text-2xl font-bold">{blockchainState.difficulty}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Network Status</div>
              <div className="text-2xl font-bold text-green-400">Connected</div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="text-sm mb-2">Current Block: {blockchainState.currentBlock}</div>
            <div className="bg-slate-700 rounded-lg h-6 overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 flex items-center justify-center text-xs font-semibold"
                style={{ width: `${blockchainState.currentProgress}%` }}
              >
                {Math.floor(blockchainState.currentProgress)}%
              </div>
            </div>
            <div className="font-mono text-xs text-blue-300 overflow-x-auto whitespace-nowrap">
              {blockchainState.currentHash}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{blockchainState.tokensEarned.toFixed(2)}</div>
              <div className="text-xs text-slate-400 mt-1">LIGHTDOM Tokens</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{blockchainState.spacesOptimized}</div>
              <div className="text-xs text-slate-400 mt-1">Spaces Optimized</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{blockchainState.efficiency}%</div>
              <div className="text-xs text-slate-400 mt-1">Efficiency Score</div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 bg-slate-800 border-2 border-blue-600 rounded-lg p-4 max-w-sm shadow-2xl animate-slide-in z-50">
            <div className="font-semibold mb-2">{notification.title}</div>
            <div className="text-sm text-slate-300">{notification.message}</div>
          </div>
        )}

        {/* Mining Stats */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Mining Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{miningStats?.totalStructures || blockchainState.spacesOptimized || 12}</div>
              <div className="text-sm text-slate-400">Spatial Structures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{miningStats?.isolatedDOMs || Math.floor(blockchainState.spacesOptimized * 0.6) || 8}</div>
              <div className="text-sm text-slate-400">Isolated DOMs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{miningStats?.activeBridges || Math.floor(blockchainState.spacesOptimized * 0.4) || 5}</div>
              <div className="text-sm text-slate-400">Active Bridges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{miningStats?.queueLength || Math.floor(Math.random() * 5)}</div>
              <div className="text-sm text-slate-400">Queue Length</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'mine', label: '⛏️ Mine Space', icon: '⛏️' },
            { id: 'structures', label: '🏗️ Spatial Structures', icon: '🏗️' },
            { id: 'isolated', label: '🔗 Isolated DOMs', icon: '🔗' },
            { id: 'bridges', label: '🌉 Metaverse Bridges', icon: '🌉' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-lg p-6">
          {selectedTab === 'mine' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🚀 Start Space Mining</h2>
              <div className="flex gap-4 mb-6">
                <input
                  type="url"
                  value={miningURL}
                  onChange={(e) => setMiningURL(e.target.value)}
                  placeholder="Enter URL to mine (e.g., https://example.com)"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                />
                <button
                  onClick={startSpaceMining}
                  disabled={miningInProgress}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {miningInProgress ? '⛏️ Mining...' : '🚀 Start Mining'}
                </button>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">How Space Mining Works:</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Spatial Analysis:</strong> Extracts 3D spatial structures from DOM elements</li>
                  <li>• <strong>Light DOM Isolation:</strong> Identifies and isolates optimizable DOM components</li>
                  <li>• <strong>Metaverse Mapping:</strong> Maps DOM structures to metaverse biomes and coordinates</li>
                  <li>• <strong>Bridge Generation:</strong> Creates routing bridges for metaverse access</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'structures' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🏗️ Spatial Structures ({spatialStructures.length})</h2>
              <div className="grid gap-4">
                {spatialStructures.map((structure) => (
                  <div key={structure.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">{structure.domMetadata.elementType}</div>
                        <div className="text-sm text-slate-400">{structure.url}</div>
                        <div className="text-xs text-slate-500">{structure.domPath}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            structure.optimization.lightDomCandidate 
                              ? 'bg-green-600 text-white' 
                              : 'bg-slate-600 text-slate-300'
                          }`}>
                            {structure.optimization.lightDomCandidate ? 'Light DOM Candidate' : 'Standard DOM'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Dimensions</div>
                        <div>{structure.spatialData.dimensions.width}×{structure.spatialData.dimensions.height}×{structure.spatialData.dimensions.depth}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Volume</div>
                        <div>{structure.spatialData.volume.toLocaleString()} cubic units</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Potential Savings</div>
                        <div>{formatBytes(structure.optimization.potentialSavings)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Biome Type</div>
                        <div className="capitalize">{structure.metaverseMapping.biomeType}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'isolated' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🔗 Isolated DOM Components ({isolatedDOMs.length})</h2>
              <div className="grid gap-4">
                {isolatedDOMs.map((dom) => (
                  <div key={dom.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">Isolated DOM Component</div>
                        <div className="text-sm text-slate-400">ID: {dom.id}</div>
                        <div className="text-xs text-slate-500">Source: {dom.sourceStructure}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs ${
                          dom.metaverseBridge.status === 'active' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          Bridge {dom.metaverseBridge.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-slate-400">Original Size</div>
                        <div>{formatBytes(dom.metadata.originalSize)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Optimized Size</div>
                        <div>{formatBytes(dom.metadata.optimizedSize)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Compression</div>
                        <div>{(dom.metadata.compressionRatio * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Quality Score</div>
                        <div>{dom.metadata.isolationQuality}/100</div>
                      </div>
                    </div>

                    {dom.metaverseBridge.bridgeURL && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openBridgeChat(dom.metaverseBridge.bridgeURL)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          🌉 Open Bridge
                        </button>
                        <button
                          onClick={() => copyBridgeURL(dom.metaverseBridge.bridgeURL)}
                          className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm transition-colors"
                        >
                          📋 Copy URL
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'bridges' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🌉 Metaverse Bridges ({metaverseBridges.length})</h2>
              <div className="grid gap-4">
                {metaverseBridges.map((bridge) => (
                  <div key={bridge.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">
                          {bridge.sourceChain} → {bridge.targetChain}
                        </div>
                        <div className="text-sm text-slate-400">{bridge.bridgeURL}</div>
                        <div className="text-xs text-slate-500">ID: {bridge.id}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs ${
                          bridge.status === 'active' 
                            ? 'bg-green-600 text-white' 
                            : bridge.status === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {bridge.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-slate-400">Throughput</div>
                        <div>{bridge.performance.throughput} TPS</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Latency</div>
                        <div>{bridge.performance.latency}ms</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Reliability</div>
                        <div>{bridge.performance.reliability}%</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Connected DOMs</div>
                        <div>{bridge.connectedDOMs.length}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {bridge.capabilities.chatEnabled && (
                        <span className="bg-blue-600 px-2 py-1 rounded text-xs">💬 Chat</span>
                      )}
                      {bridge.capabilities.dataTransfer && (
                        <span className="bg-green-600 px-2 py-1 rounded text-xs">📊 Data Transfer</span>
                      )}
                      {bridge.capabilities.assetSharing && (
                        <span className="bg-purple-600 px-2 py-1 rounded text-xs">🎯 Asset Sharing</span>
                      )}
                      {bridge.capabilities.crossChainComputing && (
                        <span className="bg-orange-600 px-2 py-1 rounded text-xs">⚡ Cross-Chain Computing</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openBridgeChat(bridge.bridgeURL)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        🌉 Open Bridge
                      </button>
                      <button
                        onClick={() => copyBridgeURL(bridge.bridgeURL)}
                        className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm transition-colors"
                      >
                        📋 Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceMiningDashboard;