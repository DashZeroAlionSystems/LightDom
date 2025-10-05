import { useState, useEffect } from 'react';

interface Website {
  id: string;
  domain: string;
  url: string;
  beforeScore: number;
  afterScore: number;
  status: 'active' | 'inactive' | 'optimizing' | 'error';
  lastOptimized: string;
  createdAt: string;
  optimizationCount: number;
  totalSavings: number;
  seoScore?: number;
  performanceScore?: number;
  accessibilityScore?: number;
}

interface WebsiteStats {
  totalWebsites: number;
  activeWebsites: number;
  averageScore: number;
  totalOptimizations: number;
  totalSavings: number;
}

export const useWebsites = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websiteStats, setWebsiteStats] = useState<WebsiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsites();
    fetchWebsiteStats();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWebsites(data.websites || []);
      } else {
        // Mock data for development
        setWebsites([
          {
            id: '1',
            domain: 'example.com',
            url: 'https://example.com',
            beforeScore: 65,
            afterScore: 89,
            status: 'active',
            lastOptimized: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            optimizationCount: 5,
            totalSavings: 2.3,
            seoScore: 85,
            performanceScore: 92,
            accessibilityScore: 78
          },
          {
            id: '2',
            domain: 'test.com',
            url: 'https://test.com',
            beforeScore: 45,
            afterScore: 72,
            status: 'active',
            lastOptimized: '2024-01-14T15:45:00Z',
            createdAt: '2024-01-05T00:00:00Z',
            optimizationCount: 3,
            totalSavings: 1.8,
            seoScore: 68,
            performanceScore: 75,
            accessibilityScore: 82
          },
          {
            id: '3',
            domain: 'demo.com',
            url: 'https://demo.com',
            beforeScore: 38,
            afterScore: 67,
            status: 'optimizing',
            lastOptimized: '2024-01-13T09:20:00Z',
            createdAt: '2024-01-10T00:00:00Z',
            optimizationCount: 2,
            totalSavings: 1.2,
            seoScore: 55,
            performanceScore: 68,
            accessibilityScore: 71
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      // Set mock data on error
      setWebsites([
        {
          id: '1',
          domain: 'example.com',
          url: 'https://example.com',
          beforeScore: 65,
          afterScore: 89,
          status: 'active',
          lastOptimized: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          optimizationCount: 5,
          totalSavings: 2.3,
          seoScore: 85,
          performanceScore: 92,
          accessibilityScore: 78
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsiteStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/websites/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWebsiteStats(data);
      } else {
        // Mock stats
        setWebsiteStats({
          totalWebsites: 3,
          activeWebsites: 2,
          averageScore: 76,
          totalOptimizations: 10,
          totalSavings: 5.3
        });
      }
    } catch (error) {
      console.error('Failed to fetch website stats:', error);
      setWebsiteStats({
        totalWebsites: 3,
        activeWebsites: 2,
        averageScore: 76,
        totalOptimizations: 10,
        totalSavings: 5.3
      });
    }
  };

  const addWebsite = async (websiteData: { domain: string; url: string }) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(websiteData),
      });

      if (response.ok) {
        const newWebsite = await response.json();
        setWebsites(prev => [newWebsite, ...prev]);
        return newWebsite;
      } else {
        throw new Error('Failed to add website');
      }
    } catch (error) {
      console.error('Failed to add website:', error);
      throw error;
    }
  };

  const updateWebsite = async (id: string, data: Partial<Website>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedWebsite = await response.json();
        setWebsites(prev =>
          prev.map(website => website.id === id ? updatedWebsite : website)
        );
        return updatedWebsite;
      } else {
        throw new Error('Failed to update website');
      }
    } catch (error) {
      console.error('Failed to update website:', error);
      throw error;
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWebsites(prev => prev.filter(website => website.id !== id));
      } else {
        throw new Error('Failed to delete website');
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
      throw error;
    }
  };

  const optimizeWebsite = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${id}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setWebsites(prev =>
          prev.map(website => 
            website.id === id 
              ? { ...website, status: 'optimizing' as const }
              : website
          )
        );
        return result;
      } else {
        throw new Error('Failed to optimize website');
      }
    } catch (error) {
      console.error('Failed to optimize website:', error);
      throw error;
    }
  };

  return {
    websites,
    websiteStats,
    loading,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    optimizeWebsite,
    refreshWebsites: fetchWebsites,
    refreshStats: fetchWebsiteStats,
  };
};