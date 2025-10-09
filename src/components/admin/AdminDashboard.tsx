/**
 * Admin Dashboard Component
 * Central hub for all administrative functions and system monitoring
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { 
  Users, 
  Settings, 
  Activity, 
  DollarSign, 
  Shield, 
  Database,
  Cpu,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Server,
  Zap,
  GitBranch
} from 'lucide-react';
import SystemMetrics from './SystemMetrics';
import UserManagement from './UserManagement';
import BillingManagement from './BillingManagement';
import SecuritySettings from './SecuritySettings';
import SystemSettings from './SystemSettings';
import AutomationControl from './AutomationControl';
import BlockchainMonitor from './BlockchainMonitor';
import DatabaseMonitor from './DatabaseMonitor';

interface SystemHealth {
  api: { status: 'healthy' | 'degraded' | 'down'; latency: number };
  database: { status: 'healthy' | 'degraded' | 'down'; connections: number };
  blockchain: { status: 'healthy' | 'degraded' | 'down'; blockHeight: number };
  automation: { status: 'healthy' | 'degraded' | 'down'; runningJobs: number };
}

interface QuickStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  optimizations: number;
  spaceSaved: number;
  activeMiners: number;
}

const AdminDashboard: React.FC = () => {
  const { user, checkPermission } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check admin permission
  if (!checkPermission('settings', 'read')) {
    return (
      <div className="admin-access-denied">
        <AlertCircle className="icon-error" size={48} />
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [healthRes, statsRes] = await Promise.all([
        fetch('/api/admin/system-health'),
        fetch('/api/admin/quick-stats')
      ]);

      if (healthRes.ok) {
        const health = await healthRes.json();
        setSystemHealth(health.data);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setQuickStats(stats.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'blockchain', label: 'Blockchain', icon: GitBranch },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 }
  ];

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="health-icon healthy" size={20} />;
      case 'degraded':
        return <AlertCircle className="health-icon degraded" size={20} />;
      case 'down':
        return <XCircle className="health-icon down" size={20} />;
      default:
        return null;
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      {/* System Health */}
      <div className="admin-section">
        <h3 className="admin-section-title">System Health</h3>
        <div className="health-grid">
          {systemHealth && Object.entries(systemHealth).map(([service, health]) => (
            <div key={service} className={`health-card ${health.status}`}>
              <div className="health-header">
                {getHealthIcon(health.status)}
                <span className="health-service">{service.toUpperCase()}</span>
              </div>
              <div className="health-details">
                {service === 'api' && <span>Latency: {health.latency}ms</span>}
                {service === 'database' && <span>Connections: {health.connections}</span>}
                {service === 'blockchain' && <span>Block: #{health.blockHeight}</span>}
                {service === 'automation' && <span>Jobs: {health.runningJobs}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="admin-section">
        <h3 className="admin-section-title">Quick Stats</h3>
        <div className="stats-grid">
          {quickStats && (
            <>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{quickStats.totalUsers.toLocaleString()}</div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-change positive">
                    <TrendingUp size={16} />
                    <span>{quickStats.activeUsers} active</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">${quickStats.revenue.toLocaleString()}</div>
                  <div className="stat-label">Monthly Revenue</div>
                  <div className="stat-change positive">
                    <TrendingUp size={16} />
                    <span>+12.5%</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Zap size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{quickStats.optimizations.toLocaleString()}</div>
                  <div className="stat-label">Optimizations</div>
                  <div className="stat-change positive">
                    <TrendingUp size={16} />
                    <span>+8.3%</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Database size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{(quickStats.spaceSaved / 1024 / 1024 / 1024).toFixed(2)} GB</div>
                  <div className="stat-label">Space Saved</div>
                  <div className="stat-change positive">
                    <TrendingUp size={16} />
                    <span>+15.2%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-section">
        <h3 className="admin-section-title">Recent Activity</h3>
        <div className="activity-feed">
          <div className="activity-item">
            <div className="activity-icon success">
              <CheckCircle size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-text">New user registration: alice@example.com</div>
              <div className="activity-time">2 minutes ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon warning">
              <AlertCircle size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-text">High API usage detected from IP 192.168.1.100</div>
              <div className="activity-time">15 minutes ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon info">
              <Server size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-text">Blockchain sync completed at block #12345</div>
              <div className="activity-time">1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="admin-loading">Loading admin dashboard...</div>;
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return <UserManagement />;
      case 'billing':
        return <BillingManagement />;
      case 'security':
        return <SecuritySettings />;
      case 'system':
        return <SystemSettings />;
      case 'database':
        return <DatabaseMonitor />;
      case 'blockchain':
        return <BlockchainMonitor />;
      case 'automation':
        return <AutomationControl />;
      case 'metrics':
        return <SystemMetrics />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="admin-user">
          <span className="admin-username">{user?.username || user?.email}</span>
          <span className="admin-role">{user?.role}</span>
        </div>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;


