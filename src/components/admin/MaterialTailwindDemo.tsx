import React, { useState } from 'react';
import {
  MTButton,
  MTCard,
  MTCardHeader,
  MTCardBody,
  MTCardFooter,
  MTTypography,
  MTInput,
  MTAvatar,
  MTBadge,
  MTProgressBar,
  MTSpinner,
  MTAlert,
  useTheme
} from '../../utils/ReusableDesignSystem';
import {
  Layout,
  Row,
  Col,
  Space,
  Divider
} from 'antd';
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
  SearchOutlined
} from '@ant-design/icons';

/**
 * Material Tailwind Dashboard Demo
 * Showcasing Material Tailwind inspired components in a modern dashboard
 */
const MaterialTailwindDemo: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const menuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Overview', active: true },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', active: false },
    { key: 'users', icon: <TeamOutlined />, label: 'Users', active: false },
    { key: 'content', icon: <FileTextOutlined />, label: 'Content', active: false },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings', active: false },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: '12,458',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <TeamOutlined className="text-blue-500" />,
      color: 'primary' as const
    },
    {
      title: 'Revenue',
      value: '$125,430',
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: <DollarOutlined className="text-green-500" />,
      color: 'success' as const
    },
    {
      title: 'Active Sessions',
      value: '2,847',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: <ThunderboltOutlined className="text-yellow-500" />,
      color: 'warning' as const
    },
    {
      title: 'Storage Used',
      value: '78.5%',
      change: '+5.2%',
      changeType: 'neutral' as const,
      icon: <DatabaseOutlined className="text-cyan-500" />,
      color: 'info' as const
    }
  ];

  const recentActivities = [
    {
      user: 'Alice Johnson',
      action: 'completed purchase',
      amount: '$299.00',
      time: '2 minutes ago',
      status: 'success' as const
    },
    {
      user: 'Bob Smith',
      action: 'updated profile',
      time: '15 minutes ago',
      status: 'info' as const
    },
    {
      user: 'Carol Davis',
      action: 'reported issue',
      time: '1 hour ago',
      status: 'warning' as const
    },
    {
      user: 'David Wilson',
      action: 'left review',
      time: '2 hours ago',
      status: 'success' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 z-10 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } bg-white shadow-lg border-r border-gray-200`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <ThunderboltOutlined className="text-white text-sm" />
              </div>
              <MTTypography variant="h6" className="text-gray-900 font-bold">
                LightDom
              </MTTypography>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ThunderboltOutlined className="text-white text-sm" />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="py-4">
          {menuItems.map(item => (
            <div
              key={item.key}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <MTAvatar size="md" className="flex-shrink-0">
              A
            </MTAvatar>
            {!collapsed && (
              <div className="ml-3 overflow-hidden">
                <div className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </div>
                <div className="text-xs text-gray-500 truncate">
                  admin@example.com
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        collapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>

              <div>
                <MTTypography variant="h4" className="text-gray-900 font-semibold">
                  Dashboard Overview
                </MTTypography>
                <MTTypography variant="paragraph" className="text-gray-600 text-sm">
                  Welcome back! Here's what's happening today.
                </MTTypography>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <BellOutlined />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <SettingOutlined />
              </button>

              {/* Theme Toggle */}
              <MTButton
                variant="outlined"
                size="sm"
                onClick={toggleTheme}
                className="ml-2"
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </MTButton>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <MTCard key={index} variant="elevated" className="hover:shadow-lg transition-shadow duration-200">
                <MTCardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <MTTypography variant="paragraph" className="text-gray-600 text-sm font-medium">
                        {stat.title}
                      </MTTypography>
                      <MTTypography variant="h3" className="text-gray-900 font-bold mt-1">
                        {stat.value}
                      </MTTypography>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stat.changeType === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : stat.changeType === 'negative'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      stat.color === 'primary' ? 'bg-blue-50' :
                      stat.color === 'success' ? 'bg-green-50' :
                      stat.color === 'warning' ? 'bg-yellow-50' :
                      'bg-cyan-50'
                    }`}>
                      {stat.icon}
                    </div>
                  </div>
                </MTCardBody>
              </MTCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <MTCard variant="elevated">
                <MTCardHeader>
                  <div className="flex items-center justify-between">
                    <MTTypography variant="h5" className="text-gray-900 font-semibold">
                      Recent Activity
                    </MTTypography>
                    <MTButton variant="text" size="sm">
                      View All
                    </MTButton>
                  </div>
                </MTCardHeader>
                <MTCardBody className="p-0">
                  <div className="divide-y divide-gray-200">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MTAvatar size="sm">
                              {activity.user.split(' ').map(n => n[0]).join('')}
                            </MTAvatar>
                            <div>
                              <MTTypography variant="paragraph" className="text-gray-900 font-medium">
                                {activity.user}
                              </MTTypography>
                              <MTTypography variant="small" className="text-gray-600">
                                {activity.action}
                                {activity.amount && (
                                  <span className="font-medium text-gray-900 ml-1">
                                    {activity.amount}
                                  </span>
                                )}
                              </MTTypography>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MTBadge
                              variant="ghost"
                              color={
                                activity.status === 'success' ? 'success' :
                                activity.status === 'warning' ? 'warning' : 'info'
                              }
                            >
                              {activity.status}
                            </MTBadge>
                            <MTTypography variant="small" className="text-gray-500">
                              {activity.time}
                            </MTTypography>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MTCardBody>
              </MTCard>
            </div>

            {/* System Status & Progress */}
            <div className="space-y-6">
              {/* System Status */}
              <MTCard variant="elevated">
                <MTCardHeader>
                  <MTTypography variant="h5" className="text-gray-900 font-semibold">
                    System Status
                  </MTTypography>
                </MTCardHeader>
                <MTCardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircleOutlined className="text-green-500" />
                        <span className="text-sm font-medium text-gray-900">API Gateway</span>
                      </div>
                      <MTBadge color="success" size="sm">Healthy</MTBadge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <SyncOutlined className="text-blue-500 animate-spin" />
                        <span className="text-sm font-medium text-gray-900">Database</span>
                      </div>
                      <MTBadge color="info" size="sm">Syncing</MTBadge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ExclamationCircleOutlined className="text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">Cache</span>
                      </div>
                      <MTBadge color="warning" size="sm">Warning</MTBadge>
                    </div>
                  </div>
                </MTCardBody>
              </MTCard>

              {/* Progress Indicators */}
              <MTCard variant="elevated">
                <MTCardHeader>
                  <MTTypography variant="h5" className="text-gray-900 font-semibold">
                    Resource Usage
                  </MTTypography>
                </MTCardHeader>
                <MTCardBody>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <MTTypography variant="small" className="text-gray-600 font-medium">
                          CPU Usage
                        </MTTypography>
                        <MTTypography variant="small" className="text-gray-900 font-medium">
                          67%
                        </MTTypography>
                      </div>
                      <MTProgressBar value={67} color="primary" size="sm" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <MTTypography variant="small" className="text-gray-600 font-medium">
                          Memory
                        </MTTypography>
                        <MTTypography variant="small" className="text-gray-900 font-medium">
                          84%
                        </MTTypography>
                      </div>
                      <MTProgressBar value={84} color="success" size="sm" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <MTTypography variant="small" className="text-gray-600 font-medium">
                          Storage
                        </MTTypography>
                        <MTTypography variant="small" className="text-gray-900 font-medium">
                          45%
                        </MTTypography>
                      </div>
                      <MTProgressBar value={45} color="info" size="sm" />
                    </div>
                  </div>
                </MTCardBody>
              </MTCard>

              {/* Quick Actions */}
              <MTCard variant="elevated">
                <MTCardHeader>
                  <MTTypography variant="h5" className="text-gray-900 font-semibold">
                    Quick Actions
                  </MTTypography>
                </MTCardHeader>
                <MTCardBody>
                  <div className="space-y-3">
                    <MTButton variant="filled" color="primary" fullWidth>
                      <PlusOutlined className="mr-2" />
                      Add New User
                    </MTButton>

                    <MTButton variant="outlined" color="primary" fullWidth>
                      <ThunderboltOutlined className="mr-2" />
                      Run Diagnostics
                    </MTButton>

                    <MTButton variant="text" color="primary" fullWidth>
                      <SettingOutlined className="mr-2" />
                      System Settings
                    </MTButton>
                  </div>
                </MTCardBody>
              </MTCard>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20">
        <MTButton
          variant="filled"
          color="primary"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <PlusOutlined className="text-lg" />
        </MTButton>
      </div>
    </div>
  );
};

export default MaterialTailwindDemo;
