/**
 * Space Optimization Dashboard - Material Design 3 Compliant
 * Comprehensive UI for managing space optimizations with MD3 design system
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
  Star,
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
  totalOptimizations: number;
  totalSpaceSaved: number;
  totalTokensEarned: number;
  biomeSpecialization: string;
  efficiency: number;
}

const SpaceOptimizationDashboardMD3: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSpeed, setOptimizationSpeed] = useState(1);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentOptimization, setCurrentOptimization] = useState<string | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [harvesterStats, setHarvesterStats] = useState<HarvesterStats[]>([]);
  const [metaverseStats, setMetaverseStats] = useState({
    totalSpaceHarvested: 0,
    totalTokensEarned: 0,
    totalMetaverseAssets: 0,
    activeHarvesters: 0,
    averageEfficiency: 0,
  });

  // Simulate optimization process
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOptimizing) {
      interval = setInterval(() => {
        const newOptimization: OptimizationResult = {
          id: Date.now().toString(),
          url: `https://example-${Math.floor(Math.random() * 1000)}.com`,
          spaceSavedKB: Math.floor(Math.random() * 100) + 1,
          tokensEarned: Math.floor(Math.random() * 50) + 1,
          biomeType: ['digital', 'knowledge', 'commercial', 'entertainment', 'social'][
            Math.floor(Math.random() * 5)
          ],
          optimizationType: ['compression', 'minification', 'optimization', 'cleanup'][
            Math.floor(Math.random() * 4)
          ],
          qualityScore: Math.floor(Math.random() * 40) + 60,
          timestamp: Date.now(),
          harvesterAddress: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          metaverseAssets: Math.floor(Math.random() * 10) + 1,
        };

        setOptimizations(prev => [newOptimization, ...prev.slice(0, 99)]);
        setCurrentOptimization(newOptimization.url);

        // Update metaverse stats
        setMetaverseStats(prev => ({
          ...prev,
          totalSpaceHarvested: prev.totalSpaceHarvested + newOptimization.spaceSavedKB,
          totalTokensEarned: prev.totalTokensEarned + newOptimization.tokensEarned,
          totalMetaverseAssets: prev.totalMetaverseAssets + newOptimization.metaverseAssets,
        }));
      }, 2000 / optimizationSpeed);
    }

    return () => clearInterval(interval);
  }, [isOptimizing, optimizationSpeed]);

  const submitOptimization = async () => {
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          optimizationType: 'comprehensive',
        }),
      });

      if (response.ok) {
        console.log('Optimization submitted successfully');
      } else {
        throw new Error('Failed to submit optimization');
      }
    } catch (error) {
      console.error('Error submitting optimization:', error);
      alert('Error submitting optimization');
    }
  };

  const getBiomeEmoji = (biome: string) => {
    const emojis: { [key: string]: string } = {
      digital: '💻',
      knowledge: '📚',
      commercial: '🏢',
      entertainment: '🎬',
      social: '👥',
      community: '🌐',
      professional: '👔',
      production: '🏭',
    };
    return emojis[biome] || '🌍';
  };

  const getAuthorityColor = (authority: string) => {
    const colors: { [key: string]: string } = {
      high: 'text-green-400',
      medium: 'text-yellow-400',
      low: 'text-orange-400',
    };
    return colors[authority] || 'text-gray-400';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      className='min-h-screen md-surface'
      style={{ backgroundColor: 'var(--md-sys-color-background)' }}
    >
      {/* Header */}
      <div className='max-w-7xl mx-auto p-6'>
        <div className='text-center mb-8'>
          <h1 className='md-headline-large' style={{ color: 'var(--md-sys-color-primary)' }}>
            Space Optimization Dashboard
          </h1>
          <p className='md-body-large' style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Track every 1KB of optimized space and its metaverse impact
          </p>
          <div
            className='mt-4 flex justify-center items-center gap-6 text-sm'
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          >
            <span>⚡ Real-time Optimization</span>
            <span>🏗️ Metaverse Building</span>
            <span>💰 Token Rewards</span>
            <span>📊 Analytics</span>
          </div>
        </div>

        {/* Controls */}
        <div className='flex justify-center gap-4 mb-8'>
          <button
            onClick={() => setIsOptimizing(!isOptimizing)}
            className={`md-button md-button-filled md-state-layer ${
              isOptimizing ? 'md-error' : 'md-primary'
            }`}
          >
            {isOptimizing ? <Pause size={20} /> : <Play size={20} />}
            {isOptimizing ? 'Stop Optimization' : 'Start Optimization'}
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className='md-button md-button-filled-tonal md-state-layer'
          >
            <BarChart3 size={20} />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>

          <button
            onClick={() => window.open('/advanced-nodes', '_blank')}
            className='md-button md-button-outlined md-state-layer'
          >
            <Server size={20} />
            Advanced Node Management
          </button>

          <div className='flex items-center gap-2'>
            <Settings size={20} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
            <input
              type='range'
              min='0.5'
              max='4'
              step='0.5'
              value={optimizationSpeed}
              onChange={e => setOptimizationSpeed(parseFloat(e.target.value))}
              className='w-24'
              style={{ accentColor: 'var(--md-sys-color-primary)' }}
            />
            <span
              className='md-body-small'
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              {optimizationSpeed}x Speed
            </span>
          </div>
        </div>

        {/* Current Optimization Status */}
        {isOptimizing && currentOptimization && (
          <div
            className='md-card md-elevation-1 mb-8'
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              borderColor: 'var(--md-sys-color-primary)',
            }}
          >
            <div className='md-card-content'>
              <div className='flex items-center justify-center gap-3'>
                <div
                  className='animate-spin rounded-full h-4 w-4 border-b-2'
                  style={{ borderColor: 'var(--md-sys-color-primary)' }}
                ></div>
                <span className='md-label-large' style={{ color: 'var(--md-sys-color-primary)' }}>
                  Optimizing:
                </span>
                <span
                  className='md-body-large'
                  style={{ color: 'var(--md-sys-color-on-primary-container)' }}
                >
                  {currentOptimization}
                </span>
                <span
                  className='md-body-medium'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  • Building metaverse assets
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='md-card md-elevation-1'>
            <div className='md-card-content'>
              <div className='flex items-center justify-between mb-4'>
                <Database size={24} style={{ color: 'var(--md-sys-color-primary)' }} />
                <span className='text-2xl'>💾</span>
              </div>
              <div className='md-headline-small' style={{ color: 'var(--md-sys-color-primary)' }}>
                {metaverseStats.totalSpaceHarvested.toLocaleString()} KB
              </div>
              <div
                className='md-body-medium'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                Total Space Optimized
              </div>
              <div
                className='mt-2 md-body-small'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {optimizations.length} optimizations completed
              </div>
            </div>
          </div>

          <div className='md-card md-elevation-1'>
            <div className='md-card-content'>
              <div className='flex items-center justify-between mb-4'>
                <Coins size={24} style={{ color: 'var(--md-sys-color-tertiary)' }} />
                <span className='text-2xl'>💰</span>
              </div>
              <div className='md-headline-small' style={{ color: 'var(--md-sys-color-tertiary)' }}>
                {metaverseStats.totalTokensEarned.toLocaleString()} DSH
              </div>
              <div
                className='md-body-medium'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                Total Tokens Earned
              </div>
              <div
                className='mt-2 md-body-small'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {metaverseStats.totalTokensEarned * 0.1} USD estimated
              </div>
            </div>
          </div>

          <div className='md-card md-elevation-1'>
            <div className='md-card-content'>
              <div className='flex items-center justify-between mb-4'>
                <Layers size={24} style={{ color: 'var(--md-sys-color-secondary)' }} />
                <span className='text-2xl'>🏗️</span>
              </div>
              <div className='md-headline-small' style={{ color: 'var(--md-sys-color-secondary)' }}>
                {metaverseStats.totalMetaverseAssets}
              </div>
              <div
                className='md-body-medium'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                Metaverse Assets
              </div>
              <div
                className='mt-2 md-body-small'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {metaverseStats.totalMetaverseAssets * 2} building blocks
              </div>
            </div>
          </div>

          <div className='md-card md-elevation-1'>
            <div className='md-card-content'>
              <div className='flex items-center justify-between mb-4'>
                <Activity size={24} style={{ color: 'var(--md-sys-color-error)' }} />
                <span className='text-2xl'>⚡</span>
              </div>
              <div className='md-headline-small' style={{ color: 'var(--md-sys-color-error)' }}>
                {metaverseStats.averageEfficiency.toFixed(1)}%
              </div>
              <div
                className='md-body-medium'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                Average Efficiency
              </div>
              <div
                className='mt-2 md-body-small'
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {metaverseStats.activeHarvesters} active harvesters
              </div>
            </div>
          </div>
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
                    placeholder='Search optimizations...'
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

        {/* Optimizations List */}
        <div className='md-card md-elevation-1'>
          <div className='md-card-content'>
            <h2 className='md-title-large mb-6' style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Recent Optimizations
            </h2>

            {optimizations.length === 0 ? (
              <div className='text-center py-12'>
                <Database
                  size={48}
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className='mx-auto mb-4'
                />
                <p
                  className='md-body-large'
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                >
                  No optimizations yet. Start optimizing to see results here.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {optimizations
                  .filter(
                    opt =>
                      opt.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      opt.biomeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      opt.optimizationType.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 20)
                  .map(optimization => (
                    <div key={optimization.id} className='md-list-item'>
                      <div className='flex items-center gap-4'>
                        <div className='text-2xl'>{getBiomeEmoji(optimization.biomeType)}</div>
                        <div className='flex-1'>
                          <div className='md-list-item-primary'>{optimization.url}</div>
                          <div className='md-list-item-secondary'>
                            {optimization.optimizationType} • {optimization.biomeType} •{' '}
                            {new Date(optimization.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div
                            className='md-body-large font-medium'
                            style={{ color: 'var(--md-sys-color-primary)' }}
                          >
                            +{optimization.spaceSavedKB} KB
                          </div>
                          <div
                            className='md-body-small'
                            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                          >
                            {optimization.tokensEarned} DSH
                          </div>
                        </div>
                        <div className='text-right'>
                          <div
                            className='md-body-medium'
                            style={{ color: 'var(--md-sys-color-tertiary)' }}
                          >
                            {optimization.metaverseAssets} assets
                          </div>
                          <div
                            className='md-body-small'
                            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                          >
                            {optimization.qualityScore}% quality
                          </div>
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

export default SpaceOptimizationDashboardMD3;
