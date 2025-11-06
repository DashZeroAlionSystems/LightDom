import React, { useState } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import WorkflowWizardModal from '@/components/composites/WorkflowWizardModal';
import {
  Shield,
  Users,
  Server,
  Activity,
  Plus,
  ArrowLeft,
  Workflow as WorkflowIcon,
  AlertTriangle,
} from 'lucide-react';
import AdminConsoleWorkspace from '@/components/admin/AdminConsoleWorkspace';

const FallbackCard: React.FC<FallbackProps & { title: string }> = ({ title, error, resetErrorBoundary }) => (
  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
    <div className="flex items-center gap-2 text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <span className="font-medium">{title}</span>
    </div>
    <p className="mt-2 text-sm text-destructive/80">
      {error?.message || 'We were unable to load this surface. Try again shortly.'}
    </p>
    <Button className="mt-4" variant="filled" onClick={resetErrorBoundary}>
      Retry
    </Button>
  </div>
);

const quickStats = [
  {
    label: 'Active administrators',
    value: '12',
    context: 'Global coverage',
    icon: <Users className="h-5 w-5 text-primary" />,
  },
  {
    label: 'Critical services',
    value: '48',
    context: 'Monitored in real time',
    icon: <Server className="h-5 w-5 text-blue-400" />,
  },
  {
    label: 'Open incidents',
    value: '3',
    context: 'Requires follow-up',
    icon: <Shield className="h-5 w-5 text-amber-400" />,
  },
  {
    label: 'Automation jobs (24h)',
    value: '26',
    context: 'Crawler + enrichment',
    icon: <Activity className="h-5 w-5 text-emerald-400" />,
  },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isWizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="space-y-5 overflow-x-hidden p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            <Shield className="h-4 w-4" /> Admin console
          </span>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Enterprise administration</h1>
          <p className="text-sm text-muted-foreground">
            Monitor services, orchestrate workflows, and supervise neural operations from a single control plane.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="text" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/dashboard')}>
            Overview
          </Button>
          <Button variant="outlined" leftIcon={<WorkflowIcon className="h-4 w-4" />} onClick={() => navigate('/workflows')}>
            Workflows
          </Button>
          <Button variant="filled" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setWizardOpen(true)}>
            Launch workflow wizard
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.context}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Automation workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage crawler orchestration, schema links, and workflow prompts with the embedded console.
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-primary">Live view</span>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80">
          <ErrorBoundary FallbackComponent={(props) => <FallbackCard title="Admin console" {...props} />}>
            <AdminConsoleWorkspace />
          </ErrorBoundary>
        </div>
      </section>

      <WorkflowWizardModal isOpen={isWizardOpen} onClose={() => setWizardOpen(false)} initialStep="ideation" />
    </div>
  );
};
