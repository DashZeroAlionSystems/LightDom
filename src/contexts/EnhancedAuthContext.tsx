/**
 * Enhanced Authentication Context with Role-Based Access Control
 * Manages user authentication, permissions, and subscription tiers
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Client-side context must not pull server-only modules. Use API endpoints instead of direct imports.

export interface User {
  id: string;
  name?: string;
  walletAddress: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  subscription: {
    plan: 'free' | 'pro' | 'enterprise' | 'admin';
    status: 'active' | 'inactive' | 'cancelled' | 'trial';
    expiresAt: string;
    features: string[];
  };
  wallet: {
    address: string;
    connected: boolean;
    balance: string;
    ldomBalance: string;
  };
  stats: {
    reputation: number;
    totalSpaceHarvested: number;
    optimizationCount: number;
    tokensEarned: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
    dashboard: string[];
  };
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface FeatureAccess {
  feature: string;
  enabled: boolean;
  limit?: number;
  used?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletAddress: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
  checkFeatureAccess: (feature: string) => FeatureAccess;
  // Convenience helper for dev/demo flows to inject a mock user
  setMockUser?: (user: Partial<User> | User | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPaidUser: boolean;
  refreshUserData: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  walletAddress?: string;
}

// Feature limits by subscription plan
const FEATURE_LIMITS = {
  free: {
    optimizations_per_month: 10,
    sites_monitored: 3,
    api_calls_per_day: 100,
    mining_sessions: 1,
    storage_mb: 100,
    team_members: 0,
    custom_domains: 0,
    advanced_analytics: false,
    priority_support: false,
    api_access: false,
    automation_workflows: 0,
    export_data: false
  },
  pro: {
    optimizations_per_month: 100,
    sites_monitored: 25,
    api_calls_per_day: 1000,
    mining_sessions: 5,
    storage_mb: 1000,
    team_members: 3,
    custom_domains: 3,
    advanced_analytics: true,
    priority_support: false,
    api_access: true,
    automation_workflows: 10,
    export_data: true
  },
  enterprise: {
    optimizations_per_month: -1, // unlimited
    sites_monitored: -1,
    api_calls_per_day: -1,
    mining_sessions: -1,
    storage_mb: -1,
    team_members: -1,
    custom_domains: -1,
    advanced_analytics: true,
    priority_support: true,
    api_access: true,
    automation_workflows: -1,
    export_data: true
  },
  admin: {
    // Admins have access to everything
    optimizations_per_month: -1,
    sites_monitored: -1,
    api_calls_per_day: -1,
    mining_sessions: -1,
    storage_mb: -1,
    team_members: -1,
    custom_domains: -1,
    advanced_analytics: true,
    priority_support: true,
    api_access: true,
    automation_workflows: -1,
    export_data: true,
    admin_panel: true,
    system_settings: true,
    user_management: true,
    billing_management: true,
    security_settings: true
  }
};

// Default dashboards by role
const DEFAULT_DASHBOARDS = {
  free: ['dashboard', 'optimization', 'profile'],
  pro: ['dashboard', 'optimization', 'mining', 'analytics', 'profile'],
  enterprise: ['dashboard', 'optimization', 'mining', 'analytics', 'team', 'automation', 'profile'],
  admin: ['admin', 'dashboard', 'optimization', 'mining', 'analytics', 'team', 'automation', 'users', 'settings', 'monitoring']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          const enhancedUser = await enhanceUserData(userData.user);
          setUser(enhancedUser);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const enhanceUserData = async (basicUser: any): Promise<User> => {
    try {
      // Fetch stats via API (server-only work happens on the backend)
      const statsResp = await fetch(`/api/users/${encodeURIComponent(basicUser.walletAddress || basicUser.email)}/stats`, {
        headers: { 'Accept': 'application/json' }
      });
      const stats = statsResp.ok ? await statsResp.json() : null;
      
      // Determine subscription plan and features
      const subscription = basicUser.subscription || {
        plan: 'free',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: Object.keys(FEATURE_LIMITS.free)
      };
      
      // Set permissions based on role
      const permissions = getPermissionsByRole(basicUser.role || 'user', subscription.plan);
      
      // Get default dashboards
      const dashboards = DEFAULT_DASHBOARDS[subscription.plan] || DEFAULT_DASHBOARDS.free;
      
      return {
        ...basicUser,
        subscription,
        permissions,
        stats: {
          reputation: stats?.reputation_score || 0,
          totalSpaceHarvested: stats?.total_space_saved || 0,
          optimizationCount: stats?.total_optimizations || 0,
          tokensEarned: stats?.tokens_earned || '0'
        },
        preferences: {
          ...basicUser.preferences,
          dashboard: dashboards
        }
      };
    } catch (error) {
      console.error('Failed to enhance user data:', error);
      return basicUser;
    }
  };

  const getPermissionsByRole = (role: string, plan: string): Permission[] => {
    const permissions: Permission[] = [];
    
    // Basic user permissions
    permissions.push(
      { resource: 'profile', actions: ['read', 'update'] },
      { resource: 'optimization', actions: ['read', 'create'] },
      { resource: 'dashboard', actions: ['read'] }
    );
    
    // Plan-based permissions
    if (plan === 'pro' || plan === 'enterprise' || plan === 'admin') {
      permissions.push(
        { resource: 'mining', actions: ['read', 'create', 'update'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'api', actions: ['read', 'use'] }
      );
    }
    
    if (plan === 'enterprise' || plan === 'admin') {
      permissions.push(
        { resource: 'team', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'automation', actions: ['read', 'create', 'update', 'delete'] }
      );
    }
    
    // Admin permissions
    if (role === 'admin') {
      permissions.push(
        { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'billing', actions: ['read', 'update'] },
        { resource: 'monitoring', actions: ['read'] },
        { resource: 'security', actions: ['read', 'update'] }
      );
    }
    
    return permissions;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      
      const enhancedUser = await enhanceUserData(data.user);
      setUser(enhancedUser);
      
      // Track login via API to avoid client-service coupling
      try { await fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'user_login', userId: enhancedUser.id }) }); } catch {}
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithWallet = async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Wallet login failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      
      const enhancedUser = await enhanceUserData(data.user);
      setUser(enhancedUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setError(null);
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      
      // Create user in database
      await databaseIntegration.createUser(userData.walletAddress || userData.email, userData);
      
      const enhancedUser = await enhanceUserData(data.user);
      setUser(enhancedUser);
      
      // Track registration server-side via API (no client coupling)
      try { await fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'registration', userId: enhancedUser.id }) }); } catch {}
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      const enhancedUser = await enhanceUserData(updatedUser);
      setUser(enhancedUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = useCallback((resource: string, action: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admins can do everything
    
    const permission = user.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  }, [user]);

  const checkFeatureAccess = useCallback((feature: string): FeatureAccess => {
    if (!user) {
      return { feature, enabled: false };
    }
    
    const limits = FEATURE_LIMITS[user.subscription.plan];
    const limit = limits[feature as keyof typeof limits];
    
    if (limit === undefined) {
      return { feature, enabled: false };
    }
    
    if (typeof limit === 'boolean') {
      return { feature, enabled: limit };
    }
    
    if (typeof limit === 'number') {
      return {
        feature,
        enabled: limit !== 0,
        limit: limit === -1 ? undefined : limit,
        used: 0 // This would be fetched from actual usage data
      };
    }
    
    return { feature, enabled: false };
  }, [user]);

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const enhancedUser = await enhanceUserData(user);
      setUser(enhancedUser);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Dev/demo helper to quickly set a mock user (keeps shape safe)
  const setMockUser = (u: Partial<User> | User | null) => {
    if (!u) {
      setUser(null);
      return;
    }

    const mock: User = {
      id: (u as any).id || 'mock-user',
      walletAddress: (u as any).walletAddress || (u as any).email || '0x0',
      username: (u as any).username || (u as any).name || (u as any).email || 'mock',
      name: (u as any).name || (u as any).username || (u as any).email || 'Mock User',
      email: (u as any).email || 'mock@lightdom.local',
      avatar: (u as any).avatar,
      role: (u as any).role || 'user',
      subscription: (u as any).subscription || {
        plan: 'free',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: Object.keys(FEATURE_LIMITS.free)
      },
      wallet: (u as any).wallet || { address: (u as any).walletAddress || '0x0', connected: false, balance: '0', ldomBalance: '0' },
      stats: (u as any).stats || { reputation: 0, totalSpaceHarvested: 0, optimizationCount: 0, tokensEarned: '0' },
      preferences: (u as any).preferences || { theme: 'system', notifications: true, language: 'en', dashboard: DEFAULT_DASHBOARDS.free },
      permissions: (u as any).permissions || getPermissionsByRole((u as any).role || 'user', ((u as any).subscription && (u as any).subscription.plan) || 'free')
    };

    setUser(mock);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    loginWithWallet,
    logout,
    register,
    updateProfile,
    checkPermission,
    checkFeatureAccess,
    setMockUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPaidUser: user ? ['pro', 'enterprise', 'admin'].includes(user.subscription.plan) : false,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export type { User, Permission, FeatureAccess, AuthContextType };


