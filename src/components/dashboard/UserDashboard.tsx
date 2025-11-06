/**
 * User Dashboard Component
 * Displays different features based on user's subscription plan
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { 
  Activity, 
  TrendingUp, 
  Database, 
  Zap,
  Globe,
  Award,
  Lock,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  CreditCard
} from 'lucide-react';
import FeatureCard from './FeatureCard';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import UpgradePrompt from './UpgradePrompt';

interface DashboardData {
  stats: {
    optimizations: number;
    spaceSaved: number;
    tokensEarned: string;
    reputation: number;
    activeProjects: number;
    teamMembers: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    icon: string;
  }>;
  availableFeatures: string[];
}

const UserDashboard: React.FC = () => {
  const { user, checkFeatureAccess } = useEnhancedAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableFeatures = () => {
    const plan = user?.subscription.plan || 'free';
    
    const features = {
      free: [
        { id: 'optimization', name: 'DOM Optimization', icon: Zap, enabled: true },
        { id: 'dashboard', name: 'Basic Dashboard', icon: BarChart3, enabled: true },
        { id: 'profile', name: 'Profile Management', icon: Settings, enabled: true },
        { id: 'mining', name: 'Space Mining', icon: Database, enabled: false, requiresPlan: 'pro' },
        { id: 'analytics', name: 'Advanced Analytics', icon: TrendingUp, enabled: false, requiresPlan: 'pro' },
        { id: 'api', name: 'API Access', icon: Globe, enabled: false, requiresPlan: 'pro' },
        { id: 'team', name: 'Team Collaboration', icon: Users, enabled: false, requiresPlan: 'enterprise' },
        { id: 'automation', name: 'Automation Workflows', icon: Sparkles, enabled: false, requiresPlan: 'enterprise' }
      ],
      pro: [
        { id: 'optimization', name: 'DOM Optimization', icon: Zap, enabled: true },
        { id: 'dashboard', name: 'Advanced Dashboard', icon: BarChart3, enabled: true },
        { id: 'profile', name: 'Profile Management', icon: Settings, enabled: true },
        { id: 'mining', name: 'Space Mining', icon: Database, enabled: true },
        { id: 'analytics', name: 'Advanced Analytics', icon: TrendingUp, enabled: true },
        { id: 'api', name: 'API Access', icon: Globe, enabled: true },
        { id: 'team', name: 'Team Collaboration', icon: Users, enabled: false, requiresPlan: 'enterprise' },
        { id: 'automation', name: 'Automation Workflows', icon: Sparkles, enabled: false, requiresPlan: 'enterprise' }
      ],
      enterprise: [
        { id: 'optimization', name: 'DOM Optimization', icon: Zap, enabled: true },
        { id: 'dashboard', name: 'Enterprise Dashboard', icon: BarChart3, enabled: true },
        { id: 'profile', name: 'Profile Management', icon: Settings, enabled: true },
        { id: 'mining', name: 'Space Mining', icon: Database, enabled: true },
        { id: 'analytics', name: 'Advanced Analytics', icon: TrendingUp, enabled: true },
        { id: 'api', name: 'API Access', icon: Globe, enabled: true },
        { id: 'team', name: 'Team Collaboration', icon: Users, enabled: true },
        { id: 'automation', name: 'Automation Workflows', icon: Sparkles, enabled: true }
      ],
      admin: [
        { id: 'optimization', name: 'DOM Optimization', icon: Zap, enabled: true },
        { id: 'dashboard', name: 'Admin Dashboard', icon: BarChart3, enabled: true },
        { id: 'profile', name: 'Profile Management', icon: Settings, enabled: true },
        { id: 'mining', name: 'Space Mining', icon: Database, enabled: true },
        { id: 'analytics', name: 'Advanced Analytics', icon: TrendingUp, enabled: true },
        { id: 'api', name: 'API Access', icon: Globe, enabled: true },
        { id: 'team', name: 'Team Management', icon: Users, enabled: true },
        { id: 'automation', name: 'Automation Workflows', icon: Sparkles, enabled: true },
        { id: 'admin', name: 'Admin Panel', icon: Lock, enabled: true }
      ]
    };

    return features[plan as keyof typeof features] || features.free;
  };

  const shouldShowUpgradePrompt = () => {
    const plan = user?.subscription.plan || 'free';
    return plan === 'free' || (plan === 'pro' && Math.random() > 0.7); // Show occasionally for pro users
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            Welcome back, {user?.username || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="dashboard-subtitle">
            {user?.subscription.plan === 'free' 
              ? 'Upgrade to unlock more features and boost your optimization power!'
              : `You're on the ${user?.subscription.plan} plan. Keep optimizing!`
            }
          </p>
        </div>
        <div className="plan-badge-container">
          <div className={`plan-badge plan-${user?.subscription.plan}`}>
            <CreditCard size={16} />
            <span>{user?.subscription.plan?.toUpperCase()} PLAN</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {dashboardData && (
        <DashboardStats 
          stats={dashboardData.stats} 
          plan={user?.subscription.plan || 'free'}
        />
      )}

      {/* Upgrade Prompt for Free Users */}
      {shouldShowUpgradePrompt() && user?.subscription.plan === 'free' && (
        <UpgradePrompt currentPlan="free" />
      )}

      {/* Available Features */}
      <div className="dashboard-section">
        <h2 className="section-title">Your Features</h2>
        <div className="features-grid">
          {getAvailableFeatures().map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => {
                if (feature.enabled) {
                  window.location.href = `/${feature.id}`;
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboardData && (
        <div className="dashboard-section">
          <h2 className="section-title">Recent Activity</h2>
          <RecentActivity activities={dashboardData.recentActivity} />
        </div>
      )}

      {/* Usage Limits for Free/Pro Users */}
      {user && ['free', 'pro'].includes(user.subscription.plan) && (
        <div className="dashboard-section">
          <h2 className="section-title">Usage Limits</h2>
          <div className="usage-limits">
            <div className="limit-item">
              <div className="limit-header">
                <span className="limit-name">Optimizations</span>
                <span className="limit-value">
                  {dashboardData?.stats.optimizations || 0} / {checkFeatureAccess('optimizations_per_month').limit || '∞'}
                </span>
              </div>
              <div className="limit-bar">
                <div 
                  className="limit-progress"
                  style={{ 
                    width: `${Math.min(
                      ((dashboardData?.stats.optimizations || 0) / (checkFeatureAccess('optimizations_per_month').limit || 1)) * 100,
                      100
                    )}%` 
                  }}
                />
              </div>
            </div>

            <div className="limit-item">
              <div className="limit-header">
                <span className="limit-name">API Calls Today</span>
                <span className="limit-value">
                  {checkFeatureAccess('api_calls_per_day').used || 0} / {checkFeatureAccess('api_calls_per_day').limit || '∞'}
                </span>
              </div>
              <div className="limit-bar">
                <div 
                  className="limit-progress"
                  style={{ 
                    width: `${Math.min(
                      ((checkFeatureAccess('api_calls_per_day').used || 0) / (checkFeatureAccess('api_calls_per_day').limit || 1)) * 100,
                      100
                    )}%` 
                  }}
                />
              </div>
            </div>

            <div className="limit-item">
              <div className="limit-header">
                <span className="limit-name">Storage Used</span>
                <span className="limit-value">
                  {Math.round((dashboardData?.stats.spaceSaved || 0) / 1024 / 1024)} MB / {checkFeatureAccess('storage_mb').limit || '∞'} MB
                </span>
              </div>
              <div className="limit-bar">
                <div 
                  className="limit-progress"
                  style={{ 
                    width: `${Math.min(
                      ((dashboardData?.stats.spaceSaved || 0) / 1024 / 1024 / (checkFeatureAccess('storage_mb').limit || 1)) * 100,
                      100
                    )}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => window.location.href = '/optimization'}
          >
            <Zap size={20} />
            <span>New Optimization</span>
          </button>
          
          {checkFeatureAccess('mining_sessions').enabled && (
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/space-mining'}
            >
              <Database size={20} />
              <span>Start Mining</span>
            </button>
          )}
          
          {checkFeatureAccess('advanced_analytics').enabled && (
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/analytics'}
            >
              <TrendingUp size={20} />
              <span>View Analytics</span>
            </button>
          )}
          
          <button 
            className="quick-action-btn"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;


