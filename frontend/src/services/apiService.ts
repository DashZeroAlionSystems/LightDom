/**
 * LightDom API Service
 * Comprehensive API integration for all platform services
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Types for API responses
export interface DashboardData {
  timestamp: string;
  services: {
    crawler: { isRunning: boolean; crawledCount: number };
    mining: { activeSessions: number };
    blockchain: { connected: boolean };
    spaceMining: { totalSpaceMined: number };
    metaverse: { bridges: number };
    seo: { trainingRecords: number };
  };
}

export interface CrawlerStats {
  isRunning: boolean;
  crawledCount: number;
  discoveredCount: number;
  crawledLastHour: number;
  crawledToday: number;
  avgSeoScore: number;
  totalSpaceSaved: number;
  seoTrainingRecords: number;
}

export interface MiningStats {
  activeSessions: number;
  totalHashRate: number;
  blocksMined: number;
  earnings: number;
  efficiency: number;
  uptime: number;
  temperature: number;
  powerUsage: number;
}

export interface OptimizationData {
  id: string;
  url: string;
  spaceSaved: number;
  biomeType: string;
  proofHash: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface WalletBalance {
  ldt: number;
  usd: number;
  btc: number;
  eth: number;
}

export interface Transaction {
  id: string;
  type: 'mining' | 'optimization' | 'transfer' | 'purchase';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
}

export interface BridgeData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'connecting';
  connections: number;
  bandwidth: number;
  latency: number;
  lastActivity: string;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  gpu: number;
  network: number;
  storage: number;
  database: number;
  blockchain: number;
}

// Dashboard API
export const dashboardAPI = {
  // Get complete dashboard data
  getCompleteData: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get('/dashboard/complete');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Return mock data for development
      return {
        timestamp: new Date().toISOString(),
        services: {
          crawler: { isRunning: true, crawledCount: 150 },
          mining: { activeSessions: 3 },
          blockchain: { connected: true },
          spaceMining: { totalSpaceMined: 50000 },
          metaverse: { bridges: 10 },
          seo: { trainingRecords: 1000 },
        },
      };
    }
  },

  // Get system health
  getHealth: async (): Promise<{ status: string; services: any[] }> => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      return { status: 'healthy', services: [] };
    }
  },
};

// Crawler API
export const crawlerAPI = {
  // Get crawler status
  getStatus: async (): Promise<{ isRunning: boolean }> => {
    try {
      const response = await apiClient.get('/crawler/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch crawler status:', error);
      return { isRunning: false };
    }
  },

  // Get crawler statistics
  getStats: async (): Promise<CrawlerStats> => {
    try {
      const response = await apiClient.get('/crawler/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch crawler stats:', error);
      // Return mock data for development
      return {
        isRunning: true,
        crawledCount: 150,
        discoveredCount: 500,
        crawledLastHour: 15,
        crawledToday: 45,
        avgSeoScore: 85,
        totalSpaceSaved: 250000,
        seoTrainingRecords: 1000,
      };
    }
  },

  // Get recent crawls
  getRecentCrawls: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/crawler/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent crawls:', error);
      return [];
    }
  },

  // Start crawler
  start: async (urls: string[], config: any = {}): Promise<void> => {
    try {
      await apiClient.post('/crawler/start', { urls, config });
    } catch (error) {
      console.error('Failed to start crawler:', error);
      throw error;
    }
  },

  // Stop crawler
  stop: async (): Promise<void> => {
    try {
      await apiClient.post('/crawler/stop');
    } catch (error) {
      console.error('Failed to stop crawler:', error);
      throw error;
    }
  },
};

// Mining API
export const miningAPI = {
  // Start mining session
  start: async (urls: string[], config: any = {}): Promise<void> => {
    try {
      await apiClient.post('/mining/start', { urls, config });
    } catch (error) {
      console.error('Failed to start mining:', error);
      throw error;
    }
  },

  // Get mining statistics
  getStats: async (): Promise<MiningStats> => {
    try {
      const response = await apiClient.get('/mining/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mining stats:', error);
      // Return mock data for development
      return {
        activeSessions: 3,
        totalHashRate: 2450.5,
        blocksMined: 127,
        earnings: 45.67,
        efficiency: 87.3,
        uptime: 3600,
        temperature: 65.2,
        powerUsage: 450.8,
      };
    }
  },

  // Stop mining
  stop: async (): Promise<void> => {
    try {
      await apiClient.post('/mining/stop');
    } catch (error) {
      console.error('Failed to stop mining:', error);
      throw error;
    }
  },
};

// Blockchain API
export const blockchainAPI = {
  // Get blockchain status
  getStatus: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/blockchain/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blockchain status:', error);
      return { connected: true, blockHeight: 12345, difficulty: 1258439201875 };
    }
  },

  // Get harvester stats
  getHarvesterStats: async (address: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/blockchain/harvester/${address}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch harvester stats:', error);
      return {};
    }
  },

  // Submit optimization to blockchain
  submitOptimization: async (data: any): Promise<void> => {
    try {
      await apiClient.post('/blockchain/submit-optimization', data);
    } catch (error) {
      console.error('Failed to submit optimization:', error);
      throw error;
    }
  },
};

// Optimization API
export const optimizationAPI = {
  // Submit optimization proof
  submit: async (data: {
    url: string;
    spaceSaved: number;
    biomeType: string;
    proofHash: string;
  }): Promise<void> => {
    try {
      await apiClient.post('/optimization/submit', data);
    } catch (error) {
      console.error('Failed to submit optimization:', error);
      throw error;
    }
  },

  // List optimizations
  list: async (limit: number = 50, offset: number = 0): Promise<OptimizationData[]> => {
    try {
      const response = await apiClient.get(`/optimization/list?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch optimizations:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          url: 'https://example.com',
          spaceSaved: 15000,
          biomeType: 'forest',
          proofHash: '0x1234567890abcdef',
          timestamp: new Date().toISOString(),
          status: 'completed',
        },
        {
          id: '2',
          url: 'https://test.com',
          spaceSaved: 8500,
          biomeType: 'ocean',
          proofHash: '0xabcdef1234567890',
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
      ];
    }
  },

  // Get specific optimization
  get: async (proofHash: string): Promise<OptimizationData | null> => {
    try {
      const response = await apiClient.get(`/optimization/${proofHash}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch optimization:', error);
      return null;
    }
  },

  // Get optimization analytics
  getAnalytics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/analytics/optimization');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch optimization analytics:', error);
      return {};
    }
  },
};

// Space Mining API
export const spaceMiningAPI = {
  // Mine space from URL
  mine: async (url: string): Promise<any> => {
    try {
      const response = await apiClient.post('/space-mining/mine', { url });
      return response.data;
    } catch (error) {
      console.error('Failed to mine space:', error);
      throw error;
    }
  },

  // Get all bridges
  getBridges: async (): Promise<BridgeData[]> => {
    try {
      const response = await apiClient.get('/space-mining/bridges');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bridges:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          name: 'Forest Bridge',
          status: 'active',
          connections: 25,
          bandwidth: 1000,
          latency: 45,
          lastActivity: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Ocean Portal',
          status: 'connecting',
          connections: 12,
          bandwidth: 750,
          latency: 62,
          lastActivity: new Date().toISOString(),
        },
      ];
    }
  },

  // Get bridge details
  getBridge: async (bridgeId: string): Promise<BridgeData | null> => {
    try {
      const response = await apiClient.get(`/space-mining/bridge/${bridgeId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bridge details:', error);
      return null;
    }
  },

  // Get mining stats
  getStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/space-mining/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch space mining stats:', error);
      return {
        totalSpaceMined: 50000,
        activeBridges: 10,
        isolatedDOMs: 150,
        spatialStructures: 25,
      };
    }
  },

  // Start continuous mining
  startContinuous: async (): Promise<void> => {
    try {
      await apiClient.post('/space-mining/start-continuous');
    } catch (error) {
      console.error('Failed to start continuous mining:', error);
      throw error;
    }
  },
};

// Wallet API
export const walletAPI = {
  // Get wallet balance
  getBalance: async (): Promise<WalletBalance> => {
    try {
      const response = await apiClient.get('/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      // Return mock data for development
      return {
        ldt: 1250.75,
        usd: 3125.50,
        btc: 0.085,
        eth: 1.25,
      };
    }
  },

  // Get transaction history
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get('/wallet/transactions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          type: 'mining',
          amount: 12.5,
          currency: 'LDT',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Block mining reward',
        },
        {
          id: '2',
          type: 'optimization',
          amount: 25.0,
          currency: 'LDT',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Website optimization reward',
        },
        {
          id: '3',
          type: 'transfer',
          amount: -50.0,
          currency: 'LDT',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Transfer to 0x1234...5678',
        },
      ];
    }
  },

  // Transfer funds
  transfer: async (to: string, amount: number, currency: string): Promise<void> => {
    try {
      await apiClient.post('/wallet/transfer', { to, amount, currency });
    } catch (error) {
      console.error('Failed to transfer funds:', error);
      throw error;
    }
  },

  // Purchase items
  purchase: async (itemId: string, amount: number): Promise<void> => {
    try {
      await apiClient.post('/wallet/purchase', { itemId, amount });
    } catch (error) {
      console.error('Failed to purchase item:', error);
      throw error;
    }
  },
};

// Metaverse API
export const metaverseAPI = {
  // Get metaverse stats
  getStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/metaverse/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metaverse stats:', error);
      return {
        activeUsers: 1250,
        totalBridges: 10,
        chatRooms: 25,
        economyVolume: 50000,
      };
    }
  },

  // Get bridge data
  getBridge: async (bridgeId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/metaverse/bridge/${bridgeId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metaverse bridge:', error);
      return null;
    }
  },

  // Get bridge chat
  getBridgeChat: async (bridgeId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/metaverse/bridge/${bridgeId}/chat`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bridge chat:', error);
      return [];
    }
  },

  // Get mining data
  getMiningData: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/metaverse/mining-data');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metaverse mining data:', error);
      return {};
    }
  },
};

// Admin Analytics API
export const adminAPI = {
  // Get system overview
  getOverview: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/admin/analytics/overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin overview:', error);
      return {
        totalUsers: 5000,
        activeUsers: 1250,
        totalOptimizations: 15000,
        totalMiningRevenue: 125000,
        systemUptime: 2592000,
      };
    }
  },

  // Get client usage metrics
  getClients: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/admin/analytics/clients');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client metrics:', error);
      return [];
    }
  },

  // Get mining statistics
  getMiningStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/admin/analytics/mining');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin mining stats:', error);
      return {};
    }
  },

  // Get billing analytics
  getBillingAnalytics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/admin/analytics/billing');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing analytics:', error);
      return {};
    }
  },

  // Get system alerts
  getAlerts: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/admin/analytics/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system alerts:', error);
      return [];
    }
  },
};

// Settings API
export const settingsAPI = {
  // Get user settings
  getSettings: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return {
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoSave: true,
        miningConfig: {
          autoStart: false,
          maxWorkers: 4,
          intensity: 75,
          maxTemp: 80,
        },
      };
    }
  },

  // Update user settings
  updateSettings: async (settings: any): Promise<void> => {
    try {
      await apiClient.put('/settings', settings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },
};

// Research Pipeline API - For AI/ML research scraping and analysis
export interface ResearchArticle {
  id: string;
  title: string;
  url: string;
  author: string;
  tags: string[];
  content?: string;
  scrapedAt: string;
  status: 'pending' | 'analyzed' | 'archived';
}

export interface ResearchFeature {
  id: string;
  name: string;
  description: string;
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  revenuePotential: 'high' | 'medium' | 'low';
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
  articleId?: string;
}

export interface ResearchCampaign {
  id: string;
  name: string;
  topics: string[];
  isActive: boolean;
  createdAt: string;
  lastRun?: string;
}

export interface ResearchDashboardData {
  stats: {
    total_articles: number;
    articles_today: number;
    total_features: number;
    pending_features: number;
    active_campaigns: number;
    total_papers: number;
    total_code_examples: number;
  };
  topTopics?: any[];
  topFeatures?: any[];
  recentArticles?: any[];
}

export const researchAPI = {
  // Get dashboard data
  getDashboard: async (): Promise<ResearchDashboardData> => {
    try {
      const response = await apiClient.get('/research/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch research dashboard:', error);
      return {
        stats: {
          total_articles: 0,
          articles_today: 0,
          total_features: 0,
          pending_features: 0,
          active_campaigns: 0,
          total_papers: 0,
          total_code_examples: 0,
        },
      };
    }
  },

  // Get pipeline status
  getStatus: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/research/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch research status:', error);
      return { status: 'unknown', stats: {} };
    }
  },

  // Trigger article scraping
  scrapeArticles: async (topics: string[] = ['ai', 'ml', 'llm'], limit: number = 50): Promise<any> => {
    try {
      const response = await apiClient.post('/research/scrape', { topics, limit });
      return response.data;
    } catch (error) {
      console.error('Failed to scrape articles:', error);
      throw error;
    }
  },

  // Get articles
  getArticles: async (params: {
    status?: string;
    topic?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ articles: ResearchArticle[]; total: number }> => {
    try {
      const response = await apiClient.get('/research/articles', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      return { articles: [], total: 0 };
    }
  },

  // Get single article
  getArticle: async (id: string): Promise<ResearchArticle | null> => {
    try {
      const response = await apiClient.get(`/research/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch article:', error);
      return null;
    }
  },

  // Analyze article for features
  analyzeArticle: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/research/articles/${id}/analyze`);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze article:', error);
      throw error;
    }
  },

  // Get feature recommendations
  getFeatures: async (params: {
    status?: string;
    impact?: string;
    revenue?: string;
    limit?: number;
  } = {}): Promise<{ features: ResearchFeature[]; total: number }> => {
    try {
      const response = await apiClient.get('/research/features', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch features:', error);
      return { features: [], total: 0 };
    }
  },

  // Get campaigns
  getCampaigns: async (active?: boolean): Promise<ResearchCampaign[]> => {
    try {
      const params = active !== undefined ? { active: active.toString() } : {};
      const response = await apiClient.get('/research/campaigns', { params });
      return response.data.campaigns || response.data;
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }
  },

  // Create campaign
  createCampaign: async (config: Partial<ResearchCampaign>): Promise<ResearchCampaign> => {
    try {
      const response = await apiClient.post('/research/campaigns', config);
      return response.data.campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  // Generate research paper
  generatePaper: async (focusArea: string, limit: number = 50): Promise<any> => {
    try {
      const response = await apiClient.post('/research/papers/generate', { focusArea, limit });
      return response.data;
    } catch (error) {
      console.error('Failed to generate paper:', error);
      throw error;
    }
  },
};

// Codebase Indexing API - For semantic code search and analysis
export interface CodeEntity {
  id: string;
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface' | 'type';
  filePath: string;
  lineStart: number;
  lineEnd: number;
  description?: string;
  signature?: string;
}

export interface CodeRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'calls' | 'imports' | 'extends' | 'implements' | 'uses';
}

export interface IndexingSession {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  stats: {
    filesProcessed: number;
    entitiesFound: number;
    relationshipsFound: number;
    issuesDetected: number;
  };
}

export const codebaseIndexingAPI = {
  // Get indexing status
  getStatus: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/codebase-indexing/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch codebase indexing status:', error);
      return {
        status: 'idle',
        lastIndexed: null,
        totalEntities: 0,
        totalRelationships: 0,
      };
    }
  },

  // Start full indexing
  startIndexing: async (options: { incremental?: boolean; targetFiles?: string[] } = {}): Promise<IndexingSession> => {
    try {
      const response = await apiClient.post('/codebase-indexing/start', options);
      return response.data;
    } catch (error) {
      console.error('Failed to start indexing:', error);
      throw error;
    }
  },

  // Stop indexing
  stopIndexing: async (sessionId: string): Promise<void> => {
    try {
      await apiClient.post(`/codebase-indexing/stop/${sessionId}`);
    } catch (error) {
      console.error('Failed to stop indexing:', error);
      throw error;
    }
  },

  // Get indexing sessions
  getSessions: async (limit: number = 10): Promise<IndexingSession[]> => {
    try {
      const response = await apiClient.get('/codebase-indexing/sessions', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch indexing sessions:', error);
      return [];
    }
  },

  // Search code entities
  searchEntities: async (query: string, options: {
    type?: string;
    limit?: number;
  } = {}): Promise<CodeEntity[]> => {
    try {
      const response = await apiClient.get('/codebase-indexing/search', {
        params: { query, ...options },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search entities:', error);
      return [];
    }
  },

  // Get entity details
  getEntity: async (id: string): Promise<CodeEntity | null> => {
    try {
      const response = await apiClient.get(`/codebase-indexing/entities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch entity:', error);
      return null;
    }
  },

  // Get entity relationships
  getRelationships: async (entityId: string): Promise<CodeRelationship[]> => {
    try {
      const response = await apiClient.get(`/codebase-indexing/entities/${entityId}/relationships`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
      return [];
    }
  },

  // Get call graph for entity
  getCallGraph: async (entityId: string, depth: number = 3): Promise<any> => {
    try {
      const response = await apiClient.get(`/codebase-indexing/entities/${entityId}/call-graph`, {
        params: { depth },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch call graph:', error);
      return { nodes: [], edges: [] };
    }
  },

  // Get dead code analysis
  getDeadCode: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/codebase-indexing/analysis/dead-code');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dead code analysis:', error);
      return [];
    }
  },

  // Get dependency analysis
  getDependencies: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/codebase-indexing/analysis/dependencies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dependency analysis:', error);
      return { internal: [], external: [] };
    }
  },

  // Get AI-powered insights
  getInsights: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/codebase-indexing/insights');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      return [];
    }
  },
};

// Data Mining API - For advanced data mining workflows and campaigns
export interface DataMiningTool {
  id: string;
  name: string;
  description: string;
  category: string;
  configSchema?: any;
}

export interface DataMiningWorkflow {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  steps: {
    name: string;
    tool: string;
    config: any;
    status?: string;
  }[];
  createdAt: string;
  lastRun?: string;
  results?: any;
}

export interface DataMiningCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  workflows: DataMiningWorkflow[];
  createdAt: string;
  lastRun?: string;
}

export const dataMiningAPI = {
  // Get available tools
  getTools: async (): Promise<DataMiningTool[]> => {
    try {
      const response = await apiClient.get('/datamining/tools');
      return response.data.tools || [];
    } catch (error) {
      console.error('Failed to fetch data mining tools:', error);
      return [];
    }
  },

  // Get single tool
  getTool: async (toolId: string): Promise<DataMiningTool | null> => {
    try {
      const response = await apiClient.get(`/datamining/tools/${toolId}`);
      return response.data.tool;
    } catch (error) {
      console.error('Failed to fetch tool:', error);
      return null;
    }
  },

  // Create workflow
  createWorkflow: async (workflow: {
    name: string;
    description?: string;
    steps: { name: string; tool: string; config: any }[];
  }): Promise<DataMiningWorkflow> => {
    try {
      const response = await apiClient.post('/datamining/workflows', workflow);
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  // Get all workflows
  getWorkflows: async (): Promise<DataMiningWorkflow[]> => {
    try {
      const response = await apiClient.get('/datamining/workflows');
      return response.data.workflows || [];
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return [];
    }
  },

  // Get single workflow
  getWorkflow: async (workflowId: string): Promise<DataMiningWorkflow | null> => {
    try {
      const response = await apiClient.get(`/datamining/workflows/${workflowId}`);
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      return null;
    }
  },

  // Update workflow
  updateWorkflow: async (workflowId: string, updates: Partial<DataMiningWorkflow>): Promise<DataMiningWorkflow> => {
    try {
      const response = await apiClient.put(`/datamining/workflows/${workflowId}`, updates);
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  },

  // Delete workflow
  deleteWorkflow: async (workflowId: string): Promise<void> => {
    try {
      await apiClient.delete(`/datamining/workflows/${workflowId}`);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  },

  // Execute workflow
  executeWorkflow: async (workflowId: string, options: any = {}): Promise<any> => {
    try {
      const response = await apiClient.post(`/datamining/workflows/${workflowId}/execute`, { options });
      return response.data.result;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  },

  // Create campaign
  createCampaign: async (campaign: {
    name: string;
    description?: string;
    workflows: { name: string; steps: any[] }[];
  }): Promise<DataMiningCampaign> => {
    try {
      const response = await apiClient.post('/datamining/campaigns', campaign);
      return response.data.campaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  // Get all campaigns
  getCampaigns: async (): Promise<DataMiningCampaign[]> => {
    try {
      const response = await apiClient.get('/datamining/campaigns');
      return response.data.campaigns || [];
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }
  },

  // Get single campaign
  getCampaign: async (campaignId: string): Promise<DataMiningCampaign | null> => {
    try {
      const response = await apiClient.get(`/datamining/campaigns/${campaignId}`);
      return response.data.campaign;
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      return null;
    }
  },

  // Update campaign
  updateCampaign: async (campaignId: string, updates: Partial<DataMiningCampaign>): Promise<DataMiningCampaign> => {
    try {
      const response = await apiClient.put(`/datamining/campaigns/${campaignId}`, updates);
      return response.data.campaign;
    } catch (error) {
      console.error('Failed to update campaign:', error);
      throw error;
    }
  },

  // Delete campaign
  deleteCampaign: async (campaignId: string): Promise<void> => {
    try {
      await apiClient.delete(`/datamining/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      throw error;
    }
  },

  // Execute campaign
  executeCampaign: async (campaignId: string, options: any = {}): Promise<any> => {
    try {
      const response = await apiClient.post(`/datamining/campaigns/${campaignId}/execute`, { options });
      return response.data.result;
    } catch (error) {
      console.error('Failed to execute campaign:', error);
      throw error;
    }
  },

  // Get orchestrator status
  getStatus: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/datamining/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data mining status:', error);
      return {
        status: 'unknown',
        activeWorkflows: 0,
        activeCampaigns: 0,
        completedTasks: 0,
      };
    }
  },

  // Get statistics
  getStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/datamining/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data mining stats:', error);
      return {
        totalWorkflows: 0,
        totalCampaigns: 0,
        totalDataMined: 0,
        successRate: 0,
      };
    }
  },
};

// Lead Generation API - For managing leads from campaigns and data sources
export interface Lead {
  id: number;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  sourceType: string;
  sourceId?: string;
  sourceUrl?: string;
  sourceMetadata?: any;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  score: number;
  quality: 'high' | 'medium' | 'low';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  tags?: string[];
  customFields?: any;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: number;
  leadId: number;
  activityType: string;
  description?: string;
  data?: any;
  createdAt: string;
}

export interface LeadStatistics {
  total: number;
  byStatus: Record<string, number>;
  byQuality: Record<string, number>;
  bySource: Record<string, number>;
  recentLeads: number;
  conversionRate: number;
}

export const leadGenerationAPI = {
  // Get all leads with filtering and pagination
  getLeads: async (params: {
    status?: string;
    quality?: string;
    sourceType?: string;
    sourceId?: string;
    assignedTo?: string;
    minScore?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ leads: Lead[]; total: number; page: number; pages: number }> => {
    try {
      const response = await apiClient.get('/leads', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      return { leads: [], total: 0, page: 1, pages: 0 };
    }
  },

  // Get a specific lead by ID
  getLead: async (id: number): Promise<Lead | null> => {
    try {
      const response = await apiClient.get(`/leads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      return null;
    }
  },

  // Create a new lead
  createLead: async (leadData: Partial<Lead>): Promise<Lead> => {
    try {
      const response = await apiClient.post('/leads', leadData);
      return response.data;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  },

  // Update a lead
  updateLead: async (id: number, updates: Partial<Lead>): Promise<Lead> => {
    try {
      const response = await apiClient.patch(`/leads/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  },

  // Update lead status
  updateStatus: async (id: number, status: string): Promise<Lead> => {
    try {
      const response = await apiClient.patch(`/leads/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update lead status:', error);
      throw error;
    }
  },

  // Assign lead to a user
  assignLead: async (id: number, userId: string): Promise<Lead> => {
    try {
      const response = await apiClient.post(`/leads/${id}/assign`, { userId });
      return response.data;
    } catch (error) {
      console.error('Failed to assign lead:', error);
      throw error;
    }
  },

  // Add tags to a lead
  addTags: async (id: number, tags: string[]): Promise<void> => {
    try {
      await apiClient.post(`/leads/${id}/tags`, { tags });
    } catch (error) {
      console.error('Failed to add tags:', error);
      throw error;
    }
  },

  // Log an activity for a lead
  logActivity: async (id: number, activityType: string, description?: string, data?: any): Promise<LeadActivity> => {
    try {
      const response = await apiClient.post(`/leads/${id}/activity`, { activityType, description, data });
      return response.data;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  },

  // Bulk import leads
  bulkImport: async (leads: Partial<Lead>[], sourceType: string, sourceId?: string): Promise<{ success: number; failed: number; errors: any[] }> => {
    try {
      const response = await apiClient.post('/leads/bulk-import', { leads, sourceType, sourceId });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk import leads:', error);
      throw error;
    }
  },

  // Capture leads from crawler campaign
  captureFromCrawler: async (campaignId: string, results: any[]): Promise<{ success: boolean; captured: number; leads: Lead[] }> => {
    try {
      const response = await apiClient.post('/leads/capture-from-crawler', { campaignId, results });
      return response.data;
    } catch (error) {
      console.error('Failed to capture leads from crawler:', error);
      throw error;
    }
  },

  // Get lead statistics
  getStatistics: async (): Promise<LeadStatistics> => {
    try {
      const response = await apiClient.get('/leads/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lead statistics:', error);
      return {
        total: 0,
        byStatus: {},
        byQuality: {},
        bySource: {},
        recentLeads: 0,
        conversionRate: 0,
      };
    }
  },

  // Get source performance
  getSourcePerformance: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/leads/source-performance');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch source performance:', error);
      return [];
    }
  },
};

// Workflow Generator API - For automated workflow generation and configuration management
export interface WorkflowSetting {
  name: string;
  config: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowSetup {
  name: string;
  atoms?: any[];
  components?: any[];
  dashboards?: any[];
  settings?: any[];
  tables?: any[];
  createdAt?: string;
}

export interface GeneratedWorkflow {
  id: string;
  name: string;
  prompt: string;
  atoms: any[];
  components: any[];
  dashboards: any[];
  settings: any[];
  tables: any[];
  generatedAt: string;
}

export interface ConfigSummary {
  totalAtoms: number;
  totalComponents: number;
  totalDashboards: number;
  totalSettings: number;
  totalSetups: number;
}

export const workflowGeneratorAPI = {
  // Get configuration summary
  getConfigSummary: async (): Promise<ConfigSummary> => {
    try {
      const response = await apiClient.get('/workflow-generator/config/summary');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch config summary:', error);
      return {
        totalAtoms: 0,
        totalComponents: 0,
        totalDashboards: 0,
        totalSettings: 0,
        totalSetups: 0,
      };
    }
  },

  // List all settings
  getSettings: async (): Promise<WorkflowSetting[]> => {
    try {
      const response = await apiClient.get('/workflow-generator/settings');
      return response.data.data?.settings || [];
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return [];
    }
  },

  // Get a specific setting
  getSetting: async (name: string): Promise<WorkflowSetting | null> => {
    try {
      const response = await apiClient.get(`/workflow-generator/settings/${name}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch setting:', error);
      return null;
    }
  },

  // Save a setting
  saveSetting: async (name: string, config: any): Promise<WorkflowSetting> => {
    try {
      const response = await apiClient.post('/workflow-generator/settings', { name, ...config });
      return response.data.data;
    } catch (error) {
      console.error('Failed to save setting:', error);
      throw error;
    }
  },

  // List all setups
  getSetups: async (): Promise<WorkflowSetup[]> => {
    try {
      const response = await apiClient.get('/workflow-generator/setups');
      return response.data.data?.setups || [];
    } catch (error) {
      console.error('Failed to fetch setups:', error);
      return [];
    }
  },

  // Get a specific setup
  getSetup: async (name: string): Promise<WorkflowSetup | null> => {
    try {
      const response = await apiClient.get(`/workflow-generator/setups/${name}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch setup:', error);
      return null;
    }
  },

  // Save a setup
  saveSetup: async (name: string, config: any): Promise<WorkflowSetup> => {
    try {
      const response = await apiClient.post('/workflow-generator/setups', { name, ...config });
      return response.data.data;
    } catch (error) {
      console.error('Failed to save setup:', error);
      throw error;
    }
  },

  // Generate workflow from prompt
  generateWorkflow: async (prompt: string): Promise<GeneratedWorkflow> => {
    try {
      const response = await apiClient.post('/workflow-generator/generate', { prompt });
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      throw error;
    }
  },

  // Execute a generated workflow
  executeWorkflow: async (name: string, userInputs?: any): Promise<any> => {
    try {
      const response = await apiClient.post(`/workflow-generator/execute/${name}`, userInputs || {});
      return response.data.data;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  },

  // Get workflow configuration
  getWorkflowConfig: async (name: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/workflow-generator/config/${name}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch workflow config:', error);
      return null;
    }
  },

  // Create a self-generating workflow
  createSelfGeneratingWorkflow: async (prompt: string | { name: string }, options?: any): Promise<any> => {
    try {
      const response = await apiClient.post('/workflow-generator/self-generating', { prompt, options });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create self-generating workflow:', error);
      throw error;
    }
  },

  // Bundle atoms into a component
  bundleComponent: async (name: string, atoms: string[], config?: any): Promise<any> => {
    try {
      const response = await apiClient.post('/workflow-generator/bundle/component', { name, atoms, ...config });
      return response.data.data;
    } catch (error) {
      console.error('Failed to bundle component:', error);
      throw error;
    }
  },

  // Bundle components into a dashboard
  bundleDashboard: async (name: string, components: string[], layout?: any): Promise<any> => {
    try {
      const response = await apiClient.post('/workflow-generator/bundle/dashboard', { name, components, layout });
      return response.data.data;
    } catch (error) {
      console.error('Failed to bundle dashboard:', error);
      throw error;
    }
  },

  // Bundle dashboards into a workflow
  bundleWorkflow: async (name: string, dashboards: string[], triggers?: any, automation?: any): Promise<any> => {
    try {
      const response = await apiClient.post('/workflow-generator/bundle/workflow', { name, dashboards, triggers, automation });
      return response.data.data;
    } catch (error) {
      console.error('Failed to bundle workflow:', error);
      throw error;
    }
  },
};

// Schema Linking API - For database schema analysis, relationship discovery, and feature mapping
export interface TableMetadata {
  name: string;
  schema: string;
  columns: {
    name: string;
    dataType: string;
    isNullable: boolean;
    defaultValue?: any;
  }[];
  primaryKey?: string[];
  foreignKeys?: {
    column: string;
    referenceTable: string;
    referenceColumn: string;
  }[];
}

export interface SchemaRelationship {
  id: string;
  sourceTable: string;
  targetTable: string;
  type: 'foreign_key' | 'semantic' | 'naming_pattern';
  confidence: number;
  columns: string[];
}

export interface FeatureGrouping {
  name: string;
  tables: string[];
  relationships: string[];
  description?: string;
}

export interface LinkedSchemaMap {
  feature: string;
  tables: TableMetadata[];
  relationships: SchemaRelationship[];
  dashboardConfig?: any;
}

export interface RunnerStatus {
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
  cyclesCompleted: number;
  errors: number;
}

export const schemaLinkingAPI = {
  // Analyze database schema
  analyzeSchema: async (): Promise<{
    tables: number;
    relationships: number;
    features: number;
    metadata: any[];
  }> => {
    try {
      const response = await apiClient.get('/schema-linking/analyze');
      return response.data.data;
    } catch (error) {
      console.error('Failed to analyze schema:', error);
      return { tables: 0, relationships: 0, features: 0, metadata: [] };
    }
  },

  // Get all tables
  getTables: async (): Promise<TableMetadata[]> => {
    try {
      const response = await apiClient.get('/schema-linking/tables');
      return response.data.data?.tables || [];
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      return [];
    }
  },

  // Get relationships
  getRelationships: async (type?: string): Promise<SchemaRelationship[]> => {
    try {
      const params = type ? { type } : {};
      const response = await apiClient.get('/schema-linking/relationships', { params });
      return response.data.data?.relationships || [];
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
      return [];
    }
  },

  // Get feature groupings
  getFeatures: async (): Promise<FeatureGrouping[]> => {
    try {
      const response = await apiClient.get('/schema-linking/features');
      return response.data.data?.features || [];
    } catch (error) {
      console.error('Failed to fetch features:', error);
      return [];
    }
  },

  // Get linked schema map for a feature
  getFeatureSchema: async (featureName: string): Promise<LinkedSchemaMap | null> => {
    try {
      const response = await apiClient.get(`/schema-linking/features/${featureName}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch feature schema:', error);
      return null;
    }
  },

  // Export linked schemas
  exportSchemas: async (outputPath?: string): Promise<{ outputPath: string; metadata: any }> => {
    try {
      const response = await apiClient.post('/schema-linking/export', { outputPath });
      return response.data.data;
    } catch (error) {
      console.error('Failed to export schemas:', error);
      throw error;
    }
  },

  // Get runner status
  getRunnerStatus: async (): Promise<RunnerStatus> => {
    try {
      const response = await apiClient.get('/schema-linking/runner/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch runner status:', error);
      return {
        isRunning: false,
        cyclesCompleted: 0,
        errors: 0,
      };
    }
  },

  // Start the runner
  startRunner: async (): Promise<RunnerStatus> => {
    try {
      const response = await apiClient.post('/schema-linking/runner/start');
      return response.data.status;
    } catch (error) {
      console.error('Failed to start runner:', error);
      throw error;
    }
  },

  // Stop the runner
  stopRunner: async (): Promise<RunnerStatus> => {
    try {
      const response = await apiClient.post('/schema-linking/runner/stop');
      return response.data.status;
    } catch (error) {
      console.error('Failed to stop runner:', error);
      throw error;
    }
  },

  // Run a single linking cycle
  runCycle: async (): Promise<any> => {
    try {
      const response = await apiClient.post('/schema-linking/runner/run');
      return response.data.data;
    } catch (error) {
      console.error('Failed to run linking cycle:', error);
      throw error;
    }
  },

  // Get dashboard configurations for a feature
  getFeatureDashboard: async (featureName: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/schema-linking/dashboards/${featureName}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch feature dashboard:', error);
      return null;
    }
  },
};

// Training Data API - For training data mining, bundling, and schema linking
export interface ModelType {
  id: string;
  name: string;
  description: string;
  attributes: string[];
}

export interface TrainingBundle {
  id: string;
  functionality: string;
  urls: string[];
  data: any[];
  qualityScore: number;
  createdAt: string;
}

export interface MiningResult {
  url: string;
  success: boolean;
  attributes?: any;
  qualityScore?: number;
  error?: string;
}

export interface FunctionalityConfig {
  functionality: string;
  description: string;
  requiredAttributes: string[];
  modelTypes: string[];
  minQualityScore: number;
  includeLayersData: boolean;
  linkSchemas: boolean;
}

export interface LinkedSchema {
  id: string;
  sourceAttribute: string;
  targetAttribute: string;
  confidence: number;
  schemaType: string;
}

export const trainingDataAPI = {
  // Get supported model types
  getModelTypes: async (): Promise<ModelType[]> => {
    try {
      const response = await apiClient.get('/training-data/model-types');
      return response.data.data?.modelTypes || [];
    } catch (error) {
      console.error('Failed to fetch model types:', error);
      return [];
    }
  },

  // Mine data for a specific model type from a URL
  mineData: async (url: string, modelType: string): Promise<MiningResult> => {
    try {
      const response = await apiClient.post('/training-data/mine', { url, modelType });
      return response.data.data;
    } catch (error) {
      console.error('Failed to mine data:', error);
      throw error;
    }
  },

  // Mine data from multiple URLs
  mineBatch: async (urls: string[], modelType: string): Promise<{
    results: MiningResult[];
    total: number;
    successful: number;
    failed: number;
  }> => {
    try {
      const response = await apiClient.post('/training-data/mine-batch', { urls, modelType });
      return response.data.data;
    } catch (error) {
      console.error('Failed to mine batch:', error);
      throw error;
    }
  },

  // Get supported functionalities
  getFunctionalities: async (): Promise<FunctionalityConfig[]> => {
    try {
      const response = await apiClient.get('/training-data/functionalities');
      return response.data.data?.functionalities || [];
    } catch (error) {
      console.error('Failed to fetch functionalities:', error);
      return [];
    }
  },

  // Create a training data bundle
  createBundle: async (functionality: string, urls: string[]): Promise<TrainingBundle> => {
    try {
      const response = await apiClient.post('/training-data/create-bundle', { functionality, urls });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create bundle:', error);
      throw error;
    }
  },

  // Discover attributes for a functionality
  discoverAttributes: async (functionality: string, sampleUrls?: string[]): Promise<{
    functionality: string;
    description: string;
    requiredAttributes: string[];
    modelTypes: string[];
    sampleData?: any;
    attributeDetails: any[];
  }> => {
    try {
      const response = await apiClient.post('/training-data/discover-attributes', {
        functionality,
        sampleUrls: sampleUrls || [],
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to discover attributes:', error);
      throw error;
    }
  },

  // Link schemas in training data
  linkSchemas: async (datasets: any[], schemaContext?: any): Promise<{
    linkedSchemas: LinkedSchema[];
    total: number;
    byConfidence: {
      high: number;
      medium: number;
      low: number;
    };
  }> => {
    try {
      const response = await apiClient.post('/training-data/link-schemas', {
        datasets,
        schemaContext: schemaContext || {},
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to link schemas:', error);
      throw error;
    }
  },
};

// Embeddings/Codebase Index API - For semantic code search with embeddings
export interface EmbeddingHealth {
  status: string;
  model: string;
  modelInfo: any;
  dimensions: number;
  indexStats: any;
}

export interface SearchResult {
  query: string;
  results: Array<{
    file: string;
    score: number;
    content: string;
    line?: number;
    context?: string;
  }>;
  count: number;
  avgScore: number;
}

export interface IndexStats {
  totalFiles: number;
  totalChunks: number;
  totalTokens: number;
  avgChunksPerFile: number;
  modelName: string;
  lastIndexed: string;
}

export interface EmbeddingModel {
  name: string;
  displayName: string;
  dimensions: number;
  description: string;
  size: string;
  tasks: string[];
}

export const embeddingsAPI = {
  // Health check
  getHealth: async (): Promise<EmbeddingHealth> => {
    try {
      const response = await apiClient.get('/codebase-index/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch embeddings health:', error);
      throw error;
    }
  },

  // Build or update index
  buildIndex: async (options?: {
    incremental?: boolean;
    patterns?: string[];
    rootPath?: string;
  }): Promise<{ success: boolean; stats: IndexStats }> => {
    try {
      const response = await apiClient.post('/codebase-index/build', options || {});
      return response.data;
    } catch (error) {
      console.error('Failed to build index:', error);
      throw error;
    }
  },

  // Search codebase
  search: async (
    query: string,
    options?: {
      topK?: number;
      threshold?: number;
      fileTypes?: string[];
      files?: string[];
    }
  ): Promise<SearchResult> => {
    try {
      const response = await apiClient.post('/codebase-index/search', {
        query,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search codebase:', error);
      throw error;
    }
  },

  // Get context for AI models
  getContext: async (
    query: string,
    options?: {
      maxTokens?: number;
      topK?: number;
      fileTypes?: string[];
      files?: string[];
    }
  ): Promise<{
    query: string;
    context: string;
    sources: Array<{ file: string; score: number }>;
    tokenCount: number;
  }> => {
    try {
      const response = await apiClient.post('/codebase-index/context', {
        query,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get context:', error);
      throw error;
    }
  },

  // Find similar files
  getSimilarFiles: async (
    file: string,
    options?: {
      topK?: number;
      threshold?: number;
    }
  ): Promise<SearchResult> => {
    try {
      const response = await apiClient.get('/codebase-index/similar', {
        params: { file, ...options },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to find similar files:', error);
      throw error;
    }
  },

  // Find related code
  getRelatedCode: async (
    code: string,
    options?: {
      topK?: number;
      threshold?: number;
      excludeFile?: string;
    }
  ): Promise<SearchResult> => {
    try {
      const response = await apiClient.post('/codebase-index/related', {
        code,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to find related code:', error);
      throw error;
    }
  },

  // Get statistics
  getStats: async (): Promise<{
    index: IndexStats;
    embedding: any;
  }> => {
    try {
      const response = await apiClient.get('/codebase-index/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  },

  // Get indexed files
  getIndexedFiles: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/codebase-index/files');
      return response.data.files || [];
    } catch (error) {
      console.error('Failed to fetch indexed files:', error);
      return [];
    }
  },

  // List available models
  listModels: async (): Promise<{
    currentModel: string;
    models: EmbeddingModel[];
    defaultModels: Record<string, string>;
  }> => {
    try {
      const response = await apiClient.get('/codebase-index/models');
      return response.data;
    } catch (error) {
      console.error('Failed to list models:', error);
      throw error;
    }
  },

  // Switch embedding model
  switchModel: async (
    model: string,
    options?: {
      reindex?: boolean;
      pullIfMissing?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/codebase-index/model', {
        model,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to switch model:', error);
      throw error;
    }
  },

  // Export index
  exportIndex: async (outputPath: string): Promise<{ success: boolean; path: string }> => {
    try {
      const response = await apiClient.post('/codebase-index/export', { outputPath });
      return response.data;
    } catch (error) {
      console.error('Failed to export index:', error);
      throw error;
    }
  },

  // Import index
  importIndex: async (inputPath: string): Promise<{ success: boolean; stats: IndexStats }> => {
    try {
      const response = await apiClient.post('/codebase-index/import', { inputPath });
      return response.data;
    } catch (error) {
      console.error('Failed to import index:', error);
      throw error;
    }
  },

  // Clear index
  clearIndex: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete('/codebase-index');
      return response.data;
    } catch (error) {
      console.error('Failed to clear index:', error);
      throw error;
    }
  },
};

// =====================================================
// Feedback Loop Service API
// =====================================================

export const feedbackLoopAPI = {
  // Submit feedback
  submitFeedback: async (feedback: {
    sessionId: string;
    userId?: number;
    conversationId: string;
    messageId: string;
    feedbackType: 'positive' | 'negative' | 'neutral';
    feedbackStrength?: number;
    feedbackReason?: string;
    prompt: string;
    response: string;
    modelUsed?: string;
    templateStyle?: string;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/feedback', feedback);
      return response.data;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  },

  // Get feedback summary
  getFeedbackSummary: async (filters?: {
    modelUsed?: string;
    templateStyle?: string;
    feedbackType?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/feedback-loop/feedback/summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to get feedback summary:', error);
      throw error;
    }
  },

  // Get preferences
  getPreferences: async (sessionId: string, userId?: number, category?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/feedback-loop/preferences', {
        params: { sessionId, userId, category }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      throw error;
    }
  },

  // Set preference
  setPreference: async (preference: {
    userId?: number;
    sessionId: string;
    category: string;
    key: string;
    value: any;
    source?: string;
    priority?: number;
    confidenceScore?: number;
    expiresAt?: string;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/preferences', preference);
      return response.data;
    } catch (error) {
      console.error('Failed to set preference:', error);
      throw error;
    }
  },

  // Create A/B test campaign
  createABTestCampaign: async (campaign: {
    name: string;
    description: string;
    variants: any[];
    targetMetric: string;
    sampleSize?: number;
    durationDays?: number;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/ab-test/campaigns', campaign);
      return response.data;
    } catch (error) {
      console.error('Failed to create A/B test campaign:', error);
      throw error;
    }
  },

  // Start A/B test campaign
  startABTestCampaign: async (campaignId: number): Promise<any> => {
    try {
      const response = await apiClient.post(`/feedback-loop/ab-test/campaigns/${campaignId}/start`);
      return response.data;
    } catch (error) {
      console.error('Failed to start A/B test campaign:', error);
      throw error;
    }
  },

  // Assign variant
  assignVariant: async (data: {
    campaignId: number;
    sessionId: string;
    userId?: number;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/ab-test/assign', data);
      return response.data;
    } catch (error) {
      console.error('Failed to assign variant:', error);
      throw error;
    }
  },

  // Record interaction
  recordInteraction: async (interaction: {
    campaignId: number;
    sessionId: string;
    variantId: string;
    interactionType: string;
    value?: number;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/ab-test/interaction', interaction);
      return response.data;
    } catch (error) {
      console.error('Failed to record interaction:', error);
      throw error;
    }
  },

  // Create test question
  createTestQuestion: async (question: {
    campaignId: number;
    questionText: string;
    questionType: string;
    options?: any[];
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/ab-test/questions', question);
      return response.data;
    } catch (error) {
      console.error('Failed to create test question:', error);
      throw error;
    }
  },

  // Get campaign questions
  getCampaignQuestions: async (campaignId: number): Promise<any> => {
    try {
      const response = await apiClient.get('/feedback-loop/ab-test/questions', {
        params: { campaignId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get campaign questions:', error);
      throw error;
    }
  },

  // Submit question response
  submitQuestionResponse: async (questionResponse: {
    questionId: number;
    sessionId: string;
    userId?: number;
    variantId: string;
    answer: any;
    responseTime?: number;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/ab-test/responses', questionResponse);
      return response.data;
    } catch (error) {
      console.error('Failed to submit question response:', error);
      throw error;
    }
  },

  // Get campaign performance
  getCampaignPerformance: async (campaignId: number): Promise<any> => {
    try {
      const response = await apiClient.get(`/feedback-loop/ab-test/performance/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get campaign performance:', error);
      throw error;
    }
  },

  // Complete campaign
  completeCampaign: async (campaignId: number, winningVariant?: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/feedback-loop/ab-test/campaigns/${campaignId}/complete`, {
        winningVariant
      });
      return response.data;
    } catch (error) {
      console.error('Failed to complete campaign:', error);
      throw error;
    }
  },

  // Log communication
  logCommunication: async (log: {
    logType: string;
    serviceName: string;
    direction: 'inbound' | 'outbound';
    content: string;
    sessionId?: string;
    conversationId?: string;
    userId?: number;
    status?: string;
    workflowStage?: string;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/logs/communication', log);
      return response.data;
    } catch (error) {
      console.error('Failed to log communication:', error);
      throw error;
    }
  },

  // Get communication logs
  getCommunicationLogs: async (filters?: {
    sessionId?: string;
    conversationId?: string;
    userId?: number;
    logType?: string;
    serviceName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/feedback-loop/logs/communication', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to get communication logs:', error);
      throw error;
    }
  },

  // Update workflow state
  updateWorkflowState: async (state: {
    workflowType: string;
    entityId: string;
    currentStage: string;
    status: string;
    sessionId?: string;
    userId?: number;
    stageData?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/feedback-loop/workflow/state', state);
      return response.data;
    } catch (error) {
      console.error('Failed to update workflow state:', error);
      throw error;
    }
  },

  // Get workflow state
  getWorkflowState: async (workflowType: string, entityId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/feedback-loop/workflow/state/${workflowType}/${entityId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get workflow state:', error);
      throw error;
    }
  },

  // Generate session ID
  generateSessionId: async (): Promise<{ sessionId: string }> => {
    try {
      const response = await apiClient.post('/feedback-loop/session/generate');
      return response.data;
    } catch (error) {
      console.error('Failed to generate session ID:', error);
      throw error;
    }
  },
};

/**
 * Neural Network API
 * Per-client neural network instance management for training and predictions
 */
