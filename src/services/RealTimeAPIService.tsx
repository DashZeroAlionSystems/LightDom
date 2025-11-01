/**
 * Real-time API Service
 * Unified service for fetching real-time data from all sources
 * Connects to TensorFlow, SEO Analytics, and other services
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import TensorFlowService, { TensorFlowMetrics } from './TensorFlowService';
import SEOAnalyticsService, { SEOMetrics } from './SEOAnalyticsService';
import SEOGenerationService, { SEOReport } from './SEOGenerationService';

export interface DashboardStats {
  hashRate: number;
  workers: number;
  earnings: number;
  efficiency: number;
  cpu: number;
  gpu: number;
  memory: number;
  temperature: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastUpdate: string;
  activeServices: number;
  totalServices: number;
}

export interface RealTimeData {
  dashboard: DashboardStats;
  systemHealth: SystemHealth;
  tensorflow: TensorFlowMetrics;
  seo: SEOMetrics;
  lastUpdated: string;
}

export interface APIConfig {
  endpoint: string;
  apiKey: string;
  refreshInterval: number;
  retryAttempts: number;
  timeout: number;
}

class RealTimeAPIService {
  private config: APIConfig;
  private tensorflowService: ReturnType<typeof TensorFlowService>;
  private seoAnalyticsService: ReturnType<typeof SEOAnalyticsService>;
  private seoGenerationService: ReturnType<typeof SEOGenerationService>;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscribers: Map<string, (data: any) => void> = new Map();

  constructor(config: Partial<APIConfig> = {}) {
    this.config = {
      endpoint: 'ws://localhost:8080/realtime',
      apiKey: 'your-api-key',
      refreshInterval: 2000,
      retryAttempts: 3,
      timeout: 10000,
      ...config,
    };

    this.tensorflowService = TensorFlowService();
    this.seoAnalyticsService = SEOAnalyticsService();
    this.seoGenerationService = SEOGenerationService();
  }

  // Initialize WebSocket connection
  connect = useCallback(() => {
    try {
      this.websocket = new WebSocket(this.config.endpoint);

      this.websocket.onopen = () => {
        console.log('🔌 Real-time API connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleIncomingData(data);
      };

      this.websocket.onclose = () => {
        console.log('🔌 Real-time API disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('🔌 WebSocket error:', error);
      };
    } catch (error) {
      console.error('🔌 Failed to connect to real-time API:', error);
      this.attemptReconnect();
    }
  }, [this.config.endpoint]);

  // Attempt to reconnect WebSocket
  private attemptReconnect = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('🔌 Max reconnection attempts reached');
      this.fallbackToPolling();
    }
  };

  // Fallback to HTTP polling if WebSocket fails
  private fallbackToPolling = () => {
    console.log('🔄 Falling back to HTTP polling');
    setInterval(() => {
      this.fetchAllData();
    }, this.config.refreshInterval);
  };

  // Start heartbeat to keep connection alive
  private startHeartbeat = () => {
    setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);
  };

  // Handle incoming WebSocket data
  private handleIncomingData = (data: any) => {
    const { type, payload } = data;
    
    // Notify subscribers
    const subscribers = this.subscribers.get(type);
    if (subscribers) {
      subscribers.forEach(callback => callback(payload));
    }
  };

  // Subscribe to specific data types
  subscribe = (type: string, callback: (data: any) => void) => {
    const key = `${type}-${Date.now()}`;
    this.subscribers.set(key, callback);
    
    return () => {
      this.subscribers.delete(key);
    };
  };

  // Fetch all real-time data
  fetchAllData = useCallback(async (): Promise<RealTimeData> => {
    try {
      const [dashboardData, tensorflowData, seoData] = await Promise.all([
        this.fetchDashboardStats(),
        this.fetchTensorFlowMetrics(),
        this.fetchSEOMetrics(),
      ]);

      const systemHealth = this.calculateSystemHealth(dashboardData, tensorflowData, seoData);

      const data: RealTimeData = {
        dashboard: dashboardData,
        systemHealth,
        tensorflow: tensorflowData,
        seo: seoData,
        lastUpdated: new Date().toISOString(),
      };

      // Notify all subscribers
      this.subscribers.forEach(callback => callback(data));

      return data;
    } catch (error) {
      console.error('❌ Failed to fetch real-time data:', error);
      throw error;
    }
  }, []);

  // Fetch dashboard statistics
  private fetchDashboardStats = async (): Promise<DashboardStats> => {
    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hashRate: Math.floor(Math.random() * 150) + 50,
          workers: Math.floor(Math.random() * 8) + 1,
          earnings: Math.random() * 0.1,
          efficiency: Math.floor(Math.random() * 30) + 70,
          cpu: Math.floor(Math.random() * 40) + 30,
          gpu: Math.floor(Math.random() * 50) + 40,
          memory: Math.floor(Math.random() * 30) + 50,
          temperature: Math.floor(Math.random() * 20) + 55,
        });
      }, Math.random() * 500 + 200);
    });
  };

  // Fetch TensorFlow metrics
  private fetchTensorFlowMetrics = async (): Promise<TensorFlowMetrics> => {
    return this.tensorflowService.getMetrics();
  };

  // Fetch SEO metrics
  private fetchSEOMetrics = async (): Promise<SEOMetrics> => {
    return this.seoAnalyticsService.getMetrics();
  };

  // Calculate system health
  private calculateSystemHealth = (
    dashboard: DashboardStats,
    tensorflow: TensorFlowMetrics,
    seo: SEOMetrics
  ): SystemHealth => {
    const issues = [];
    
    if (dashboard.temperature > 80) issues.push('High temperature');
    if (tensorflow.modelAccuracy < 80) issues.push('Low model accuracy');
    if (seo.overallScore < 70) issues.push('Poor SEO score');
    if (dashboard.efficiency < 60) issues.push('Low efficiency');

    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 2 ? 'warning' : 'critical';

    return {
      status,
      uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24 hours
      lastUpdate: new Date().toISOString(),
      activeServices: 3,
      totalServices: 3,
    };
  };

  // Send command to start/stop mining
  controlMining = async (action: 'start' | 'stop') => {
    try {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'mining_control',
          payload: { action }
        }));
      } else {
        // Fallback to HTTP API
        await fetch('/api/mining/control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ action }),
        });
      }
    } catch (error) {
      console.error('❌ Failed to control mining:', error);
      throw error;
    }
  };

  // Send command to start/stop TensorFlow training
  controlTensorFlow = async (action: 'start_training' | 'stop_training' | 'deploy_model') => {
    try {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'tensorflow_control',
          payload: { action }
        }));
      } else {
        // Fallback to HTTP API
        await fetch('/api/tensorflow/control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ action }),
        });
      }
    } catch (error) {
      console.error('❌ Failed to control TensorFlow:', error);
      throw error;
    }
  };

  // Run SEO analysis
  runSEOAnalysis = async (url: string) => {
    try {
      this.seoAnalyticsService.runAnalysis();
      
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'seo_analysis',
          payload: { url }
        }));
      }
    } catch (error) {
      console.error('❌ Failed to run SEO analysis:', error);
      throw error;
    }
  };

  // Generate SEO report
  generateSEOReport = async (url: string): Promise<SEOReport> => {
    try {
      this.seoGenerationService.generateNewReport(url);
      
      // In real implementation, this would call the actual API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            url,
            generatedAt: new Date().toISOString(),
            metaTags: {
              title: 'LightDom - Professional Dashboard',
              description: 'Advanced mining and analytics dashboard',
              keywords: ['lightdom', 'dashboard', 'mining'],
              canonical: url,
              ogTitle: 'LightDom Dashboard',
              ogDescription: 'Advanced analytics platform',
              ogImage: `${url}/og-image.jpg`,
              twitterCard: 'summary_large_image',
              twitterTitle: 'LightDom',
              twitterDescription: 'Professional dashboard',
              robots: 'index, follow',
              author: 'LightDom Team',
              viewport: 'width=device-width, initial-scale=1.0',
            },
            sitemapEntries: 10,
            robotsTxt: 'User-agent: *\nAllow: /',
            contentSuggestions: ['Add more content'],
            technicalImprovements: ['Optimize images'],
          });
        }, 2000);
      });
    } catch (error) {
      console.error('❌ Failed to generate SEO report:', error);
      throw error;
    }
  };

  // Get historical data
  getHistoricalData = async (metric: string, timeRange: string) => {
    try {
      const response = await fetch(`/api/historical/${metric}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch historical data:', error);
      // Return mock data for development
      return this.generateMockHistoricalData(metric, timeRange);
    }
  };

  // Generate mock historical data for development
  private generateMockHistoricalData = (metric: string, timeRange: string) => {
    const points = timeRange === '1h' ? 60 : timeRange === '24h' ? 144 : 168;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      data.push({
        timestamp: new Date(Date.now() - (points - i) * 60000).toISOString(),
        value: Math.random() * 100,
      });
    }
    
    return data;
  };

  // Disconnect WebSocket
  disconnect = () => {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscribers.clear();
  };

  // Get service instances
  getTensorFlowService = () => this.tensorflowService;
  getSEOAnalyticsService = () => this.seoAnalyticsService;
  getSEOGenerationService = () => this.seoGenerationService;
}

// Singleton instance
let apiServiceInstance: RealTimeAPIService | null = null;

export const getRealTimeAPIService = (config?: Partial<APIConfig>) => {
  if (!apiServiceInstance) {
    apiServiceInstance = new RealTimeAPIService(config);
  }
  return apiServiceInstance;
};

export default RealTimeAPIService;
