/**
 * useCodebaseIndex Hook
 * React hook for interacting with the codebase embedding index
 * Provides semantic search and context retrieval functionality
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const CODEBASE_API_URL = import.meta.env.VITE_CODEBASE_API_URL || 'http://localhost:3001/api/codebase-index';

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
  const search = useCallback(async (query: string, options: {
    topK?: number;
    threshold?: number;
    fileTypes?: string[];
    files?: string[];
  } = {}) => {
    if (!query.trim()) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${CODEBASE_API_URL}/search`, {
        query,
        topK: options.topK || 10,
        threshold: options.threshold || 0.5,
        fileTypes: options.fileTypes,
        files: options.files,
      });

      setSearchResults(response.data.results || []);
      return response.data.results || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Search failed';
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
  const getContext = useCallback(async (query: string, options: {
    maxTokens?: number;
    topK?: number;
    fileTypes?: string[];
  } = {}) => {
    if (!query.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${CODEBASE_API_URL}/context`, {
        query,
        maxTokens: options.maxTokens || 4000,
        topK: options.topK || 5,
        fileTypes: options.fileTypes,
      });

      const contextData = {
        context: response.data.context,
        tokenEstimate: response.data.tokenEstimate,
        files: response.data.files,
        chunksIncluded: response.data.chunksIncluded,
      };

      setContext(contextData);
      return contextData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to get context';
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
  const buildIndex = useCallback(async (options: {
    incremental?: boolean;
    patterns?: string[];
  } = {}) => {
    setIsIndexing(true);
    setError(null);

    try {
      const response = await axios.post(`${CODEBASE_API_URL}/build`, {
        incremental: options.incremental || false,
        patterns: options.patterns,
      });

      await fetchStats();
      return response.data.stats;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Indexing failed';
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
      const response = await axios.get(`${CODEBASE_API_URL}/stats`);
      setStats(response.data.index);
      return response.data.index;
    } catch (err: any) {
      console.error('Fetch stats error:', err);
      return null;
    }
  }, []);

  /**
   * List available embedding models
   */
  const fetchModels = useCallback(async () => {
    try {
      const response = await axios.get(`${CODEBASE_API_URL}/models`);
      setModels(response.data.models || []);
      setCurrentModel(response.data.currentModel);
      return response.data.models || [];
    } catch (err: any) {
      console.error('Fetch models error:', err);
      return [];
    }
  }, []);

  /**
   * Switch embedding model
   */
  const switchModel = useCallback(async (modelName: string, options: {
    reindex?: boolean;
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${CODEBASE_API_URL}/model`, {
        model: modelName,
        reindex: options.reindex || false,
      });

      setCurrentModel(modelName);
      if (options.reindex) {
        await fetchStats();
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to switch model';
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
      await axios.delete(CODEBASE_API_URL);
      setStats(null);
      setSearchResults([]);
      setContext(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to clear index';
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
      const response = await axios.get(`${CODEBASE_API_URL}/health`);
      return response.data;
    } catch (err: any) {
      console.error('Health check error:', err);
      return { status: 'unhealthy', error: err.message };
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
