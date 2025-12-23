/**
 * Dashboard Components Stories
 * 
 * Collection of dashboard-specific components for metrics, status, and actions.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Dashboard Card Component
const DashboardCard: React.FC<{
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}> = ({
  title,
  subtitle,
  icon,
  action,
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-900 shadow-lg border-transparent hover:shadow-xl',
    outlined: 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600',
    filled: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`rounded-2xl border transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {(title || subtitle || icon || action) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && <div className="text-gray-400">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  className?: string;
}> = ({ title, value, icon, subtitle, trend, className = '' }) => {
  return (
    <DashboardCard className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {trend && (
          <span className={`text-sm font-medium flex items-center ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </DashboardCard>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{
  status: 'healthy' | 'warning' | 'error' | 'inactive';
  label?: string;
  animated?: boolean;
  className?: string;
}> = ({ status, label, animated = false, className = '' }) => {
  const statusStyles = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    inactive: 'bg-gray-400',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${statusStyles[status]} ${animated ? 'animate-pulse' : ''}`} />
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </div>
  );
};

// Service Action Button Component
const ServiceActionButton: React.FC<{
  label: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}> = ({ label, description, icon, variant = 'secondary', onClick, disabled = false }) => {
  const variantStyles = {
    primary: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20',
    secondary: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
    danger: 'border-red-200 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-start gap-3 p-4 rounded-xl border text-left transition-all
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="text-gray-500 dark:text-gray-400">{icon}</div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </button>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}> = ({ icon, title, description, timestamp, status = 'info' }) => {
  const statusColors = {
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className={`p-2 rounded-full ${statusColors[status]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{timestamp}</span>
    </div>
  );
};

const meta: Meta = {
  title: 'DESIGN SYSTEM/Organisms/Dashboard',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## Dashboard Components

Collection of specialized components for building dashboards and admin interfaces.

### Components Included
- **DashboardCard**: Base container for dashboard widgets
- **MetricCard**: Display key metrics with trends
- **StatusBadge**: Show system/service status
- **ServiceActionButton**: Actionable cards for services
- **ActivityItem**: Activity feed items

### Design System Rules
- **Card Spacing**: 24px (1.5rem) padding for md size
- **Grid Gap**: 24px between dashboard cards
- **Metrics**: Prominent values with supporting context
- **Status Colors**: Green/Yellow/Red/Gray for status indicators

### When to Use
- Admin dashboards
- Analytics views
- System monitoring
- Activity feeds
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Dashboard Card Variants
export const CardVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <DashboardCard variant="default" title="Default Card">
        <p className="text-gray-500">Default styling with border</p>
      </DashboardCard>
      <DashboardCard variant="elevated" title="Elevated Card">
        <p className="text-gray-500">With shadow, no border</p>
      </DashboardCard>
      <DashboardCard variant="outlined" title="Outlined Card">
        <p className="text-gray-500">Thicker border for emphasis</p>
      </DashboardCard>
      <DashboardCard variant="filled" title="Filled Card">
        <p className="text-gray-500">Colored background</p>
      </DashboardCard>
    </div>
  ),
};

// Metric Cards
export const MetricCards: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="Total Users"
        value="24,521"
        trend={{ value: 12.5, direction: 'up' }}
        subtitle="vs last month"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />
      <MetricCard
        title="Revenue"
        value="$45,234"
        trend={{ value: 8.2, direction: 'up' }}
        subtitle="this month"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <MetricCard
        title="Bounce Rate"
        value="32.1%"
        trend={{ value: 3.4, direction: 'down' }}
        subtitle="decreased"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
      <MetricCard
        title="Active Sessions"
        value="1,234"
        subtitle="right now"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />
    </div>
  ),
};

// Status Badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <StatusBadge status="healthy" label="All Systems Operational" animated />
      <StatusBadge status="warning" label="Degraded Performance" animated />
      <StatusBadge status="error" label="System Down" animated />
      <StatusBadge status="inactive" label="Maintenance Mode" />
    </div>
  ),
};

// Service Actions
export const ServiceActions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-w-3xl">
      <ServiceActionButton
        label="Start Service"
        description="Launch the application server"
        variant="primary"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <ServiceActionButton
        label="Restart Service"
        description="Restart with zero downtime"
        variant="secondary"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      />
      <ServiceActionButton
        label="Stop Service"
        description="Gracefully shutdown"
        variant="danger"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        }
      />
    </div>
  ),
};

// Activity Feed
export const ActivityFeed: Story = {
  render: () => (
    <DashboardCard title="Recent Activity" className="max-w-md">
      <div className="space-y-1">
        <ActivityItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
          title="Deployment completed"
          description="Production build v2.4.1"
          timestamp="2 min ago"
          status="success"
        />
        <ActivityItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          title="High CPU usage detected"
          description="Server-01 reached 85% CPU"
          timestamp="15 min ago"
          status="warning"
        />
        <ActivityItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Database connection failed"
          description="Primary DB unreachable"
          timestamp="1 hour ago"
          status="error"
        />
        <ActivityItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          title="New user signup"
          description="john.doe@example.com"
          timestamp="2 hours ago"
          status="info"
        />
      </div>
    </DashboardCard>
  ),
};

// Full Dashboard Example
export const FullDashboard: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status="healthy" label="All Systems Normal" animated />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Reports
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value="$125,430" trend={{ value: 15.3, direction: 'up' }} />
        <MetricCard title="Active Users" value="8,432" trend={{ value: 5.7, direction: 'up' }} />
        <MetricCard title="Conversion" value="3.24%" trend={{ value: 0.4, direction: 'down' }} />
        <MetricCard title="Avg. Session" value="4m 23s" trend={{ value: 12, direction: 'up' }} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart Area */}
        <DashboardCard title="Revenue Overview" subtitle="Last 30 days" className="col-span-2">
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-400">Chart Placeholder</span>
          </div>
        </DashboardCard>

        {/* Activity */}
        <DashboardCard title="Recent Activity" action={<a href="#" className="text-sm text-blue-600">View all</a>}>
          <div className="space-y-1 -mx-2">
            <ActivityItem
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              title="New order received"
              description="Order #12345"
              timestamp="Just now"
              status="success"
            />
            <ActivityItem
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              title="New user signup"
              description="Sarah Johnson"
              timestamp="5 min ago"
              status="info"
            />
            <ActivityItem
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
              title="Payment failed"
              description="Retry required"
              timestamp="1 hour ago"
              status="error"
            />
          </div>
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <ServiceActionButton
          label="Generate Report"
          description="Export analytics data"
          variant="secondary"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <ServiceActionButton
          label="Invite Team"
          description="Add new members"
          variant="primary"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
        />
        <ServiceActionButton
          label="Settings"
          description="Configure preferences"
          variant="secondary"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <ServiceActionButton
          label="Get Help"
          description="Contact support"
          variant="secondary"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
      </div>
    </div>
  ),
};
