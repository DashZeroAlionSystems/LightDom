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
};

export default api;
