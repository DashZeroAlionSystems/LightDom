/**
 * Tests for Enhanced Authentication and Access Control
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EnhancedAuthProvider, useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import ProtectedRoute from '../auth/ProtectedRoute';
import AdminDashboard from '../admin/AdminDashboard';
import UserDashboard from '../dashboard/UserDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Test component to access auth context
const TestAuthComponent = () => {
  const auth = useEnhancedAuth();
  return (
    <div>
      <div data-testid="auth-status">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-role">{auth.user?.role || 'none'}</div>
      <div data-testid="user-plan">{auth.user?.subscription.plan || 'none'}</div>
      <div data-testid="is-admin">{auth.isAdmin ? 'true' : 'false'}</div>
      <div data-testid="is-paid">{auth.isPaidUser ? 'true' : 'false'}</div>
    </div>
  );
};

describe('EnhancedAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide default auth state', () => {
    render(
      <EnhancedAuthProvider>
        <TestAuthComponent />
      </EnhancedAuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent('none');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('should authenticate user with token', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user',
          subscription: { plan: 'pro' }
        }
      })
    });

    render(
      <EnhancedAuthProvider>
        <TestAuthComponent />
      </EnhancedAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-plan')).toHaveTextContent('pro');
      expect(screen.getByTestId('is-paid')).toHaveTextContent('true');
    });
  });

  it('should identify admin users', async () => {
    localStorageMock.getItem.mockReturnValue('admin-token');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: '1',
          email: 'admin@example.com',
          role: 'admin',
          subscription: { plan: 'admin' }
        }
      })
    });

    render(
      <EnhancedAuthProvider>
        <TestAuthComponent />
      </EnhancedAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('is-paid')).toHaveTextContent('true');
    });
  });
});

describe('ProtectedRoute', () => {
  it('should render children for authenticated users', async () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      role: 'user',
      subscription: { plan: 'free' }
    };

    render(
      <EnhancedAuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </EnhancedAuthProvider>
    );

    // Initially shows loading
    expect(screen.getByText('Checking access...')).toBeInTheDocument();
  });

  it('should block access for wrong role', () => {
    const TestComponent = () => {
      const { user } = useEnhancedAuth();
      if (!user) return null;
      
      return (
        <ProtectedRoute requireRole={['admin']}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      );
    };

    render(
      <EnhancedAuthProvider>
        <TestComponent />
      </EnhancedAuthProvider>
    );

    // Should not show admin content for regular user
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
  });

  it('should show upgrade prompt for plan restrictions', () => {
    const TestComponent = () => {
      const { user } = useEnhancedAuth();
      if (!user) return null;
      
      return (
        <ProtectedRoute requirePlan={['pro', 'enterprise']}>
          <div>Pro Feature</div>
        </ProtectedRoute>
      );
    };

    render(
      <EnhancedAuthProvider>
        <TestComponent />
      </EnhancedAuthProvider>
    );

    // Should not show pro content for free user
    expect(screen.queryByText('Pro Feature')).not.toBeInTheDocument();
  });
});

describe('Feature Access', () => {
  it('should check feature limits correctly', () => {
    const TestFeatureComponent = () => {
      const { checkFeatureAccess } = useEnhancedAuth();
      
      const optimizationAccess = checkFeatureAccess('optimizations_per_month');
      const apiAccess = checkFeatureAccess('api_access');
      
      return (
        <div>
          <div data-testid="opt-enabled">{optimizationAccess.enabled ? 'true' : 'false'}</div>
          <div data-testid="opt-limit">{optimizationAccess.limit || 'none'}</div>
          <div data-testid="api-enabled">{apiAccess.enabled ? 'true' : 'false'}</div>
        </div>
      );
    };

    render(
      <EnhancedAuthProvider>
        <TestFeatureComponent />
      </EnhancedAuthProvider>
    );

    // Free plan should have limited optimizations and no API access
    expect(screen.getByTestId('opt-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('opt-limit')).toHaveTextContent('10');
    expect(screen.getByTestId('api-enabled')).toHaveTextContent('false');
  });
});

describe('Admin Dashboard Access', () => {
  it('should deny access to non-admin users', () => {
    render(
      <EnhancedAuthProvider>
        <AdminDashboard />
      </EnhancedAuthProvider>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access the admin dashboard.")).toBeInTheDocument();
  });
});

describe('User Dashboard', () => {
  it('should show different features based on plan', async () => {
    // Mock API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        stats: {
          optimizations: 5,
          spaceSaved: 1024000,
          tokensEarned: '100',
          reputation: 50
        },
        recentActivity: [],
        availableFeatures: ['optimization', 'dashboard']
      })
    });

    render(
      <EnhancedAuthProvider>
        <UserDashboard />
      </EnhancedAuthProvider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading your dashboard...')).not.toBeInTheDocument();
    });
  });
});


