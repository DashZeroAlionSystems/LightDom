/**
 * Electron Service for Desktop Integration
 * Exodus wallet-inspired desktop features
 * Handles system integration, file operations, and native APIs
 */

import { useState, useEffect } from 'react';

export interface ElectronAPI {
  // App information
  getAppInfo: () => Promise<{
    version: string;
    platform: string;
    arch: string;
    electronVersion: string;
    nodeVersion: string;
    chromeVersion: string;
  }>;
  
  // Window management
  openAdminDashboard: () => Promise<void>;
  openSettings: () => Promise<void>;
  openMonitoring: () => Promise<void>;
  
  // File operations
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
  
  // External links
  openExternal: (url: string) => Promise<void>;
  
  // App control
  restartApp: () => Promise<void>;
  
  // Backend services
  startCrawling: (options: any) => Promise<{ success: boolean; message: string }>;
  stopCrawling: () => Promise<{ success: boolean; message: string }>;
  getCrawlerStats: () => Promise<any>;
  
  // Gamification
  getGamificationStats: () => Promise<any>;
  unlockAchievement: (achievementId: string) => Promise<any>;
  
  // Mining operations
  startMining: (config: any) => Promise<any>;
  stopMining: () => Promise<any>;
  getMiningStats: () => Promise<any>;
  
  // DOM optimization
  optimizeDom: ({ url, html }: { url: string; html: string }) => Promise<any>;
  
  // Analytics
  getAnalytics: () => Promise<any>;
  
  // Extension bridge
  connectExtension: () => Promise<any>;
  
  // Authentication
  authenticateWebAuthn: () => Promise<any>;
  
  // Event listeners
  onBackendLog: (callback: (data: string) => void) => void;
  onBackendError: (callback: (data: string) => void) => void;
  onServiceStatus: (callback: (data: any) => void) => void;
  onNavigateTo: (callback: (route: string) => void) => void;
  onRealTimeUpdate: (callback: (data: any) => void) => void;
  
  // Remove listeners
  removeAllListeners: (channel: string) => void;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
  isDev: boolean;
}

export interface SecureStorageAPI {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<boolean>;
  remove: (key: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
}

export interface WebSocketManagerAPI {
  connect: (url: string) => Promise<boolean>;
  disconnect: () => void;
  send: (data: any) => void;
  onMessage: (callback: (data: any) => void) => void;
  onStatusChange: (callback: (status: { status: string }) => void) => void;
}

class ElectronService {
  private electronAPI: ElectronAPI | null = null;
  private systemInfo: SystemInfo | null = null;
  private isElectron: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Electron service
   */
  private initialize(): void {
    // Check if running in Electron
    this.isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';
    
    if (this.isElectron) {
      // Get Electron API from preload script
      this.electronAPI = (window as any).electronAPI;
      this.systemInfo = (window as any).systemInfo;
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('Electron service initialized');
    } else {
      console.warn('Not running in Electron environment');
    }
  }

  /**
   * Set up event listeners for real-time updates
   */
  private setupEventListeners(): void {
    if (!this.electronAPI) return;

    // Backend events
    this.electronAPI.onBackendLog((data: string) => {
      this.emit('backend-log', data);
    });

    this.electronAPI.onBackendError((data: string) => {
      this.emit('backend-error', data);
    });

    this.electronAPI.onServiceStatus((data: any) => {
      this.emit('service-status', data);
    });

    this.electronAPI.onNavigateTo((route: string) => {
      this.emit('navigate-to', route);
    });

    // Real-time updates
    if ((this.electronAPI as any).onRealTimeUpdate) {
      (this.electronAPI as any).onRealTimeUpdate((data: any) => {
        this.emit('real-time-update', data);
      });
    }
  }

  /**
   * Check if running in Electron
   */
  isElectronApp(): boolean {
    return this.isElectron;
  }

  /**
   * Get system information
   */
  getSystemInfo(): SystemInfo | null {
    return this.systemInfo;
  }

  /**
   * Get app information
   */
  async getAppInfo(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.getAppInfo();
  }

  /**
   * Open admin dashboard
   */
  async openAdminDashboard(): Promise<void> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.openAdminDashboard();
  }

