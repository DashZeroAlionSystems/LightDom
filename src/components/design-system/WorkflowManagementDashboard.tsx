import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Globe,
  TrendingUp,
  Search,
  Link,
  FileText,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';

interface WorkflowProcess {
  id: string;
  name: string;
  process_type: string;
  description: string;
  is_active: boolean;
  task_count: number;
  instance_count: number;
  tags: string[];
}

interface WorkflowInstance {
  id: string;
  name: string;
  status: string;
  process_name: string;
  process_type: string;
  started_at: string;
  completed_at?: string;
  execution_time_ms?: number;
  progress_percentage: number;
}

interface Schedule {
  id: string;
  name: string;
  frequency: string;
  is_active: boolean;
  next_execution_at: string;
  process_name: string;
  execution_count: number;
}

const PROCESS_ICONS: Record<string, React.ReactNode> = {
  crawling: <Globe className="h-5 w-5" />,
  scraping: <Search className="h-5 w-5" />,
  seo_optimization: <TrendingUp className="h-5 w-5" />,
  url_seeding: <Link className="h-5 w-5" />,
  content_generation: <FileText className="h-5 w-5" />,
  data_mining: <Database className="h-5 w-5" />,
  scheduling: <Calendar className="h-5 w-5" />,
};

const STATUS_COLORS: Record<string, { badge: string; icon: React.ReactNode }> = {
  completed: { badge: 'success', icon: <CheckCircle2 className="h-4 w-4" /> },
  running: { badge: 'primary', icon: <Clock className="h-4 w-4 animate-spin" /> },
  failed: { badge: 'error', icon: <XCircle className="h-4 w-4" /> },
  pending: { badge: 'secondary', icon: <Clock className="h-4 w-4" /> },
  cancelled: { badge: 'outline', icon: <AlertCircle className="h-4 w-4" /> },
};

