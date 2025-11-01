/**
 * Client Dashboard Overview - Material Design 3
 * Following research guidelines from docs/research/
 */

import DashboardShell from '../DashboardShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FolderKanban,
  Pickaxe,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientDashboard() {
  const stats = [
    { title: 'Active Projects', value: '8', icon: FolderKanban, color: 'primary' },
    { title: 'DOM Space Mined', value: '2.4 TB', icon: Pickaxe, color: 'secondary' },
    { title: 'Wallet Balance', value: '$1,234', icon: Wallet, color: 'success' },
    { title: 'Performance', value: '+18%', icon: TrendingUp, color: 'warning' },
  ];

  const projects = [
    { name: 'Website Redesign', status: 'in-progress', progress: 65, dueDate: '2 days' },
    { name: 'Mobile App', status: 'in-progress', progress: 40, dueDate: '5 days' },
    { name: 'API Integration', status: 'pending', progress: 0, dueDate: '1 week' },
    { name: 'Database Migration', status: 'completed', progress: 100, dueDate: 'Completed' },
  ];

  const miningActivity = [
    { domain: 'example.com', space: '450 MB', time: '2 hours ago', status: 'success' },
    { domain: 'mysite.io', space: '320 MB', time: '5 hours ago', status: 'success' },
    { domain: 'demo.app', space: '180 MB', time: '1 day ago', status: 'success' },
  ];

  return (
    <DashboardShell mode="client">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg font-bold">Welcome Back!</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Here's your dashboard overview and recent activity.
            </p>
          </div>
          <Button variant="filled" leftIcon={<Play className="h-4 w-4" />}>
            Start Mining
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} variant="elevated" className="hover:shadow-level-3 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm text-on-surface-variant mb-1">{stat.title}</p>
                      <h3 className="text-headline-sm font-semibold">{stat.value}</h3>
                    </div>
                    <div className={cn(
                      'h-12 w-12 rounded-full flex items-center justify-center',
                      stat.color === 'primary' && 'bg-primary/10',
                      stat.color === 'secondary' && 'bg-secondary/10',
                      stat.color === 'success' && 'bg-success/10',
                      stat.color === 'warning' && 'bg-warning/10'
                    )}>
                      <Icon className={cn(
                        'h-6 w-6',
                        stat.color === 'primary' && 'text-primary',
                        stat.color === 'secondary' && 'text-secondary',
                        stat.color === 'success' && 'text-success',
                        stat.color === 'warning' && 'text-warning'
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Projects */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Track your ongoing work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {project.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : project.status === 'in-progress' ? (
                          <Clock className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-on-surface-variant" />
                        )}
                        <span className="text-label-lg font-medium">{project.name}</span>
                      </div>
                      <span className="text-label-sm text-on-surface-variant">{project.dueDate}</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          project.status === 'completed' ? 'bg-success' : 'bg-primary'
                        )}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outlined" fullWidth>
                View All Projects
              </Button>
            </CardFooter>
          </Card>

          {/* Mining Activity */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Recent Mining Activity</CardTitle>
              <CardDescription>Your latest DOM space harvests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {miningActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Pickaxe className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-label-lg font-medium">{activity.domain}</p>
                        <p className="text-label-sm text-on-surface-variant">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-label-md font-semibold text-secondary">{activity.space}</p>
                      <Badge variant="success" className="text-xs">
                        Success
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outlined" fullWidth>
                View Mining History
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="filled-tonal" fullWidth leftIcon={<FolderKanban className="h-4 w-4" />}>
                New Project
              </Button>
              <Button variant="filled-tonal" fullWidth leftIcon={<Pickaxe className="h-4 w-4" />}>
                Start Mining
              </Button>
              <Button variant="filled-tonal" fullWidth leftIcon={<Wallet className="h-4 w-4" />}>
                Add Funds
              </Button>
              <Button variant="filled-tonal" fullWidth leftIcon={<TrendingUp className="h-4 w-4" />}>
                View Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
