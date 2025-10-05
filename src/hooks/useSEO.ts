import { useState, useEffect, useCallback } from 'react';
import { seoApi, SEOAnalysis, DomainMetrics, AIRecommendation, TrendData, ModelStatus } from '../api/seoApi';

export interface SEOStats {
  totalAnalyses: number;
  domainsAnalyzed: number;
  avgSEOScore: number;
  aiRecommendations: number;
}

export interface SEOTopDomain {
  domain: string;
  score: number;
  pages: number;
}

export interface SEORecentActivity {
  action: string;
  domain: string;
  time: string;
  score?: number;
  improvement?: number;
}

export const useSEO = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SEOStats>({
    totalAnalyses: 0,
    domainsAnalyzed: 0,
    avgSEOScore: 0,
    aiRecommendations: 0
  });
  const [topDomains, setTopDomains] = useState<SEOTopDomain[]>([]);
  const [recentActivity, setRecentActivity] = useState<SEORecentActivity[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);

  const loadSEOOverview = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data intentionally used here for demonstration purposes
      setStats({
        totalAnalyses: 1234,
        domainsAnalyzed: 567,
        avgSEOScore: 78.5,
        aiRecommendations: 2890
      });

      setTopDomains([
        { domain: 'example.com', score: 95, pages: 45 },
        { domain: 'competitor.com', score: 87, pages: 32 },
        { domain: 'another.com', score: 82, pages: 28 },
        { domain: 'test.com', score: 78, pages: 15 },
        { domain: 'demo.com', score: 75, pages: 12 }
      ]);

      setRecentActivity([
        { action: 'Website Analysis', domain: 'example.com', time: '2 minutes ago', score: 95 },
        { action: 'AI Recommendation', domain: 'competitor.com', time: '5 minutes ago', improvement: 12 },
        { action: 'Domain Comparison', domain: 'example.com vs competitor.com', time: '8 minutes ago' },
        { action: 'Trend Analysis', domain: 'another.com', time: '12 minutes ago' },
        { action: 'Model Training', domain: '1,000 samples', time: '1 hour ago' }
      ]);
    } catch (error) {
      console.error('Failed to load SEO overview:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeWebsite = useCallback(async (url: string): Promise<SEOAnalysis | null> => {
    try {
      setLoading(true);
      const result = await seoApi.analyzeWebsite(url, true);
      return result.analysis;
    } catch (error) {
      console.error('Website analysis failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDomainOverview = useCallback(async (domain: string): Promise<DomainMetrics | null> => {
    try {
      setLoading(true);
      const result = await seoApi.getDomainOverview(domain, true, 10);
      return result.metrics;
    } catch (error) {
      console.error('Domain overview failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const compareDomains = useCallback(async (domains: string[]): Promise<any> => {
    try {
      setLoading(true);
      const result = await seoApi.compareDomains(domains, 10);
      return result;
    } catch (error) {
      console.error('Domain comparison failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAIRecommendations = useCallback(async (url: string, category?: string): Promise<AIRecommendation[]> => {
    try {
      setLoading(true);
      const result = await seoApi.getAIRecommendations(url, category, 10);
      return result.recommendations;
    } catch (error) {
      console.error('AI recommendations failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const predictSEOScore = useCallback(async (url: string, optimizations: any): Promise<any> => {
    try {
      setLoading(true);
      const result = await seoApi.predictSEOScore(url, optimizations);
      return result;
    } catch (error) {
      console.error('Score prediction failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSEOTrends = useCallback(async (domain: string, days: number = 30): Promise<TrendData[]> => {
    try {
      setLoading(true);
      const result = await seoApi.getSEOTrends(domain, days);
      return result.trends;
    } catch (error) {
      console.error('SEO trends failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getModelStatus = useCallback(async (): Promise<ModelStatus | null> => {
    try {
      const result = await seoApi.getModelStatus();
      setModelStatus(result.model);
      return result.model;
    } catch (error) {
      console.error('Failed to get model status:', error);
      return null;
    }
  }, []);

  const trainModel = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      await seoApi.trainModel();
      // Poll for training status
      setTimeout(() => {
        getModelStatus();
      }, 5000);
      return true;
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getModelStatus]);

  const updateConfig = useCallback((config: Partial<{ apiUrl: string; apiKey: string }>) => {
    seoApi.updateConfig(config);
  }, []);

  useEffect(() => {
    loadSEOOverview();
    getModelStatus();
  }, [loadSEOOverview, getModelStatus]);

  return {
    loading,
    stats,
    topDomains,
    recentActivity,
    modelStatus,
    loadSEOOverview,
    analyzeWebsite,
    getDomainOverview,
    compareDomains,
    getAIRecommendations,
    predictSEOScore,
    getSEOTrends,
    getModelStatus,
    trainModel,
    updateConfig
  };
};