  /**
   * Open settings window
   */
  async openSettings(): Promise<void> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.openSettings();
  }

  /**
   * Open monitoring window
   */
  async openMonitoring(): Promise<void> {
    if (!this.electronAPI) {
      // Fallback for older versions
      console.warn('Monitoring API not available, opening admin dashboard instead');
      return this.electronAPI!.openAdminDashboard();
    }
    return (this.electronAPI as any).openMonitoring();
  }

  /**
   * Show save dialog
   */
  async showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.showSaveDialog(options);
  }

  /**
   * Show message box
   */
  async showMessageBox(options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.showMessageBox(options);
  }

  /**
   * Show open dialog
   */
  async showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return (this.electronAPI as any).showOpenDialog(options);
  }

  /**
   * Open external URL
   */
  async openExternal(url: string): Promise<void> {
    if (!this.electronAPI) {
      // Fallback for web
      window.open(url, '_blank');
      return;
    }
    return this.electronAPI.openExternal(url);
  }

  /**
   * Restart the application
   */
  async restartApp(): Promise<void> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.restartApp();
  }

  /**
   * Start crawling operation
   */
  async startCrawling(options: any): Promise<{ success: boolean; message: string }> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.startCrawling(options);
  }

  /**
   * Stop crawling operation
   */
  async stopCrawling(): Promise<{ success: boolean; message: string }> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.stopCrawling();
  }

  /**
   * Get crawler statistics
   */
  async getCrawlerStats(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.getCrawlerStats();
  }

  /**
   * Get gamification statistics
   */
  async getGamificationStats(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.getGamificationStats();
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(achievementId: string): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.unlockAchievement(achievementId);
  }

  /**
   * Start mining operation
   */
  async startMining(config: any): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.startMining(config);
  }

  /**
   * Stop mining operation
   */
  async stopMining(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.stopMining();
  }

  /**
   * Get mining statistics
   */
  async getMiningStats(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.getMiningStats();
  }

  /**
   * Optimize DOM
   */
  async optimizeDom({ url, html }: { url: string; html: string }): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.optimizeDom({ url, html });
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.getAnalytics();
  }

  /**
   * Connect browser extension
   */
  async connectExtension(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.connectExtension();
  }

  /**
   * Authenticate with WebAuthn
   */
  async authenticateWebAuthn(): Promise<any> {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }
    return this.electronAPI.authenticateWebAuthn();
  }

  /**
   * Get secure storage API
   */
  getSecureStorage(): SecureStorageAPI | null {
    if (!this.isElectron || !(window as any).secureStorage) {
      return null;
    }
    return (window as any).secureStorage;
  }

  /**
   * Get WebSocket manager API
   */
  getWebSocketManager(): WebSocketManagerAPI | null {
    if (!this.isElectron || !(window as any).websocketManager) {
      return null;
    }
    return (window as any).websocketManager;
  }

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener?: Function): void {
    if (!this.eventListeners.has(event)) {
      return;
    }

    if (listener) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in Electron event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.eventListeners.delete(event);
      if (this.electronAPI) {
        this.electronAPI.removeAllListeners(event);
      }
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Check if a feature is available
   */
  isFeatureAvailable(feature: string): boolean {
    if (!this.electronAPI) return false;
    
    const features = {
      'admin-dashboard': () => typeof this.electronAPI!.openAdminDashboard === 'function',
      'monitoring': () => typeof (this.electronAPI as any).openMonitoring === 'function',
      'secure-storage': () => !!(window as any).secureStorage,
      'websocket-manager': () => !!(window as any).websocketManager,
      'file-operations': () => typeof this.electronAPI!.showSaveDialog === 'function',
      'backend-services': () => typeof this.electronAPI!.startCrawling === 'function',
      'gamification': () => typeof this.electronAPI!.getGamificationStats === 'function',
      'mining': () => typeof this.electronAPI!.startMining === 'function',
      'dom-optimization': () => typeof this.electronAPI!.optimizeDom === 'function',
      'analytics': () => typeof this.electronAPI!.getAnalytics === 'function',
      'extension-bridge': () => typeof this.electronAPI!.connectExtension === 'function',
      'webauthn': () => typeof this.electronAPI!.authenticateWebAuthn === 'function',
    };

    return features[feature as keyof typeof features]?.() || false;
  }

  /**
   * Get available features
   */
  getAvailableFeatures(): string[] {
    const features = [
      'admin-dashboard',
      'monitoring',
      'secure-storage',
      'websocket-manager',
      'file-operations',
      'backend-services',
      'gamification',
      'mining',
      'dom-optimization',
      'analytics',
      'extension-bridge',
      'webauthn',
    ];

    return features.filter(feature => this.isFeatureAvailable(feature));
  }

  /**
   * Show desktop notification
   */
  showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    silent?: boolean;
    urgency?: 'normal' | 'critical' | 'low';
  }): void {
    if (!this.isElectron) {
      // Fallback to web notification
      if ('Notification' in window) {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
          silent: options.silent,
        });
      }
      return;
    }

    // Use Electron's notification API
    if (this.electronAPI && (this.electronAPI as any).showNotification) {
      (this.electronAPI as any).showNotification(options);
    }
  }

  /**
   * Get application version
   */
  async getVersion(): Promise<string> {
    try {
      const appInfo = await this.getAppInfo();
      return appInfo.version;
    } catch (error) {
      console.error('Failed to get app version:', error);
      return 'unknown';
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<{ available: boolean; version?: string; downloadUrl?: string }> {
    // This would typically integrate with electron-updater
    // For now, return a mock response
    return {
      available: false,
    };
  }

  /**
   * Get system performance metrics
   */
  async getSystemMetrics(): Promise<{
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  }> {
    // This would typically use system information APIs
    // For now, return mock data
    return {
      cpu: Math.random() * 40 + 30,
      memory: Math.random() * 30 + 50,
      disk: Math.random() * 20 + 65,
      network: Math.random() * 60 + 20,
    };
  }
}

// Singleton instance
let electronServiceInstance: ElectronService | null = null;

/**
 * Get Electron service instance
 */
export function getElectronService(): ElectronService {
  if (!electronServiceInstance) {
    electronServiceInstance = new ElectronService();
  }
  return electronServiceInstance;
}

/**
 * React hook for Electron service
 */
export function useElectron() {
  const [service] = useState(() => getElectronService());
  const [isReady, setIsReady] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    if (service.isElectronApp()) {
      setSystemInfo(service.getSystemInfo());
      setIsReady(true);
    }
  }, [service]);

  return {
    service,
    isReady,
    isElectron: service.isElectronApp(),
    systemInfo,
    availableFeatures: service.getAvailableFeatures(),
    isFeatureAvailable: service.isFeatureAvailable.bind(service),
  };
}

export default ElectronService;
