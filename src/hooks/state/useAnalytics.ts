import { useState, useEffect } from 'react';

interface AnalyticsData {
  overview: {
    totalWebsites: number;
    totalOptimizations: number;
    averageScoreImprovement: number;
    totalTokensEarned: number;
    activeOptimizations: number;
  };
  performance: {
    daily: Array<{
      date: string;
      optimizations: number;
      scoreImprovement: number;
      tokensEarned: number;
    }>;
    weekly: Array<{
      week: string;
      optimizations: number;
      scoreImprovement: number;
      tokensEarned: number;
    }>;
    monthly: Array<{
      month: string;
      optimizations: number;
      scoreImprovement: number;
      tokensEarned: number;
    }>;
  };
  topWebsites: Array<{
    id: string;
    domain: string;
    scoreImprovement: number;
    optimizations: number;
    tokensEarned: number;
  }>;
  optimizationTypes: Array<{
    type: string;
    count: number;
    averageImprovement: number;
    tokensEarned: number;
  }>;
  trends: {
    scoreImprovement: number;
    optimizationFrequency: number;
    tokenEarningRate: number;
  };
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock analytics data for now
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalWebsites: 12,
          totalOptimizations: 45,
          averageScoreImprovement: 23.5,
          totalTokensEarned: 4250,
          activeOptimizations: 3
        },
        performance: {
          daily: [
            { date: '2024-01-10', optimizations: 2, scoreImprovement: 15, tokensEarned: 150 },
            { date: '2024-01-11', optimizations: 3, scoreImprovement: 22, tokensEarned: 220 },
            { date: '2024-01-12', optimizations: 1, scoreImprovement: 18, tokensEarned: 180 },
            { date: '2024-01-13', optimizations: 4, scoreImprovement: 28, tokensEarned: 280 },
            { date: '2024-01-14', optimizations: 2, scoreImprovement: 12, tokensEarned: 120 },
            { date: '2024-01-15', optimizations: 3, scoreImprovement: 25, tokensEarned: 250 },
            { date: '2024-01-16', optimizations: 2, scoreImprovement: 20, tokensEarned: 200 }
          ],
          weekly: [
            { week: 'Week 1', optimizations: 8, scoreImprovement: 45, tokensEarned: 450 },
            { week: 'Week 2', optimizations: 12, scoreImprovement: 68, tokensEarned: 680 },
            { week: 'Week 3', optimizations: 15, scoreImprovement: 82, tokensEarned: 820 }
          ],
          monthly: [
            { month: 'November', optimizations: 25, scoreImprovement: 120, tokensEarned: 1200 },
            { month: 'December', optimizations: 32, scoreImprovement: 145, tokensEarned: 1450 },
            { month: 'January', optimizations: 28, scoreImprovement: 135, tokensEarned: 1350 }
          ]
        },
        topWebsites: [
          { id: '1', domain: 'example.com', scoreImprovement: 35, optimizations: 12, tokensEarned: 1250 },
          { id: '2', domain: 'demo.net', scoreImprovement: 28, optimizations: 15, tokensEarned: 2100 },
          { id: '3', domain: 'test-site.org', scoreImprovement: 22, optimizations: 8, tokensEarned: 890 },
          { id: '4', domain: 'sample.io', scoreImprovement: 18, optimizations: 6, tokensEarned: 650 },
          { id: '5', domain: 'demo-app.com', scoreImprovement: 15, optimizations: 4, tokensEarned: 420 }
        ],
        optimizationTypes: [
          { type: 'Image Optimization', count: 18, averageImprovement: 12.5, tokensEarned: 1800 },
          { type: 'CSS Optimization', count: 12, averageImprovement: 8.3, tokensEarned: 1200 },
          { type: 'JavaScript Optimization', count: 8, averageImprovement: 15.2, tokensEarned: 950 },
          { type: 'HTML Optimization', count: 5, averageImprovement: 6.8, tokensEarned: 400 },
          { type: 'Performance', count: 2, averageImprovement: 25.0, tokensEarned: 500 }
        ],
        trends: {
          scoreImprovement: 12.5, // +12.5% improvement trend
          optimizationFrequency: 8.3, // +8.3% more optimizations
          tokenEarningRate: 15.2 // +15.2% token earning rate
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getAnalyticsByDateRange = async (startDate: string, endDate: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/analytics?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to get analytics by date range');
      }
    } catch (error) {
      console.error('Failed to get analytics by date range:', error);
      throw error;
    }
  };

  const getWebsiteAnalytics = async (websiteId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/analytics/website/${websiteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to get website analytics');
      }
    } catch (error) {
      console.error('Failed to get website analytics:', error);
      throw error;
    }
  };

  const exportAnalytics = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/analytics/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export analytics');
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw error;
    }
  };

  return {
    analytics,
    loading,
    error,
    getAnalyticsByDateRange,
    getWebsiteAnalytics,
    exportAnalytics,
    refreshAnalytics: fetchAnalytics,
  };
};