export const WorkflowManagementDashboard: React.FC = () => {
  const [processes, setProcesses] = useState<WorkflowProcess[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'processes' | 'instances' | 'schedules' | 'analytics'>('processes');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [processesRes, instancesRes, schedulesRes, analyticsRes] = await Promise.all([
        fetch('/api/workflow-processes'),
        fetch('/api/workflow-processes/instances/list?limit=10'),
        fetch('/api/workflow-processes/schedules?is_active=true&limit=10'),
        fetch('/api/workflow-processes/analytics'),
      ]);

      const [processesData, instancesData, schedulesData, analyticsData] = await Promise.all([
        processesRes.json(),
        instancesRes.json(),
        schedulesRes.json(),
        analyticsRes.json(),
      ]);

      setProcesses(processesData.processes || []);
      setInstances(instancesData.instances || []);
      setSchedules(schedulesData.schedules || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeProcess = async (processId: string) => {
    try {
      const response = await fetch(`/api/workflow-processes/${processId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_data: {},
          config: {},
        }),
      });

      if (response.ok) {
        alert('Process execution initiated!');
        loadData();
      }
    } catch (error) {
      console.error('Error executing process:', error);
      alert('Failed to execute process');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-on-surface-variant">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Workflow Management</h1>
            <p className="mt-1 text-on-surface-variant">
              Monitor and manage all workflow processes, executions, and schedules
            </p>
          </div>
          <Button variant="filled" leftIcon={<Plus />}>
            Create Workflow
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card variant="elevated" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Total Processes</p>
                <p className="text-2xl font-bold text-on-surface">{processes.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Running Instances</p>
                <p className="text-2xl font-bold text-on-surface">
                  {instances.filter((i) => i.status === 'running').length}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Play className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Active Schedules</p>
                <p className="text-2xl font-bold text-on-surface">
                  {schedules.filter((s) => s.is_active).length}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Success Rate</p>
                <p className="text-2xl font-bold text-on-surface">
                  {analytics?.taskSummary?.completed_tasks
                    ? Math.round(
                        (analytics.taskSummary.completed_tasks /
                          analytics.taskSummary.total_tasks) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex border-b border-outline">
            {(['processes', 'instances', 'schedules', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Processes Tab */}
            {activeTab === 'processes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-on-surface">Workflow Processes</h3>
                  <Button variant="outlined" size="sm" onClick={loadData} leftIcon={<RotateCcw />}>
                    Refresh
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {processes.map((process) => (
                    <Card key={process.id} variant="outlined" className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            {PROCESS_ICONS[process.process_type] || <Settings className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-on-surface">{process.name}</h4>
                            <p className="text-xs text-on-surface-variant">{process.process_type}</p>
                          </div>
                        </div>
                        <Badge variant={process.is_active ? 'success' : 'outline'}>
                          {process.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <p className="mb-4 text-sm text-on-surface-variant">{process.description}</p>

                      <div className="mb-4 flex items-center gap-4 text-xs text-on-surface-variant">
                        <span>{process.task_count} tasks</span>
                        <span>•</span>
                        <span>{process.instance_count} runs</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="filled"
                          size="sm"
                          fullWidth
                          onClick={() => executeProcess(process.id)}
                          leftIcon={<Play />}
                          disabled={!process.is_active}
                        >
                          Execute
                        </Button>
                        <Button variant="outlined" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Instances Tab */}
            {activeTab === 'instances' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-on-surface">Recent Executions</h3>
                  <Button variant="outlined" size="sm" onClick={loadData} leftIcon={<RotateCcw />}>
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2">
                  {instances.map((instance) => {
                    const statusInfo = STATUS_COLORS[instance.status] || STATUS_COLORS.pending;
                    return (
                      <Card key={instance.id} variant="outlined" className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-1 items-center gap-4">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                              {PROCESS_ICONS[instance.process_type] || <Settings className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-on-surface">{instance.name}</h4>
                              <p className="text-sm text-on-surface-variant">{instance.process_name}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={statusInfo.badge as any} className="flex items-center gap-1">
                                {statusInfo.icon}
                                {instance.status}
                              </Badge>
                              {instance.execution_time_ms && (
                                <p className="mt-1 text-xs text-on-surface-variant">
                                  {(instance.execution_time_ms / 1000).toFixed(2)}s
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {instance.status === 'running' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-on-surface-variant">
                              <span>Progress</span>
                              <span>{instance.progress_percentage}%</span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${instance.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schedules Tab */}
            {activeStep === 'schedules' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-on-surface">Scheduled Workflows</h3>
                  <Button variant="outlined" size="sm" onClick={loadData} leftIcon={<RotateCcw />}>
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} variant="outlined" className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-semibold text-on-surface">{schedule.name}</h4>
                              <p className="text-sm text-on-surface-variant">{schedule.process_name}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="primary">{schedule.frequency}</Badge>
                          <p className="mt-1 text-xs text-on-surface-variant">
                            Next: {new Date(schedule.next_execution_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            Runs: {schedule.execution_count}
                          </p>
                        </div>

                        <div className="ml-4 flex gap-2">
                          <Button variant="outlined" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="outlined" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-on-surface">Workflow Analytics</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card variant="outlined" className="p-4">
                    <h4 className="mb-4 font-semibold text-on-surface">Processes by Type</h4>
                    <div className="space-y-3">
                      {analytics.processesByType?.map((stat: any) => (
                        <div key={stat.process_type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {PROCESS_ICONS[stat.process_type]}
                            <span className="text-sm text-on-surface">{stat.process_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">{stat.active_processes}</Badge>
                            <span className="text-xs text-on-surface-variant">
                              / {stat.total_processes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card variant="outlined" className="p-4">
                    <h4 className="mb-4 font-semibold text-on-surface">Execution Status</h4>
                    <div className="space-y-3">
                      {analytics.instancesByStatus?.map((stat: any) => {
                        const statusInfo = STATUS_COLORS[stat.status] || STATUS_COLORS.pending;
                        return (
                          <div key={stat.status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {statusInfo.icon}
                              <span className="text-sm text-on-surface">{stat.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusInfo.badge as any}>{stat.count}</Badge>
                              {stat.avg_execution_time && (
                                <span className="text-xs text-on-surface-variant">
                                  avg: {(stat.avg_execution_time / 1000).toFixed(2)}s
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card variant="outlined" className="p-4 md:col-span-2">
                    <h4 className="mb-4 font-semibold text-on-surface">Task Summary</h4>
                    {analytics.taskSummary && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-on-surface">
                            {analytics.taskSummary.total_tasks}
                          </p>
                          <p className="text-sm text-on-surface-variant">Total Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-success">
                            {analytics.taskSummary.completed_tasks}
                          </p>
                          <p className="text-sm text-on-surface-variant">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-error">
                            {analytics.taskSummary.failed_tasks}
                          </p>
                          <p className="text-sm text-on-surface-variant">Failed</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowManagementDashboard;
