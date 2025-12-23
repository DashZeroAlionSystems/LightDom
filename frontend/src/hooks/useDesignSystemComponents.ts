/**
 * useDesignSystemComponents Hook
 * 
 * React hook for loading and using components stored in the design system database.
 * Provides dynamic component loading, caching, and error handling.
 * 
 * Usage:
 * ```tsx
 * const { components, loadComponent, isLoading, error } = useDesignSystemComponents();
 * 
 * // Load a component by name
 * const ButtonComponent = await loadComponent('Button');
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { designSystemApi, DesignSystemComponent, ApiResponse } from '../services/DesignSystemApiClient';

export interface ComponentCache {
  [name: string]: {
    component: DesignSystemComponent;
    loadedAt: number;
  };
}

export interface UseDesignSystemComponentsReturn {
  components: DesignSystemComponent[];
  isLoading: boolean;
  error: string | null;
  loadComponent: (name: string) => Promise<DesignSystemComponent | null>;
  loadComponentById: (id: number) => Promise<DesignSystemComponent | null>;
  searchComponents: (query: string) => Promise<DesignSystemComponent[]>;
  getComponentsByCategory: (category: string) => Promise<DesignSystemComponent[]>;
  refreshComponents: () => Promise<void>;
  clearCache: () => void;
}

export function useDesignSystemComponents(options?: {
  autoLoad?: boolean;
  category?: string;
  designSystemId?: number;
  cacheTimeout?: number; // ms
}): UseDesignSystemComponentsReturn {
  const {
    autoLoad = true,
    category,
    designSystemId,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes default
  } = options || {};

  const [components, setComponents] = useState<DesignSystemComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<ComponentCache>({});
  const loadedRef = useRef(false);

  /**
   * Check if cached component is still valid
   */
  const isCacheValid = useCallback((name: string): boolean => {
    const cached = cacheRef.current[name];
    if (!cached) return false;
    return Date.now() - cached.loadedAt < cacheTimeout;
  }, [cacheTimeout]);

  /**
   * Load all components (optionally filtered)
   */
  const refreshComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await designSystemApi.getComponents({
        designSystemId,
        category,
        status: 'published',
      });

      if (response.success && response.data) {
        setComponents(response.data);
        
        // Update cache
        response.data.forEach(comp => {
          cacheRef.current[comp.name] = {
            component: comp,
            loadedAt: Date.now(),
          };
        });
      } else {
        setError(response.error || 'Failed to load components');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [designSystemId, category]);

  /**
   * Load a single component by name
   */
  const loadComponent = useCallback(async (name: string): Promise<DesignSystemComponent | null> => {
    // Check cache first
    if (isCacheValid(name)) {
      return cacheRef.current[name].component;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await designSystemApi.getComponentByName(name, designSystemId);

      if (response.success && response.data) {
        cacheRef.current[name] = {
          component: response.data,
          loadedAt: Date.now(),
        };
        return response.data;
      } else {
        setError(response.error || `Component '${name}' not found`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [designSystemId, isCacheValid]);

  /**
   * Load a single component by ID
   */
  const loadComponentById = useCallback(async (id: number): Promise<DesignSystemComponent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await designSystemApi.getComponent(id);

      if (response.success && response.data) {
        cacheRef.current[response.data.name] = {
          component: response.data,
          loadedAt: Date.now(),
        };
        return response.data;
      } else {
        setError(response.error || `Component with ID ${id} not found`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search components
   */
  const searchComponents = useCallback(async (query: string): Promise<DesignSystemComponent[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await designSystemApi.getComponents({
        search: query,
        designSystemId,
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Search failed');
        return [];
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [designSystemId]);

  /**
   * Get components by category
   */
  const getComponentsByCategory = useCallback(async (cat: string): Promise<DesignSystemComponent[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await designSystemApi.getComponents({
        category: cat,
        designSystemId,
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to get components');
        return [];
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [designSystemId]);

  /**
   * Clear the component cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // Auto-load components on mount
  useEffect(() => {
    if (autoLoad && !loadedRef.current) {
      loadedRef.current = true;
      refreshComponents();
    }
  }, [autoLoad, refreshComponents]);

  return {
    components,
    isLoading,
    error,
    loadComponent,
    loadComponentById,
    searchComponents,
    getComponentsByCategory,
    refreshComponents,
    clearCache,
  };
}

/**
 * Hook for loading styleguide rules
 */
export function useStyleguideRules(designSystemId?: number) {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRules = useCallback(async (dsId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await designSystemApi.getStyleguideRules(dsId);

      if (response.success && response.data) {
        setRules(response.data);
      } else {
        setError(response.error || 'Failed to load rules');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (designSystemId) {
      loadRules(designSystemId);
    }
  }, [designSystemId, loadRules]);

  return {
    rules,
    isLoading,
    error,
    loadRules,
  };
}

/**
 * Hook for syncing design system to database
 */
export function useDesignSystemSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const syncAll = useCallback(async (name?: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await designSystemApi.syncAll(name);
      setSyncResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Sync failed');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncTokens = useCallback(async (name?: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await designSystemApi.syncTokens(name);
      setSyncResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Sync failed');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncStyleguide = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await designSystemApi.syncStyleguide();
      setSyncResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Sync failed');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    syncResult,
    error,
    syncAll,
    syncTokens,
    syncStyleguide,
  };
}

export default useDesignSystemComponents;
