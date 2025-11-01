import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KpiGrid,
  KpiCard,
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  AsyncStateEmpty,
  Fab,
} from '@/components/ui';
import { Shield, Users, Server, Activity, Plus, ArrowLeft, Brain, Workflow as WorkflowIcon } from 'lucide-react';
import AdminDashboard from '../../../src/components/ui/admin/AdminDashboard';
import { NeuralNetworkDashboardPage } from './NeuralNetworkDashboardPage';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleOpenWorkflows = () => {
    navigate('/workflows');
  };

  const overviewMetrics = [
    {
      label: 'Active administrators',
      value: '12',
      delta: 'Across global teams',
      tone: 'primary' as const,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Live services',
      value: '48',
      delta: 'Monitoring real time',
      tone: 'success' as const,
      icon: <Server className="h-4 w-4" />,
    },
    {
      label: 'Open incidents',
      value: '3',
      delta: 'Requires attention',
      tone: 'warning' as const,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: 'Automation jobs',
      value: '26',
      delta: 'Last 24 hours',
      tone: 'neutral' as const,
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  return (
    <div className="relative space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface">Administration console</h1>
          <p className="md3-body-medium text-on-surface-variant">
            Monitor system health, manage users, and review automation workflows.
          </p>
        </div>
        <Fab icon={<ArrowLeft className="h-5 w-5" />} aria-label="Back to dashboard" onClick={handleBack} />
      </header>

      <KpiGrid columns={4}>
        {overviewMetrics.map((metric) => (
          <KpiCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            tone={metric.tone}
            icon={metric.icon}
          />
        ))}
      </KpiGrid>

      <WorkflowPanel
        title="Administration overview"
        description="High-level summary of user management, services, and security posture."
      >
        <WorkflowPanelSection>
          <AsyncStateEmpty
            title="Drill into the admin console below"
            description="Use the enhanced administration interface to perform advanced management tasks."
            icon={<Shield className="h-10 w-10" />}
            compact
          />
        </WorkflowPanelSection>
        <WorkflowPanelFooter>
          <span className="md3-label-medium text-on-surface-variant">
            The detailed administration console remains available for granular controls.
          </span>
        </WorkflowPanelFooter>
      </WorkflowPanel>

      <WorkflowPanel
        title="Advanced administration"
        description="Leverages the legacy admin console for deep system workflows while migration is in progress."
      >
        <WorkflowPanelSection>
          <div className="rounded-3xl border border-outline bg-surface-container-high p-4">
            <AdminDashboard onBack={handleBack} />
          </div>
        </WorkflowPanelSection>
        <WorkflowPanelFooter>
          <span className="md3-label-medium text-on-surface-variant">
            Use this console to configure automation, user management, and system services.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Fab
              extended
              icon={<WorkflowIcon className="h-5 w-5" />}
              aria-label="Open workflows"
              onClick={handleOpenWorkflows}
            >
              Manage workflows
            </Fab>
            <Fab extended icon={<Plus className="h-5 w-5" />} aria-label="Create admin workflow">
              New admin workflow
            </Fab>
          </div>
        </WorkflowPanelFooter>
      </WorkflowPanel>

      <WorkflowPanel
        title="Neural workflow orchestration"
        description="Manage neural training workflows, attribute prompts, and queue mining jobs from the admin cockpit."
      >
        <WorkflowPanelSection>
          <div className="rounded-3xl border border-outline bg-surface-container-high p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Brain className="h-4 w-4" />
              </span>
              <div>
                <h3 className="md3-title-medium text-on-surface">Neural network dashboard</h3>
                <p className="md3-body-small text-on-surface-variant">
                  Review crawler-derived training attributes, edit enrichment prompts, and enqueue mining + training jobs.
                </p>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-3xl border border-outline/40 bg-surface p-4">
              <NeuralNetworkDashboardPage />
            </div>
          </div>
        </WorkflowPanelSection>
        <WorkflowPanelFooter>
          <div className="flex flex-wrap items-center gap-3">
            <span className="md3-label-medium text-on-surface-variant">
              Attribute prompts saved here feed directly into the mining queue for prompt-enriched datasets.
            </span>
            <Fab
              extended
              icon={<WorkflowIcon className="h-5 w-5" />}
              aria-label="Open workflows"
              onClick={handleOpenWorkflows}
            >
              Open workflows
            </Fab>
          </div>
        </WorkflowPanelFooter>
      </WorkflowPanel>
    </div>
  );
};
