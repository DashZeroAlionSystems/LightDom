import axios from 'axios';

export interface SEOAnalysis {
  url: string;
  seoScore: number;
  timestamp: string;
  coreWebVitals: {
    lcp: { value: number; status: string };
    fid: { value: number; status: string };
    cls: { value: number; status: string };
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    impact: string;
  }>;
}

export interface DomainMetrics {
  domain: string;
  avgScore: number;
  totalPages: number;
  lastAnalysis: string;
  topPages: Array<{
    url: string;
    seoScore: number;
    timestamp: string;
  }>;
}

export interface AIRecommendation {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  improvement: number;
}

export interface TrendData {
  date: string;
  avgScore: number;
  pageCount: number;
  avgLCP: number;
  avgFID: number;
  avgCLS: number;
}

export interface ModelStatus {
  loaded: boolean;
  training: boolean;
  metrics: {
    trainingSamples: number;
    validationAccuracy: number;
    loss: number;
    mae: number;
    lastUpdated: string;
  };
}

export interface SEOConfig {
  apiUrl: string;
  apiKey: string;
}

class SEOApiService {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey
    };
  }

  private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.config.apiUrl}${endpoint}`,
        headers: this.getHeaders(),
        data
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      }
      throw error;
    }
  }

  async getHealth(): Promise<{ status: string; timestamp: string; services: any }> {
    return this.makeRequest('/api/seo/health');
  }

  async analyzeWebsite(url: string, includeAIRecommendations: boolean = true): Promise<{
    success: boolean;
    url: string;
    analysis: SEOAnalysis;
    aiRecommendations?: AIRecommendation[];
    cached: boolean;
  }> {
    return this.makeRequest('/api/seo/analyze', 'POST', {
      url,
      includeAIRecommendations
    });
  }

  async getDomainOverview(domain: string, includePages: boolean = true, limit: number = 10): Promise<{
    success: boolean;
    domain: string;
    metrics: DomainMetrics;
    pages: Array<{
      url: string;
      seoScore: number;
      timestamp: string;
    }>;
    totalPages: number;
  }> {
    return this.makeRequest(`/api/seo/domain/${domain}?includePages=${includePages}&limit=${limit}`);
  }

  async compareDomains(domains: string[], limit: number = 10): Promise<{
    success: boolean;
    comparison: Array<{
      domain: string;
      metrics: DomainMetrics;
      topPages: Array<{
        url: string;
        seoScore: number;
        timestamp: string;
      }>;
    }>;
    bestPerforming: {
      domain: string;
      metrics: DomainMetrics;
    };
    averageScores: number[];
    totalDomains: number;
  }> {
    return this.makeRequest('/api/seo/compare-domains', 'POST', {
      domains,
      limit
    });
  }

  async getAIRecommendations(url: string, category?: string, limit: number = 10): Promise<{
    success: boolean;
    url: string;
    recommendations: AIRecommendation[];
    total: number;
    category: string;
  }> {
    return this.makeRequest('/api/seo/recommendations', 'POST', {
      url,
      category,
      limit
    });
  }

  async predictSEOScore(url: string, optimizations: any): Promise<{
    success: boolean;
    url: string;
    currentScore: number;
    predictedScore: number;
    improvement: number;
    optimizations: any;
    impact: string;
  }> {
    return this.makeRequest('/api/seo/predict', 'POST', {
      url,
      optimizations
    });
  }

  async getSEOTrends(domain: string, days: number = 30): Promise<{
    success: boolean;
    domain: string;
    period: string;
    trends: TrendData[];
    totalDataPoints: number;
  }> {
    return this.makeRequest(`/api/seo/trends/${domain}?days=${days}`);
  }

  async getModelStatus(): Promise<{
    success: boolean;
    model: ModelStatus;
  }> {
    return this.makeRequest('/api/seo/model-status');
  }

  async trainModel(): Promise<{
    success: boolean;
    message: string;
    status: string;
  }> {
    return this.makeRequest('/api/seo/train-model', 'POST');
  }

  async getUsage(): Promise<{
    success: boolean;
    usage: {
      apiKey: string;
      requestsUsed: number;
      requestsLimit: number;
      lastUsed: string;
    };
  }> {
    return this.makeRequest('/api/seo/usage');
  }

  // Configuration methods
  updateConfig(config: Partial<SEOConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SEOConfig {
    return { ...this.config };
  }
}

// Create default instance
const defaultConfig: SEOConfig = {
  apiUrl: 'http://localhost:3002',
  apiKey: 'demo-api-key'
};

export const seoApi = new SEOApiService(defaultConfig);

export default SEOApiService;