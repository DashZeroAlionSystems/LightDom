import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// Advanced State Management Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  preferences: Record<string, any>;
  lastLogin: Date;
}

interface Organization {
  id: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise';
  settings: Record<string, any>;
  users: User[];
  permissions: Record<string, boolean>;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: Date;
}

interface WorkflowState {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
  }>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkRequests: number;
  errorRate: number;
  timestamp: Date;
}

interface ResearchState {
  activeWorkflows: string[];
  recentFindings: AIInsight[];
  searchQuery: string;
  filters: Record<string, any>;
  isLoading: boolean;
}

// Global Application State
interface AppState {
  // User & Organization
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;

  // UI State
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  activeView: string;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;

  // AI/ML State
  aiInsights: AIInsight[];
  activeWorkflows: WorkflowState[];
  research: ResearchState;

  // Performance & Monitoring
  performance: PerformanceMetrics[];
  systemHealth: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    lastChecked: Date;
  };

  // Cache & Offline
  cache: Map<string, any>;
  isOnline: boolean;
  pendingActions: Array<{
    id: string;
    type: string;
    payload: any;
    retryCount: number;
  }>;

  // Error Handling
  errors: Array<{
    id: string;
    message: string;
    stack?: string;
    timestamp: Date;
    context: Record<string, any>;
  }>;
}

// Action Types
type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ORGANIZATION'; payload: Organization }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_AI_INSIGHT'; payload: AIInsight }
  | { type: 'CLEAR_AI_INSIGHTS' }
  | { type: 'START_WORKFLOW'; payload: Omit<WorkflowState, 'status' | 'progress' | 'startedAt'> }
  | { type: 'UPDATE_WORKFLOW'; payload: { id: string; updates: Partial<WorkflowState> } }
  | { type: 'COMPLETE_WORKFLOW'; payload: { id: string; result?: any } }
  | { type: 'FAIL_WORKFLOW'; payload: { id: string; error: string } }
  | { type: 'SET_RESEARCH_STATE'; payload: Partial<ResearchState> }
  | { type: 'ADD_PERFORMANCE_METRIC'; payload: PerformanceMetrics }
  | { type: 'UPDATE_SYSTEM_HEALTH'; payload: Partial<AppState['systemHealth']> }
  | { type: 'SET_CACHE'; payload: { key: string; value: any; ttl?: number } }
  | { type: 'CLEAR_CACHE'; payload?: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'ADD_PENDING_ACTION'; payload: Omit<AppState['pendingActions'][0], 'id' | 'retryCount'> }
  | { type: 'REMOVE_PENDING_ACTION'; payload: string }
  | { type: 'ADD_ERROR'; payload: Omit<AppState['errors'][0], 'id' | 'timestamp'> }
  | { type: 'CLEAR_ERRORS' };

// Initial State
const initialState: AppState = {
  user: null,
  organization: null,
  isAuthenticated: false,
  theme: 'system',
  sidebarOpen: true,
  activeView: 'dashboard',
  notifications: [],
  aiInsights: [],
  activeWorkflows: [],
  research: {
    activeWorkflows: [],
    recentFindings: [],
    searchQuery: '',
    filters: {},
    isLoading: false
  },
  performance: [],
  systemHealth: {
    status: 'healthy',
    uptime: 0,
    lastChecked: new Date()
  },
  cache: new Map(),
  isOnline: navigator.onLine,
  pendingActions: [],
  errors: []
};

// Reducer with sophisticated state management
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };

    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };

    case 'SET_THEME':
      // Persist theme preference
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [{
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
          ...action.payload
        }, ...state.notifications]
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'ADD_AI_INSIGHT':
      // Keep only last 50 insights
      const newInsights = [action.payload, ...state.aiInsights].slice(0, 50);
      return { ...state, aiInsights: newInsights };

    case 'CLEAR_AI_INSIGHTS':
      return { ...state, aiInsights: [] };

    case 'START_WORKFLOW':
      return {
        ...state,
        activeWorkflows: [...state.activeWorkflows, {
          ...action.payload,
          status: 'running',
          progress: 0,
          startedAt: new Date(),
          steps: action.payload.steps.map(step => ({ ...step, status: 'pending' }))
        }]
      };

    case 'UPDATE_WORKFLOW':
      return {
        ...state,
        activeWorkflows: state.activeWorkflows.map(w =>
          w.id === action.payload.id ? { ...w, ...action.payload.updates } : w
        )
      };

    case 'COMPLETE_WORKFLOW':
      return {
        ...state,
        activeWorkflows: state.activeWorkflows.map(w =>
          w.id === action.payload.id ? {
            ...w,
            status: 'completed',
            progress: 100,
            completedAt: new Date()
          } : w
        )
      };

    case 'FAIL_WORKFLOW':
      return {
        ...state,
        activeWorkflows: state.activeWorkflows.map(w =>
          w.id === action.payload.id ? {
            ...w,
            status: 'failed',
            error: action.payload.error,
            completedAt: new Date()
          } : w
        )
      };

    case 'SET_RESEARCH_STATE':
      return {
        ...state,
        research: { ...state.research, ...action.payload }
      };

    case 'ADD_PERFORMANCE_METRIC':
      // Keep only last 100 metrics
      const newMetrics = [action.payload, ...state.performance].slice(0, 100);
      return { ...state, performance: newMetrics };

    case 'UPDATE_SYSTEM_HEALTH':
      return {
        ...state,
        systemHealth: { ...state.systemHealth, ...action.payload, lastChecked: new Date() }
      };

    case 'SET_CACHE':
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, {
        value: action.payload.value,
        timestamp: Date.now(),
        ttl: action.payload.ttl || 5 * 60 * 1000 // 5 minutes default
      });
      return { ...state, cache: newCache };

    case 'CLEAR_CACHE':
      if (action.payload) {
        const newCache = new Map(state.cache);
        newCache.delete(action.payload);
        return { ...state, cache: newCache };
      }
      return { ...state, cache: new Map() };

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'ADD_PENDING_ACTION':
      return {
        ...state,
        pendingActions: [...state.pendingActions, {
          id: Date.now().toString(),
          retryCount: 0,
          ...action.payload
        }]
      };

    case 'REMOVE_PENDING_ACTION':
      return {
        ...state,
        pendingActions: state.pendingActions.filter(a => a.id !== action.payload)
      };

    case 'ADD_ERROR':
      // Keep only last 50 errors
      const newErrors = [{
        id: Date.now().toString(),
        timestamp: new Date(),
        ...action.payload
      }, ...state.errors].slice(0, 50);
      return { ...state, errors: newErrors };

    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };

    default:
      return state;
  }
}

