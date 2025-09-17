/**
 * Advanced Node Dashboard - Enhanced UI for node management and storage utilization
 * Provides comprehensive control over optimization nodes and storage allocation
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Zap, 
  Network, 
  Settings, 
  Play, 
  Pause, 
  Plus, 
  Merge, 
  BarChart3,
  TrendingUp,
  Activity,
  Database,
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
  Search
} from 'lucide-react';

interface NodeConfig {
  id: string;
  type: 'ai_consensus' | 'storage_shard' | 'bridge' | 'optimization' | 'mining';
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  storageCapacity: number;
  usedStorage: number;
  availableStorage: number;
  computePower: number;
  rewardRate: number;
  biomeType: string;
  sourceOptimizations: string[];
  createdAt: number;
  lastActivity: number;
  performance: {
    uptime: number;
    efficiency: number;
    tasksCompleted: number;
    rewardsEarned: number;
  };
}

interface OptimizationTask {
  id: string;
  nodeId: string;
  type: 'dom_analysis' | 'css_optimization' | 'js_minification' | 'image_compression' | 'bundle_optimization';
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  spaceSaved: number;
  tokensEarned: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

const AdvancedNodeDashboard: React.FC = () => {
  const [nodes, setNodes] = useState<NodeConfig[]>([]);
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadNodes();
    loadTasks();
    loadSystemStats();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadNodes();
      loadTasks();
      loadSystemStats();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadNodes = async () => {
    try {
      const response = await fetch('/api/nodes/list');
      const data = await response.json();
      if (data.success) {
        setNodes(data.data.nodes);
      }
    } catch (error) {
      console.error('Error loading nodes:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks/list');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/nodes/stats');
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const createNode = async (nodeData: any) => {
    try {
      const response = await fetch('/api/nodes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData)
      });
      
      const data = await response.json();
      if (data.success) {
        setNodes(prev => [data.data.node, ...prev]);
        setShowCreateNode(false);
      }
    } catch (error) {
      console.error('Error creating node:', error);
    }
  };

  const mergeNodes = async () => {
    if (selectedNodes.length < 2) return;
    
    try {
      const response = await fetch('/api/nodes/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeIds: selectedNodes })
      });
      
      const data = await response.json();
      if (data.success) {
        setNodes(prev => prev.filter(node => !selectedNodes.includes(node.id)));
        setNodes(prev => [data.data.node, ...prev]);
        setSelectedNodes([]);
      }
    } catch (error) {
      console.error('Error merging nodes:', error);
    }
  };

  const scaleUpNode = async (nodeId: string, additionalStorage: number) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalStorage })
      });
      
      const data = await response.json();
      if (data.success) {
        loadNodes();
      }
    } catch (error) {
      console.error('Error scaling node:', error);
    }
  };

  const createOptimizationTask = async (nodeId: string, taskType: string, targetUrl: string) => {
    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, type: taskType, targetUrl })
      });
      
      const data = await response.json();
      if (data.success) {
        setTasks(prev => [data.data.task, ...prev]);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const processTasks = async (taskIds: string[]) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/tasks/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds })
      });
      
      const data = await response.json();
      if (data.success) {
        loadTasks();
        loadNodes();
      }
    } catch (error) {
      console.error('Error processing tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNodeTypeIcon = (type: string) => {
    const icons = {
      ai_consensus: <Brain className="text-purple-400" size={16} />,
      storage_shard: <Database className="text-blue-400" size={16} />,
      bridge: <Network className="text-orange-400" size={16} />,
      optimization: <Zap className="text-green-400" size={16} />,
      mining: <HardDrive className="text-yellow-400" size={16} />
    };
    return icons[type as keyof typeof icons] || <Server size={16} />;
  };

  const getNodeTypeColor = (type: string) => {
    const colors = {
      ai_consensus: 'border-purple-500/30 bg-purple-500/10',
      storage_shard: 'border-blue-500/30 bg-blue-500/10',
      bridge: 'border-orange-500/30 bg-orange-500/10',
      optimization: 'border-green-500/30 bg-green-500/10',
      mining: 'border-yellow-500/30 bg-yellow-500/10'
    };
    return colors[type as keyof typeof colors] || 'border-gray-500/30 bg-gray-500/10';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-400',
      idle: 'text-yellow-400',
      maintenance: 'text-orange-400',
      offline: 'text-red-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <CheckCircle size={16} />,
      idle: <Clock size={16} />,
      maintenance: <AlertCircle size={16} />,
      offline: <XCircle size={16} />
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={16} />;
  };

  const filteredNodes = nodes.filter(node => {
    const matchesType = filterType === 'all' || node.type === filterType;
    const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.biomeType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Advanced Node Management
          </h1>
          <p className="text-slate-300 text-lg">Optimize and utilize every 1KB of mined storage</p>
        </div>

        {/* System Statistics */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Server className="text-blue-400" size={24} />
                <span className="text-2xl">🖥️</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {systemStats.totalNodes}
              </div>
              <div className="text-slate-400 text-sm">Total Nodes</div>
              <div className="mt-2 text-xs text-slate-500">
                {systemStats.activeNodes} active
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="text-green-400" size={24} />
                <span className="text-2xl">💾</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {Math.floor(systemStats.totalStorage / 1024)} MB
              </div>
              <div className="text-slate-400 text-sm">Total Storage</div>
              <div className="mt-2 text-xs text-slate-500">
                {systemStats.storageUtilization.toFixed(1)}% utilized
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Cpu className="text-purple-400" size={24} />
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {systemStats.totalComputePower}
              </div>
              <div className="text-slate-400 text-sm">Compute Power</div>
              <div className="mt-2 text-xs text-slate-500">
                {systemStats.totalTasks} tasks completed
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Coins className="text-yellow-400" size={24} />
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {systemStats.dailyRewardsEstimate.toFixed(2)} DSH
              </div>
              <div className="text-slate-400 text-sm">Daily Rewards</div>
              <div className="mt-2 text-xs text-slate-500">
                {systemStats.totalTokensEarned.toFixed(2)} total earned
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowCreateNode(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Node
          </button>
          
          <button
            onClick={() => setShowRecommendations(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Target size={20} />
            Get Recommendations
          </button>
          
          <button
            onClick={mergeNodes}
            disabled={selectedNodes.length < 2}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Merge size={20} />
            Merge Nodes ({selectedNodes.length})
          </button>
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
              <option value="ai_consensus">AI Consensus</option>
              <option value="storage_shard">Storage Shard</option>
              <option value="bridge">Bridge</option>
              <option value="optimization">Optimization</option>
              <option value="mining">Mining</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm w-64"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Nodes List */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Server className="text-blue-400" />
              Optimization Nodes ({filteredNodes.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNodes.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Server size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No nodes found</p>
                </div>
              ) : (
                filteredNodes.map(node => (
                  <div 
                    key={node.id} 
                    className={`bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4 border ${getNodeTypeColor(node.type)} ${
                      selectedNodes.includes(node.id) ? 'ring-2 ring-blue-400' : ''
                    }`}
                    onClick={() => {
                      if (selectedNodes.includes(node.id)) {
                        setSelectedNodes(prev => prev.filter(id => id !== node.id));
                      } else {
                        setSelectedNodes(prev => [...prev, node.id]);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {getNodeTypeIcon(node.type)}
                        <div>
                          <div className="font-semibold capitalize">{node.type.replace('_', ' ')}</div>
                          <div className="text-sm text-slate-400">{node.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <span className={`text-sm ${getStatusColor(node.status)}`}>
                          {node.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-slate-400">Storage:</span>
                        <span className="ml-1 font-mono">
                          {node.usedStorage}/{node.storageCapacity} KB
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Compute:</span>
                        <span className="ml-1 font-mono">{node.computePower}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Efficiency:</span>
                        <span className="ml-1 font-mono">{node.performance.efficiency}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Rewards:</span>
                        <span className="ml-1 font-mono">{node.performance.rewardsEarned.toFixed(2)} DSH</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        {node.performance.tasksCompleted} tasks • {node.biomeType}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scaleUpNode(node.id, 1000);
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                        >
                          Scale Up
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createOptimizationTask(node.id, 'dom_analysis', 'https://example.com');
                          }}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-green-400" />
              Optimization Tasks ({filteredTasks.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tasks found</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold capitalize">{task.type.replace('_', ' ')}</span>
                        <div className="text-sm text-slate-400">{task.targetUrl}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        task.status === 'completed' ? 'bg-green-600' :
                        task.status === 'processing' ? 'bg-blue-600' :
                        task.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}>
                        {task.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <span className="text-blue-400">💾 {task.spaceSaved} KB saved</span>
                      <span className="text-yellow-400">💰 {task.tokensEarned.toFixed(4)} DSH</span>
                      <span className="text-slate-400">Node: {task.nodeId.slice(0, 8)}...</span>
                      <span className="text-slate-400">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {task.error && (
                      <div className="text-xs text-red-400 bg-red-900/20 rounded p-2">
                        Error: {task.error}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Create Node Modal */}
        {showCreateNode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Create New Node</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createNode({
                  type: formData.get('type'),
                  storageCapacity: parseInt(formData.get('storageCapacity') as string),
                  biomeType: formData.get('biomeType')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Node Type</label>
                    <select name="type" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2">
                      <option value="optimization">Optimization</option>
                      <option value="ai_consensus">AI Consensus</option>
                      <option value="storage_shard">Storage Shard</option>
                      <option value="bridge">Bridge</option>
                      <option value="mining">Mining</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Storage Capacity (KB)</label>
                    <input
                      type="number"
                      name="storageCapacity"
                      min="100"
                      max="50000"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Biome Type</label>
                    <select name="biomeType" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2">
                      <option value="digital">Digital</option>
                      <option value="commercial">Commercial</option>
                      <option value="knowledge">Knowledge</option>
                      <option value="professional">Professional</option>
                      <option value="social">Social</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateNode(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                  >
                    Create Node
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedNodeDashboard;
