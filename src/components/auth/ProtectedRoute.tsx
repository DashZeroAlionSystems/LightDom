/**
 * Protected Route Component
 * Enforces access control based on authentication, roles, and subscription plans
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { AlertCircle, Lock, CreditCard } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  requirePlan?: string[];
  requirePermission?: { resource: string; action: string };
  fallbackPath?: string;
  showUpgradePrompt?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
  requirePlan,
  requirePermission,
  fallbackPath = '/',
  showUpgradePrompt = true
}) => {
  const { user, loading, isAuthenticated, checkPermission, checkFeatureAccess } = useEnhancedAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Checking access...</p>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requireRole && user) {
    if (!requireRole.includes(user.role)) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <Lock className="access-denied-icon" size={48} />
            <h2>Access Restricted</h2>
            <p>This area is restricted to {requireRole.join(' or ')} users only.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Check plan requirements
  if (requirePlan && user) {
    if (!requirePlan.includes(user.subscription.plan)) {
      if (showUpgradePrompt) {
        return (
          <div className="upgrade-prompt-container">
            <div className="upgrade-prompt-card">
              <CreditCard className="upgrade-icon" size={48} />
              <h2>Upgrade Required</h2>
              <p>This feature requires a {requirePlan.join(' or ')} plan.</p>
              
              <div className="plan-comparison">
                <div className="current-plan">
                  <h4>Your Current Plan</h4>
                  <div className="plan-badge current">{user.subscription.plan}</div>
                </div>
                <div className="required-plan">
                  <h4>Required Plan</h4>
                  <div className="plan-badge required">{requirePlan[0]}</div>
                </div>
              </div>

              <div className="upgrade-benefits">
                <h4>Upgrade Benefits:</h4>
                <ul>
                  {requirePlan.includes('pro') && (
                    <>
                      <li>✓ 100 optimizations per month</li>
                      <li>✓ Advanced analytics</li>
                      <li>✓ API access</li>
                      <li>✓ Priority support</li>
                    </>
                  )}
                  {requirePlan.includes('enterprise') && (
                    <>
                      <li>✓ Unlimited optimizations</li>
                      <li>✓ Team collaboration</li>
                      <li>✓ Custom integrations</li>
                      <li>✓ Dedicated support</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="upgrade-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Plans
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );
      } else {
        return <Navigate to={fallbackPath} replace />;
      }
    }
  }

  // Check specific permissions
  if (requirePermission && user) {
    if (!checkPermission(requirePermission.resource, requirePermission.action)) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <AlertCircle className="access-denied-icon" size={48} />
            <h2>Permission Denied</h2>
            <p>You don't have permission to {requirePermission.action} {requirePermission.resource}.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;


