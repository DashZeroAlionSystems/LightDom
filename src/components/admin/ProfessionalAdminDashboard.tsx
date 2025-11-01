import React, { useState, useEffect } from 'react';
import AdvancedComponents from '@/utils/AdvancedReusableComponents';
const {
  Card,
  Button,
  Badge,
  Avatar,
  Progress,
  Switch,
  Input,
  Select,
} = AdvancedComponents;
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  FilterOutlined,
  MoreOutlined,
  SearchOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CloudOutlined,
  GlobalOutlined,
  RocketOutlined,
  TrophyOutlined,
  StarOutlined,
  HeartOutlined,
  LikeOutlined,
  DislikeOutlined,
  FireOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

/**
 * Professional Admin Dashboard
 * Following admin UX best practices and Material Design 3 principles
 *
 * Key UX Principles Applied:
 * 1. Clear Visual Hierarchy - Important info at top-left
 * 2. Consistency - Uniform patterns and spacing
 * 3. Minimize Cognitive Load - Clean, focused design
 * 4. Proper Information Architecture - Logical grouping
 * 5. Admin Workflows - User management, analytics, settings
 */
const ProfessionalAdminDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState('overview');
  const [notifications] = useState(12);

  // Navigation items with proper hierarchy
  const navigationItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <DashboardOutlined />,
      badge: 0,
      active: currentView === 'overview'
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: <BarChartOutlined />,
      badge: 3,
      active: currentView === 'analytics'
    },
    {
      key: 'users',
      label: 'User Management',
      icon: <TeamOutlined />,
      badge: 8,
      active: currentView === 'users'
    },
    {
      key: 'content',
      label: 'Content',
      icon: <FileTextOutlined />,
      badge: 0,
      active: currentView === 'content'
    },
    {
      key: 'commerce',
      label: 'Commerce',
      icon: <ShoppingCartOutlined />,
      badge: 2,
      active: currentView === 'commerce'
    },
    {
      key: 'system',
      label: 'System',
      icon: <SettingOutlined />,
      badge: 0,
      active: currentView === 'system'
    },
  ];

  // Key Performance Indicators - Most important data at top
  const kpis = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarOutlined />,
      trend: 'up' as const,
      description: 'vs last month'
    },
    {
      title: 'Active Users',
      value: '45,231',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: <TeamOutlined />,
      trend: 'up' as const,
      description: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: <ThunderboltOutlined />,
      trend: 'down' as const,
      description: 'vs last month'
    },
    {
      title: 'System Uptime',
      value: '99.98%',
      change: '+0.02%',
      changeType: 'positive' as const,
      icon: <CloudOutlined />,
      trend: 'up' as const,
      description: 'vs last month'
    }
  ];

  // System health status - Critical operational data
  const systemHealth = [
    {
      service: 'API Gateway',
      status: 'healthy' as const,
      uptime: '99.9%',
      responseTime: '42ms',
      requests: '1.2K/min'
    },
    {
      service: 'Database',
      status: 'healthy' as const,
      uptime: '99.8%',
      responseTime: '8ms',
      requests: '856/min'
    },
    {
      service: 'Cache Layer',
      status: 'warning' as const,
      uptime: '97.2%',
      responseTime: '15ms',
      requests: '2.1K/min'
    },
    {
      service: 'CDN',
      status: 'healthy' as const,
      uptime: '99.9%',
      responseTime: '23ms',
      requests: '5.8K/min'
    }
  ];

  // Recent activities - Audit trail for admin actions
  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'User Registration',
      details: 'New user account created',
      timestamp: '2 minutes ago',
      status: 'success',
      avatar: 'SJ'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'Payment Processed',
      details: '$299.99 - Premium Plan',
      timestamp: '15 minutes ago',
      status: 'success',
      avatar: 'MC'
    },
    {
      id: 3,
      user: 'Lisa Wong',
      action: 'Content Updated',
      details: 'Product documentation revised',
      timestamp: '1 hour ago',
      status: 'info',
      avatar: 'LW'
    },
    {
      id: 4,
      user: 'David Kim',
      action: 'Security Alert',
      details: 'Failed login attempts detected',
      timestamp: '2 hours ago',
      status: 'warning',
      avatar: 'DK'
    }
  ];

  // Quick actions - Most common admin tasks
  const quickActions = [
    {
      title: 'Add User',
      description: 'Create new user account',
      icon: <UserOutlined />,
      action: () => console.log('Add user')
    },
    {
      title: 'View Reports',
      description: 'Access analytics dashboard',
      icon: <BarChartOutlined />,
      action: () => setCurrentView('analytics')
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <SettingOutlined />,
      action: () => setCurrentView('system')
    },
    {
      title: 'Export Data',
      description: 'Download user and system data',
      icon: <DownloadOutlined />,
      action: () => console.log('Export data')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar - Clear hierarchy with collapsible design */}
      <nav className={`fixed left-0 top-0 bottom-0 z-10 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-white shadow-lg border-r border-gray-200`}>
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ThunderboltOutlined className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">LightDom</h1>
                <p className="text-xs text-gray-600">Admin Portal</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ThunderboltOutlined className="text-white text-sm" />
            </div>
          )}
        </div>

        {/* Navigation Menu - Consistent spacing and interaction patterns */}
        <div className="py-4">
          {navigationItems.map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`w-full flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <Badge content={item.badge} color="primary" size="sm" />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* User Profile - Bottom of sidebar for easy access */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar size="md" className="flex-shrink-0">
              A
            </Avatar>
            {!sidebarCollapsed && (
              <div className="ml-3 overflow-hidden">
                <div className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </div>
                <div className="text-xs text-gray-500 truncate">
                  admin@lightdom.com
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header - Global actions and navigation context */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.key === currentView)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  Monitor and manage your platform effectively
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search - Global search functionality */}
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users, content, settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>

              {/* Filter Chips - Quick filters */}
              <div className="flex space-x-2">
                <Button
                  variant={selectedFilters.includes('active') ? 'filled' : 'outlined'}
                  size="sm"
                  color="primary"
                  onClick={() => {
                    setSelectedFilters(prev =>
                      prev.includes('active')
                        ? prev.filter(f => f !== 'active')
                        : [...prev, 'active']
                    );
                  }}
                >
                  Active
                </Button>
                <Button
                  variant={selectedFilters.includes('pending') ? 'filled' : 'outlined'}
                  size="sm"
                  color="warning"
                  onClick={() => {
                    setSelectedFilters(prev =>
                      prev.includes('pending')
                        ? prev.filter(f => f !== 'pending')
                        : [...prev, 'pending']
                    );
                  }}
                >
                  Pending
                </Button>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <BellOutlined />
                {notifications > 0 && (
                  <Badge content={notifications} color="error" size="sm" className="absolute -top-1 -right-1" />
                )}
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <SettingOutlined />
              </button>

              {/* Quick Actions Menu */}
              <Button variant="outlined" size="sm">
                <MoreOutlined />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area - Organized by information hierarchy */}
        <div className="p-6">
          {/* Key Performance Indicators - Most important metrics first */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => (
              <Card.Root key={index} variant="elevated" className="hover:shadow-lg transition-shadow duration-200">
                <Card.Body className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {kpi.title}
                      </p>
                      <div className="flex items-baseline mt-2">
                        <p className="text-2xl font-bold text-gray-900">
                          {kpi.value}
                        </p>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className={`text-sm font-medium ${
                          kpi.changeType === 'positive'
                            ? 'text-green-600'
                            : kpi.changeType === 'negative'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {kpi.change}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">
                          {kpi.description}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      kpi.trend === 'up'
                        ? 'bg-green-50'
                        : kpi.trend === 'down'
                        ? 'bg-red-50'
                        : 'bg-blue-50'
                    }`}>
                      <span className={`text-xl ${
                        kpi.trend === 'up'
                          ? 'text-green-600'
                          : kpi.trend === 'down'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {kpi.icon}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card.Root>
            ))}
          </div>

          {/* System Health & Analytics - Secondary priority information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* System Health Status */}
            <div className="lg:col-span-2">
              <Card.Root variant="elevated">
                <Card.Header
                  title="System Health"
                  subtitle="Real-time monitoring of critical services"
                  action={
                    <Button variant="outlined" size="sm">
                      View Details
                    </Button>
                  }
                />
                <Card.Body className="p-0">
                  <div className="divide-y divide-gray-200">
                    {systemHealth.map((service, index) => (
                      <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              service.status === 'healthy'
                                ? 'bg-green-50'
                                : service.status === 'warning'
                                ? 'bg-yellow-50'
                                : 'bg-red-50'
                            }`}>
                              {service.status === 'healthy' ? (
                                <CheckCircleOutlined className="text-green-600" />
                              ) : service.status === 'warning' ? (
                                <ExclamationCircleOutlined className="text-yellow-600" />
                              ) : (
                                <CloseCircleOutlined className="text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {service.service}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                                <span>Uptime: {service.uptime}</span>
                                <span>Response: {service.responseTime}</span>
                                <span>Requests: {service.requests}</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            content={service.status}
                            variant="ghost"
                            color={
                              service.status === 'healthy'
                                ? 'success'
                                : service.status === 'warning'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card.Root>
            </div>

            {/* Quick Actions - Most common admin tasks */}
            <div>
              <Card.Root variant="elevated">
                <Card.Header
                  title="Quick Actions"
                  subtitle="Frequently used operations"
                />
                <Card.Body className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center group"
                      >
                        <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-200">
                          {action.icon}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {action.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {action.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card.Body>
              </Card.Root>
            </div>
          </div>

          {/* Recent Activity - Audit trail and recent changes */}
          <Card.Root variant="elevated" className="mb-8">
            <Card.Header
              title="Recent Activity"
              subtitle="Latest system events and user actions"
              action={
                <div className="flex space-x-2">
                  <Button variant="outlined" size="sm">
                    <FilterOutlined className="mr-2" />
                    Filter
                  </Button>
                  <Button variant="outlined" size="sm">
                    <DownloadOutlined className="mr-2" />
                    Export
                  </Button>
                </div>
              }
            />
            <Card.Body className="p-0">
              <div className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar size="lg" className="flex-shrink-0">
                          {activity.avatar}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.user}
                            </p>
                            <Badge
                              content={activity.status}
                              variant="ghost"
                              color={
                                activity.status === 'success'
                                  ? 'success'
                                  : activity.status === 'warning'
                                  ? 'warning'
                                  : 'info'
                              }
                              size="sm"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">{activity.action}</span>
                            {activity.details && (
                              <span className="ml-1">- {activity.details}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {activity.timestamp}
                        </span>
                        <Button variant="text" size="sm" color="primary">
                          <EyeOutlined />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
            <Card.Footer justify="center">
              <Button variant="outlined" color="primary">
                Load More Activities
              </Button>
            </Card.Footer>
          </Card.Root>
        </div>
      </main>

      {/* Floating Action Button - Primary action */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          variant="filled"
          color="primary"
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl w-14 h-14"
        >
          <PlusOutlined className="text-lg" />
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalAdminDashboard;
