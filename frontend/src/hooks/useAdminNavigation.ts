import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminNavigationCategory,
  AdminNavSocketMessage,
  fetchAdminNavigation,
  subscribeToAdminNavigation,
} from '@/services/adminNavigation';
import { getFallbackAdminNavigation } from '@/data/adminNavigationFallback';

export type AdminNavigationStatus = 'idle' | 'loading' | 'ready' | 'error' | 'fallback';

export function useAdminNavigation() {
  const [categories, setCategories] = useState<AdminNavigationCategory[]>([]);
  const [status, setStatus] = useState<AdminNavigationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setStatus((prev) => (prev === 'ready' ? prev : 'loading'));
    setError(null);

    try {
      const result = await fetchAdminNavigation();
      setCategories(result);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setCategories(getFallbackAdminNavigation());
      setStatus('fallback');
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeToAdminNavigation((message: AdminNavSocketMessage) => {
      if (!message?.event) {
        return;
      }

      if (['template-upserted', 'template-removed'].includes(message.event)) {
        load();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [load]);

  const templateCount = useMemo(
    () => categories.reduce((acc, category) => acc + category.templates.length, 0),
    [categories]
  );

  return {
    categories,
    status,
    error,
    refresh: load,
    templateCount,
  };
}

export default useAdminNavigation;