export const neuralNetworkAPI = {
  // Get all instances with optional filters
  getInstances: async (filters?: {
    clientId?: string;
    modelType?: string;
    status?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/neural-networks/instances', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to get neural network instances:', error);
      throw error;
    }
  },

  // Get a specific instance by ID
  getInstance: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/neural-networks/instances/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get neural network instance:', error);
      throw error;
    }
  },

  // Create a new neural network instance
  createInstance: async (instance: {
    clientId: string;
    modelType: string;
    configuration?: Record<string, any>;
    trainingData?: any[];
    metadata?: Record<string, any>;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/neural-networks/instances', instance);
      return response.data;
    } catch (error) {
      console.error('Failed to create neural network instance:', error);
      throw error;
    }
  },

  // Train a neural network instance
  trainInstance: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/neural-networks/instances/${id}/train`);
      return response.data;
    } catch (error) {
      console.error('Failed to train neural network instance:', error);
      throw error;
    }
  },

  // Make predictions using a neural network instance
  predict: async (id: string, input: any): Promise<any> => {
    try {
      const response = await apiClient.post(`/neural-networks/instances/${id}/predict`, { input });
      return response.data;
    } catch (error) {
      console.error('Failed to make prediction:', error);
      throw error;
    }
  },

  // Upload training dataset
  uploadDataset: async (formData: FormData): Promise<any> => {
    try {
      const response = await apiClient.post('/neural-networks/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload dataset:', error);
      throw error;
    }
  },

  // Get available model types
  getModelTypes: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/neural-networks/model-types');
      return response.data;
    } catch (error) {
      console.error('Failed to get model types:', error);
      throw error;
    }
  },
};

// Export all APIs
export const api = {
  dashboard: dashboardAPI,
  crawler: crawlerAPI,
  mining: miningAPI,
  blockchain: blockchainAPI,
  optimization: optimizationAPI,
  spaceMining: spaceMiningAPI,
  wallet: walletAPI,
  metaverse: metaverseAPI,
  admin: adminAPI,
  settings: settingsAPI,
  research: researchAPI,
  codebaseIndexing: codebaseIndexingAPI,
  dataMining: dataMiningAPI,
  leadGeneration: leadGenerationAPI,
  workflowGenerator: workflowGeneratorAPI,
  schemaLinking: schemaLinkingAPI,
  trainingData: trainingDataAPI,
  embeddings: embeddingsAPI,
  feedbackLoop: feedbackLoopAPI,
  neuralNetwork: neuralNetworkAPI,
};

// ============================================================================
// UNIFIED RAG API
// ============================================================================

export const unifiedRAGAPI = {
  // Chat endpoints
  chat: (message: string, options: any = {}) =>
    apiClient.post('/unified-rag/chat', { message, ...options }).then(res => res.data),
  
  chatStream: (message: string, options: any = {}) =>
    apiClient.post('/unified-rag/chat/stream', { message, ...options }).then(res => res.data),
  
  // Index endpoints
  indexText: (content: string, metadata: any = {}) =>
    apiClient.post('/unified-rag/index', { content, metadata }).then(res => res.data),
  
  indexFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/unified-rag/index/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  indexCodebase: (options: { path?: string; patterns?: string[] }) =>
    apiClient.post('/unified-rag/index/codebase', options).then(res => res.data),
  
  indexImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/unified-rag/index/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  // Search endpoints
  search: (query: string, options: any = {}) =>
    apiClient.post('/unified-rag/search', { query, ...options }).then(res => res.data),
  
  hybridSearch: (query: string, options: any = {}) =>
    apiClient.post('/unified-rag/search/hybrid', { query, ...options }).then(res => res.data),
  
  // Conversation endpoints
  getConversation: (id: string) =>
    apiClient.get(`/unified-rag/conversation/${id}`).then(res => res.data),
  
  deleteConversation: (id: string) =>
    apiClient.delete(`/unified-rag/conversation/${id}`).then(res => res.data),
  
  // Health & Config
  getHealth: () =>
    apiClient.get('/unified-rag/health').then(res => res.data),
  
  reinitialize: () =>
    apiClient.post('/unified-rag/reinitialize').then(res => res.data),
  
  getConfig: () =>
    apiClient.get('/unified-rag/config').then(res => res.data),
  
  updateConfig: (config: any) =>
    apiClient.post('/unified-rag/config', config).then(res => res.data),
  
  getModels: () =>
    apiClient.get('/unified-rag/models').then(res => res.data),
  
  // Document versions
  getDocumentVersions: (id: string) =>
    apiClient.get(`/unified-rag/document/${id}/versions`).then(res => res.data),
  
  // Document conversion
  convertDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/unified-rag/convert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  convertUrl: (url: string) =>
    apiClient.post('/unified-rag/convert/url', { url }).then(res => res.data),
  
  getConvertFormats: () =>
    apiClient.get('/unified-rag/convert/formats').then(res => res.data),
  
  // Agent execution
  executeAgent: (task: string, options: any = {}) =>
    apiClient.post('/unified-rag/agent/execute', { task, ...options }).then(res => res.data),
  
  streamAgent: (task: string, options: any = {}) =>
    apiClient.post('/unified-rag/agent/stream', { task, ...options }).then(res => res.data),
  
  // Features
  getFeatures: () =>
    apiClient.get('/unified-rag/features').then(res => res.data),
};

// ============================================================================
// AGENT ORCHESTRATION API
// ============================================================================

export const agentOrchestrationAPI = {
  // Status & Health
  getStatus: () =>
    apiClient.get('/agent-orchestration/status').then(res => res.data),
  
  getHealth: () =>
    apiClient.get('/agent-orchestration/health').then(res => res.data),
  
  getServiceStatus: (serviceId: string) =>
    apiClient.get(`/agent-orchestration/health/${serviceId}`).then(res => res.data),
  
  // Investigation
  investigateError: (errorReportId: string) =>
    apiClient.post(`/agent-orchestration/investigate/error/${errorReportId}`).then(res => res.data),
  
  investigateFeature: (description: string, components: string[] = []) =>
    apiClient.post('/agent-orchestration/investigate/feature', { description, components }).then(res => res.data),
  
  // Agent Task Management
  queueTask: (type: string, context: any, priority: number = 5) =>
    apiClient.post('/agent-orchestration/agent/task', { type, context, priority }).then(res => res.data),
  
  getTask: (taskId: string) =>
    apiClient.get(`/agent-orchestration/agent/task/${taskId}`).then(res => res.data),
  
  getAgent: (agentId: string) =>
    apiClient.get(`/agent-orchestration/agent/${agentId}`).then(res => res.data),
  
  getActiveAgents: () =>
    apiClient.get('/agent-orchestration/agents/active').then(res => res.data),
  
  getQueueStatus: () =>
    apiClient.get('/agent-orchestration/queue/status').then(res => res.data),
  
  // GitHub Integration
  createIssueFromError: (errorReportId: string, assignee?: string) =>
    apiClient.post(`/agent-orchestration/github/issue/error/${errorReportId}`, { assignee }).then(res => res.data),
};

// ============================================================================
// DEEPSEEK AUTOMATION API
// ============================================================================

export const deepseekAutomationAPI = {
  // System Status & Health
  getStatus: () =>
    apiClient.get('/deepseek-automation/status').then(res => res.data),
  
  getHealth: () =>
    apiClient.get('/deepseek-automation/health').then(res => res.data),
  
  // Service Management
  getServices: () =>
    apiClient.get('/deepseek-automation/services').then(res => res.data),
  
  getServiceStatus: (name: string) =>
    apiClient.get(`/deepseek-automation/services/${name}/status`).then(res => res.data),
  
  restartService: (name: string) =>
    apiClient.post(`/deepseek-automation/services/${name}/restart`).then(res => res.data),
  
  // Memory System
  getMemoryTasks: (pattern?: string, limit: number = 10) =>
    apiClient.get('/deepseek-automation/memory/tasks', { params: { pattern, limit } }).then(res => res.data),
  
  getMemorySolutions: (pattern?: string) =>
    apiClient.get('/deepseek-automation/memory/solutions', { params: { pattern } }).then(res => res.data),
  
  learnFromFeedback: (taskId: string, feedback: any) =>
    apiClient.post('/deepseek-automation/memory/learn', { taskId, feedback }).then(res => res.data),
  
  // Workflow Execution
  executeWorkflow: (workflow: string, params: any = {}) =>
    apiClient.post('/deepseek-automation/workflows/execute', { workflow, params }).then(res => res.data),
  
  getActiveWorkflows: () =>
    apiClient.get('/deepseek-automation/workflows/active').then(res => res.data),
  
  getWorkflowStatus: (id: string) =>
    apiClient.get(`/deepseek-automation/workflows/${id}/status`).then(res => res.data),
  
  // Error Analysis
  analyzeError: (error: string) =>
    apiClient.post('/deepseek-automation/errors/analyze', { error }).then(res => res.data),
  
  getRecentErrors: (limit: number = 10) =>
    apiClient.get('/deepseek-automation/errors/recent', { params: { limit } }).then(res => res.data),
  
  // CI/CD Operations
  deployToDev: (branchName: string) =>
    apiClient.post('/deepseek-automation/deploy/dev', { branchName }).then(res => res.data),
  
  deployToStaging: (branchName: string) =>
    apiClient.post('/deepseek-automation/deploy/staging', { branchName }).then(res => res.data),
  
  deployToProduction: (branchName: string, options: { strategy?: string; rollbackOnError?: boolean } = {}) =>
    apiClient.post('/deepseek-automation/deploy/production', { branchName, ...options }).then(res => res.data),
  
  rollbackDeployment: (deploymentId: string) =>
    apiClient.post('/deepseek-automation/deploy/rollback', { deploymentId }).then(res => res.data),
  
  getDeploymentStatus: () =>
    apiClient.get('/deepseek-automation/deploy/status').then(res => res.data),
};

/**
 * Workflow Wizard API
 * Interactive workflow template creation and instance management
 */
export const workflowWizardAPI = {
  // Schema Verification
  verifySchemas: () =>
    apiClient.get('/workflow-wizard/verify-schemas').then(res => res.data),
  
  // Workflow Templates
  getTemplates: () =>
    apiClient.get('/workflow-wizard/templates').then(res => res.data),
  
  getTemplate: (id: string) =>
    apiClient.get(`/workflow-wizard/templates/${id}`).then(res => res.data),
  
  createTemplate: (template: any) =>
    apiClient.post('/workflow-wizard/templates', template).then(res => res.data),
  
  updateTemplate: (id: string, template: any) =>
    apiClient.put(`/workflow-wizard/templates/${id}`, template).then(res => res.data),
  
  deleteTemplate: (id: string) =>
    apiClient.delete(`/workflow-wizard/templates/${id}`).then(res => res.data),
  
  // Workflow Instances
  createInstance: (data: { name: string; description?: string; templateId?: string; prompt?: string }) =>
    apiClient.post('/workflow-wizard/instances', data).then(res => res.data),
  
  getInstances: () =>
    apiClient.get('/workflow-wizard/instances').then(res => res.data),
  
  getInstance: (id: string) =>
    apiClient.get(`/workflow-wizard/instances/${id}`).then(res => res.data),
  
  executeInstance: (id: string) =>
    apiClient.post(`/workflow-wizard/instances/${id}/execute`).then(res => res.data),
  
  // AI Generation
  generateFromPrompt: (prompt: string) =>
    apiClient.post('/workflow-wizard/generate', { prompt }).then(res => res.data),
  
  // Schema Linking
  linkComponents: () =>
    apiClient.get('/workflow-wizard/schema-links').then(res => res.data),
  
  getWorkflowComponents: (workflowId: string) =>
    apiClient.get(`/workflow-wizard/workflows/${workflowId}/components`).then(res => res.data),
};

/**
 * Blockchain Optimization API
 * Blockchain algorithm benchmarking and DOM optimization
 */
export const blockchainOptimizationAPI = {
  // Benchmarking
  runBenchmark: (data: { seoDataset: any[]; options?: any }) =>
    apiClient.post('/blockchain-optimization/benchmark', data).then(res => res.data),
  
  benchmarkAlgorithm: (algorithm: string, data: { seoDataset: any[]; options?: any }) =>
    apiClient.post(`/blockchain-optimization/benchmark/algorithm/${algorithm}`, data).then(res => res.data),
  
  getResults: () =>
    apiClient.get('/blockchain-optimization/results').then(res => res.data),
  
  getBestAlgorithm: (criteria: 'speed' | 'throughput' | 'energy' | 'accuracy') =>
    apiClient.get(`/blockchain-optimization/best/${criteria}`).then(res => res.data),
  
  // DOM Optimization
  analyzeDom: (domAnalysis: any) =>
    apiClient.post('/blockchain-optimization/dom/analyze', { domAnalysis }).then(res => res.data),
  
  optimizeDom: (data: { domTree: any; config?: any }) =>
    apiClient.post('/blockchain-optimization/dom/optimize', data).then(res => res.data),
  
  getPatterns: (params?: { size?: number; complexity?: number; depth?: number }) =>
    apiClient.get('/blockchain-optimization/dom/patterns', { params }).then(res => res.data),
  
  // Simulation
  simulate: (data: { simulationParams: any }) =>
    apiClient.post('/blockchain-optimization/simulate', data).then(res => res.data),
  
  getSimulationResults: () =>
    apiClient.get('/blockchain-optimization/simulate/results').then(res => res.data),
  
  // Status
  getStatus: () =>
    apiClient.get('/blockchain-optimization/status').then(res => res.data),
  
  getAlgorithms: () =>
    apiClient.get('/blockchain-optimization/algorithms').then(res => res.data),
};

/**
 * Crawlee Service API
 * Web crawler management with Crawlee framework
 */
export const crawleeAPI = {
  // Crawler CRUD
  createCrawler: (data: any) =>
    apiClient.post('/crawlee/crawlers', data).then(res => res.data),
  
  getCrawlers: (filters?: { status?: string; campaign_id?: string; type?: string; limit?: number }) =>
    apiClient.get('/crawlee/crawlers', { params: filters }).then(res => res.data),
  
  getCrawler: (id: string) =>
    apiClient.get(`/crawlee/crawlers/${id}`).then(res => res.data),
  
  updateCrawler: (id: string, data: any) =>
    apiClient.put(`/crawlee/crawlers/${id}`, data).then(res => res.data),
  
  deleteCrawler: (id: string) =>
    apiClient.delete(`/crawlee/crawlers/${id}`).then(res => res.data),
  
  // Crawler Control
  startCrawler: (id: string, seedUrls?: string[]) =>
    apiClient.post(`/crawlee/crawlers/${id}/start`, { seedUrls }).then(res => res.data),
  
  pauseCrawler: (id: string) =>
    apiClient.post(`/crawlee/crawlers/${id}/pause`).then(res => res.data),
  
  resumeCrawler: (id: string) =>
    apiClient.post(`/crawlee/crawlers/${id}/resume`).then(res => res.data),
  
  stopCrawler: (id: string) =>
    apiClient.post(`/crawlee/crawlers/${id}/stop`).then(res => res.data),
  
  // Crawler Data
  getCrawlerStats: (id: string) =>
    apiClient.get(`/crawlee/crawlers/${id}/stats`).then(res => res.data),
  
  addSeeds: (id: string, seeds: string[]) =>
    apiClient.post(`/crawlee/crawlers/${id}/seeds`, { seeds }).then(res => res.data),
  
  getCrawlerResults: (id: string, options?: { limit?: number; offset?: number }) =>
    apiClient.get(`/crawlee/crawlers/${id}/results`, { params: options }).then(res => res.data),
  
  getCrawlerLogs: (id: string, options?: { limit?: number; level?: string }) =>
    apiClient.get(`/crawlee/crawlers/${id}/logs`, { params: options }).then(res => res.data),
};

// =============================================================================
// SEO Campaign Management API
// =============================================================================

export const seoCampaignAPI = {
  // Campaign CRUD
  getCampaigns: (params?: { status?: string; client_id?: number; active_mining?: boolean; page?: number; limit?: number }) =>
    apiClient.get('/seo/campaigns', { params }).then(res => res.data),
  
  getCampaign: (campaignId: string) =>
    apiClient.get(`/seo/campaigns/${campaignId}`).then(res => res.data),
  
  createCampaign: (data: {
    name: string;
    description?: string;
    client_id?: number;
    target_keywords?: string[];
    target_urls?: string[];
    industry?: string;
    status?: string;
    priority?: string;
    start_date?: string;
    end_date?: string;
    schedule_cron?: string;
    neural_network_enabled?: boolean;
    neural_network_config?: any;
    active_mining?: boolean;
    mining_rules?: any;
    created_by?: string;
  }) =>
    apiClient.post('/seo/campaigns', data).then(res => res.data),
  
  updateCampaign: (campaignId: string, data: any) =>
    apiClient.put(`/seo/campaigns/${campaignId}`, data).then(res => res.data),
  
  deleteCampaign: (campaignId: string) =>
    apiClient.delete(`/seo/campaigns/${campaignId}`).then(res => res.data),
  
  // Campaign Attributes
  getCampaignAttributes: (campaignId: string) =>
    apiClient.get(`/seo/campaigns/${campaignId}/attributes`).then(res => res.data),
  
  addCampaignAttributes: (campaignId: string, attributes: any[]) =>
    apiClient.post(`/seo/campaigns/${campaignId}/attributes`, { attributes }).then(res => res.data),
  
  deleteCampaignAttribute: (campaignId: string, attributeKey: string) =>
    apiClient.delete(`/seo/campaigns/${campaignId}/attributes/${attributeKey}`).then(res => res.data),
  
  // Seed URLs
  getCampaignSeedUrls: (campaignId: string) =>
    apiClient.get(`/seo/campaigns/${campaignId}/seed-urls`).then(res => res.data),
  
  addCampaignSeedUrls: (campaignId: string, urls: string[]) =>
    apiClient.post(`/seo/campaigns/${campaignId}/seed-urls`, { urls }).then(res => res.data),
  
  // Campaign Stats
  getCampaignStats: (campaignId: string) =>
    apiClient.get(`/seo/campaigns/${campaignId}/stats`).then(res => res.data),
};

/**
 * Client Site Management API
 * Manages client sites, script injection, and workflow generation
 */
export const clientSiteAPI = {
  // Sites CRUD
  getSites: () =>
    apiClient.get('/client-sites').then(res => res.data),
  
  getSite: (id: number) =>
    apiClient.get(`/client-sites/${id}`).then(res => res.data),
  
  createSite: (data: { domain: string; userId: string; subscriptionTier: string; config?: any }) =>
    apiClient.post('/client-sites', data).then(res => res.data),
  
  updateSite: (id: number, data: { domain?: string; userId?: string; subscriptionTier?: string; config?: any }) =>
    apiClient.put(`/client-sites/${id}`, data).then(res => res.data),
  
  deleteSite: (id: number) =>
    apiClient.delete(`/client-sites/${id}`).then(res => res.data),
  
  // Script Management
  generateScript: (id: number) =>
    apiClient.post(`/client-sites/${id}/generate-script`).then(res => res.data),
  
  // Workflow Management
  createWorkflows: (id: number) =>
    apiClient.post(`/client-sites/${id}/create-workflows`).then(res => res.data),
  
  createWorkflowsDeepseek: (id: number) =>
    apiClient.post(`/client-sites/${id}/create-workflows/deepseek`).then(res => res.data),
  
  // Injection Status
  getInjectionStatus: (id: number) =>
    apiClient.get(`/client-sites/${id}/injection-status`).then(res => res.data),
};

/**
 * N8N Workflow Management API
 * Manages N8N workflows with database persistence and execution tracking
 */
export const n8nWorkflowAPI = {
  // Health & Status
  getHealth: () =>
    apiClient.get('/n8n-workflows/health').then(res => res.data),
  
  getServiceStatus: () =>
    apiClient.get('/n8n-workflows/service-status').then(res => res.data),
  
  // Workflows CRUD
  getWorkflows: () =>
    apiClient.get('/n8n-workflows').then(res => res.data),
  
  getWorkflow: (id: string) =>
    apiClient.get(`/n8n-workflows/${id}`).then(res => res.data),
  
  createWorkflow: (data: { name: string; nodes: any[]; connections: any; settings?: any; tags?: string[] }) =>
    apiClient.post('/n8n-workflows', data).then(res => res.data),
  
  updateWorkflow: (id: string, data: { name?: string; nodes?: any[]; connections?: any; settings?: any; active?: boolean; tags?: string[] }) =>
    apiClient.put(`/n8n-workflows/${id}`, data).then(res => res.data),
  
  deleteWorkflow: (id: string) =>
    apiClient.delete(`/n8n-workflows/${id}`).then(res => res.data),
  
  // Workflow Execution
  executeWorkflow: (id: string, data?: any) =>
    apiClient.post(`/n8n-workflows/${id}/execute`, { data }).then(res => res.data),
  
  startWorkflow: (id: string) =>
    apiClient.post(`/n8n-workflows/${id}/start`).then(res => res.data),
  
  stopWorkflow: (id: string) =>
    apiClient.post(`/n8n-workflows/${id}/stop`).then(res => res.data),
  
  getExecutions: (id: string) =>
    apiClient.get(`/n8n-workflows/${id}/executions`).then(res => res.data),
  
  // Metrics
  getSystemMetrics: () =>
    apiClient.get('/n8n-workflows/metrics/system').then(res => res.data),
  
  // Templates
  getTemplates: () =>
    apiClient.get('/n8n-workflows/templates').then(res => res.data),
  
  getTemplate: (id: string) =>
    apiClient.get(`/n8n-workflows/templates/${id}`).then(res => res.data),
  
  createFromTemplate: (templateId: string, config: any) =>
    apiClient.post('/n8n-workflows/from-template', { templateId, config }).then(res => res.data),
};

/**
 * DeepSeek Database Integration API
 * Safe database access with query whitelisting and AI-powered suggestions
 */
export const deepseekDatabaseAPI = {
  // Get database schema
  getSchema: () =>
    apiClient.get('/deepseek-db/schema').then(res => res.data),
  
  // Execute safe read-only query
  executeQuery: (query: string, params?: any[]) =>
    apiClient.post('/deepseek-db/query', { query, params }).then(res => res.data),
  
  // Get AI-powered query suggestions
  suggestQuery: (intent: string, context?: any) =>
    apiClient.post('/deepseek-db/suggest', { intent, context }).then(res => res.data),
  
  // Get example queries
  getExamples: () =>
    apiClient.get('/deepseek-db/examples').then(res => res.data),
};

/**
 * MCP Server Management API
 * AI agent instances with schema linking
 */
export const mcpServerAPI = {
  // Get all MCP servers
  getServers: (filters?: any) =>
    apiClient.get('/mcp/servers', { params: filters }).then(res => res.data),
  
  // Get specific MCP server
  getServer: (id: string) =>
    apiClient.get(`/mcp/servers/${id}`).then(res => res.data),
  
  // Create new MCP server
  createServer: (data: any) =>
    apiClient.post('/mcp/servers', data).then(res => res.data),
  
  // Update MCP server
  updateServer: (id: string, data: any) =>
    apiClient.put(`/mcp/servers/${id}`, data).then(res => res.data),
  
  // Delete MCP server
  deleteServer: (id: string) =>
    apiClient.delete(`/mcp/servers/${id}`).then(res => res.data),
  
  // Get available schemas
  getSchemas: () =>
    apiClient.get('/mcp/schemas').then(res => res.data),
  
  // Link schema to server
  linkSchema: (serverId: string, schemaId: string) =>
    apiClient.post(`/mcp/servers/${serverId}/schemas`, { schema_id: schemaId }).then(res => res.data),
  
  // Unlink schema from server
  unlinkSchema: (serverId: string, schemaId: string) =>
    apiClient.delete(`/mcp/servers/${serverId}/schemas/${schemaId}`).then(res => res.data),
  
  // Execute MCP server tool
  executeServer: (serverId: string, data: any) =>
    apiClient.post(`/mcp/servers/${serverId}/execute`, data).then(res => res.data),
  
  // Get execution history
  getExecutions: (serverId: string) =>
    apiClient.get(`/mcp/servers/${serverId}/executions`).then(res => res.data),
  
  // Get health status
  getHealth: () =>
    apiClient.get('/mcp/health').then(res => res.data),
};

/**
 * DeepSeek Chat API
 * AI chat conversations with DeepSeek models
 */
export const deepseekChatAPI = {
  // Get service status
  getStatus: () =>
    apiClient.get('/deepseek-chat/status').then(res => res.data),
  
  // List conversations
  getConversations: (limit?: number, archived?: boolean) =>
    apiClient.get('/deepseek-chat/conversations', { params: { limit, archived } }).then(res => res.data),
  
  // Create new conversation
  createConversation: (data: { title?: string; userId?: string; context?: any }) =>
    apiClient.post('/deepseek-chat/conversations', data).then(res => res.data),
  
  // Get conversation
  getConversation: (id: string) =>
    apiClient.get(`/deepseek-chat/conversations/${id}`).then(res => res.data),
  
  // Send message
  sendMessage: (id: string, message: string) =>
    apiClient.post(`/deepseek-chat/conversations/${id}/messages`, { message }).then(res => res.data),
  
  // Archive conversation
  archiveConversation: (id: string) =>
    apiClient.post(`/deepseek-chat/conversations/${id}/archive`).then(res => res.data),
  
  // Delete conversation
  deleteConversation: (id: string) =>
    apiClient.delete(`/deepseek-chat/conversations/${id}`).then(res => res.data),
};

/**
 * Conversation History API
 * DeepSeek conversation tracking with knowledge graph
 */
export const conversationHistoryAPI = {
  // Get all conversations
  getConversations: () =>
    apiClient.get('/conversations').then(res => res.data),
  
  // Create conversation
  createConversation: (data: any) =>
    apiClient.post('/conversations', data).then(res => res.data),
  
  // Get specific conversation
  getConversation: (conversationId: string) =>
    apiClient.get(`/conversations/${conversationId}`).then(res => res.data),
  
  // Add message to conversation
  addMessage: (conversationId: string, message: any) =>
    apiClient.post(`/conversations/${conversationId}/messages`, message).then(res => res.data),
  
  // Get messages for conversation
  getMessages: (conversationId: string) =>
    apiClient.get(`/conversations/${conversationId}/history`).then(res => res.data),
  
  // Archive conversation
  archiveConversation: (conversationId: string) =>
    apiClient.post(`/conversations/${conversationId}/archive`).then(res => res.data),
  
  // Get knowledge graph
  getKnowledgeGraph: (conversationId?: string) =>
    conversationId 
      ? apiClient.get(`/conversations/${conversationId}/knowledge-graph`).then(res => res.data)
      : apiClient.get('/conversations/knowledge-graph/global').then(res => res.data),
  
  // Get learning patterns
  getLearningPatterns: (limit?: number) =>
    apiClient.get('/conversations/learning/patterns', { params: { limit } }).then(res => res.data),
  
  // Get statistics
  getStats: () =>
    apiClient.get('/conversations/stats').then(res => res.data),
};

/**
 * Enhanced RAG API - Advanced RAG with DeepSeek Tools and ORC Integration
 */
export const enhancedRAGAPI = {
  // Health check
  getHealth: () =>
    apiClient.get('/enhanced-rag/health').then(res => res.data),
  
  // Chat with tools (streaming)
  chatWithTools: (data: { messages: any[], conversationId?: string, mode?: string, enableTools?: boolean, temperature?: number, maxTokens?: number }) =>
    apiClient.post('/enhanced-rag/chat/tools/stream', data).then(res => res.data),
  
  // Execute tool
  executeTool: (toolName: string, params: any) =>
    apiClient.post('/enhanced-rag/tool/execute', { toolName, params }).then(res => res.data),
  
  // Execute command
  executeCommand: (command: string) =>
    apiClient.post('/enhanced-rag/command/execute', { command }).then(res => res.data),
  
  // Git operations
  gitOperation: (operation: string, params: any) =>
    apiClient.post(`/enhanced-rag/git/${operation}`, params).then(res => res.data),
  
  // File operations
  fileOperation: (operation: string, params: any) =>
    apiClient.post(`/enhanced-rag/file/${operation}`, params).then(res => res.data),
  
  // Project operations
  projectOperation: (operation: string, params: any) =>
    apiClient.post(`/enhanced-rag/project/${operation}`, params).then(res => res.data),
  
  // Get conversation
  getConversation: (id: string) =>
    apiClient.get(`/enhanced-rag/conversation/${id}`).then(res => res.data),
  
  // Delete conversation
  deleteConversation: (id: string) =>
    apiClient.delete(`/enhanced-rag/conversation/${id}`).then(res => res.data),
  
  // Get conversations
  getConversations: () =>
    apiClient.get('/enhanced-rag/conversations').then(res => res.data),
  
  // Index codebase
  indexCodebase: (params: any) =>
    apiClient.post('/enhanced-rag/codebase/index', params).then(res => res.data),
  
  // Get available tools
  getTools: () =>
    apiClient.get('/enhanced-rag/tools').then(res => res.data),
  
  // Get system info
  getSystemInfo: () =>
    apiClient.get('/enhanced-rag/system/info').then(res => res.data),
  
  // Get project info
  getProjectInfo: () =>
    apiClient.get('/enhanced-rag/project/info').then(res => res.data),
};

// ============================================================
// Category Management API
// ============================================================
export const categoryManagementAPI = {
  // Get all categories
  getCategories: (params?: { type?: string, status?: string }) =>
    apiClient.get('/category-management/categories', { params }).then(res => res.data),
  
  // Get category by ID
  getCategory: (id: string) =>
    apiClient.get(`/category-management/categories/${id}`).then(res => res.data),
  
  // Create category
  createCategory: (data: any) =>
    apiClient.post('/category-management/categories', data).then(res => res.data),
  
  // Update category
  updateCategory: (id: string, data: any) =>
    apiClient.put(`/category-management/categories/${id}`, data).then(res => res.data),
  
  // Delete category
  deleteCategory: (id: string) =>
    apiClient.delete(`/category-management/categories/${id}`).then(res => res.data),
  
  // Get category tree
  getCategoryTree: () =>
    apiClient.get('/category-management/categories/tree').then(res => res.data),
  
  // Get subcategories
  getSubcategories: (id: string) =>
    apiClient.get(`/category-management/categories/${id}/subcategories`).then(res => res.data),
  
  // Generate CRUD for category
  generateCRUD: (id: string) =>
    apiClient.post(`/category-management/categories/${id}/generate-crud`).then(res => res.data),
  
  // Get CRUD generation status
  getCRUDStatus: (id: string) =>
    apiClient.get(`/category-management/categories/${id}/crud-status`).then(res => res.data),
  
  // Validate schema
  validateSchema: (id: string) =>
    apiClient.post(`/category-management/categories/${id}/validate-schema`).then(res => res.data),
  
  // Get schema definition
  getSchemaDefinition: (id: string) =>
    apiClient.get(`/category-management/categories/${id}/schema`).then(res => res.data),
  
  // Get category statistics
  getCategoryStats: () =>
    apiClient.get('/category-management/stats').then(res => res.data),
};

export default api;
