/**
 * useCodebaseIndex Hook (Frontend)
 * React hook for interacting with the codebase embedding index
 * Provides semantic search and context retrieval functionality
 */

import { useState, useCallback } from 'react';

const CODEBASE_API_URL = import.meta.env.VITE_CODEBASE_API_URL || '/api/codebase-index';

export interface CodebaseSearchResult {
  id: string;
  relativePath: string;
  fileType: string;
  content: string;
  startLine: number;
  endLine: number;
  similarity: number;
}

export interface CodebaseContext {
  context: string;
  tokenEstimate: number;
  files: string[];
  chunksIncluded: number;
}

export interface CodebaseStats {
  model: string;
  dimensions: number;
  fileCount: number;
  chunkCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface EmbeddingModel {
  name: string;
  description: string;
  dimensions: number;
  useCase: string;
  performance: string;
  recommended: boolean;
  available: boolean;
  current: boolean;
}

export interface UseCodebaseIndexOptions {
  autoInitialize?: boolean;
}

export const useCodebaseIndex = (options: UseCodebaseIndexOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CodebaseSearchResult[]>([]);
  const [context, setContext] = useState<CodebaseContext | null>(null);
  const [stats, setStats] = useState<CodebaseStats | null>(null);
  const [models, setModels] = useState<EmbeddingModel[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('mxbai-embed-large');

  /**
   * Search the codebase index
   */
  const search = useCallback(async (query: string, searchOptions: {
    topK?: number;
    threshold?: number;
    fileTypes?: string[];
    files?: string[];
  } = {}) => {
    if (!query.trim()) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${CODEBASE_API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          topK: searchOptions.topK || 10,
          threshold: searchOptions.threshold || 0.5,
          fileTypes: searchOptions.fileTypes,
          files: searchOptions.files,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.results || []);
      return data.results || [];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Codebase search error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get context for AI prompts
   */
  const getContext = useCallback(async (query: string, contextOptions: {
    maxTokens?: number;
    topK?: number;
    fileTypes?: string[];
  } = {}) => {
    if (!query.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${CODEBASE_API_URL}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          maxTokens: contextOptions.maxTokens || 4000,
          topK: contextOptions.topK || 5,
          fileTypes: contextOptions.fileTypes,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get context');
      }

      const contextData = {
        context: data.context,
        tokenEstimate: data.tokenEstimate,
        files: data.files,
        chunksIncluded: data.chunksIncluded,
      };

      setContext(contextData);
      return contextData;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get context';
      setError(errorMessage);
      console.error('Get context error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Build or rebuild the codebase index
   */
  const buildIndex = useCallback(async (buildOptions: {
    incremental?: boolean;
    patterns?: string[];
  } = {}) => {
    setIsIndexing(true);
    setError(null);

    try {
      const response = await fetch(`${CODEBASE_API_URL}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incremental: buildOptions.incremental || false,
          patterns: buildOptions.patterns,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Indexing failed');
      }

      await fetchStats();
      return data.stats;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Indexing failed';
      setError(errorMessage);
      console.error('Build index error:', err);
      throw err;
    } finally {
      setIsIndexing(false);
    }
  }, []);

  /**
   * Fetch index statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${CODEBASE_API_URL}/stats`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.index);
        return data.index;
      }
      return null;
    } catch (err: unknown) {
      console.error('Fetch stats error:', err);
      return null;
    }
  }, []);

  /**
   * List available embedding models
   */
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(`${CODEBASE_API_URL}/models`);
      const data = await response.json();
      
      if (response.ok) {
        setModels(data.models || []);
        setCurrentModel(data.currentModel);
        return data.models || [];
      }
      return [];
    } catch (err: unknown) {
      console.error('Fetch models error:', err);
      return [];
    }
  }, []);

  /**
   * Switch embedding model
   */
  const switchModel = useCallback(async (modelName: string, switchOptions: {
    reindex?: boolean;
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${CODEBASE_API_URL}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          reindex: switchOptions.reindex || false,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to switch model');
      }

      setCurrentModel(modelName);
      if (switchOptions.reindex) {
        await fetchStats();
      }
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch model';
      setError(errorMessage);
      console.error('Switch model error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  /**
   * Clear the index
   */
  const clearIndex = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(CODEBASE_API_URL, { method: 'DELETE' });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear index');
      }

      setStats(null);
      setSearchResults([]);
      setContext(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear index';
      setError(errorMessage);
      console.error('Clear index error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check health status
   */
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${CODEBASE_API_URL}/health`);
      const data = await response.json();
      return data;
    } catch (err: unknown) {
      console.error('Health check error:', err);
      return { status: 'unhealthy', error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  return {
    // State
    isLoading,
    isIndexing,
    error,
    searchResults,
    context,
    stats,
    models,
    currentModel,

    // Actions
    search,
    getContext,
    buildIndex,
    fetchStats,
    fetchModels,
    switchModel,
    clearIndex,
    checkHealth,
  };
};

export default useCodebaseIndex;
