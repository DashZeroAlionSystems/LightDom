/**
 * SEO AI Model Marketplace
 * Buy, sell, and use trained SEO models from collective intelligence
 * Contributors earn from model usage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  ShoppingCart,
  TrendingUp,
  Users,
  Database,
  Zap,
  Award,
  BarChart3,
  Download,
  Upload,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Code,
  Globe,
  Cpu,
  GitBranch,
  Activity,
  Target,
  Coins,
  Share2
} from 'lucide-react';
import { useBlockchain } from '../hooks/useBlockchain';
import { ethers } from 'ethers';

interface SEOModel {
  id: number;
  name: string;
  version: string;
  accuracy: number; // NDCG score * 100
  trainedOnDataPoints: number;
  pricePerQuery: string; // in DSH
  totalRevenue: string;
  contributors: number;
  queries: number;
  lastUpdated: Date;
  features: number; // How many of 194 features it uses
  specialization: string; // e.g., "E-commerce", "Local SEO", "Content Sites"
  performance: {
    avgPredictionTime: number; // ms
    successRate: number; // %
    userRating: number; // 1-5
  };
}

interface ModelContribution {
  modelId: number;
  sharePercentage: number;
  dataPointsContributed: number;
  earningsToDate: string;
  lastPayout: Date;
}

interface MiningStats {
  totalContributions: number;
  totalRewards: string;
  uniqueUrls: number;
  averageQuality: number;
  featuresContributed: number[];
  modelsParticipating: number;
}

export const SEOModelMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-models' | 'mining' | 'analytics'>('marketplace');
  const [models, setModels] = useState<SEOModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<SEOModel | null>(null);
  const [userContributions, setUserContributions] = useState<ModelContribution[]>([]);
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [miningEnabled, setMiningEnabled] = useState(false);
  
  const { account, contract, isConnected } = useBlockchain();

  // Load marketplace data
  useEffect(() => {
    if (isConnected) {
      loadMarketplaceData();
    }
  }, [isConnected]);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // Load available models
      const modelData = await contract.getActiveModels();
      const formattedModels: SEOModel[] = modelData.map((m: any) => ({
        id: m.id.toNumber(),
        name: m.name,
        version: m.version,
        accuracy: m.accuracy.toNumber(),
        trainedOnDataPoints: m.trainedOnDataPoints.toNumber(),
        pricePerQuery: ethers.utils.formatEther(m.pricePerQuery),
        totalRevenue: ethers.utils.formatEther(m.totalRevenue),
        contributors: m.contributors.length,
        queries: m.queries.toNumber(),
        lastUpdated: new Date(m.lastUpdated.toNumber() * 1000),
        features: calculateFeatureCount(m.featuresUsed),
        specialization: m.specialization || 'General',
        performance: {
          avgPredictionTime: 150 + Math.random() * 100,
          successRate: 85 + Math.random() * 10,
          userRating: 4 + Math.random()
        }
      }));
      
      setModels(formattedModels);
      
      // Load user's contributions
      const contributions = await contract.getUserContributions(account);
      setUserContributions(contributions);
      
      // Load mining stats
      const stats = await contract.getUserMiningStats(account);
      setMiningStats({
        totalContributions: stats.totalContributions.toNumber(),
        totalRewards: ethers.utils.formatEther(stats.totalRewards),
        uniqueUrls: stats.uniqueUrls.toNumber(),
        averageQuality: stats.averageQuality.toNumber(),
        featuresContributed: stats.featuresContributed,
        modelsParticipating: stats.modelsParticipating.toNumber()
      });
      
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeatureCount = (featureBitmap: any): number => {
    // Count set bits in the bitmap
    let count = 0;
    let bitmap = BigInt(featureBitmap.toString());
    while (bitmap > 0n) {
      if (bitmap & 1n) count++;
      bitmap >>= 1n;
    }
    return count;
  };

  // Query a model
  const queryModel = async (modelId: number) => {
    try {
      const model = models.find(m => m.id === modelId);
      if (!model) return;
      
      // Approve DSH tokens
      const price = ethers.utils.parseEther(model.pricePerQuery);
      await contract.approve(contract.address, price);
      
      // Query the model
      const tx = await contract.queryModel(modelId);
      await tx.wait();
      
      // Show usage instructions
      alert(`Model queried successfully! Use the API endpoint: https://api.lightdom.ai/model/${modelId}/predict`);
      
    } catch (error) {
      console.error('Failed to query model:', error);
    }
  };

  // Enable mining
  const toggleMining = () => {
    setMiningEnabled(!miningEnabled);
    if (!miningEnabled) {
      // Inject mining script
      const script = document.createElement('script');
      script.src = '/lightdom-seo-injector.js';
      script.setAttribute('data-api-key', 'user-api-key');
      script.setAttribute('data-mining', 'true');
      script.setAttribute('data-auto', 'true');
      document.head.appendChild(script);
    }
  };

  // Render marketplace
  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold">{models.length}</span>
          </div>
          <p className="text-sm text-gray-400">Available Models</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold">
              {models.reduce((sum, m) => sum + m.trainedOnDataPoints, 0).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-400">Total Data Points</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold">
              {models.reduce((sum, m) => sum + m.contributors, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-400">Contributors</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-bold">
              {models.reduce((sum, m) => sum + m.queries, 0).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-400">Total Queries</p>
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(model => (
          <div key={model.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  {model.name}
                </h3>
                <p className="text-sm text-gray-400">v{model.version}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{model.accuracy}%</p>
                <p className="text-xs text-gray-400">NDCG Score</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Specialization</span>
                <span className="font-medium">{model.specialization}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Features Used</span>
                <span className="font-medium">{model.features}/194</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Data Points</span>
                <span className="font-medium">{model.trainedOnDataPoints.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Contributors</span>
                <span className="font-medium">{model.contributors}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price/Query</span>
                <span className="font-medium text-yellow-400">{model.pricePerQuery} DSH</span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t border-slate-600 pt-3 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Avg Response</span>
                <span>{model.performance.avgPredictionTime.toFixed(0)}ms</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Success Rate</span>
                <span>{model.performance.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">User Rating</span>
                <span className="flex items-center">
                  {model.performance.userRating.toFixed(1)}
                  <span className="text-yellow-400 ml-1">★</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedModel(model)}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => queryModel(model.id)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
              >
                Use Model
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render my models
  const renderMyModels = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Your Model Contributions</h2>
      
      {userContributions.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">You haven't contributed to any models yet</p>
          <button
            onClick={() => setActiveTab('mining')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
          >
            Start Mining Data
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {userContributions.map(contribution => {
            const model = models.find(m => m.id === contribution.modelId);
            if (!model) return null;
            
            return (
              <div key={contribution.modelId} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{model.name}</h3>
                    <p className="text-sm text-gray-400">Model #{model.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      {contribution.sharePercentage}%
                    </p>
                    <p className="text-xs text-gray-400">Revenue Share</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Data Points</p>
                    <p className="font-medium">{contribution.dataPointsContributed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Earnings</p>
                    <p className="font-medium text-yellow-400">{contribution.earningsToDate} DSH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Model Revenue</p>
                    <p className="font-medium">{model.totalRevenue} DSH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Payout</p>
                    <p className="font-medium">{contribution.lastPayout.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-sm">Estimated Next Payout</span>
                  <span className="font-medium text-green-400">
                    {(parseFloat(model.totalRevenue) * contribution.sharePercentage / 100 * 0.1).toFixed(2)} DSH
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render mining interface
  const renderMining = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-400" />
          SEO Data Mining
        </h2>
        
        <p className="text-gray-400 mb-6">
          Contribute SEO data from websites you visit to train collective AI models. 
          Earn DSH tokens and share in model profits!
        </p>

        {/* Mining Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg mb-6">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {miningEnabled ? (
                <Activity className="w-5 h-5 text-green-400" />
              ) : (
                <Activity className="w-5 h-5 text-gray-400" />
              )}
              Mining Status
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {miningEnabled 
                ? 'Actively collecting SEO data from visited sites' 
                : 'Click to start mining SEO data'}
            </p>
          </div>
          <button
            onClick={toggleMining}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              miningEnabled
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {miningEnabled ? 'Stop Mining' : 'Start Mining'}
          </button>
        </div>

        {/* Mining Stats */}
        {miningStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold">{miningStats.uniqueUrls}</span>
              </div>
              <p className="text-sm text-gray-400">URLs Analyzed</p>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold">{miningStats.totalRewards}</span>
              </div>
              <p className="text-sm text-gray-400">DSH Earned</p>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold">{miningStats.averageQuality}%</span>
              </div>
              <p className="text-sm text-gray-400">Avg Quality Score</p>
            </div>
          </div>
        )}

        {/* Feature Rarity */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Feature Rarity Bonuses</h3>
          <p className="text-sm text-gray-400 mb-3">
            Earn bonus rewards for contributing rare features!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: 'Interaction Features', rarity: 95, bonus: '5x' },
              { name: 'Temporal Trends', rarity: 85, bonus: '3x' },
              { name: 'Social Signals', rarity: 75, bonus: '2x' },
              { name: 'Entity Analysis', rarity: 70, bonus: '2x' }
            ].map(feature => (
              <div key={feature.name} className="bg-slate-700 rounded p-3">
                <p className="text-sm font-medium">{feature.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">Rarity: {feature.rarity}%</span>
                  <span className="text-xs text-green-400">{feature.bonus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="border-t border-slate-600 pt-6">
          <h3 className="font-medium mb-3">Quick Start Guide</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Install Browser Extension</p>
                <p className="text-sm text-gray-400">
                  Download the LightDOM SEO Miner extension for Chrome/Firefox
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Connect Wallet</p>
                <p className="text-sm text-gray-400">
                  Link your wallet to receive DSH rewards
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Browse Normally</p>
                <p className="text-sm text-gray-400">
                  The extension automatically collects SEO data as you browse
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="mt-6 p-4 bg-slate-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4" />
              Or Add to Your Website
            </h4>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              Copy
            </button>
          </div>
          <pre className="text-xs text-gray-400 overflow-x-auto">
{`<script 
  src="https://lightdom.ai/seo-injector.js" 
  data-api-key="YOUR_API_KEY"
  data-mining="true"
  data-model-id="latest">
</script>`}
          </pre>
        </div>
      </div>
    </div>
  );

  // Render analytics
  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Model Performance Analytics</h2>
      
      {/* Performance Chart Placeholder */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="font-medium mb-4">Model Accuracy Trends</h3>
        <div className="h-64 flex items-center justify-center bg-slate-700 rounded">
          <BarChart3 className="w-16 h-16 text-gray-600" />
          <p className="ml-4 text-gray-500">Chart visualization coming soon</p>
        </div>
      </div>

      {/* Top Performing Models */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="font-medium mb-4">Top Performing Models</h3>
        <div className="space-y-3">
          {models
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 5)
            .map((model, index) => (
              <div key={model.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-gray-400">{model.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{model.accuracy}%</p>
                  <p className="text-xs text-gray-400">NDCG Score</p>
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
            <Brain className="w-8 h-8 text-purple-400" />
            SEO AI Model Marketplace
          </h1>
          <p className="text-gray-400">
            Train, share, and monetize collective SEO intelligence
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {[
            { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
            { id: 'my-models', label: 'My Models', icon: GitBranch },
            { id: 'mining', label: 'Data Mining', icon: Database },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <>
            {activeTab === 'marketplace' && renderMarketplace()}
            {activeTab === 'my-models' && renderMyModels()}
            {activeTab === 'mining' && renderMining()}
            {activeTab === 'analytics' && renderAnalytics()}
          </>
        )}

        {/* Model Details Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                  <p className="text-gray-400">Version {selectedModel.version}</p>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-sm text-gray-400 mb-1">Accuracy</p>
                  <p className="text-2xl font-bold text-green-400">{selectedModel.accuracy}%</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-sm text-gray-400 mb-1">Price per Query</p>
                  <p className="text-2xl font-bold text-yellow-400">{selectedModel.pricePerQuery} DSH</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Model Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Training Data</span>
                      <span>{selectedModel.trainedOnDataPoints.toLocaleString()} URLs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Features Used</span>
                      <span>{selectedModel.features} of 194</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contributors</span>
                      <span>{selectedModel.contributors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Queries</span>
                      <span>{selectedModel.queries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue Generated</span>
                      <span>{selectedModel.totalRevenue} DSH</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">API Usage</h3>
                  <div className="p-3 bg-slate-900 rounded">
                    <code className="text-sm text-green-400">
                      POST https://api.lightdom.ai/v1/model/{selectedModel.id}/predict
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => queryModel(selectedModel.id)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors"
                >
                  Use This Model
                </button>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};