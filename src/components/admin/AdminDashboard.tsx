/**
 * Admin Dashboard Component
 * Central hub for all administrative functions and system monitoring
 */

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Database,
  DollarSign,
  GitBranch,
  Server,
  Settings,
  Shield,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { Card as DSCard } from '../../utils/AdvancedReusableComponents';
import AutomationControl from './AutomationControl';
import BillingManagement from './BillingManagement';
import BlockchainMonitor from './BlockchainMonitor';
import DatabaseMonitor from './DatabaseMonitor';
import SecuritySettings from './SecuritySettings';
import SystemMetrics from './SystemMetrics';
import SystemSettings from './SystemSettings';
import UserManagement from './UserManagement';

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
      <div className='admin-access-denied'>
        <AlertCircle className='icon-error' size={48} />
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
        fetch('/api/admin/quick-stats'),
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
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  ];

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='health-icon healthy' size={20} />;
      case 'degraded':
        return <AlertCircle className='health-icon degraded' size={20} />;
      case 'down':
        return <XCircle className='health-icon down' size={20} />;
      default:
        return null;
    }
  };

  const renderOverview = () => (
    <div className='admin-overview'>
      {/* System Health */}
      <div className='admin-section'>
        <h3 className='admin-section-title'>System Health</h3>
        <div className='health-grid'>
          {systemHealth &&
            Object.entries(systemHealth).map(([service, health]) => (
              <DSCard.Root
                key={service}
                variant='outlined'
                className={`health-card ${health.status}`}
              >
                <DSCard.Header
                  title={service.toUpperCase()}
                  action={getHealthIcon(health.status)}
                />
                <DSCard.Body>
                  {service === 'api' && <div>Latency: {health.latency}ms</div>}
                  {service === 'database' && <div>Connections: {health.connections}</div>}
                  {service === 'blockchain' && <div>Block: #{health.blockHeight}</div>}
                  {service === 'automation' && <div>Jobs: {health.runningJobs}</div>}
                </DSCard.Body>
              </DSCard.Root>
            ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className='admin-section'>
        <h3 className='admin-section-title'>Quick Stats</h3>
        <div className='stats-grid'>
          {quickStats && (
            <>
              <DSCard.Root variant='outlined' className='stat-card'>
                <DSCard.Body>
                  <div className='stat-icon'>
                    <Users size={24} />
                  </div>
                  <div className='stat-content'>
                    <div className='stat-value'>{quickStats.totalUsers.toLocaleString()}</div>
                    <div className='stat-label'>Total Users</div>
                    <div className='stat-change positive'>
                      <TrendingUp size={16} />
                      <span>{quickStats.activeUsers} active</span>
                    </div>
                  </div>
                </DSCard.Body>
              </DSCard.Root>

              <DSCard.Root variant='outlined' className='stat-card'>
                <DSCard.Body>
                  <div className='stat-icon'>
                    <DollarSign size={24} />
                  </div>
                  <div className='stat-content'>
                    <div className='stat-value'>${quickStats.revenue.toLocaleString()}</div>
                    <div className='stat-label'>Monthly Revenue</div>
                    <div className='stat-change positive'>
                      <TrendingUp size={16} />
                      <span>+12.5%</span>
                    </div>
                  </div>
                </DSCard.Body>
              </DSCard.Root>

              <DSCard.Root variant='outlined' className='stat-card'>
                <DSCard.Body>
                  <div className='stat-icon'>
                    <Zap size={24} />
                  </div>
                  <div className='stat-content'>
                    <div className='stat-value'>{quickStats.optimizations.toLocaleString()}</div>
                    <div className='stat-label'>Optimizations</div>
                    <div className='stat-change positive'>
                      <TrendingUp size={16} />
                      <span>+8.3%</span>
                    </div>
                  </div>
                </DSCard.Body>
              </DSCard.Root>

              <DSCard.Root variant='outlined' className='stat-card'>
                <DSCard.Body>
                  <div className='stat-icon'>
                    <Database size={24} />
                  </div>
                  <div className='stat-content'>
                    <div className='stat-value'>
                      {(quickStats.spaceSaved / 1024 / 1024 / 1024).toFixed(2)} GB
                    </div>
                    <div className='stat-label'>Space Saved</div>
                    <div className='stat-change positive'>
                      <TrendingUp size={16} />
                      <span>+15.2%</span>
                    </div>
                  </div>
                </DSCard.Body>
              </DSCard.Root>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className='admin-section'>
        <h3 className='admin-section-title'>Recent Activity</h3>
        <div className='activity-feed'>
          <DSCard.Root variant='outlined' className='activity-item'>
            <DSCard.Body className='flex items-center gap-3'>
              <div className='activity-icon success'>
                <CheckCircle size={16} />
              </div>
              <div className='activity-content'>
                <div className='activity-text'>New user registration: alice@example.com</div>
                <div className='activity-time'>2 minutes ago</div>
              </div>
            </DSCard.Body>
          </DSCard.Root>

          <DSCard.Root variant='outlined' className='activity-item'>
            <DSCard.Body className='flex items-center gap-3'>
              <div className='activity-icon warning'>
                <AlertCircle size={16} />
              </div>
              <div className='activity-content'>
                <div className='activity-text'>High API usage detected from IP 192.168.1.100</div>
                <div className='activity-time'>15 minutes ago</div>
              </div>
            </DSCard.Body>
          </DSCard.Root>

          <DSCard.Root variant='outlined' className='activity-item'>
            <DSCard.Body className='flex items-center gap-3'>
              <div className='activity-icon info'>
                <Server size={16} />
              </div>
              <div className='activity-content'>
                <div className='activity-text'>Blockchain sync completed at block #12345</div>
                <div className='activity-time'>1 hour ago</div>
              </div>
            </DSCard.Body>
          </DSCard.Root>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className='admin-loading'>Loading admin dashboard...</div>;
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
    <div className='admin-dashboard'>
      {/* Sidebar */}
      <div className='admin-sidebar'>
        <div className='admin-sidebar-header'>
          <h2 className='admin-sidebar-title'>Admin Panel</h2>
          <div className='admin-user-info'>
            <div className='admin-user-avatar'>
              {user?.username?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                'A'}
            </div>
            <div className='admin-user-details'>
              <span className='admin-username'>{user?.username || user?.email}</span>
              <span className='admin-role'>{user?.role}</span>
            </div>
          </div>
        </div>

        <nav className='admin-sidebar-nav'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`admin-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <Icon size={20} />
                <span className='admin-sidebar-label'>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className='admin-sidebar-footer'>
          <div className='admin-system-status'>
            <div className='status-indicator'>
              <div className='status-dot'></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='admin-main'>
        <div className='admin-main-header'>
          <h1 className='admin-page-title'>
            {tabs.find(tab => tab.id === activeTab)?.label || 'Overview'}
          </h1>
          <div className='admin-actions'>
            <button className='admin-action-btn'>
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className='admin-action-btn'>
              <Activity size={16} />
              <span>Activity</span>
            </button>
          </div>
        </div>

        <div className='admin-content'>{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
