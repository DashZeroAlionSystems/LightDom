/**
 * React hooks for Electron API
 * Provides easy access to Electron features in React components
 */

import { useEffect, useState, useCallback } from 'react';
import type { AppInfo, CrawlOptions, CrawlResult, ServiceStatus, WorkerMessage, UpdateProgress } from '../types/electron';

/**
 * Check if running in Electron
 */
export function useIsElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electron;
}

/**
 * Get app information
 */
export function useAppInfo() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) {
      setLoading(false);
      return;
    }

    window.electron.app.getInfo()
      .then(info => {
        setAppInfo(info);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to get app info:', error);
        setLoading(false);
      });
  }, [isElectron]);

  return { appInfo, loading, isElectron };
}

/**
 * Window controls hook
 */
export function useWindowControls() {
  const isElectron = useIsElectron();

  const minimize = useCallback(async () => {
    if (isElectron) {
      await window.electron.window.minimize();
    }
  }, [isElectron]);

  const maximize = useCallback(async () => {
    if (isElectron) {
      await window.electron.window.maximize();
    }
  }, [isElectron]);

  const close = useCallback(async () => {
    if (isElectron) {
      await window.electron.window.close();
    }
  }, [isElectron]);

  return { minimize, maximize, close, isElectron };
}

/**
 * Theme control hook
 */
export function useElectronTheme() {
  const [isDark, setIsDark] = useState(true);
  const isElectron = useIsElectron();

  const toggleTheme = useCallback(async () => {
    if (isElectron) {
      const newIsDark = await window.electron.theme.toggle();
      setIsDark(newIsDark);
      return newIsDark;
    }
    return isDark;
  }, [isElectron, isDark]);

  return { isDark, toggleTheme, isElectron };
}

/**
 * Notifications hook
 */
export function useElectronNotification() {
  const isElectron = useIsElectron();

  const showNotification = useCallback(async (title: string, body: string, options?: any) => {
    if (isElectron) {
      await window.electron.notification.show(title, body, options);
    } else {
      // Fallback to web notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, ...options });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body, ...options });
        }
      }
    }
  }, [isElectron]);

  return { showNotification, isElectron };
}

/**
 * Puppeteer crawl hook
 */
export function usePuppeteerCrawl() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isElectron = useIsElectron();

  const crawl = useCallback(async (options: CrawlOptions) => {
    if (!isElectron) {
      setError('Crawling is only available in Electron mode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const crawlResult = await window.electron.puppeteer.crawl(options);
      setResult(crawlResult);

      if (!crawlResult.success) {
        setError(crawlResult.error || 'Crawl failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isElectron]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { crawl, loading, result, error, reset, isElectron };
}

/**
 * Backend logs hook
 */
export function useBackendLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    const unsubscribeLogs = window.electron.on.backendLog((message) => {
      setLogs(prev => [...prev, message].slice(-100)); // Keep last 100 logs
    });

    const unsubscribeErrors = window.electron.on.backendError((message) => {
      setErrors(prev => [...prev, message].slice(-100)); // Keep last 100 errors
    });

    return () => {
      unsubscribeLogs();
      unsubscribeErrors();
    };
  }, [isElectron]);

  const clearLogs = useCallback(() => setLogs([]), []);
  const clearErrors = useCallback(() => setErrors([]), []);

  return { logs, errors, clearLogs, clearErrors, isElectron };
}

/**
 * Service status hook
 */
export function useServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus>({});
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    const unsubscribe = window.electron.on.serviceStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => unsubscribe();
  }, [isElectron]);

  return { status, isElectron };
}

/**
 * Worker messages hook
 */
export function useWorkerMessages() {
  const [messages, setMessages] = useState<WorkerMessage[]>([]);
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    const unsubscribe = window.electron.on.workerMessage((message) => {
      setMessages(prev => [...prev, message].slice(-50)); // Keep last 50 messages
    });

    return () => unsubscribe();
  }, [isElectron]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, clearMessages, isElectron };
}

/**
 * Update progress hook
 */
export function useUpdateProgress() {
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    const unsubscribe = window.electron.on.updateProgress((newProgress) => {
      setProgress(newProgress);
    });

    return () => unsubscribe();
  }, [isElectron]);

  return { progress, isElectron };
}

/**
 * Tray actions hook
 */
export function useTrayActions(onAction: (action: string) => void) {
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    const unsubscribe = window.electron.on.trayAction((action) => {
      onAction(action);
    });

    return () => unsubscribe();
  }, [isElectron, onAction]);

  return { isElectron };
}

/**
 * Navigation from Electron hook (tray, shortcuts, etc.)
 */
export function useElectronNavigation(onNavigate: (route: string) => void) {
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    const unsubscribe = window.electron.on.navigate((route) => {
      onNavigate(route);
    });

    return () => unsubscribe();
  }, [isElectron, onNavigate]);

  return { isElectron };
}

/**
 * File operations hook
 */
export function useFileOperations() {
  const isElectron = useIsElectron();

  const selectFiles = useCallback(async () => {
    if (!isElectron) return [];
    return await window.electron.file.select();
  }, [isElectron]);

  const saveFile = useCallback(async (content: string, filename: string) => {
    if (!isElectron) {
      // Fallback to web download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    }

    return await window.electron.file.save(content, filename);
  }, [isElectron]);

  return { selectFiles, saveFile, isElectron };
}

/**
 * External links hook
 */
export function useExternalLinks() {
  const isElectron = useIsElectron();

  const openExternal = useCallback(async (url: string) => {
    if (isElectron) {
      await window.electron.system.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  }, [isElectron]);

  const showInFolder = useCallback(async (path: string) => {
    if (isElectron) {
      await window.electron.system.showInFolder(path);
    }
  }, [isElectron]);

  return { openExternal, showInFolder, isElectron };
}
