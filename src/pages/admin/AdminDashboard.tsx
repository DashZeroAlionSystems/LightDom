/**
 * Admin Dashboard Overview - Material Design 3
 * Following research guidelines from docs/research/
 */

import DashboardShell from '../DashboardShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Settings,
  Shield,
  Database,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Server,
  Cpu,
  HardDrive,
  Network,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <Card variant="elevated" className="hover:shadow-level-3 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm text-on-surface-variant mb-1">{title}</p>
            <h3 className="text-headline-md font-semibold">{value}</h3>
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-error" />
              )}
              <span
                className={cn(
                  'text-label-md font-medium',
                  trend === 'up' ? 'text-success' : 'text-error'
                )}
              >
                {change}
              </span>
              <span className="text-label-sm text-on-surface-variant">vs last month</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+8.2%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Sessions',
      value: '573',
      change: '+23.1%',
      trend: 'up' as const,
      icon: Activity,
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-2.4%',
      trend: 'down' as const,
      icon: TrendingUp,
    },
  ];

  const systemHealth = [
    { name: 'API Server', status: 'healthy', uptime: '99.9%', icon: Server },
    { name: 'Database', status: 'healthy', uptime: '99.8%', icon: Database },
    { name: 'Blockchain', status: 'warning', uptime: '95.2%', icon: Network },
    { name: 'Cache', status: 'healthy', uptime: '99.7%', icon: HardDrive },
    { name: 'Worker Queue', status: 'healthy', uptime: '98.5%', icon: Cpu },
    { name: 'CDN', status: 'healthy', uptime: '99.9%', icon: Zap },
  ];

  const recentUsers = [
    { name: 'Alice Johnson', email: 'alice@example.com', status: 'active', joined: '2 hours ago', role: 'user' },
    { name: 'Bob Smith', email: 'bob@example.com', status: 'pending', joined: '5 hours ago', role: 'user' },
    { name: 'Carol White', email: 'carol@example.com', status: 'active', joined: '1 day ago', role: 'admin' },
    { name: 'David Brown', email: 'david@example.com', status: 'inactive', joined: '2 days ago', role: 'user' },
  ];

  return (
    <DashboardShell mode="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg font-bold">Dashboard Overview</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Welcome back! Here's what's happening with your platform today.
            </p>
          </div>
          <Button leftIcon={<Activity className="h-4 w-4" />}>
            View Analytics
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* System Health */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time status of all system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemHealth.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-label-lg font-medium">{service.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{service.uptime} uptime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.status === 'healthy' && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Healthy
                      </Badge>
                    )}
                    {service.status === 'warning' && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Warning
                      </Badge>
                    )}
                    {service.status === 'error' && (
                      <Badge variant="error" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card variant="elevated">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </div>
              <Button variant="text" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-on-primary font-medium text-label-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-label-lg font-medium">{user.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'pending'
                            ? 'warning'
                            : 'outline'
                        }
                      >
                        {user.status}
                      </Badge>
                      <Badge
                        variant={user.role === 'admin' ? 'error' : 'outline'}
                        className="ml-2"
                      >
                        {user.role}
                      </Badge>
                      <p className="text-label-sm text-on-surface-variant mt-1">
                        {user.joined}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outlined" fullWidth className="mt-4">
                View All Users
              </Button>
            </CardContent>
          </Card>

          {/* System Activity */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Real-time platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: 'New user registration', time: '2 minutes ago', type: 'success' },
                  { event: 'Payment processed', time: '15 minutes ago', type: 'success' },
                  { event: 'Failed login attempt', time: '1 hour ago', type: 'warning' },
                  { event: 'Database backup completed', time: '3 hours ago', type: 'success' },
                  { event: 'API rate limit exceeded', time: '5 hours ago', type: 'error' },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <div
                      className={cn(
                        'h-2 w-2 mt-2 rounded-full',
                        activity.type === 'success' && 'bg-success',
                        activity.type === 'warning' && 'bg-warning',
                        activity.type === 'error' && 'bg-error'
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-label-md font-medium">{activity.event}</p>
                      <p className="text-label-sm text-on-surface-variant">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="text" fullWidth className="mt-4">
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="filled-tonal" fullWidth leftIcon={<Users className="h-4 w-4" />}>
                  Add User
                </Button>
                <Button variant="filled-tonal" fullWidth leftIcon={<Activity className="h-4 w-4" />}>
                  Run Report
                </Button>
                <Button variant="filled-tonal" fullWidth leftIcon={<DollarSign className="h-4 w-4" />}>
                  Process Payment
                </Button>
                <Button variant="filled-tonal" fullWidth leftIcon={<TrendingUp className="h-4 w-4" />}>
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
                  <div>
                    <p className="text-label-md font-medium">Maintenance Mode</p>
                    <p className="text-label-sm text-on-surface-variant">Temporarily disable user access</p>
                  </div>
                  <Button variant="outlined" size="sm">
                    Off
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
                  <div>
                    <p className="text-label-md font-medium">Debug Mode</p>
                    <p className="text-label-sm text-on-surface-variant">Enable detailed logging</p>
                  </div>
                  <Button variant="outlined" size="sm">
                    Off
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
                  <div>
                    <p className="text-label-md font-medium">Registration</p>
                    <p className="text-label-sm text-on-surface-variant">Allow new user signups</p>
                  </div>
                  <Button variant="outlined" size="sm">
                    On
                  </Button>
                </div>
              </div>
              <Button variant="text" fullWidth className="mt-4">
                View All Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