// Context and Provider
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialState = {}
}) => {
  const [state, dispatch] = useReducer(appReducer, { ...initialState, ...initialState });

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as AppState['theme'];
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const metrics: PerformanceMetrics = {
          renderTime: navigation.loadEventEnd - navigation.fetchStart,
          bundleSize: 0, // Would need to be injected
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          networkRequests: performance.getEntriesByType('resource').length,
          errorRate: 0, // Would be calculated from error tracking
          timestamp: new Date()
        };
        dispatch({ type: 'ADD_PERFORMANCE_METRIC', payload: metrics });
      }
    };

    // Measure on page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Cache cleanup
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const newCache = new Map();

      state.cache.forEach((value, key) => {
        if (now - value.timestamp < value.ttl) {
          newCache.set(key, value);
        }
      });

      if (newCache.size !== state.cache.size) {
        // Dispatch cache cleanup if needed
        dispatch({ type: 'CLEAR_CACHE' });
        newCache.forEach((value, key) => {
          dispatch({ type: 'SET_CACHE', payload: { key, value: value.value, ttl: value.ttl } });
        });
      }
    };

    const interval = setInterval(cleanup, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [state.cache]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hooks for state management
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};

export const useUser = () => {
  const { state } = useAppState();
  return state.user;
};

export const useOrganization = () => {
  const { state } = useAppState();
  return state.organization;
};

export const useAuth = () => {
  const { state } = useAppState();
  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    hasPermission: (permission: string) => state.user?.permissions.includes(permission) || false
  };
};

export const useTheme = () => {
  const { state, dispatch } = useAppState();
  return {
    theme: state.theme,
    setTheme: (theme: AppState['theme']) => dispatch({ type: 'SET_THEME', payload: theme })
  };
};

export const useNotifications = () => {
  const { state, dispatch } = useAppState();
  return {
    notifications: state.notifications,
    unreadCount: state.notifications.filter(n => !n.read).length,
    addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    markAsRead: (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    clearAll: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  };
};

export const useAIInsights = () => {
  const { state, dispatch } = useAppState();
  return {
    insights: state.aiInsights,
    addInsight: (insight: AIInsight) => dispatch({ type: 'ADD_AI_INSIGHT', payload: insight }),
    clearInsights: () => dispatch({ type: 'CLEAR_AI_INSIGHTS' })
  };
};

export const useWorkflows = () => {
  const { state, dispatch } = useAppState();
  return {
    workflows: state.activeWorkflows,
    startWorkflow: (workflow: Omit<WorkflowState, 'status' | 'progress' | 'startedAt'>) =>
      dispatch({ type: 'START_WORKFLOW', payload: workflow }),
    updateWorkflow: (id: string, updates: Partial<WorkflowState>) =>
      dispatch({ type: 'UPDATE_WORKFLOW', payload: { id, updates } }),
    completeWorkflow: (id: string, result?: any) =>
      dispatch({ type: 'COMPLETE_WORKFLOW', payload: { id, result } }),
    failWorkflow: (id: string, error: string) =>
      dispatch({ type: 'FAIL_WORKFLOW', payload: { id, error } })
  };
};

export const useResearch = () => {
  const { state, dispatch } = useAppState();
  return {
    research: state.research,
    setResearchState: (updates: Partial<ResearchState>) =>
      dispatch({ type: 'SET_RESEARCH_STATE', payload: updates })
  };
};

export const useCache = () => {
  const { state, dispatch } = useAppState();
  return {
    get: (key: string) => {
      const item = state.cache.get(key);
      if (item && Date.now() - item.timestamp < item.ttl) {
        return item.value;
      }
      return null;
    },
    set: (key: string, value: any, ttl?: number) =>
      dispatch({ type: 'SET_CACHE', payload: { key, value, ttl } }),
    clear: (key?: string) => dispatch({ type: 'CLEAR_CACHE', payload: key })
  };
};

export const useOffline = () => {
  const { state, dispatch } = useAppState();
  return {
    isOnline: state.isOnline,
    pendingActions: state.pendingActions,
    addPendingAction: (action: Omit<AppState['pendingActions'][0], 'id' | 'retryCount'>) =>
      dispatch({ type: 'ADD_PENDING_ACTION', payload: action }),
    removePendingAction: (id: string) => dispatch({ type: 'REMOVE_PENDING_ACTION', payload: id })
  };
};

export const useErrorHandling = () => {
  const { state, dispatch } = useAppState();
  return {
    errors: state.errors,
    addError: (error: Omit<AppState['errors'][0], 'id' | 'timestamp'>) =>
      dispatch({ type: 'ADD_ERROR', payload: error }),
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' })
  };
};

// Export types
export type { AppState, AppAction, User, Organization, AIInsight, WorkflowState, PerformanceMetrics, ResearchState };
