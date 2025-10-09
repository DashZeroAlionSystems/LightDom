import { useState, useEffect } from 'react';

interface Website {
  id: string;
  domain: string;
  url: string;
  beforeScore: number;
  afterScore: number;
  status: 'active' | 'inactive' | 'optimizing' | 'error';
  lastOptimized: string;
  totalOptimizations: number;
  tokensEarned: number;
  createdAt: string;
  metadata: {
    title: string;
    description: string;
    favicon?: string;
    category: string;
  };
}

interface CreateWebsiteData {
  domain: string;
  url: string;
  category?: string;
  description?: string;
}

export const useWebsites = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data since API endpoints don't exist yet
      const mockWebsites: Website[] = [
        {
          id: '1',
          domain: 'example.com',
          url: 'https://example.com',
          beforeScore: 65,
          afterScore: 89,
          status: 'active',
          lastOptimized: '2024-01-15T10:30:00Z',
          totalOptimizations: 12,
          tokensEarned: 1250,
          createdAt: '2024-01-01T00:00:00Z',
          metadata: {
            title: 'Example Website',
            description: 'A sample website for testing',
            category: 'Business'
          }
        },
        {
          id: '2',
          domain: 'test-site.org',
          url: 'https://test-site.org',
          beforeScore: 45,
          afterScore: 78,
          status: 'active',
          lastOptimized: '2024-01-14T15:45:00Z',
          totalOptimizations: 8,
          tokensEarned: 890,
          createdAt: '2024-01-05T00:00:00Z',
          metadata: {
            title: 'Test Site',
            description: 'Another test website',
            category: 'Technology'
          }
        },
        {
          id: '3',
          domain: 'demo.net',
          url: 'https://demo.net',
          beforeScore: 72,
          afterScore: 95,
          status: 'optimizing',
          lastOptimized: '2024-01-16T09:15:00Z',
          totalOptimizations: 15,
          tokensEarned: 2100,
          createdAt: '2024-01-10T00:00:00Z',
          metadata: {
            title: 'Demo Site',
            description: 'A demonstration website',
            category: 'Education'
          }
        }
      ];

      setWebsites(mockWebsites);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      setError('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const createWebsite = async (data: CreateWebsiteData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newWebsite = await response.json();
        setWebsites(prev => [newWebsite, ...prev]);
        return newWebsite;
      } else {
        throw new Error('Failed to create website');
      }
    } catch (error) {
      console.error('Failed to create website:', error);
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
        // Update the website with new optimization results
        setWebsites(prev =>
          prev.map(website => 
            website.id === id 
              ? { 
                  ...website, 
                  status: 'optimizing',
                  afterScore: result.newScore || website.afterScore,
                  lastOptimized: new Date().toISOString(),
                  totalOptimizations: website.totalOptimizations + 1,
                  tokensEarned: website.tokensEarned + (result.tokensEarned || 0)
                }
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

  const getWebsiteAnalytics = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${id}/analytics`, {
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

  return {
    websites,
    loading,
    error,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    optimizeWebsite,
    getWebsiteAnalytics,
    refreshWebsites: fetchWebsites,
  };
};