/**
 * Advanced Node Dashboard - Material Design 3 Compliant
 * Enhanced UI for node management and storage utilization with MD3 design system
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
  Search,
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
  type: string;
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  completedAt?: number;
  result?: {
    spaceSaved: number;
    tokensEarned: number;
    qualityScore: number;
  };
}

const AdvancedNodeDashboardMD3: React.FC = () => {
  const [nodes, setNodes] = useState<NodeConfig[]>([]);
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    totalStorage: 0,
    storageUtilization: 0,
    totalComputePower: 0,
    totalTasks: 0,
    dailyRewardsEstimate: 0,
    totalTokensEarned: 0,
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleNodes: NodeConfig[] = [
      {
        id: '1',
        type: 'ai_consensus',
        status: 'active',
        storageCapacity: 1024 * 1024, // 1GB
        usedStorage: 512 * 1024, // 512MB
        availableStorage: 512 * 1024, // 512MB
        computePower: 100,
        rewardRate: 0.5,
        biomeType: 'digital',
        sourceOptimizations: ['compression', 'minification'],
        createdAt: Date.now() - 86400000,
        lastActivity: Date.now() - 300000,
        performance: {
          uptime: 99.5,
          efficiency: 87.3,
          tasksCompleted: 1247,
          rewardsEarned: 156.7,
        },
      },
      {
        id: '2',
        type: 'storage_shard',
        status: 'active',
        storageCapacity: 2 * 1024 * 1024, // 2GB
        usedStorage: 1.2 * 1024 * 1024, // 1.2GB
        availableStorage: 0.8 * 1024 * 1024, // 800MB
        computePower: 75,
        rewardRate: 0.3,
        biomeType: 'knowledge',
        sourceOptimizations: ['optimization', 'cleanup'],
        createdAt: Date.now() - 172800000,
        lastActivity: Date.now() - 600000,
        performance: {
          uptime: 98.2,
          efficiency: 92.1,
          tasksCompleted: 892,
          rewardsEarned: 98.4,
        },
      },
      {
        id: '3',
        type: 'bridge',
        status: 'maintenance',
        storageCapacity: 512 * 1024, // 512MB
        usedStorage: 256 * 1024, // 256MB
        availableStorage: 256 * 1024, // 256MB
        computePower: 50,
        rewardRate: 0.2,
        biomeType: 'commercial',
        sourceOptimizations: ['bridge', 'sync'],
        createdAt: Date.now() - 259200000,
        lastActivity: Date.now() - 1800000,
        performance: {
          uptime: 95.8,
          efficiency: 78.9,
          tasksCompleted: 456,
          rewardsEarned: 67.2,
        },
      },
    ];

    const sampleTasks: OptimizationTask[] = [
      {
        id: '1',
        nodeId: '1',
        type: 'compression',
        targetUrl: 'https://example.com/page1',
        status: 'processing',
        progress: 65,
        estimatedTime: 120,
        priority: 'high',
        createdAt: Date.now() - 300000,
      },
      {
        id: '2',
        nodeId: '2',
        type: 'minification',
        targetUrl: 'https://example.com/page2',
        status: 'completed',
        progress: 100,
        estimatedTime: 0,
        priority: 'medium',
        createdAt: Date.now() - 600000,
        completedAt: Date.now() - 120000,
        result: {
          spaceSaved: 45,
          tokensEarned: 2.3,
          qualityScore: 89,
        },
      },
      {
        id: '3',
        nodeId: '1',
        type: 'optimization',
        targetUrl: 'https://example.com/page3',
        status: 'pending',
        progress: 0,
        estimatedTime: 180,
        priority: 'low',
        createdAt: Date.now() - 900000,
      },
    ];

    setNodes(sampleNodes);
    setTasks(sampleTasks);

    // Calculate system stats
    const totalStorage = sampleNodes.reduce((sum, node) => sum + node.storageCapacity, 0);
    const usedStorage = sampleNodes.reduce((sum, node) => sum + node.usedStorage, 0);
    const activeNodes = sampleNodes.filter(node => node.status === 'active').length;
    const totalComputePower = sampleNodes.reduce((sum, node) => sum + node.computePower, 0);
    const totalTasks = sampleNodes.reduce((sum, node) => sum + node.performance.tasksCompleted, 0);
    const totalTokensEarned = sampleNodes.reduce(
      (sum, node) => sum + node.performance.rewardsEarned,
      0
    );

    setSystemStats({
      totalNodes: sampleNodes.length,
      activeNodes,
      totalStorage,
      storageUtilization: (usedStorage / totalStorage) * 100,
      totalComputePower,
      totalTasks,
      dailyRewardsEstimate: totalTokensEarned * 0.1,
      totalTokensEarned,
    });
  }, []);

  const getNodeTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      ai_consensus: <Brain size={20} />,
      storage_shard: <HardDrive size={20} />,
      bridge: <Bridge size={20} />,
      optimization: <Zap size={20} />,
      mining: <Coins size={20} />,
    };
    return icons[type] || <Server size={20} />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'var(--md-sys-color-primary)',
      idle: 'var(--md-sys-color-tertiary)',
      maintenance: 'var(--md-sys-color-error)',
      offline: 'var(--md-sys-color-on-surface-variant)',
    };
    return colors[status] || 'var(--md-sys-color-on-surface-variant)';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: 'var(--md-sys-color-error)',
      medium: 'var(--md-sys-color-tertiary)',
      low: 'var(--md-sys-color-primary)',
    };
    return colors[priority] || 'var(--md-sys-color-on-surface-variant)';
  };

  const mergeNodes = () => {
    if (selectedNodes.length < 2) return;

    // Simulate node merging
    console.log('Merging nodes:', selectedNodes);
    setSelectedNodes([]);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--md-sys-color-background)' }}>
      {/* Header */}
      <div className='max-w-7xl mx-auto p-6'>
        <div className='text-center mb-8'>
          <h1 className='md-headline-large' style={{ color: 'var(--md-sys-color-primary)' }}>
            Advanced Node Management
          </h1>
          <p className='md-body-large' style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Optimize and utilize every 1KB of mined storage
          </p>
        </div>

        {/* System Statistics */}
        {systemStats && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='md-card md-elevation-1'>
              <div className='md-card-content'>
                <div className='flex items-center justify-between mb-4'>
                  <Server size={24} style={{ color: 'var(--md-sys-color-primary)' }} />
                  <span className='text-2xl'>🖥️</span>
                </div>
                <div className='md-headline-small' style={{ color: 'var(--md-sys-color-primary)' }}>
                  {systemStats.totalNodes}
                </div>
                <div
                  className='md-body-medium'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  Total Nodes
                </div>
                <div
                  className='mt-2 md-body-small'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  {systemStats.activeNodes} active
                </div>
              </div>
            </div>

            <div className='md-card md-elevation-1'>
              <div className='md-card-content'>
                <div className='flex items-center justify-between mb-4'>
                  <HardDrive size={24} style={{ color: 'var(--md-sys-color-secondary)' }} />
                  <span className='text-2xl'>💾</span>
                </div>
                <div
                  className='md-headline-small'
                  style={{ color: 'var(--md-sys-color-secondary)' }}
                >
                  {Math.floor(systemStats.totalStorage / 1024)} MB
                </div>
                <div
                  className='md-body-medium'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  Total Storage
                </div>
                <div
                  className='mt-2 md-body-small'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  {systemStats.storageUtilization.toFixed(1)}% utilized
                </div>
              </div>
            </div>

            <div className='md-card md-elevation-1'>
              <div className='md-card-content'>
                <div className='flex items-center justify-between mb-4'>
                  <Cpu size={24} style={{ color: 'var(--md-sys-color-tertiary)' }} />
                  <span className='text-2xl'>⚡</span>
                </div>
                <div
                  className='md-headline-small'
                  style={{ color: 'var(--md-sys-color-tertiary)' }}
                >
                  {systemStats.totalComputePower}
                </div>
                <div
                  className='md-body-medium'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  Compute Power
                </div>
                <div
                  className='mt-2 md-body-small'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  {systemStats.totalTasks} tasks completed
                </div>
              </div>
            </div>

            <div className='md-card md-elevation-1'>
              <div className='md-card-content'>
                <div className='flex items-center justify-between mb-4'>
                  <Coins size={24} style={{ color: 'var(--md-sys-color-error)' }} />
                  <span className='text-2xl'>💰</span>
                </div>
                <div className='md-headline-small' style={{ color: 'var(--md-sys-color-error)' }}>
                  {systemStats.dailyRewardsEstimate.toFixed(2)} DSH
                </div>
                <div
                  className='md-body-medium'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  Daily Rewards
                </div>
                <div
                  className='mt-2 md-body-small'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  {systemStats.totalTokensEarned.toFixed(2)} total earned
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className='flex justify-center gap-4 mb-8'>
          <button
            onClick={() => setShowCreateNode(true)}
            className='md-button md-button-filled md-state-layer'
          >
            <Plus size={20} />
            Create Node
          </button>

          <button
            onClick={() => setShowRecommendations(true)}
            className='md-button md-button-filled-tonal md-state-layer'
          >
            <Target size={20} />
            Get Recommendations
          </button>

          <button
            onClick={mergeNodes}
            disabled={selectedNodes.length < 2}
            className='md-button md-button-outlined md-state-layer'
            style={{
              opacity: selectedNodes.length < 2 ? 0.5 : 1,
              cursor: selectedNodes.length < 2 ? 'not-allowed' : 'pointer',
            }}
          >
            <Merge size={20} />
            Merge Nodes ({selectedNodes.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className='md-card md-elevation-1 mb-8'>
          <div className='md-card-content'>
            <div className='flex flex-col md:flex-row gap-4 items-center'>
              <div className='md-input flex-1'>
                <div className='md-input-field'>
                  <Search size={20} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
                  <input
                    type='text'
                    placeholder='Search nodes and tasks...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <button className='md-button md-button-outlined md-state-layer'>
                <Filter size={20} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className='md-card md-elevation-1 mb-8'>
          <div className='md-card-content'>
            <h2 className='md-title-large mb-6' style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Node Configuration
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`md-card md-elevation-1 cursor-pointer transition-all ${
                    selectedNodes.includes(node.id) ? 'ring-2' : ''
                  }`}
                  style={{
                    ringColor: selectedNodes.includes(node.id)
                      ? 'var(--md-sys-color-primary)'
                      : 'transparent',
                  }}
                  onClick={() => {
                    if (selectedNodes.includes(node.id)) {
                      setSelectedNodes(selectedNodes.filter(id => id !== node.id));
                    } else {
                      setSelectedNodes([...selectedNodes, node.id]);
                    }
                  }}
                >
                  <div className='md-card-content'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        {getNodeTypeIcon(node.type)}
                        <div>
                          <div
                            className='md-title-medium'
                            style={{ color: 'var(--md-sys-color-on-surface)' }}
                          >
                            {node.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div
                            className='md-body-small'
                            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                          >
                            {node.biomeType}
                          </div>
                        </div>
                      </div>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: getStatusColor(node.status) }}
                      />
                    </div>

                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        >
                          Storage
                        </span>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface)' }}
                        >
                          {Math.floor(node.usedStorage / 1024)}MB /{' '}
                          {Math.floor(node.storageCapacity / 1024)}MB
                        </span>
                      </div>

                      <div className='md-progress-linear'>
                        <div
                          className='md-progress-linear-bar'
                          style={{
                            width: `${(node.usedStorage / node.storageCapacity) * 100}%`,
                            backgroundColor: 'var(--md-sys-color-primary)',
                          }}
                        />
                      </div>

                      <div className='flex justify-between items-center'>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        >
                          Compute Power
                        </span>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface)' }}
                        >
                          {node.computePower}
                        </span>
                      </div>

                      <div className='flex justify-between items-center'>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        >
                          Efficiency
                        </span>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface)' }}
                        >
                          {node.performance.efficiency.toFixed(1)}%
                        </span>
                      </div>

                      <div className='flex justify-between items-center'>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        >
                          Rewards Earned
                        </span>
                        <span
                          className='md-body-medium'
                          style={{ color: 'var(--md-sys-color-tertiary)' }}
                        >
                          {node.performance.rewardsEarned.toFixed(2)} DSH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className='md-card md-elevation-1'>
          <div className='md-card-content'>
            <h2 className='md-title-large mb-6' style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Active Tasks
            </h2>

            {filteredTasks.length === 0 ? (
              <div className='text-center py-12'>
                <Activity
                  size={48}
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className='mx-auto mb-4'
                />
                <p
                  className='md-body-large'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  No tasks found. Create a node to start processing tasks.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredTasks.map(task => (
                  <div key={task.id} className='md-list-item'>
                    <div className='flex items-center gap-4'>
                      <div style={{ color: getPriorityColor(task.priority) }}>
                        {getNodeTypeIcon('optimization')}
                      </div>
                      <div className='flex-1'>
                        <div className='md-list-item-primary'>{task.targetUrl}</div>
                        <div className='md-list-item-secondary'>
                          {task.type} • Priority: {task.priority} • Node: {task.nodeId}
                        </div>
                        {task.status === 'processing' && (
                          <div className='mt-2'>
                            <div className='md-progress-linear'>
                              <div
                                className='md-progress-linear-bar'
                                style={{
                                  width: `${task.progress}%`,
                                  backgroundColor: 'var(--md-sys-color-primary)',
                                }}
                              />
                            </div>
                            <div className='flex justify-between mt-1'>
                              <span
                                className='md-body-small'
                                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                              >
                                {task.progress}% complete
                              </span>
                              <span
                                className='md-body-small'
                                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                              >
                                {task.estimatedTime}s remaining
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className='text-right'>
                        <div
                          className='md-body-medium'
                          style={{ color: getStatusColor(task.status) }}
                        >
                          {task.status.toUpperCase()}
                        </div>
                        {task.result && (
                          <div
                            className='md-body-small'
                            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                          >
                            +{task.result.spaceSaved}KB saved
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedNodeDashboardMD3;
