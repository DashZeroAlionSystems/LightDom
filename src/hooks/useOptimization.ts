import { useState, useEffect } from 'react';

interface Optimization {
  id: string;
  website: string;
  url: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  scoreImprovement: number;
  createdAt: string;
  completedAt?: string;
  beforeScore: number;
  afterScore: number;
  details: {
    imagesOptimized: number;
    cssOptimized: number;
    jsOptimized: number;
    htmlOptimized: number;
    totalSavings: number;
  };
}

interface OptimizationStats {
  totalWebsites: number;
  websitesOptimized: number;
  averageScore: number;
  tokensEarned: number;
  optimizationsToday: number;
  totalOptimizations: number;
  alerts: Array<{
    title: string;
    description: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>;
}

interface CreateOptimizationData {
  website: string;
  type: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
}

export const useOptimization = () => {
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [optimizationStats, setOptimizationStats] = useState<OptimizationStats | null>(null);
  const [recentOptimizations, setRecentOptimizations] = useState<Optimization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptimizations();
    fetchOptimizationStats();
  }, []);

  const fetchOptimizations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/optimizations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOptimizations(data.optimizations);
        setRecentOptimizations(data.optimizations.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch optimizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizationStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/optimizations/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOptimizationStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch optimization stats:', error);
    }
  };

  const createOptimization = async (data: CreateOptimizationData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/optimizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newOptimization = await response.json();
        setOptimizations(prev => [newOptimization, ...prev]);
        return newOptimization;
      } else {
        throw new Error('Failed to create optimization');
      }
    } catch (error) {
      console.error('Failed to create optimization:', error);
      throw error;
    }
  };

  const updateOptimization = async (id: string, data: Partial<Optimization>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/optimizations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedOptimization = await response.json();
        setOptimizations(prev => prev.map(opt => (opt.id === id ? updatedOptimization : opt)));
        return updatedOptimization;
      } else {
        throw new Error('Failed to update optimization');
      }
    } catch (error) {
      console.error('Failed to update optimization:', error);
      throw error;
    }
  };

  const deleteOptimization = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/optimizations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOptimizations(prev => prev.filter(opt => opt.id !== id));
      } else {
        throw new Error('Failed to delete optimization');
      }
    } catch (error) {
      console.error('Failed to delete optimization:', error);
      throw error;
    }
  };

  const runOptimization = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/optimizations/${id}/run`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedOptimization = await response.json();
        setOptimizations(prev => prev.map(opt => (opt.id === id ? updatedOptimization : opt)));
        return updatedOptimization;
      } else {
        throw new Error('Failed to run optimization');
      }
    } catch (error) {
      console.error('Failed to run optimization:', error);
      throw error;
    }
  };

  const pauseOptimization = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/optimizations/${id}/pause`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedOptimization = await response.json();
        setOptimizations(prev => prev.map(opt => (opt.id === id ? updatedOptimization : opt)));
        return updatedOptimization;
      } else {
        throw new Error('Failed to pause optimization');
      }
    } catch (error) {
      console.error('Failed to pause optimization:', error);
      throw error;
    }
  };

  const resumeOptimization = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/optimizations/${id}/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedOptimization = await response.json();
        setOptimizations(prev => prev.map(opt => (opt.id === id ? updatedOptimization : opt)));
        return updatedOptimization;
      } else {
        throw new Error('Failed to resume optimization');
      }
    } catch (error) {
      console.error('Failed to resume optimization:', error);
      throw error;
    }
  };

  const getOptimizationReport = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/optimizations/${id}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to get optimization report');
      }
    } catch (error) {
      console.error('Failed to get optimization report:', error);
      throw error;
    }
  };

  return {
    optimizations,
    optimizationStats,
    recentOptimizations,
    loading,
    createOptimization,
    updateOptimization,
    deleteOptimization,
    runOptimization,
    pauseOptimization,
    resumeOptimization,
    getOptimizationReport,
    refreshOptimizations: fetchOptimizations,
    refreshStats: fetchOptimizationStats,
  };
};
