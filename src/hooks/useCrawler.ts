import { useState, useEffect } from 'react';

interface CrawlingSession {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  currentUrl: string;
  urlsProcessed: number;
  totalUrls: number;
  startTime: string;
  endTime?: string;
  results: {
    optimizationsFound: number;
    spaceSaved: number;
    tokensEarned: number;
    errors: number;
  };
}

export const useCrawler = () => {
  const [session, setSession] = useState<CrawlingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCrawling = async (config: {
    startUrl: string;
    maxDepth?: number;
    maxPages?: number;
    optimizationTypes?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrl: config.startUrl,
          maxDepth: config.maxDepth || 2,
          maxPages: config.maxPages || 10,
          optimizationTypes: config.optimizationTypes || ['image', 'css', 'js', 'html'],
          maxConcurrency: 3,
          requestDelay: 1000,
          respectRobots: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSession(result.session);
        
        // Start polling for updates
        pollCrawlingStatus(result.sessionId);
        
        return result;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start crawling');
      }
    } catch (error) {
      console.error('Failed to start crawling:', error);
      setError(error instanceof Error ? error.message : 'Failed to start crawling');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopCrawling = async () => {
    try {
      if (!session) return;

      const response = await fetch(`/api/crawler/stop/${session.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        setSession(prev => prev ? { ...prev, status: 'paused' } : null);
      }
    } catch (error) {
      console.error('Failed to stop crawling:', error);
      setError('Failed to stop crawling');
    }
  };

  const resumeCrawling = async () => {
    try {
      if (!session) return;

      const response = await fetch(`/api/crawler/resume/${session.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        setSession(prev => prev ? { ...prev, status: 'running' } : null);
      }
    } catch (error) {
      console.error('Failed to resume crawling:', error);
      setError('Failed to resume crawling');
    }
  };

  const pollCrawlingStatus = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crawler/status/${sessionId}`);
        if (response.ok) {
          const status = await response.json();
          setSession(status);
          
          if (status.status === 'completed' || status.status === 'error') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to poll crawling status:', error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup interval after 10 minutes
    setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
  };

  const getCrawlingResults = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/crawler/results/${sessionId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get crawling results:', error);
    }
  };

  const downloadResults = async (sessionId: string, format: 'json' | 'csv' = 'json') => {
    try {
      const response = await fetch(`/api/crawler/download/${sessionId}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crawling-results-${sessionId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download results:', error);
    }
  };

  return {
    session,
    loading,
    error,
    startCrawling,
    stopCrawling,
    resumeCrawling,
    getCrawlingResults,
    downloadResults,
  };
};